<?php

namespace humhub\modules\modernTheme\widgets;

use humhub\modules\content\permissions\CreatePost;
use humhub\modules\modernTheme\controllers\ConfigController;
use humhub\modules\space\models\Membership;
use humhub\modules\space\models\Space;
use Yii;
use yii\base\Widget;
use yii\helpers\Url;

/**
 * Dashboard composer card.
 *
 * Picks a space the current user may post to and links to that space's stream,
 * where HumHub renders its own post form. The inline form is not embedded here:
 * a second copy of the wall form submitted unreliably (lost requests, restored
 * drafts), while the space stream form is reliable.
 * Renders an empty state when no suitable space exists.
 */
class DashboardComposer extends Widget
{
    public function run()
    {
        if (Yii::$app->user->isGuest) {
            return '';
        }

        try {
            $space = $this->resolveComposerSpace();
        } catch (\Throwable $e) {
            Yii::error('DashboardComposer: failed to resolve space: ' . $e->getMessage(), 'modern-theme');
            return '';
        }

        if ($space === null) {
            return $this->render('dashboardComposerEmpty', [
                'spacesUrl' => Url::to(['/space/spaces']),
            ]);
        }

        return $this->render('dashboardComposer', [
            'composerUrl' => $this->getComposerUrl($space),
            'avatarUrl' => $this->getAvatarUrl(),
        ]);
    }

    private function resolveComposerSpace(): ?Space
    {
        $userId = (int)Yii::$app->user->id;
        $configuredId = ConfigController::getDashboardComposerSpaceId();
        $candidates = [];

        if ($configuredId > 0) {
            $configured = Space::findOne(['id' => $configuredId, 'status' => Space::STATUS_ENABLED]);
            if ($configured) {
                $candidates[] = $configured;
            }
        }

        foreach ($this->getMemberSpaceIds($userId) as $spaceId) {
            if ($spaceId === $configuredId) {
                continue;
            }
            $space = Space::findOne(['id' => $spaceId, 'status' => Space::STATUS_ENABLED]);
            if ($space) {
                $candidates[] = $space;
            }
        }

        foreach ($candidates as $space) {
            if ($this->isMember($space, $userId) && $this->isPostEnabled($space) && $this->canPost($space)) {
                return $space;
            }
        }

        return null;
    }

    /**
     * Space stream URL with the flag that tells composerFocus.js to open the
     * form. HumHub only renders the form when the user may post there.
     */
    private function getComposerUrl(Space $space): string
    {
        $url = $space->getUrl();

        if (!is_array($url)) {
            return $url . (strpos($url, '?') === false ? '?' : '&') . 'compose=1';
        }

        return Url::to(array_merge($url, ['compose' => 1]));
    }

    /**
     * Member spaces, most recently visited first.
     *
     * @return int[]
     */
    private function getMemberSpaceIds(int $userId): array
    {
        $spaceTable = Space::tableName();
        $membershipTable = Membership::tableName();

        return Space::find()
            ->select($spaceTable . '.id')
            ->innerJoin($membershipTable, $membershipTable . '.space_id = ' . $spaceTable . '.id')
            ->where([$membershipTable . '.user_id' => $userId])
            ->andWhere([$membershipTable . '.status' => Membership::STATUS_MEMBER])
            ->andWhere([$spaceTable . '.status' => Space::STATUS_ENABLED])
            ->orderBy([$membershipTable . '.last_visit' => SORT_DESC])
            ->column();
    }

    private function isMember(Space $space, int $userId): bool
    {
        if (method_exists($space, 'isMember')) {
            return (bool)$space->isMember($userId);
        }

        return $space->getMembership($userId) !== null;
    }

    private function isPostEnabled(Space $space): bool
    {
        try {
            if (method_exists($space, 'isModuleEnabled')) {
                return (bool)$space->isModuleEnabled('post');
            }

            return (bool)$space->moduleManager->isEnabled('post');
        } catch (\Throwable $e) {
            // Fall through to the permission check below.
            return true;
        }
    }

    /**
     * Membership does not imply the create-post permission. Without this the
     * card could link to a stream that has no composer.
     */
    private function canPost(Space $space): bool
    {
        if (!class_exists(CreatePost::class)) {
            return true; // shortcut: unknown permission API, let the target page decide
        }

        try {
            return (bool)$space->getPermissionManager()->can(new CreatePost());
        } catch (\Throwable $e) {
            return true;
        }
    }

    private function getAvatarUrl(): string
    {
        $user = Yii::$app->user->identity;

        try {
            if (method_exists($user, 'getImage')) {
                return $user->getImage()->getUrl(['width' => 80, 'height' => 80]);
            }

            return $user->getProfileImage()->getUrl();
        } catch (\Throwable $e) {
            return '';
        }
    }
}

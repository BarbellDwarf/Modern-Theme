<?php

namespace humhub\modules\modernTheme2026\widgets;

use humhub\modules\modernTheme2026\controllers\ConfigController;
use humhub\modules\space\models\Membership;
use humhub\modules\space\models\Space;
use Yii;
use yii\base\Widget;
use yii\helpers\Url;

/**
 * Dashboard composer card.
 *
 * Picks a space the current user may post to, then renders HumHub's own post
 * form so validation, files and permissions behave exactly like a space post.
 * Renders an empty state when no suitable space exists.
 */
class DashboardComposer extends Widget
{
    private const POST_FORM_CLASS = 'humhub\modules\post\widgets\Form';

    public function run()
    {
        if (Yii::$app->user->isGuest || !class_exists(self::POST_FORM_CLASS)) {
            return '';
        }

        try {
            $result = $this->resolveComposerSpace();
        } catch (\Throwable $e) {
            Yii::error('DashboardComposer: failed to resolve space: ' . $e->getMessage(), 'modern-theme-2026');
            return '';
        }

        if ($result === null) {
            return $this->render('dashboardComposerEmpty', [
                'spacesUrl' => Url::to(['/space/spaces']),
            ]);
        }

        return $this->render('dashboardComposer', [
            'space' => $result['space'],
            'formHtml' => $result['formHtml'],
            'avatarUrl' => $this->getAvatarUrl(),
        ]);
    }

    /**
     * @return array{space: Space, formHtml: string}|null
     */
    private function resolveComposerSpace(): ?array
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
            if (!$this->isMember($space, $userId) || !$this->isPostEnabled($space)) {
                continue;
            }

            $formHtml = call_user_func([self::POST_FORM_CLASS, 'widget'], ['contentContainer' => $space]);
            if (trim($formHtml) !== '') {
                return ['space' => $space, 'formHtml' => $formHtml];
            }
        }

        return null;
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
            // Fall through to the post form's own permission check.
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

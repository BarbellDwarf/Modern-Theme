<?php

namespace humhub\modules\modernTheme\controllers;

use humhub\components\behaviors\AccessControl;
use humhub\components\Controller;
use humhub\modules\content\components\ContentAddonActiveRecord;
use humhub\modules\content\interfaces\ContentProvider;
use humhub\modules\like\models\Like;
use humhub\modules\user\models\User;
use Yii;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

/**
 * ReactionsController
 *
 * Handles emoji reaction save/toggle for content items.
 * Requires the `reaction_type` column (added by module migration) on the `like` table.
 *
 * Supports both target addressing schemes:
 * - HumHub 1.18: contentModel/contentId (object_model/object_id columns)
 * - HumHub 1.19: recordId (content_id/content_addon_record_id columns + RecordMap)
 */
class ReactionsController extends Controller
{
    /** Allowed reaction types */
    private const VALID_TYPES = ['like', 'love', 'laugh', 'wow', 'sad', 'pray'];

    private const RECORD_MAP = 'humhub\models\RecordMap';

    private ContentProvider $target;

    /** Column/value pairs identifying the like row for this target. */
    private array $scope = [];

    /** Whether the like table uses the 1.19 RecordMap columns. */
    private bool $recordMapMode = false;

    public function behaviors(): array
    {
        return [
            'acl' => [
                'class' => AccessControl::class,
            ],
        ];
    }

    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        $this->resolveTarget();

        return true;
    }

    /**
     * GET /modern-theme/reactions/my-reaction
     *
     * Returns the current user's reaction type for a given content item.
     * Used by JS on page load to restore the active trigger emoji.
     */
    public function actionMyReaction(): array
    {
        Yii::$app->response->format = 'json';

        $existing = Like::find()
            ->where($this->scope)
            ->andWhere(['created_by' => Yii::$app->user->id])
            ->one();

        return [
            'reactionType' => $existing ? ($existing->reaction_type ?? 'like') : null,
            'reactionCounts' => $this->getReactionCounts(),
        ];
    }

    /**
     * GET /modern-theme/reactions/list
     *
     * Renders a modal listing all users who reacted, with their actual emoji.
     */
    public function actionList(): string
    {
        /** Reaction type → emoji map (must match reactionPicker.js REACTIONS array) */
        $emojiMap = [
            'like' => '👍',
            'love' => '❤️',
            'laugh' => '😂',
            'wow' => '😮',
            'sad' => '😢',
            'pray' => '🙏',
        ];

        $rows = (new \yii\db\Query())
            ->select(['created_by AS user_id', 'reaction_type', 'created_at'])
            ->from('{{%like}}')
            ->where($this->scope)
            ->orderBy(['created_at' => SORT_DESC])
            ->all();

        // Batch-load all users in a single query to avoid N+1
        $userIds = array_column($rows, 'user_id');
        $usersById = !empty($userIds)
            ? User::find()->where(['id' => $userIds])->indexBy('id')->all()
            : [];

        $reactions = [];
        foreach ($rows as $row) {
            $user = $usersById[$row['user_id']] ?? null;
            if ($user !== null) {
                $reactions[] = [
                    'user' => $user,
                    'reaction_type' => $row['reaction_type'] ?? 'like',
                ];
            }
        }

        return $this->renderAjaxContent($this->renderPartial(
            'list',
            ['reactions' => $reactions, 'emojiMap' => $emojiMap]
        ));
    }

    /**
     * POST /modern-theme/reactions/react
     *
     * Toggle behavior:
     *   - Same reaction already set  → remove it (unlike)
     *   - Different reaction already set → switch reaction type
     *   - No reaction yet             → create reaction
     *
     * Returns JSON: { reactionCounts: {type: count}, currentUserReaction: string|null }
     */
    public function actionReact(): array
    {
        $this->forcePostRequest();
        Yii::$app->response->format = 'json';

        if (!$this->canReact()) {
            throw new ForbiddenHttpException('You are not allowed to react to this content.');
        }

        $reactionType = Yii::$app->request->post('reaction_type', 'like');
        if (!in_array($reactionType, self::VALID_TYPES, true)) {
            $reactionType = 'like';
        }

        $userId = Yii::$app->user->id;

        // Find any existing like/reaction by this user for this content
        $existing = Like::find()
            ->where($this->scope)
            ->andWhere(['created_by' => $userId])
            ->one();

        $currentUserReaction = null;

        if ($existing !== null) {
            if ($existing->reaction_type === $reactionType) {
                // Same reaction → toggle off (delete)
                if ($existing->delete() === false) {
                    Yii::error('ReactionsController: failed to delete reaction for content ' . $this->identity(), 'modernTheme');
                    return ['error' => 'Failed to remove reaction.'];
                }
            } else {
                // Different reaction → switch
                $existing->reaction_type = $reactionType;
                if (!$existing->save(false)) {
                    Yii::error('ReactionsController: failed to update reaction for content ' . $this->identity(), 'modernTheme');
                    return ['error' => 'Failed to update reaction.'];
                }
                $currentUserReaction = $reactionType;
            }
        } else {
            // No reaction yet → create
            $like = new Like();
            foreach ($this->scope as $column => $value) {
                if ($value !== null) {
                    $like->$column = $value;
                }
            }
            $like->reaction_type = $reactionType;
            if (!$like->save(false)) {
                Yii::error('ReactionsController: failed to save reaction for content ' . $this->identity(), 'modernTheme');
                return ['error' => 'Failed to save reaction.'];
            }
            $currentUserReaction = $reactionType;
        }

        return [
            'currentUserReaction' => $currentUserReaction,
            'reactionCounts' => $this->getReactionCounts(),
        ];
    }

    /**
     * Resolves the reaction target from either 1.19 (recordId) or 1.18 (contentModel/contentId)
     * parameters and builds the like-table scope for it.
     */
    private function resolveTarget(): void
    {
        $schema = Like::getDb()->getTableSchema(Like::tableName());
        $this->recordMapMode = $schema !== null && $schema->getColumn('content_addon_record_id') !== null;

        // 1.19 JS posts recordId in the body; GET is used by the state endpoints.
        $recordId = (int)(Yii::$app->request->get('recordId') ?: Yii::$app->request->post('recordId'));
        $target = null;

        if ($recordId > 0 && $this->recordMapMode) {
            $mapClass = self::RECORD_MAP;
            $target = $mapClass::getById($recordId, ContentProvider::class);
        } else {
            $modelClass = Yii::$app->request->get('contentModel') ?: Yii::$app->request->post('contentModel');
            $pk = (int)(Yii::$app->request->get('contentId') ?: Yii::$app->request->post('contentId'));

            if (!is_string($modelClass) || $modelClass === '' || $pk === 0) {
                throw new BadRequestHttpException('Model & ID parameter required!');
            }

            if (!class_exists($modelClass) || !is_subclass_of($modelClass, ContentProvider::class)) {
                throw new BadRequestHttpException('Invalid content model.');
            }

            $target = $modelClass::findOne(['id' => $pk]);
        }

        if (!$target instanceof ContentProvider) {
            throw new NotFoundHttpException('Could not find underlying content record.');
        }

        if ($target->content === null || !$target->content->canView()) {
            throw new ForbiddenHttpException('Access denied!');
        }

        $this->target = $target;

        if ($this->recordMapMode) {
            $this->scope = ['content_id' => $target->content->id];

            if ($target instanceof ContentAddonActiveRecord) {
                $mapClass = self::RECORD_MAP;
                $this->scope['content_addon_record_id'] = $mapClass::getId($target);
            } else {
                $this->scope['content_addon_record_id'] = null;
            }
        } else {
            // Matches what ContentAddonController stored on 1.18.
            $objectModel = class_exists('humhub\components\behaviors\PolymorphicRelation')
                ? \humhub\components\behaviors\PolymorphicRelation::getObjectModel($target)
                : get_class($target);

            $this->scope = [
                'object_model' => $objectModel,
                'object_id' => $target->id,
            ];
        }
    }

    private function canReact(): bool
    {
        /** @var \humhub\modules\like\Module|null $likeModule */
        $likeModule = Yii::$app->getModule('like');
        if (!$likeModule || !$likeModule->isEnabled) {
            return false;
        }

        if (class_exists('humhub\modules\like\services\LikeService')) {
            return (new \humhub\modules\like\services\LikeService($this->target))->canLike();
        }

        return $likeModule->canLike($this->target);
    }

    /**
     * Returns reaction counts grouped by type for the current target.
     */
    private function getReactionCounts(): array
    {
        $rows = Like::find()
            ->select(['reaction_type', 'COUNT(*) as cnt'])
            ->where($this->scope)
            ->groupBy('reaction_type')
            ->asArray()
            ->all();

        $counts = [];
        foreach ($rows as $row) {
            $counts[$row['reaction_type'] ?? 'like'] = (int)$row['cnt'];
        }

        return $counts;
    }

    private function identity(): string
    {
        return (string)$this->target->content->id;
    }
}

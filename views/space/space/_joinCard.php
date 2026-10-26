<?php

use humhub\helpers\Html;
use humhub\modules\space\models\Space;
use yii\helpers\Url;

/**
 * @var \humhub\components\View $this
 * @var Space $space
 */

$isMember = !Yii::$app->user->isGuest && $space->isMember();
$requiresApproval = (int)$space->join_policy === Space::JOIN_POLICY_APPLICATION;
$canJoin = !Yii::$app->user->isGuest && !$isMember && $space->canJoin();
$canRequestMembership = !Yii::$app->user->isGuest && !$isMember && $requiresApproval;
$spaceName = Html::encode($space->getDisplayName());
?>
<div class="mt2026-join-card" data-mt2026-join-card>
    <h3 class="mt2026-join-card__title">
        <?= $requiresApproval
            ? Yii::t('ModernTheme2026.base', 'Request to join {space}', ['{space}' => $spaceName])
            : Yii::t('ModernTheme2026.base', 'Join {space} to see posts', ['{space}' => $spaceName]) ?>
    </h3>
    <p class="mt2026-join-card__text">
        <?= $requiresApproval
            ? Yii::t('ModernTheme2026.base', 'Request membership to post and comment in this space.')
            : Yii::t('ModernTheme2026.base', 'Become a member to post and comment in this space.') ?>
    </p>
    <div class="mt2026-join-card__actions">
        <?php if ($canJoin || $canRequestMembership): ?>
            <?php if ($requiresApproval): ?>
                <?= Html::a(
                    Yii::t('ModernTheme2026.base', 'Request to join'),
                    $space->createUrl('/space/membership/request-membership-form'),
                    [
                        'class' => 'btn btn-accent mt2026-space-join-btn',
                        'data-bs-target' => '#globalModal',
                        'data-space-request-membership' => $space->id,
                    ]
                ) ?>
            <?php else: ?>
                <?= Html::a(
                    Yii::t('ModernTheme2026.base', 'Join {space}', ['{space}' => $spaceName]),
                    $space->createUrl('/space/membership/request-membership'),
                    [
                        'class' => 'btn btn-accent mt2026-space-join-btn',
                        'data-method' => 'post',
                        'data-space-request-membership' => $space->id,
                    ]
                ) ?>
            <?php endif; ?>
        <?php endif; ?>
        <?= Html::a(
            Yii::t('ModernTheme2026.base', 'Browse other spaces'),
            Url::to(['/space/spaces']),
            ['class' => 'btn btn-link mt2026-join-card__browse']
        ) ?>
    </div>
</div>

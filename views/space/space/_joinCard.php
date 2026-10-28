<?php

use humhub\helpers\Html;
use humhub\modules\space\models\Space;
use yii\helpers\Url;

/**
 * @var \humhub\components\View $this
 * @var Space $space
 */

$isMember = !Yii::$app->user->isGuest && $space->isMember();
$joinPolicy = (int)$space->join_policy;
$isInviteOnly = $joinPolicy === Space::JOIN_POLICY_NONE;
$requiresApproval = $joinPolicy === Space::JOIN_POLICY_APPLICATION;
$canJoin = !Yii::$app->user->isGuest && !$isMember && $space->canJoin();
$canRequestMembership = !Yii::$app->user->isGuest && !$isMember && $requiresApproval;
$spaceName = Html::encode($space->getDisplayName());

if ($isInviteOnly) {
    $title = Yii::t('ModernTheme.base', 'This space is invite-only');
    $text = Yii::t('ModernTheme.base', 'Ask a space administrator for an invitation.');
} elseif ($requiresApproval) {
    $title = Yii::t('ModernTheme.base', 'Request to join {space}', ['{space}' => $spaceName]);
    $text = Yii::t('ModernTheme.base', 'Request membership to post and comment in this space.');
} else {
    $title = Yii::t('ModernTheme.base', 'Join {space} to see posts', ['{space}' => $spaceName]);
    $text = Yii::t('ModernTheme.base', 'Become a member to post and comment in this space.');
}
?>
<div class="mt2026-join-card" data-mt2026-join-card>
    <h3 class="mt2026-join-card__title"><?= $title ?></h3>
    <p class="mt2026-join-card__text"><?= $text ?></p>
    <div class="mt2026-join-card__actions">
        <?php if ($isInviteOnly): ?>
            <?= Html::a(
                Yii::t('ModernTheme.base', 'View space admins'),
                $space->createUrl('/space/space/about'),
                ['class' => 'btn btn-accent mt2026-space-join-btn']
            ) ?>
        <?php elseif ($canJoin || $canRequestMembership): ?>
            <?php if ($requiresApproval): ?>
                <?= Html::a(
                    Yii::t('ModernTheme.base', 'Request to join'),
                    $space->createUrl('/space/membership/request-membership-form'),
                    [
                        'class' => 'btn btn-accent mt2026-space-join-btn',
                        'data-bs-target' => '#globalModal',
                        'data-space-request-membership' => $space->id,
                    ]
                ) ?>
            <?php else: ?>
                <?= Html::a(
                    Yii::t('ModernTheme.base', 'Join {space}', ['{space}' => $spaceName]),
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
            Yii::t('ModernTheme.base', 'Browse other spaces'),
            Url::to(['/space/spaces']),
            ['class' => 'btn btn-link mt2026-join-card__browse']
        ) ?>
    </div>
</div>

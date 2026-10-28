<?php

/**
 * @var \humhub\components\View $this
 */

use humhub\components\View;
use humhub\modules\activity\widgets\ActivityBox;
use humhub\modules\activity\widgets\ActivityStreamViewer;
use humhub\modules\content\widgets\WallCreateContentFormContainer;
use humhub\modules\space\models\Space;
use humhub\modules\space\Module;
use humhub\modules\space\modules\manage\widgets\PendingApprovals;
use humhub\modules\space\widgets\Members;
use humhub\modules\space\widgets\Sidebar;
use humhub\modules\stream\widgets\StreamViewer;

/* @var $space Space */
/* @var $canCreateEntries bool */
/* @var $isMember bool */
/* @var $isSingleContentRequest bool */

$canJoin = !$isMember && !Yii::$app->user->isGuest && $space->canJoin();
// Approval spaces expose "request membership" instead of a free join. Treat
// that as card-worthy too, so the empty stream is not a dead end.
$canRequestMembership = !$isMember && !Yii::$app->user->isGuest
    && (int)$space->join_policy === Space::JOIN_POLICY_APPLICATION;
// Invite-only spaces cannot be joined from here, but the core "no public
// content" sentence leaves the user without a next step.
$isInviteOnly = !$isMember && !Yii::$app->user->isGuest
    && (int)$space->join_policy === Space::JOIN_POLICY_NONE;
$showJoinCard = $canJoin || $canRequestMembership || $isInviteOnly;

if ($canCreateEntries) {
    $emptyMessage = Yii::t('SpaceModule.base', '<b>This space is still empty!</b><br>Start by posting something here...');
} elseif ($isMember) {
    $emptyMessage = Yii::t('SpaceModule.base', '<b>This space is still empty!</b>');
} elseif ($showJoinCard) {
    $emptyMessage = $this->render('_joinCard', ['space' => $space]);
} else {
    $emptyMessage = Yii::t('SpaceModule.base', '<b>You are not member of this space and there is no public content, yet!</b>');
}

/** @var Module $module */
$module = Yii::$app->getModule('space');
?>

<?php if ($canCreateEntries && !$isSingleContentRequest) : ?>
    <div data-stream-create-content="stream.wall.WallStream">
        <?= WallCreateContentFormContainer::widget(['contentContainer' => $space]); ?>
    </div>
<?php endif; ?>

<?= StreamViewer::widget([
    'contentContainer' => $space,
    'streamAction' => '/space/space/stream',
    'messageStreamEmpty' => $emptyMessage,
    'messageStreamEmptyCss' => $canCreateEntries ? 'placeholder-empty-stream' : '',
]); ?>

<?php if ($showJoinCard): ?>
    <div class="mt2026-join-cta" data-mt2026-join-cta hidden>
        <?= $this->render('_joinCard', ['space' => $space]) ?>
    </div>
<?php endif; ?>

<?php
$this->beginBlock('sidebar');
$widgets = [];

if (!$space->getAdvancedSettings()->hideActivities) {
    // HumHub 1.18 uses ActivityStreamViewer, 1.19 renamed it to ActivityBox.
    $activityWidget = class_exists(ActivityBox::class) ? ActivityBox::class : ActivityStreamViewer::class;
    $widgets[] = [$activityWidget, ['contentContainer' => $space], ['sortOrder' => 10]];
}

$widgets[] = [PendingApprovals::class, ['space' => $space], ['sortOrder' => 20]];

if (!$space->getAdvancedSettings()->hideMembers) {
    $widgets[] = [Members::class, ['space' => $space], ['sortOrder' => 30]];
}
?>
<?= Sidebar::widget(['space' => $space, 'widgets' => $widgets]); ?>
<?php $this->endBlock(); ?>

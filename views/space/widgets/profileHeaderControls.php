<?php
/* @var $this \humhub\components\View */

/* @var $container Space */

use humhub\modules\space\models\Space;
use humhub\modules\space\widgets\FollowButton;
use humhub\modules\space\widgets\HeaderControls;
use humhub\modules\space\widgets\HeaderControlsMenu;
use humhub\modules\space\widgets\HeaderCounterSet;
use humhub\modules\space\widgets\InviteButton;
use humhub\modules\space\widgets\MembershipButton;

$membership = $container->getMembership();
$canJoin = !$membership && !Yii::$app->user->isGuest && $container->canJoin();

$controls = [
    [InviteButton::class, ['space' => $container], ['sortOrder' => 10]],
    [MembershipButton::class, [
        'space' => $container,
        'options' => [
            'becomeMember' => [
                'mode' => 'link',
                'attrs' => ['class' => 'btn btn-accent mt2026-space-join-btn'],
            ],
            'requestMembership' => [
                'attrs' => ['class' => 'btn btn-accent mt2026-space-join-btn'],
            ],
            'acceptInvite' => ['mode' => 'link'],
        ],
    ], ['sortOrder' => 20]],
];

// Follow belongs to the member state. Non-members get Join only.
if (!$canJoin) {
    $controls[] = [FollowButton::class, [
        'space' => $container,
        'followOptions' => [
            'class' => 'btn btn-primary',
            'title' => Yii::t('ModernTheme2026.base', 'Get updates from this space'),
        ],
        'unfollowOptions' => [
            'class' => 'btn btn-primary active',
            'title' => Yii::t('ModernTheme2026.base', 'Stop updates from this space'),
        ],
    ], ['sortOrder' => 30]];
}
?>

<div class="panel-body">
    <div class="panel-profile-controls">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <?= HeaderCounterSet::widget(['space' => $container]); ?>

                    <div class="controls controls-header float-end">
                        <?= HeaderControls::widget(['widgets' => $controls]); ?>
                        <?= HeaderControlsMenu::widget(['space' => $container]); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php

use humhub\components\View;
use humhub\helpers\Html;
use humhub\modules\notification\components\BaseNotification;
use humhub\widgets\bootstrap\LinkPager;
use yii\data\Pagination;

/**
 * @var $this View
 * @var $notifications BaseNotification[]
 * @var $pagination Pagination
 * @var $options array
 */
?>

<?= Html::beginTag('div', $options) ?>
    <div class="hh-list">
        <?php foreach ($notifications as $notification): ?>
            <?php try { ?>
                <?= $notification->render() ?>
            <?php } catch (Throwable $t) {
                Yii::warning($t, 'notification');
            } ?>
        <?php endforeach; ?>
        <?php if (empty($notifications)): ?>
            <div class="mt2026-empty-state" data-mt2026-empty-state="notifications">
                <h3 class="mt2026-empty-state__title">
                    <?= Yii::t('ModernTheme2026.base', "You're all caught up.") ?>
                </h3>
                <p class="mt2026-empty-state__text">
                    <?= Yii::t('ModernTheme2026.base', 'New activity will show up here.') ?>
                </p>
            </div>
        <?php endif; ?>
    </div>
<?php if (!empty($notifications)): ?>
    <div class="pagination-container">
        <?= ($pagination != null) ? LinkPager::widget(['pagination' => $pagination]) : ''; ?>
    </div>
<?php endif; ?>
<?= Html::endTag('div');

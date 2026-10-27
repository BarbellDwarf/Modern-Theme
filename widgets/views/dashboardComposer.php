<?php

/**
 * @var \humhub\components\View $this
 * @var string $composerUrl
 * @var string $avatarUrl
 */

use humhub\helpers\Html;
?>
<div class="mt2026-dashboard-composer">
    <a class="mt2026-dashboard-composer__trigger"
       href="<?= Html::encode($composerUrl) ?>"
       aria-label="<?= Yii::t('ModernTheme2026.base', 'Write a post') ?>">
        <?php if ($avatarUrl !== ''): ?>
            <?= Html::img($avatarUrl, [
                'class' => 'mt2026-dashboard-composer__avatar',
                'alt' => '',
                'width' => 40,
                'height' => 40,
            ]) ?>
        <?php endif; ?>
        <span class="mt2026-dashboard-composer__field">
            <span class="mt2026-dashboard-composer__placeholder">
                <span class="mt2026-dashboard-composer__placeholder-short"><?= Yii::t('ModernTheme2026.base', 'Share something…') ?></span>
                <span class="mt2026-dashboard-composer__placeholder-full"><?= Yii::t('ModernTheme2026.base', 'Share something with the church…') ?></span>
            </span>
        </span>
        <span class="mt2026-dashboard-composer__action" aria-hidden="true">
            <i class="fa fa-pencil"></i>
            <span class="mt2026-dashboard-composer__action-label">
                <?= Yii::t('ModernTheme2026.base', 'Write') ?>
            </span>
        </span>
    </a>
</div>

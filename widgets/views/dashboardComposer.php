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
       href="<?= Html::encode($composerUrl) ?>">
        <?php if ($avatarUrl !== ''): ?>
            <?= Html::img($avatarUrl, [
                'class' => 'mt2026-dashboard-composer__avatar',
                'alt' => '',
                'width' => 40,
                'height' => 40,
            ]) ?>
        <?php endif; ?>
        <span class="mt2026-dashboard-composer__placeholder">
            <?= Yii::t('ModernTheme2026.base', 'Share something with the church…') ?>
        </span>
    </a>
</div>

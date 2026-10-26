<?php

/**
 * @var \humhub\components\View $this
 * @var \humhub\modules\space\models\Space $space
 * @var string $formHtml
 * @var string $avatarUrl
 */

use humhub\helpers\Html;

$bodyId = 'mt2026-dashboard-composer-body-' . (int)$space->id;
?>
<div class="mt2026-dashboard-composer" data-mt2026-dashboard-composer>
    <button type="button"
            class="mt2026-dashboard-composer__trigger"
            data-mt2026-dashboard-composer-trigger
            aria-expanded="false"
            aria-controls="<?= Html::encode($bodyId) ?>">
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
    </button>

    <div id="<?= Html::encode($bodyId) ?>"
         class="mt2026-dashboard-composer__body"
         data-mt2026-dashboard-composer-body
         hidden>
        <div data-stream-create-content="stream.wall.WallStream">
            <?= $formHtml ?>
        </div>
    </div>
</div>

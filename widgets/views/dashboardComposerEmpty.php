<?php

/**
 * @var \humhub\components\View $this
 * @var string $spacesUrl
 */

use humhub\helpers\Html;
?>
<div class="mt2026-dashboard-composer mt2026-dashboard-composer--empty" data-mt2026-dashboard-composer>
    <?= Html::a(
        Yii::t('ModernTheme.base', 'Find a space to post in'),
        $spacesUrl,
        ['class' => 'mt2026-dashboard-composer__empty-link']
    ) ?>
</div>

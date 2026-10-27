<?php
/* @var $this View */
/* @var $content string */

use humhub\assets\AppAsset;
use humhub\components\View;
use humhub\helpers\DeviceDetectorHelper;
use humhub\helpers\Html;
use humhub\modules\modernTheme2026\controllers\ConfigController;
use humhub\modules\modernTheme2026\widgets\ContextSwitcher;
use humhub\modules\user\widgets\AccountTopMenu;
use humhub\widgets\NotificationArea;
use humhub\widgets\SiteLogo;
use humhub\widgets\TopMenu;
use humhub\widgets\TopMenuRightStack;
use yii\helpers\Url;

AppAsset::register($this);

// Theme::register() already serves the compiled resources/css/theme.css. Registering
// dist/theme.css here as well loaded the same stylesheet twice (and could serve a
// stale copy, since ThemeHelper only writes the resources one).

$bodyClasses = DeviceDetectorHelper::getBodyClasses();
$bodyClasses[] = 'modern-theme-2026';

?>

<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
    <head>
        <title><?= strip_tags((string) $this->pageTitle) ?></title>
        <meta charset="<?= Yii::$app->charset ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <?php $this->head() ?>
        <?= $this->render('head') ?>

    </head>

    <?= Html::beginTag('body', ['class' => $bodyClasses]) ?>
    <?php $this->beginBody() ?>

        <!-- start: top navigation bar -->
        <div id="topbar" class="topbar fixed-top navbar">
            <div class="container flex-nowrap">
                <div class="topbar-brand d-flex text-nowrap overflow-hidden">
                    <?= SiteLogo::widget() ?>
                    <a class="mt2026-mobile-brand" href="<?= Url::home() ?>"><?= Html::encode(ConfigController::getMobileHeaderTitle() ?: Yii::$app->name) ?></a>
                </div>

                <ul id="top-menu-nav" class="flex-grow-1 nav">
                    <?php if (!Yii::$app->user->isGuest): ?>
                        <!-- Modern Theme 2026: Context Switcher replaces Space Chooser -->
                        <?= ContextSwitcher::widget() ?>
                    <?php endif; ?>

                    <!-- load navigation from widget -->
                    <?= TopMenu::widget() ?>
                </ul>

                <!--
                    Hidden stub so core humhub.ui.topNavigation.js finds #topbar-second.
                    height: 9999px (with visibility:hidden + position:absolute) ensures
                    isOverflow() always returns false: nav height (56px) < 9999px → no items migrate.
                -->
                <div id="topbar-second" style="position:absolute;visibility:hidden;height:9999px;width:0;overflow:hidden;pointer-events:none;" aria-hidden="true"></div>

                <?php if (!Yii::$app->user->isGuest): ?>
                    <button type="button" id="mt2026-mobile-search" aria-label="<?= Html::encode(Yii::t('base', 'Search')) ?>" aria-controls="context-switcher-menu" aria-expanded="false">
                        <i class="fa fa-search" aria-hidden="true"></i>
                    </button>
                <?php endif; ?>

                <ul class="nav" id="search-menu-nav">
                    <?= TopMenuRightStack::widget() ?>
                </ul>

                <div class="notifications">
                    <?= NotificationArea::widget() ?>
                </div>

                <div class="topbar-actions">
                    <?= AccountTopMenu::widget() ?>
                </div>
            </div>
        </div>
        <!-- end: top navigation bar -->

        <?= $content ?>

        <?php $this->endBody() ?>
    <?= Html::endTag('body') ?>
</html>
<?php $this->endPage() ?>

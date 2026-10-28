<?php

namespace humhub\modules\modernTheme\assets;

use yii\web\AssetBundle;

/**
 * Modern Theme Asset Bundle
 * Registers JavaScript modules for the theme's interactive features.
 */
class ModernThemeAsset extends AssetBundle
{
    public $sourcePath = '@modern-theme/resources';

    public $css = [];

    public $js = [
        'js/contextSwitcher.js',
        'js/reactionPicker.js',
        'js/peopleFocusGuard.js',
        'js/paletteSwitcher.js',
        'js/notifications.js',
        'js/modalFocusFix.js',
        'js/mobileKeyboardFix.js',
        'js/mobileSwipeFix.js',
        'js/mailLayout.js',
        'js/mobileCommentCompose.js',
        'js/mobileContentToggle.js',
        'js/dropdownManager.js',
        'js/composerFocus.js',
        'js/commentSubmit.js',
        'js/commentThreads.js',
        'js/streamEditActions.js',
        'js/spacePolish.js',
        'js/copyPolish.js',
        'js/streamPolish.js',
        'js/unsavedGuard.js',
        'js/profileInitials.js',
        'js/calendarPolish.js',
        'js/mobileHeader.js',
        'js/adminPolish.js',
    ];

    public $depends = [
        'humhub\assets\AppAsset',
    ];
}

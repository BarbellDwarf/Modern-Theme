<?php

/**
 * Modern Theme
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

use humhub\components\View;
use humhub\modules\dashboard\widgets\DashboardContent;
use humhub\modules\modernTheme\Events;
use humhub\widgets\TopMenu;
use yii\base\Application;

return [
    'id' => 'modern-theme',
    'class' => humhub\modules\modernTheme\Module::class,
    'namespace' => 'humhub\modules\modernTheme',
    'events' => [
        [
            'class' => Application::class,
            'event' => Application::EVENT_BEFORE_ACTION,
            'callback' => [Events::class, 'onBeforeAction'],
        ],
        [
            'class' => View::class,
            'event' => View::EVENT_BEGIN_BODY,
            'callback' => [Events::class, 'onViewBeginBody'],
        ],
        [
            'class' => View::class,
            'event' => View::EVENT_END_BODY,
            'callback' => [Events::class, 'onViewEndBody'],
        ],
        [
            'class' => TopMenu::class,
            'event' => TopMenu::EVENT_RUN,
            'callback' => [Events::class, 'onTopMenuRun'],
        ],
        [
            'class' => DashboardContent::class,
            'event' => DashboardContent::EVENT_BEFORE_RUN,
            'callback' => [Events::class, 'onDashboardContentBeforeRun'],
        ],
    ],
];

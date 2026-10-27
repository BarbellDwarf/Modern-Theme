humhub.module('modernTheme.adminPolish', function(module, require, $) {

    // Labels HumHub's own admin markup leaves off. Idempotent, no state.
    var label = function(selector, text) {
        $(selector).each(function() {
            var $el = $(this);
            $el.attr('aria-label', text);
            $el.attr('title', text);
        });
    };

    // Scroll containers that get a fade on whichever edge still hides content.
    var SCROLLERS = '#admin-menu .list-group, .tab-menu, .table-responsive, .grid-view';

    var updateFade = function($el) {
        var el = $el[0];
        var max = el.scrollWidth - el.clientWidth;
        if (max < 2) {
            $el.removeAttr('data-fade');
            return;
        }
        var atStart = el.scrollLeft <= 1;
        var atEnd = el.scrollLeft >= max - 1;
        var fade = atStart ? (atEnd ? '' : 'right') : (atEnd ? 'left' : 'both');
        if (fade) {
            $el.attr('data-fade', fade);
        } else {
            $el.removeAttr('data-fade');
        }
    };

    // Bring the current chip / tab into view without scrolling the page.
    var revealActive = function($el) {
        if ($el[0].scrollWidth - $el[0].clientWidth < 2) {
            return;
        }
        var active = $el.find('.active')[0];
        if (!active) {
            return;
        }
        active.scrollIntoView({ inline: 'center', block: 'nearest' });
    };

    var run = function() {
        var $admin = $('.mt2026-admin-layout');
        if (!$admin.length) {
            return;
        }

        // Split export button: chevron only, no visible text.
        label($admin.find('.btn-group .btn-icon-only'), 'Export options');

        // Marketplace entry: say where it goes.
        $admin.find('a[href*="/marketplace/browse"]').each(function() {
            var $link = $(this);
            if (!$link.attr('title')) {
                $link.attr('title', 'Open the HumHub Marketplace');
            }
        });

        var $scrollers = $admin.find(SCROLLERS);
        $scrollers.each(function() {
            var $el = $(this);
            // Tables keep their own position; only chips and tabs recenter.
            if ($el.hasClass('tab-menu') || $el.closest('#admin-menu').length) {
                revealActive($el);
            }
            updateFade($el);
        });
        $scrollers.off('scroll.mt2026fade').on('scroll.mt2026fade', function() {
            updateFade($(this));
        });
        $(window).off('resize.mt2026fade').on('resize.mt2026fade', function() {
            $scrollers.each(function() {
                updateFade($(this));
            });
        });
    };

    var init = function() {
        run();
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});

humhub.module('modernTheme.adminPolish', function(module, require, $) {

    // Labels HumHub's own admin markup leaves off. Idempotent, no state.
    var label = function(selector, text) {
        $(selector).each(function() {
            var $el = $(this);
            $el.attr('aria-label', text);
            $el.attr('title', text);
        });
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
    };

    var init = function() {
        run();
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});

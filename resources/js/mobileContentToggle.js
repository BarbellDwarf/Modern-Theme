humhub.module('mobileContentToggle', function(module, require, $) {
    'use strict';

    var MAX_HEIGHT = 600;
    var mobile = window.matchMedia('(max-width: 991px)');
    var resizeTimer = null;

    var syncLabels = function() {
        $('.mt2026-read-more').each(function() {
            var expanded = $(this).prev('.wall-entry-content.content').hasClass('mt2026-expanded');
            $(this)
                .attr('aria-expanded', expanded ? 'true' : 'false')
                .text(expanded ? 'Show less' : 'Read more');
        });
    };

    var update = function() {
        var isMobile = mobile.matches;

        $('.wall-entry-content.content').each(function() {
            var $content = $(this);

            if (!isMobile) {
                $content.removeClass('mt2026-clamped mt2026-expanded');
                $content.next('.mt2026-read-more').remove();
                return;
            }

            // scrollHeight is the full content height even while clamped.
            var clamp = this.scrollHeight > MAX_HEIGHT;
            $content.toggleClass('mt2026-clamped', clamp);

            var $button = $content.next('.mt2026-read-more');

            if (!clamp) {
                $content.removeClass('mt2026-expanded');
                $button.remove();
                return;
            }

            if (!$button.length) {
                $('<button type="button" class="mt2026-read-more"></button>').insertAfter($content);
            }
        });

        syncLabels();
    };

    var init = function() {
        $(document)
            .off('click.mt2026ContentToggle', '.mt2026-read-more')
            .on('click.mt2026ContentToggle', '.mt2026-read-more', function() {
                $(this).prev('.wall-entry-content.content').toggleClass('mt2026-expanded');
                syncLabels();
            });

        $(window)
            .off('resize.mt2026ContentToggle')
            .on('resize.mt2026ContentToggle', function() {
                window.clearTimeout(resizeTimer);
                resizeTimer = window.setTimeout(update, 150);
            });

        update();
    };

    var unload = function() {
        $(document).off('.mt2026ContentToggle');
        $(window).off('.mt2026ContentToggle');
        window.clearTimeout(resizeTimer);
    };

    mobile.addEventListener('change', update);

    module.initOnPjaxLoad = true;
    module.export({
        init: init,
        unload: unload
    });
});

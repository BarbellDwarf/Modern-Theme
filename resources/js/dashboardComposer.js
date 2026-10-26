humhub.module('modernTheme.dashboardComposer', function(module, require, $) {

    var event = require('event');
    var EVENT_NS = '.mt2026DashboardComposer';

    var collapseAll = function() {
        $('[data-mt2026-dashboard-composer]').each(function() {
            var $composer = $(this);
            $composer.removeClass('is-open');
            $composer.find('[data-mt2026-dashboard-composer-body]').attr('hidden', 'hidden');
            $composer.find('[data-mt2026-dashboard-composer-trigger]').attr('aria-expanded', 'false');
        });
    };

    var init = function() {
        $(document).off(EVENT_NS).on('click' + EVENT_NS, '[data-mt2026-dashboard-composer-trigger]', function() {
            var $trigger = $(this);
            var $composer = $trigger.closest('[data-mt2026-dashboard-composer]');
            var $body = $composer.find('[data-mt2026-dashboard-composer-body]').first();

            if (!$body.length) {
                return;
            }

            $body.removeAttr('hidden');
            $composer.addClass('is-open');
            $trigger.attr('aria-expanded', 'true');

            var editor = $body.find('.ProseMirror[contenteditable="true"], textarea').get(0);
            if (editor) {
                try {
                    editor.focus({ preventScroll: true });
                } catch (e) {
                    editor.focus();
                }
            }
        });

        event.off(EVENT_NS).on('humhub:content:afterSubmit' + EVENT_NS, collapseAll);
    };

    var unload = function() {
        $(document).off(EVENT_NS);
        event.off(EVENT_NS);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

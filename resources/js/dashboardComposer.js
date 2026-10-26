humhub.module('modernTheme.dashboardComposer', function(module, require, $) {

    var event = require('event');
    var status = require('ui.status');
    var EVENT_NS = '.mt2026DashboardComposer';

    var resetComposer = function() {
        var reset = 0;

        $('[data-mt2026-dashboard-composer].is-open').each(function() {
            var $composer = $(this);
            var $body = $composer.find('[data-mt2026-dashboard-composer-body]');

            // Core resetForm() clears the HumHub form, but the dashboard copy is
            // collapsed by that reset before ProseMirror always sees the clear.
            // Empty the editor explicitly so a second submit cannot re-post.
            $body.find('.ProseMirror[contenteditable="true"]').each(function() {
                this.innerHTML = '';
            });
            $body.find('.humhub-ui-richtext').trigger('clear');
            $body.find('textarea').val('');
            $body.find('form').each(function() {
                this.reset();
            });

            $composer.removeClass('is-open');
            $body.attr('hidden', 'hidden');
            $composer.find('[data-mt2026-dashboard-composer-trigger]').attr('aria-expanded', 'false');
            reset++;
        });

        return reset;
    };

    var onSubmitted = function() {
        // Only feedback for a post made through this composer, not stream forms.
        if (resetComposer() > 0) {
            status.success('Post published');
        }
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

        event.off(EVENT_NS).on('humhub:content:afterSubmit' + EVENT_NS, onSubmitted);
    };

    var unload = function() {
        $(document).off(EVENT_NS);
        event.off(EVENT_NS);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

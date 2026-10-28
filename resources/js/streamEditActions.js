/* Inline post editor: visible Save label + Cancel button.
 * Self-starting: HumHub may inject theme JS after DOMContentLoaded and before
 * jQuery is ready, so poll briefly for both instead of relying on the module
 * registry or a ready event.
 */
(function () {
    'use strict';


    var observer = null;
    var timer = null;

    function enhance(button, $) {
        var $button = $(button);
        var form = $button.closest('form')[0];

        if (!form || form.id.indexOf('post-edit-form') !== 0) {
            return;
        }

        $button.removeClass('btn-icon-only');
        $button.attr('aria-label', 'Save');

        var row = $button.parent()[0];

        if (!row || row.querySelector('.mt2026-edit-cancel')) {
            return;
        }

        $('<button type="button" class="btn btn-light mt2026-edit-cancel">Cancel</button>')
            .on('click', function () {
                var $cancelLink = $(this)
                    .closest('.wall-entry, .stream-entry')
                    .find('a.stream-entry-cancel-edit-link[data-action-click="cancelEdit"]')
                    .first();

                if ($cancelLink.length) {
                    $cancelLink[0].click();
                }
            })
            .insertBefore($button);
    }

    function boot() {
        var $ = window.jQuery;

        if (!$) {
            window.setTimeout(boot, 100);
            return;
        }

        var run = function () {
            $('form[id^="post-edit-form"] [data-action-click="editSubmit"]').each(function () {
                enhance(this, $);
            });
        };

        var schedule = function () {
            window.clearTimeout(timer);
            timer = window.setTimeout(run, 120);
        };

        run();

        if (window.MutationObserver) {
            observer = new MutationObserver(schedule);
            observer.observe(document.getElementById('layout-content') || document.body, {
                childList: true,
                subtree: true
            });
        }

        $(document).on('humhub:content:afterRender humhub:ready', schedule);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

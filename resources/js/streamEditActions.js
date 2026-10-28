(function ($) {
    'use strict';

    var observer = null;
    var timer = null;

    // HumHub renders "Cancel Edit" as a hidden dropdown item outside the edit
    // form, so the form itself has no way to back out.
    var enhance = function(button) {
        var $button = $(button);
        var form = $button.closest('form')[0];

        if (!form || form.id.indexOf('post-edit-form') !== 0) {
            return;
        }

        // A visible label is all that's missing; the square class fights it.
        // The label itself comes from CSS (::after) on editSubmit.
        $button.removeClass('btn-icon-only');
        $button.attr('aria-label', 'Save');

        var row = $button.parent()[0];

        if (!row || row.querySelector('.mt2026-edit-cancel')) {
            return;
        }

        $('<button type="button" class="btn btn-light mt2026-edit-cancel">Cancel</button>')
            .on('click', function() {
                // Resolve the link at click time: HumHub may paint the entry
                // dropdown after the edit form, so it can be missing when the
                // button is created.
                var $cancelLink = $(this)
                    .closest('.wall-entry, .stream-entry')
                    .find('a.stream-entry-cancel-edit-link[data-action-click="cancelEdit"]')
                    .first();

                if ($cancelLink.length) {
                    // Let HumHub's handler reload the entry; do not touch the form.
                    $cancelLink[0].click();
                }
            })
            .insertBefore($button);
    };

    var run = function() {
        $('form[id^="post-edit-form"] [data-action-click="editSubmit"]').each(function() {
            enhance(this);
        });
    };

    var schedule = function() {
        window.clearTimeout(timer);
        timer = window.setTimeout(run, 120);
    };

    var init = function() {
        run();

        if (window.MutationObserver) {
            observer = new MutationObserver(schedule);
            observer.observe(document.getElementById('layout-content') || document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    var unload = function() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.clearTimeout(timer);
    };

    $(init);
    $(document).on('humhub:ready humhub:content:afterRender', init);

    var lastUrl = location.href;
    window.setInterval(function () {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            schedule();
        }
    }, 400);
})(window.jQuery);

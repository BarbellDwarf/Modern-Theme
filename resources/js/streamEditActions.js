humhub.module('modernTheme.streamEditActions', function(module, require, $) {

    var observer = null;
    var timer = null;

    // HumHub renders "Cancel Edit" as a hidden dropdown item outside the edit
    // form, so the form itself has no way to back out.
    var enhance = function(button) {
        var $button = $(button);
        var form = $button.closest('form')[0];

        if (!form || form.id.indexOf('post-edit-form_') !== 0) {
            return;
        }

        // A visible label is all that's missing; the square class fights it.
        $button.removeClass('btn-icon-only');

        if (!$button.find('.mt2026-comment-submit-label').length) {
            $button.append($('<span>').addClass('mt2026-comment-submit-label').text('Save'));
        }
        $button.attr('aria-label', 'Save');

        if ($button.prev('.mt2026-edit-cancel').length) {
            return;
        }

        var $cancelLink = $button
            .closest('.wall-entry, .stream-entry')
            .find('.stream-entry-cancel-edit-link')
            .first();

        if (!$cancelLink.length) {
            return;
        }

        $('<button type="button" class="btn btn-default mt2026-edit-cancel">Cancel</button>')
            .on('click', function() {
                // Dispatch (not .click()) skips the link's href="#" jump while
                // still reaching HumHub's delegated action handler.
                $cancelLink[0].dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true
                }));
            })
            .insertBefore($button);
    };

    var run = function() {
        $('form[id^="post-edit-form_"] [data-action-click="editSubmit"]').each(function() {
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
            observer.observe(document.body, { childList: true, subtree: true });
        }
    };

    var unload = function() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.clearTimeout(timer);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

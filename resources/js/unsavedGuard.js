humhub.module('modernTheme.unsavedGuard', function(module, require, $) {

    var EDITOR = '[contenteditable="true"], textarea';
    var NS = '.mt2026UnsavedGuard';

    var hasDraft = function($form) {
        var found = false;

        $form.find(EDITOR).each(function() {
            var $field = $(this);
            var value = $field.is('textarea') ? $field.val() : $field.text();

            if ($.trim(value || '') !== '') {
                found = true;
                return false;
            }
        });

        if (found) {
            return true;
        }

        $form.find('input[type="file"]').each(function() {
            if (this.files && this.files.length) {
                found = true;
                return false;
            }
        });

        return found;
    };

    // Core arms a beforeunload prompt for every acknowledged form as soon as it
    // initialises. Only an editor with a draft should keep that prompt: search
    // and filter forms have no draft to lose, and an empty composer does not
    // either. Clearing the stored snapshot disarms core's handler.
    var sync = function(form) {
        var $form = $(form);
        if (!$form.length || !$form.is('form')) {
            return;
        }

        if (!hasDraft($form)) {
            $form.data('state', null);
        } else if (!$form.data('state')) {
            $form.data('state', 'draft');
        }
    };

    var syncAll = function() {
        $('form[data-ui-addition~="acknowledgeForm"]').each(function() {
            sync(this);
        });
    };

    var onInteract = function(event) {
        sync($(event.target).closest('form'));
    };

    var init = function() {
        syncAll();

        // Core may arm its snapshots after this module inits. Re-run once the
        // current task queue drains so the first pass sees them.
        window.setTimeout(syncAll, 0);

        // Forms loaded after init (composer, mail) arm on first touch.
        $(document)
            .off(NS)
            .on('focusin' + NS + ' input' + NS + ' change' + NS, onInteract);
    };

    var unload = function() {
        $(document).off(NS);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

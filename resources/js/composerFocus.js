humhub.module('modernTheme.composerFocus', function(module, require, $) {

    // The dashboard composer links to /s/<space>/home?compose=1. HumHub builds
    // the wall form after this module runs, so poll briefly for ProseMirror.
    var MAX_TRIES = 20;
    var RETRY_MS = 100;

    var isComposeRequest = function() {
        return /(^\?|&)compose=1(&|$)/.test(window.location.search);
    };

    var dropFlag = function() {
        try {
            var search = window.location.search.replace(/([?&])compose=1(&|$)/, function(match, prefix, suffix) {
                return suffix ? prefix : '';
            });
            var url = window.location.pathname + search + window.location.hash;
            window.history.replaceState(window.history.state, '', url);
        } catch (e) {
            // Older browsers: leaving the flag only costs a re-focus on reload.
        }
    };

    var focus = function(attempt) {
        var editor = document.querySelector(
            '[data-stream-create-content] .ProseMirror[contenteditable="true"]'
        );

        if (!editor) {
            if (attempt < MAX_TRIES) {
                window.setTimeout(function() {
                    focus(attempt + 1);
                }, RETRY_MS);
            }
            return;
        }

        var wrapper = editor.closest('[data-stream-create-content]') || editor;
        if (wrapper.scrollIntoView) {
            try {
                wrapper.scrollIntoView({ block: 'center' });
            } catch (e) {
                wrapper.scrollIntoView();
            }
        }

        try {
            editor.focus({ preventScroll: true });
        } catch (e) {
            editor.focus();
        }

        dropFlag();
    };

    var init = function() {
        if (isComposeRequest()) {
            focus(0);
        }
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: function() {} });
});

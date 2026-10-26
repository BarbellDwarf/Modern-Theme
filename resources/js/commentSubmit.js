humhub.module('modernTheme.commentSubmit', function(module, require, $) {

    var ENHANCED = 'mt2026CommentSubmitEnhanced';
    var observer = null;
    var debounceTimer = null;

    var getScope = function($button) {
        var $form = $button.closest('form');
        return $form.length ? $form : $button.closest('.comment_create, .content_edit');
    };

    var hasContent = function($button) {
        var $scope = getScope($button);
        var $editor = $scope.find('.ProseMirror').first();

        if (!$editor.length) {
            var $textarea = $scope.find('textarea').first();
            return $textarea.length > 0 && $.trim($textarea.val()) !== '';
        }

        if ($.trim($editor.text()) !== '') {
            return true;
        }

        // Attachment-only comments are valid in HumHub.
        return $scope.find('.file-preview img').length > 0;
    };

    var updateButton = function($button) {
        $button.prop('disabled', !hasContent($button));
    };

    var enhance = function(button) {
        var $button = $(button);

        if (!$button.data(ENHANCED)) {
            var label = $button.attr('data-action-click') === 'editSubmit' ? 'Save' : 'Comment';
            $button.append($('<span>').addClass('mt2026-comment-submit-label').text(label));
            $button.attr('aria-label', label);
            $button.data(ENHANCED, true);
        }

        updateButton($button);
    };

    var enhanceAll = function() {
        $('.btn-comment-submit').each(function() {
            enhance(this);
        });
    };

    var updateScope = function(target) {
        var $scope = getScope($(target));
        $scope.find('.btn-comment-submit').each(function() {
            enhance(this);
        });
    };

    var scheduleEnhance = function() {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(enhanceAll, 120);
    };

    var init = function() {
        $(document)
            .off('.mt2026CommentSubmit')
            .on('input.mt2026CommentSubmit keyup.mt2026CommentSubmit paste.mt2026CommentSubmit drop.mt2026CommentSubmit',
                '.ProseMirror, textarea',
                function() {
                    updateScope(this);
                });

        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver(scheduleEnhance);
        observer.observe(document.body, { childList: true, subtree: true });

        enhanceAll();
    };

    var unload = function() {
        $(document).off('.mt2026CommentSubmit');

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

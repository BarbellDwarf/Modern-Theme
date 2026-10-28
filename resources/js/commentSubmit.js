humhub.module('modernTheme.commentSubmit', function(module, require, $) {

    var observer = null;
    var debounceTimer = null;

    var getScope = function(element) {
        var $element = $(element);
        var $form = $element.closest('form');
        return $form.length ? $form : $element.closest('.comment_create, .comment-form, .comment-container, .content_edit');
    };

    // ProseMirror's placeholder is a widget node containing the hint text
    // ("Write a new comment..."). It must never count as content nor reach the
    // hidden field, otherwise an empty submit stores the editor's own markup.
    var stripWidgetsFromHtml = function(html) {
        return String(html || '')
            .replace(/<div[^>]*ProseMirror-widget[^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<img[^>]*ProseMirror-separator[^>]*>/gi, '')
            .replace(/<br[^>]*ProseMirror-trailingBreak[^>]*>/gi, '');
    };

    var cleanText = function($editor) {
        var $clone = $editor.clone();
        $clone.find('.ProseMirror-widget, .atwho-placeholder, img.ProseMirror-separator, br.ProseMirror-trailingBreak').remove();
        return $.trim($clone.text());
    };

    var hasContent = function($button) {
        var $scope = getScope($button);
        var $editor = $scope.find('.ProseMirror').first();

        if (!$editor.length) {
            var $textarea = $scope.find('textarea').first();
            return $textarea.length > 0 && $.trim($textarea.val()) !== '';
        }

        if (cleanText($editor) !== '') {
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
        var label = $button.attr('data-action-click') === 'editSubmit' ? 'Save' : 'Comment';
        var $label = $button.find('.mt2026-comment-submit-label');
        var text = $label.text();

        // Self-healing: HumHub's button loader restores cached markup and can drop the span.
        if (!$label.length) {
            $button.append($('<span>').addClass('mt2026-comment-submit-label').text(label));
        } else if (text !== label) {
            $label.text(label);
        }

        $button.attr('aria-label', label);

        updateButton($button);
    };

    var enhanceAll = function() {
        $('.btn-comment-submit').each(function() {
            enhance(this);
        });
    };

    var updateScope = function(target) {
        var $scope = getScope(target);
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

    // The editor only writes into the hidden field on focusout, so a direct click on
    // the submit button serialises an empty message and the server answers with 400.
    var serializeScope = function(scope) {
        var $scope = $(scope);
        var $input = $scope.find('[name$="[message]"]').first();
        var $editor = $scope.find('.ProseMirror').first();

        if (!$input.length || !$editor.length) {
            return;
        }

        var value = null;
        var widget = null;

        try {
            var Widget = require('ui.widget').Widget;
            widget = Widget.instance($scope.find('.humhub-ui-richtext').first());
        } catch (err) {
            widget = null;
        }

        if (widget && widget.editor && typeof widget.editor.serialize === 'function') {
            try {
                value = widget.editor.serialize();
            } catch (err) {
                value = null;
            }
        }

        if (value === null) {
            // Let core's own focusout handler serialise into the hidden field.
            try {
                $editor[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
            } catch (err) {}

            value = $input.val();

            // short-cut: markdown is lost if the widget API is gone, the server has the final say
            if (!value && cleanText($editor) !== '') {
                value = $editor[0].innerHTML;
            }
        }

        if (value == null) {
            return;
        }

        value = stripWidgetsFromHtml(value);

        // Empty editor (placeholder only): clear the field and let the disabled
        // button block submission.
        if (cleanText($editor) === '' && $scope.find('.file-preview img').length === 0) {
            value = '';
        }

        if ($input.val() !== value) {
            $input.val(value).trigger('input').trigger('change');
        }
    };

    // Capture phase: runs before HumHub's delegated click/submit handlers read the form.
    var onDocumentClick = function(e) {
        var button = e.target && e.target.closest ? e.target.closest('.btn-comment-submit') : null;
        if (!button) {
            return;
        }

        var scope = button.closest('form') || button.closest('.comment_create, .comment-form, .comment-container');
        if (scope) {
            serializeScope(scope);
        }
    };

    var onDocumentSubmit = function(e) {
        var form = e.target;
        if (!form || form.nodeName !== 'FORM' || !form.querySelector('.btn-comment-submit')) {
            return;
        }

        serializeScope(form);
    };

    var init = function() {
        $(document)
            .off('.mt2026CommentSubmit')
            .on('input.mt2026CommentSubmit keyup.mt2026CommentSubmit paste.mt2026CommentSubmit drop.mt2026CommentSubmit',
                '.ProseMirror, textarea',
                function() {
                    updateScope(this);
                });

        document.removeEventListener('click', onDocumentClick, true);
        document.addEventListener('click', onDocumentClick, true);
        document.removeEventListener('submit', onDocumentSubmit, true);
        document.addEventListener('submit', onDocumentSubmit, true);

        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver(scheduleEnhance);
        observer.observe(document.body, { childList: true, subtree: true });

        enhanceAll();
    };

    var unload = function() {
        $(document).off('.mt2026CommentSubmit');
        document.removeEventListener('click', onDocumentClick, true);
        document.removeEventListener('submit', onDocumentSubmit, true);

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

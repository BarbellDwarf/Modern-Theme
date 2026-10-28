(function () {
    'use strict';

    function boot() {
        if (!window.jQuery) {
            setTimeout(boot, 150);
            return;
        }
        var $ = window.jQuery;

        function showToast(message) {
            var $toast = $('.mt2026-toast');
            if (!$toast.length) {
                $toast = $('<div class="mt2026-toast" role="status" aria-live="polite"></div>').appendTo('body');
            }
            $toast.text(message).addClass('is-visible');
            window.clearTimeout(window.__apToast);
            window.__apToast = window.setTimeout(function () { $toast.removeClass('is-visible'); }, 2000);
        }

        function copyText(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
            }
            try {
                var ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                var ok = document.execCommand('copy'); document.body.removeChild(ta);
                return Promise.resolve(ok);
            } catch (e) { return Promise.resolve(false); }
        }

        function permalinkFor($row) {
            var $entry = $row.closest('.wall-entry, .post-view, .stream-entry');
            var $a = $entry.find('a[href*="/content/perma"]').first();
            if ($a.length) return $a.attr('href');
            return window.location.href;
        }

        function injectShareAndAria() {
            $('.wall-entry-controls, .wall-entry-footer').each(function () {
                var $row = $(this);
                if (!$row.closest('.wall-entry, .post-view').length) { return; }
                if (!$row.find('.mt2026-share-btn').length) {
                    $row.append(
                        '<button type="button" class="mt2026-share-btn" aria-label="Share link" title="Share link">'
                        + '<i class="fa fa-external-link-square" aria-hidden="true"></i>'
                        + '</button>'
                    );
                }
            });
            // icon-only affordances that ship with NULL aria-label on mobile
            $('#mail-conversation-create-button').attr('aria-label', 'New message').attr('title', 'New message');
            $('[data-action-click="editSubmit"]').attr('aria-label', 'Save').attr('title', 'Save');
            // strip double "(n)" from comment thread toggles
            $('.single-comment a[data-action-click="comment.toggleComment"]').each(function () {
                var $l = $(this);
                var t = $l.text().replace(/\s*\(\s*\d+\s*\)\s*$/, '');
                var last = $l.data('mt2026-clean');
                if (last === t) { return; }
                // preserve the hidden comment-count + chevron created by commentThreads.js
                $l.contents().filter(function () { return this.nodeType === 3 && this.nodeValue.trim(); })
                    .first().replaceWith(document.createTextNode(t + ' '));
                $l.data('mt2026-clean', t);
            });
        }

        if (!window.__ariaPolishRan) {
            window.__ariaPolishRan = true;
            injectShareAndAria();
            $(document).on('click.mt2026share', '.mt2026-share-btn', function (e) {
                e.preventDefault(); e.stopPropagation();
                var url = permalinkFor($(this));
                copyText(url).then(function () { /* optional toast */ });
            });
        }
        setTimeout(injectShareAndAria, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
        setTimeout(boot, 600);
    } else {
        boot();
    }
})();

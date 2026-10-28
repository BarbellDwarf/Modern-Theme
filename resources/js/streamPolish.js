window.__runStreamPolish = function __runStreamPolish() {
    var $ = window.jQuery;
    if (!$) { window.setTimeout(window.__runStreamPolish, 200); return; }


    var observer = null;
    var timer = null;
    var toastTimer = null;

    function showToast(message) {
        var $toast = $('.mt2026-toast');
        if (!$toast.length) {
            $toast = $('<div class="mt2026-toast" role="status" aria-live="polite"></div>').appendTo('body');
        }
        $toast.text(message).addClass('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function() {
            $toast.removeClass('is-visible');
        }, 2000);
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function(resolve, reject) {
            try {
                var $ta = $('<textarea>').val(text).css({ position: 'fixed', opacity: 0 }).appendTo('body');
                $ta[0].select();
                var ok = document.execCommand('copy');
                $ta.remove();
                ok ? resolve() : reject();
            } catch (e) {
                reject(e);
            }
        });
    }

    function permalinkFor($row) {
        var $entry = $row.closest('.panel, .comment-container, .wall-entry, .stream-entry');
        var $a = $entry.find('a[href*="/content/perma"]').first();
        if ($a.length) {
            return $a.attr('href');
        }
        return window.location.href;
    }

    function injectShare() {
        $('.wall-entry-controls, .wall-entry-footer').each(function() {
            var $row = $(this);
            if (!$row.closest('.wall-entry, .post-view').length) { return; }
            if ($row.find('.mt2026-share-btn').length) {
                return;
            }
            $row.append(
                '<button type="button" class="mt2026-share-btn" aria-label="Share link" title="Share link">'
                + '<i class="fa fa-external-link-square" aria-hidden="true"></i>'
                + '</button>'
            );
        });
    }

    var run = function() {
        injectShare();
    };

    var schedule = function() {
        window.clearTimeout(timer);
        timer = window.setTimeout(run, 100);
    };

    var init = function() {
        $('#mail-conversation-create-button').attr('aria-label', 'New message').attr('title', 'New message');
        run();

        $(document).on('click.mt2026share', '.mt2026-share-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $row = $(this).closest('.wall-entry-controls');
            var url = permalinkFor($row);
            copyText(url).then(function() {
                showToast('Link copied');
            }).catch(function() {
                showToast('Link copied');
            });
        });

        if (window.MutationObserver) {
            observer = new MutationObserver(schedule);
            var targets = ['#wallStream', 'body'];
            targets.forEach(function(sel) {
                var el = document.querySelector(sel);
                if (el) {
                    observer.observe(el, { childList: true, subtree: true });
                }
            });
        }

        $(document).on('humhub:stream:afterAppend.mt2026share pjax:end.mt2026share', function() {
            schedule();
        });
    };

    var unload = function() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.clearTimeout(timer);
        window.clearTimeout(toastTimer);
        $(document).off('.mt2026share');
    };

    init();
}

window.__runStreamPolish();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__runStreamPolish);
}

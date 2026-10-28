(function () {
    'use strict';

    var SELECTOR = '.single-comment a[data-action-click="comment.toggleComment"]';
    var SYNC_DELAY = 450; // HumHub slides the container in ~400ms

    function containerOf(link) {
        var selector = link.getAttribute('data-action-click-target');
        return selector ? document.querySelector(selector) : null;
    }

    function isOpen(link) {
        var container = containerOf(link);
        if (!container) return false;
        if (container.classList.contains('d-none')) return false;
        return container.offsetHeight > 0;
    }

    function countOf(link) {
        var countEl = link.querySelector('.comment-count');
        if (countEl) return parseInt(countEl.getAttribute('data-count'), 10) || 0;
        var match = /\((\d+)\)/.exec(link.textContent);
        return match ? parseInt(match[1], 10) : 0;
    }

    function textFor(link, open) {
        var count = countOf(link);
        if (count === 0) return 'Reply';
        var noun = count === 1 ? '1 reply' : count + ' replies';
        return (open ? 'Hide ' : 'View ') + noun;
    }

    function sync(link) {
        var open = isOpen(link);
        link.classList.toggle('mt2026-thread-open', open);
        link.setAttribute('aria-expanded', open ? 'true' : 'false');

        var text = textFor(link, open);

        // Preserve the hidden .comment-count node and the chevron; only the
        // leading text node changes ("View 2 replies" <-> "Hide 2 replies").
        var node = link.firstChild;
        while (node && node.nodeType === 1) {
            node = node.nextSibling;
        }
        if (node && node.nodeType === 3) {
            node.nodeValue = text;
        } else {
            link.insertBefore(document.createTextNode(text), link.firstChild);
        }
        link.dataset.mt2026ThreadLabel = text;
    }

    function label(link) {
        link.classList.remove('d-none');

        var countEl = link.querySelector('.comment-count');
        var count = countOf(link);

        // Strip any stale duplicate "(N)" text, keep the count node for updates.
        var text = textFor(link, isOpen(link));
        link.textContent = text;
        if (countEl) {
            countEl.textContent = '';
            countEl.style.setProperty('display', 'none', 'important');
            link.appendChild(countEl);
        }

        if (count > 0 && !link.querySelector('.mt2026-thread-chevron')) {
            var chevron = document.createElement('span');
            chevron.className = 'mt2026-thread-chevron';
            chevron.setAttribute('aria-hidden', 'true');
            chevron.textContent = '\u25BE';
            link.appendChild(chevron);
        }

        sync(link);
    }

    function enhance(root) {
        (root || document).querySelectorAll(SELECTOR).forEach(label);
    }

    function onClick(event) {
        var link = event.target.closest ? event.target.closest(SELECTOR) : null;
        if (!link || !link.querySelector('.mt2026-thread-chevron')) return;

        setTimeout(function () {
            sync(link);
            var container = containerOf(link);
            if (container && isOpen(link) && container.scrollIntoView) {
                // Bring the freshly opened thread (and its composer) into view.
                container.scrollIntoView({block: 'nearest'});
            }
        }, SYNC_DELAY);
    }

    function init() {
        enhance();
        document.addEventListener('click', onClick);

        var target = document.getElementById('layout-content') || document.body;
        var pending = null;
        new MutationObserver(function () {
            clearTimeout(pending);
            pending = setTimeout(function () { enhance(); }, 50);
        }).observe(target, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

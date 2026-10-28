/**
 * Comment thread toggles.
 *
 * HumHub renders one toggle per comment as "Reply (N)" hidden behind CSS, and
 * our theme exposes it. This module labels it for what it does: "Reply" when
 * there is no thread, "View N replies" when there is, with a chevron that
 * flips while the thread is open. Clicks stay with HumHub's own
 * comment.toggleComment handler; we only relabel and re-sync.
 */
(function () {
    'use strict';

    var SELECTOR = '.single-comment a[data-action-click="comment.toggleComment"]';
    var SYNC_DELAY = 450; // HumHub slides the container in ~400ms

    function isOpen(link) {
        var selector = link.getAttribute('data-action-click-target');
        var container = selector && document.querySelector(selector);
        if (!container) return false;
        if (container.classList.contains('d-none')) return false;
        return container.offsetHeight > 0;
    }

    function sync(link) {
        var open = isOpen(link);
        link.classList.toggle('mt2026-thread-open', open);
        link.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    // HumHub keeps the reply count in .comment-count and updates it in place
    // when a reply is posted, so keep that node (hidden) as the source of truth.
    function countOf(link) {
        var countEl = link.querySelector('.comment-count');
        if (countEl) return parseInt(countEl.getAttribute('data-count'), 10) || 0;
        var match = /\((\d+)\)/.exec(link.textContent);
        return match ? parseInt(match[1], 10) : 0;
    }

    function label(link) {
        var count = countOf(link);
        var text = count > 0
            ? 'View ' + count + (count === 1 ? ' reply' : ' replies')
            : 'Reply';

        link.classList.remove('d-none');
        if (link.dataset.mt2026ThreadLabel === text) {
            sync(link);
            return;
        }

        var countEl = link.querySelector('.comment-count');
        link.textContent = text;
        if (countEl) {
            countEl.textContent = '';
            // Inline !important survives whatever strips classes and HumHub's
            // own .show() when it bumps the count.
            countEl.style.setProperty('display', 'none', 'important');
            link.appendChild(countEl);
        }
        if (count > 0) {
            var chevron = document.createElement('span');
            chevron.className = 'mt2026-thread-chevron';
            chevron.setAttribute('aria-hidden', 'true');
            chevron.textContent = '\u25BE';
            link.appendChild(chevron);
        }
        link.dataset.mt2026ThreadLabel = text;
        sync(link);
    }

    function enhance(root) {
        (root || document).querySelectorAll(SELECTOR).forEach(label);
    }

    function onClick(event) {
        var link = event.target.closest ? event.target.closest(SELECTOR) : null;
        if (!link || !link.querySelector('.mt2026-thread-chevron')) return;
        setTimeout(function () { sync(link); }, SYNC_DELAY);
    }

    function init() {
        enhance();
        document.addEventListener('click', onClick);

        // Comments arrive by AJAX (stream, live updates) and get re-rendered.
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

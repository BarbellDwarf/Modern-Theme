humhub.module('modernTheme.adminPolish', function(module, require, $) {

    // Labels HumHub's own admin markup leaves off. Idempotent, no state.
    var label = function(selector, text) {
        $(selector).each(function() {
            var $el = $(this);
            $el.attr('aria-label', text);
            $el.attr('title', text);
        });
    };

    // Scroll containers that get a fade on the right while content hides there.
    var SCROLLERS = '#admin-menu .list-group, .tab-menu, .tab-menu .nav-tabs, .table-responsive, .grid-view';

    var isMobile = function() {
        return window.matchMedia('(max-width: 767px)').matches;
    };

    var updateFade = function($el) {
        var el = $el[0];
        // 4px slack absorbs sub-pixel scroll positions.
        if (el.scrollLeft + el.clientWidth < el.scrollWidth - 4) {
            $el.attr('data-fade', 'right');
        } else {
            $el.removeAttr('data-fade');
        }
    };

    // Bring the current chip / tab into view without scrolling the page.
    var revealActive = function($el) {
        if ($el[0].scrollWidth - $el[0].clientWidth < 2) {
            return;
        }
        var active = $el.find('.active')[0];
        if (!active) {
            return;
        }
        active.scrollIntoView({ inline: 'center', block: 'nearest' });
    };

    // Chips and tabs recenter on their active item; tables keep their position.
    var canReveal = function($el) {
        return $el.hasClass('tab-menu') || $el.hasClass('nav-tabs') || $el.closest('#admin-menu').length > 0;
    };

    var syncScrollers = function($scrollers, reveal) {
        $scrollers.each(function() {
            var $el = $(this);
            if (reveal && canReveal($el)) {
                revealActive($el);
            }
            updateFade($el);
        });
    };

    // Split a long admin intro at its last sentence: the descriptive lead gets
    // a three-line clamp with a More/Less toggle, the closing warning sentence
    // stays visible. Only runs where core renders intro copy as one block.
    var clampIntro = function($admin) {
        $admin.find('.panel-body').has('.module-row').children('.text-body-secondary').each(function() {
            var el = this;
            if (el.getAttribute('data-mt2026-intro')) {
                return;
            }
            var text = $.trim($(el).text());
            if (text.length < 200) {
                return;
            }
            var cut = Math.max(text.lastIndexOf('. '), text.lastIndexOf('! '), text.lastIndexOf('? '));
            if (cut < 120) {
                return;
            }
            var lead = text.slice(0, cut + 1);
            var warning = text.slice(cut + 2);
            if (warning.length < 40) {
                return;
            }
            el.setAttribute('data-mt2026-intro', 'done');
            el.textContent = '';

            var leadEl = document.createElement('span');
            leadEl.className = 'mt2026-intro-lead';
            leadEl.textContent = lead;

            var toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'mt2026-intro-toggle';
            toggle.textContent = 'More';
            toggle.setAttribute('aria-expanded', 'false');

            var warningEl = document.createElement('p');
            warningEl.className = 'mt2026-intro-warning';
            warningEl.textContent = warning;

            el.appendChild(leadEl);
            el.appendChild(toggle);
            el.appendChild(warningEl);

            $(toggle).on('click', function() {
                var open = !$(leadEl).hasClass('is-open');
                $(leadEl).toggleClass('is-open', open);
                $(toggle).attr('aria-expanded', open ? 'true' : 'false').text(open ? 'Less' : 'More');
            });
        });
    };

    // Hide the toggle when nothing is actually clamped (wide phones, desktop).
    var syncIntroToggles = function($admin) {
        $admin.find('.mt2026-intro-lead').each(function() {
            var lead = this;
            var toggle = $(lead).next('.mt2026-intro-toggle')[0];
            if (!toggle) {
                return;
            }
            var open = $(lead).hasClass('is-open');
            var clamped = lead.scrollHeight > lead.clientHeight + 2;
            toggle.style.display = (isMobile() && (open || clamped)) ? '' : 'none';
        });
    };

    // Full placeholder hides its tail at 390px ("...or exact id." cut mid-word).
    var syncSearchPlaceholder = function($admin) {
        $admin.find('input[name="UserSearch[freeText]"]').each(function() {
            var $input = $(this);
            if (typeof $input.attr('data-mt2026-placeholder') === 'undefined') {
                $input.attr('data-mt2026-placeholder', $input.attr('placeholder') || '');
            }
            var full = $input.attr('data-mt2026-placeholder');
            $input.attr('placeholder', isMobile() ? 'Search users…' : full);
        });
    };

    var lastWidth = 0;

    var run = function() {
        var $admin = $('.mt2026-admin-layout');
        if (!$admin.length) {
            return;
        }

        // Split export button: chevron only, no visible text.
        label($admin.find('.btn-group .btn-icon-only'), 'Export options');

        // Module gear: core says only "Actions", which is ambiguous in a list.
        label($admin.find('.module-actions .dropdown-toggle'), 'Module actions');

        // Marketplace entry: say where it goes.
        $admin.find('a[href*="/marketplace/browse"]').each(function() {
            var $link = $(this);
            if (!$link.attr('title')) {
                $link.attr('title', 'Open the HumHub Marketplace');
            }
        });

        clampIntro($admin);
        syncIntroToggles($admin);
        syncSearchPlaceholder($admin);

        var $scrollers = $admin.find(SCROLLERS);
        syncScrollers($scrollers, true);
        $scrollers.off('scroll.mt2026fade').on('scroll.mt2026fade', function() {
            updateFade($(this));
        });

        lastWidth = window.innerWidth;
        $(window).off('resize.mt2026admin').on('resize.mt2026admin', function() {
            syncIntroToggles($admin);
            syncSearchPlaceholder($admin);
            // Mobile keyboards resize without changing width; only a real
            // width change should yank the chip row back to the active chip.
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                syncScrollers($scrollers, true);
            }
        });
    };

    var init = function() {
        run();
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});

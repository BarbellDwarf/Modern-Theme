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
    var SCROLLERS = '#admin-menu .list-group, .tab-menu, .tab-menu .nav-tabs, .nav-tabs.tab-sub-menu, .table-responsive, .grid-view';

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

    // Split a long admin intro at its last sentence: the descriptive lead goes
    // behind a native disclosure (collapsed on phones, open on desktop), the
    // closing data-loss warning stays outside and always visible.
    var splitIntro = function($admin) {
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

            var details = document.createElement('details');
            details.className = 'mt2026-admin-about';
            details.open = !isMobile();

            var summary = document.createElement('summary');
            summary.textContent = 'About modules';

            var leadEl = document.createElement('p');
            leadEl.textContent = lead;

            details.appendChild(summary);
            details.appendChild(leadEl);

            var warningEl = document.createElement('p');
            warningEl.className = 'mt2026-intro-warning';
            warningEl.textContent = warning;

            el.appendChild(details);
            el.appendChild(warningEl);
        });
    };

    // Desktop always shows the intro; a phone starts collapsed and keeps
    // whatever the reader chose until the width really changes.
    var syncIntroDisclosure = function($admin, force) {
        $admin.find('.mt2026-admin-about').each(function() {
            if (!isMobile()) {
                this.open = true;
            } else if (force) {
                this.open = false;
            }
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

        if ($admin.length) {
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

            splitIntro($admin);
            syncIntroDisclosure($admin, false);
            syncSearchPlaceholder($admin);
        }

        // Tab strips also exist outside admin (account settings), so the
        // scroller helpers run on every page.
        var $scrollers = $admin.length ? $admin.find(SCROLLERS) : $(SCROLLERS);
        syncScrollers($scrollers, true);
        $scrollers.off('scroll.mt2026fade').on('scroll.mt2026fade', function() {
            updateFade($(this));
        });

        lastWidth = window.innerWidth;
        $(window).off('resize.mt2026admin').on('resize.mt2026admin', function() {
            // Mobile keyboards resize without changing width; only a real
            // width change should collapse the intro or yank the chip row
            // back to the active chip.
            var widthChanged = window.innerWidth !== lastWidth;
            if ($admin.length) {
                syncIntroDisclosure($admin, widthChanged);
                syncSearchPlaceholder($admin);
            }
            if (widthChanged) {
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

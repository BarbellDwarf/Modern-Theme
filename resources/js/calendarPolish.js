humhub.module('modernTheme.calendarPolish', function(module, require, $) {

    var observer = null;
    var timer = null;
    var dismissed = false;

    var VIEW_BUTTONS = '.fc-dayGridMonth-button, .fc-timeGridWeek-button, .fc-timeGridDay-button, .fc-listWeek-button';
    var NAV_BUTTONS = '.fc-prev-button, .fc-next-button, .fc-today-button';
    var TODAY_BUTTON = '.fc-today-button';
    var FILTERS_OPEN = 'mt2026-calendar-filters--open';
    var FILTERS_PANEL_ID = 'mt2026-calendar-filters-panel';

    var setPressed = function() {
        $('#calendar').find(VIEW_BUTTONS).each(function() {
            var $button = $(this);
            $button.attr('aria-pressed', $button.hasClass('active') ? 'true' : 'false');
        });

        $('#calendar').find(NAV_BUTTONS).removeAttr('aria-pressed');

        // Icon-only on phones; keep the visible (translated) label as the
        // accessible name.
        var isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) {
            $('#calendar').find(TODAY_BUTTON).each(function() {
                var $button = $(this);
                var label = $.trim($button.text());
                if (label) {
                    $button.attr({ 'aria-label': label, title: label });
                }
            });
        }
    };

    // Count only filters that deviate from the module defaults
    // (My Calendars / All / no "show only" / no event types).
    var countActiveFilters = function($bar) {
        var count = 0;

        if (($bar.find('.calendar-select-view-mode').val() || 'mycalendars') !== 'mycalendars') {
            count++;
        }
        if (($bar.find('.calendar-select-calendars').val() || 'all') !== 'all') {
            count++;
        }
        if ($bar.find('.calendar-select-show').val()) {
            count++;
        }

        var types = $bar.find('.calendar-filter-types select').val();
        if (types && types.length) {
            count++;
        }

        return count;
    };

    var updateFilterCount = function($bar) {
        var count = countActiveFilters($bar);
        var $toggle = $bar.find('.mt2026-calendar-filters__toggle');

        $toggle.find('.mt2026-calendar-filters__count').text(count).toggle(count > 0);
        $toggle.attr('aria-label', count > 0 ? 'Filters, ' + count + ' active' : 'Filters');
    };

    // The filter fields stay exactly where the module rendered them; the toggle
    // only collapses the row they share on phones (see _calendar.scss).
    var setupFilters = function() {
        $('.calendar-filter-bar').each(function() {
            var $bar = $(this);
            $bar.addClass('mt2026-calendar-filters');

            var $panel = $bar.find('.form-search > .d-flex').first();
            if (!$panel.length) {
                return;
            }

            $panel.addClass('mt2026-calendar-filters__panel').attr('id', FILTERS_PANEL_ID);

            if (!$bar.find('.mt2026-calendar-filters__toggle').length) {
                var $toggle = $('<button type="button" class="mt2026-calendar-filters__toggle"></button>')
                    .attr({
                        'aria-expanded': $bar.hasClass(FILTERS_OPEN) ? 'true' : 'false',
                        'aria-controls': FILTERS_PANEL_ID
                    })
                    .append($('<span class="mt2026-calendar-filters__icon" aria-hidden="true"></span>'))
                    .append($('<span></span>').text('Filters'))
                    .append($('<span class="mt2026-calendar-filters__count" aria-hidden="true"></span>').hide());

                $panel.before($toggle);
            }

            updateFilterCount($bar);
        });
    };

    var syncEmptyNotice = function() {
        var $calendar = $('#calendar');
        if (!$calendar.length) {
            return;
        }

        var canCreate = $calendar.attr('data-can-create') === '1';
        var hasEvents = $calendar.find('.fc-event, .fc-list-item').length > 0;
        var $notice = $calendar.find('.mt2026-calendar-empty');

        if (!canCreate || hasEvents) {
            $notice.remove();
            if (hasEvents) {
                dismissed = false;
            }
            return;
        }

        if (dismissed || $notice.length) {
            return;
        }

        var $toolbar = $calendar.find('.fc-toolbar').first();
        if (!$toolbar.length) {
            return;
        }

        var $newNotice = $('<div class="mt2026-calendar-empty"></div>');
        var copy = window.matchMedia && window.matchMedia('(max-width: 767px)').matches
            ? 'No events this month.'
            : 'No events this month. Add one with the + button.';
        $newNotice.append($('<span></span>').text(copy));
        $newNotice.append(
            $('<button type="button" class="mt2026-calendar-empty__dismiss"></button>')
                .attr('aria-label', 'Dismiss')
                .text('×')
        );
        $newNotice.insertAfter($toolbar);
    };

    // "Choose target calendar" opens with Next enabled and an empty picker.
    var setupTargetModal = function() {
        var $modal = $('#globalModal');
        var $form = $modal.find('form[action*="/calendar/global/select"]');

        $modal.toggleClass('mt2026-calendar-target', $form.length > 0);
        if (!$form.length) {
            return;
        }

        var $select = $form.find('select[name="contentContainerId"]');
        var $next = $modal.find('[data-action-click="ui.modal.submit"]').first();

        var sync = function() {
            var chosen = !!($select.val() || '');
            $next.prop('disabled', !chosen).attr('aria-disabled', chosen ? 'false' : 'true');
        };

        $form.off('change.mt2026Target', 'select[name="contentContainerId"]')
            .on('change.mt2026Target', 'select[name="contentContainerId"]', sync);
        sync();
    };

    var run = function() {
        setPressed();
        setupFilters();
        syncEmptyNotice();
    };

    var schedule = function() {
        window.clearTimeout(timer);
        timer = window.setTimeout(run, 100);
    };

    var init = function() {
        var calendar = document.getElementById('calendar');

        $(document).off('.mt2026Calendar')
            .on('click.mt2026Calendar', '.mt2026-calendar-empty__dismiss', function() {
                dismissed = true;
                $(this).closest('.mt2026-calendar-empty').remove();
            })
            .on('click.mt2026Calendar', '.mt2026-calendar-filters__toggle', function() {
                var $bar = $(this).closest('.calendar-filter-bar');
                var open = !$bar.hasClass(FILTERS_OPEN);

                $bar.toggleClass(FILTERS_OPEN, open);
                $(this).attr('aria-expanded', open ? 'true' : 'false');
            })
            .on('change.mt2026Calendar', '.calendar-filter-bar select', function() {
                updateFilterCount($(this).closest('.calendar-filter-bar'));
                schedule();
            })
            .on('keydown.mt2026Calendar', function(event) {
                if (event.key !== 'Escape') {
                    return;
                }

                $('.calendar-filter-bar').removeClass(FILTERS_OPEN)
                    .find('.mt2026-calendar-filters__toggle').attr('aria-expanded', 'false');
            })
            .on('click.mt2026Calendar', '.calendar-filter-reset', schedule)
            .on('click.mt2026Calendar', VIEW_BUTTONS, schedule)
            .on('shown.bs.modal.mt2026Calendar', '#globalModal', setupTargetModal);

        if (!calendar) {
            setupTargetModal();
            return;
        }

        if (window.MutationObserver) {
            observer = new MutationObserver(schedule);
            observer.observe(calendar, { childList: true, subtree: true });
        }

        run();
        setupTargetModal();
    };

    var unload = function() {
        $(document).off('.mt2026Calendar');
        $('#globalModal').removeClass('mt2026-calendar-target');
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.clearTimeout(timer);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

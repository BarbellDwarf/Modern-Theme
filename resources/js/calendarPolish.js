humhub.module('modernTheme.calendarPolish', function(module, require, $) {

    var observer = null;
    var timer = null;
    var dismissed = false;

    var VIEW_BUTTONS = '.fc-dayGridMonth-button, .fc-dayGridWeek-button, .fc-dayGridDay-button, .fc-listWeek-button';
    var NAV_BUTTONS = '.fc-prev-button, .fc-next-button, .fc-today-button';

    var setPressed = function() {
        $('#calendar').find(VIEW_BUTTONS).each(function() {
            var $button = $(this);
            $button.attr('aria-pressed', $button.hasClass('active') ? 'true' : 'false');
        });

        $('#calendar').find(NAV_BUTTONS).removeAttr('aria-pressed');
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
        $newNotice.append($('<span></span>').text('No events this month. Add one with the + button.'));
        $newNotice.append(
            $('<button type="button" class="mt2026-calendar-empty__dismiss"></button>')
                .attr('aria-label', 'Dismiss')
                .text('×')
        );
        $newNotice.insertAfter($toolbar);
    };

    var run = function() {
        setPressed();
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
            .on('click.mt2026Calendar', VIEW_BUTTONS, schedule);

        if (!calendar) {
            return;
        }

        if (window.MutationObserver) {
            observer = new MutationObserver(schedule);
            observer.observe(calendar, { childList: true, subtree: true });
        }

        run();
    };

    var unload = function() {
        $(document).off('.mt2026Calendar');
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.clearTimeout(timer);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

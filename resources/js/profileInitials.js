humhub.module('modernTheme.profileInitials', function(module, require, $) {

    var initialsFor = function(name) {
        var words = $.trim(name || '').split(/\s+/);
        var filtered = [];
        for (var i = 0; i < words.length; i++) {
            if (/[A-Za-z0-9]/.test(words[i])) {
                filtered.push(words[i]);
            }
        }

        if (!filtered.length) {
            return '';
        }

        var first = filtered[0].charAt(0);
        var last = filtered.length > 1 ? filtered[filtered.length - 1].charAt(0) : '';
        return (first + last).toUpperCase();
    };

    var init = function() {
        $('.profile-user-photo-container img[src*="default_user"]').each(function() {
            var $image = $(this);
            var $container = $image.closest('.profile-user-photo-container');

            if (!$container.length || $container.hasClass('mt2026-has-initials')) {
                return;
            }

            var name = $.trim($container.closest('.panel-profile-header').find('.img-profile-data h1').first().text());
            if (!name) {
                name = $image.attr('alt') || '';
            }

            var initials = initialsFor(name);
            if (!initials) {
                return;
            }

            $container.addClass('mt2026-has-initials');
            $container.append($('<span class="mt2026-profile-initials" aria-hidden="true"></span>').text(initials));
        });
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});

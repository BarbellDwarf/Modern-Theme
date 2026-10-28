humhub.module('modernTheme.mobileHeader', function(module, require, $) {

    'use strict';

    var markHeaderExtras = function() {
        var $notifications = $('#topbar .notifications');
        if (!$notifications.length) {
            return;
        }

        var $groups = $notifications.children();

        var $mail = $groups.filter(function() {
            return $(this).find('#icon-messages, a[href*="/mail"], .fa-envelope').length > 0;
        });

        var $dark = $groups.filter(function() {
            return $(this).hasClass('dark-mode')
                || $(this).find('[data-action-click*="dark-mode"], a[href*="/dark-mode"]').length > 0;
        });

        $mail.add($dark).addClass('mt2026-header-extra');

        return {mail: $mail, dark: $dark};
    };

    var addAccountExtras = function(extras) {
        if (!extras) {
            return;
        }

        var $menu = $('#topbar .dropdown.account .dropdown-menu').first();
        if (!$menu.length || $menu.data('mt2026Extras')) {
            return;
        }

        var $items = $();

        var mailHref = extras.mail.find('#dropdown-messages a[href]').last().attr('href');
        if (!mailHref || mailHref === '#') {
            mailHref = extras.mail.find('a[href*="/mail"]').last().attr('href');
        }

        if (mailHref && mailHref !== '#') {
            var mailLabel = $.trim(extras.mail.find('#icon-messages').attr('aria-label') || 'Messages');
            $items = $items.add(
                $('<li class="mt2026-account-extra"></li>').append(
                    $('<a class="dropdown-item" href=""></a>')
                        .attr('href', mailHref)
                        .append($('<i class="fa fa-envelope" aria-hidden="true"></i>'))
                        .append(document.createTextNode(' ' + mailLabel))
                )
            );
        }

        var $darkLinks = extras.dark.find('.dropdown-menu a[data-action-click]');
        if ($darkLinks.length) {
            $items = $items.add('<li class="mt2026-account-extra"><hr class="dropdown-divider"></li>');

            $darkLinks.each(function() {
                var $source = $(this);
                var $clone = $source.clone();
                var mode = $source.attr('data-mode');

                $clone.removeClass('active');
                $clone.addClass('mt2026-account-extra');
                if (!$clone.find('i').length) {
                    var icon = mode === 'light' ? 'fa-sun-o' : (mode === 'dark' ? 'fa-moon-o' : 'fa-adjust');
                    $clone.prepend($('<i class="fa ' + icon + '" aria-hidden="true"></i>'));
                }
                $items = $items.add($clone);
            });

            $items = $items.add('<li class="mt2026-account-extra"><hr class="dropdown-divider"></li>');
        }

        if (!$items.length) {
            return;
        }

        var $firstDivider = $menu.children('.dropdown-divider').first();
        if ($firstDivider.length) {
            $firstDivider.before($items);
        } else {
            $menu.append($items);
        }

        $menu.data('mt2026Extras', true);
    };

    var syncAppearanceState = function() {
        var theme = document.documentElement.getAttribute('data-bs-theme');
        var activeMode = theme === 'dark' ? 'dark' : (theme === 'light' ? 'light' : 'default');

        $('.mt2026-account-extra[data-mode]').each(function() {
            $(this).toggleClass('active', $(this).attr('data-mode') === activeMode);
        });
    };

    var setupFormattingToggles = function() {
        $('#contentFormBody, .content-form-body').each(function() {
            var $form = $(this);

            if ($form.data('mt2026Formatting')) {
                return;
            }

            var $footer = $form.find('.contentForm_options .btn_container').first();
            if (!$footer.length || !$form.find('.ProseMirror-menubar').length) {
                return;
            }

            $footer.prepend(
                '<button type="button" class="mt2026-formatting-toggle" aria-expanded="false"></button>'
            );
            $footer.find('.mt2026-formatting-toggle').text('Formatting');

            $form.data('mt2026Formatting', true);
        });
    };

    var fixBannerAttribute = function() {
        // HumHub 1.19 passes ['width => 100%'] to Html::img, which renders an
        // invalid 0="width => 100%" attribute instead of a width. Drop it and
        // apply the intended width without touching core.
        $('.profile-banner-image-container > img.img-profile-header-background').each(function() {
            if (this.hasAttribute && this.hasAttribute('0')) {
                this.removeAttribute('0');
                this.style.width = '100%';
            }
        });
    };

    var fixMissingAlt = function() {
        // Decorative header/profile avatars: the name is always adjacent text.
        // One core-rendered image ships without an alt attribute.
        $('#topbar img:not([alt]), .panel-profile img:not([alt]), .mobile-bottom-nav img:not([alt])')
            .attr('alt', '');
    };

    var init = function() {
        fixBannerAttribute();
        fixMissingAlt();

        var extras = markHeaderExtras();
        addAccountExtras(extras);
        syncAppearanceState();

        setupFormattingToggles();
    };

    var unload = function() {
        $(document).off('.mt2026MobileHeader');
    };

    $(document)
        .off('click.mt2026MobileHeader', '.mt2026-formatting-toggle')
        .on('click.mt2026MobileHeader', '.mt2026-formatting-toggle', function() {
            var $button = $(this);
            var $form = $button.closest('#contentFormBody, .content-form-body');
            var open = !$form.hasClass('mt2026-formatting-open');

            $form.toggleClass('mt2026-formatting-open', open);
            $button.attr('aria-expanded', open ? 'true' : 'false');
        })
        .off('click.mt2026MobileHeader', '.mt2026-account-extra[data-mode]')
        .on('click.mt2026MobileHeader', '.mt2026-account-extra[data-mode]', function() {
            var mode = $(this).attr('data-mode');

            $('.mt2026-account-extra[data-mode]').removeClass('active');
            $(this).addClass('active');

            // The dark-mode module updates <html data-bs-theme>; mirror it once
            // its handler has run.
            window.setTimeout(syncAppearanceState, 50);
            if (mode === 'default') {
                window.setTimeout(syncAppearanceState, 300);
            }
        });

    module.initOnPjaxLoad = true;
    module.export({
        init: init,
        unload: unload
    });
});

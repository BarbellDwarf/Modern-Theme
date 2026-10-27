humhub.module('modernTheme.spacePolish', function(module, require, $) {

    var client = require('client');
    var status = require('ui.status');
    var EVENT_NS = '.mt2026SpacePolish';
    var observer = null;
    var syncTimer = null;

    var syncJoinCta = function() {
        var $cta = $('[data-mt2026-join-cta]');
        if (!$cta.length) {
            return;
        }

        var $stream = $('#wallStream');
        var isEmpty = $stream.find('.streamMessage').length > 0;
        var hasEntries = $stream.find('[data-stream-content] .wall-entry').length > 0;
        var show = hasEntries && !isEmpty;

        if (show) {
            $cta.removeAttr('hidden');
        } else {
            $cta.attr('hidden', 'hidden');
        }
        $cta.toggle(show);
    };

    var scheduleSync = function() {
        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(function() {
            syncJoinCta();
            setLabels();
        }, 120);
    };

    var setLabels = function() {
        // Core renders the space/profile banner through Html::img with no alt.
        // It is a decorative backdrop, so an empty alt is the correct label.
        $('img.img-profile-header-background').each(function() {
            if (!this.hasAttribute('alt')) {
                this.setAttribute('alt', '');
            }
        });

        $('.preferences .dropdown-toggle').each(function() {
            var $toggle = $(this);
            if ($toggle.attr('aria-label') !== 'Toggle stream entry menu') {
                return;
            }
            if (!$toggle.attr('title')) {
                $toggle.attr('title', 'Post options');
            }
            $toggle.attr('aria-label', 'Post options');
        });

        $('#space-header-controls-menu').find('a.dropdown-toggle, > a').each(function() {
            var $toggle = $(this);
            var label = $toggle.attr('aria-label');
            if (!$toggle.attr('title')) {
                $toggle.attr('title', 'Space settings');
            }
            if (!label || label === 'Actions' || label === 'Space actions') {
                $toggle.attr('aria-label', 'Space settings');
            }
        });

        $('.mt2026-space-join-btn').each(function() {
            var $button = $(this);
            if (!$button.attr('aria-label') && String($button.attr('data-method')).toLowerCase() === 'post') {
                $button.attr('aria-label', 'Join this space');
            }
        });
    };

    var joinSpace = function(event) {
        var link = event.target && event.target.closest
            ? event.target.closest('a.mt2026-space-join-btn[data-method]')
            : null;
        if (!link || String(link.getAttribute('data-method')).toLowerCase() !== 'post' || link.getAttribute('aria-busy') === 'true') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        var $link = $(link);
        var originalText = $link.text();

        $link.attr('aria-busy', 'true').addClass('disabled').text('Joining…');

        client.post(link.getAttribute('href'), {}).then(function() {
            status.success('You joined the space');
            window.setTimeout(function() {
                client.reload();
            }, 700);
        }).catch(function() {
            $link.removeAttr('aria-busy').removeClass('disabled').text(originalText);
            status.error('Could not join the space. Please try again.');
        });
    };

    var init = function() {
        document.addEventListener('click', joinSpace, true);
        $(document).off(EVENT_NS).on('humhub:content:newEntry' + EVENT_NS + ' humhub:stream:afterLoad' + EVENT_NS, scheduleSync);

        var stream = document.getElementById('wallStream');
        if (stream && window.MutationObserver) {
            observer = new MutationObserver(scheduleSync);
            observer.observe(stream, { childList: true, subtree: true });
        }

        setLabels();
        syncJoinCta();
    };

    var unload = function() {
        document.removeEventListener('click', joinSpace, true);
        $(document).off(EVENT_NS);
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.clearTimeout(syncTimer);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

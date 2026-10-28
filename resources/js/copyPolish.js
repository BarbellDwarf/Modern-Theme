humhub.module('modernTheme.copyPolish', function(module, require, $) {

    var observer = null;
    var timer = null;

    var normaliseComments = function() {
        $('.comment-count').each(function() {
            var $count = $(this);
            var count = parseInt($count.attr('data-count'), 10) || 0;
            var label = count > 1 ? 'Comments' : 'Comment';

            $count.parent().contents().each(function() {
                if (this.nodeType === 3) {
                    this.nodeValue = this.nodeValue.replace(/\bComments?\b/g, label);
                }
            });

            if (count > 1) {
                // Plain space: the pill is inline-block, so a normal space
                // collapses into the label and still cannot wrap.
                $count.text(' (' + count + ')').show();
            } else {
                $count.hide();
            }
        });

        $('.showMore a').each(function() {
            var $link = $(this);
            var text = $.trim($link.text());
            var match = /^Show previous (\d+) comments?$/.exec(text);
            if (match) {
                $link.text('Show ' + match[1] + ' earlier comment' + (match[1] === '1' ? '' : 's'));
            }
        });
    };

    var normaliseCounters = function() {
        $('.statistics .entry').each(function() {
            var $entry = $(this);
            var count = parseInt($.trim($entry.find('.count').first().text()), 10);
            var $title = $entry.find('.title').first();

            // Number and label are separate nodes with a <br> between them, so
            // normalise the label node instead of the entry's text.
            if (isNaN(count) || !$title.length) {
                return;
            }

            var label = $.trim($title.text()).toLowerCase();
            if (label !== 'post' && label !== 'posts') {
                return;
            }

            $title.text(count === 1 ? 'post' : 'posts');
        });
    };

    // A subtitle that only repeats the title ("Test" / "TEST - Grace") is noise.
    var normaliseIdentity = function() {
        $('.panel-profile .img-profile-data').each(function() {
            var $data = $(this);
            var title = $.trim($data.find('h1').first().text()).toLowerCase();
            var $subtitle = $data.find('h2').first();

            if (!title || !$subtitle.length) {
                return;
            }

            if ($.trim($subtitle.text()).toLowerCase().indexOf(title) === 0) {
                $subtitle.hide();
            }
        });
    };

    // When a post is authored by the space itself, the byline repeats the name.
    var normaliseBylines = function() {
        $('.wall-entry h4 .viaLink').each(function() {
            var $via = $(this);
            var author = $.trim($via.parent().find('a').first().text()).toLowerCase();
            var space = $.trim($via.text()).toLowerCase();

            if (author && space && author === space) {
                $via.hide();
            }
        });
    };

    // Core prints a short date in the title with a dash separator. Use one
    // fixed format for the tooltip and the accessible label.
    var normaliseTimes = function() {
        $('time.timeago[datetime]').each(function() {
            var date = new Date(this.getAttribute('datetime'));
            if (isNaN(date.getTime())) {
                return;
            }

            var label = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });

            this.setAttribute('title', label);
            this.setAttribute('aria-label', label);
        });
    };

    // Guide/checklist entries render a completed-looking check-circle that
    // reads as status rather than a link. Swap for a chevron so they read as
    // navigable items. (Work package 34 C2)
    var normaliseGuideIcons = function() {
        $('.list-group .fa-check-circle, .panel .list-group .fa-check-circle').removeClass('fa-check-circle').addClass('fa-chevron-right');
    };

    var run = function() {
        normaliseComments();
        normaliseCounters();
        normaliseIdentity();
        normaliseBylines();
        normaliseTimes();
        normaliseGuideIcons();
    };

    var schedule = function() {
        window.clearTimeout(timer);
        timer = window.setTimeout(run, 100);
    };

    var init = function() {
        run();

        if (window.MutationObserver) {
            observer = new MutationObserver(schedule);
            $('#wallStream, .panel-profile-controls').each(function() {
                observer.observe(this, { childList: true, subtree: true });
            });
        }
    };

    var unload = function() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.clearTimeout(timer);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});

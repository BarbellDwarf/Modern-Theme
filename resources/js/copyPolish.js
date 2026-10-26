humhub.module('modernTheme.copyPolish', function(module, require, $) {

    var observer = null;
    var timer = null;

    var normaliseComments = function() {
        $('.comment-count').each(function() {
            var $count = $(this);
            var count = parseInt($count.attr('data-count'), 10) || 0;
            var label = count > 1 ? 'Comments' : 'Comment';

            $count.parent().contents().each(function() {
                if (this.nodeType === 3 && /Comment(s)?\s*$/.test(this.nodeValue)) {
                    this.nodeValue = this.nodeValue.replace(/Comment(s)?\s*$/, label);
                    return false;
                }
            });

            if (count > 1) {
                $count.show();
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
            var count = $.trim($entry.find('.count').first().text());
            var $title = $entry.find('.title').first();
            if (count === '1' && $.trim($title.text()) === 'Posts') {
                $title.text('post');
            }
        });
    };

    var run = function() {
        normaliseComments();
        normaliseCounters();
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

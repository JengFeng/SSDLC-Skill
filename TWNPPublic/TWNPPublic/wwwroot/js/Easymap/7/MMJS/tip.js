//example:
/*
    MM.tip.show('.js-dropdown0', 'hover-demo', 'right center');

    MM.tip.hover('.js-dropdown', 'hover-demo');
    MM.tip.click('.js-dropdown1', '中文測試', 'bottom center');
    MM.tip.click('.red', '中文測試', 'top center', 'red');
    MM.tip.click('.black', '中文測試中文測試中文測試中文測試中文測試中文測試中文測試中文測試中文<br/>測試中文測試中文測試中文測試', 'top center', 'black');
    MM.tip.click('.blue', '中文測試', 'top center', 'blue');
    MM.tip.click('.green', '中文測試', 'top center', 'green');
    MM.tip.click('.yellow', '中文測試', 'top center', 'yellow');
    MM.tip.click('.pink', '中文測試', 'top center', 'pink');
    MM.tip.ajax('#tt', "mmjs-ajax.html", 'bottom center','red');
*/
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "tip.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');
    if (src == null) continue;
    if (src.toLowerCase().indexOf("mmjs") < 0) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}

//from ==>http://artjock.github.io/fly/
//refer ==>http://projects.nickstakenburg.com/tipped
document.write('<link href="' + l + 'plugin/fly/css/popover.css" rel="stylesheet" type="text/css"/>');
//document.write('<link href="http://artjock.github.io/fly/index.css" rel="stylesheet" type="text/css"/>');
if (!window.jQuery){
    document.write('<script src="' + l + 'plugin/jquery.js"></script>');
}
document.write('<script src="' + l + 'plugin/fly/fly.full.js"></script>');

(function (MM) {
    MM.tip = {};
    MM.tip.show = function (selector, content, position,theme) {
        MM.tip.hover(selector, content, position, theme);
        $(selector).flytooltip('instance').show();
    }
    MM.tip.hide = function (selector, content, position, theme) {
        MM.tip.hover(selector, content, position, theme);
        $(selector).flytooltip('instance').hide();
    }
    MM.tip.destroy = function (selector) {
        if ($(selector).flytooltip('instance')._destroy != undefined) {
            $(selector).flytooltip('instance')._destroy();
        }
        
    }
    MM.tip.hover = function (selector,content,position,theme) {
        if (position === undefined) {
            position = "top center";
        }
        if (content == undefined || content == null || content == '') {
            content = $(selector).prop('mm-title');
        }
        $(selector).flytooltip({
            content: content,
            position: position,
            theme: theme
        });

    }
    MM.tip.click = function (selector, content, position, theme) {
        if (position === undefined) {
            position = "top center";
        }
        $(selector).dropdown({
            content: content,
            position: position,
            theme:theme
        });
    }
    //關閉 tip: 
    //  $('.fly-popover').addClass('fly-popover--hidden')
    MM.tip.ajax = function (selector, url, position, theme, options) {
        var closable = false;
        if (options != undefined) {
            if (options.closable != undefined) closable = options.closable;
        }
        $(selector).ajax({
            url: url,
            position: position,
            theme: theme,
            closable:closable
        });
    }
    MM.tip.ajaxHover = function (selector, url, position, theme, options) {

        $(selector).ajaxHover({
            url: url,
            position: position,
            theme: theme,
            hideDelay: 200
        });
    }
})(MM);




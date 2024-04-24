//from ==>https://notifyjs.com/
//example:
/*
    MM.notify.info('大家好，我是 info');
    MM.notify.success('大家好，我是 success');
    MM.notify.warn('大家好，我是 warn');
    MM.notify.error('大家好，我是 error');

    MM.notify.info('大家好，我是 info', 'top center');
*/
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "notify.js" + ")(\\?|$)"),
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



document.write('<link href="' + l + 'plugin/notify/style.css" rel="stylesheet" type="text/css"/>');
if (!window.jQuery) {
    document.write('<script src="' + l + 'plugin/jquery.js"></script>');
}
document.write('<script src="' + l + 'plugin/notify/notify.js"></script>');

(function (MM) {
    MM.notify = {};

    MM.notify.info = function (content,position) {
        $.notify(content, {
            className: "info",
            globalPosition: position
        });
    }
    MM.notify.success = function (content, position) {
        $.notify(content, {
            className: "success",
            globalPosition: position
        });
    }
    MM.notify.warn = function (content, position) {
        $.notify(content, {
            className: "warn",
            globalPosition: position
        });
    }
    MM.notify.error = function (content, position) {
        $.notify(content, {
            className: "error",
            globalPosition: position
        });
    }
})(MM);




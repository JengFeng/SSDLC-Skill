//office website: http://www.jqueryrain.com/?E9cX7DiW
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "mmalert.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');
    if (src) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}

document.write('<link href="' + l + 'jAlert/jAlert.css" rel="stylesheet" type="text/css"/>');
document.write('<script src="' + l + 'jAlert/jAlert.js"></script>');



(function (MM) {

    MM.alert = function (title, msg) {
        $.fn.jAlert.defaults.theme = 'gray';
        if (typeof msg == 'undefined') {
            msg = title;
            title = '';
        }
        $.jAlert({
            'title': title,
            'content': msg
        });
    }
    MM.confirm = function (confirmCallback, denyCallback) {
        $.fn.jAlert.defaults.theme = 'gray';
        $.jAlert({
            'type': 'confirm',
            'onConfirm': confirmCallback,
            'onDeny': denyCallback
        });
    }
})(MM);




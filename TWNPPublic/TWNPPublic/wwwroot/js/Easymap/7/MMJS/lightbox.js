//office website: http://www.jqueryrain.com/?E9cX7DiW
/*
    examples: 
            
            MM.alert('title','content','red');

            MM.confirm(function(){
                console.log('ok');
            },function(){
                console.log('not ok');
            },'blue');
*/
//updated: 2016/10/24
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "lightbox.js" + ")(\\?|$)"),
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

document.write('<link href="' + l + 'plugin/jAlert/jAlert.min.css" rel="stylesheet" type="text/css"/>');
if (!window.jQuery) {
    document.write('<script src="' + l + 'plugin/jAlert/jquery.js"></script>');
}
var myNav = navigator.userAgent.toLowerCase();
var v = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
if (v != 8) {
    document.write('<script src="' + l + 'plugin/jAlert/jAlert.min.js"></script>');
}
(function (MM) {
    if (MM._inner == undefined)
        MM._inner = {}
    MM._inner.alert_instance = null;
    MM.alert = function (title, msg, theme, options) {

        if (MM.isIE8() == true) {
            alert(title + '\n\r' + msg);
            return;
        }

        if (theme == undefined) {
            theme = 'blue';
        }
        $.fn.jAlert.defaults.theme = theme;
        if (typeof msg == 'undefined') {
            msg = title + "";
            title = '';
        }
        MM._inner.alert_instance = $.jAlert({
            'title': title,
            'content': msg,
            'closeOnEsc': true,
            'btns': [
                        { 'text': '<span style="font-family: Microsoft JhengHei;">關閉</span>', 'theme': theme }
            ]
        });
    }
    MM.alertClose = function () {
        MM._inner.alert_instance.closeAlert();
    }
    MM.confirm = function (title, msg, confirmCallback, denyCallback, theme, options) {

        if (theme == undefined) {
            $.fn.jAlert.defaults.theme = 'blue';
        } else {
            $.fn.jAlert.defaults.theme = theme;
        }

        if (typeof msg == 'undefined' || msg == null) {
            msg = title + "";
            title = '';
        }
        $.jAlert({
            'type': 'confirm',
            'title': title,
            'content': msg,
            'onConfirm': confirmCallback,
            'onDeny': denyCallback
        });
    }
    MM.prompt = function (title, confirmCallback, theme,value) {

        if (theme == undefined) {
            $.fn.jAlert.defaults.theme = 'blue';
            theme = 'blue';
        } else {
            $.fn.jAlert.defaults.theme = theme;
        }
        if (value === undefined) value = "";
        var html = '<input id="MMJS_PROMPT" type="text" value="' + value+'" style="width:100%" name="email" onkeypress="MM._promptEnter(event);">';

        $.jAlert({
            'title': title,
            'content': html,
            'onOpen': function (alert) {

            },
            'autofocus': 'input[name="email"]',
            'btns': [
                /* Add a save button */
                {
                    'text': '確認', 'theme': theme, 'closeAlert': true, 'onClick': function (e) {

                        if (event != undefined)
                            event.preventDefault();

                        var btn = $('#' + this.id),
                          alert = btn.parents('.jAlert'),
                          value = alert.find('#MMJS_PROMPT').val();

                        confirmCallback(value);
                        return false;
                    }
                },
          {
              'text': '取消'
          }
            ]
        });

    }

    MM.isIE8 = function () {
        var myNav = navigator.userAgent.toLowerCase();
        var v = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;

        if (v == 8) {
            return true;
        } else {
            return false;
        }
    }
    MM._promptEnter = function (e) {
        if (e.keyCode == 13) {
            $('.ja_btn_blue').trigger('click');
            
        }
        return false;
    }
})(MM);




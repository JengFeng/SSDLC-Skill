//office website: https://craftpip.github.io/jquery-confirm/
/*
    examples: 
            MM.dialog.fullscreen('title','content');//全螢幕 html
            MM.dialog.iframeFullscreen('','http://rex');//全螢幕 iframe
            MM.dialog.clse();//關視窗

*/
//updated: 2019/08/22 
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "dialog.js" + ")(\\?|$)"),
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

document.write('<script src="' + l + 'plugin/jquery-confirm/confirm.js"></script>');
document.write('<link href="' + l + 'plugin/jquery-confirm/style.css" rel="stylesheet" type="text/css"/>');

(function (MM) {
    
    MM.dialog = {};
    MM.dialog._instance = null;
    MM.dialog.close = function () {
        if (MM.dialog._instance != null) {
            MM.dialog._instance.close();
        }
        
    }
    MM.dialog.fullscreen = function (title, content) {

        MM.dialog._instance = $.dialog({
            boxWidth: '95%',
            useBootstrap: false,
            title: title,
            content: content,
            animation: 'zoom',
            closeAnimation: 'top',
            onContentReady: function () {
                var h = $('body').height();
                $('#mm-popup-fullscreen').height(h);
            }
        });
    }
    MM.dialog.iframeFullscreen = function (title,url) {

        if (url == undefined) return;

        var h = $('body').height();

        MM.dialog._instance = $.dialog({
            boxWidth: '98%',
            useBootstrap: false,
            title: title,
            content: '<iframe id="mm-popup-fullscreen" src="'+url+'" height="'+h+'px" width="100%" frameborder="0" scrolling="yes"></iframe>',
            animation: 'zoom',
            closeAnimation: 'top',
            onContentReady: function () {
                $('#mm-popup-fullscreen').height($('.jconfirm-content-pane').height())
            }
        });
    }

})(MM);




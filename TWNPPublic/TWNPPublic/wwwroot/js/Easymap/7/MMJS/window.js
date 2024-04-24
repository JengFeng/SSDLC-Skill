// office website: https://jspanel.de/api.html#options/overview
/*
    examples: 

jsPanel.create({
            id: 'dragInfo_0',
            theme: 'default',               // default|primary|secondary|info|success|warning|danger|light|dark|none
            headerTitle: '視窗標題',
            position: 'center-top 0 58',    // (width height)
            contentSize: '450 250',         // (width height)
            content: '<span>視窗內容</span>',
            callback: function(){console.log('點擊後之事件')},
            onbeforeclose: function(){console.log('關閉視窗前之事件')},
            onclosed: function(){console.log('關閉視窗之事件')},
            dragit: {
                start: function(){console.log('拖曳視窗開始之事件')},
                stop: function(){console.log('拖曳視窗結束之事件')},
                drag: function(){console.log('拖曳視窗間之事件')},
            },
            resizeit: {
                start: null,    function(){console.log('改變視窗大小開始之事件')},
                stop: null,     function(){console.log('改變視窗大小結束之事件')},
                resize: resize  function(){console.log('改變視窗大小間之事件')},
            },
            headerControls: {
                size:'sm',
                minimize: 'remove',
                smallify: 'remove'
            }
        });
*/
// updated: 2016/10/24
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "window.js" + ")(\\?|$)"),
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

document.write('<link href="' + l + 'plugin/jspanel-4.7.0/jspanel.css" rel="stylesheet" type="text/css"/>');
document.write('<link href="' + l + 'plugin/jspanel-4.7.0/theme-base.css" rel="stylesheet" type="text/css"/>');
document.write('<script src="' + l + 'plugin/jspanel-4.7.0/jspanel.js"></script>');
document.write('<script src="' + l + 'plugin/jspanel-4.7.0/extensions/modal/jspanel.modal.min.js"></script>');

(function (MM) {
    
    MM.window = {};
    MM.window.get = function (id) {
        return document.querySelector('#' + id);//document.querySelector(selector).setTheme('warning')
    }
    MM.window.create = function (id, title, content, size, position, theme, callback, onbeforeclose, onclosed, drag, resize) {

        if (MM.window.get(id) != undefined) {
            MM.window.get(id).close()
        }

        if (size == undefined) size = '450 250';
        if (position == undefined) position = 'center-top 0 10';
        if (theme == undefined) theme = 'dark';
        if (callback == undefined) callback = null;
        if (onbeforeclose == undefined) onbeforeclose = null;
        if (onclosed == undefined) onclosed = null;
        if (drag == undefined) drag = null;
        if (resize == undefined) resize = null;
        return jsPanel.create({
            id: id,
            theme: theme,       // default|primary|secondary|info|success|warning|danger|light|dark|none
            headerTitle: title,
            position: position, // 'center-top 0 58'
            contentSize: size,  // '450 250'(width height)
            content: content,   // '<p>Example panel ...</p>'
            callback: callback,
            onbeforeclose: onbeforeclose,   // callback
            onclosed: onclosed,             // callback
            dragit: {
                start: null,    // callback
                stop: null,     // callback
                drag: drag      // callback
            },
            resizeit: {
                start: null,    // callback
                stop: null,     // callback
                resize: resize  // callback
            },
            headerControls: {
                size:'sm',
                minimize: 'remove',
                smallify: 'remove'
            }
        });
    }
    MM.window.modal = function (id, title, content, size, position, theme, callback, onbeforeclose, onclosed, drag, resize){

        if (MM.window.get(id) != undefined) {
            MM.window.get(id).close()
        }

        if (size == undefined) size = '450 250';
        if (position == undefined) position = 'center-top 0 10';
        if (theme == undefined) theme = 'dark';
        if (callback == undefined) callback = null;
        if (onbeforeclose == undefined) onbeforeclose = null;
        if (onclosed == undefined) onclosed = null;
        if (drag == undefined) drag = null;
        if (resize == undefined) resize = null;

        jsPanel.modal.create({
            id: id,
            theme: theme,       // default|primary|secondary|info|success|warning|danger|light|dark|none
            headerTitle: title,
            position: position, // 'center-top 0 58'
            contentSize: size,  // '450 250'(width height)
            content: content,   // '<p>Example panel ...</p>'
            callback: callback,
            onbeforeclose: onbeforeclose,   // callback
            onclosed: onclosed,             // callback
            dragit: {
                start: null,    // callback
                stop: null,     // callback
                drag: drag      // callback
            },
            resizeit: {
                start: null,    // callback
                stop: null,     // callback
                resize: resize  // callback
            },
            headerControls: {
                size: 'sm',
                minimize: 'remove',
                smallify: 'remove'
            },
            closeOnBackdrop: false
        });
    }
})(MM);




/***************************************************************
 * 取得相對路徑
 ***************************************************************/
var r = new RegExp("(^|(.*?\\/))(" + "coordinate.js" + ")(\\?|$)"),
	s = document.getElementsByTagName('script'),
	src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');

    if (src == null) continue;
    if (src.toLowerCase().indexOf("js") < 0) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}

/**************************************************
	sectref 插件 - 地段地號查詢


***************************************************/
if (coordinate == null) {
    var coordinate = {};
}
coordinate.name = "坐標查詢";
coordinate.path = l;

//是否要zoom到圖台的位置，再查詢的時候
coordinate.is_zoom_map = true;

//預設到哪個zoom，>= default_zoom的時候就不變
coordinate.default_zoom = 14;

//mmjs 
document.write('<script src="' + coordinate.path + 'mmjs/math.js"></script>');

//jquery
document.write('<script src="' + coordinate.path + 'jquery.js"></script>');

//style
document.write('<link href="' + coordinate.path + 'style.css" rel="stylesheet" type="text/css"/>');

//coordTrans
document.write('<script src="' + coordinate.path + 'coordTrans.js"></script>');

//kernel
document.write('<script src="' + coordinate.path + 'kernel.js"></script>');

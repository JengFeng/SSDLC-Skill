
/**************************************************
	easymap 插件 - painter
    version: 1.0
    用法:
        
    
***************************************************/
var r = new RegExp("(^|(.*?\\/))(" + "Painter.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');

    if (src == null) continue;
    if (src.toLowerCase().indexOf("easymap_plus") < 0) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}

if (ezmapplus == null) {
    var ezmapplus = {};
}

ezmapplus.path = l;
ezmapplus.root = ezmapplus.path.substring(0, ezmapplus.path.toLocaleLowerCase().indexOf('modules'));
ezmapplus.mmjspath = ezmapplus.root + 'js/MMJS/';
//ezmapplus.uploadfile = ezmapplus.root + 'uploadfile/Easymap_plus/Painter/';

ezmapplus.painter = {};

//painter的目錄
ezmapplus.painter.path = ezmapplus.path+"Painter/";


ezmapplus.painter.iconSize = [40, 40];

ezmapplus.painter.onSelectEdit = null;//選擇編輯的事件

document.write('<link rel="stylesheet" href="' + ezmapplus.painter.path + 'minicolors/jquery.minicolors.css" />');
document.write('<link rel="stylesheet" href="' + ezmapplus.painter.path + 'css/ionicons.css" />');//歷史紀錄圖片


//# mmjs
document.write('<script src="' + ezmapplus.mmjspath + 'base.js"></script>');
document.write('<script src="' + ezmapplus.mmjspath + 'utility.js"></script>');
document.write('<script src="' + ezmapplus.mmjspath + 'notify.js"></script>');
document.write('<script src="' + ezmapplus.mmjspath + 'tip.js"></script>');
document.write('<script src="' + ezmapplus.mmjspath + 'mmeasymap.js"></script>');
//# dom-to-img
document.write('<script src="' + ezmapplus.painter.path + 'dom-to-image.min.js"></script>');

//# 主程式
//document.write('<link href="' + ezmapplus.painter.path + 'Painter/style.css" rel="stylesheet" type="text/css" media="screen">');
document.write('<script src="' + ezmapplus.painter.path + 'kernel.js"></script>');

//MiniColors  Jquery之後引入
document.write('<script src="' + ezmapplus.painter.path + 'minicolors/jquery.minicolors.js"></script>');


if (__ES6Support() == true) {
    document.write('<script src="' + ezmapplus.painter.path + 'Tool/Polyline.js"></script>');
    document.write('<script src="' + ezmapplus.painter.path + 'Tool/Polygon.js"></script>');
    document.write('<script src="' + ezmapplus.painter.path + 'Tool/Text.js"></script>');
    document.write('<script src="' + ezmapplus.painter.path + 'Tool/Draw.js"></script>');
    document.write('<script src="' + ezmapplus.painter.path + 'Tool/Marker.js"></script>');
    document.write('<script src="' + ezmapplus.painter.path + 'Tool/CityTown.js"></script>');
} else {
    //document.write('<script src="' + ezmapplus.painter.path + 'Tool-IE/Polyline.js"></script>');
    //document.write('<script src="' + ezmapplus.painter.path + 'Tool-IE/Polygon.js"></script>');
    //document.write('<script src="' + ezmapplus.painter.path + 'Tool-IE/Text.js"></script>');
    //document.write('<script src="' + ezmapplus.painter.path + 'Tool-IE/Draw.js"></script>');
    document.write('<script src="' + ezmapplus.painter.path + 'Tool-IE/Marker.js"></script>');
}
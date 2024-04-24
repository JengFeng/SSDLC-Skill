
/**************************************************
	easymap 插件 - googlestreet
    version: 1.0
    last updated: 2016/04/06

**************************************************/

/**************************************************
 * 取得相對路徑
 *************************************************/
var r = new RegExp("(^|(.*?\\/))(" + "GoogleStreet.js" + ")(\\?|$)"),
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

if (ezmapplus == undefined) {
    var ezmapplus = {};
}
if (ezmapplus.GoogleStreet == undefined) {
    ezmapplus.GoogleStreet = {};
}
if (ezmapplus.GoogleStreet.icon == undefined) {
    ezmapplus.GoogleStreet.icon = {};
}

//### private==================
//# 外掛路徑
ezmapplus.GoogleStreet.path = l + 'GoogleStreet/';

//# easymap 圖台相關
ezmapplus.GoogleStreet.map = null;

//### public =======================


//# 主程式
document.write('<script src="' + ezmapplus.GoogleStreet.path + 'kernel.js"></script>');

//document.write('<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBSPl5ttQZTRswVnmIbL1BlPZ-UZpvFdhc&callback=initialize"></script>');


/**************************************************
	easymap 插件 - 測量加上identify
    version: 1.0
    last updated: 2016/04/06

    設定
    Step 1:
    <!--GISMM:GPS-->
    <script>
        if(ezmapplus == undefined) var ezmapplus = {};
        ezmapplus.GPS = {};
        ezmapplus.GPS.icon = {};
        ezmapplus.GPS.icon.left = "";
        ezmapplus.GPS.icon.top = "";
        ezmapplus.GPS.icon.right = "10px";
        ezmapplus.GPS.icon.bottom = "50px";
        ezmapplus.GPS.icon_width = 52;
        ezmapplus.GPS.icon_height = 52;
    </script>
    <script src="modules/Easymap_plus/GPS.js"></script>

    Step 2:
    <script>
        // GPS
        ezmapplus.GPS.start(map);
    </script>
**************************************************/

/**************************************************
 * 取得相對路徑
 *************************************************/
var r = new RegExp("(^|(.*?\\/))(" + "GPS.js" + ")(\\?|$)"),
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
if (ezmapplus.GPS == undefined) {
    ezmapplus.GPS = {};
}
if (ezmapplus.GPS.icon == undefined) {
    ezmapplus.GPS.icon = {};
}

//### private==================
//# 外掛路徑
ezmapplus.GPS.path = l + 'GPS/';

//# easymap 圖台相關
ezmapplus.GPS.map = null;
ezmapplus.GPS.point = null;     // Point 點位
ezmapplus.GPS.marker = null;    // GPS Marker

//### public =======================
//# GPS圖示靠右下的margin
if (ezmapplus.GPS.icon.left == undefined) ezmapplus.GPS.icon.left = "";
if (ezmapplus.GPS.icon.top == undefined) ezmapplus.GPS.icon.top = "";
if (ezmapplus.GPS.icon.bottom == undefined) ezmapplus.GPS.icon.bottom = "";
if (ezmapplus.GPS.icon.right == undefined) ezmapplus.GPS.icon.right = "";
if (ezmapplus.GPS.icon_width == undefined) ezmapplus.GPS.icon_width = 54;
if (ezmapplus.GPS.icon_height == undefined) ezmapplus.GPS.icon_height = 54;

//# icon click handler
if (ezmapplus.GPS.iconClick == undefined) ezmapplus.GPS.iconClick = null;
//# 是否顯示範圍框
if (ezmapplus.GPS.isRangeShowed == undefined) ezmapplus.GPS.isRangeShowed = true;
//# 是否顯示marker
if (ezmapplus.GPS.isMarkerShowed == undefined) ezmapplus.GPS.isMarkerShowed = true;
//# 是否顯示tip
if (ezmapplus.GPS.isTipShowed == undefined) ezmapplus.GPS.isTipShowed = false;
//# 找到經緯度後預設的zoom
if (ezmapplus.GPS.zoom == undefined) ezmapplus.GPS.zoom = 16;
//# 只有網頁模式
if (ezmapplus.GPS.isWebmode == undefined) ezmapplus.GPS.isWebmode = false;
//# highlight
if (ezmapplus.GPS.isHighlight == undefined) ezmapplus.GPS.isHighlight = false;

//# mmjs
document.write('<script src="' + ezmapplus.GPS.path + 'mmjs/base.js"></script>');
document.write('<script src="' + ezmapplus.GPS.path + 'mmjs/utility.js"></script>');

//# notify
document.write('<script src="' + ezmapplus.GPS.path + 'notify/notify.min.js"></script>');
document.write('<link href="' + ezmapplus.GPS.path + 'notify/style.css" rel="stylesheet" type="text/css" media="screen">');

//# gps support
document.write('<script src="' + ezmapplus.GPS.path + 'notify/notify.min.js"></script>');

//# 主程式
document.write('<script src="' + ezmapplus.GPS.path + 'kernel.js"></script>');
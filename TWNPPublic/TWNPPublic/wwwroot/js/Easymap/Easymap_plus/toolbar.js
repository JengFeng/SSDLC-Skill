/***************************************************************
 * easymap v 6.1.39 以上
 * 
<!-- GISMM:Map Toolbar: easyframe 外掛 -->
<script>
    var ezmapplus = {};

    ezmapplus.toolbar = {};
    ezmapplus.toolbar.use_rmap_layer = true;

    if (ef.isMobile == true) {
        ezmapplus.toolbar.tools = ['identify172', 'polyline', 'polygon', 'circle', 'clear'];
        ezmapplus.toolbar.position = [20, 10];
    } else {
        ezmapplus.toolbar.tools = ['identify172', 'polyline', 'polygon', 'circle', 'print', 'snapshot', 'zoomIn', 'zoomOut', 'clear'];
        ezmapplus.toolbar.position = [50, 25];
    }


    ezmapplus.toolbar.positionOffset = 30;

</script>
<script src="modules/easymap_plus/toolbar.js"></script>

 ***************************************************************/
/***************************************************************
 * 取得相對路徑
 ***************************************************************/
var r = new RegExp("(^|(.*?\\/))(" + "toolbar.js" + ")(\\?|$)"),
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

var r = l.substring(0, l.toLowerCase().indexOf('modules'));
/***********************************************************/

/**************************************************
	easymap 插件 - toolbar
***************************************************/
if (ezmapplus == null) {
    var ezmapplus = {};
    ezmapplus.toolbar = {};

}
//### private 
ezmapplus.toolbar.map = null; //easymap
ezmapplus.toolbar.path = l + "toolbar/";

//### public 

//identify會預設一到哪個zoom
if (ezmapplus.toolbar.identifyZoom == undefined) ezmapplus.toolbar.identifyZoom = 17;

//icon之間的間距
if (ezmapplus.toolbar.iconSize == undefined) ezmapplus.toolbar.iconSize = [25,25];

//icon之間的間距
if (ezmapplus.toolbar.positionOffset == undefined) ezmapplus.toolbar.positionOffset = 30;

//是否identify開啟地籍圖
if (ezmapplus.toolbar.use_rmap == undefined) ezmapplus.toolbar.use_rmap = false;

//列印(print)要不要加指北針
if (ezmapplus.toolbar.use_campass == undefined) ezmapplus.toolbar.use_campass = true;

//列印(print)是否開啟使用圖列
if (ezmapplus.toolbar.use_icon_legend == undefined) ezmapplus.toolbar.use_icon_legend = false;

//是否關閉click的red border
if (ezmapplus.toolbar.disable_update_state == undefined) ezmapplus.toolbar.disable_update_state = false;

//***************************************************************************************************
//***************************************************************************************************
//# tooltip
document.write('<script src="' + ezmapplus.toolbar.path + 'powertip/jquery.powertip.js"></script>');
document.write('<link href="' + ezmapplus.toolbar.path + 'powertip/css/jquery.powertip.min.css" rel="stylesheet" type="text/css" media="screen">');

//# mmjs
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/base.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/mask.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/ajax.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/farmer.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/utility.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/math.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/lightbox.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/tip.js"></script>');
document.write('<script src="' + ezmapplus.toolbar.path + 'mmjs/easyobject.js"></script>');

//# icon
document.write('<link href="' + ezmapplus.toolbar.path + 'style.css" rel="stylesheet" type="text/css" media="screen">');

//# base64
document.write('<script src="' + ezmapplus.toolbar.path + 'js/qt_base64.js"></script>');

//# polyfills
document.write('<script src="' + ezmapplus.toolbar.path + 'js/polyfills.umd.js"></script>');

//# jspdf
document.write('<script src="' + ezmapplus.toolbar.path + 'js/jspdf.umd.min.js"></script>');

//# kernel
document.write('<script src="' + ezmapplus.toolbar.path + 'kernel.js"></script>');

//load specific tool 
if(ezmapplus.toolbar.tools == null)
{
  ezmapplus.toolbar.tools = {};
}
for (var i = 0; i < ezmapplus.toolbar.tools.length; i++) {
    document.write('<script src="' + ezmapplus.toolbar.path + ezmapplus.toolbar.tools[i] + '.js"></script>');
}
/* ----------------------------------------------------------------------------
easymap.js 
The latest version is available at
http://www.gis.tw

Copyright (c) 2006-2009 FCU.GIS Center All rights reserved.
Created 6. 4. 2007 by Jeffrey Chien (email: jeffrey@gis.tw )
Last modified: 2020/01/30
version: 6.1.95
version: 7.1.0

Performance optimizations for Internet Explorer
by Jeffrey Chien.
High Performance JavaScript Map Library.
NOTE: Operations, functions and branching have rather been optimized
to efficiency and speed than to shortness of source code.

This program is "not" free software;
If you want to use this JavaScript, please call 886-4-24516669
-------------------------------------------------------------------------------*/
var version = null;
var r = new RegExp("(^|(.*?\\/))(" + "easymap.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');
    if (src == null) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            version = __getversion(m)
            break;
        }
    }
}
window.__EASYMAP__ = {
    url: l
}
var _easymap_directory_path = l + '7/Cesium.js';
var _dgmap4path = l;

if (version == null) version = '7';

if (__ES6Support() == true && version == '7') {
    //=============
    // version 7
    //=============
    document.write("<link rel='stylesheet' id='easymap-style' href='" + l + "7/easymap.css' type='text/css'>");
    //document.write("<script type='text/javascript' src='" + l + "7/dgSource.js'></script>"); //謝謝 dgSource 的努力
    document.write("<script type='text/javascript' src='" + l + "7/html2canvas/html2canvas.min.js'></script>");
    document.write("<script type='text/javascript' src='" + l + "7/dg.js'></script>");
    document.write("<script type='text/javascript' src='" + l + "map_ini.js'></script>");

    //2021-12-24 增加 MMJS
    document.write("<script type='text/javascript' src='" + l + "7/MMJS/mmjs.js'></script>");
    document.write("<script type='text/javascript' src='" + l + "7/MMJS/mmeasymap.js'></script>");

    document.write("<script type='text/javascript' src='" + l + "7/easymap.js'></script>");
    //2021-06-07 增加 ol-ext
    //document.write("<script type='text/javascript' src='" + l + "7/ol-ext/ol-ext.js'></script>");
    document.write("<link rel='stylesheet' id='easymap-style-ol-ext' href='" + l + "7/ol-ext/ol-ext.css' type='text/css'>");
    document.write("<link rel='stylesheet' id='easymap-style-ol-ext' href='" + l + "7/font-awesome/4.7.0/css/font-awesome.min.css' type='text/css'>");
    //<!-- Pointer events polyfill for old browsers, see https://caniuse.com/#feat=pointer -->
    document.write("<script type='text/javascript' src='" + l + "7/elm-pep/elm-pep.js'></script>");
    document.write("<script type='text/javascript' src='" + l + "7/olms/olms.js'></script>");
    document.write("<script type='text/javascript' src='" + l + "7/mapbox/mapbox-gl.js'></script>");
    //2021-08-24 增加 jszip
    document.write("<script type='text/javascript' src='" + l + "7/jszip/jszip.min.js'></script>");
    
}
else if (__ES6Support() == true && (version == 'easymap_pilotgaea' || version == 'p')) {
    document.write("<script type='text/javascript' src='" + l + "easymap_pilotgaea/pilotgaea-mapclient.js'></script>");
    document.write("<script type='text/javascript' src='" + l + "easymap_pilotgaea/PGWeb3D.min.js'></script>");    
    document.write("<script type='text/javascript' src='" + l + "easymap_pilotgaea/easymap_pilotgaea.js'></script>");

} else {
    //=============
    // version 6
    //=============

    window.EzMap = {};

    EzMap.files = [];
    EzMap.files.push("<script type='text/javascript' src='" + _dgmap4path + "6/js/coordTrans.js'></script>");
    EzMap.files.push("<script type='text/javascript' src='" + _dgmap4path + "6/js/yoext.js'></script>");
    ////// Openlayers Lib
    EzMap.files.push("<script src='" + _dgmap4path + "6/MM/OpenLayers.light.js'></script>");
    //////ezmap light lib
    var jsFiles = [
        "Icon.js",
        "Marker.js",
        "Handler/Drag.js",
        "Handler/Feature.js",
        "Handler/Keyboard.js",
        "Handler/Pinch.js",
        "Handler/Point.min.js",//|min
        "Handler/Path.min.js",//|min
        "Handler/Polygon.min.js",//|min
        "Handler/RegularPolygon.min.js",//|min
        "Control/ArgParser.js",
        "Control/Button.js",
        "Control/DrawFeature.js",
        "Control/DragFeature.js",
        "Control/Measure.js",
        "Control/PanZoom.js",
        "Control/PanZoomBar.js",
        "Control/OverviewMap.min.js",//|min
        "Control/KeyboardDefaults.js",
        "Control/ModifyFeature.min.js",//|min
        "Control/PinchZoom.js",
        "Control/TouchNavigation.js",
        "Layer/Markers.js",
        "Layer/WMS.js",
        "Layer/WMTS.js",
        "Layer/Image.js",
        "Layer/Bing.js",
        "Format/XML.min.js",//|min
        "Format/KML.min.js"//|min
    ]; // etc.
    for (var i = 0, len = jsFiles.length; i < len; i++) {
        EzMap.files.push("<script src='" + _dgmap4path + "6/MM/light.lib/" + jsFiles[i] + "'></script>");
    }
    ////// 下方的順序需保持 
    EzMap.files.push("<link rel='stylesheet' href='" + _dgmap4path + "6/css/map.css' type='text/css'>");
    EzMap.files.push("<link rel='stylesheet' href='" + _dgmap4path + "6/MM/theme/default/style.tidy.css' type='text/css'>");
    //////MM
    //EzMap.files.push("<script src='" + _dgmap4path + "MM/MM.js'></script>");
    jsFiles = [
        "BaseTypes.js",
        "ol.js",                    //main|min
        "EasyKML.js",                   //min
        "Tools.js",
        "HtmlStr.js",
        "Format/KML.js",			//繼承<OpenLayers.Format.KML>
        "BaseType/KML.js",			//存儲kml的結構
        "BaseType/NetworkLink.js",	//networkLink reload時需有地方存連結等資訊的結構
        "Control/StatusBar.js",		//底下的訊息bar
        "Control/MeasureToolbar.js",//min測量|min
        "Control/Print.js",			//列印
        "Control/PanZoomBar.js",	//panZoomBar
        "Control/LayerSwitcher.js",	//切換底圖
        "Control/LTOverviewMap.js",	//OverviewMap
        "Control/createDiv.js",		//createDiv
        "Control/ScaleLine.js",		//ScaleLine
        "Control/ZoomBox.js",		//ScaleLine
        //"Layer/Easymap.js",	    //easymap圖層
        "Layer/Google.js",			//easymap圖層
        "Layer/EZWMS.js",           //wms
        "Layer/ArcGIS93Rest.js",    //arcgis
        "Layer/ArcGISCache.js",    //arcgis
        "Strategy/Cluster.js"   //marker cluster|min
    ]; // etc.
    for (var i = 0, len = jsFiles.length; i < len; i++) {
        EzMap.files.push("<script src='" + _dgmap4path + "6/MM/mine/" + jsFiles[i] + "'></script>");
    }
    //////
    EzMap.files.push("<script src='" + _dgmap4path + "6/MM/MM1.js'></script>");
    EzMap.files.push("<script src='" + _dgmap4path + "map_ini.js'></script>");
    EzMap.files.push("<script src='" + _dgmap4path + "6/easymap_instance.js'></script>");
    EzMap.files.push("<link href='" + _dgmap4path + "6/js/dropdownlist/jquery.dropdown.min.css' rel='stylesheet'>");
    document.write(EzMap.files.join(""));
}



//=============
// web tools
//=============
function __ES6Support() {
    try {
        new Function("(a = 0) => a");
        return true;
    }
    catch (err) {
        return false;
    }
};
function __getversion(m) {
    /// <summary>
    /// 同C#QueryString
    /// </summary>
    /// <param name="sParam"></param>
    var U = m.input.split('?');
    var url = U.length <= 1 ? U[0] : U[1];
    var sPageURL = url;
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == 'v') {
            return sParameterName[1];
        }
    }
    return null;
}
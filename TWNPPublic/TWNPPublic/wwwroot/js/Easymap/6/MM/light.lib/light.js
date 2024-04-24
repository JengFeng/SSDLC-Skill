/**************************************************
	js物件化管理案
	功能:載入所有js檔案
***************************************************/
(function () {
    var host = _dgmap4path + "MM/light.lib/";
    
    var jsFiles = [
            "Icon.js",
            "Marker.js",
            "Handler/Drag.js",
            "Handler/Feature.js",
            "Handler/Keyboard.js",
            "Handler/Pinch.js",
            "Handler/Point.min.js",
            "Handler/Path.min.js",
            "Handler/Polygon.min.js",
            "Handler/RegularPolygon.min.js",

            "Control/ArgParser.js",
            "Control/Button.js",
            "Control/DrawFeature.js",
            "Control/DragFeature.js",
            "Control/Measure.js",
            "Control/PanZoom.js",
            "Control/PanZoomBar.js",
            "Control/OverviewMap.min.js",
            "Control/KeyboardDefaults.js",

            "Control/ModifyFeature.min.js",
            "Control/PinchZoom.js",
            "Control/TouchNavigation.js",

            "Layer/Markers.js",
            "Layer/WMS.js",
            "Layer/WMTS.js",
            "Layer/Image.js",
            "Layer/Bing.js",
            "Format/XML.min.js",
            "Format/KML.js"
            
    ]; // etc.

    var scriptTags = new Array(jsFiles.length);

    for (var i = 0, len = jsFiles.length; i < len; i++) {
        scriptTags[i] = "<script src='" + host + jsFiles[i] +
                               "'></script>";
    }
    if (scriptTags.length > 0) {
        document.write(scriptTags.join(""));
    }

})();


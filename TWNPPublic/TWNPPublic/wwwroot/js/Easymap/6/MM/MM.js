
(function (EzMap) {

    var singleFile = (typeof MM == "object" && MM.singleFile);
    
    var scriptName = (!singleFile) ? "MM.js" : "MM.js";


    var jsFiles = null;

    window.EzMap = {

        _getScriptLocation: (function() {
            var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
                s = document.getElementsByTagName('script'),
                src, m, l = "";
            for(var i=0, len=s.length; i<len; i++) {
                src = s[i].getAttribute('src');
                if(src) {
                    m = src.match(r);
                    if(m) {
                        l = m[1];
                        break;
                    }
                }
            }
            return (function() { return l; });
        })(),
      
        ImgPath : ''
    };

    if(!singleFile) {

            jsFiles = [
				"BaseTypes.js",
				"ol.js",//ol.min.js
				"EasyKML.js",
				"Tools.js",
				"HtmlStr.js",
                "Format/KML.js",			//繼承<OpenLayers.Format.KML>
                "BaseType/KML.js",			//存儲kml的結構
                "BaseType/NetworkLink.js",	//networkLink reload時需有地方存連結等資訊的結構

                "Control/StatusBar.js",		//底下的訊息bar
                "Control/MeasureToolbar.min.js",//min測量
                "Control/Print.js",			//列印
                "Control/PanZoomBar.js",	//panZoomBar
                "Control/LayerSwitcher.js",	//切換底圖
				"Control/LTOverviewMap.js",	//OverviewMap
				"Control/createDiv.js",		//createDiv
				"Control/ScaleLine.js",		//ScaleLine
                "Control/ZoomBox.js",		//ScaleLine
                //"Layer/Easymap.js",			//easymap圖層
                "Layer/Google.js",			//easymap圖層
                "Layer/EZWMS.js",           //wms
                "Layer/ArcGIS93Rest.js",           //wms
				"Strategy/Cluster.js"		//marker cluster
            ]; // etc.
        
		
        // use "parser-inserted scripts" for guaranteed execution order
        // http://hsivonen.iki.fi/script-execution/
        var scriptTags = new Array(jsFiles.length);
        var host = _dgmap4path+"MM/mine/";
        for (var i=0, len=jsFiles.length; i<len; i++) {
            scriptTags[i] = "<script src='" + host + jsFiles[i] +
                                   "'></script>"; 
        }
        if (scriptTags.length > 0) {
            //document.write(scriptTags.join(""));
        }


    }
})(EzMap);


EzMap.VERSION_NUMBER = "Release 6.1.2";

//mobile-device的css
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.write("<link rel='stylesheet' href='" + _dgmap4path + "css/mobile.min.css' type='text/css'>");
}

///// main function 
var _dm4_maps = [];							//底圖格式存放陣列
var _dm4_maps_types = [];

var _dg_DEFAULT_ICON = "imgs/icon01.png";	//預設的icon路徑
var _coord = null;							//座標系統
var _resolutions = null;					//預設的解析度
var _numZoomLevels = 20;					//預設圖台階層數
var _sStatus = false;						//下方狀態列
var zmScaleLine = null;						//左下角狀態列位置
var zmWMap = null;							//鷹眼位置
var zmSwitcher = null;						//切換底圖位置
var _lineStyle = null;						//畫線的style
var _polygonStyle = null;					//畫面積style
var _featureSelectStyle = null;				//kml選擇feature 時的style
/********************************************************/

/*						定義				                */
/*                                                      */
/********************************************************/
window._$EZMAP = {
    UNIT_M: "公尺",
    UNIT_KM: "公里",
    UNIT_MILE: "英里",
    UNIT_FEET: "英尺",
    UNIT_DISTANCE: "距離",
    UNIT_AREA: "面積",
    UNIT_SQUARE: "平方",
    STR_WGS84: "經緯度"
}
_$EZMAP.path = _dgmap4path;  //ex: easymap6/
//內部變數使用規則
// 前置詞 _$EZMAP.varables
//ex: _$EZMAP.varables.layer
_$EZMAP.varables = {};//內部變數使用
function dgSource(layer, options) {
    this.type = "dgSource";
    this.layer = layer;
    this.options = options;

    //register an event
    this.events = [];
    this.register = function (event, callback) {
        var e = {};

        if (this.instance) {

            //如果加入過,就覆蓋
            var events = this.events;
            var added = false;
            for (var i = 0; i < events.length; i++) {
                if (event == events[i].event) {

                    this.instance.events.unregister(events[i].event, this.instance, events[i].callback);
                    events[i].callback = callback;
                    this.instance.events.register(events[i].event, this.instance, events[i].callback);

                    added = true;
                }
            }

            //如果沒加入過
            if (added == false) {
                e.event = event;
                e.callback = callback;
                this.events.push(e);

                this.instance.events.register(event, this.instance, callback);
            }

        } else {
            e.event = event;
            e.callback = callback;
            this.events.push(e);
        }
    }
    this.unregister = function (event) {

        var events = this.events;
        for (var i = events.length - 1; i >= 0 ; i--) {
            if (event == events[i].event) {

                if (this.instance) {
                    this.instance.events.unregister(events[i].event, this.instance, events[i].callback);
                }

                this.events.splice(i, 1);
            }
        }
    }
}
//easymap5:底圖圖資來源格式定義
function mapIni(vfn, md, mn, zl, ps, xb, yb, lt, xs, ys) {
    this.type = "mapini";
    if (vfn != null && md != null && mn != null && zl != null && ps != null && lt != null && xs != null && ys != null) {
        //副檔名
        this.vfname = vfn;
        //圖層圖片目錄
        this.mapdir = md;
        //圖層名稱
        this.mapname = mn;
        //zoom level
        this.zoom = zl;
        //圖層比例尺
        this.pscale = ps;
        //圖層寬高總張數
        this.xb = xb - 1;
        this.yb = yb - 1;
        //圖層左上座標
        this.lt = lt;
        this.ltx = lt.x;
        this.lty = lt.y;
        //x 比例尺
        this.xscale = xs;
        //y 比例尺
        this.yscale = ys;

        return this;
    }
    else {
        return false;
    }
}
function mapType(sn, mn, lc, sl) {
    if (sn != null && mn != null) {
        this.showname = sn;
        this.mapname = mn;
        this.levelcount = lc;
        //this.sublayer = sl;

        return this;
    }
    else {
        return false;
    }
}
function dgXY(cdx, cdy, tf) {
    this.x = (cdx == null) ? null : parseFloat(cdx);
    this.y = (cdy == null) ? null : parseFloat(cdy);
    this.os = (tf == null) ? false : tf;
}

function dgKml(url, callback) {
    this.type = "dgKml";
    this.url = url;
    this.opacity = 1;
    this.callback = callback;
    this.featureSelectDisabled = false;
    this.async = false;

    this.onFeatureSelect = null;
    this.onFeatureUnselect = null;
    this.onFail = null;
    this.labelVisible = undefined;//whether label shows or not
    this.iconVisible = undefined;//whether icon shows or not
    this.useUpperZoomByBoundary = false;//whether uses most view range
    this.instance = null;
    this.useNetworkLink = true;//whether use networklink


    this.setClick = function (callback) {
        this.onFeatureSelect = callback;
    }
    this.setFeatureSelectHandler = function (callback) {
        this.onFeatureSelect = callback;
    }
    this.setonFeatureUnselectHandler = function (callback) {
        this.onFeatureUnselect = callback;
    }
    this.getFeatures = function () {
        return this.layer.features;
    }
    this.getAttributes = function () {

        if (!this.layer) return [];
        if (!this.layer.features) return [];

        var features = [];
        for (var i = 0; i < this.layer.features.length; i++) {

            if (this.layer.features[i].attributes) {
                features.push(this.layer.features[i].attributes);
            }
        }

        return features;

    }
    this.getAttributeByName = function (name) {

        if (!this.layer) {
            console.log("easymaplog: kml尚未加入到圖台");
            return false;
        }

        name = name.toString().toLowerCase();
        var features = this.layer.features;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];

            if (!feature.attributes) continue;
            if (!feature.attributes.name) continue;

            if (name == feature.attributes.name.toLowerCase()) {

                return feature.attributes;
            }
        }
    }
    this.getStyleByName = function (name) {
        if (!this.layer) {
            console.log("easymaplog: kml尚未加入到圖台");
            return false;
        }

        name = name.toString().toLowerCase();
        var features = this.layer.features;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];

            if (!feature.attributes) continue;
            if (!feature.attributes.name) continue;

            if (name == feature.attributes.name.toLowerCase()) {

                return feature.style;
            }
        }
        return null;
    }
    /*需注意非同步時(true)，載入kml過於頻繁可能會導致錯誤*/
    this.setAsynchronous = function (tf) {
        if (tf) {
        } else {
            tf = false;
        }
        this.async = tf;
    }
    this.setLabelVisible = function (tf) {

        if (tf) {
        } else {
            tf = false;
        }
        this.labelVisible = tf;

        if (this.layer) {
            if (this.layer.features == undefined) return;
            for (var i = 0; i < this.layer.features.length; i++) {
                var feature = this.layer.features[i];
                if (tf == false) {
                    feature.attributes.name = "";
                }
            }
        }
    }
    this.setIconVisible = function (tf) {
        if (tf) {
        } else {
            tf = false;
        }
        this.iconVisible = tf;

        if (this.layer) {

            for (var i = 0; i < this.layer.features.length; i++) {
                var feature = this.layer.features[i];
                if (tf == false) {
                    feature.style.graphicOpacity = 0;
                }

            }
            this.layer.redraw();
        }
    }
    this.setOpacity = function (val) {

        this.opacity = val;

        if (!isNaN(val) == false) val = 1;
        if (!this.layer) return;
        if (this.layer.div.childNodes.length<=0) return;

        var features = this.layer.features;

        if (features != undefined && features.length>=1) {
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                feature.style.fillOpacity = val;
            }
            this.layer.redraw();
        }else{
            var nodes = this.layer.div.childNodes;
            for (var i = 0; i<nodes.length;i++){
                var node = nodes[i];
                if (node.nodeName == 'IMG') {
                    node.style.opacity = val;
                }
            }
        }

        
    }
    this.setFeatureSelectDisabled = function () {
        this.featureSelectDisabled = true;
    }
    this.setFeatureSelect = function (tf) {
        this.featureSelectDisabled = !tf;
    }
    this.getOpacity = function () {
        return this.opacity;
    }
    this.setUpperZoomByBoundary = function (tf) {
        this.useUpperZoomByBoundary = tf;
    }
    this.setNetworkLink = function (tf) {
        if (tf == undefined) {
            tf = true;
        }
        this.useNetworkLink = tf;
    }
   
    /*
        fill	{Boolean} 
        fillColor	{String} 
        fillOpacity	{Number} 
        stroke	{Boolean} 
        strokeColor	{String} 
        strokeOpacity	{Number} 
        strokeWidth	{Number} 
        strokeLinecap	{String} 
        strokeDashstyle	{String} 
        graphic	{Boolean} 
        pointRadius	{Number} 
        pointerEvents	{String} 
        cursor	{String} 
        externalGraphic	{String} 
        graphicWidth	{Number} 
        graphicHeight	{Number} 
        graphicOpacity	{Number} 
        graphicXOffset	{Number} 
        graphicYOffset	{Number} 
        rotation	{Number} 
        graphicZIndex	{Number} 
        graphicName	{String} 
        graphicTitle	{String} 
        title	{String}  
        backgroundGraphic	{String}
        backgroundGraphicZIndex	{Number}
        backgroundXOffset	{Number}
        backgroundYOffset	{Number}
        backgroundHeight	{Number}
        backgroundWidth	{Number} 
        label	{String} 
        labelAlign	    {String}
        labelXOffset	{Number} 
        labelYOffset	{Number} 
        labelSelect	{Boolean} 
        labelOutlineColor	{String}
        labelOutlineWidth	{Number}
        labelOutlineOpacity	{Number}
        fontColor	{String} 
        fontOpacity	{Number} 
        fontFamily	{String} 
        fontSize	{String} 
        fontStyle	{String} 
        fontWeight	{String} 
        display	{String} 
        imageOpacity    {Number}        ImageOverlay
    */
    this.updateStyleByName = function (name, style) {

        if (!this.layer) {
            console.log("easymaplog: kml尚未加入到圖台");
            return false;
        }

        if (!name) return;

        name = name.toString().toLowerCase();
        var features = this.layer.features;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];

            if (!feature.attributes) continue;
            if (!feature.attributes.name) continue;

            if (name == feature.attributes.name.toLowerCase()) {


                for (var css in style) {
                    feature.style[css] = style[css];
                }
                this.layer.redraw();

            }
        }
    }
    this.updateStyle = function (style) {

        if (!this.layer) {
            console.log("easymaplog: kml尚未加入到圖台");
            return false;
        }


        var features = this.layer.features;

        if (features == null) return;

        function isNumeric(num) {
            return !isNaN(num)
        }

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (!feature.attributes) continue;
            for (var css in style) {
                if (isNumeric(style[css]) == true) {
                    style[css] = parseFloat(style[css]);
                }
                feature.style[css] = style[css];
            }
        }
        this.layer.redraw();
    }
    this.updateStyleByFid = function (fid, style) {

        if (!this.layer) {
            console.log("easymaplog: kml尚未加入到圖台");
            return false;
        }

        if (!fid) return;

        fid = fid.toString().toLowerCase();
        var features = this.layer.features;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];

            if (!feature.attributes) continue;
            if (!feature.attributes.fid) continue;

            if (fid == feature.attributes.fid.toLowerCase()) {


                for (var css in style) {
                    feature.style[css] = style[css];
                }
                this.layer.redraw();

            }
        }
    }
    this.updateStyleByAttribute = function () {}


    this.setFeatureClick = function (callback) {
        this.onFeatureSelect = callback;
    }

    //easymap7
    this.setFeatureHover = function () { }
    this.enableLineStringArrow = function () { }
    this.disalbeLineStringArrow = function () { }
    this.setClusterEnable = function () { }
    this.getType = function () {
        return '';
    }
}
function dgChart(charttype, dgxy, dataset, options) {

    this.type = "dgchart";
    this.charttype = charttype;
    this.xy = dgxy;
    this.dataset = dataset;
    this.options = options;
}




/**
 * dependency
 * Easymap
 * MM.utility
 * */

/* *
 *
 LAYER結構 {
    kmlurl,
    LAYER,  // 參數
 }

 2019-04-03 新增 KML 之 1. 設定 Click 之 Callback， 2. 資料分群顯示， 3. 設定線段(LineString)樣式_箭頭 4. 設定連動圖層
 2019-04-12 新增 Func (設定縮放級別之可見範圍)
 2019-05-21 1. 更正多次開關問題
            2. 修正google格式
 2019-05-24 修正 queryString.zoom ，queryString.boundary未完成
 2019-06-21 修正 google路徑{markvline}=>|
 2019-06-24 boundary
 2019-06-26 修正 連動圖層 extentLayers
 2019-07-12 新增 KML 之設定拖曳視窗(DragInfo)
 2019-07-31 修正 KML 之設定拖曳視窗
 2019-08-17 新增 MM.easymap.addItem_multigeomety_string
 2019-08-18 新增 MM.easymap.zoomToBoundaryByMultigeometystring
 2019-08-21 新增動態 url
                setQueryStringVar 
                getQueryString 
                changeQueryStringVar
                _replaceQuery 
 2019-08-22 修正 KML 之設定拖曳視窗(DragInfo)：手機版 content 之全螢幕顯示
 2019-10-30 修正 KML 之設定拖曳視窗(DragInfo)及資料分群顯示(Cluster)，需圖台需支援 HTML 5才可執行
 2020-03-01 增加 queryString.xy
 2020-03-30 新增 3D 類型(MM.easymap.get3D、MM.easymap.add3D)
            新增 kml 之地形圖設定(enable3DTerrain)
 2020-11-09 修改 調整 DragInfo 避免重複觸發點擊事件
 2021-11-12 新增 KML 之設定可移至圖層該範圍
 2023-07-13 修正 modules 會載不到 window.js、dialog.js 的問題
 *
 * */

var r = new RegExp("(^|(.*?\\/))(" + "mmeasymap.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');
    if (src == null) continue;
    //if (src.toLowerCase().indexOf("modules")>=0) continue;
    if (src.toLowerCase().indexOf("mmjs") < 0) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}

if (typeof(ef) != "undefined" && [].inArray == undefined)
    document.write('<script src="' + l + 'base.js"></script>');

if (MM.dialog == undefined)
    document.write('<script src="' + l + 'dialog.js"></script>');

/////////////////////////////////////////////////////
if (window.MM) {
    MM = window.MM;

} else {
    window.MM = {};
}
if (MM.window == undefined)
    document.write('<script src="' + l + 'window.js"></script>');

MM.easymap = {};
MM.easymap.path = l;
(function (MM) {
    MM.easymap.map = null;          // 圖台變數
    MM.easymap.ezLayer_upload = ""; // Kml | Icon 位址
    MM.easymap.uploadpath = '';     // Kml | Icon 位址
    MM.easymap.proxy = '';
    MM.easymap.items = [];
    MM.easymap.dragInfos = [];      // 拖曳套件
    MM.easymap._queries = [];       // 動態URL
    MM.easymap._dragFeatures = [];
    MM.easymap._priorityLayer = [];

    //# pirvate 
    MM.easymap._getDragInfoById = function (id) {
        for (var i = 0; i < MM.easymap.dragInfos.length; i++) {
            var info = MM.easymap.dragInfos[i];
            if (id == info.id) {
                return info;
            }
        }
        return null;
    }
    MM.easymap._removeDragInfoById = function (id) {

        var info = MM.easymap._getDragInfoById(id);


        this.map.removeItem(info.line);

        if (document.getElementById(info.infoId) != null) {
            document.getElementById(info.infoId).remove();
        }

        MM.easymap.dragInfos.popById(info.id);

    }

    MM.easymap.get = function (layer) {
        for (var i = 0; i < MM.easymap.items.length; i++) {
            if (layer.LAYER_SN == MM.easymap.items[i].LAYER_SN) {
                return layer;
            }
        }
        return null;
    }
    /// <summary>
    /// layer type
    /// </summary>
    MM.easymap.getGoogle = function (layer) {

        if (layer.isbg == undefined) {
            layer.isbg = false;
        }

        layer.PATH = layer.PATH.replace("{markvline}", "|");

        var op = {};
        op.id = layer.id;
        op.bg = layer.isbg;
        op.name = layer.id;
        op.chname = layer.NAME;
        op.iconMax = "imgs/googlestreets.png";
        op.iconMin = "imgs/googlestreets.png";
        op.url = layer.PATH;
        op.tileOptions = { crossOriginKeyword: null };
        op.resolutions = [156543.03390625, 78271.516953125, 39135.7584765625,
            19567.87923828125, 9783.939619140625,
            4891.9698095703125, 2445.9849047851562,
            1222.9924523925781, 611.4962261962891,
            305.74811309814453, 152.87405654907226,
            76.43702827453613, 38.218514137268066,
            19.109257068634033, 9.554628534317017,
            4.777314267158508, 2.388657133579254,
            1.194328566789627, 0.5971642833948135, 0.2985821416974068,
            0.1492910708487034, 0.0746455354243517];

        op.serverResolutions = [156543.03390625, 78271.516953125, 39135.7584765625,
            19567.87923828125, 9783.939619140625,
            4891.9698095703125, 2445.9849047851562,
            1222.9924523925781, 611.4962261962891,
            305.74811309814453, 152.87405654907226,
            76.43702827453613, 38.218514137268066,
            19.109257068634033, 9.554628534317017,
            4.777314267158508, 2.388657133579254,
            1.194328566789627, 0.5971642833948135, 0.2985821416974068,
            0.1492910708487034, 0.0746455354243517];
        return new dgSource("GOOGLE", op)
    }
    MM.easymap.addGoogle = function (layer) {
        var google = this.getGoogle(layer);
        layer.id = layer.LAYER_SN;
        layer.instance = google;
        MM.easymap.items.push(layer);
        this.map.addItem(google);
        return google;
    }
    MM.easymap.addkml = function (layer, callback) {
        //# Format Url
        var path = layer.kmlurl;
        if (MM.easymap.proxy != '') {
            for (var i = 0; i <= 10; i++) {
                path = path.replace('&amp;', '&');
                path = path.replace('&', '[and]');
                path = path.replace('?', '[question]');
            }
        }

        //# proxy
        var url = MM.easymap.proxy + path;

        //# 動態 Url
        url = MM.easymap._replaceQuery(layer, url);

        //# new kml
        var kml = new dgKml(url, function (dgkml) {

            var queryString = this;
            if (queryString == null) return;

            if (queryString.strokewidth != undefined) {
                var width = queryString.strokewidth;
                var color = queryString.strokecolor;
                var style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: width,
                        color: color
                    })
                });
                var features = dgkml._instance.getSource().getFeatures();
                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    feature.setStyle(style);
                }
            }
            // 設定 Zoom 到最適範圍
            if (queryString.boundary != undefined && queryString.boundary == '1') {

                dgkml.setUpperZoomByBoundary(true);
            }
            //# run callback
            if (callback != undefined) {
                callback.apply(dgkml, [dgkml]);
            }

            // 將優先圖層往上提
            MM.easymap._priorityLayer.forEach(kml => {
                MM.easymap.map.setItemTop(kml);
            });

        }.bind(queryString));
        layer.id = layer.LAYER_SN;
        layer.instance = kml;

        //# 預設參數
        var queryString = MM.attrstr2object(layer.LAYER);
        if (queryString != null) {
            // 設定要不要允許 Feature 的屬性點選
            if (queryString.featureSelect != undefined) {
                var featureSelect = queryString.featureSelect;
                //  判斷是否為數字
                if (featureSelect == "0") {
                    kml.setFeatureSelect(false);
                } else {
                    kml.setFeatureSelect(true);
                }
            }

            // 設定 Click 之 Callback
            if (queryString.setFeatureClick != undefined) {
                //  若無設定事件，則點擊無任何反應
                event = layer.setFeatureClickCallback == null || layer.setFeatureClickCallback == '' ? function () { } : layer.setFeatureClickCallback;
                kml.setFeatureClick(event);
            }

            // 設定 DragInfo 之 Callback(圖台需支援 HTML 5)
            if (queryString.setDragInfo != undefined && __ES6Support() == true) {

                event = layer.setDragInfoTag == null || layer.setDragInfoTag == '' ? function () { } : layer.setDragInfoTag;

                kml.setFeatureClick(function (event, type, dgXY, geometry, evt, features) {

                    var kmlid = geometry._dgkml._id;
                    var uid = geometry.ol_uid;

                    if (MM.easymap._getDragInfoById(uid) != null) return;

                    switch (queryString.setDragInfoType) {
                        case 'iframe':
                            if (window.innerWidth >= 767) {
                                if (event.url == undefined) return;
                                divIframe = '<iframe id="if_dragInfo" src="{0}" width="100%" frameborder="0" style="height:auto;" />';
                                divIframe.replace('{0}', event.url)

                                MM.easymap.setDragInfo(event.name, divIframe, '330 300', dgXY, kmlid, uid);
                            }
                            else {
                                if (MM.dialog == undefined)
                                    document.write('<script src="' + l + 'dialog.js"></script>');
                                if (event.url == undefined) return;

                                MM.dialog.iframeFullscreen('', event.url);
                            }

                            break;
                        case 'content':
                            if (window.innerWidth >= 767) {

                                var size = '330 300';
                                if (queryString.dragInfoSize != undefined) size = queryString.dragInfoSize;
                                MM.easymap.setDragInfo(event.name, event.description, size, dgXY, kmlid, uid, features);
                            }
                            else {
                                if (MM.dialog == undefined)
                                    document.write('<script src="' + MM.easymap.path + 'dialog.js"></script>');
                                var h = $('body').height();
                                h -= 150;

                                if (features && features.length >= 2) {

                                    MM.easymap._dragFeatures = [];
                                    MM.easymap._dragFeatures = features;
                        
                                    var select = '';
                                    var options = [];
                                    features.forEach(function (f) {
                                        var { name } = f.values_;
                                        options.push('<option value="' + f.ol_uid + '">' + name + '</option>');
                                    });
                                    select = '<select class="form-control" onchange="MM.easymap._changeKMLContent(this.value,' + uid + ');">' + options.join() + '</select>';
                                    event.description = '<div style="text-align: right;padding:4px;z-index: 5;position: absolute;left: 0;right: 0;background: white;">' + select + '</div><div id="MM-easymap-kml-content" style="height:100%; padding-top: 40px;">' + event.description + '</div>';
                                }
                                event.description = '<div id="Drag-' + uid + '" style="height:{height}px;">' + event.description + '</div>';
                                event.description = event.description.replace('{height}', h);

                                // 避免重複觸發 click 事件
                                setTimeout(() => {
                                    MM.dialog.fullscreen(event.name, event.description);
                                }, 100);
                            }
                            break;
                        default:
                            return;
                            break;
                    }
                    //# callback
                    if (queryString.setDragCallback != null) {
                        try { eval(queryString.setDragCallback); } catch (err) { }
                    }
                });
            }

            // 資料分群顯示(圖台需支援 HTML 5)
            if (queryString.clusterEnable != undefined && __ES6Support() == true) {
                var gstyle = new dgGStyle();
                gstyle.setColorMedium('#FFFFFF');
                kml.setClusterEnable(queryString.clusterRange, queryString.clusterCount, gstyle);  // (分群範圍, 分群數量, 樣式)

                if (queryString.clusterZoom !== undefined) {
                    var czoom = parseInt(queryString.clusterZoom);
                    kml.setZoomWithoutCluster(true, czoom);
                }
            }

            // 設定線段(LineString)樣式_箭頭
            if (queryString.setFeatureArrow != undefined && __ES6Support() == true) {
                var rgba = queryString.strokeColor != undefined ? MM.hexToRgbA(queryString.strokeColor) : ''; //  線段顏色
                var strokeWidth = queryString.strokeWidth == undefined ? 1 : queryString.strokeWidth;         //  線段寬度

                arrowStyle = queryString.featureArrowImg == '' ? 'https://openlayers.org/en/latest/examples/data/arrow.png' : queryString.featureArrowImg;
                kml.enableLineStringArrow(arrowStyle, rgba, strokeWidth, 16);
            }
            
            // 3D 地形圖
            if (queryString.enable3DTerrain != undefined) {
                map.setTerrainUrl('null');
                var url = layer.PATH.trim();
                if (!map._enabled3d)    //# 未開啟 3D 時，需先開啟 3D
                {
                    map.enable3D(function () {
                        //# 預設使用 Cesium 官方地形圖
                        if (url.indexOf('test') > -1) {                                                       
                        }
                        else {
                            map.setTerrainUrl(url);
                        }
                        map.enable3DTerrain();
                        for (var j = 0; j < map._items.length; j++) {
                            map.set3DGltfsToGround(map._items[j].items);
                        }
                    });
                }
                else {
                    if (url.indexOf('test') > -1) {                        
                    }
                    else {
                        map.setTerrainUrl(url);
                    }
                    map.enable3DTerrain();
                    for (var j = 0; j < map._items.length; j++) {
                        map.set3DGltfsToGround(map._items[j].items);
                    }
                }
            }

            // 設定圖層順序為優先
            if (queryString.alwaysOnTop != undefined) {
                MM.easymap._priorityLayer.push(kml);
            }

            // 移至圖層該範圍
            if (queryString.boundary != undefined && queryString.boundary == '1') {
                kml.setUpperZoomByBoundary(true);
            }
        }

        //  用於記錄圖層選取狀態
        if (layer.checked != undefined) {
            layer.checked = true;
        }

        MM.easymap.items.push(layer);
        if (this.map != null) {
            this.map.addItem(kml);
        }
        return kml;
    }
    MM.easymap.addVectorTile = function (layer, callback) {
        var op = {};
        op.bg = true;
        op.name = layer.LAYER_SN;
        op.chname = layer.NAME;
        op.url = 'https://maps.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=NKc1L4DU8rAW16aWI7Pa';
        op.styleUrl = layer.PATH;
        var vt = new dgSource('VectorTile', op);

        layer.id = layer.LAYER_SN;
        layer.instance = vt;
        MM.easymap.items.push(layer);
        this.map.addItem(vt);
        return vt;
    }
    MM.easymap.getWMS = function (layer, callback) {

        var options = {};
        var wmslayer = "";
        var srs = "EPSG:3826";
        var format = "image/png";

        if (layer.LAYER === "") {
            return null;
        } else if (layer.LAYER.indexOf(";") === -1) {
            return null;
        } else {
            var obj = MM.attrstr2object(layer.LAYER);

            if (obj.layer !== undefined && obj.layer !== null && obj.layer !== "") {
                wmslayer = obj.layer;
            }
            if (obj.srs !== undefined && obj.srs !== null && obj.srs !== "") {
                srs = obj.srs;
            }
            if (obj.format !== undefined && obj.format !== null && obj.format !== "") {
                format = obj.format;
            }
            options = {
                bg: false,
                name: 'wms-' + layer.id,
                url: layer.PATH,
                layer: wmslayer,
                matrixSet: srs,//'EPSG:3826',
                format: format//'image/png',
            }
        }

        var wms = new dgSource('WMS', options);

        return wms;
    }

    //# WMTS
    MM.easymap.addWMS = function (layer, callback) {

        var wms = this.getWMS(layer);

        this.map.addItem(wms);

        layer.id = layer.LAYER_SN;
        layer.instance = wms;
        MM.easymap.items.push(layer);

        if (callback != null) {
            callback();
        }
        return wms;
    }
    MM.easymap.getWMTS = function (layer, callback) {
        var layer_sn = layer.LAYER_SN;
        var url = layer.PATH;
        var matrixIds = [];
        var wmtslayer = "";
        var format = "image/png";
        var matrixSet = "EPSG:3857";
        var style = "";
        var op = {};


        if (layer.LAYER === "") {
            /*直接重url解析*/
            var questionPosition = layer.PATH.indexOf("?");
            url = url.substring(0, questionPosition);

            if (questionPosition < 0) {
                wmtslayer = url;
            } else {
                var params = layer.PATH.substring(questionPosition + 1, layer.PATH.length);
                var obj = MM.urlstr2object(params);

                if (obj.layer !== undefined && obj.layer !== null && obj.layer !== "") {
                    wmtslayer = obj.layer;
                }
                if (obj.format !== undefined && obj.format !== null && obj.format !== "") {
                    format = obj.format;
                }
                if (obj.matrixset !== undefined && obj.matrixset !== null && obj.matrixset !== "") {
                    matrixSet = obj.matrixset;
                }
                if (obj.style !== undefined && obj.style !== null && obj.style !== "") {
                    style = obj.style;
                    op.style = style;
                }
                if (obj.matrixid !== undefined && obj.matrixid !== null && obj.matrixid !== "") {
                    for (var i = 0; i < 26; ++i) {
                        matrixIds[i] = obj.matrixid + "_" + i;
                    }

                    op.matrixIds = matrixIds;
                }
            }


        } else if (layer.LAYER.indexOf(";") === -1) {
            /*只支援layer*/
            wmtslayer = layer.LAYER;
        } else {
            /*支援多個參數*/
            var obj = MM.attrstr2object(layer.LAYER);

            if (obj.layer !== undefined && obj.layer !== null && obj.layer !== "") {
                wmtslayer = obj.layer;
            }
            if (obj.format !== undefined && obj.format !== null && obj.format !== "") {
                format = obj.format;
            }
            if (obj.matrixset !== undefined && obj.matrixset !== null && obj.matrixset !== "") {
                matrixSet = obj.matrixset;
            }
            if (obj.tilematrixset !== undefined && obj.tilematrixset !== null && obj.tilematrixset !== "") {
                matrixSet = obj.tilematrixset;
            }
            if (obj.style !== undefined && obj.style !== null && obj.style !== "") {
                style = obj.style;
            }
            if (obj.matrixid !== undefined && obj.matrixid !== null && obj.matrixid !== "") {
                for (var i = 0; i < 26; ++i) {
                    matrixIds.push(obj.matrixid + "_" + i);
                }
                op.matrixIds = matrixIds;
            }
            if (obj.tilematrix !== undefined && obj.tilematrix !== null && obj.tilematrix !== "") {
                for (var i = 0; i < 26; ++i) {
                    matrixIds.push(obj.tilematrix + i);
                }
                op.matrixIds = matrixIds;
            }


        }
        if (layer.isbg == undefined) layer.isbg = false;
        op.bg = layer.isbg;
        op.thisid = layer.id;
        op.name = "WMTS_" + layer.id;
        op.iconMax = "";
        op.iconMin = "";
        op.url = layer.PATH;
        op.layer = wmtslayer;
        op.matrixSet = matrixSet;
        op.matrixIds = matrixIds;
        op.format = format;
        op.style = style;
        op.serverResolutions = null;
        var wmts = new dgSource("WMTS", op);

        return wmts;
    }
    MM.easymap.addWMTS = function (layer, callback) {

        var wmts = this.getWMTS(layer);

        this.map.addItem(wmts);


        layer.id = layer.LAYER_SN;
        layer.instance = wmts;
        MM.easymap.items.push(layer);

        if (callback != null) {
            callback();
        }
        return wmts;
    }
    MM.easymap.addArcGIS = function (layer, callback) {

        var l = this.getArcGIS(layer);

        this.map.addItem(l);


        layer.id = layer.LAYER_SN;;
        layer.instance = l;
        MM.easymap.items.push(layer);

        if (callback != null) {
            callback.apply();
        }
        return l;
    }
    MM.easymap.getArcGIS = function (layer, callback) {

        var url = layer.PATH;
        var arclayer = "";
        var token = "";
        var projection = "EPSG:3826";
        var opacity = 1;
        var transparent = true;

        if (layer.LAYER === "") {
        } else if (layer.LAYER.indexOf("=") === -1) {
            arclayer = layer.LAYER;
        } else {
            var obj = MM.attrstr2object(layer.LAYER);

            if (obj.layer !== undefined && obj.layer !== null && obj.layer !== "") {
                arclayer = obj.layer;
            }
            if (obj.token !== undefined && obj.token !== null && obj.token !== "") {
                token = obj.token;
            }
            if (obj.projection !== undefined && obj.projection !== null && obj.projection !== "") {
                projection = obj.projection;
            }
            if (obj.opacity !== undefined && obj.opacity !== null && obj.opacity !== "") {
                opacity = obj.opacity;
            }
            if (obj.transparent !== undefined && obj.transparent !== null && obj.transparent !== "") {
                transparent = obj.transparent;
            }
        }
        l = new dgSource("arcgis", {
            name: "ARCGIS_" + layer.id,
            chname: "crop",
            bg: false,
            iconMax: "imgs/interchangeable.png",
            iconMin: "imgs/mapF-2.png",
            url: url + token,
            projection: projection,//預設
            bg: false,
            opacity: opacity,
            transparent: transparent,
            layer: arclayer
        });
        layer.instance = l;
        return l;
    }

    //# 3D
    MM.easymap.get3D = function (layer) {
        var dataUrl = layer.PATH;
        var dgObj = new dg3D(layer.type, dataUrl);
        return dgObj;
    },
    MM.easymap.add3D = function (layer, callback) {
        //# Format Url
        var path = layer.kmlurl;
        if (MM.easymap.proxy != '') {
            for (var i = 0; i <= 10; i++) {
                path = path.replace('&amp;', '&');
                path = path.replace('&', '[and]');
                path = path.replace('?', '[question]');
            }
        }

        //# proxy
        var url = MM.easymap.proxy + path;
        //# 動態 Url
        url = MM.easymap._replaceQuery(layer, url);

        map.enable3D(function () {
            var queryString = MM.attrstr2object(layer.LAYER);   // 預設參數
            var opacity = 1;    // 透明度
            var setColor = '';  // 3D 物件顏色
            //#  預設參數
            if (queryString != null) {
                // 3D 物件類型
                if (queryString.enable3D != undefined) {
                    if (queryString.enable3D == '1') {
                        layer.type = queryString.type3D != undefined ? queryString.type3D.toLowerCase() : '';
                    }
                }

                //# 調整視野
                var lon = queryString.lon != undefined ? parseFloat(queryString.lon) : 0;
                var lat = queryString.lat != undefined ? parseFloat(queryString.lat) : 0;
                var zoomIndex = queryString.zoomIndex != undefined ? parseInt(queryString.zoomIndex) > 20 ? 20 : parseInt(queryString.zoomIndex) : 15;  // 最大至 20
                var elevAngel = queryString.elevAngel != undefined ? parseFloat(queryString.elevAngel) : null;   // 仰角
                //# 移動
                if (lon > 0 && lat > 0) {
                    map.zoomToXY(new dgXY(lon, lat), zoomIndex);
                }
                //# 仰角調整
                if (elevAngel != null) {
                    map.set3DTilt(elevAngel);
                }

                //var height = queryString.height != undefined ? queryString.height : 0;

                // 透明度
                opacity = queryString.setOpacity != undefined ? parseFloat(queryString.setOpacity) : 1;

                // 物件顏色
                setColor = queryString.setColor != undefined ? queryString.setColor : '';

                // 設定連動圖層
                if (queryString.extentLayers != undefined) {
                    var extentLayerId = queryString.extentLayers.split(','); // 連動圖層識別碼
                    for (var i = 0; i < extentLayerId.length; i++) {
                        var ententLayer = mmlayer.tree._layers.getById(extentLayerId[i]);
                        if (MM.easymap.in_zoom(ententLayer) == true)
                            MM.easymap.addItem(ententLayer);
                    }
                }
            }

            var obj = MM.easymap.get3D(layer);
            this.map.addItem(obj);

            map.set3DGltfsToGround(obj);    // 調整 3D 物件與地形貼齊

            //# 設定顏色
            if (setColor != '') {
                obj.setColor(setColor);      // 調整顏色
            }

            obj.setOpacity(opacity);      // 調整透明度

            layer.id = layer.LAYER_SN;
            layer.instance = obj;
            MM.easymap.items.push(layer);
            return obj;
        });
    }

    /// <summary>
    /// input:layer 等於layer的資料庫結構，只是沒使用這麼多欄位
    /// { LAYER_SN,TYPES,NAME,PATH,LAYER,MAXZ,MINZ}
    /// </summary>
    MM.easymap.addItem = function (layer, callback) {
        layer.id = layer.LAYER_SN;

        if (MM.easymap.items.getById(layer.id) != null) return false;

        var instance = null;
        //  依據圖層種類對應之套疊
        layer.kmlurl = '';
        switch (layer.TYPES.toLowerCase()) {
            case "vt":
                instance = this.addVectorTile(layer, callback);
                break;
            case "kml":
                layer.kmlurl = MM.easymap.uploadpath + "kml/" + layer.PATH;
                instance = this.addkml(layer, callback);
                break;
            case "url":
                layer.kmlurl = layer.PATH;
                instance = this.addkml(layer, callback);
                break;
            case 'google':
                instance = this.addGoogle(layer, callback);
                break;
            case "wms":
                instance = this.addWMS(layer, callback);
                break;
            case "wmts":
                instance = this.addWMTS(layer, callback);
                break;
            case 'arcgis':
                instance = this.addArcGIS(layer, callback);
                break;
            case '3d':
                layer.kmlurl = layer.PATH;
                instance = this.add3D(layer, callback);
                break;
        }

        //#  預設參數
        var queryString = MM.attrstr2object(layer.LAYER);
        if (queryString != null) {
            //  設定縮放級別
            if (queryString.zoom != undefined) {
                var zoom = parseInt(queryString.zoom);
                //  判斷是否為數字
                if (!isNaN(zoom) && zoom > 0) {
                    map.zoomTo(zoom);
                }
            }
            //  設定經緯度
            if (queryString.xy != undefined) {//xy = "121.23,21.57"
                var xy = queryString.xy;
                if (xy.indexOf(',') >= 0) {
                    var XY = xy.split(',');
                    var x = parseFloat(XY[0]);
                    var y = parseFloat(XY[1]);
                    var dgxy = new dgXY(x, y);
                    map.panTo(dgxy);

                }
            }

            // 設定連動圖層
            if (queryString.extentLayers != null) {
                var extentLayerId = queryString.extentLayers.split(','); // 連動圖層識別碼
                for (var i = 0; i < extentLayerId.length; i++) {
                    var ententLayer = mmlayer.tree._layers.getById(extentLayerId[i]);
                    if (MM.easymap.in_zoom(ententLayer) == true) MM.easymap.addItem(ententLayer);
                }
            }
        }
        return instance;
    }
    MM.easymap.removeItem = function (layer) {
        for (var i = 0; i < MM.easymap.items.length; i++) {
            var item = MM.easymap.items[i];
            if (layer.LAYER_SN == item.LAYER_SN) {

                var kmlid = item.instance._id;

                this.map.removeItem(item.instance);
                MM.easymap.items.indexPop(i);

                //# 預設參數
                var queryString = MM.attrstr2object(layer.LAYER);
                if (queryString != null) {
                    //# 延伸之圖層
                    if (queryString.extentLayers != undefined) {
                        var extentLayerId = queryString.extentLayers.split(','); // 延伸之圖層識別碼
                        for (var i = 0; i < extentLayerId.length; i++) {
                            var ententLayer = mmlayer.tree._layers.getById(extentLayerId[i]);
                            MM.easymap.removeItem(ententLayer);
                        }
                    }

                    //# 拖曳視窗
                    if (queryString.setDragInfo != undefined) {
                        for (var i = MM.easymap.dragInfos.length - 1; i >= 0; i--) {
                            var info = MM.easymap.dragInfos[i];

                            if (kmlid == info.kmlid) { //只清除該kml的popup

                                MM.easymap._removeDragInfoById(info.id);

                            }

                        }

                    }

                    //# 3D 地形圖
                    if (queryString.enable3DTerrain != undefined & queryString.enable3DTerrain == '1') {
                        $.when(map.disable3DTerrain()).then(function () {
                            //# 關閉地形圖時，須把其他圖層之高度調整至平地高度
                            for (var j = 0; j < map._items.length; j++) {
                                map.set3DGltfsToGround(map._items[j].items);
                            }
                        });
                    }
                }

                //# 用於記錄圖層選取狀態
                if (layer.checked != undefined) {
                    layer.checked = false;
                }

                break;
            }
        }
    }

    /// <summary>
    /// 動態URL
    /// </summary>
    MM.easymap.setQueryStringVar = function (layer_sn, varible, value) {

        var query = MM.easymap.getQueryString(layer_sn, varible);
        if (query != null) {
            query.value = value;
            return;
        }

        MM.easymap._queries.push({
            id: layer_sn,
            varible: varible,
            value: value,
            layer: layer
        });
    }
    MM.easymap.getQueryString = function (layer_sn, varible) {
        for (var i = 0; i < MM.easymap._queries.length; i++) {
            var q = MM.easymap._queries[i];
            if (q.id == layer_sn) {
                if (q.varible == varible) {
                    return q;
                }

            }
        }
    }
    MM.easymap.changeQueryStringVar = function (layer_sn, varible, value) {

        for (var i = 0; i < MM.easymap._queries.length; i++) {
            var q = MM.easymap._queries[i];
            if (q.id == layer_sn) {
                if (q.varible == varible) {
                    q.value = value;
                }

            }
        }
    }
    MM.easymap._replaceQuery = function (layer, path) {
        for (var i = 0; i < MM.easymap._queries.length; i++) {
            var q = MM.easymap._queries[i];
            if (q == null) continue;
            if (layer.LAYER_SN == q.id) {
                path = path.replace(q.varible, q.value);
                break;
            }
        }
        return path;
    }

    /// <summary>
    /// input:layer 等於layer的資料庫結構，只是沒使用這麼多欄位
    /// { LAYER_SN,TYPES,NAME,PATH,LAYER,MAXZ,MINZ}
    /// </summary>
    MM.easymap.in_zoom = function (layer) {
        var z = this.map.getZoom();

        var maxz = parseInt(layer.MAXZ);
        var minz = parseInt(layer.MINZ);

        if (maxz <= 0) maxz = 999;
        if (minz <= 0) minz = 0;

        if (z >= minz && z <= maxz) {
            return true;
        }

        return false;
    }

    //  Feature 縮放級別(Zoom)之可見範圍
    MM.easymap.zoomToVisibleBoundary = function (layer) {
        map.attachEvent('zoomend', function () {
            var zoomIndex = map.getZoom();
            for (var i = 0; i < layer.length; i++) {
                var layerId = layer[i].id;
                var checked = layer[i].checked; //  圖層選取狀態
                if (checked) {
                    //  是否顯示於地圖上
                    var isShow = MM.easymap.items.some(function (item) {
                        return item.id == layerId;
                    });

                    if (MM.easymap.in_zoom(layer[i])) {
                        if (!isShow) {  //  在縮放範圍，卻不在地圖上
                            MM.easymap.addItem(layer[i]);
                        }
                    }
                    else {
                        if (isShow) {   //  不在縮放範圍，卻在地圖上
                            MM.easymap.removeItem(layer[i]);
                            layer[i].checked = true;
                        }
                    }
                }
            }
        });
    }

    //# 拖曳視窗
    MM.easymap.setDragInfo = function (infoTitle, infoContent, contentSize, dgxy, kmlid, id, features) {


        var infoId = 'Drag-' + id;
        //# ID
        var info = {
            id: id,                // 唯一的
            infoId: infoId,      // drag panel id
            kmlid: kmlid,           // 判斷是哪個kml
            dgxy: dgxy,           // 初始點位
            line: null               // 拖曳線段
        }
        MM.easymap.dragInfos.push(info);

        //# contentPosition(視窗位置)
        var infoIndex = MM.easymap.dragInfos.length;
        infoWidth = MM.easymap.map.getWidth() / 2 + infoIndex * 10;
        infoHeight = MM.easymap.map.getHeight() / 2 + infoIndex * 10;
        contentPosition = 'left-top {0} {1}';
        contentPosition = contentPosition.replace('{0}', infoWidth);
        contentPosition = contentPosition.replace('{1}', infoHeight);

        var theme = 'primary';
        var testCallback = null;
        var beforeClose = null;
        var closed = function () {
            MM.easymap._removeDragInfoById(id);
        };
        var dragstop = function () {
            MM.easymap.connectDragInfo(id, true);
        };
        var reSize = function () {
            MM.easymap.connectDragInfo(id, true);
        };

        //# 支援多feature
        if (features && features.length >= 2) {

            MM.easymap._dragFeatures = [];
            MM.easymap._dragFeatures = features;

            var select = '';
            var options = [];
            features.forEach(function (f) {
                var { name } = f.values_;
                options.push('<option value="' + f.ol_uid + '">' + name + '</option>');
            });
            select = '<select class="form-control" onchange="MM.easymap._changeKMLContent(this.value,' + id + ');">' + options.join() + '</select>';
            infoContent = '<div style="text-align: right;padding:4px;">' + select + '</div><div id="MM-easymap-kml-content" style="height:100%">' + infoContent + '</div>';
        }

        MM.window.create(infoId, infoTitle, infoContent, contentSize, contentPosition, theme, testCallback, beforeClose, closed, dragstop, reSize);

        MM.easymap.connectDragInfo(id, false);

        //# 只需註冊一次
        if (MM.easymap.setDragInfoEvent != true) {
            MM.easymap.map.attachEvent('moveend', function () { MM.easymap.reLocatrDragInfo(); });
            MM.easymap.map.attachEvent('zoomend', function () { MM.easymap.reLocatrDragInfo(); });
        }
        MM.easymap.setDragInfoEvent = true;
    }
    MM.easymap.connectDragInfo = function (id, isRefresh) {

        if (MM.easymap.dragInfos.length <= 0) {
            return;
        }

        index = null;
        for (var i = 0; i < MM.easymap.dragInfos.length; i++) {
            var info = MM.easymap.dragInfos[i];
            if (info.id == id) {
                index = i;
                break;
            }
        }

        var info = MM.easymap._getDragInfoById(id);
        var dgxy = info.dgxy;
        var infoId = info.infoId;

        var infoWindow = document.getElementById(infoId); // drag infowindow
        baseMap = document.getElementById(this.map._targetId);
        infoWidth = (isRefresh ? infoWindow.offsetLeft - baseMap.getBoundingClientRect().left : baseMap.offsetWidth / 2 + index * 10 - baseMap.getBoundingClientRect().left) + infoWindow.offsetWidth / 2;
        infoHeight = (isRefresh ? infoWindow.offsetTop - baseMap.getBoundingClientRect().top : baseMap.offsetHeight / 2 + index * 10 - baseMap.getBoundingClientRect().top) + infoWindow.offsetHeight / 2;

        mapXY = this.map.revXY(infoWidth, infoHeight);

        var points = [];
        points.push(dgxy);  // 起點
        points.push(mapXY); // 迄點

        // 線段樣式
        var lineStyle = '';
        if (!isRefresh) {
            lineSyles = ['rgba(200,0,0,0.8)', 'rgba(0,200,0,0.8)', 'rgba(255,255,0,0.8)'];
            styleIndex = index % 3;
            lineStyle = lineSyles[styleIndex];


        }
        else {
            lineStyle = info.line._strokeStyle;
        }

        var line = new dgPolyline(points, lineStyle, 4);


        //# 虛線設定
        line._dash.lineDash = [5, 10];
        line._dash.lineCap = 'round';


        if (!isRefresh) {
            info.line = line;
        }
        else {

            this.map.removeItem(info.line);
            info.line = null;
            info.line = line;
        }

        this.map.addItem(line);
    }
    MM.easymap.reLocatrDragInfo = function () {
        for (var i = 0; i < MM.easymap.dragInfos.length; i++) {
            var info = MM.easymap.dragInfos[i];

            MM.easymap.connectDragInfo(info.id, true);
        }
    }
    MM.easymap._changeKMLContent = function (ol_uid, id) {
        var infoId = 'Drag-' + id;

        var feature = MM.easymap._dragFeatures.filter(function (f) {
            return f.ol_uid === ol_uid;
        });
        if (feature.length >= 1) {

            var { name, description } = feature[0].values_;

            $('#' + infoId + ' #MM-easymap-kml-content').html(description);
            $('#' + infoId + ' .jsPanel-title').text(name);
            $('.jconfirm-title').text(name);
        }

    }

    // =============================== control ===============================
    //<comment>
    // 以multigeometry格式additem 
    // 需引入jquery
    //</comment>
    MM.easymap.addItemInMultigeometystring = function (multigeometry, options) {

        //# LineString

        var xml = $.parseXML(multigeometry);
        if ($(xml).find("LineString").length >= 1) {
            var polylines = [];
            var points = [];
            var strokeColor = options.strokeColor;
            var width = options.width;
            if (strokeColor == null) strokeColor = "rgba(200,0,0,0.8)";
            if (width == null) width = 1;
            $(xml).find("LineString").each(function () {

                var coordinatestring = this.children[0].innerHTML;
                var coordinates = coordinatestring.split(' ');
                for (var j = 0; j < coordinates.length; j++) {
                    var xys = coordinates[j].split(',');
                    var x = xys[0];
                    var y = xys[1];
                    x = parseFloat(x);
                    y = parseFloat(y);
                    points.push(new dgXY(x, y));
                }
                polylines.push(new dgPolyline(points, strokeColor, width));
            });
            this.map.addItem(polylines);
        }

        return polylines;
    }

    MM.easymap.zoomToXY = function (lon, lat, zoom) {
        //zoomToXY
        var xxyy = new dgXY(lon, lat);
        this.map.zoomToXY(xxyy, zoom);
    }

    //<comment>
    // input: 120.63478,24.269617,0 120.635423,24.269558,0 120.635327,24.267993,0 
    //</comment>
    MM.easymap.zoomToXYByPolyline = function (polyline) {

        if (polyline.length <= 0) return null;

        var points = polyline.split(" ");

        if (points.length <= 1) return null;

        var left = 999;
        var right = 0;
        var top = 0;
        var bottom = 999;

        for (var i = 0; i < points.length; i++) {
            var P = points[i].split(",");
            if (P.length < 2) continue;
            var lon = P[0];
            var lat = P[1];

            try {
                lon = parseFloat(lon);
                lat = parseFloat(lat);

                if (lon <= left) left = lon;
                if (lon >= right) right = lon;
                if (lat >= top) top = lat;
                if (lat <= bottom) bottom = lat;
            } catch (err) {
                continue;
            }

        }

        var xy1 = new dgXY(left, top);
        var xy2 = new dgXY(right, bottom);

        this.map.getUpperZoomByBoundary(xy1, xy2);
    }
    MM.easymap.zoomToBoundaryByPolyline = function (polyline) {
        MM.easymap.zoomToXYByPolyline(polyline);
    }
    //<comment>
    // input: 120.63478,24.269617,0 120.635423,24.269558,0 120.635327,24.267993,0 
    //</comment>
    MM.easymap.zoomToBoundaryByMultigeometystring = function (multigeometry) {

        //#防呆
        if (multigeometry == null || multigeometry.length <= 0) { return; }

        //# 找出所有點
        var points = [];
        var xml = $.parseXML(multigeometry);
        if ($(xml).find("LineString").length >= 1) {

            $(xml).find("LineString").each(function () {

                var coordinatestring = this.children[0].innerHTML;
                var coordinates = coordinatestring.split(' ');
                for (var j = 0; j < coordinates.length; j++) {
                    var xys = coordinates[j].split(',');
                    var x = xys[0];
                    var y = xys[1];
                    x = parseFloat(x);
                    y = parseFloat(y);
                    points.push([x, y]);
                }
            });
        }

        //# find boundary
        if (points.length <= 0) return;

        var left = 999;
        var right = 0;
        var top = 0;
        var bottom = 999;

        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var lon = point[0];
            var lat = point[1];

            try {
                lon = parseFloat(lon);
                lat = parseFloat(lat);

                if (lon <= left) left = lon;
                if (lon >= right) right = lon;
                if (lat >= top) top = lat;
                if (lat <= bottom) bottom = lat;
            } catch (err) {
                continue;
            }

        }

        var xy1 = new dgXY(left, top);
        var xy2 = new dgXY(right, bottom);

        this.map.getUpperZoomByBoundary(xy1, xy2);
    }

    //<comment>
    // input: bbox = [left,bottom,right,top]
    //</comment>
    MM.easymap.zoomToBBOX = function (bbox) {
        var xy1 = new dgXY(bbox[0], bbox[3]);
        var xy2 = new dgXY(bbox[2], bbox[1]);

        this.map.getUpperZoomByBoundary(xy1, xy2);
    }
    //<comment>
    // input: dgxys = [dgxy,dgxy,dgxy,dgxy]
    //</comment>
    MM.easymap.zoomToBBOXByDgXYs = function (dgxys) {

        //# 防呆
        if (dgxys.length <= 1) return;

        let left = 999999999, bottom = 999999999, right = 0, top = 0;

        for (var i = 0; i < dgxys.length; i++) {
            var dgxy = dgxys[i];
            var x = dgxy.x;
            var y = dgxy.y;
            if (left > x) left = x;
            if (right < x) right = x;
            if (bottom > y) bottom = y;
            if (top < y) top = y;
        }
        MM.easymap.zoomToBBOX([left, bottom, right, top]);

    }
    //# urlstring to 物件
    MM.urlstr2object = function (str) {

        if (str === "") return null;

        var attrs = str.split('&');

        var obj = {};
        for (var i = 0; i < attrs.length; i++) {

            var attr = attrs[i];

            if (attr == "") continue;

            attr = attr.replace('=', '="');

            if (attr.indexOf('=') >= 0) {

                attr = attr.substring(0, attr.indexOf('=')).toLowerCase() + attr.substring(attr.indexOf('='), attr.length);
            }
            try { eval('obj.' + attr + '";'); } catch (err) { }

        }

        return obj;
    }
    //# 參數字串轉換物件
    MM.attrstr2object = function (str) {

        if (str == undefined) return null;
        if (str === "") return null;

        var attrs = null;
        if (str.indexOf(";") === -1) {
            if (str.indexOf("=") >= 0) {
                attrs = [];
                attrs.push(str);
            } else {
                return null;
            }

        } else {
            attrs = str.split(';');
        }
        var obj = {};
        for (var i = 0; i < attrs.length; i++) {

            var attr = attrs[i];

            if (attr == "") continue;

            attr = attr.replace('=', '="');

            if (attr.indexOf('=') >= 0) {

                attr = attr.substring(0, attr.indexOf('=')) + attr.substring(attr.indexOf('='), attr.length);
            }
            try { eval('obj.' + attr + '";'); } catch (err) { }

        }

        //統一參數格式小寫
        for (attr in obj) {
            obj[attr.toLowerCase()] = obj[attr];
        }

        return obj;
    }
    //# 測試KML參數
    MM.tryMapParam = function (mapid,url,params) {
        //# reset
        var div = document.getElementById(mapid);
        div.innerHTML = "";

        //# 
        var map = new Easymap(mapid);	//'map'為div的id
        var layer = {}
        var kml = MM.easymap.addkml(layer, function () {

        })
    }
})(MM);
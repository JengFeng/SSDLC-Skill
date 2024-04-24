var r = new RegExp("(^|(.*?\\/))(" + "mmeasymap.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');
    if (src == null) continue;
    if (src.toLowerCase().indexOf("mmjs") < 0) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}


if (ef != undefined && [].inArray == undefined)
    document.write('<script src="' + l + 'mmjs/base.js"></script>');

/////////////////////////////////////////////////////
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.easymap = {};
    MM.easymap.map = null;//圖台變數
    MM.easymap.ezLayer_upload = "";//kml|icon位址
    MM.easymap.items = [];
    /// <summary>
    /// kml
    /// </summary>
    MM.easymap.getKml = function (layer) {

        var layer_sn = layer.LAYER_SN;        var url = MM.easymap.ezLayer_upload + "kml/" + layer.PATH;        var kml = new dgKml(url, callback);

        return kml;
    }
    MM.easymap.addKml = function (layer, callback) {
        return this.addkml(layer, callback);
    }
    MM.easymap.addkml = function (layer, callback) {
        var kml = this.getKml(layer);        layer.id = layer_sn;        layer.instance = kml;        MM.easymap.items.push(layer);
        return this.map.addItem(kml);
    }
    /// <summary>
    /// kml_url
    /// </summary>
    MM.easymap.getKml_url = function (layer) {
        var layer_sn = layer.LAYER_SN;        var url = layer.PATH;        var kml = new dgKml(url, callback);
        return kml;
    }
    MM.easymap.addKml_url = function (layer, callback) {
        var kml = this.getKml_url(layer);        layer.id = layer_sn;        layer.instance = kml;        MM.easymap.items.push(layer);
        return this.map.addItem(kml);
    }


    /// <summary>
    /// WMTS
    /// </summary>
    MM.easymap.getWMTS = function (layer) {
        var layer_sn = layer.LAYER_SN;
        var url = layer.PATH;
        var matrixIds = new Array(26);
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
            var obj = ezlayer.attrstring_to_object(layer.LAYER);

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
        op.bg = false;
        op.thisid = layer.id;
        op.name = "WMTS_" + layer.id;
        op.iconMax = "imgs/interchangeable.png";
        op.iconMin = "imgs/mapF-2.png";
        op.url = layer.PATH;
        op.layer = wmtslayer;
        op.matrixSet = matrixSet;
        op.format = format;
        op.serverResolutions = null;
        var wmts = new dgSource("WMTS", op);

        return wmts;
    }
    MM.easymap.addWMTS = function (layer, callback) {

        var wmts = this.getWMTS(layer);

        this.map.addItem(wmts);


        layer.id = layer_sn;        layer.instance = wmts;        MM.easymap.items.push(layer);

        if (callback != null) {
            callback();
        }
    }
    /// <summary>
    /// input:layer 等於layer的資料庫結構，只是沒使用這麼多欄位
    /// { LAYER_SN,TYPES,NAME,PATH,LAYER,MAXZ,MINZ}
    /// </summary>
    MM.easymap.addItem = function (layer, callback) {

        layer.id = layer.LAYER_SN;

        if (MM.easymap.items.getById(layer.id) != null) return false;

        switch (layer.TYPES.toLowerCase()) {
            case "kml":
                return this.addkml(layer, callback);
            case "url":
                return this.addKml_url(layer, callback);
            case "wmts":
                return this.addWMTS(layer, callback);
        }
    }
    MM.easymap.removeItem = function (layer) {

        for (var i = 0; i < MM.easymap.items.length; i++) {
            var item = MM.easymap.items[i];
            if (layer.LAYER_SN == item.LAYER_SN) {
                this.map.removeItem(item.instance);
                MM.easymap.items.indexPop(i);
                break;
            }
        }

    }
    /// <summary>
    /// 
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


    ///==========================================================
    ///================== control ===============================
    ///==========================================================

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
            if (P.length <= 3) continue;
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

    //<comment>
    // input: bbox = { left:120.550199,top: 24.259507,right:120.893522,bottom:24.083477}
    //</comment>
    MM.easymap.zoomToBBOX = function (bbox) {
        var xy1 = new dgXY(bbox.left, bbox.top);
        var xy2 = new dgXY(bbox.right, bbox.bottom);

        this.map.getUpperZoomByBoundary(xy1, xy2);
    }
})(MM);




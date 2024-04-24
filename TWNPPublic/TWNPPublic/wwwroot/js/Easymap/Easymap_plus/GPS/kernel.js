
// 是否出現提示了
ezmapplus.GPS.isShowedTip = false;

(function (ezmapplus) {

    //# notification
    $.notify.defaults({
        globalPosition: 'bottom left'
    });
    //$.notify.addStyle('foo', {
    //    html:
    //      "<div>" +
    //        "<img src='" + ezmapplus.GPS.path + "images/clear.gif'/>工具可清除GPS標記"+
    //      "</div>"
    //});

    //# 開始
    ezmapplus.GPS.start = function (map) {

        //# 網址為 https 開頭才顯示
        var isHttps = document.location.protocol == 'https:' ? true : false;      
        if (!isHttps) {
            //return;
        }

        //# 設定圖台
        ezmapplus.GPS.map = map;
        mapWidth = ezmapplus.GPS.map.getWidth();
        mapHeight = ezmapplus.GPS.map.getHeight();
        //# 貼上icon(舊版)
        //var icon = ezmapplus.GPS.map.createDiv('gpsIcon', 0);
        //icon.id = "ezmapplus_gps_icon";
        //icon.innerHTML = '<img id="ezmapplus_gps_icon_img" src="' + ezmapplus.GPS.path + 'images/gps.png" style="width:' + ezmapplus.GPS.icon_width + 'px;height:' + ezmapplus.GPS.icon_height+ 'px;">';
        //icon.style.position = "fixed";

        //# 貼上 Icon (新版)
        var divIcon = '<div id="{0}" style="position: absolute;"> \
                        <img id="ezmapplus_gps_icon_img" src="{1}images/gps.png" style="width:{2}px;height:{3}px;"> \
                    </div>';
        divIcon = divIcon.replace('{0}', 'ezmapplus_gps_icon');
        divIcon = divIcon.replace('{1}', ezmapplus.GPS.path);
        divIcon = divIcon.replace('{2}', ezmapplus.GPS.icon_width);
        divIcon = divIcon.replace('{3}', ezmapplus.GPS.icon_height);
        $('#'+map._targetId+' div[easymap_id=easymap-createDiv-temp]').append(divIcon);
        var icon = document.getElementById('ezmapplus_gps_icon');

        if (ezmapplus.GPS.icon.left != "") {
            icon.style.left = ezmapplus.GPS.icon.left;

            if (ezmapplus.GPS.icon.top != "")
                icon.style.top = ezmapplus.GPS.icon.top;
            else if (ezmapplus.GPS.icon.bottom != "") {
                iconBottom = parseFloat(ezmapplus.GPS.icon.bottom);
                icon.style.bottom = ((mapHeight - ezmapplus.GPS.icon_width) * -1 + iconBottom) + 'px';
            }
        }
        else {
            iconRight = parseFloat(ezmapplus.GPS.icon.right);
            icon.style.left = (mapWidth -(iconRight + ezmapplus.GPS.icon_width) )+ 'px';

            if (ezmapplus.GPS.icon.top != "")
                icon.style.top = ezmapplus.GPS.icon.top;
            else if (ezmapplus.GPS.icon.bottom != "") {
                iconBottom = parseFloat(ezmapplus.GPS.icon.bottom);
                icon.style.top = (mapHeight - (ezmapplus.GPS.icon_width + iconBottom)) + 'px';
            }
        }

        if (ezmapplus.GPS.iconClick == null) {
            ezmapplus.GPS.iconClick = ezmapplus.GPS.iconClickDefault;
        }
        
        $("#ezmapplus_gps_icon_img").bind("click touchstart", ezmapplus.GPS.iconClick);
    }
    //icon click預設
    ezmapplus.GPS.iconClickDefault = function () {

        var options = {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: Infinity
        };
            
        /*  緯度, 經度, 精度(meter), 前進速度(meter/second), 前進方向(正北順時針角度), 海拔高度, 海拔高度精度(meter)
         *  Ex: “121.8894, 23.6757, 500, 2.5, 62, 400, 40”
         */
        if (ezmapplus.GPS.isWebmode == true) {
            ezmapplus.GPS.os = '';
        }
        switch (ezmapplus.GPS.os.toLowerCase()) {
            case "ios":
                callSwift.GetGps("SetGps", "GetGpsFail");//callSwift iphone 約定好變數
                break;
            case "android":
                // Andriod 有兩個公用變數 Android|app
                if (typeof Android !== 'undefined' || 
                    typeof app !== 'undefined') {
                    var p = null;
                    if (typeof Android !== 'undefined') {
                        p = Android.GetGps();  //Android 跟Android 溝通好 //回傳範例120.22xxx ,24.17xxx
                    }
                    if (typeof app !== 'undefined') {
                        p = app.GetGps();  //回傳範例24.17xxx,120.22xxx  
                        if (p.length <= 0 || p.indexOf(",") <= 0) {
                            $.notify("請再操作一次", "info");
                            return;
                        }
                        var tP = p.split(",");
                        p = tP[1] + "," + tP[0];
                    }
                    if (p.length <= 0 || p.indexOf(",") <= 0) {
                        $.notify("請再操作一次", "info");
                        return;
                    }

                    var P = p.split(",");

                    var lon = P[0];
                    var lat = P[1];
                    var accuracy = 500;
                    //看有沒有傳這個參數
                    if(P.length >= 3){
                        accuracy = P[2];
                    }
                    ezmapplus.GPS.success({
                        coords: {
                            accuracy: parseInt(accuracy),
                            longitude: parseFloat(lon),
                            latitude: parseFloat(lat)
                        }
                    });
                }d                     
                break;
            default:
                ezmapplus.GPS.geolocation();
                //$.notify("瀏覽器不支援GPS定位", "info");
                break;
        }
    }
    ezmapplus.GPS.ios_setGps = function (coords) {

        var P = coords.split(",");

        var lon = P[0];
        var lat = P[1];
        var accuracy = 500;
        //看有沒有傳這個參數
        if (P.length >= 3) {
            accuracy = P[2];
        }

        ezmapplus.GPS.success({
            coords: {
                accuracy: parseInt(accuracy),
                longitude: parseFloat(lon),
                latitude: parseFloat(lat)
            }
        });
    }
    //# GPS success
    ezmapplus.GPS.success = function (pos) {

        var crd = pos.coords;

        var accuracy = crd.accuracy;
        var lon = crd.longitude;
        var lat = crd.latitude;
        var z = ezmapplus.GPS.zoom;

        //# dgCurve
        if (accuracy <= 1) accuracy = 1;

        if (accuracy <= 100) z = z - 1;
        if (accuracy > 100 && accuracy <= 500) z = z;

        //# zoomToXY
        var xxyy = new dgXY(lon, lat);
        ezmapplus.GPS.map.zoomToXY(xxyy, z);

        //# highlight
        if (ezmapplus.GPS.isHighlight == true) {
            _EASYMAP.highlightXY(lon, lat);
        }
        

        var point = new dgXY(lon,lat);
        var stroke_rgba = "rgba(61,91,141,0.4)"; // 邊線的 RGBA
        var fill_rgba = "rgba(61,91,141,0.2)";   // 填滿的 RGBA
        var distance = accuracy;                 // 距離:公尺
        var stroke_width = 3;                    // 邊線寬
        var arcAngle1 = 0;                       // 起使角度
        var arcAngle2 = 360;                     // 結束角度
        var clockwise = false;                   // 順時針 true/ 逆時針 flase

        ezmapplus.GPS.clearPoint();

        if (ezmapplus.GPS.isRangeShowed == true){
            ezmapplus.GPS.point = new dgCurve(point, stroke_rgba, fill_rgba, distance, stroke_width, arcAngle1, arcAngle2, clockwise);
            ezmapplus.GPS.map.addItem(ezmapplus.GPS.point);
        }
        //# marker
        if (ezmapplus.GPS.isMarkerShowed == true) {
            if (ezmapplus.GPS.icon.src == undefined || ezmapplus.GPS.icon.src == null) {
                ezmapplus.GPS.icon.src = "data:image/png;base64,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";
            }
            ezmapplus.GPS.marker = new dgMarker(xxyy, "<span style='position:relative;left:-23px;top:-46px;'><img style='width:46px;height:46px;' src='" + ezmapplus.GPS.icon.src + "'></span>");
            ezmapplus.GPS.map.addItem(ezmapplus.GPS.marker);
        }


        if (ezmapplus.GPS.isTipShowed == true) {

            $.notify({
            }, {
                style: 'foo',
                autoHide: true,
                clickToHide: true
            });

            ezmapplus.GPS.isTipShowed = false;
        }
    };
    //# GPS error
    ezmapplus.GPS.error = function (err) {
        try {
            switch (err.code) {
                case 1://PERMISSION_DENIED	取得地理資訊失敗，因為此頁面沒有獲取地理位置信息的權限。
                    $.notify("該瀏覽器不支援http網站", "warm");
                    break;
                case 2://	POSITION_UNAVAILABLE	取得地理資訊失敗，因為至少有一個地理位置信息內的資訊回傳了錯誤。
                    $.notify("取得地理資訊失敗", "warm");
                    break;
                case 3://TIMEOUT	取得地理資訊超過時限，利用PositionOptions.timeout 來定義取得地理資訊的時限。

                    $.notify("取得目前GPS點位逾時", "warm");
                    break;
            }
        } catch (err) {
            $.notify("GPS定位失敗", "error");
            console.warn('ERROR(' + err.code + '): ' + err.message);
        }
    };

    //# 清除gps 標記
    ezmapplus.GPS.clearPoint = function () {

        //# circle
        if (ezmapplus.GPS.point != null) {
            ezmapplus.GPS.map.removeItem(ezmapplus.GPS.point);
            ezmapplus.GPS.point = null;
        }

        //# marker
        if (ezmapplus.GPS.marker != null) {
            ezmapplus.GPS.map.removeItem(ezmapplus.GPS.marker);
            ezmapplus.GPS.marker = null;
        }

    }

    //# bottom point
    ezmapplus.GPS.setPointBottom = function () {
        if (ezmapplus.GPS.point == null) return;

        try{
            map.mm.map.setLayerZIndex(map.mm.map.getLayersByName(ezmapplus.GPS.point.layer.name)[0], 1)
        }catch(err){}
        
    }

    //# 瀏覽器定位
    ezmapplus.GPS.geolocation = function () {
        var options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(ezmapplus.GPS.success, ezmapplus.GPS.error, options);
        }
    }

    function is_mobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }
    function get_os() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
            return 'iOS';
        }
        else if (userAgent.match(/Android/i)) {
            return 'Android';
        }
        else {
            return 'unknown';
        }
    }

    isMobile = is_mobile();
    os = get_os();

    ezmapplus.GPS.isMobile = isMobile;
    ezmapplus.GPS.os = os;
})(ezmapplus);


var _EASYMAP = {
    _highlightDuration: 3000,
    _highlightVector: null,
    _highLightArrow: null,

    highlightReset: function () {
        if (_EASYMAP._highlightVector != null) {
            map._olmap.removeLayer(_EASYMAP._highlightVector);
        }


        _EASYMAP._highlightVector = null;
    },
    highlightXY: function (x, y) {
        x = parseFloat(x);
        y = parseFloat(y);

        if (__ES6Support() == true) {
            _EASYMAP._highlightXY(x, y);
            setTimeout(function () { _EASYMAP._highlightXY(x, y); }, 500);
            setTimeout(function () { _EASYMAP._highlightXY(x, y); }, 1000);
        }
        else {
            _EASYMAP.hgihlightArrow(x, y);
        }
    },
    _highlightXY: function (x, y) {

        _EASYMAP.highlightReset();

        var source = new ol.source.Vector({
            wrapX: false
        });
        _EASYMAP._highlightVector = new ol.layer.Vector({
            source: source
        });
        map._olmap.addLayer(_EASYMAP._highlightVector);

        var geom = new ol.geom.Point(ol.proj.fromLonLat([x, y]));
        var feature = new ol.Feature(geom);


        source.on('addfeature', function (e) {
            _EASYMAP._flash(e.feature);
        });

        source.addFeature(feature);
    },
    _flash: function (feature) {
        var start = new Date().getTime();
        var listenerKey = map._olmap.on('postcompose', animate);

        function animate(event) {
            var vectorContext = event.vectorContext;
            var frameState = event.frameState;
            var flashGeom = feature.getGeometry().clone();
            var elapsed = frameState.time - start;
            var elapsedRatio = elapsed / _EASYMAP._highlightDuration;
            // radius will be 5 at start and 30 at end.
            var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
            var opacity = ol.easing.easeOut(1 - elapsedRatio);

            var style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 0.25 + opacity
                    })
                })
            });

            vectorContext.setStyle(style);
            vectorContext.drawGeometry(flashGeom);
            if (elapsed > _EASYMAP._highlightDuration) {
                ol.Observable.unByKey(listenerKey);
                return;
            }
            // tell OpenLayers to continue postcompose animation
            map._olmap.render();
            _EASYMAP.highlightReset();
            setTimeout(function () {
                _EASYMAP.highlightReset();
            }, _EASYMAP._highlightDuration);
        }
    },

    hgihlightArrow: function (x, y) {
        _EASYMAP.initHighLightArrow();
        iconHtml = '<span style="position:absolute;left:-20px;top:-50px;"><img src="./images/icon_arrows.gif" width="40px" height="40px" /></span>';
        _EASYMAP._highLightArrow = new dgMarker(new dgXY(x, y), iconHtml, false);
        map.addItem(_EASYMAP._highLightArrow);
    },
    initHighLightArrow: function () {
        if (_EASYMAP._highLightArrow != null) {
            map.removeItem(_EASYMAP._highLightArrow);
            _EASYMAP._highLightArrow = null;
        }
    },  // 清空舊有箭頭
    zoonToCoord: function (Lon, Lat, zIndex) {
        var xxyy = new dgXY(Lon, Lat);
        _EASYMAP.highlightXY(Lon, Lat);
        map.zoomToXY(xxyy, zIndex);

        //# 手機板調整(關閉主要目錄視窗及縮小內容視窗)
        if ($(window).width() < MinWidth) {
            Menu.hideAllMenu();
        }
    }
}	
/* 圖臺相關
 * Layer1.locateXY(lon, lat)            // 定位至該坐標
 * Layer1.locateXY(lon, lat, zoom, sec) // 定位至該坐標並縮放置該階層
 * Layer1.highLight(lon, lat)           // 標註坐標
 * Layer1.locateGps()                   // 標註及定位至使用者坐標
 * Layer1.hideBtn(name)                 // 隱藏按鈕(gps: 定位按鈕、layer: 圖層按鈕) e.g. Layer1.hideBtn('gps')、Layer1.hideBtn('layer')
 * Layer1.getAddressCoordinate(address) // 地址轉坐標服務
 * 
 */
(() => {
    if (typeof (Layer1) === 'undefined') var Layer1 = null; // 圖臺 1
    if (typeof (Layer2) === 'undefined') var Layer2 = null; // 圖臺 2
})();

function LayerMap() {
    //# Parameter
    this.inited = false;    // 是否初始化
    this.map = null;
    this.mapId = '';
    this.boxLayerId = '';
    this.version = 0;
    this.gps = {
        isOk: false,
        lon: 0,
        lat: 0
    }   // 使用者定位
    this.tempPoint = [];
    this.tempPolyline = [];
    this.tempPolygon = [];
    this.tempMarker = [];
    this.tempText = [];
    
    //# Public Function
    this.init = () => {
        this.map = new Easymap(this.mapId);
        this.map.zoomToXY(new dgXY(119.5715204969396, 23.631408207672038), 11.666);
        //# MMJS Easymap 設定
        switch (this.version) {
            case 1:
                MM.easymap.map = MapSelf.map;
                MM.easymap.proxy = GetFileProxyApi() + '?dataUrl=';
                MM.easymap.uploadpath = ((location.href.indexOf('localhost') < 0 ?
                    location.href.replace('#', '') :
                    origin) + '/uploadFiles/EzLayer/');   // 檔案路徑
                this.clearEasymapItems(MM.easymap.items, MM.easymap.map._items);
                break;
            case 2:
                MM.easymap2 = Object.assign({}, MM.easymap);
                MM.easymap.map = Layer1.map;
                MM.easymap2.map = this.map;
                MM.easymap2.proxy = GetFileProxyApi() + '?dataUrl=';
                MM.easymap2.uploadpath = ((location.href.indexOf('localhost') < 0 ?
                    location.href.replace('#', '') :
                    origin) + '/uploadFiles/EzLayer/');   // 檔案路徑
                this.clearEasymapItems(MM.easymap2.items, MM.easymap2.map._items);
                break;
        }
        let btn = GetBtn('layer');
        if (document.body.clientWidth >= 768) btn.classList.add('active');
        GpsInit();
        this.inited = true;
    }        // 初始化
    this.locateXY = (lon, lat, zoom, sec = 0) => {
        if (zoom === undefined) this.map.panTo(new dgXY(lon, lat));
        else this.map.panToXYZ(new dgXY(lon, lat), zoom, 1000 * sec);
    }   // 定位坐標
    this.locateGps = () => {
        //locateXY(this.gps.lon, this.gps.lat);
        this.map.panToXYZ(new dgXY(this.gps.lon, this.gps.lat), 18, 500);
        setTimeout(() => {
            MapSelf.highLight(MapSelf.gps.lon, MapSelf.gps.lat);
        }, 500);
        //this.map.zoomToXY(new dgXY(this.gps.lon, this.gps.lat), 18);
    }                // 定位使用者位置
    this.highLight = (lon, lat) => {
        if (lon == null || lat == null || lon == undefined || lat == undefined) return;
        this.map.highlightXY(new dgXY(lon, lat));
        setTimeout(function () { MapSelf.map.highlightXY(new dgXY(lon, lat)); }, 500);
        setTimeout(function () { MapSelf.map.highlightXY(new dgXY(lon, lat)); }, 1000);
    }        // 標註坐標
    this.switchBoxLayer = () => {
        var boxMap = document.getElementById(this.mapId),
            boxLayer = boxMap.parentNode.getElementsByClassName('layerBox');
        if (boxLayer.length == 0) return;
        boxLayer = boxLayer[0];
        boxLayer.className.indexOf('open') < 0 ? boxLayer.classList.add('open') : boxLayer.classList.remove('open');
    }           // 開關圖層視窗
    this.hideBtn = name => {
        let btn = GetBtn(name);
        if (btn === null) {
            console.log('Unfind Button');
            return;
        }
        btn.parentElement.style.display = 'none';
    }                // 隱藏按鈕
    this.getAddressCoordinate = address => {
        return getJsonData(GetAddressCoordinate(address), 'GET', null, '無地址轉坐標資料', '地址轉坐標資料錯誤');
    }   // 取得地址轉坐標服務
    this.clearEasymapItems = (list1, list2) => {
        while (list1.length > 0) { list1.splice(0, 1); }
        while (list2.length > 0) { list2.splice(0, 1); }
    }
    //# Private Function
    var MapSelf = this;
    var GetBtn = name => {
        let btnClass = '';
        switch (name) {
            case 'gps': btnClass = 'gpsSettingBtn'; break;
            case 'layer': btnClass = 'layerSettingBtn'; break;
        }
        var btn = document.getElementById(MapSelf.mapId).nextElementSibling.getElementsByClassName(btnClass);
        return btn.length > 0 ? btn[0] : null;
    }            // 取得按鈕
    var GpsInit = () => {
        if (navigator.geolocation) {
            var options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };
            navigator.geolocation.getCurrentPosition(gpsSucess, gpsFail, options);
        }
    },            // 定位初始化
        gpsSucess = (position) => {
            MapSelf.gps.isOk = true;
            var coord = position.coords,
                accuracy = coord.accuracy;
            MapSelf.gps.lon = coord.longitude;
            MapSelf.gps.lat = coord.latitude;
        },  // 定位成功
        gpsFail = (err) => {
            try {
                //if (err.code == 1) { }
            }
            catch (err) {
                alert('GPS 定位失敗');
            }
        }          // 定位失敗
    let getJsonData = (dataUrl, type, obj, noneMsg, errMsg, callback) => {
        let data = null,
            ajax = $.ajax({
                url: dataUrl,
                type: type,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                async: false,
                data: obj == null ? null : JSON.stringify(obj),
                success(result) {
                    if (!result == '') {
                        let l = JSON.parse(result);
                        if (typeof (callBack) != 'undefined') callBack.apply(l);
                        else data = l;
                    }
                    else console.log(noneMsg);
                },
                error(error) {
                    console.log(errMsg);
                }
            });
        ajax.always(function () { });
        return data != null ? data : [];
    }   // 取得 Json 資料
    return this;
}

//# 圖臺初始化
function EzMapInit(version, item) {
    console.log(`圖臺 ${version} 初始化`);
    window[`Layer${version}`] = null;
    var interval = setInterval(() => {
        if (!$('#' + item.mapId).length === 0) return;
        clearInterval(interval);
        window[`Layer${version}`] = new LayerMap();
        window[`Layer${version}`].map = item.map;
        window[`Layer${version}`].mapId = item.mapId;
        window[`Layer${version}`].boxLayerId = `#boxLayerWindow${version}`;
        window[`Layer${version}`].version = version;
        window[`Layer${version}`].init();
    }, 500);
}

//# 圖臺 1 初始化
function MapInit(map, mapId) {
    EzMapInit(1, { map: map, mapId: mapId });
}

//# 圖臺 2 初始化
function MapInit2(map, mapId) {
    EzMapInit(2, { map: map, mapId: mapId });
}
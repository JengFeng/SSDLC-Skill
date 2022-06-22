/* 圖臺相關
 * Layer1.locateXY(lon, lat)            // 定位至該坐標
 * Layer1.locateXY(lon, lat, zoom, sec) // 定位至該坐標並縮放置該階層
 * Layer1.highLight(lon, lat)           // 標註坐標
 * Layer1.locateGps()                   // 標註及定位至使用者坐標
 * Layer1.hideBtn(name)                 // 隱藏按鈕(gps: 定位按鈕、layer: 圖層按鈕) e.g. Layer1.hideBtn('gps')、Layer1.hideBtn('layer')
 * 
 */

(() => {
    if (typeof (Layer1) === 'undefined') var Layer1 = null; // 圖臺 1
    if (typeof (Layer2) === 'undefined') var Layer2 = null; // 圖臺 2
})();

function LayerMap() {
    //# Parameter
    this.map = null;
    this.mapId = '';  
    this.menu = {
        tree: [],
        id: 'boxLayer',  // 圖層目錄視窗_識別碼
        rootSn: '',
    }   // 目錄
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
        this.map.zoomToXY(new dgXY(119.46938925595306, 23.58302998317896), 11.666);
        //map.switchMapType('google');

        GpsInit();
        if (document.getElementById(this.menu.id) != null) {
            
        }
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
    this.clear = () => {

    }
    this.clearAllLayer = () => {

    }
    this.switchBoxLayer = () => {
        var boxMap = document.getElementById(this.mapId),
            boxLayer = boxMap.parentNode.getElementsByClassName('layerBox');
        if (boxLayer.length == 0) return;
        boxLayer = boxLayer[0];
        boxLayer.className.indexOf('open') < 0 ? boxLayer.classList.add('open') : boxLayer.classList.remove('open');
    }           // 開關圖層視窗
    this.hideBtn = (name) => {
        var btnClass = '';
        switch (name) {
            case 'gps': btnClass = 'layerSettingBtn'; break;
            case 'layer': btnClass = 'gpsSettingBtn'; break;
        }
        var btn = document.getElementById(MapSelf.mapId).nextElementSibling.getElementsByClassName(btnClass);
        if (btn.length == 0) {
            console.log('Finde Nothing Button Element');
            return;
        }
        btn[0].parentElement.style.display = 'none';
    }              // 隱藏按鈕
    //# Private Function
    var MapSelf = this;
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
    return this;
}

//# 圖臺 1 初始化
function MapInit(map, mapId) {
    console.log('圖臺 1 初始化');
    Layer1 = null;
    var interval = setInterval(() => {
        if (!$('#' + mapId).is(':visible')) return;
        clearInterval(interval);
        Layer1 = new LayerMap();
        Layer1.map = map;
        Layer1.mapId = mapId;
        Layer1.init();
    }, 500);
}

//# 圖臺 2 初始化
function MapInit2(map, mapId) {
    console.log('圖臺 2 初始化');
    Layer2 = null;
    var interval = setInterval(() => {
        if (!$('#' + mapId).is(':visible')) return;
        clearInterval(interval);
        Layer2 = new LayerMap();
        Layer2.map = map2;
        Layer2.mapId = mapId;
        Layer2.init();
    }, 500);
}
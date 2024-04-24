class dg3D {
    constructor(kind, url, op) {
        this.obj = {
            _easymapClass: null,
            src: null,
            _instance: null,
            _options: {
                scale: 1.0,
                dgxy: null,
                z: null,
                rotate: null,
                _easymapClass: null
            }
        };
        switch (kind) {
            case 'gltf':
                //From : https://nlscsample.pilotgaea.com.tw/demo/Reference/ov.CustomLayer.html
                this.obj._easymapClass = 'gltf';
                this.obj._layerType = 'gltf';
                this.obj._options._easymapClass = 'gltf';
                this.obj.src = url;
                if (typeof (op) == "object") {
                    for (var k in op) {
                        this.obj._options[k] = op[k];
                    }
                }
                return this.obj;
                break;
            case '3dtiles':
                this.obj._easymapClass = '3dtiles';
                this.obj._layerType = '3dtiles';
                this.obj._options._easymapClass = '3dtiles';
                this.obj.src = url;
                if (typeof (op) == "object") {
                    for (var k in op) {
                        this.obj._options[k] = op[k];
                    }
                }
                return this.obj;
                break;
            case 'modelset_acute3d':
                this.obj._easymapClass = 'modelset_acute3d';
                this.obj._layerType = 'modelset_acute3d';
                this.obj._options._easymapClass = 'modelset_acute3d';
                this.obj.src = url;
                if (typeof (op) == "object") {
                    for (var k in op) {
                        this.obj._options[k] = op[k];
                    }
                }
                return this.obj;
                break;
        }
    }
}
class dgXY {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.xy = [x, y];
        this.lon = x;
        this.lat = y;
        this.yx = [y, x];
        this.os = false;
        this.customLayer = null;
        return this;
    }
}
class Easymap {
    constructor(easymap_dom_id, obj) {
        var terrainview = null;
        if (easymap_dom_id == null || document.getElementById(easymap_dom_id) == null) {
            console.log("請先指定 map id ...");
            return;
        }
        this.terrainview = new window.ov.TerrainView(easymap_dom_id);
        if (obj == null || typeof (obj) != "object") {

            this.terrainview_obj = {
                url: "http://127.0.0.1:8080",
                //identifier: "範例地形圖",
                //urlTemplate: "https://nlscsample.pilotgaea.com.tw/Oview.aspx?{URL}",
                identifier: "terrain",
                urlTemplate: "http://140.110.122.78/gis_uri/Oview.aspx?{URL}",
                callback: function () {
                    /*this.terrainview.setBaseLayer({
                        url: "GOOGLE_MAP",
                        identifier: "IMAGE",
                        urlTemplate: this.terrainview_obj.urlTemplate //"https://nlscsample.pilotgaea.com.tw/Oview.aspx?{URL}"
                    });
                    */
                    //預設為 EMAP5
                    this.switchMapType("GOOGLE_MAP");
                    //預設 pan 到台灣
                    this.goXY(new dgXY(120.651, 24.178));
                    this.zoomTo(12);
                    if (typeof (this.load) == "function") {
                        this.load(); //excute
                    }
                    if (typeof (this.onload) == "function") {
                        this.onload();
                    }
                }.bind(this)
            };
            this.terrainview.openTerrain(this.terrainview_obj);
        }
        else {
            if (obj.url == null) {
                console.log("需定義 url : mapserver url，如：http://127.0.0.1:8080");
                return;
            }
            if (obj.urlTemplate == null) {
                console.log("需定義 urlTemplate : oview.aspx url，如：https://nlscsample.pilotgaea.com.tw/Oview.aspx?{URL}");
                return;
            }
            if (obj.identifier == null) {
                console.log("需定義 identifier : \"範例地型圖\"");
                return;
            }
            this.terrainview_obj = Object.assign({}, obj);
            this.terrainview.openTerrain(this.terrainview_obj);
        }


        this.oview_url = this.terrainview_obj.urlTemplate; //location.origin + "/3dweb-demo/oview.aspx?{URL}",
        this._googleZ = {
            24: 70.53107625,
            23: 141.0621525,
            22: 282.124305,
            21: 564.24861,
            20: 1128.497220,
            19: 2256.994440,
            18: 4513.988880,
            17: 9027.977761,
            16: 18055.955520,
            15: 36111.911040,
            14: 72223.822090,
            13: 144447.644200,
            12: 288895.288400,
            11: 577790.576700,
            10: 1155581.153000,
            9: 2311162.307000,
            8: 4622324.614000,
            7: 9244649.227000,
            6: 18489298.450000,
            5: 36978596.910000,
            4: 73957193.820000,
            3: 147914387.600000,
            2: 295828775.300000,
            1: 591657550.500000
        };
    }
    addItem(items) {
        if (Array.isArray(items) == false) items = [items];
        for (var i in items) {
            switch (items[i]['_layerType']) {
                case 'gltf':
                    if (this.customLayer == null) {
                        this.customLayer = this.terrainview.addCustomLayer({
                            layername: "custom"
                        });
                    }
                    //var _cl = new ov.CustomLayer();
                    //console.log(items[i]);
                    //https://nlscsample.pilotgaea.com.tw/demo/Reference/ov.CustomLayer.html#addGLTFEntity
                    var data = {
                        src: items[i]['src'],
                        position:
                            new GeoPoint(items[i]['_options']['dgxy']['x'],
                                items[i]['_options']['dgxy']['y'],
                                this.getXYGroundHeight(
                                    new dgXY(items[i]['_options']['dgxy']['x'], items[i]['_options']['dgxy']['y'])) + items[i]['_options']['z']
                            ),
                        earthCentered: true,
                        scale: items[i]['_options']['scale'],
                        rotate: { x: 0, y: 0, z: 0, w: 0 },
                        minRange: 20,
                        boundingSphereRadius: 0.0
                    };
                    items[i]['_instance'] = this.terrainview.addGLTFEntity(data); //this.customLayer.addGLTFEntity(data);
                    console.log(data);
                    //From : https://codesandbox.io/s/gltfentity-xgksu?file=/main.js:822-889          
                    //加入
                    //items[i]['_instance'] = this.terrainview.addGLTFEntity(data);
                    break;
                case '3dtiles':
                    //From : https://codesandbox.io/s/3dtiles-j7i5q
                    //console.log(items[i]['src']);
                    var data = {
                        url: items[i]['src'],
                        maximumScreenSpaceError: 1, //數字越大越糊                        
                        urlTemplate: this.oview_url,
                        callback: function (success, layer, data) {
                            //data.setResolutionScale(4);
                            if (success) {
                                //設定變數給圖層後，goto()直接前往圖層位置
                                //b3dtiles = layer;
                                //b3dtiles.goto();
                                /*
                                console.log("1 : ");
                                console.log(success);
                                console.log("2 : ");
                                console.log(layer);
                                console.log("3 : ")
                                console.log(data);
                                */
                                items[i]['_instance'] = data;
                            } else {
                                console.log("載入3DTiles不成功");
                            }
                        }.bind(items, i)
                    }
                    this.terrainview.add3DTilesLayer(data);
                    break;
                case 'modelset_acute3d':
                    var data = {
                        url: "http://127.0.0.1:8080",
                        identifier: items[i]['src'], //"shp_Zhubei",
                        urlTemplate: this.oview_url,
                        callback: function (success, layer) {
                            console.log("modelset_acute3d");
                            console.log(success);
                            console.log(layer);
                            /*if (success) {
                              //設定變數給圖層後，goto()直接前往圖層位置
                              modelset = layer;
                              modelset.goto();
                              terrainview.addTerrainWMTSOverlay(
                                {
                                  url: "http://wmts.nlsc.gov.tw/wmts/",
                                  identifier: "LUIMAP05",
                                  layername: "LUIMAP05",
                                  epsg: 3857,
                                  urlTemplate: "https://mapserver.pilotgaea.com.tw/Oview.aspx?{URL}"
                                },
                                function (info) {
                                  wmts = info;
                  	
                                  // 設定要疊加在ModelSetLayer上的WMTSOverlay圖層名稱，需先自行加WMTSOverlay
                                  // ov.ModelSetLayer.setOverlayName(layerName)
                                  // @param {string} layerName 疊加的WMTSOverlay圖層名稱
                                  // @return {bool} 是否設定成功
                                  modelset.setOverlayName("LUIMAP05");
                                }
                              );
                            } else {
                              console.log("傾斜攝影不成功");
                            }
                            */
                        }
                    };
                    //addacute3dlayer
                    items[i]['_instance'] = this.terrainview.addAcute3DLayer(data);
                    break;
            }
        }
    }
    switchMap(map_name) {
        this.switchMapType(map_name)
    }
    switchMapType(map_name) {
        map_name = map_name.toUpperCase();
        if (this._lastWMTSOverlay != null) {
            this.terrainview.removeTerrainOverlay(this._lastWMTSOverlay);
            this._lastWMTSOverlay = null;
        }
        switch (map_name) {
            case "EMAP5":
                //From : https://codesandbox.io/s/changewmts-oi5l5?file=/main.js
                (function (_easymap) {
                    window.ov.getWMTSLayerInfo("https://wmts.nlsc.gov.tw/wmts", (result) => {
                        if (result != null) {
                            if (result.url !== undefined) {
                                //createcheckbox(result.url, result.identifier, result.epsg);
                                //console.log(_easymap);                
                                _easymap._lastWMTSOverlay = {
                                    url: "http://wmts.nlsc.gov.tw/wmts/" + result.url,
                                    identifier: "EMAP5",
                                    layername: "EMAP5",
                                    epsg: result.epsg,
                                    urlTemplate: _easymap.oview_url, //"https://nlscsample.pilotgaea.com.tw/Oview.aspx?{URL}"
                                };
                                _easymap.terrainview.addTerrainWMTSOverlay(_easymap._lastWMTSOverlay);
                            }
                        }
                    });
                })(this);
                break;
            case "BING_MAP":
                this.terrainview.setBaseLayer({
                    url: "BING_MAP",
                    identifier: "IMAGE",
                    urlTemplate: "{URL}"
                });
                break;
            case "BING_MAP_VECTOR":
                this.terrainview.setBaseLayer({
                    url: "BING_MAP",
                    identifier: "VECTOR",
                    urlTemplate: "{URL}"
                });
                break;
            case "BING_MAP_VECTOR_IMAGE":
                this.terrainview.setBaseLayer({
                    url: "BING_MAP",
                    identifier: "VECTOR_IMAGE",
                    urlTemplate: "{URL}"
                });
                break;
            case "OSM":
                this.terrainview.setBaseLayer({
                    url: "OSM",
                    identifier: "",
                    urlTemplate: "{URL}"
                });
                break;
            case "GOOGLE_MAP":
                this.terrainview.setBaseLayer({
                    url: "GOOGLE_MAP",
                    identifier: "IMAGE",
                    urlTemplate: "{URL}"
                });
                break;
            case "GOOGLE_MAP_VECTOR":
                this.terrainview.setBaseLayer({
                    url: "GOOGLE_MAP",
                    identifier: "VECTOR",
                    urlTemplate: "{URL}"
                });
                break;
            case "GOOGLE_MAP_VECTOR_IMAGE":
                this.terrainview.setBaseLayer({
                    url: "GOOGLE_MAP",
                    identifier: "VECTOR_IMAGE",
                    urlTemplate: "{URL}"
                });
                break;
        }


    }
    goXY(dgxy) {
        if (typeof (dgxy.os) == "undefined") {
            console.log("需傳入 dgXY...，如 new dgXY(121,23) ");
            return false;
        }
        //畫面移至坐標
        var initialPos = new window.GeoPoint(
            parseFloat(dgxy.x),
            parseFloat(dgxy.y),
            this.terrainview.getHeightAboveGround()
        );
        var initialV = new window.Geo3DPoint(0, 0, -1);
        var initialUp = new window.Geo3DPoint(0, 1, 0);
        var initialCamera = new window.ov.Camera(initialPos, initialV, initialUp);
        this.terrainview.gotoCamera(initialCamera, false);
    }
    panTo(dgxy) {
        if (typeof (dgxy.os) == "undefined") {
            console.log("需傳入 dgXY...，如 new dgXY(121,23) ");
            return false;
        }
        //畫面移至坐標
        var initialPos = new window.GeoPoint(
            parseFloat(dgxy.x),
            parseFloat(dgxy.y),
            this.terrainview.getHeightAboveGround()
        );
        var initialV = new window.Geo3DPoint(0, 0, -1);
        var initialUp = new window.Geo3DPoint(0, 1, 0);
        var initialCamera = new window.ov.Camera(initialPos, initialV, initialUp);
        this.terrainview.gotoCamera(initialCamera, true);
    }
    set3DTilt(val) {
        //設定所見角       
        var xy = this.getXY();
        //畫面移至坐標
        var initialPos = new window.GeoPoint(
            parseFloat(xy.x),
            parseFloat(xy.y),
            this.getZ()
        );
        var initialV = new window.Geo3DPoint(val, 0, -1); //0~5
        var initialUp = new window.Geo3DPoint(0, 1, 0);
        var initialCamera = new window.ov.Camera(initialPos, initialV, initialUp);
        this.terrainview.gotoCamera(initialCamera, true);
    }
    getXY() {
        var xyz = this.terrainview.camera.pos;
        return new dgXY(xyz.x, xyz.y);
    }
    getXYZ() {
        var o = this.getXY();
        o['z'] = this.terrainview.getHeightAboveGround();
        return o;
    }
    getZ() {
        var o = this.getXYZ();
        return o['z'];
    }
    getZoomLevel() {
        return this.getZoom();
    }
    getZoom() {
        var h = this.getZ();
        var ks = Object.keys(this._googleZ);
        for (var i = 0, max_i = ks.length - 1; i < max_i; i++) {
            //if (h < this._googleZ[ks[i]]) return ks[i];
            if (h >= this._googleZ[ks[i]] && h < this._googleZ[ks[i + 1]]) {
                return ks[i];
            }
            if (h > this._googleZ[ks[i + 1]]) return ks[i + 1];
        }
    }
    setZoomLevel(z) {
        this.zoomTo(z);
    }
    zoomTo(z) {

        //畫面移至坐標
        var nowXY = this.getXY();
        var initialPos = new window.GeoPoint(
            nowXY.x,
            nowXY.y,
            this._googleZ[z]
        );
        var initialV = new window.Geo3DPoint(0, 0, -1);
        var initialUp = new window.Geo3DPoint(0, 1, 0);
        var initialCamera = new window.ov.Camera(initialPos, initialV, initialUp);
        this.terrainview.gotoCamera(initialCamera, false);
    }
    _p_4326_to_geoP(lon, lat) {
        //將 4326 坐標轉 世界坐標
    }
    getXYGroundHeight(dgXY) {
        //取某位置的地表高度
        //https://nlscsample.pilotgaea.com.tw/demo/Reference/ov.TerrainView.html#getAbsHeight
        var geopoint = new GeoPoint(dgXY.x, dgXY.y);
        //console.log(geopoint);
        //https://nlscsample.pilotgaea.com.tw/demo/Reference/ov.TerrainView.html#getAbsHeight
        var z = this.terrainview.getAbsHeight(geopoint, 4326);
        return z;
    }
    setSeaEnable(val) {
        this.terrainview.enableSea = val;
    }
    getSeaEnable() {
        return this.terrainview.enableSea;
    }
    setSeaQuality(val) {
        //海水的品質
        //0~3 low~very high    
        var quality = "normal";
        switch (val) {
            case "0":
            case "low":
                quality = "low";
                break;
            case "1":
            case "normal":
                quality = "normal";
                break;
            case "2":
            case "high":
                quality = "high";
                break;
            case "3":
            case "very high":
                quality = "very high";
                break;
            default:
                break;
        }
        this.terrainview.setSeaQuality(quality);
    }
    getSeaQuality() {
        return this.terrainview.EnableSea;
    }
    setSeaAltitude(value) {
        this.terrainview.setSeaAltitude(parseFloat(value));
    }
}
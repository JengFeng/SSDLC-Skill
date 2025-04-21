class Wind3D {
    constructor(mapObj, panel, mode) {
        //data 傳入值為 gfs.json
        var options = {
            // use Sentinel-2 instead of the default Bing Maps because Bing Maps sessions is limited
            imageryProvider: new Cesium.IonImageryProvider({ assetId: 3954 }),
            baseLayerPicker: false,
            geocoder: false,
            infoBox: false,
            fullscreenElement: mapObj._olcesium.ol3d.container_, //'cesiumContainer',
            // useBrowserRecommendedResolution can be set to false to improve the render quality
            // useBrowserRecommendedResolution: false,
            scene3DOnly: true
        }

        if (mode.debug) {
            options.useDefaultRenderLoop = false;
        }


        this.viewer = mapObj._olcesium.ol3d.getDataSourceDisplay(); //new Cesium.Viewer(jsDom, options); //'cesiumContainer',
        this.scene = this.viewer.scene;
        this.camera = this.viewer.scene.camera;
        this._easymap = mapObj;
        this.panel = panel;
        this.panel._easymap = mapObj;

        this.viewerParameters = {
            lonRange: new Cesium.Cartesian2(),
            latRange: new Cesium.Cartesian2(),
            pixelSize: 0.0
        };
        // use a smaller earth radius to make sure distance to camera > 0
        this.globeBoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0.99 * 6378137.0);
        this.updateViewerParameters();

        //Gis John
        this._isRun = true;
        this.enable = function (tf) {
            this._isRun = tf;
            this.scene.primitives.show = tf;
        };
        this.runLoadData = function () {

            DataProcess.loadData().then(
                (data) => {
                    console.log("原始資料:");
                    //console.log(data);
                    //window['wtf'] = data;
                    /*
                    {
                        U: {array:[],min:,max:},
                        V: {array:[],min:,max:},
                        dimensions: {lon:, lat:, lev: } //格數
                        lat:{array:[-90~90] (step 0.5), max:90,min:-90} // 360個
                        lon:{array:[0~360] (step 0.5), max:360,min:0} // 720個
                        lev:{array:[1],max:1,min:1} // 1個
                    }
                    */
                    if (this._easymap.my3DWindy._runData != null) {

                        //有自定資料，載入氣象局的 data []
                        if (this._easymap.my3DWindy._runData.length != 2) {
                            console.log("json 資料格式錯誤，應該要有 array 2 (U、V)");
                            return;
                        }
                        //氣象局->3dwindy 用的格式
                        var latarr = [];
                        for (var i = this._easymap.my3DWindy._runData[0]['header']['la2']; i <= this._easymap.my3DWindy._runData[0]['header']['la1']; i += 0.5) {
                            latarr.push(i);
                        }
                        var lonarr = [];
                        for (var i = this._easymap.my3DWindy._runData[0]['header']['lo1']; i <= this._easymap.my3DWindy._runData[0]['header']['lo2']; i += 0.5) {
                            lonarr.push(i);
                        }
                        data = {
                            U: { "array": new Float32Array(this._easymap.my3DWindy._runData[0]['data'].slice()), min: Math.min(...this._easymap.my3DWindy._runData[0]['data']), max: Math.max(...this._easymap.my3DWindy._runData[0]['data']) },
                            V: { "array": new Float32Array(this._easymap.my3DWindy._runData[1]['data'].slice()), min: Math.min(...this._easymap.my3DWindy._runData[1]['data']), max: Math.max(...this._easymap.my3DWindy._runData[1]['data']) },
                            dimensions: { lon: this._easymap.my3DWindy._runData[0]['header']['nx'], lat: this._easymap.my3DWindy._runData[0]['header']['ny'], lev: 1 },
                            lev: { "array": new Float32Array([1]), min: 1, max: 1 },
                            lat: { "array": new Float32Array(latarr), min: this._easymap.my3DWindy._runData[0]['header']['la2'], max: this._easymap.my3DWindy._runData[0]['header']['la1'] },
                            lon: { "array": new Float32Array(lonarr), min: this._easymap.my3DWindy._runData[0]['header']['lo1'], max: this._easymap.my3DWindy._runData[0]['header']['lo2'] }
                        }
                        //alert('gg');
                    }
                    this.particleSystem = new ParticleSystem(this.scene.context, data, this.panel.getUserInput(), this.viewerParameters);
                    this.addPrimitives();

                    this.setupEventListeners();

                    //if (mode.debug) {
                    //this.debug();
                    //}
                });

        }
        //this.imageryLayers = this.viewer.imageryLayers;
        //這個不用
        //這個是套 wms 之類的
        //this.setGlobeLayer(this.panel.getUserInput());
        this.runLoadData();
    }

    addPrimitives() {
        // the order of primitives.add() should respect the dependency of primitives
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.calculateSpeed);
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updatePosition);
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingPosition);

        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.segments);
        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.trails);
        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.screen);
    }

    updateViewerParameters() {
        var viewRectangle = this.camera.computeViewRectangle(this.scene.globe.ellipsoid);
        var lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle);
        this.viewerParameters.lonRange.x = lonLatRange.lon.min;
        this.viewerParameters.lonRange.y = lonLatRange.lon.max;
        this.viewerParameters.latRange.x = lonLatRange.lat.min;
        this.viewerParameters.latRange.y = lonLatRange.lat.max;

        var pixelSize = this.camera.getPixelSize(
            this.globeBoundingSphere,
            this.scene.drawingBufferWidth,
            this.scene.drawingBufferHeight
        );

        if (pixelSize > 0) {
            this.viewerParameters.pixelSize = pixelSize;
        }
    }

    setGlobeLayer(userInput) {
        this.viewer.imageryLayers.removeAll();
        //this.scene.imageryLayers.removeAll(); //By John
        this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

        var globeLayer = userInput.globeLayer;
        switch (globeLayer.type) {
            case "NaturalEarthII": {
                this.viewer.imageryLayers.addImageryProvider(
                    new Cesium.TileMapServiceImageryProvider({
                        url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
                    })
                );
                break;
            }
            case "WMS": {
                this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                    url: userInput.WMS_URL,
                    layers: globeLayer.layer,
                    parameters: {
                        ColorScaleRange: globeLayer.ColorScaleRange
                    }
                }));
                break;
            }
            case "WorldTerrain": {
                this.viewer.imageryLayers.addImageryProvider(
                    new Cesium.IonImageryProvider({ assetId: 3954 })
                );
                this.viewer.terrainProvider = Cesium.createWorldTerrain();
                break;
            }
        }
    }

    setupEventListeners() {
        const that = this;

        this.camera.moveStart.addEventListener(function () {
            that.scene.primitives.show = false;
        });

        this.camera.moveEnd.addEventListener(function () {
            that.updateViewerParameters();
            that.particleSystem.applyViewerParameters(that.viewerParameters);

            that.scene.primitives.show = that._isRun; //true;
        });

        var resized = false;
        window.addEventListener("resize", function () {
            resized = true;
            that.scene.primitives.show = false;
            that.scene.primitives.removeAll();
        });

        this.scene.preRender.addEventListener(function () {
            if (resized) {
                that.particleSystem.canvasResize(that.scene.context);
                resized = false;
                that.addPrimitives();
                that.scene.primitives.show = that._isRun; //true;
            }
        });

        window.addEventListener('particleSystemOptionsChanged', function () {
            that.particleSystem.applyUserInput(that.panel.getUserInput());
        });
        window.addEventListener('layerOptionsChanged', function () {
            that.setGlobeLayer(that.panel.getUserInput());
        });
    }

    debug() {
        const that = this;

        var animate = function () {
            that.viewer.resize();
            that.viewer.render();
            requestAnimationFrame(animate);
        }

        var spector = new SPECTOR.Spector();
        spector.displayUI();
        spector.spyCanvases();

        animate();
    }
}

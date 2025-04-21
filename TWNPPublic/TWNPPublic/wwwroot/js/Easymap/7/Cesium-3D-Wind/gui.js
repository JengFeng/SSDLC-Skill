//var demo = Cesium.defaultValue(demo, false);
// 使用相對路徑引用 a.js 文件
var scriptTags = document.getElementsByTagName('script');
var dn = "";
//console.log(scriptTags);
Array.from(scriptTags).map(function (item) {
    if (item.src.toLowerCase().indexOf('easymap/easymap.js') != -1) {
        var path = new URL(item.src).pathname;
        // 獲取路徑的最後一個斜槓的索引
        var lastSlashIndex = path.lastIndexOf('/');
        // 截取路徑，去掉最後一個斜槓以及之後的部分
        dn = path.substring(0, lastSlashIndex + 1);
        return;
        //console.log(dn);
    }
});
const fileOptions = {
    ////demo ? 'https://raw.githubusercontent.com/RaymanNg/3D-Wind-Field/master/data/' : 'data/',
    dataDirectory: dn + '/data/', //這裡是指 Easymap/data
    dataFile: "demo.nc", //netcdf 檔
    glslDirectory: dn + '/7/Cesium-3D-Wind/glsl/' ///demo ? '../Cesium-3D-Wind/glsl/' : 'easymap/7/Cesium-3D-Wind/glsl/'
}

/*
  //垂直看 map.get3DTilt() = 0
  //斜45度看 map.get3DTilt()  = 1
  level 3.965 {
      maxParticles: 20000,
      particleHeight: 1.0, //離地 1米
      fadeOpacity: 0.995,
      dropRate: 0.024,
      dropRateBump: 0.01,
      speedFactor: 0.2,
      lineWidth: 2.5
  }
  level 13.93 {
      maxParticles: 300,
      particleHeight: 1.0, //離地 1米
      fadeOpacity: 0.942,
      dropRate: 0.013,
      dropRateBump: 0.26,
      speedFactor: 0.3,
      lineWidth: 0.4
  }
*/

const defaultParticleSystemOptions = {
    maxParticles: 1521,
    particleHeight: 1.0, //離地 1米
    fadeOpacity: 0.979,
    dropRate: 0.002,
    dropRateBump: 0.09,
    speedFactor: 0.2,
    lineWidth: 1.9
}

const globeLayers = [
    { name: "NaturalEarthII", type: "NaturalEarthII" },
    { name: "WMS:Air Pressure", type: "WMS", layer: "Pressure_surface", ColorScaleRange: '51640,103500' },
    { name: "WMS:Wind Speed", type: "WMS", layer: "Wind_speed_gust_surface", ColorScaleRange: '0.1095,35.31' },
    { name: "WorldTerrain", type: "WorldTerrain" }
]

const defaultLayerOptions = {
    "globeLayer": globeLayers[0],
    "WMS_URL": "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files-old/201809/20180916/gfsanl_4_20180916_0000_000.grb2",
}

class Panel {
    constructor() {
        this.maxParticles = defaultParticleSystemOptions.maxParticles;
        this.particleHeight = defaultParticleSystemOptions.particleHeight;
        this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;
        this.dropRate = defaultParticleSystemOptions.dropRate;
        this.dropRateBump = defaultParticleSystemOptions.dropRateBump;
        this.speedFactor = defaultParticleSystemOptions.speedFactor;
        this.lineWidth = defaultParticleSystemOptions.lineWidth;
        this._easymap = null; //引入時會更新，From: easymap.js #371
        this.globeLayer = defaultLayerOptions.globeLayer;
        this.WMS_URL = defaultLayerOptions.WMS_URL;
        this.isAutoValue = true; //By Gis John, 可自動調節風力值

        var layerNames = [];
        globeLayers.forEach(function (layer) {
            layerNames.push(layer.name);
        });
        this.layerToShow = layerNames[0];

        var onParticleSystemOptionsChange = function () {
            var event = new CustomEvent('particleSystemOptionsChanged');
            window.dispatchEvent(event);
        }

        const that = this;
        var onLayerOptionsChange = function () {
            for (var i = 0; i < globeLayers.length; i++) {
                if (that.layerToShow == globeLayers[i].name) {
                    that.globeLayer = globeLayers[i];
                    break;
                }
            }
            var event = new CustomEvent('layerOptionsChanged');
            window.dispatchEvent(event);
        }

        this.show = function (tf) {
            if (document.querySelectorAll("#" + this._easymap._targetId + " div[easymap_id='my3DWindyPanel']").length == 0) {
                this._easymap.my3DWindy.gui = new dat.GUI({ autoPlace: false });
                /*
                this._easymap.my3DWindy.gui.add(that, 'maxParticles', 1, 256 * 256, 1).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'particleHeight', 1, 10000, 1).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'fadeOpacity', 0.90, 0.999, 0.001).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'dropRate', 0.0, 3.0,0.01).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'dropRateBump', 0, 3.0, 0.01).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'speedFactor', 0.05, 8).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'lineWidth', 0.01, 16.0).onFinishChange(onParticleSystemOptionsChange);
                */

                this._easymap.my3DWindy.gui.add(that, 'maxParticles', 1, this._easymap.my3DWindy._windMode.maxParticles, 1).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'particleHeight', 1, 10000, 1).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'fadeOpacity', 0.90, 0.999, 0.001).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'dropRate', 0.0, 3.0, 0.01).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'dropRateBump', 0, 3.0, 0.01).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'speedFactor', 0.05, 8).onFinishChange(onParticleSystemOptionsChange);
                this._easymap.my3DWindy.gui.add(that, 'lineWidth', 0.01, 16.0).onFinishChange(onParticleSystemOptionsChange);

                //gui.add(that, 'layerToShow', layerNames).onFinishChange(onLayerOptionsChange);

                //var panelContainer = document.getElementsByClassName('cesium-widget').item(0);
                //console.log(this);
                var panelContainer = document.getElementById(this._easymap._targetId); // document.getElementsByClassName('ol-viewport').item(0);
                this._easymap.my3DWindy.gui.domElement.classList.add('my3DWindyPanel');
                this._easymap.my3DWindy.gui.domElement.setAttribute('easymap_id', 'my3DWindyPanel');
                this._easymap.my3DWindy.gui.domElement.style.position = 'absolute';
                this._easymap.my3DWindy.gui.domElement.style.zIndex = 1;
                panelContainer.prepend(this._easymap.my3DWindy.gui.domElement);
                if (this._easymap.my3DWindy._autoWindLineEnable == true) {
                    var doms = document.querySelectorAll("#" + this._easymap._targetId + " div[easymap_id='my3DWindyPanel'] input");
                    for (var i = 0, max_i = doms.length; i < max_i; i++) {
                        doms[i].setAttribute('disabled', "true");
                    }
                    for (var i = 0, max_i = this._easymap.my3DWindy.gui.__controllers.length; i < max_i; i++) {
                        var dom = this._easymap.my3DWindy.gui.__controllers[i].domElement.querySelectorAll("div")[1];
                        if (dom.classList.contains("slider")) {
                            dom.classList.remove("slider");
                        }
                    }
                }
            }
            switch (tf) {
                case true:
                    //console.log(this); panel 本身                                        
                    document.querySelectorAll("#" + this._easymap._targetId + " div[easymap_id='my3DWindyPanel']")[0].style.display = "inline";                    
                    break;
                case false:                    
                    if (document.querySelectorAll("#" + this._easymap._targetId + " div[easymap_id='my3DWindyPanel']").length != 0) {
                        document.querySelectorAll("#" + this._easymap._targetId + " div[easymap_id='my3DWindyPanel']")[0].style.display = "none";
                    }
                    break;
            }
        };

    }

    getUserInput() {
        // make sure maxParticles is exactly the square of particlesTextureSize
        var particlesTextureSize = Math.ceil(Math.sqrt(this.maxParticles));
        this.maxParticles = particlesTextureSize * particlesTextureSize;
        var op = {
            particlesTextureSize: particlesTextureSize,
            maxParticles: this.maxParticles,
            particleHeight: this.particleHeight,
            fadeOpacity: this.fadeOpacity,
            dropRate: this.dropRate,
            dropRateBump: this.dropRateBump,
            speedFactor: this.speedFactor,
            lineWidth: this.lineWidth,
            globeLayer: this.globeLayer,
            WMS_URL: this.WMS_URL
        };
        

        return op;
    }
}

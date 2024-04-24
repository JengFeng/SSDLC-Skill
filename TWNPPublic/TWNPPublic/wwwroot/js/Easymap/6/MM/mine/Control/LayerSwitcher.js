/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.MousePosition
 * The MousePosition control displays geographic coordinates of the mouse
 * pointer, as it is moved about the map.
 *
 * You can use the <prefix>- or <suffix>-properties to provide more information
 * about the displayed coordinates to the user:
 *
 * (code)
 *     var mousePositionCtrl = new OpenLayers.Control.MousePosition({
 *         prefix: '<a target="_blank" ' +
 *             'href="http://spatialreference.org/ref/epsg/4326/">' +
 *             'EPSG:4326</a> coordinates: '
 *         }
 *     );
 * (end code)
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
EzMap.Control.LayerSwitcher = OpenLayers.Class(OpenLayers.Control, {

    /**
    * APIProperty: autoActivate
    * {Boolean} Activate the control when it is added to a map.  Default is
    *     true.
    */
    autoActivate: true,

    /**
    * Property: element
    * {DOMElement}
    */
    element: null,

    /**
    * APIProperty: prefix
    * {String} A string to be prepended to the current pointers coordinates
    *     when it is rendered.  Defaults to the empty string ''.
    */
    prefix: '',

    /**
    * APIProperty: separator
    * {String} A string to be used to seperate the two coordinates from each
    *     other.  Defaults to the string ', ', which will result in a
    *     rendered coordinate of e.g. '42.12, 21.22'.
    */
    separator: ', ',

    /**
    * APIProperty: suffix
    * {String} A string to be appended to the current pointers coordinates
    *     when it is rendered.  Defaults to the empty string ''.
    */
    suffix: '',

    /**
    * APIProperty: numDigits
    * {Integer} The number of digits each coordinate shall have when being
    *     rendered, Defaults to 5.
    */
    numDigits: 5,

    /**
    * APIProperty: granularity
    * {Integer}
    */
    granularity: 10,

    /**
    * APIProperty: emptyString
    * {String} Set this to some value to set when the mouse is outside the
    *     map.
    */
    emptyString: null,

    /**
    * Property: lastXy
    * {<OpenLayers.Pixel>}
    */
    lastXy: null,

    /**
    * APIProperty: displayProjection
    * {<OpenLayers.Projection>} The projection in which the mouse position is
    *     displayed.
    */
    root: "", 				//基本目錄
    displayProjection: null,
    map: null,
    baseLayers: [],
    baseLayerId: "", 		//基本圖層的名稱
    mname: "", 				//預設底圖名稱
    dcz: 5, 					//zoom difference
    debug: false,
    mm: null, 				//主程式
    imgId: null,            //圖片id
    dropdownId:null,        //下拉選單id
    /**
    * Constructor: OpenLayers.Control.MousePosition
    *
    * Parameters:
    * options - {Object} Options for control.
    */
    initialize: function (options) {

        OpenLayers.Control.prototype.initialize.apply(this, arguments);

    },
    /**
    * Method: destroy
    */
    destroy: function () {

        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
    * APIMethod: activate
    */
    activate: function () {

        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.register('mousemove', this, this.redraw);
            this.map.events.register('mouseout', this, this.reset);
            this.redraw();
            return true;
        } else {
            return false;
        }
    },

    /**
    * APIMethod: deactivate
    */
    deactivate: function () {
        return;
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.unregister('mousemove', this, this.redraw);
            this.map.events.unregister('mouseout', this, this.reset);
            this.element.innerHTML = "";
            return true;
        } else {
            return false;
        }
    },
    setMM: function (mm) {
        this.mm = mm;
    },
    setMap: function (map) {
        this.map = map;
    },
    setbaseLayers: function (obj) {

        var _tmpary = new Array();
        if (isArray(obj)) {
            _tmpary = obj;
        }
        else {
            _tmpary.push(obj);
        }

        this.baseLayers = obj;
    },
    addLayer: function (layer) {

        this.baseLayers.push(layer);
        this.addItem(layer);
        if (this.baseLayerId == layer.options.name) {
            this.changeBaseLayer(layer);
        }
    },
    setRoot: function (root) {
        this.root = root;
    },
    setDcz: function (dcz) {
        this.dcz = dcz;
    },
    addItem: function (item) {

        var op = item.options;

        var text = "";
        if (op.name == this.mname) {
            text += "<a class='selectLayer' href='javascript:void(0);'>";
        } else {
            text += "<a href='javascript:void(0);'>";
        }
        var src = this.root + op.iconMin;

        if (is_ie) {
            text += "<img src='" + src + "' border=0 width=24 height=18 />&nbsp;";
        } else {
            text += "<img src='" + src + "' style='margin-bottom:-4px;' border=0 width=24 height=18 />&nbsp;";
        }
        text += op.chname + "</a>";
        var li = document.createElement("li");
        li.innerHTML = text;
        li.title = item.id;
        var This = this;
        var lionclick = function (obj) {

            var id = "";
            if (is_ie) {
                id = this.title;
            } else {
                id = obj.currentTarget.title;
            }
            var layer = This.getLayerById(id);
            try{
                This.changeBaseLayer(layer);
            } catch (err) {
                console.log(layer);
            }
            document.getElementById(This.dropdownId).style.display = "none";
        };

        if (!is_ie) {
            li.addEventListener('touchstart', lionclick, false);
        }

        li.onclick = lionclick;
        this.element.childNodes[1].childNodes[0].appendChild(li);
    },
    
    /**
    * Method: draw
    * {DOMElement}
    */
    draw: function () {

        var defaultLayer = null;
        for (var i = 0; i < this.baseLayers.length; i++) {
            var op = this.baseLayers[i].options;

            var text = "";
            if (op.name == this.mname) {
                defaultLayer = this.baseLayers[i];
                break;
            }
        }

        var imgUrl = "";
        if (defaultLayer) {
            imgUrl = this.root + defaultLayer.options.iconMax;
        } else {
            imgUrl = "";
        }

        this.imgId = "MM-" + this.id;
        this.dropdownId = "dropdown-" + this.imgId;

        OpenLayers.Control.prototype.draw.apply(this, arguments);
        var This = this;
        var id = this.imgId;
        var img = imgUrl;
        var sz = new OpenLayers.Size(80, 90);
        var xy = new OpenLayers.Pixel(5, 5);
        var position = "absolute";
        var border = "";

        //圖台圖片
        var image = OpenLayers.Util.createImage(id, xy, sz, img, position, border);
        image.setAttribute("data-dropdown", "#" + this.dropdownId);
        image.setAttribute("dropdownId", this.dropdownId);
        image.onclick = this.show;

        if (!is_ie) {
            image.addEventListener('touchstart', function (e) {
                This.show(this);
            }, false)
        }


        //==下拉選單
        var dropdown = OpenLayers.Util.createDiv(this.dropdownId);
        dropdown.style.display = "none";
        dropdown.className = "dropdown dropdown-relative dropdown-tip has-icons dropdown-anchor-right easymap-animated fadeOutDown";

        //下拉內容
        var ul = document.createElement("ul");
        ul.id = "dropdown-menu-id";
        ul.className = "dropdown-menu-easymap";
        var Map = this.map;


        dropdown.appendChild(ul);

        this.element = OpenLayers.Util.createDiv("_ERIC_LAYERSWITCHER_");
        this.element.appendChild(image);
        this.element.appendChild(dropdown);
        this.element.style.display = "none";

        this.element.className = this.CLASS_NAME.replace(".", "").replace(".", "");
        return this.element;
    },
    //設定預設底圖
    setMName: function (name) {
        this.mname = name;
    },
    removeLayer: function (layer) {

        //把圖台的底圖去除
        if (layer.id == this.baseLayerId) {
            this.map.removeLayer(layer.instance);

            //如果還有底圖拿第一個當底圖
            if (this.baseLayers.length > 0) {
                this.changeBaseLayer(this.baseLayers[0]);
            }
        }

        //把baseLayers變數去除掉該圖層
        for (var i = 0; i < this.baseLayers.length; i++) {
            var baseLayer = this.baseLayers[i];
            if (layer.id == baseLayer.id) {
                this.baseLayers.indexPop(i);
                break;
            }
        }


        //把切換圖台器的下把項目拿掉
        var lis = this.element.childNodes[1].childNodes[0].childNodes;
        for (var i = 0; i < lis.length; i++) {

            var li = lis[i];
            if (layer.id == li.title) {
                this.element.childNodes[1].childNodes[0].removeChild(li);
            }
        }
    },
    changeBaseLayer: function (item) {

        var layer = item;

        //if(this.isEasymap5_mapini){
        //	return;
        //}

        if (layer == null) {
            if (this.debug)
                console.error(MM.EasymapErr + "尚未指定任何底圖");
            //return;
        }

        var op = layer.options;
        var name = op.name;
        if (layer) {

            var zIndex = 0;
            //先把目前的baseLayer刪掉
            if (this.map.getLayersByName(this.baseLayerId).length > 0) {
                var baseLayer = this.map.getLayersByName(this.baseLayerId)[0];

                if (this.map.getLayer(baseLayer.id) != null) {//有載入才需要remove
                    this.map.removeLayer(baseLayer);
                }
            }


            this.map.addLayer(layer.instance);
            this.map.setLayerIndex(layer.instance, 0);

            document.getElementById(this.imgId).src = this.root + op.iconMax;

            this.baseLayerId = item.id;
        }


        //同步一下css
        var uls = document.getElementById("dropdown-menu-id");
        for (var i = 0; uls != null && i < uls.childNodes.length; i++) {
            uls.childNodes[i].childNodes[0].className = "";

            if (uls.childNodes[i].title == layer.id) {
                uls.childNodes[i].childNodes[0].className = "selectLayer";
            }
        }

        //切換Hawk eys
        if (this.map.getControlsByClass("MM.Control.LTOverviewMap").length >= 1) {
            var tmpMap = this.map.getControlsByClass("MM.Control.LTOverviewMap")[0];

            var tmp = this.mm.getDgSource(layer);
            var options = { layers: [tmp] };

            var lto = new EzMap.Control.LTOverviewMap(options);
            lto.minRatio = this.dcz;
            lto.maxRatio = this.dcz;

            this.map.removeControl(tmpMap);
            this.map.addControl(lto);
        }

        //重排一下z-index的順序，不然事件無法執行
        this.map.resetLayersZIndex();

    },
    /*
    *	利用id取出layer
    */

    getLayerById: function (id) {

        for (var i = 0; i < this.baseLayers.length; i++) {
            if (this.baseLayers[i].id == id) {
                return this.baseLayers[i];
            }
        }
        return null;
    },
    show: function (obj) {

        var imgId = "";

        try {
            if (obj.currentTarget == null) {
                imgId = obj.id;
            } else {
                imgId = obj.currentTarget.id;
            }
        } catch (err) {
            imgId = this.id;//ie8
        }

        var dropdownId = "dropdown-" + imgId;

        var object = document.getElementById(imgId);
        var target = document.getElementById(dropdownId);

        if (target.style.display == "") {
            target.style.display = "none";
        } else {
            target.style.display = "";
        }

        if (is_ie) {
            target.style.left = (-80) + "px";
            target.style.top = (110) + "px";
        } else {
            target.style.left = (-105) + "px";
            target.style.top = (100) + "px";
        }
    },
    /**
    * Method: redraw
    */
    redraw: function (evt) {
        return;
        var lonLat;

        if (evt == null) {
            this.reset();
            return;
        } else {
            if (this.lastXy == null ||
                Math.abs(evt.xy.x - this.lastXy.x) > this.granularity ||
                Math.abs(evt.xy.y - this.lastXy.y) > this.granularity) {
                this.lastXy = evt.xy;
                return;
            }

            lonLat = this.map.getLonLatFromPixel(evt.xy);
            if (!lonLat) {
                // map has not yet been properly initialized
                return;
            }
            if (this.displayProjection) {
                lonLat.transform(this.map.getProjectionObject(),
                                 this.displayProjection);
            }
            this.lastXy = evt.xy;

        }

        var newHtml = this.formatOutput(lonLat);

        if (newHtml != this.element.innerHTML) {
            this.element.innerHTML = newHtml;
        }
    },

    /**
    * Method: reset
    */
    reset: function (evt) {
        return;
        if (this.emptyString != null) {
            this.element.innerHTML = this.emptyString;
        }
    },

    /**
    * Method: formatOutput
    * Override to provide custom display output
    *
    * Parameters:
    * lonLat - {<OpenLayers.LonLat>} Location to display
    */
    formatOutput: function (lonLat) {
        return;
        var digits = parseInt(this.numDigits);
        var newHtml =
            this.prefix +
            lonLat.lon.toFixed(digits) +
            this.separator +
            lonLat.lat.toFixed(digits) +
            this.suffix;
        return newHtml;
    },

    CLASS_NAME: "MM.Control.LayerSwitcher"
});

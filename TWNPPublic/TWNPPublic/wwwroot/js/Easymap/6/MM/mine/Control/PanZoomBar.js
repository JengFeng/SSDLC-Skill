/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control/PanZoom.js
 */

/**
 * Class: OpenLayers.Control.PanZoomBar
 * The PanZoomBar is a visible control composed of a
 * <OpenLayers.Control.PanPanel> and a <OpenLayers.Control.ZoomBar>. 
 * By default it is displayed in the upper left corner of the map as 4
 * directional arrows above a vertical slider.
 *
 * Inherits from:
 *  - <OpenLayers.Control.PanZoom>
 */
EzMap.Control.PanZoomBar = OpenLayers.Class(OpenLayers.Control.PanZoomBar, {

    /** 
     * APIProperty: zoomWorldIcon
     * {Boolean}
     */
    zoomWorldIcon: true,

    /** 
     * APIProperty: zoomStopHeight
     */
    zoomStopHeight: 8,

	center: {lon: 120.8984, lat: 24.2413},
	zoom: 7,
	left: "5px",
	top: "5px",
    /**
    * Method: draw 
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>} 
    */
    draw: function(px) {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = this.position.clone();

        // place the controls
        this.buttons = [];

        var sz = {w: 18, h: 18};
		var sz_Panbg = {w: 65, h: 65};
		var sz_Zoom = {w:18, h:28};
		if (!EzMap.Tools.isMobileDevice()) {

            var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);
            var wposition = sz.w;

            if (this.zoomWorldIcon) {
                //centered = new OpenLayers.Pixel(px.x+sz.w, px.y);
            }

            this._addButton("panbg", "pan-bg.png", new OpenLayers.Pixel(px.x-1, px.y-1), sz_Panbg);

            this._addButton("panup", "north-mini.png", centered.add(13, 1), sz);
            px.y = centered.y+sz.h;
            this._addButton("panleft", "west-mini.png", px.add(1,4), sz);
            if (this.zoomWorldIcon) {
                this._addButton("zoomworld", "zoom-world-mini.png", px.add(sz.w+4, 4), sz);

                //wposition *= 2;
            }
            this._addButton("panright", "east-mini.png", px.add(44, 4), sz);
            this._addButton("pandown", "south-mini.png", centered.add(13, sz.h*2+7), sz);
            this._addButton("zoomin", "zoom-plus-mini.png", centered.add(13, sz.h*3+12), sz_Zoom);
            centered = this._addZoomBar(centered.add(13, sz.h*4 + 22));
            this._addButton("zoomout", "zoom-minus-mini.png", centered.add(0,0), sz_Zoom);
        }
        else {

			sz = {w: 28, h: 28};				

            this._addButton("zoomin", "plus.png", px, sz);
            centered = this._addZoomBar(px.add(10000, sz.h));
            this._addButton("zoomout", "minus.png", centered.add(-10000,-130), sz);
            if (this.zoomWorldIcon) {
                centered = centered.add(0, sz.h+3);
                this._addButton("zoomworld", "zoom-world.png", centered.add(-10000,-130), sz);
            }
        }
		this.div.style.left = this.left;
		this.div.style.top = this.top;
        return this.div;
    },
	setZoomWorld: function(center,zoom){
		if(center){
			this.center.lon = center.x;
			this.center.lat = center.y;
		}
		if(zoom) this.zoom = zoom;
	},
    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function(evt) {
        var btn = evt.buttonElement;
        switch (btn.action) {
            case "panup": 
                this.map.pan(0, -this.getSlideFactor("h"));
                break;
            case "pandown": 
                this.map.pan(0, this.getSlideFactor("h"));
                break;
            case "panleft": 
                this.map.pan(-this.getSlideFactor("w"), 0);
                break;
            case "panright": 
                this.map.pan(this.getSlideFactor("w"), 0);
                break;
            case "zoomin": 
                this.map.zoomIn(); 
                break;
            case "zoomout": 
                this.map.zoomOut(); 
                break;
            case "zoomworld": 
				this.map.setCenter(
					new OpenLayers.LonLat(this.center.lon, this.center.lat).transform(
						new OpenLayers.Projection("EPSG:4326"),
						this.map.getProjectionObject()
					), 
					this.zoom
				);
                break;
        }
    },
    /** 
    * Method: _addZoomBar
    * 
    * Parameters:
    * centered - {<OpenLayers.Pixel>} where zoombar drawing is to start.
    */
    _addZoomBar: function (centered) {
        var imgLocation = OpenLayers.Util.getImageLocation("slider.png");
        var id = this.id + "_" + this.map.id;
        var minZoom = this.map.getMinZoom();
        var zoomsToEnd = this.map.getNumZoomLevels() - 1 - this.map.getZoom();
        var slider = OpenLayers.Util.createAlphaImageDiv(id,
                       centered.add(-1, zoomsToEnd * this.zoomStopHeight),
                       { w: 20, h: 9 },
                       imgLocation,
                       "absolute");
        slider.style.cursor = "move";
        this.slider = slider;

        this.sliderEvents = new OpenLayers.Events(this, slider, null, true,
                                            { includeXY: true });
        this.sliderEvents.on({
            "touchstart": this.zoomBarDown,
            "touchmove": this.zoomBarDrag,
            "touchend": this.zoomBarUp,
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp
        });

        var sz = {
            w: this.zoomStopWidth,
            h: this.zoomStopHeight * (this.map.getNumZoomLevels() - minZoom)
        };
        var imgLocation = OpenLayers.Util.getImageLocation("zoombar.png");
        var div = null;

        if (OpenLayers.Util.alphaHack()) {
            var id = this.id + "_" + this.map.id;
            div = OpenLayers.Util.createAlphaImageDiv(id, centered,
                                      { w: sz.w, h: this.zoomStopHeight },
                                      imgLocation,
                                      "absolute", null, "crop");
            div.style.height = sz.h + "px";
        } else {
            div = OpenLayers.Util.createDiv(
                        'OpenLayers_Control_PanZoomBar_Zoombar' + this.map.id,
                        centered,
                        sz,
                        imgLocation);
        }
        div.style.cursor = "pointer";
        div.className = "olButton";
        this.zoombarDiv = div;

        this.div.appendChild(div);

        this.startTop = parseInt(div.style.top);
        slider.title = this.map.getZoom();


        var ieversion = EzMap.Tools.getIeVersion();

        if (ieversion == -1 || ieversion >= 10) {
            slider.classList.add("panzoombar_slider_div");
        } else {
            try{
                slider.className += " panzoombar_slider_div";
            } catch (err) {
                console.error("this browser not support classname attribute.");
            }
        }
        this.div.appendChild(slider);

        this.map.events.register("zoomend", this, this.moveZoomBar);

        centered = centered.add(0,
            this.zoomStopHeight * (this.map.getNumZoomLevels() - minZoom));
        return centered;
    },
    /*
     * Method: zoomBarUp
     * Perform cleanup when a mouseup event is received -- discover new zoom
     * level and switch to it.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     */
    zoomBarUp: function (evt) {
        if (!OpenLayers.Event.isLeftClick(evt) && evt.type !== "touchend") {
            return;
        }
        if (this.mouseDragStart) {
            this.div.style.cursor = "";
            this.map.events.un({
                "touchmove": this.passEventToSlider,
                "mouseup": this.passEventToSlider,
                "mousemove": this.passEventToSlider,
                scope: this
            });
            var zoomLevel = this.map.zoom;
            if (!this.forceFixedZoomLevel && this.map.fractionalZoom) {
                zoomLevel += this.deltaY / this.zoomStopHeight;
                zoomLevel = Math.min(Math.max(zoomLevel, 0),
                                     this.map.getNumZoomLevels() - 1);
            } else {
                zoomLevel += this.deltaY / this.zoomStopHeight;
                zoomLevel = Math.max(Math.round(zoomLevel), 0);
            }
            //if zoom over max resolution set max zoom
            if (zoomLevel > this.map.resolutions.length) {
                zoomLevel = this.map.resolutions.length - 1;
            }
            
            this.map.zoomTo(zoomLevel);
            this.mouseDragStart = null;
            this.zoomStart = null;
            this.deltaY = 0;
            OpenLayers.Event.stop(evt);
        }
    },
    zoomBarDrag: function (evt) {
        if (this.mouseDragStart != null) {
            var deltaY = this.mouseDragStart.y - evt.xy.y;
            var offsets = OpenLayers.Util.pagePosition(this.zoombarDiv);
            if ((evt.clientY - offsets[1]) > 2  &&
                (evt.clientY - offsets[1]) < parseInt(this.zoombarDiv.style.height) - 2) {
                var newTop = parseInt(this.slider.style.top) - deltaY;
                this.slider.style.top = newTop + "px";
                this.mouseDragStart = evt.xy.clone();
                this.slider.title = this.map.getZoom();

            }
            // set cumulative displacement
            this.deltaY = this.zoomStart.y - evt.xy.y;
            OpenLayers.Event.stop(evt);
        }
    },
    /*
    * Method: moveZoomBar
    * Change the location of the slider to match the current zoom level.
    */
    moveZoomBar: function () {
        var newTop =
            ((this.map.getNumZoomLevels() - 1) - this.map.getZoom()) *
            this.zoomStopHeight + this.startTop + 1;
        this.slider.style.top = newTop + "px";


        this.slider.title = this.map.getZoom();
    },
    CLASS_NAME: "MM.Control.PanZoomBar"
});
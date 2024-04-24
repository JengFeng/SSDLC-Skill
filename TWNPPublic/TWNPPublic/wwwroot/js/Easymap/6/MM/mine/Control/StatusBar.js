/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Control/ArgParser.js
 * @requires OpenLayers/Lang.js
 */

/**
 * Class: OpenLayers.Control.Permalink
 * The Permalink control is hyperlink that will return the user to the 
 * current map view. By default it is drawn in the lower right corner of the
 * map. The href is updated as the map is zoomed, panned and whilst layers
 * are switched.
 * 
 * Inherits from:
 *  - <OpenLayers.Control>
 */
EzMap.Control.StatusBar = OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * APIProperty: argParserClass
     * {Class} The ArgParser control class (not instance) to use with this
     *     control.
     */
    argParserClass: OpenLayers.Control.ArgParser,

    /** 
     * Property: element 
     * {DOMElement}
     */
    element: null,
    
    /** 
     * Property: loading 
     * {DOMElement}
     */
    loading: null,

    /** 
     * Property: loadingCenter 
     * {DOMElement}
     */
    loadingCenter: null,

    loadingText:null,

    /** 
     * Property: mousePosition 
     * {DOMElement}
     */
    mousePosition: null,

    /** 
     * Property: measureResult 
     * {DOMElement}
     */
    measureResult: null,

    /** 
     * Property: background 
     * {DOMElement}
     */
    background: null,

    /** 
     * APIProperty: anchor
     * {Boolean} This option changes 3 things:
     *     the character '#' is used in place of the character '?',
     *     the window.href is updated if no element is provided.
     *     When this option is set to true it's not recommend to provide
     *     a base without provide an element.
     */
    anchor: false,

    /** 
     * APIProperty: base
     * {String}
     */
    base: '',

    /** 
     * APIProperty: displayProjection
     * {<OpenLayers.Projection>} Requires proj4js support.  Projection used
     *     when creating the coordinates in the link. This will reproject the
     *     map coordinates into display coordinates. If you are using this
     *     functionality, the permalink which is last added to the map will
     *     determine the coordinate type which is read from the URL, which
     *     means you should not add permalinks with different
     *     displayProjections to the same map. 
     */
    displayProjection: null, 
	mm: null,	//easymap6_instance
	sw_loading: true,//載入mask的開關
    /**
     * Constructor: OpenLayers.Control.Permalink
     *
     * Parameters: 
     * element - {DOMElement} 
     * base - {String} 
     * options - {Object} options to the control.
     *
     * Or for anchor:
     * options - {Object} options to the control.
     */
    initialize: function(element, base, options) {
        if (element !== null && typeof element == 'object' && !OpenLayers.Util.isElement(element)) {
            options = element;
            this.base = document.location.href;
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
            if (this.element != null) {
                this.element = OpenLayers.Util.getElement(this.element);
            }
        }
        else {
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
            this.element = OpenLayers.Util.getElement(element);
            this.base = base || document.location.href;
        }

		
    },
    
    /**
     * APIMethod: destroy
     */
    destroy: function()  {
        if (this.element && this.element.parentNode == this.div) {
            this.div.removeChild(this.element);
            this.element = null;
        }
        if (this.map) {
            this.map.events.unregister('preaddlayer', this, this.preaddlayer);
            this.map.events.unregister('addlayer', this, this.addlayer);
            this.map.events.unregister('mousemove', this, this.redrawMousePosition);
            this.map.events.unregister('mouseout', this, this.resetMousePosition);
        }

        OpenLayers.Control.prototype.destroy.apply(this, arguments); 
    },

    /**
     * Method: setMap
     * Set the map property for the control. 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);

        //make sure we have an arg parser attached
        for(var i=0, len=this.map.controls.length; i<len; i++) {
            var control = this.map.controls[i];
            if (control.CLASS_NAME == this.argParserClass.CLASS_NAME) {
                
                // If a permalink is added to the map, and an ArgParser already
                // exists, we override the displayProjection to be the one
                // on the permalink. 
                if (control.displayProjection != this.displayProjection) {
                    this.displayProjection = control.displayProjection;
                }    
                
                break;
            }
        }
        if (i == this.map.controls.length) {
            this.map.addControl(new this.argParserClass(
                { 'displayProjection': this.displayProjection }));       
        }

    },

    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement}
     */    
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);

		
		this.background = document.createElement('div');
		this.background.id = 'background';
		this.background.className = 'background';
		
		//測量結果div
		this.measureResult = document.createElement('div');
		var measureResultText  = document.createTextNode('');
		this.measureResult.id = 'measureResult';
		this.measureResult.className = 'measureResult';
		this.measureResult.setAttribute('name','measureResult');
		this.measureResult.appendChild(measureResultText);

		//載kml狀態div
		this.loading = document.createElement('img');
		this.loading.id = 'loading';
		this.loading.src= _$EZMAP.path+'imgs/loading.gif';
		this.loading.className = 'loadingEnd';
		this.loading.setAttribute('name','loading');

		this.loadingCenter = document.createElement('img');
		this.loadingCenter.id = 'loadingCenter';
		this.loadingCenter.src= _$EZMAP.path+'imgs/loading2.gif';
		this.loadingCenter.className = 'loadingEnd';
		this.loadingCenter.setAttribute('name','loadingCenter');
		
		this.loadingText = document.createElement("span");
		this.loadingText.id = 'EzMap_Control_StatusBar_text';
		this.loadingText.innerText = "載入中...";
		this.loadingText.className = 'loadingEnd';
		this.loadingText.setAttribute('name', 'loadingText');

		//mouse位置div
		this.mousePosition = document.createElement('div');
		var mousePositionText  = document.createTextNode('');
		this.mousePosition.id = 'mousePosition';
		this.mousePosition.className = 'mousePosition';
		this.mousePosition.setAttribute('name','mousePosition');
		this.mousePosition.appendChild(mousePositionText);
		
				
        this.div.appendChild(this.mousePosition);
		this.div.appendChild(this.loading);
		this.div.appendChild(this.measureResult);
		this.div.appendChild(this.background);
		this.div.appendChild(this.loadingCenter);
		this.div.appendChild(this.loadingText);

        this.map.events.on({
            'preaddlayer': this.preaddlayer,
            'addlayer': this.addlayer,
            scope: this
        });
		//mousePosition
		this.map.events.register('mousemove', this, this.redrawMousePosition);
		this.map.events.register('mouseout', this, this.resetMousePosition);

        
		//註冊一下事件:如果測量工具，回到navigation，把測量結果的bar清除
		var _Navigation_ = this.map.getControlsByClass("OpenLayers.Control.Navigation");
		if(_Navigation_.length == 1){
			_Navigation_[0].events.register("activate", this, function(){
				this.measureResult.innerText = "";
			});
		}

        return this.div;
    },
    /**
     * Method: setMeasureResult 
     */
    setMeasureResult: function(result) {
		this.measureResult.innerText = result;
    }, 
    /**
     * Method: redraw 
     */
    redrawMousePosition: function(evt) {

        if (evt == null) {
            this.reset();
            return;
        } else {
			var lonLat = this.map.getLonLatFromPixel(evt.xy);
			
            if (this.displayProjection) {
                lonLat.transform(this.map.getProjectionObject(),
                                 this.displayProjection );
            }
			var lon = lonLat.lon;
			var lat = lonLat.lat;


			this.mousePosition.innerText = _$EZMAP.STR_WGS84+":"+lonLat.lon.toFixed(6)+" "+lonLat.lat.toFixed(6) + "      ";

		}
    }, 
    /**
     * Method: reset
     */
    resetMousePosition: function(evt) {
		this.mousePosition.innerText = "";
    },
    /**
     * Method: preaddlayer 
     */
    preaddlayer: function(evt) {
		
		if(this.sw_loading == false) return;

		this.loading.className = "loadingStart";

		this.background.className = "background_full";

		this.loadingCenter.style.display = "none";
		this.loadingCenter.style.position = "absolute";
		this.loadingCenter.style.left = (this.map.size.w/2)+"px";
		this.loadingCenter.style.top = "-" + (this.map.size.h / 2) + "px";

		this.loadingText.className = "loadingText";
		this.loadingText.style.display = "inline";
		this.loadingText.style.position = "absolute";
		this.loadingText.style.left = (this.map.size.w / 2) + "px";
		this.loadingText.style.top = "-" + (this.map.size.h / 2) + "px";

		//關閉navigation
		var nav = this.map.getControl("_MAIN_NAVIGATION_");
		if(nav)
			nav.disableZoomWheel();


    }, 
    /**
     * Method: addlayer 
     */
    addlayer: function(event) {

		if(this.sw_loading == false) return;
		
		var self = this;

		setTimeout(function(){
			self.loading.className = "loadingEnd";
			self.loadingCenter.className = "loadingEnd";
			self.background.className = "background";

			self.loadingCenter.style.display = "none";
			self.loadingCenter.style.position = "absolute";
			self.loadingCenter.style.left = "-800px";
			self.loadingCenter.style.top = "-800px";

			self.loadingText.style.display = "inline";
			self.loadingText.style.position = "absolute";
			self.loadingText.style.left = "-800px";
			self.loadingText.style.top = "-800px";
		},20);

		//關閉navigation
		var nav = this.map.getControl("_MAIN_NAVIGATION_");
		if(nav)
			nav.enableZoomWheel();
    }, 
    /**
     * APIMethod: createParams
     * Creates the parameters that need to be encoded into the permalink url.
     * 
     * Parameters:
     * center - {<OpenLayers.LonLat>} center to encode in the permalink.
     *     Defaults to the current map center.
     * zoom - {Integer} zoom level to encode in the permalink. Defaults to the
     *     current map zoom level.
     * layers - {Array(<OpenLayers.Layer>)} layers to encode in the permalink.
     *     Defaults to the current map layers.
     * 
     * Returns:
     * {Object} Hash of parameters that will be url-encoded into the
     * permalink.
     */
    createParams: function(center, zoom, layers) {
        center = center || this.map.getCenter();
          
        var params = OpenLayers.Util.getParameters(this.base);
        
        // If there's still no center, map is not initialized yet. 
        // Break out of this function, and simply return the params from the
        // base link.
        if (center) { 

            //zoom
            params.zoom = zoom || this.map.getZoom(); 

            //lon,lat
            var lat = center.lat;
            var lon = center.lon;
            
            if (this.displayProjection) {
                var mapPosition = OpenLayers.Projection.transform(
                  { x: lon, y: lat }, 
                  this.map.getProjectionObject(), 
                  this.displayProjection );
                lon = mapPosition.x;  
                lat = mapPosition.y;  
            }       
            params.lat = Math.round(lat*100000)/100000;
            params.lon = Math.round(lon*100000)/100000;
    
            //layers        
            layers = layers || this.map.layers;  
            params.layers = '';
            for (var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
    
                if (layer.isBaseLayer) {
                    params.layers += (layer == this.map.baseLayer) ? "B" : "0";
                } else {
                    params.layers += (layer.getVisibility()) ? "T" : "F";           
                }
            }
        }

        return params;
    }, 

    CLASS_NAME: "MM.Control.StatusBar"
});

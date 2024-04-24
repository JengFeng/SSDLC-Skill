/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/Point.js
 * @requires OpenLayers/Handler/Path.js
 * @requires OpenLayers/Handler/Polygon.js
 */

/**
 * Class: OpenLayers.Control.EditingToolbar 
 * The EditingToolbar is a panel of 4 controls to draw polygons, lines, 
 * points, or to navigate the map by panning. By default it appears in the 
 * upper right corner of the map.
 * 
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */
EzMap.Control.MeasureToolbar = OpenLayers.Class(
  OpenLayers.Control.Panel, {

      /**
       * APIProperty: iconProxy
       * 記錄icon跟資料庫要資料的網址
       */
      iconProxy: "",

      /**
       * APIProperty: measureCallbacks
       * 測量結果的事件，回傳至外部的事件
       */
      measureCallbacks: null,

      /**
       * APIProperty: citeCompliant
       * {Boolean} If set to true, coordinates of features drawn in a map extent
       * crossing the date line won't exceed the world bounds. Default is false.
       */
      citeCompliant: false,
	
      mm: null,			//ol主程式
      layer: null,
      markerLayer: null,
      nav: null,
      point: null,
      path: null,
      polygon: null,
      circle: null,
      rectangle: null,
      drawRval: [],	//測量點位
      drawRobj: null, //測量結果物件
      rfunc: null,	//測量結束執行
      afunc: null,	//測量過程
      useControl: null,//使用中的控件
      useControlName : "",//使用中的控件名稱
      mouseEvent: null,
      /**
       * Constructor: OpenLayers.Control.EditingToolbar
       * Create an editing toolbar for a given layer. 
       *
       * Parameters:
       * layer - {<OpenLayers.Layer.Vector>} 
       * options - {Object} 
       */
      initialize: function(mm,options) {

          this.mm = mm;

          OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        
          var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
          renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

          //navigate
          this.nav = new OpenLayers.Control.Navigation({id:'_MeasureToolbar_NAV_'});
		
          this.mm.map.addControl(this.nav);

          this.layer = new OpenLayers.Layer.Vector("_MM_LAYER_MEASURE_", {
              styleMap: this.getStyleMap(),
              rendererOptions: {zIndexing: true}
          });
          this.markerLayer = new OpenLayers.Layer.Markers("_MM_MARKERS_MEASURE_");

          this.mm.map.addLayers([this.layer,this.markerLayer]);

          var This = this;
          var drawOptions = { // 1
              persist: true,
              callbacks:{
                  done: function(e,ee){

                      This.rfunc_handler(This,e);

                  },
                  point: function(e,ee){

                      This.afunc_handler(This,e);

                  },
                  move: function (e, ee) {
                      This.afunc_handler(This, e);
                  }
              },
              handlerOptions: {
                  freehand: false,
                  irregular: true
              }
          };
          this.path = new OpenLayers.Control.DrawFeature(this.layer,OpenLayers.Handler.Path,drawOptions);
          this.polygon = new OpenLayers.Control.DrawFeature(this.layer,OpenLayers.Handler.Polygon,drawOptions);
          this.circle =  new OpenLayers.Control.DrawFeature(this.layer,OpenLayers.Handler.RegularPolygon,drawOptions);
          this.rectangle = new OpenLayers.Control.DrawFeature(this.layer,OpenLayers.Handler.RegularPolygon,drawOptions);

          this.circle.handler.setOptions({sides: parseInt(120)});
          this.rectangle.handler.setOptions({sides: parseInt(4)});

          var drawControls = {
              point: new OpenLayers.Control.DrawFeature(this.layer,
                  OpenLayers.Handler.Point),
              path: this.path,
              polygon: this.polygon,
              circle: this.circle,
              rectangle: this.rectangle,
              box: new OpenLayers.Control.DrawFeature(this.layer,
                  OpenLayers.Handler.RegularPolygon, {
                      handlerOptions: {
                          sides: 4,
                          irregular: true
                      }
                  }
              )
          };

          for(var key in drawControls) {
              this.mm.map.addControl(drawControls[key]);
          }


          //this.polygon.handlerOptions.layerOptions.styleMap.styles.default.defaultStyle.strokeDashstyle = "dash";
          //this.polygon.handlerOptions.layerOptions.styleMap.styles.default.defaultStyle.fillOpacity = 1;
      },
      clearMarker: function(){
      },
      //只移除最近測量的的draw
      clearDrawLastOne: function () {

          if (this.layer.features.length >= 1) {
              var lastone = this.layer.features[this.layer.features.length - 1];
              this.layer.removeFeatures(lastone);
          }
      },
    clearDraw: function(){
		this.layer.removeAllFeatures();

		for(var i=this.markerLayer.markers.length-1;i>=0;i--){

			this.markerLayer.removeMarker(this.markerLayer.markers[i]);
		}
		

		//如果是預設測量，把結果div拿掉
		var div = null;
		if(document.getElementById("MM_Control_MeasureToolbar_DrawResult")){
			div = document.getElementById("MM_Control_MeasureToolbar_DrawResult");
			document.body.removeChild(div);
		}
	},
    /**
     * Method: setActive
	 *			設定目前是哪一個操作
     * Returns: void
     */
	setActiveControl: function(activeControl,rfunc,afunc){
		
		if(rfunc == null && afunc == null){
			this.rfunc = this.defaultRFunc;
			this.afunc = this.defaultAFunc;
		}else{
			this.rfunc = rfunc;
			this.afunc = afunc;
		}
		this.drawRval = [];


		if (this.path.active) this.path.deactivate();
		if (this.polygon.active) this.polygon.deactivate();
		if (this.circle.active) this.circle.deactivate();
		if (this.rectangle.active) this.rectangle.deactivate();

		var control = null
		switch(activeControl){
			case "NAV":
				break;
			case "polyline":
				control = this.path;
				break;
			case "polygon":
				control = this.polygon;
				break;
			case "circle":
				control = this.circle;
				break;
			case "rectangle":
				control = this.rectangle;
				break;
		}
		this.useControlName = activeControl;
		
		/*control.callbacks = {
				"done": function(){ alert(3);}, 
				"point": function(){}
			};
		*/


	    control.activate();

		if(control == null) return;
		

		this.useControl = control;
		

	},
	getDistanceFromLatLonInM: function (lat1, lon1, lat2, lon2) {

	    function deg2rad(deg) {
	        return deg * (Math.PI / 180)
	    }
	    var R = 6371; // Radius of the earth in km
	    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
	    var dLon = deg2rad(lon2 - lon1);
	    var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
	    ;
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	    var d = R * c; // Distance in km
	    return d * 1000;
	},
	rfunc_handler: function(This,control){
		
        //# 將點各次的結果刪除
	    this.drawRval = [];
        
	    //# 
	    var sum_measure = 0;
		switch(This.useControlName){
			case "polyline":
				var components = null;
				if(control.components.length >=1){
					 components = control.components;
					 for(var i=0;i<components.length;i++){
						 var x = components[i].x;
						 var y = components[i].y;

						 var lonlat = this.mm.toCoord(x,y);

						 var dgXY = new window.dgXY(lonlat.lon,lonlat.lat);
						 this.drawRval.push(dgXY);
					 }

				}

				var obj = {};
				//obj.type = e.type;
				obj.measure = control.getGeodesicLength(new OpenLayers.Projection("EPSG:900913"));
				//obj.units = e.units;

				this.drawRobj = obj;

				//畫一個polyline
				points = components;
				var line = new OpenLayers.Geometry.LineString(points);
				var feature = new OpenLayers.Feature.Vector(line);
				
				This.layer.addFeatures([feature]);
				break;
			case "polygon": 
			case "rectangle":
				
				if(!control.components) return;
				if(control.components.length <= 0) return;

				 var components = control.components[0].components;
				 var wgs84_points = [];
				 for(var i=0;i<components.length;i++){
					 var x = components[i].x;
					 var y = components[i].y;

					 var lonlat = this.mm.toCoord(x,y);

					 var dgXY = new window.dgXY(lonlat.lon,lonlat.lat);
					 this.drawRval.push(dgXY);


					 var p = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
					 wgs84_points.push(p);
				 }
					 
				 var ring = new OpenLayers.Geometry.LinearRing(wgs84_points);
				 var p = new OpenLayers.Geometry.Polygon([ring]);
				
				var obj = {};
				obj.measure = p.getGeodesicArea(new OpenLayers.Projection("EPSG:4326"));
				this.drawRobj = obj;

				//畫一個polygon
				points = components;
				var ring = new OpenLayers.Geometry.LinearRing(points);
				var polygon = new OpenLayers.Geometry.Polygon([ring]);
				var feature = new OpenLayers.Feature.Vector(polygon);
				
				This.layer.addFeatures([feature]);

				break;
		    case "circle":

		        if (!control.components) return;
		        if (control.components.length <= 0) return;

		        var components = control.components[0].components;
		        var wgs84_points = [];
		        for (var i = 0; i < components.length; i++) {
		            var x = components[i].x;
		            var y = components[i].y;

		            var lonlat = this.mm.toCoord(x, y);

		            var dgXY = new window.dgXY(lonlat.lon, lonlat.lat);
		            this.drawRval.push(dgXY);


		            var p = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
		            wgs84_points.push(p);
		        }

		        var ring = new OpenLayers.Geometry.LinearRing(wgs84_points);
		        var p = new OpenLayers.Geometry.Polygon([ring]);


		        //# 一些資訊
		        var linearRing = new OpenLayers.Geometry.LinearRing(control.components[0].components);
		        var geometry = new OpenLayers.Geometry.Polygon([linearRing]);
		        var polygonFeature = new OpenLayers.Feature.Vector(geometry, null);
		        var polybounds = polygonFeature.geometry.getBounds();

		        var minX = polybounds.left;
		        var minY = polybounds.bottom;
		        var maxX = polybounds.right;
		        var maxY = polybounds.top;

		        //calculate the center coordinates

		        var startX = (minX + maxX) / 2;
		        var startY = (minY + maxY) / 2;

		        //make two points at center and at the edge
		        var startPoint = new OpenLayers.Geometry.Point(startX, startY);
		        var endPoint = new OpenLayers.Geometry.Point(maxX, startY);
		        var radius = new OpenLayers.Geometry.LineString([startPoint, endPoint]);
		        var len = Math.round(radius.getLength()).toString();


		        var obj = {};
		        obj.measure = control.getArea(new OpenLayers.Projection("EPSG:900913"))

		        obj.radius = len;   //半徑
		        obj.center = This.mm.toWGS84(startX, startY);//圓心
		        obj.start = This.mm.toWGS84(startX, startY);//畫圓的起點
		        obj.end = This.mm.toWGS84(maxX, startY);//化圓的終點
		        this.drawRobj = obj;

		        //畫一個polygon
		        points = components;
		        var ring = new OpenLayers.Geometry.LinearRing(points);
		        var polygon = new OpenLayers.Geometry.Polygon([ring]);
		        var feature = new OpenLayers.Feature.Vector(polygon);

		        This.layer.addFeatures([feature]);


		        break;
		}
		
		This.deactivate();

		if(This.defaultRFunc == This.rfunc){
			This.rfunc(This,event,control);
		}else{
			if(This.rfunc) This.rfunc(null);
		}

		//如果是預設測量，把結果div拿掉
		var div = null;
		if(document.getElementById("MM_Control_MeasureToolbar_DrawResult")){
			div = document.getElementById("MM_Control_MeasureToolbar_DrawResult");
			document.body.removeChild(div);
		}
	},
	afunc_handler: function(This,control){

	    //# 將點各次的結果刪除
	    this.drawRval = [];

		switch(This.useControlName){
		    case "polyline":

				if(control.parent.components.length >=1){
				    var components = control.parent.components;
				    
					 for(var i=0;i<components.length;i++){
						 var x = components[i].x;
						 var y = components[i].y;

						 var lonlat = this.mm.toCoord(x,y);

						 var dgXY = new window.dgXY(lonlat.lon,lonlat.lat);
						 this.drawRval.push(dgXY);
					 }
					 
				}

				var obj = {};
				//obj.type = e.type;
				obj.measure = control.parent.getGeodesicLength(new OpenLayers.Projection("EPSG:900913"));
				//obj.units = e.units;

				this.drawRobj = obj;
				break;
			case "polygon": 
			case "rectangle":
				
			    if (control.parent.components.length <= 0) return;


			    this.drawRval = [];

                //# 紀錄每個點
			    if (control.parent.components.length >= 1) {
			        var components = control.parent.components;

			        for (var i = 0; i < components.length; i++) {
			            var x = components[i].x;
			            var y = components[i].y;

			            var lonlat = this.mm.toCoord(x, y);

			            var dgXY = new window.dgXY(lonlat.lon, lonlat.lat);
			            this.drawRval.push(dgXY);
			        }

			    }


                //# 計算結果
				var obj = {};
				obj.measure = control.parent.getGeodesicArea(new OpenLayers.Projection("EPSG:900913"));
				obj.measure = Math.abs(obj.measure);
				this.drawRobj = obj;

				break;
		    case "circle":
		        if (control.components[0].components.length <= 0) return;

		        //# 紀錄每個點
		        if (control.components[0].components.length >= 1) {
		            var components = control.components[0].components;

		            for (var i = 0; i < components.length; i++) {
		                var x = components[i].x;
		                var y = components[i].y;

		                var lonlat = this.mm.toCoord(x, y);

		                var dgXY = new window.dgXY(lonlat.lon, lonlat.lat);
		                this.drawRval.push(dgXY);
		            }

		        }

		        //# 一些資訊
		        var linearRing = new OpenLayers.Geometry.LinearRing(control.components[0].components);
		        var geometry = new OpenLayers.Geometry.Polygon([linearRing]);
		        var polygonFeature = new OpenLayers.Feature.Vector(geometry, null);
		        var polybounds = polygonFeature.geometry.getBounds();

		        var minX = polybounds.left;
		        var minY = polybounds.bottom;
		        var maxX = polybounds.right;
		        var maxY = polybounds.top;

		        //calculate the center coordinates

		        var startX = (minX + maxX) / 2;
		        var startY = (minY + maxY) / 2;

		        //make two points at center and at the edge
		        var startPoint = new OpenLayers.Geometry.Point(startX, startY);
		        var endPoint = new OpenLayers.Geometry.Point(maxX, startY);
		        var radius = new OpenLayers.Geometry.LineString([startPoint, endPoint]);
		        var len = Math.round(radius.getLength()).toString();

		        try {
		            len = parseFloat(len);
		        } catch (err) { }

		        //# 計算結果
		        var obj = {};
		        obj.measure = control.getGeodesicArea(new OpenLayers.Projection("EPSG:900913"));
		        obj.measure = Math.abs(obj.measure);

		        obj.radius = len;   //半徑
		        obj.center = This.mm.toWGS84(startX, startY);//圓心
		        obj.start = This.mm.toWGS84(startX, startY);//畫圓的起點
		        obj.end = This.mm.toWGS84(maxX, startY);//化圓的終點
		        this.drawRobj = obj;

		        break;
		}
		
		if (typeof event === 'undefined') {
		    if (This.afunc) This.afunc();
		} else {
		    if (This.afunc) This.afunc(event);
		}
	},
	measuring: function(This,e,control,isPartial){
		


		
	},
	defaultRFunc: function(This,e,control){
		if(!control) return;
		if(control.components.length <= 0) return;
		

		var pp = null;
		switch(this.useControlName){
			case "polyline":
				pp = control.components;
				break;
			case "polygon": 
			case "circle": 
			case "rectangle":
				pp = control.components[0].components;
				break;
		}
		
		var x = 0;
		var y = 0;
		for(var i=0;i<pp.length;i++){
			x += pp[i].x;
			y += pp[i].y;
		}
		x = x / pp.length;
		y = y / pp.length;

		var tt = This.mm.toWGS84(x,y);

		var icon = new EzMap.HtmlStr("<div style='width:320px;font-weight:bold;color:red;font-size:13px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + This.getMeasureFormat(This.drawRobj) + "</div>", This.mm);
		var marker = new OpenLayers.Marker(This.mm.fromWGS84(tt.lon,tt.lat),icon);
		
		This.markerLayer.addMarker(marker);

		
	},
	defaultAFunc: function(e){
		
	    return;

		var div = null;
		if(!document.getElementById("MM_Control_MeasureToolbar_DrawResult")){
			div = OpenLayers.Util.createDiv("MM_Control_MeasureToolbar_DrawResult");
		}else{
			div = document.getElementById("MM_Control_MeasureToolbar_DrawResult");
		}
		
		
		div.style.zIndex = "99999";
		div.style.position = "absolute";
		div.style.left = e.clientX+"px";
		div.style.top = (parseInt(e.clientY)+24)+"px";
		div.style.color = "red";
		div.style.fontSize = "13px";
		div.style.fontWeight = "bold";

		div.innerHTML = this.getMeasureFormat(this.drawRobj);

		document.body.appendChild(div);
	},
	getMeasureFormat: function(obj){
		
		if(!obj) return;
		
		var unit = "";
		switch(this.useControlName){
			case "polyline":

				if(obj.measure >= 1000){
					unit = "km";
					obj.measure = obj.measure/(1000);
				}else{
					unit = "m";
				}
				break;
			case "polygon": 
			case "circle": 
			case "rectangle":
				if(obj.measure >= 1000000){
					unit = "km";
					obj.measure = obj.measure/(1000*1000);
				}else{
					unit = "m";
				}
				break;
		}


		switch(unit){
			case "m":
				unit = _$EZMAP.UNIT_M;
				break;
			case "km":
				unit = _$EZMAP.UNIT_KM;
				break;
		}
		

		var measure = parseInt(parseFloat(obj.measure)*1000)/1000;
		switch(this.useControlName){
			case "polyline":
				 return _$EZMAP.UNIT_DISTANCE+"&nbsp;"+measure+unit;
				break;
			case "polygon": 
			case "circle": 
			case "rectangle":
				return _$EZMAP.UNIT_AREA+"&nbsp;"+measure+_$EZMAP.UNIT_SQUARE+unit;
				break;
		}
		
	},
	deactivate: function () {

	    if (this.useControl && this.useControl.active == true) {
	        this.useControl.deactivate();
	    }

		if (this.path.active == true) this.path.deactivate();
		if (this.polygon.active == true) this.polygon.deactivate();
		if (this.circle.active == true) this.circle.deactivate();
		if (this.rectangle.active == true) this.rectangle.deactivate();
	},
    /**
     * Method: hidden
	 *			要關閉哪些icon
     * Returns:
     * {DOMElement}
     */
	hidden: function(type){
		switch(type){
			case "print":
				break;
			default:

		}
	},
    /**
     * Method: getSketchSymbolizers
     * Returns:
     * {DOMElement}
     */
	getStyle: function(){

		var point = {
				pointRadius: 4,
				graphicName: "square",
				fillColor: "white",
				fillOpacity: 1,
				strokeWidth: 1,
				strokeOpacity: 1,
				strokeColor: "#333333"
			}
		var line = {
				strokeWidth: 3,
				strokeOpacity: 1,
				strokeColor: "#666666",
				strokeDashstyle: "dash"
			}
		var polygon = {
				strokeWidth: 3,
				strokeOpacity: 1,
				strokeColor: "#666666",
				fillColor: "#ffffff",
				fillOpacity: 0.5,
				strokeDashstyle: "dash"
			}

		if(this.mm.lineStyle) line = this.mm.lineStyle;
		if(this.mm.polygonStyle) polygon = this.mm.polygonStyle;

		var sketchSymbolizers = {
			"Point": point,
			"Line": line,
			"Polygon": polygon
		};
		var style = new OpenLayers.Style();
		style.addRules([
			new OpenLayers.Rule({symbolizer: sketchSymbolizers})
		]);
		return style;
	},
    getStyleMap: function() {

		var styleMap = new OpenLayers.StyleMap({
				"default": this.getStyle(),
				"delete":this.getStyle(),
				"select":this.getStyle(),
				"temporary":this.getStyle()
					});
        return styleMap;
    },
    /**
     * Method: draw
     * calls the default draw, and then activates mouse defaults.
     *
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        if (this.defaultControl === null) {
            this.defaultControl = this.controls[0];
        }

		//這裡將本class使用到的Nvatiation的功能關閉，真正使用到的在最外部
		this.map.getControlsBy('id','_MeasureToolbar_NAV_')[0].disableZoomBox();			
		this.map.getControlsBy('id','_MeasureToolbar_NAV_')[0].disableZoomWheel();
        return div;
    },
    /**
     * 取得目前是否開啟測量
     */
    isActive : function () {
        try{
            return map.mm.measure.useControl.active;
        } catch (err) {
            return false;
        }
    },
    /**
    * 取得目前測量項目
    */
    getControlName: function () {
        try {
            return map.mm.measure.useControlName;
        } catch (err) {
            return "";
        }
    },
    CLASS_NAME: "EzMap.Control.MeasureToolbar"
});    

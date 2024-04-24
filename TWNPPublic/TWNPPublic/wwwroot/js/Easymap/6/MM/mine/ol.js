
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 1;//specify how many times do you want to try to reload tiles when its reach timeout.

OpenLayers.Renderer.SVG.MAX_PIXEL = 30000;
(function (EzMap) {

EzMap.EasymapErr = "EasymapErr:";
EzMap.EasymapLog = "EasymapLog:";
EzMap.ol = OpenLayers.Class({

    /** 
     * Property: coordTrans 
     * {DOMElement} 
     */
	coordTrans: null,
    
    /** 
     * Property: popup 
     * {DOMElement} popup variable
     */
	popup: null,

    /** 
     * Property: resolutions 
     * {DOMElement} resolution default
     */
	resolutions: {
	    resolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
							        19567.87923828125, 9783.939619140625,
							        4891.9698095703125, 2445.9849047851562,
							        1222.9924523925781, 611.4962261962891,
							        305.74811309814453, 152.87405654907226,
							        76.43702827453613, 38.218514137268066,
							        19.109257068634033, 9.554628534317017,
							        4.777314267158508, 2.388657133579254,
							        1.194328566789627, 0.5971642833948135,
                                    0.2985821416974068,//19
									0.1492910708487034, 0.0746455354243517],
	    serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
							        19567.87923828125, 9783.939619140625,
							        4891.9698095703125, 2445.9849047851562,
							        1222.9924523925781, 611.4962261962891,
							        305.74811309814453, 152.87405654907226,
							        76.43702827453613, 38.218514137268066,
							        19.109257068634033, 9.554628534317017,
							        4.777314267158508, 2.388657133579254,
							        1.194328566789627, 0.5971642833948135, 0.2985821416974068,
									0.1492910708487034, 0.0746455354243517],
		transitionEffect: 'resize'
	},

    /** 
     * Property: imageDiv 
     * {DOMElement} 
     */
    map: null,
	
    /** 
     * Property: items
     * {array} all item added to map
     */
	items: [],
    /** 
     * Property: layers
     * {array} all layers
     */
	layers: [],

    /** 
     * Property: gmarkers
     * {array} cluster layers
     */
	gmarkers: [],
    /** 
     * Property: dgcharts
     * {array} chart layers
     */
    dgcharts:[],
	/**
	 *	kml processer
	 */
	easykml: null,

	/**
	 *	move、zoom opration
	 */
	navigation: null,
	panZoomBar: null,
    /** 
     * Property: layerSwitcher
     * {object} 
     */
	layerSwitcher: null,
    /** 
     * Property: measuere
     * {object} tools
     */
	measure: null,
	statusbar: null,
	/**
	 *	variables
	 */
	easymap: null,			//easymap inerface
	root: "",				//
	mname: "",				//default layer (basic layer)
	coordinate: "WGS84",	//default coorindate
	debug: true,			//debug mode
	dcz: 10,				//hawk level difference
	errorPic: "",			//default pic not found
	zmScaleBK: null,		//dir button width/height
	sStatus: false,			//status left bottom
	center: null,			//default center lon/lat
	zoom: 5,				//default zoom
	zmWMap: [],				//position of hawk
    zmSwitcher:[],			//position of switcher
	lineStyle: null,		//line style
	polygonStyle: null,		//polygon style
	events: [],             //events
    itemsn:0,               //item serial number
    initialize: function(id,options) {
        this.layers = [];
		this.mapDivId = id;

		if(options.coordinate) this.coordinate = options.coordinate;
		if(options.debug) this.debug = options.debug;
		if(options.layers.length <= 0 ){
		}
		if(options.dcz) this.dcz = options.dcz;
		if(options.errorPic) this.errorPic = options.errorPic;
		if(options.zmScaleBK) this.zmScaleBK = options.zmScaleBK;
		if(options.mname) this.mname = options.mname;
		if(options.root) this.root = options.root;
		if(options.center) this.center = options.center;
		if(options.zoom) this.zoom = options.zoom;
		if(options.zmWMap) this.zmWMap = options.zmWMapBK;
		if(options.zmSwitcher) this.zmSwitcher = options.zmSwitcher;
		if(options.lineStyle) this.lineStyle = options.lineStyle;
		if(options.polygonStyle) this.polygonStyle = options.polygonStyle;
		if(options.easymap) this.easymap = options.easymap;
		if(options.sAuthor) this.sAuthor = options.sAuthor;
		if(options.sStatus) this.sStatus = options.sStatus;
		if(options.isEasymap5_mapini) this.isEasymap5_mapini = options.isEasymap5_mapini;
		if(options.sStatus) this.sStatus = options.sStatus;
		if(options.zmScaleLine) this.zmScaleLine = options.zmScaleLine;
        if (options.sScaleBar) this.sScaleBar = options.sScaleBar;
        this.easymap = options.easymap;
		this.debug = options.debug;
		
		
		///// 環境基本設定
		OpenLayers.ImgPath = OpenLayers._getScriptLocation()+"../imgs/";	//預設圖片/icon的位置 = /OpenLayers/img
		
		///// 網頁物件 get host
		var href = window.location.href;
		var hrefs = href.split("/");
		var host = "";
		for (var i = 0; i < hrefs.length - 1; i++) {
		    host += hrefs[i] + "/";
		}

		_OPENLAYERS_PLUGIN_ROOT = host + "Plugin/";
		
		////// 坐標系統物件
		this.coordTrans = new CoordTrans();
		/** sample:
		 *		_coordTrans.from(214116.01994942717,2675116.0634858715,_coordTrans.TWD67);
		 *		var t = _coordTrans.toWGS84();
		 */

		/*****************************************
		 *		基本底圖/圖層
		 *
		 *****************************************/
		this.map = null;
		this.map = new OpenLayers.Map({
		    div: this.mapDivId,
		    size:new OpenLayers.Size(128,128),
			projection: new OpenLayers.Projection("EPSG:900913"),
			displayProjection: new OpenLayers.Projection("EPSG:4326"),
			controls:[],
			theme: null,
			allOverlays: true,
			numZoomLevels: options.numZoomLevels,
			resolutions: options.resolutions
		});



		///// KML元件
		this.easykml = new EzMap.EasyKML();
		this.easykml.setMap(this.map);

		///// 預設控制項		
		this.navigation = new OpenLayers.Control.Navigation({id:'_MAIN_NAVIGATION_'});
		//var KeyboardDefaults = new OpenLayers.Control.KeyboardDefaults();
		var div = new EzMap.Control.createDiv();

		if (EzMap.Tools.isMobileDevice() == false) {
		    this.map.addControl(this.navigation);

		} else {
		    /*var tn = new OpenLayers.Control.TouchNavigation({
		        dragPanOptions: {
		            enableKinetic: true
		        }
		    });
		    this.map.addControl(tn);*/
		}
		//this.map.addControl(KeyboardDefaults);
		this.map.addControl(div);
		
        //測量的元件		

	    this.measure = new EzMap.Control.MeasureToolbar(this);

		this.map.addControl(this.measure);

		this.measure.div.style.display = "none";

		//左下角比例尺
		if(this.sScaleBar){
		    var sLine = new EzMap.Control.ScaleLine();
			this.map.addControl(sLine);
			
			sLine.div.style.width = "180px";//不讓比例尺太長遮到別的

			sLine.showTopOutUnits = _$EZMAP.UNIT_KM;
			sLine.showTopInUnits = _$EZMAP.UNIT_M;
			sLine.shotBottomOutUnits = _$EZMAP.UNIT_MILE;
			sLine.showBottomInUnits = _$EZMAP.UNIT_FEET;

			if(this.zmScaleLine){
				sLine.div.style.left = this.zmScaleLine[0]+"px";
				sLine.div.style.marginBottom = this.zmScaleLine[1]+"px";
				sLine.div.style.display = "block";
				sLine.div.style.bottom = "0";

			}
		}

		//// 圖層切換
		var t = new EzMap.Control.LayerSwitcher({});
		t.setMap(this.map);
		t.setMM(this);
		t.setMName(this.mname);
		t.setRoot(this.root);
		t.setDcz(this.dcz);
		t.debug = this.debug;
		this.layerSwitcher = t;
		this.layerSwitcher.baseLayerId = this.mname;
		this.map.addControl(t);
			
		//底圖切換
		if(this.zmSwitcher){
			this.setMapTypeSelectorP(this.zmSwitcher);
		}


        ///// 載入使用到的底圖
		this.addItem(options.layers);
		

		//初始圖層
		if(this.mname){
			this.switchMap(this.mname);
	
		}

		////// 預設的大小、位置…etc
		if(!this.center.x || !this.center.y || !this.zoom){

			if(this.debug) alert("未設定預設起使位置與zoom level");
		}else{

			this.coordTrans.from(this.center.x,this.center.y,this.coordinate);
			var p = this.coordTrans.toWGS84();

			this.map.setCenter(
				new OpenLayers.LonLat(p.lon, p.lat).transform(
					new OpenLayers.Projection("EPSG:4326"),
					this.map.getProjectionObject()
				), 
				this.zoom
			);
		}

		///// 右下角logo
		if(this.sAuthor){

			var div = this.createDiv("_EZMAP6_INNERUSED_IDSYS_LOGO_");
			div.innerHTML = "<img src='"+_dgmap4path+"imgs/easymap_logo.png'>";
			div.style.zIndex = "99999";
			this.resizeTo();
		}

		///// 下方status bar
		if(this.sStatus){
		    var statusBar = new EzMap.Control.StatusBar();
			statusBar.mm = this;
			this.map.addControl(statusBar);

			this.statusbar = statusBar;
		}


		/*****************************************
		 *	部份行動版設定
		 *
		 *****************************************/	
		if (EzMap.Tools.isMobileDevice() == true) {
			var mobile_arrow = document.getElementById("mobile-arrow");
			if(mobile_arrow){
				mobile_arrow.style.display = "";
			}
		}

		//test 90013: 13561347,2886574

		
    },
    ////////////////////////////////////////////////
	getBaseLayers: function(){

		var baseLayers = [];
		for(var i=0;i<this.layers.length;i++){
			if(this.layers[i].options.bg){
				baseLayers.push(this.layers[i]);
			}
		}
		return baseLayers;
	},
	setCoordinate: function(coord){
		switch(coord){
			case this.coordTrans.TM2_67:
			case this.coordTrans.TM2_97:
			case this.coordTrans.TWD67:
			case this.coordTrans.TWD97:
			case this.coordTrans.WGS84:
				this.coordinate = coord;
				break;
			default:
				this.coordinate = "WGS84";
				break;
		}
	},
	setKmlProxy: function(url){
		this.easykml.proxy = url;
	},
	addMapControl: function(itxy){
		//如果有新增過
		if(this.map.getControlsByClass("MM.Control.PanZoomBar").length >= 1){
			return false;
		}

		var itoolxy = (itxy == null) ? this.zmScaleBK : itxy;


		this.panZoomBar = new EzMap.Control.PanZoomBar({ id: '_PANZOOMBAR_' });
		this.panZoomBar.setZoomWorld(this.center,this.zoom);

		this.map.addControl(this.panZoomBar);
		
		this.panZoomBar.position.x = 0;
		this.panZoomBar.position.y = 0;
		
		
		this.panZoomBar.left = itoolxy[0]+"px";
		this.panZoomBar.top = itoolxy[1]+"px";

		this.setMapControl(itoolxy);
		//手機版
		if (EzMap.Tools.isMobileDevice()) {
			this.panZoomBar.position.x = itoolxy[0];
			this.panZoomBar.position.y = itoolxy[1];
		}
		return true;
	},
	setMapControl: function(itxy){
		//如果有新增過
		if(this.map.getControlsByClass("MM.Control.PanZoomBar").length <= 0){
			return false;
		}


		this.panZoomBar.div.style.left = (parseInt(itxy[0]))+"px";
		this.panZoomBar.div.style.top = (parseInt(itxy[1]))+"px";
	},
	addMapTypeSelector: function(stype,itxy){

		if(!this.layerSwitcher) return;

		this.layerSwitcher.element.style.display = "";
		if(itxy){
			this.setMapTypeSelectorP(itxy);
		}
	},
	setMapTypeSelectorP: function(itxy){
	
	    if (EzMap.Tools.isArray(itxy) == false) return false;
		if(!this.layerSwitcher) return;
		
		if(this.layerSwitcher.element){
			this.layerSwitcher.element.style.right = (parseInt(itxy[0])+80)+"px";
			this.layerSwitcher.element.style.top = (parseInt(itxy[1])-10)+"px";
		}

	},
	getMapTypeSelectorV: function () {

	    if (this.layerSwitcher.element.style.display == "none") {
	        return false;
	    } else {
	        return true;
	    }
        
	    return false;
	},
	setMapTypeSelectorV: function(tf){

		switch(tf.toString().toLowerCase()){
			case "true":
				tf = true;
				break;
			case "false":
				tf = false;
				break;
		}

		if (!EzMap.Tools.isBoolean(tf)) {
			tf = true;
		}

		if(tf){
			this.layerSwitcher.element.style.display = "";
		}else{
			this.layerSwitcher.element.style.display = "none";
		}
		return true;
	},
	addWMap: function(){

		if(this.map.getControlsByClass("MM.Control.LTOverviewMap").length >= 1){
			return false;
		}
		
		var baseLayer = null;
		
		baseLayer = this.getLayerById(this.layerSwitcher.baseLayerId);
		
		if(baseLayer == null) return false;

		var tmp = this.getDgSource(baseLayer);

		var options = {layers: [tmp]};

		var lto = new EzMap.Control.LTOverviewMap(options);
		lto.minRatio = this.dcz;
		lto.maxRatio = this.dcz;
		this.map.addControl(lto);
		
		if(this.zmWMapBK){
			lto.div.style.bottom= this.zmWMapBK[0]+"px";
			lto.div.style.right= this.zmWMapBK[1]+"px";
		}
	},
	setWMapV: function(tf){
	
		if(this.map.getControlsByClass("MM.Control.LTOverviewMap").length <= 0){
			return false;
		}
		
		switch(tf.toString().toLowerCase()){
			case "true":
				tf = true;
				break;
			case "false":
				tf = false;
				break;
		}

		if (!EzMap.Tools.isBoolean(tf)) {
			tf = true;
		}

		var wmap = this.map.getControlsByClass("MM.Control.LTOverviewMap")[0];

		if(tf){
			wmap.div.style.display = "";
		}else{
			wmap.div.style.display = "none";
		}
		return true;
	},
	getMapControlV: function () {
	    if (this.map.getControlsByClass("MM.Control.PanZoomBar").length <= 0) {
	        return false;
	    }
	    var panzoombar = this.map.getControlsByClass("MM.Control.PanZoomBar")[0];

	    if (panzoombar.div.style.display == "none") {
	        return false;
	    } else {
	        return true;
	    }
	    return false;
	},
	setMapControlV: function(tf){
		if(this.map.getControlsByClass("MM.Control.PanZoomBar").length <= 0){
			return false;
		}
		
		switch(tf.toString().toLowerCase()){
			case "true":
				tf = true;
				break;
			case "false":
				tf = false;
				break;
		}

		if (!EzMap.Tools.isBoolean(tf)) {
			tf = true;
		}

		var panzoombar = this.map.getControlsByClass("MM.Control.PanZoomBar")[0];

		if(tf){
			panzoombar.div.style.display = "";
		}else{
			panzoombar.div.style.display = "none";
		}
		return true;
	},
	setMapDraggable: function(tf){
		switch(tf.toString().toLowerCase()){
			case "true":
				tf = true;
				break;
			case "false":
				tf = false;
				break;
		}

		if (!EzMap.Tools.isBoolean(tf)) {
			tf = true;
		}
		if(tf){
			this.navigation.autoActivate = true;
		}else{
			this.navigation.autoActivate = false;
		}
	},
	swheelZoom: function(tf){
		
		
		switch(tf.toString().toLowerCase()){
			case "true":
				tf = true;
				break;
			case "false":
				tf = false;
				break;
		}

		if (!EzMap.Tools.isBoolean(tf)) {
			tf = true;
		}

		if(tf){
			this.navigation.enableZoomBox();
			this.navigation.enableZoomWheel();
		}else{
			this.navigation.disableZoomBox();
			this.navigation.disableZoomWheel();
		}
	},
	addMeasure: function(){

		
	},
	createDiv: function(id, px, sz, imgURL, position,                              border, overflow, opacity){


		var child = OpenLayers.Util.createDiv(id, px, sz, imgURL, position, 
                                     border, overflow, opacity);
		if (this.map.div.style.zIndex == "") {
		    child.style.zIndex = 100;;
		} else {
		    child.style.zIndex = (parseInt(this.map.div.style.zIndex.toString().toLowerCase().replace("px", "")) + 100);
		}
		
		this.map.getControlsByClass("MM.Control.createDiv")[0].div.appendChild(child);
		//this.map.div.appendChild(child);
		return child;
	},
	removeDiv: function(rdiv){
		
		var div = this.map.getControlsByClass("MM.Control.createDiv")[0];
		div.div.removeChild(rdiv)
	},
	stopNavigation: function(){
		if(this.map.getControlsByClass("OpenLayers.Control.Navigation").length <= 0){
			return false;
		}
		for(var i=0;i<this.map.getControlsByClass("OpenLayers.Control.Navigation").length;i++){
			this.map.getControlsByClass("OpenLayers.Control.Navigation")[i].deactivate();
		}

	},
	startNavigation: function(){
		if(this.map.getControlsByClass("OpenLayers.Control.Navigation").length <= 0){
			return false;
		}
		for(var i=0;i<this.map.getControlsByClass("OpenLayers.Control.Navigation").length;i++){
			this.map.getControlsByClass("OpenLayers.Control.Navigation")[i].activate();
		}
	},
	resizeTo: function(w,h){
		this.map.updateSize();
		
		var size = this.map.getCurrentSize();

		if(this.sAuthor){
			var mapWidth = size.w;
			var mapHeight = size.h;
			if(this.sScaleBar){
				mapWidth -= 90;
				mapHeight -= 64;
			}else{
				mapWidth -= 90;
				mapHeight -= 42;
			}
			var div = document.getElementById("_EZMAP6_INNERUSED_IDSYS_LOGO_");
			if(div){
				div.style.left = mapWidth+"px";
				div.style.top = mapHeight+"px";
			}
		}
		
		if(this.isEasymap5_mapini){
			var mapWidth = size.w;
			var mapHeight = size.h;
			mapWidth -= 160;
			mapHeight -= 72;
			var div = document.getElementById("_EZMAP6_INNERUSED_IDSYS_EZ5_SW_MAP_");
			if(div){
				div.style.marginLeft = mapWidth+"px";
				div.style.marginTop = "20px";
			}
		}
	},
	getWidth: function(){
		return this.map.size.w;
	},
	getHeight: function(){
		return this.map.size.h;
	},
	getCX: function(){
		return this.getCenter().lon;
	},
	getCY: function(){
		return this.getCenter().lat;
	},
	getCenter: function(){
		if(this.map.center ==  null){
			return {lon: 0,lat:0};
		}
		return this.toCoord(this.map.center.lon,this.map.center.lat);
	},
	getRectBound: function(){
		var PP = this.map.getExtent();
		var lt = this.toCoord(PP.left,PP.top);
		var rb = this.toCoord(PP.right,PP.bottom);
		
		return [lt.lon,
				lt.lat,
				rb.lon,
				rb.lat];
	},
	getZoom: function(){
		return this.map.zoom;
	},
	setZoom: function(zoom){
		if(zoom == null){
			return false;
		}
		this.map.setCenter(new OpenLayers.LonLat(this.map.center.lon, this.map.center.lat),	zoom);
	},
	exPanTo: function(dgXY){
		if(dgXY == null) return false;

		var lon = dgXY.x;
		var lat = dgXY.y;

		//先確認坐標系統
		this.coordTrans.from(lon,lat,this.coordinate);
		var c = this.coordTrans.toWGS84();
		
		var p = this.fromWGS84(c.lon,c.lat);

		var lonLat = new OpenLayers.LonLat(p.lon,p.lat);
		this.map.panTo(lonLat);
	},
	zoomTo: function(zoom){
		this.map.zoomTo(zoom);
	},
	setCenter: function(dgXY,zoom){

		if(dgXY == null) return false;
		if(zoom == null){
			zoom = this.getZoom();
		}
		
		var lon = dgXY.x;
		var lat = dgXY.y;

		//先確認坐標系統
		this.coordTrans.from(lon,lat,this.coordinate);
		var c = this.coordTrans.toWGS84();
		
		lon = c.lon;
		lat = c.lat;

		//移到指定的位置
		var p = this.fromWGS84(c.lon, c.lat);

	    //移到指定的位置
		this.map.setCenter(
			p,
			zoom
		);
	},
	zoomIn: function(){
		this.map.zoomIn();
	},
	zoomOut: function(){
		this.map.zoomOut();
	},
	getRectPicBBOX: function(){

		var bbox = this.map.getExtent();

	},
	openInfoWindow: function(XY, content, ww, wh, closeBoxCallback){

		this.coordTrans.from(XY.x,XY.y,this.coordinate);
		var p = {};

		//轉到 WGS84
		p = this.coordTrans.toWGS84();
		var lon = p.lon;
		var lat = p.lat;

		return this.addPopup(lon,lat,"",content,ww,wh,closeBoxCallback);
	},
	closeInfoWindow: function(){
		if(this.popup){
			this.map.removePopup(this.popup);
		}
	},
	removeItem: function(obj){

		if(obj == null) return false;

	    //為了移除測量最近一個draw
		if (obj.drawing && obj.drawing == true) {
		    this.measure.clearDrawLastOne();
		}

		//標準化成陣列
		var items = new Array();
		if(isArray(obj))
		{
			items = obj;	
		}
		else
		{
			items.push(obj);	
		}
		if(items.length <= 0) return;
		
		if(!items[0]) return;

		for (var i = 0; i < items.length; i++) {

		    var groupid = items[i]._$groupid;
			var item = items[i];

			if (!item.type) continue;

			switch(item.type.toString().toLowerCase()){
				case "dgkml":

					this.easykml.removeKml(item.id);
					break;
				case "dgsource":
					if(item.options.bg){
						this.layerSwitcher.removeLayer(item);
					} else {
					    
					    if (item.instance) {
					        var tl;
					        for (var i = 0; i < this.map.layers.length; i++) {
					            if (item.instance.id == this.map.layers[i].id) {
					                tl = this.map.layers[i];
					                break;
					            }
					        }
                            if(tl != undefined){
                                this.map.removeLayer(item.instance);
                            }
					    }
					}
					for(var j=this.layers.length-1;j>=0;j--){
						if(item.id == this.layers[j].id){
						    this.layers.splice(j, 1);
						}
					}
					break;
				case "gmarker":	
					
					for(var j=0;j<this.gmarkers.length;j++){
						if("_DRAW_"+this.gmarkers[0]._$groupid == "_DRAW_"+groupid){
							this.gmarkers.indexPop(j);
						}
					}

					if(this.map.getLayersByName("_DRAW_"+groupid).length >= 1){
					    layer = this.map.getLayersByName("_DRAW_"+groupid)[0];
					    this.map.removeLayer(layer);
					}
					if(this.map.getLayersByName("_MARKERS_"+groupid).length >= 1){
					    layer = this.map.getLayersByName("_MARKERS_"+groupid)[0];
					    this.map.removeLayer(layer);
					}
              
	                break;
			    case "dgchart":

			        for (var j = this.dgcharts.length-1; j >=0 ; j--) {
			            if (this.dgcharts[j].id == groupid) {

			                this.dgcharts[j].destroy();
			                this.dgcharts.indexPop(j);

			            }
			        }
			        break;
				default:

					if(this.map.getLayersByName("_DRAW_"+groupid).length >= 1){
					    _$EZMAP.varables.layer = this.map.getLayersByName("_DRAW_" + groupid)[0];
					    this.map.removeLayer(_$EZMAP.varables.layer);
					}
					if(this.map.getLayersByName("_MARKERS_"+groupid).length >= 1){
					    _$EZMAP.varables.layer = this.map.getLayersByName("_MARKERS_" + groupid)[0];
					    this.map.removeLayer(_$EZMAP.varables.layer);
                    }
                    if (this.map.getLayersByName("_MARKERSDRAG_" + groupid).length >= 1) {
                        _$EZMAP.varables.layer = this.map.getLayersByName("_MARKERSDRAG_" + groupid)[0];
                        //remove control
                        if (_$EZMAP.varables.layer) {
                            this.map.removeControl(_$EZMAP.varables.layer.drag);
                        }
                        //remove layer
                        this.map.removeLayer(_$EZMAP.varables.layer);
                    }
                    
					break;
			}

		}


	},
	_popupItem: function (id) {



	    //將this.items也刪一刪
	    for (var i = this.items.length-1; i >=0 ; i--) {
	        var items = this.items[i];

	        for (var j = items.length-1; j >= 0 ; j--) {
	            var item = items[j];

	            if (item == null || item == undefined) continue;

	            if (item.id === id) {
	                
	                this.items[i].splice(j,1);
	                break;
	            }
	        }
	    }

	    //空白的pop
	    for (var i = this.items.length - 1; i >= 0 ; i--) {

	        if (this.items[i].length <= 0) {
	            this.items.indexPop(i);
	        }
	    }
	},
	formatItem: function(obj){

		if(obj == null) return null;
		if(obj.length <= 0) return null;

		//標準化成陣列
		var _tmpary = new Array();
		if(isArray(obj))
		{
			_tmpary = obj;	
		}
		else
		{
			_tmpary.push(obj);	
		}
		return _tmpary;
	},
	addItem: function(obj){
		
		if(obj == null) return false;
		if(obj.length <= 0) return false;

		//標準化成陣列
		var _tmpary = this.formatItem(obj);
		
		//再分類成圖層/畫圖
		var thisLayers = [];
		var thisDraws = [];
		var thisKmls = [];
		var thisMapini = [];
		var thisCharts = [];
		
		for(var iv=0;iv<_tmpary.length;iv++)
		{

			if(_tmpary[iv] == null) continue;

			_tmpary[iv]._$groupid = this.itemsn;	//給一個團體id

			switch(_tmpary[iv].type.toString().toLowerCase()){
				case "dgsource":
					if(this.getLayersByName(_tmpary[iv].options.name).length > 0){
					    if (this.debug) {
					        console.error(EzMap.EasymapErr + "圖層名稱重覆" + _tmpary[iv].options.name);
					    }
					    return false;
					}else{
					    _tmpary[iv].id = "dgsource_" + this.itemsn + "_" + iv;//給一個唯一值
						
						thisLayers.push(_tmpary[iv]);
					}
					break;
				case "dgkml":

				    _tmpary[iv].id = "dgkml_" + this.itemsn + "_" + iv;//給一個唯一值

					thisKmls.push(_tmpary[iv]);

					break;
			    case "dgchart":
			        _tmpary[iv].id = "dgchart_" + this.itemsn + "_" + iv;//給一個唯一值

			        thisCharts.push(_tmpary[iv]);
			        break;
				case "point":
				case "curve":
				case "polygon":
			    case "polyline":

			        _tmpary[iv].id = "draw_" + this.itemsn + "_" + iv;//給一個唯一值

			        thisDraws.push(_tmpary[iv]);
			        break;
			    case "marker":
			        _tmpary[iv].id = "marker_" + this.itemsn + "_" + iv;//給一個唯一值

			        thisDraws.push(_tmpary[iv]);
			        break;
			    case "gmarker":

			        _tmpary[iv].id = "gmarker_" + this.itemsn + "_" + iv;//給一個唯一值

					thisDraws.push(_tmpary[iv]);
					break;
			}

			
		}

		this.itemsn++;

		this.items.push(_tmpary);
		
		if(thisLayers.length > 0) this.addDgSources(thisLayers);

		if(thisKmls.length > 0) this.addKmls(thisKmls);
		
		if (thisDraws.length > 0) this.addDraws(thisDraws);

		if (thisCharts.length > 0) this.addCharts(thisCharts);

		this.map.resetLayersZIndex();
	},
	addCharts: function (items) {


	    var c = new EzMap.BaseType.dgChart(items[0]._$groupid, this.map, items);

	    this.dgcharts.push(c);

	},
	addKmls: function(items){


		var THIS = this;
		var ITEMS = items;
		var i=items.length-1;

		var si = setInterval(function(obj){	//圖台沒辦法一直處理載入kml,所以要等一下

			if(i<0){
				clearInterval(si);
			}else{
			    var dgkml = ITEMS[i];
				THIS.easykml.addKml(ITEMS[i]);
			}
			i--;
		},20);
	},
	addDgSources: function (items) {

		for(var i=0;i<items.length;i++){
			this.layers.push(items[i]);
			this.addDgSource(items[i]);
		}
		
	},
	addDraws: function(items){

		var groupid = items[0]._$groupid;

		//# 畫圖用的圖層
		var vectors = new OpenLayers.Layer.Vector("_DRAW_" + groupid, { 
		    rendererOptions: { zIndexing: true } 
		});
        vectors.mmtype = 'dgdraw';

        //# marker用的圖層
		var markers = new OpenLayers.Layer.Markers("_MARKERS_"+groupid);
        markers.mmtype = 'dgmarker';

        //# drag marker用的圖層
        var dragvectors = new OpenLayers.Layer.Vector("_MARKERSDRAG_" + groupid, {
        });
        dragvectors.mmtype = 'dgmarker';
        dragvectors._dgmarkers = [];

        //# 預載到圖台
		this.map.addLayer(vectors);
		this.map.addLayer(markers);
        this.map.addLayer(dragvectors);

		for(var i=0; i<items.length; i++){
			var item = items[i];

			var features = null;
			var marker = null;

			item.instance = this;

			switch(item.type.toString().toLowerCase()){
				case "point":
					features = this.point(item);
					vectors.addFeatures([features]);
					item.layer = vectors;
					break;
				case "curve":
					features = this.curve(item);
					vectors.addFeatures([features]);
					item.layer = vectors;
					break;
				case "polygon":
					features = this.polygon(item);
					vectors.addFeatures([features]);
					item.layer = vectors;
					break;
				case "polyline":
					features = this.polyline(item);
					vectors.addFeatures([features]);
					item.layer = vectors;
					break;
			    case "marker":

                    if (item.drag == true) {
                        marker = this._dragmarker(item);
                        item.layer = dragvectors;
                        item.marker = marker;
                        item.easymapClass = 'dgdragmarker';
                        if (marker != null) {
                            dragvectors.addFeatures([marker]);
                            dragvectors._dgmarkers.push(item);
                        }
                        
                    } else {
                        marker = this.marker(item);
                        markers.addMarker(marker);
                        item.marker = marker;
                        item.layer = markers;
                        item.easymapClass = 'dgmarker';
                    }
                    
					break;
				case "gmarker":
					var gmarker = this.gmarker("_DRAW_"+items[0]._$groupid,item);
					item.layer = gmarker;
					break;
			}
			
        }

        //# 處理drag vector
        if (dragvectors.features.length >= 1) {
            var drag = new OpenLayers.Control.DragFeature(dragvectors, {
                autoActivate: true,
                onComplete: function (event,xy) {
                    var dgmarker = this.feature.data._dgmarker;
                    var easymap = this.feature.data._easymap;
                    var xy = easymap.toWGS84(event.geometry.x, event.geometry.y);
                    var dgxy = new dgXY(xy.lon, xy.lat);
                    if (dgmarker.ondragend) {
                        dgmarker.ondragend.apply(dgmarker, [dgxy, dgmarker]);
                    }
                }
            })
            dragvectors.drag = drag;
            this.map.addControl(drag);
        }

        //# 移除沒用到的vector
		if(vectors.features.length <= 0){
			this.map.removeLayer(vectors);
		}
		if(markers.markers.length <= 0){
			this.map.removeLayer(markers);
        }
        if (dragvectors.features.length <= 0) {
            this.map.removeLayer(dragvectors);
        }
	},
	point: function(item){
		var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
		
		if(item.ptRadius == null) item.ptRadius = 5;
	
		var obj = this.rgbToHex(item.fillStyle);

		style.fillColor = obj.color; 
		style.fillOpacity = obj.alpha;
		style.strokeColor = obj.color; 
		style.strokeOpacity = obj.alpha;
		style.pointRadius = item.ptRadius;
		
		this.coordTrans.from(item.x,item.y,this.coordinate);
		var p = {};

		p = this.coordTrans.toWGS84();
		p = this.fromWGS84(p.lon,p.lat);

		var point = new OpenLayers.Geometry.Point(p.lon, p.lat);
		pointFeature = new OpenLayers.Feature.Vector(point, null, style);
		return pointFeature;
	},
	gmarker: function(name,item){


		var features = [];

		if(item.markers.length <=0 ) {
			return null;
		}

		for(var i=0;i<item.markers.length;i++){
			var dgmarker = item.markers[i];

			var p = this.fromCoord(dgmarker.xy.x, dgmarker.xy.y);

			var vector = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.Point(p.lon, p.lat)
			);
			vector.dgmarker = dgmarker; 
			features.push(vector);
			
		}

		var style = new OpenLayers.Style({
			pointRadius: "0",
			fillColor: "#ffcc66",
			fillOpacity: 0,
			strokeColor: "#cc6633",
			strokeWidth: "0",
			strokeOpacity: 0
		}, {
			context: {
				width: function(feature) {
					return 1;
				},
				radius: function(feature) {
					return 2;
				}
			}
		});
			
		strategy = new EzMap.Strategy.Cluster();
		strategy.gmarker = item;
		strategy.mm = this;
		clusters = new OpenLayers.Layer.Vector(name, {
			strategies: [strategy],
			styleMap: new OpenLayers.StyleMap({
				"default": style,
				"select": {
					fillColor: "#8aeeef",
					strokeColor: "#32a8a9"
				}
			})
		});


		var select = new OpenLayers.Control.SelectFeature(
			clusters, {hover: true}
		);
		this.map.addControl(select);
		select.activate();

		this.map.addLayers([clusters]);
		
		this.gmarkers.push(item);

		strategy.distance = item.distance;
		strategy.threshold = item.threshold;
		clusters.addFeatures(features);

		return clusters;
	},
	curve: function(item){
		
		//正規化
		if(!item.x || !item.y) return false;
		try{
			item.arcAngle1 = parseInt(item.arcAngle1);
			item.arcAngle2 = parseInt(item.arcAngle2);
		}catch(err){
			if(this.debug) alert(err);
		}
		if(item.clockwise == null) item.clockwise = true;
	
		//畫圓變數
		var center = null;
		var segments = 100;		//幾角型
		var alpha = -306;		//角度
		var omega = 0;			//ex: 0=在x相限0開始
		var radius = 25000;		//半徑
		
		//style變數
		var fillColor =  '#ffddee';
		var fillOpacity = 0.8;
		var strokeColor = '#000000';
		var strokeOpacity = 0.8;
		var strokeWidth = 2;
		
		if(item.fillStyle != null && item.fillStyle.length >= 1){
			var obj = this.rgbToHex(item.fillStyle);
			fillColor = obj.color;
			fillOpacity = obj.alpha;
		}
		if(item.strokeStyle != null && item.strokeStyle.length >= 1){
			var obj = this.rgbToHex(item.strokeStyle);
			strokeColor = obj.color;
			strokeOpacity = obj.alpha;
		}
		if(item.lineWidth != null){
			try{
				strokeWidth = parseInt(item.lineWidth);
			}catch(err){}
		}
		if(item.ptRadius != null){
			try{
				radius = item.ptRadius;
			}catch(err){}
		}

		//先座標轉換成TM2 97,因為97座標以公尺為單位
		this.coordTrans.from(item.x,item.y,this.coordinate);
		var p = {};
		var lon = 0;
		var lat = 0;

		//轉到 TM2-97
		p = this.coordTrans.toTM2_97();
		lon = p.lon;
		lat = p.lat;

	    //產生圓的所有點 //再算角度
		omega = item.arcAngle1;
		alpha = item.clockwise == true ?-item.arcAngle2 : item.arcAngle2;

		var dAngle = segments + 1;
		var points = [];
		for(var i=0;i<dAngle;i++)
		{
			var Angle = alpha - (alpha-omega)*i/(dAngle-1);
			var x = lon + radius*Math.cos(Angle*Math.PI/180);
			var y = lat + radius*Math.sin(Angle*Math.PI/180);

			var point = {
			    x: x,
                y:y
			};

			points.push(point);
		}

	    //再將所有點為轉換成map 預設座標系統
		this.coordTrans.from(lon, lat, 'TM2_97');
		p = this.coordTrans.toWGS84();
		lon = p.lon;
		lat = p.lat;
		p = this.fromWGS84(lon, lat);
		lon = p.lon;
		lat = p.lat;

        //produce all points
		center = new OpenLayers.Geometry.Point(p.lon, p.lat);
		var pointList = [];

		if (alpha < 360) {
		    pointList.push(new OpenLayers.Geometry.Point(center.x, center.y));
		}
		for (var i = 0; i < points.length; i++) {
		    var point = points[i];
		    this.coordTrans.from(point.x, point.y, 'TM2_97');
		    p = this.coordTrans.toWGS84();
		    p = this.fromWGS84(p.lon, p.lat);
		    pointList.push(new OpenLayers.Geometry.Point(p.lon, p.lat));
		}
		if (alpha < 360) {
		    pointList.push(new OpenLayers.Geometry.Point(center.x, center.y));
		}
			
		var siteStyle = {
			fillColor: fillColor,
			fillOpacity: fillOpacity,
			strokeColor: strokeColor,
			strokeOpacity: strokeOpacity,
			strokeWidth: strokeWidth,
			strokeLinecap: "round",//round. Options are butt, round, square
			strokeDashstyle:"solid"//dot dash dashdot longdash longdashdot solid

		};

		var linearRing = new OpenLayers.Geometry.LinearRing(pointList);
		var geometry = new OpenLayers.Geometry.Polygon([linearRing]);
		var polygonFeature = new OpenLayers.Feature.Vector(geometry, null, siteStyle);
		
		return polygonFeature;
	},
	polygon: function(item){
		var fillColor = "#ee9900";
		var fillOpacity = 0.8;
		var strokeStyle = "#cccccc";
		var strokeOpacity = 0.8;
		var strokeWidth = 2;

		if(item.fillStyle != null && item.fillStyle.length >= 1){
			var obj = this.rgbToHex(item.fillStyle);
			fillColor = obj.color;
			fillOpacity = obj.alpha;
		}
		if(item.strokeStyle != null && item.strokeStyle.length >= 1){
			var obj = this.rgbToHex(item.strokeStyle);
			strokeStyle = obj.color;
			strokeOpacity = obj.alpha;
		}
		if(item.lineWidth != null){
			strokeWidth = parseInt(item.lineWidth);
		}

		var siteStyle = {
			fillColor: fillColor,
			fillOpacity: fillOpacity,
			strokeColor: strokeStyle,
			strokeOpacity: strokeOpacity,
			strokeWidth: strokeWidth,
			strokeLinecap: "round",//round. Options are butt, round, square
			strokeDashstyle:"solid"//dot dash dashdot longdash longdashdot solid

		};
		
		var sitePoints = [];
		var points = item.xys;
		for (var i=0;i<points.length;i++) {

			var point = points[i];

			this.coordTrans.from(point.x,point.y,this.coordinate);
			var p = {};
			p = this.coordTrans.toWGS84();//轉到 WGS84
			
			p = this.fromWGS84(p.lon,p.lat);

			var point = new OpenLayers.Geometry.Point(p.lon, p.lat);
			sitePoints.push(point);
		}
		sitePoints.push(sitePoints[0]);
		
		var linearRing = new OpenLayers.Geometry.LinearRing(sitePoints);
		var geometry = new OpenLayers.Geometry.Polygon([linearRing]);
		var polygonFeature = new OpenLayers.Feature.Vector(geometry, null, siteStyle);
	    //vectors.addFeatures([polygonFeature]);
	    //add attributes to feature
		for (var key in item.attributes) {
		    polygonFeature.attributes[key] = item.attributes[key];
		}
		return polygonFeature;
		//this.map.addLayer(vectors);
	},
	polyline: function(item){
		
		var strokeColor = "#0000ff";
		var strokeOpacity = 0.5;
		var strokeWidth = 2;

		if(item.strokeStyle != null && item.strokeStyle.length >= 1){
			var obj = this.rgbToHex(item.strokeStyle);
			strokeColor = obj.color;
			strokeOpacity = obj.alpha;
		}
		
		if(item.lineWidth != null){
			try{
				strokeWidth = parseInt(item.lineWidth);
			}catch(err){}
		}


		var sitePoints = [];
		var points = item.xys;
		for (var i=0;i<points.length;i++) {

			var point = points[i];

			this.coordTrans.from(point.x,point.y,this.coordinate);
			var p = {};
			p = this.coordTrans.toWGS84();//轉到 WGS84
			
			p = this.fromWGS84(p.lon,p.lat);

			var point = new OpenLayers.Geometry.Point(p.lon, p.lat);
			sitePoints.push(point);
		}


		var line = new OpenLayers.Geometry.LineString(sitePoints);

		var style = { 
		  strokeColor: strokeColor, 
		  strokeOpacity: strokeOpacity,
		  strokeWidth: strokeWidth
		};

		var lineFeature = new OpenLayers.Feature.Vector(line, null, style);
		return lineFeature;
		//lineLayer.addFeatures([lineFeature]);
    },
    _dragmarker: function (item) {

        //# 防呆
        if (item.icon == null) {
            console.log('Easymap6: dgMarker的html模式不支援 拖曳，請使用dgIcon');
            return null;//drag不支援html格式
        }
        //# 座標轉換
        var x = item.xy.x;
        var y = item.xy.y;
        this.coordTrans.from(x,y, this.coordinate);
        var p = {};
        p = this.coordTrans.toWGS84();//轉到 WGS84
        p = this.fromWGS84(p.lon, p.lat);
        
        //# marker
        var point = new OpenLayers.Geometry.Point(p.lon, p.lat);
        var marker = new OpenLayers.Feature.Vector(point, {
            _dgmarker: item,
            _easymap:this
        }, {
            externalGraphic: item.icon.src,
            graphicWidth: item.icon.width,
            graphicHeight: item.icon.height,
            graphicXOffset: -(item.icon.width / 2),
            graphicYOffset: -(item.icon.width),
            cursor:'pointer',
            fillOpacity: 1
        });

        return marker;
    },
	marker: function(item){
		
		var marker = null;
		var lon = null;
		var lat = null;

		var x = item.xy.x;
		var y = item.xy.y;
		
		//轉到 系統座標
		var lonlat = this.fromCoord(x,y);
		
		if(lonlat == null) return;

		var content = null;

		switch(item.iconType.toString().toLowerCase()){
			case "string":
				
			    var icon = new EzMap.HtmlStr(item.htmlstr, this);
				marker = new OpenLayers.Marker(lonlat,icon);

				if(item.content) content = item.content;
				
				var t = marker.icon.imageDiv.getElementsByClassName("ezmap_htmlstr_marker")[0];
				if (item.onclick) {
				    t.addEventListener('click', item.onclick);
				}
				if (item.ondblclick) {
				    t.addEventListener('dblclick', item.ondblclick);
				}
				if (item.onmouseover) {
				    t.addEventListener('mouseover', item.onmouseover);
				}
				if (item.onmouseout) {
				    t.addEventListener('mouseout', item.onmouseout);
				}
				if (item.onmousedown) {
				    t.addEventListener('mousedown', item.onmousedown);
				}
				if (item.onmouseup) {
				    t.addEventListener('mouseup', item.onmouseup);
				}
				
				break;
			case "dgicon":

				var width = 24;
				var height = 24;
				var iconpath = "";

				var dgIcon = item.iconObject;

				if(dgIcon.width) width = dgIcon.width;
				if(dgIcon.height) height = dgIcon.height;
				if (dgIcon.src) iconpath = dgIcon.src;

				if(item.content) content = item.content;
                
				var size = null;
				size = new OpenLayers.Size(width, height);

				var offset = null;
				if (dgIcon.offset) {

				    var w = dgIcon.offset[0];
				    var h = dgIcon.offset[1];
				    try {
				        w = parseInt(w);
				        h = parseInt(h);
				    } catch (err) {
				        w = -1 * width / 2;
				        h = -1 * height / 2;
				    }
				    offset = new OpenLayers.Pixel(w,h);
				} else {
				    offset = new OpenLayers.Pixel(-(size.w/2), -(size.h/2));
				}
				//var offset = new OpenLayers.Pixel(0, 0);
				
				var icon = new OpenLayers.Icon(iconpath, size, offset);
				marker = new OpenLayers.Marker(lonlat,icon);

				if (item.onclick) {
				    marker.events.on({
				        'touchstart': item.onclick,
				        'click': item.onclick,
				        scope: item
				    });
				}
				if (item.ondblclick) {
				    marker.events.on({
				        'touchstart': item.ondblclick,
				        'dblclick': item.ondblclick,
				        scope: item
				    });
				}
				if (item.onmouseover) {
				    marker.events.on({
				        'mouseover': item.onmouseover,
				        scope: item
				    });
				}
				if (item.onmouseout) {
				    marker.events.on({
				        'mouseout': item.onmouseout,
				        scope: item
				    });
				}
				if (item.onmousedown) {
				    marker.events.on({
				        'mousedown': item.onmousedown,
				        scope: item
				    });
				}
				if (item.onmouseup) {
				    marker.events.on({
				        'mouseup': item.onmouseup,
				        scope: item
				    });
				}
		}
		if(content){
			
			marker.events.object.icon.imageDiv.className = content;
			var This = this;
			marker.events.on({
				'touchstart': function(e){
					this.onMarkerClick(e,This);
				},
				'click': function(e){
					this.onMarkerClick(e,This);
				},
				scope: this
			});
		}
		return marker;
	},
	onMarkerClick: function(e,This){
		
		var layer = this.map.getLayer(e.element.parentElement.id);//先取得layer
		var pargetMarker = null;
		for(var i=0;i<layer.markers.length;i++){
			var marker = layer.markers[i];

			if(marker.icon.imageDiv.id == e.element.id){
				pargetMarker = marker;
				break;
			}
		}
		if(!pargetMarker) return;

		var lonlat = pargetMarker.lonlat;
		//lonlat.lat = lonlat.lat + (pargetMarker.icon.size.h*10);
		lonlat = This.toWGS84(lonlat.lon,lonlat.lat);

		var lon = lonlat.lon;
		var lat = lonlat.lat;
		var title = "";
		var content = "";
		if(is_ie){
			content = e.element.className;				
		}else{
			content = e.currentTarget.className;
		}
		this.addPopup(lon,lat,title,content,null,null,null);
	},
	reposMark: function(item){

		var p = this.fromCoord(item.xy.x,item.xy.y);
        var position = new OpenLayers.LonLat(p.lon, p.lat);
        if (item.easymapClass == 'dgmarker') {
            var newLonLat = new OpenLayers.LonLat(p.lon, p.lat);
            var newPx = this.map.getLayerPxFromLonLat(newLonLat);
            item.marker.moveTo(newPx);
        } else {
            //drag marker
            item.marker.move(position);
        }
        
	},
	addPopup: function(lon,lat,title,content,ww,wh,closeBoxCallback){

		if(this.popup){
			this.map.removePopup(this.popup);
		}
		
		//設定大小
		var size = null;
		if (ww != null && wh != null) {
		    size = new OpenLayers.Size(ww, wh);
		}

		
		if(title == null || title.length <= 0){
			//
		}else{
			content = "<b style='font-size:14px;color:#333333;'>"+title+"</b><br/>"+content;
		}

		this.popup = new OpenLayers.Popup.FramedCloud("_POPUP_", 
			this.fromWGS84(lon,lat), 
			size,
			content, 
			null,
			true, // <-- true if we want a close (X) button, false otherwise
			closeBoxCallback
		);
		//是否自動調整
		if (ww != null && wh != null) {
		    this.popup.autoSize = false;
		}
		else {
		    this.popup.autoSize = true;
		}

		this.map.addPopup(this.popup);

		this._setPopupTop();

		return true;
	},
	_setPopupTop: function () {
	    
        if(this.popup)
            this.popup.div.style.zIndex = this.getMaxZIndex();
	},
	getDrawResult: function(){
		return this.measure.drawRval;
	},
	getDrawResultObject: function(){
	    var measure = this.measure;
	    var obj = measure.drawRval.slice();

	    var polyline = null;
	    switch (measure.useControlName) {
	        case "polyline":
	            

	            if (measure.layer.features.length >= 1) {
	                polyline = new dgPolyline(measure.drawRval, "rgba(200,0,0,0.8)", 2);
	                polyline.instance = measure.layer.features[measure.layer.features.length - 1];
	                obj.push(polyline);
	                obj.drawing = true;//要給移除時判斷的
	            }
	            break;
	        case "polygon":
	            if (measure.layer.features.length >= 1) {
	                polyline = new dgPolygon(measure.drawRval, "rgba(200,0,0,0.8)", 2);
	                polyline.instance = measure.layer.features[measure.layer.features.length - 1];
	                obj.push(polyline);
	                obj.drawing = true;//要給移除時判斷的
	            }
	            break;
	        case "circle":
	            break;
	        case "rectangle":
	            break;
	    }


		return obj;
	},
	getDrawMeasure: function () {
	    return this.measure.drawRobj;
	},
	clearMarker: function () {
        //移除測量的marker
	    this.measure.clearMarker();

	    //移除additem的marker
	    for (var i = this.items.length-1; i >= 0 ; i--) {
	        var items = this.items[i];

	        for (var j = items.length-1; j >= 0; j--) {
	            var item = items[j];

	            if (!item.type) continue;

	            switch (item.type.toLowerCase()) {
	                case "marker":
	                    this.removeItem(item);
	                    break;
	            }
	        }
	    }
	},
	clearDraw: function () {
        //移除測量的draw
	    this.measure.clearDraw();

        //移除addItem的draw
	    for (var i = this.items.length-1; i >= 0 ; i--) {
	        var items = this.items[i];

	        for (var j = items.length-1; j >= 0 ; j--) {
	            var item = items[j];

	            if (!item.type) continue;
	            var typ = item.type.toLowerCase();
	            if(typ == "polygon" || typ == "polyline" ||
	                typ == "curve" || typ == "rectangle"){
	                    this.removeItem(item);
	                }

	        }
	    }
	},
	sDrawMode: function(dtype,rfunc,afunc){
		
		this.measure.setActiveControl(dtype, rfunc, afunc);

	},
	cDrawMode: function () {
	    this.measure.deactivate();
	},
	attachEvent: function (etype, lala) {

	    //# 右鍵事件
	    if(lala == dgFMenu){
	        //如果有右鍵事件才鎖右鍵
	        if (dgCMenu.length >= 1) {
	            document.oncontextmenu = function () { return false; }
	        }
	    }

        //#
        if (lala == null || !lala || lala == undefined) {
            var event = this._getEventByType(etype);
	        
            if (event != null) {
	            this.detachEvent(event.type, event.handler);
	            this.events.splice(i, 0);
	        }
	        
	        return;
	    }


		var type = null;
		
		switch(etype.toString().toLowerCase())
		{
			case "onmousedown":
				type = "mousedown";
				break;
			case "onmouseup":
				type = "mouseup";
				break;
			case "onmousemove":
				type = "mousemove";
				break;
			case "onclick":
				type = "click";
				break;
			case "ondblclick":
				type = "dblclick";
				break;
			case "preaddlayer":
			case "addlayer":
			case "removelayer":
			case "changelayer":
			case "movestart":
			case "moveend":
			case "zoomstart":
			case "zoomend":
			case "changebaselayer":
			case "mouseover":
			case "mouseout":
			case "mousedown":
			case "mouseup":
			case "mousemove":
			case "click":
			case "dblclick":
			case "touchstart":
			case "touchmove":
		    case "touchend":
		    case "requestkmltimeout"://mm
				type = etype.toString().toLowerCase();
				break;
        }

        var callback = function (etype,evt) {

            var dgxy = null;
            var pixel = [];
            var items = [];

            switch (evt.type) {
                case 'moveend':
                case 'zoomend':
                    break;
                default:
                    dgxy = this.easymap.revXY(evt.clientX, evt.clientY);

                    pixel.push(evt.xy.x);
                    pixel.push(evt.xy.y);
                    break;
            }

            var event = this._getEventByType(etype);


            event.lala(evt, dgxy, pixel, items);
        }.bind(this,[etype]);

        var a = this.map.events.register(type, this.map, callback, true);

		this.events.push({
            type: etype,
            handler: callback,
            lala:lala
		});
	},
	detachEvent: function(etype, lala){
		var type = null;
		
		switch(etype.toString().toLowerCase())
		{
			case "onmousedown":
				type = "mousedown";
				break;
			case "onmouseup":
				type = "mouseup";
				break;
			case "onmousemove":
				type = "mousemove";
				break;
			case "onclick":
				type = "click";
				break;
			case "ondblclick":
				type = "dblclick";
				break;
			case "preaddlayer":
			case "addlayer":
			case "removelayer":
			case "changelayer":
			case "movestart":
			case "moveend":
			case "zoomstart":
			case "zoomend":
			case "changebaselayer":
			case "mouseover":
			case "mouseout":
			case "mousedown":
			case "mouseup":
			case "mousemove":
			case "click":
			case "dblclick":
			case "touchstart":
			case "touchmove":
			case "touchend":				
				type = etype.toString().toLowerCase();
				break;
		}

        var event = this._getEventByType(etype);
        if (event != null) {
            this.map.events.unregister(type, this.map, event.handler, true);
            this._popEventByType(etype);
        }

		
	},
	addMapPickProc: function(pfunc){
		this.attachEvent("click",pfunc);
	},	
	addMapDragProc: function(pfunc){
		this.attachEvent("mousedown",pfunc);
	},
	addMapDropProc: function(pfunc){
		this.attachEvent("mouseup",pfunc);
	},
	addPanProc: function(pfunc){
		this.attachEvent("moveend",pfunc);
	},
	addZoomProc: function(pfunc){
		this.attachEvent("zoomend",pfunc);
	},
    /**
     * ====================================================
	 *	layer relative
	 * ====================================================*/
	msSwitch: function(mname,zoom){
		this.switchMap(mname);
		this.zoomTo(zoom);
	},
	switchMap : function(name){

		var layer = null;

		for(var i=0;i<this.layers.length;i++){
			if(name == this.layers[i].options.name){

				this.layerSwitcher.changeBaseLayer(this.layers[i]);
				break;
			}
		}
	},
	//	取得目前圖層名稱
    getMapName:function(){
		return this.layerSwitcher.baseLayerId;
	},
	//	利用名稱取出layers
	getLayersByName: function(name){
		var tmpary = [];
		for(var i=0;i<this.layers.length;i++){
			if(this.layers[i].options.name == name){
				tmpary.push(this.layers[i]);
			}
		}
		return tmpary;
	},
	getLayerById: function(id){

		for(var i=0;i<this.layers.length;i++){
			if(this.layers[i].id == id){
				return this.layers[i];
			}
		}
	},
	addDgSource: function(item){

		var op = item.options;

		var bg = op.bg;
		var chname = op.chname;
		var name = op.name;
	

		var tmp = this.getDgSource(item);

        if (tmp == null) return;

        if(chname)
            tmp.chname = chname;

        tmp.dgsource = item;
		
		item.instance = tmp;//產生的物件先存放在這
		
		
		if(bg){	//是否為底圖
			if(this.layerSwitcher)
				this.layerSwitcher.addLayer(item);
		}else{

		    var maxLayerIndex = this.getLayerTopIndex()+1;
			this.map.addLayers([tmp]);
			this.map.setLayerIndex(tmp, maxLayerIndex);
		}
		return true;
	},
    //取得底圖圖層最大index值(=marker/popup除外)
	getLayerTopIndex: function () {
        
	    var index = 0;
	    for (var i = 0; i<this.map.layers.length;i++){
	        var class_name = "";

	        try{
	            class_name = this.map.layers[i].CLASS_NAME;
	        } catch (err) {
	            continue;
	        }

	        switch (class_name.toLowerCase()) {
	            case "mm.layer.google":
	            case "openlayers.layer.bing":
	            case "openlayers.layer.wms":
	            case "openlayers.layer.wmts":
	                index = this.map.getLayerIndex(this.map.layers[i]);
	                break;
	        }
	    }
	    return index;

	},
	getDgSource: function(item){

		var op = item.options;
		var tmp = null;

		switch (item.layer.toString().toLowerCase()) {
		    case "bing":

		        if (!op.key) {
		            console.error(EzMap.EasymapErr + "bing map遺失key");
		            return null;
		        }
		        if (!op.url) {
		            console.error(EzMap.EasymapErr + "bing map遺失url");
		            return null;
		        }
		        if (!op.chname) {
		            op.chname = "";
		        }

		        var name = item.id;
		        var chname = op.chname;
		        var url = op.url;
		        var key = op.key;
		        var type = op.type;

		        tmp = new OpenLayers.Layer.Bing({
		            name: name,
		            key: key,
                    url:[url],
		            type: type //Aerial
		        });
		        if (typeof url === 'string') {
		            tmp.url = [url];
		        } else {
		            tmp.url = url;
		        }
		        

		        break;
			case "google":
			case "osm":

				var name = item.id;
				var chname = op.chname;
				var url = op.url;
				
				var obj = {};
				obj.resolutions = op.resolutions;
				obj.serverResolutions = op.serverResolutions;

				
				tmp = new EzMap.Layer.Google(name, url, obj);


				break;
			case "wmts":

				var name = item.id;
				
				var url = op.url;
				var layer = op.layer;
				var matrixSet = op.matrixSet;
				var matrixIds = op.matrixIds;
				var format = op.format;
				var serverResolutions = op.serverResolutions;
				var style = op.style;
				var ratio = op.ratio;
				var transparent = op.transparent;
				var zoomOffset = op.zoomOffset;


				if (!style || style === null || style === "") {
				    style = "";
				}
				if (!ratio || ratio === null || ratio === "") {
				    ratio = 0;
				}
				if (!transparent || transparent === null || transparent === "") {
				    transparent = true;
				} else {
				    transparent = transparent.toLowerCase()+"";
				    if (transparent === 'false') {
				        transparent = false;
				    } else {
				        transparent = true;
				    }
				}
				if (zoomOffset == undefined) {
				    zoomOffset = 0;
				}

				tmp = new OpenLayers.Layer.WMTS({ 
					name: name, 
					url: url,
					layer: layer,
					matrixSet: matrixSet, 
					matrixIds: matrixIds,
					format: format,
					style: style ,
					serverResolutions: serverResolutions,
					ratio: ratio,
					transitionEffect: null,
					zoomOffset:zoomOffset,
					isBaseLayer:true}); 

				break;
		    case "wms":

		        var name = item.id;

		        var url = op.url;
		        var layer = op.layer;
		        var singleTile = true;
		        var bg = true;
		        var opacity = 1;
		        var mm_projection = "EPSG:4326";
		        var transparent = op.transparent;
		        var format = op.format;

		        if (op.singleTile != null) {
		            singleTile = op.singleTile;
		        }
		        if (op.bg != null) {
		            bg = op.bg;
		        }
		        if (op.projection != null) {
		            mm_projection = op.projection;
		        }
		        if (op.opacity != null) {
		            opacity = op.opacity;
		        }
		        if (!transparent || transparent === null || transparent === "") {
		            transparent = true;
		        } else {
		            if (transparent == true) {
		                transparent = transparent.toString();
		            }
		            if (transparent == false) {
		                transparent = transparent.toString();
		            }
		            transparent = transparent.toLowerCase() + "";
		            if (transparent === 'false') {
		                transparent = false;
		            } else {
		                transparent = true;
		            }
		        }
		        if (!format || format === null || format === "") {
		            format = "image/jpeg";
		        } 

		        tmp = new OpenLayers.Layer.EZWMS(
                    name,
                    url,
                    {
                        layers: layer,
                        isBaseLayer: bg,
                        transparent: transparent,
                        format: format
                    },
                    {
                        singleTile: singleTile,
                        ratio: 1,
                        opacity: opacity,
                        transitionEffect: null,
                        mm_projection: mm_projection
                    }
                ); 
		        /*tmp = new OpenLayers.Layer.WMS(
                            name,
                            url,
                            {
                                layers: layer,
                                version: '1.1.1',
                                srs: mm_projection,
                                transparent: true
                            },
                            {
                                singleTile: singleTile,
                                yx: []
                            }
                        ); */
		        break;
		    case "arcgis":
		        var name = item.id;
		        var url = op.url;
		        var layer = op.layer;
		        var transparent = op.transparent;
		        var isBaseLayer = op.bg;
		        var opacity = op.opacity;
		        var projection = op.projection;

		        if (!transparent || transparent === null || transparent === "") {
		            transparent = true;
		        }
		        if (!isBaseLayer || isBaseLayer === null || isBaseLayer === "") {
		            isBaseLayer = false;
		        }
		        if (!opacity || opacity === null || opacity === "") {
		            opacity = 1;
		        }
		        if (!projection || projection === null || projection === "") {
		            projection = "EPSG:900913";
		        }

		        tmp = new OpenLayers.Layer.ArcGIS93Rest(name, url, {
		                layers: layer,
		                transparent: transparent,
		                isBaseLayer: isBaseLayer
                        
		                //,srs:'EPSG:3826'
		            }, {
		                opacity: opacity,
		                mm_projection: projection,
                        mm:this
		            }
                );
		        break;
		    case "agscache":
		        var name = item.id;
		        var url = op.url;
		        var isBaseLayer = op.bg;
		        var token = op.token;
		        var layerInfo = op.layerInfo;
		        var params = op.params;

		        if (!isBaseLayer || isBaseLayer === null || isBaseLayer === "") {
		            isBaseLayer = false;
		        }

		        var obj = {
		            layerInfo: layerInfo,
		            isBaseLayer: isBaseLayer,
		            params: {
		                "token": token
		                //,serverResolutions:[793.7515875031751, 264.5838625010584, 132.2919312505292, 66.1459656252646, 39.687579375158755, 26.458386250105836, 13.229193125052918, 6.614596562526459, 3.9687579375158752, 2.6458386250105836, 1.9843789687579376, 1.3229193125052918, 0.6614596562526459, 0.26458386250105836, 0.26458386250105836/2]
		            }
                
		        }
		        //alert(print_r(op,true));
		        tmp = new OpenLayers.Layer.ArcGISCache(name, op.url, obj);
                break;
            case 'vectortile'://不支援
                return null;
                break;
		}

	    //register event
		var events = item.events;
		for (var i = 0; i < events.length; i++) {
		    tmp.events.register(events[i].event, tmp, events[i].callback);
		}

		tmp.mmtype = 'dgsource';

		return tmp;
	},
	getMaxLayerIndex: function(){
		var max = 0;
		for(var i=0;i<this.map.layers.length;i++){
			var layer = this.map.layers[i];

			if(this.map.getLayerIndex(layer) > max){
				max = this.map.getLayerIndex(layer);
			}
		}

		return max;
	},
    /**
     * 整個圖台最大的z-index
     * */
	getMaxZIndex: function () {

	    var z = 999999;

	    z = this.getMaxLayerIndex();

	    var controls = this.map.controls;
	    for (var i = 0; i < controls.length; i++) {
	        var control = controls[i];

	        if (control.div) {

	            try{
	                var zz = control.div.style.zIndex;
	                zz = parseInt(zz);
	                if (zz > z) z = zz;
	            }catch(err){
	            }
	        }
            
	    }
	    var layers = this.map.layers;
	    for (var i = 0; i<layers.length;i++){
	        var layer = layers[i];

	        if (layer.div) {

	            try {
	                var zz = layer.div.style.zIndex;
	                zz = parseInt(zz);
	                if (zz > z) z = zz;
	            } catch (err) {
	            }
	        }
	    }

	    return z+1;
	},
	setGMarkerTop: function(obj){
		//cluster的layer
		//this.setLayersToTop(obj);

		//自建的layer
		if(obj.layer && obj.layer.strategies.length > 0)
			this.setZIndexTop(obj.layer.strategies[0].markers);
	},
    /**
	 * 將item設定到最高的位置
	 * @param obj
	 */
	setLayersToTop: function(obj){

		if(obj == null) return false;
		if(obj.length <= 0) return false;

		//標準化成陣列
		var _tmpary = this.formatItem(obj);

		for(var i=0;i<_tmpary.length;i++){
			var layer = _tmpary[i];
			
			switch(layer.type.toString().toLowerCase()){
				case "dgsource":
					//this.map.raiseLayer(layer.instance);
					this.map.setLayerIndex(layer.instance,this.getMaxLayerIndex()+1);
					break;
				default:
					if(layer.layer)
						this.setZIndexTop(layer.layer);
					break;

			}

		}
        //dgchart
		for (var i = 0; i < _tmpary.length; i++) {
		    var layer = _tmpary[i];

		    if (layer.type.toString().toLowerCase() == 'dgchart') {
		        for (var j = 0; j < this.dgcharts.length; j++) {

		            if (this.dgcharts[j].id == layer._$groupid) {
		                
		                this.setZIndexTop(this.dgcharts[j].layer);
		                break;
		            }
		        }
		    }
            
		}

		this._setPopupTop();
	},
	_getMaxZIndex: function () {
	    var max = 9999;//max z-index:2147483647
	    for (var i = 0; i < this.map.layers.length; i++) {
	        var l = this.map.layers[i];
	        var z = parseInt(l.getZIndex());
	        if (z > max) {
	            max = z;
	        }
	    }
	    max = parseInt(max) + 1;
	    return max;
	},
	setZIndexTop: function(layer){
	    var max = this._getMaxZIndex();//max z-index:2147483647
		for(var i=0;i<this.map.layers.length;i++){
			var l = this.map.layers[i];
			var z = parseInt(l.getZIndex());
			if(z > max){
				max = z;
			}
		}
		max = parseInt(max) +1;
        layer.setZIndex(max);
        this.map.setLayerIndex(layer, this.map.layers.length);
	},
	setDrawToTop: function(){

		this.map.setLayerIndex(this.measure.layer,this.getMaxLayerIndex()+1);
		this.map.setLayerIndex(this.measure.markerLayer,this.getMaxLayerIndex()+2);
	},
	// 關閉載入mask
	disableLoading: function(){
		if(this.statusbar){
			this.statusbar.sw_loading = false;
		}
	},
	//開啟載入mask
	enableLoading: function(){
		if(this.statusbar){
			this.statusbar.sw_loading = true;
		}
	},
	getUpperZoomByBoundary: function (ixy1, ixy2) {

        // 左上
	    var lon1 = ixy1.x;
	    var lat1 = ixy1.y;

	    this.coordTrans.from(lon1, lat1, this.coordinate);
	    var c = this.coordTrans.toWGS84();

	    lon1 = c.lon;
	    lat1 = c.lat;

        //右下
	    var lon2 = ixy2.x;
	    var lat2 = ixy2.y;

	    this.coordTrans.from(lon2, lat2, this.coordinate);
	    c = this.coordTrans.toWGS84();

	    lon2 = c.lon;
	    lat2 = c.lat;

        //to bounds
	    var bounds = new OpenLayers.Bounds();
	    bounds.extend(this.fromWGS84(lon1, lat1));
	    bounds.extend(this.fromWGS84(lon2, lat2));
	    
	    var center = bounds.getCenterLonLat();

	    var zoom = this.map.getZoomForExtent(bounds);


	    this.zoomTo(zoom);

	    this.map.setCenter(center, zoom);

	    return;
	},
    /**
     * ====================================================
	 *	below is tools
	 * ====================================================
     */
	toHex: function(N){
		if (N==null) return "00";
		N=parseInt(N); if (N==0 || isNaN(N)) return "00";
		N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
		return "0123456789ABCDEF".charAt((N-N%16)/16) + "0123456789ABCDEF".charAt(N%16);
	},
	rgbToHex: function(str){
		var obj = {};
		if (str.substring(0, 3).toLowerCase() == 'rgb') {
			var arr = str.split(",");
			var r = 0;
			r = arr[0].toLowerCase().replace('rgba(','').trim();
			r = r.toLowerCase().replace('rgb(','').trim();
			var g = arr[1].trim();
			var b = arr[2].trim();
			var a = arr[3].replace(')','').trim();
			var hex = [
				this.toHex(r),
				this.toHex(g),
				this.toHex(b)
			];
			obj.color = "#" + hex.join('');
			obj.alpha = parseFloat(a);
			return obj;				
		}
		else{
			obj.color = "#ee9900";
			obj.alpha = "0.8";
			return null;
		}
	},
    /**
     * Method: fromWGS84
	 * 說明:　從WGS84轉成圖台的座標系統
     */
	fromWGS84: function(lon,lat){
		return new OpenLayers.LonLat(lon, lat).transform(
				new OpenLayers.Projection("EPSG:4326"),
				this.map.getProjectionObject()
			);
	},
    /**
     * Method: toWGS84
	 * 說明:　從圖台的座標系統轉成WGS84
     */
	toWGS84: function(lon,lat){
		return new OpenLayers.LonLat(lon, lat).transform(
				this.map.getProjectionObject(),
				new OpenLayers.Projection("EPSG:4326")
			);
	},
	//從現在的座標系統到900019
	fromCoord: function(lon,lat){

		this.coordTrans.from(lon,lat,this.coordinate);
		var p = {};

		//轉到 WGS84
		p = this.coordTrans.toWGS84();
		var lon = p.lon;
		var lat = p.lat;

		return this.fromWGS84(lon,lat);
	},
    //# 從900019轉成WGS84
	toCoord: function(lon,lat){
		
		
		var lonLat = new OpenLayers.LonLat(lon,lat);
		lonLat.transform(this.map.getProjectionObject(),
							new OpenLayers.Projection("EPSG:4326"));
		
		this.coordTrans.from(lonLat.lon,lonLat.lat,this.coordTrans.WGS84);

		var p = {};

		//從WGS84轉成設定的座標系統
		switch(this.coordinate){
		 case this.coordTrans.TM2_67:
			 p = this.coordTrans.toTM2_67();
			 break;
		 case this.coordTrans.TM2_97:
			 p = this.coordTrans.toTM2_97();
			 break;
		 case this.coordTrans.TWD67:
			 p = this.coordTrans.toTWD97();
			 break;
		 case this.coordTrans.TWD97:
		 case this.coordTrans.WGS84:
			 p = this.coordTrans.toWGS84();
			 break;
		}
		
		return p;
	},
	revXY: function(pixel){
		
	    try{
	        var a = document.getElementById(this.map.div.id);
	    
	        var rect = a.getBoundingClientRect();

	        pixel.x = pixel.x - rect.left;
	        pixel.y = pixel.y - rect.top;

	    } catch (err) { }

		var p = this.map.getLonLatFromPixel(pixel);

		return this.toCoord(p.lon,p.lat);
	},
	tranXY: function(dgXY){
		
		var p = this.fromCoord(dgXY.x,dgXY.y);
		
		var pixel = this.map.getPixelFromLonLat(p);

		return pixel;
	},
	exCoordTrans: function(x,y,coord){
		
		var r = new CoordTrans();

		r.from(x,y,coord);
		
		return r;
	},
	calDistance: function(fromXY,toXY){
		
		var fromXYLonlat = this.fromCoord(fromXY.x,fromXY.y);
		var toXYLonlat = this.fromCoord(toXY.x,toXY.y);

		var point1 = new OpenLayers.Geometry.Point(fromXYLonlat.lon, fromXYLonlat.lat);
		var point2 = new OpenLayers.Geometry.Point(toXYLonlat.lon, toXYLonlat.lat);
		
		//return point1.distanceTo(point2);

		var line = new OpenLayers.Geometry.LineString([point1, point2]);

		return line.getGeodesicLength(new OpenLayers.Projection("EPSG:900913"));
    },
    _getEventByType: function (type) {

        for (var i = 0; i < this.events.length; i++) {

            var event = this.events[i];

            if (type == event.type) {
                return event;
            }
        }
        return null;
    },
    _popEventByType: function (type) {
        for (var i = 0; i < this.events.length; i++) {

            var event = this.events[i];

            if (type == event.type) {
                this.events[i] = this.events[this.events.length - 1];
                this.events.pop();
            }
        }
        return null;
    },
    CLASS_NAME: "MM.ol"
});

})(EzMap);



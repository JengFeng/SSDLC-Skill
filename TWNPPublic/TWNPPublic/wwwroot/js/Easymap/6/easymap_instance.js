
//ini 新增參數
var _wmsMode = 0;

var digimap4s = [];
var _menuX = null, _menuY = null;

function Easymap(a,options)
{	

	var id = "";


	if(typeof(a) == 'string'){
		id = a;
		a = document.getElementById(a);
	}
	if(typeof(a) == 'object'){
		id = a.id;
	}

	if(!id) return;
	if(id.length <=0) return;

	
	//initial setting
	if(typeof(mname) != "undefined") _mname = mname;

	var isEasymap5_mapini = false;
	if(!_coord){
		_coord = "WGS84";
		isEasymap5_mapini = true;
	}
	if(!_debug) _debug = false;			//除錯
	if(options && options.cx) cx = options.cx;
	if(options && options.cy) cy = options.cy;
	if (options && options.cz) cz = 7;
    var layers = null;
    if (options && options.layers) {
        layers = options.layers;
    } else {
        layers = [];
        layers = goclone(_dm4_maps);
    }
	if(typeof(dcz) != "undefined") _dcz = dcz;
	if(typeof(_sAuthor) == "undefined") _sAuthor = false;
	if(typeof(sAuthor) != "undefined") _sAuthor = sAuthor;			//右下角logo

	if(typeof(sStatus) != "undefined") _sStatus = sStatus;		//下方狀態列
	if(typeof(sScaleBar) != "undefined") _sScaleBar = sScaleBar;	//左下角比例尺
	if(!zmScaleLine) zmScaleLine = [10,10];
	if(!zmWMap) zmWMap = [0,0];
	if(!zmSwitcher) zmSwitcher = [10,10];
	if(!_lineStyle){
		_lineStyle = {
				strokeWidth: 3,
				strokeOpacity: 1,
				strokeColor: "#666666",
				strokeDashstyle: "dash"	//(“dot”, “dash”, “dashdot”, “longdash”, “longdashdot”, or “solid”) 
				}; 
	}
	if(!_polygonStyle){
		_polygonStyle = {
				strokeWidth: 3,
				strokeOpacity: 1,
				strokeColor: "#666666",
				fillColor: "#ffffff",
				fillOpacity: 0.5,
				strokeDashstyle: "dash"	//(“dot”, “dash”, “dashdot”, “longdash”, “longdashdot”, or “solid”) 
			};
	}

	var tt = new EzMap.ol(id,{
		coordinate: _coord,				//預設座標系統
		resolutions: _resolutions,		//預設的解析度
		numZoomLevels: _numZoomLevels,	//預設圖台階層數
		center:		{x: cx, y:  cy},	//預設座標
		zoom:		cz,					//預設zoom
		errorPic:	_error_pic,			//預設錯誤圖片
		debug:		_debug,				//是否開啟debug
		layers:		layers,		    //預設圖層
		dcz:		_dcz,				//鷹眼level差
		mname:		_mname,				//初始圖層
		sStatus:	_sStatus,			//左下角狀態列
		sScaleBar:	_sScaleBar,			
		zmScaleLine: zmScaleLine,		//左下角狀態列位置
		zmScaleBK:  zmScaleBK,			//方向按鈕背景寬高
		zmWMap:		zmWMap,				//鷹眼位置
		zmSwitcher: zmSwitcher,			//切換底圖位置
		root:		_dgmap4path,		//程式目錄
		lineStyle:  _lineStyle,			//畫線的style
		polygonStyle: _polygonStyle,	//畫面積style
		sAuthor: _sAuthor,				//右下角logo
		isEasymap5_mapini: isEasymap5_mapini,			//是否為easymap5的mapini
		easymap: this					//easymap介面
	});

    this.version = 6;
	this.mm = tt;
    this.olmap = tt.map;
    this.olmap.tt = tt;
	this.div = tt.map.div;
	this.instance = tt;
	this.dgCMenu = [];		//按右鍵
	
	this.olmap = tt.map;    //openlayers本身的map
	this.dgFMenu = function(e)
	{

		if(e.button == 2)
		{


		    
		    if (this.dgCMenu === null) return;
		    if (this.dgCMenu === undefined) return;
		    if (this.dgCMenu.length <= 0) return;

		    

			if(!document.getElementById('exMenu'))
			{
			    
				exmdiv = document.createElement('div');
				exmdiv.id = 'exMenu';
				exmdiv.style.cssText = 'position:absolute;border: 1px solid rgba(181, 181, 181, 0.72);background-color:#fff;z-index:9899999;color:rgb(45, 45, 45);font-size:14px;padding: 1px;font-family: Microsoft JhengHei;box-shadow:rgba(132, 132, 132, 0.29) 3px 3px 0.05em 1px;';
				exmdiv.style.left = (e.clientX) + 'px';
				exmdiv.style.top = (e.clientY) + 'px';
				for(ic=0;ic<this.dgCMenu.length;ic++)
				{
					tmpdiv = document.createElement('div').cloneNode(true);
					tmpdiv.style.cssText = 'position:relative;margin:1px;white-space:nowrap;padding:2px 10px 2px 2px;';
					tmpdiv.onmouseover = function(){
								this.style.cursor = 'pointer';
								this.style.backgroundColor = '#DFDFDF';
				    };
					tmpdiv.onmouseout = function(){
								this.style.backgroundColor = '#fff';
					};

					var icon = _dgmap4path + "imgs/blank.png";
					if (this.dgCMenu[ic].icon != null) {
					    icon = this.dgCMenu[ic].icon;
					} 
				    //tmpdiv.innerHTML = "<div style='display:inline-block;overflow:right;margin-right:2px;'><img src='" + icon + "' width='16' height='16' /></div>" + this.dgCMenu[ic].mname;
					tmpdiv.innerHTML = this.dgCMenu[ic].mname;
					tmpdiv.onclick = this.dgCMenu[ic].afunc;
					exmdiv.appendChild(tmpdiv);
				}
				
				document.body.appendChild(exmdiv);
				
                //貼上的div也不要有事件反應
				exmdiv.onmousedown = function () {
				    if (event.button == 2) {
				        return false;
				    }
				};
				exmdiv.oncontextmenu = function () {
				    return false;
				}

				tmpimg = new Image();
				tmpimg.src = _dgmap4path+'imgs/close.gif';
			}
			else
			{
				exmdiv.style.left = (e.clientX) + 'px';
				exmdiv.style.top = (e.clientY) + 'px';
				exmdiv.style.visibility = 'visible';
			}

			return false;
		}
		else
		{
			if(document.getElementById('exMenu'))
			{
				if(document.getElementById('prtDialog'))
				{
					prtddiv.style.visibility = 'hidden';
				}
				exmdiv.style.visibility = 'hidden';
			}
			return false;
		}
	}

    
	//右鍵事件
	//this.instance.map.div.oncontextmenu = this.dgFMenu;
	this.instance.map.events.on({
		'click':this.dgFMenu,
		'mousedown': this.dgFMenu,
		scope: this
	});
	
    //# Easymap7保留

    //# easymap6
	this.setCoordinate = function(coord){

		this.instance.setCoordinate(coord);
	}
	this.getCoordinate = function(){
		return this.instance.coordinate;
	}

	this.setKmlProxy = function(url){
		this.instance.setKmlProxy(url);
	}

	this.addMenu = function(dgMenuFunc){
	    this.dgCMenu.push(dgMenuFunc);


	    if (this.dgCMenu.length == 1) {

	        this.instance.map.div.oncontextmenu = function () {
	            return false;
	        }

	        //把圖台的右鍵關掉
	        this.instance.map.div.onmousedown = function () {
	            if (event.button == 2) {
	                return false;
	            }
	        };
	    }
	}

	this.resize = function(rw, rh)
	{
		a.style.width = rw + 'px';
		a.style.height = rh + 'px';

		try
		{
			this.instance.resizeTo(rw, rh);
			//this.instance.mapResize(rw, rh);
		}
		catch(e){
			return false;
		}
		return true;
	}

	this.zoomToXY = function(txy, tz)
	{
		if(txy == null || tz == null)
		{
			return false;
		}
		else
		{
			if(this.getZoomLevel() != tz){
				this.instance.setCenter(txy,tz);
			}else{
				this.panTo(txy);
			}
			return true;
		}
	}

	this.goXY = function(txy)
	{
		if(txy == null)
		{
			return false;	
		}
		else
		{
			this.instance.setCenter(txy,this.getZoomLevel());
			return true;
		}
	}
	
	this.zoomTo = function(tz)
	{
		if(tz == null)
		{
			return false;	
		}
		else
		{
			this.instance.zoomTo(tz);
			return true;
		}
	}
	
	this.setZoom = function(zoom){
		this.setZoomLevel(zoom);
	}

	this.setZoomLevel = function(zoom)
	{
		if(zoom != null){
			this.instance.setZoom(zoom);
		}
	}

	this.panTo = function(tz,dis)
	{
		this.instance.exPanTo(tz,dis);
	}

	this.zoomIn = function()
	{
		this.instance.zoomIn();
		return true;
	}

	this.zoomOut = function()
	{
		this.instance.zoomOut();
		return true;
	}
	
	this.setDrawTop = function(){

		this.instance.setDrawToTop();
	}
	
	this.setZIndexTop = function(obj){
		this.instance.setLayersToTop(obj);
		return true;
	}
	/**
	 * 將item設定到最高的位置
	 * @param obj
	 */
	this.setItemTop = function(obj){
		this.instance.setLayersToTop(obj);
		return true;
	}

	this.addItem = function(obj)
	{

		this.instance.addItem(obj);
		return true;
	}

	this.removeItem = function(obj)
	{
		this.instance.removeItem(obj);
		return true;
	}

	this.getCX = function()
	{
		return this.instance.getCX();
	}

	this.getCY = function()
	{
		return this.instance.getCY();
	}

	this.getCenter = function()
	{
		return new dgXY(this.getCX(),this.getCY());
	}

	this.getRectBound = function()
	{
		return this.instance.getRectBound();
		
//		ltX = this.getCX() - this.getWidth()*this.getXScale()/2;
//		ltY = this.getCY() + this.getHeight()*this.getYScale()/2;
//		rbX = this.getCX() + this.getWidth()*this.getXScale()/2;
//		rbY = this.getCY() - this.getHeight()*this.getYScale()/2;
//		
//		return [ltX, ltY, rbX, rbY];
	}
	
	this.getZoom = function(){
		return this.getZoomLevel();
	}

	this.getZoomLevel = function()
	{
		return this.instance.getZoom();
	}

	this.getPScale = function()
	{
		return this.instance.pscale;
	}

	this.getXScale = function()
	{
	    return this.instance.map.getResolution();
	}

	this.getYScale = function()
	{
	    return this.instance.map.getResolution();
	}

	this.getWidth = function()
	{
		return this.instance.getWidth();
	}

	this.getHeight = function()
	{
		return this.instance.getHeight();
	}
	
	this.getMapName = function()
	{
		return this.instance.getMapName();
	}
	
	this.getStatusBar = function()
	{
		return this.instance.stdiv;
	}

	this.setScaleBarXY = function(ixy)
	{
		this.instance.isbxy = (this.instance.isbxy == null) ? ixy : this.instance.isbxy;
		this.instance.sbdiv.style.left = ixy[0] + 'px';
		this.instance.sbdiv.style.top = ixy[1] + 'px';
	}
	
	this.switchMap = function(name){

		if(name == null)
		{
			return false;
		}
		else
		{
			this.instance.switchMap(name);
		}
	}

	this.switchMapType = function(mname, zl)
	{
		if(mname == null)
		{
			return false;
		}
		else if(zl == null)
		{
			return this.instance.msSwitch(mname, this.getZoomLevel());
		}
		else
		{
			return this.instance.msSwitch(mname, zl);
		}
	}

	this.addMapControl = function(itxy)
	{
		this.instance.addMapControl(itxy);
	}
	
	this.stopNavigation = function(){
		this.instance.stopNavigation();
	}

	this.startNavigation = function(){
		this.instance.startNavigation();
	}

	this.addMapTypeSelector = function(stype,itxy)
	{
		this.instance.addMapTypeSelector(stype,itxy);
	}
	
	this.addWMap = function(imc,ifuncs)
	{
		this.instance.addWMap(imc,ifuncs);
	}
	
	this.addMeasure = function(){
		this.instance.addMeasure();
	}

	this.clearMarker = function()
	{
		try
		{
			this.instance.clearMarker();
		}
		catch(e)
		{
			return false;
		}
		return true;
	}

	this.clearDraw = function()
	{
		this.instance.clearDraw();
		return true;
	}

	this.openInfoWindow = function(xy,wobj,ww,wh,closeBoxCallback)
	{
		this.instance.openInfoWindow(xy,wobj,ww,wh,closeBoxCallback);
		return true;
	}
	
	this.closeInfoWindow = function()
	{
		this.instance.closeInfoWindow();
		return true;
	}
	
	this.refreshMap = function()
	{
		this.instance.reloadMapPic();
	}
	
	this.setDrawMode = function(dtype,rfunc,afunc)
	{
		if(dtype)
		{
			this.instance.sDrawMode(dtype,rfunc,afunc);
		}
	}
    //new rexadded 2016/09/22
	this.cancelDrawMode = function () {
        this.instance.cDrawMode();
	}
	
	this.getDrawResult = function()
	{
		return this.instance.getDrawResult();
	}

	this.getDrawResultObject = function()
	{
		return this.instance.getDrawResultObject();
	}
    //rexadded
	this.getDrawMeasure = function () {
	    return this.instance.getDrawMeasure();
	}

	this.clearDrawResult = function()
	{
		this.instance.drawRval = null;
	}
    
	this.isDrawMode = function(tf)
	{
	    return this.instance.measure.isActive();
		//if(this.instance.actMode == 'draw')	return true;
		//else	return false;	
	}

	this.setDraggable = function(tf)
	{
		this.instance.setMapDraggable(tf);
	}

	this.getMapControlV = function () {
	    return this.instance.getMapControlV();
	}
	this.setMapControlV = function(tf)
	{
		this.instance.setMapControlV(tf);
	}

	this.setMapControl = function (itxy)
	{
		this.instance.setMapControl(itxy);
	}
	
	this.setWMapV = function(tf)
	{
		this.instance.setWMapV(tf);
	}

	this.getMapTypeSelectorV = function () {
	    return this.instance.getMapTypeSelectorV();
	}
	this.setMapTypeSelectorV = function(tf)
	{
		this.instance.setMapTypeSelectorV(tf);
	}
	
	this.revXY = function(px, py)
	{	
		var p = this.instance.revXY({x:px,y:py});
		return new dgXY(p.lon, p.lat);
	}
	
	this.coordTrans = function(x,y,coord){
		return this.instance.exCoordTrans(x,y,coord);
	}

	this.tranXY = function(idgxy)
	{
		return this.instance.tranXY(idgxy);
	}

	this.toWGS84 = function (x, y) {
	    return this.instance.toWGS84(x, y);
	}
	
	this.attachEvent = function(etype,cfunc)
	{
		this.instance.attachEvent(etype,cfunc);
	}
	
	this.detachEvent = function(etype,cfunc)
	{
		this.instance.detachEvent(etype,cfunc);
	}

	/*this.addMapPickProc = function(pfunc)
	{
		this.instance.addMapPickProc(pfunc);
	}
	this.addMapDragProc = function(pfunc)
	{
		this.instance.addMapDragProc(pfunc);
	}
	this.addMapDropProc = function(pfunc)
	{
		this.instance.addMapDropProc(pfunc);
	}
	this.addPanProc = function(pfunc)
	{
		this.instance.addPanProc(pfunc);
	}
	this.addZoomProc = function(pfunc)
	{
		this.instance.addZoomProc(pfunc);
	}
	this.addEZQuery = function(pfunc)
	{
		this.instance.ezProc = pfunc;
	}*/
	
	this.getBestZoomByScale = function(ixscale, iyscale)
	{
		return this.instance.getBestZoomByScale(ixscale, iyscale);
	}
	
	this.setWMSMode = function(wmode, wurl, wpara, minZ, maxZ)
	{
		if(wmode != null)	this.instance._wmsMode = wmode;
		if(wurl != null)	this.instance._wmsUrl = wurl;
		if(wpara != null)
		{
			this.instance._wmsPara = wpara;
			if(typeof(wpara) != 'string')
			{
				wpara.action = wurl;
				wpara.target = '_wmsFrame_';
			}
		}
		if(minZ != null)	this.instance._wmsMinZ = minZ;
		if(maxZ != null)	this.instance._wmsMaxZ = maxZ;
		return this.instance.document.getElementById("_wmsPIC_");
	}

	this.createDiv = function(id, px, sz, imgURL, position, 
                                     border, overflow, opacity)
	{
		//tmpdiv = this.instance.document.createElement('div');
		//this.instance.document.body.appendChild(tmpdiv);
		//return tmpdiv;
		return this.instance.createDiv(id, px, sz, imgURL, position, 
                                     border, overflow, opacity);
	}
	
	this.removeDiv = function(rdiv)
	{
		//return this.instance.document.body.removeChild(tmpdiv);
		this.instance.removeDiv(rdiv);
	}
	
	this.getWMSMode = function(mPara)
	{
		if(mPara == 'Mode') 
			return 	this.instance._wmsMode ;
		else if (mPara == 'Url') 
			return 	this.instance._wmsUrl ;
		else if (mPara == 'Para') 
			return 	this.instance._wmsPara ;
		else
			return null;
	}
	
	this.refreshWMS = function()
	{
		this.instance.getWMS();
	}

	this.getUpperZoomByBoundary = function(ixy1, ixy2)
	{
		if(ixy1 != null && ixy2 != null)	this.instance.getUpperZoomByBoundary(ixy1, ixy2);
		return;
	}
	
	this.getScaleByZoom = function(izoom)
	{
		return this.instance.getScaleByZoom(izoom);
	}

	this.wheelZoom = function(tf)
	{
		this.instance.swheelZoom(tf);
	}

	this.calDistance = function(fromXY,toXY){
		return this.instance.calDistance(fromXY,toXY);
	}

	this.disableLoading = function(){
		this.instance.disableLoading();
	}

	this.enableLoading = function(){
		this.instance.enableLoading();
	}

	this.setScaleLineVisible = function (tf) {

	    var sl = document.getElementsByClassName("MMControlScaleLine");
	    if (sl.length <= 0) return;
	    if (tf) {
	        sl[0].style.display = 'block';
	    } else {
	        sl[0].style.display = 'none';
	    }
	}
	this.setStatusBarVisible = function (tf) {
	    if (tf) {
	        document.getElementsByClassName('MMControlStatusBar')[0].style.display = '';
	    } else {
	        document.getElementsByClassName('MMControlStatusBar')[0].style.display = 'none';
	    }
	}
	this.setNavigation = function (tf) {

	    try {
	        if (tf) {
	            map.mm.map.getControl('_MAIN_NAVIGATION_').activate();
	            map.mm.map.getControl('_MeasureToolbar_NAV_').activate();
	        } else {
	            map.mm.map.getControl('_MAIN_NAVIGATION_').deactivate();
	            map.mm.map.getControl('_MeasureToolbar_NAV_').deactivate();
	        }
	    } catch (err) {

	    }
	    
	}
	/*
	this.getPicPath = function(ox,oy)
	{
		return this.instance.getPicPath(ox,oy);
	}

	this.getRectPic4 = function(x1,y1,x2,y2)
	{
	
		return this.instance.getRectPic4(x1,y1,x2,y2);
	}

	this.getRectPic = function()
	{
	
		return this.instance.getRectPic();
	}
	
	this.getRectPicBBOX = function()
	{
	
		return this.instance.getRectPicBBOX();
	}

	this.getRectPicBBOX4 = function(x1,y1,x2,y2)
	{
	
		return this.instance.getRectPicBBOX4(x1,y1,x2,y2);
	}*/

	//digimap4s.push(this);
    //callback(this);

    
}
//var easymap = digimap4, ezmap = digimap4;
var easymap = Easymap;
var digimap4 = Easymap;
var ezmap = Easymap;

function dgIcon(isrc, iw, ih)
{
	this.src = (isrc == null) ? null : isrc;
	this.width = (iw == null) ? 0 : iw;
	this.height = (ih == null) ? 0 : ih;
	this.offset = null;

	this.image = document.createElement('img');
	this.image.src = this.src;
	this.image.style.cssText = 'position:absolute;z-index:0;FILTER:alpha(opacity=50);left:'+(-this.width/2)+'px;top:'+(-this.height/2)+'px';

	return this;
}


function dgGMarker(markers,distance,threshold){
	this.type = "gmarker";
	this.instance = null;

	this.isCusterZoom = false;
	this.zoom = 0;
	
	this.role = null;

	this.distance = 50;
	this.threshold = null;
	this.markers = [];

	this.click = null;
	this.mouseover = null;
	this.mouseout = null;
	this.mousedown = null;

	if(distance) this.distance = distance;
	if(threshold) this.threshold = threshold;
	
	this.markers = markers;
	
	this.setZIndexTop = function(){
		this.instance.setGMarkerTop(this);
	}

	this.setRole = function(role){
		this.role = role;

		if(role.high == null ||
			role.medium == null ||
			role.picHigh == null ||
			role.picMedium == null ||
			role.picLow == null){

			this.role == null;
		}
	}
	this.setZoomWithoutCluster = function(tf,zoom){

	    if (EzMap.Tools.isBoolean(tf)) {
			this.isCusterZoom = tf;
		}else{
			return false;
		}

		if(zoom == null) zoom = 0;
		if (EzMap.Tools.isNumber(zoom)) {
			zoom = parseInt(zoom);
		}else{
			return false;
		}
		this.zoom = zoom;
		return true;
	}

	this.setDistance = function(distance){
		this.distance = distance;
	}
	this.setThreshold = function(threshold){
		this.threshold = threshold;
	}
	this.register = function(eventType,callback){
		
		if(!eventType) return;
		if(!callback) return;
		

		switch(eventType){
			case "click":
				this.click = callback;
				break;
			case "mouseover":
				this.mouseover = callback;
				break;
			case "mouseout":
				this.mouseout = callback;
				break;
			case "mousedown":
				this.mousedown = callback;
				break;
		}
	}
	//redraw this layer
	this.redraw = function(){
		if(this.layer){
			return this.layer.redraw();
		}
		return false;
	}
}

var dg_DEFAULT_ICON = "imgs/icon01.png";
function dgMarker(xy,mobj,da)
{
	this.type = 'marker';
	this.xy = (xy == null) ? null : xy;
	this.drag = (da == null) ? false : da;
	this.id = null;
	this.htmlstr = null;
	this.instance = null;	
	this.content = null;

	this.iconObject = null;
	this.icon = null;
	this.iconType = null;

	//alert(132);

	tmpobj = (mobj == null)? (dg_DEFAULT_ICON) : mobj;
	
	if(tmpobj instanceof dgIcon)
	{
		this.iconObject = tmpobj;
		this.icon = tmpobj;
		this.iconType = "dgicon";
	}
	else if(typeof(tmpobj) == 'object')
	{
		tmpdiv = document.createElement('div');
		tmpdiv.appendChild(tmpobj);
		this.htmlstr = tmpdiv.innerHTML;
		this.iconType = "string";
	}
	else if(typeof(tmpobj) == 'string')
	{
		this.htmlstr = 	tmpobj;
		this.iconType = "string";
	}

	this.getXY = function()
	{
		return this.xy;
	}

	this.setXY = function(tmpxy)
	{
		this.xy = tmpxy;
		this.instance.reposMark(this);
	}
	
	this.setContent = function(mobj)
	{
		if(this.instance != null)
		{
			this.instance.removeItem(this);
		}
		
		if(typeof(mobj) == 'object')
		{
			tmpdiv = document.createElement('div');
			tmpdiv.appendChild(mobj);
			this.content = tmpdiv.innerHTML;
		}
		else if(typeof(mobj) == 'string')
		{
			this.content = 	mobj;
		}
		
		if(this.instance != null)
		{
			this.instance.addItem(this);
		}
	}
	
	this.openInfoWindow = function(wcontent, ww, wh)
	{
		if(this.instance != null)
		{
			this.instance.openInfoWindow(this.xy, wcontent, ww, wh);
		}
		//alert('def:' + this.xy.x + ',' + this.xy.y);
	}

	
	return this;
}

function dgGText(xary,yary,htmlary,idary)
{
	this.type = 'gtext';
	this.xys = new Array();
	this.instance = null;
	for(i=0;i<xary.length;i++)
	{
		this.xys.push(new dgXY(xary[i],yary[i]));	
	}
	this.htmlstrs = htmlary;
	this.ids = idary;
	
	this.getPoint = function(imid)
	{
		for(ic=0;ic<this.xys.length;ic++)
		{
			if(this.ids[ic] == imid)
				return this.xys[ic];
		}
		return null;
	}
	
	this.setPoint = function(imid, ixy)
	{
		if(this.instance != null)
		{
			for(ic=0;ic<this.instance.markArray.length;ic++)
			{
				if(this.instance.markArray[ic].id == imid)
				{
					this.instance.markArray[ic].id = ixy;
					return true;
				}
			}
		}
		return false;
	}
	
	return this;
}



function dgPoint(xy,fs,ptR)
{
	this.type = 'point';
	this.x = xy.x;
	this.y = xy.y;
	this.instance = null;
	this.fillStyle = fs;
	this.ptRadius = ptR;
	return this;
}

function dgSPoint(xy,fs,ptR)
{
	this.type = 'spoint';
	this.x = xy.x;
	this.y = xy.y;
	this.instance = null;
	this.fillStyle = fs;
	this.ptRadius = ptR;
	return this;
}

function dgCircle(xy,fs,ss,sw,ptR)
{
	this.type = 'point';
	this.x = xy.x;
	this.y = xy.y;
	this.instance = null;
	this.fillStyle = fs;
	this.strokeStyle = ss;
	this.lineWidth = sw;
	this.ptRadius = ptR;
	return this;
}

function dgPolyline(pts,ss,sw)
{
	this.type = 'polyline';
	this.xys = pts;
	this.instance = null;
	this.pcount = this.xys.length;
	this.strokeStyle = ss;
	this.lineWidth = sw;
	this.xs = new Array();
	this.ys = new Array();
	for(i=0;i<this.xys.length;i++)
	{
		this.xs.push(this.xys[i].x);
		this.ys.push(this.xys[i].y);
	}
	
	this.getVertexCount = function()
	{
		return (this.xys.length - 2);
	}
	
	this.getVertex = function(iidx)
	{
		return this.xys[iidx-1];
	}
	
	this.addVertex = function(ixy)
	{
		if(this.instance != null)	this.instance.removeItem(this);
		this.xys.push(ixy);
		this.xs.push(ixy.x);
		this.ys.push(ixy.y);
		this.pcount = this.xys.length;
		if(this.instance != null)	this.instance.addItem(this);
	}
	
	return this;
}


function dgSPolyline(pts,ss,sw)
{
	this.type = 'spolyline';
	this.xys = pts;
	this.instance = null;
	this.pcount = this.xys.length;
	this.strokeStyle = ss;
	this.lineWidth = sw;
	this.xs = new Array();
	this.ys = new Array();
	for(i=0;i<this.pcount;i++)
	{
		this.xs.push(this.xys[i].x);
		this.ys.push(this.xys[i].y);
	}
	return this;
}

function dgPolygon(pts,ss,fs,sw)
{
	this.id = null;
	this.type = 'polygon';
	this.xys = pts;
	this.instance = null;
	this.attributes = {};
	if(pts[0] != pts[(pts.length-1)])
	{
		this.xys.push(pts[0]);
	}
	this.pcount = this.xys.length;
	this.strokeStyle = ss;
	this.fillStyle = fs;
	this.lineWidth = sw;
	this.xs = new Array();
	this.ys = new Array();
	for(i=0;i<this.pcount;i++)
	{
		this.xs.push(this.xys[i].x);
		this.ys.push(this.xys[i].y);
	}
	
	this.getVertexCount = function()
	{
		return (this.xys.length - 1);
	}
	
	this.getVertex = function(iidx)
	{
		return this.xys[iidx-1];
	}
	
	this.addVertex = function(ixy)
	{
		if(this.instance != null)	this.instance.removeItem(this);
		tmpxy = this.xys.pop();
		this.xys.push(ixy);
		this.xys.push(tmpxy);
		tmpx = this.xs.pop();
		this.xs.push(ixy.x);
		this.xs.push(tmpx);
		tmpy = this.ys.pop();
		this.ys.push(ixy.y);
		this.ys.push(tmpy);
		this.pcount = this.xys.length;
		if(this.instance != null)	this.instance.addItem(this);
	}

	this.addAttributes = function (objects) {
	    for (var key in objects) {
	        this.attributes[key] = objects[key];
	    }
	}
	return this;
}

function dgSPolygon(pts,ss,fs,sw)
{
	this.type = 'spolygon';
	this.xys = pts;
	this.instance = null;
	if(pts[0] != pts[(pts.length-1)])
	{
		this.xys.push(pts[0]);
	}
	this.pcount = this.xys.length;
	this.strokeStyle = ss;
	this.fillStyle = fs;
	this.lineWidth = sw;
	this.xs = new Array();
	this.ys = new Array();
	for(i=0;i<this.pcount;i++)
	{
		this.xs.push(this.xys[i].x);
		this.ys.push(this.xys[i].y);
	}
	return this;
}

function dgCurve(xy,ss,fs,ptR,sw,ang1,ang2,clockw)
{
	this.id = "";
	this.type = 'curve';
	this.x = xy.x;
	this.y = xy.y;
	this.strokeStyle = ss;
	this.fillStyle = fs;
	this.ptRadius = ptR;
	this.lineWidth = sw;
	this.arcAngle1 = ang1;
	this.arcAngle2 = ang2;
	this.clockwise = clockw;
	this.instance = null;
	return this;
	
	this.setXY = function(tmpxy)
	{
		this.x = tmpxy.x;
		this.y = tmpxy.y
		this.instance.reposMark();
	}
}

function dgRect(ixy1,ixy2,ss,fs,sw)
{
	this.xy1 = ixy1;
	this.xy2 = ixy2;
	this.strokeStyle = ss;
	this.lineWidth = sw;
	this.fillStyle = fs;
	
	this.getSW = function()
	{
		return new dgXY(Math.min(this.xy1.x,this.xy2.x),Math.min(this.xy1.y,this.xy2.y));
	}
	
	this.getNE = function()
	{
		return new dgXY(Math.max(this.xy1.x,this.xy2.x),Math.max(this.xy1.y,this.xy2.y));
	}
	
	this.getWidth = function()
	{
		return Math.abs(this.xy1.x - this.xy2.x);
	}

	this.getHeight = function()
	{
		return Math.abs(this.xy1.y - this.xy2.y);
	}
	
	this.getCenter = function()
	{
		return new dgXY(((this.xy1.x+this.xy2.x)/2),((this.xy1.y+this.xy2.y)/2));
	}
	
	this.contains = function(ixy)
	{
		return ( (ixy.x >= this.getSW().x) && (ixy.x <= this.getNE().x) && (ixy.y >= this.getSW().y) && (ixy.y <= this.getNE().x) ) ? true : false ;
	}
	
	this.containsRect = function(irect)
	{
		return ( (irect.getSW().x >= this.getSW().x) && (irect.getSW().x <= this.getNE().x) && (irect.getSW().y >= this.getSW().y) && (irect.getSW().y <= this.getNE().x)
					&& (irect.getNE().x >= this.getSW().x) && (irect.getNE().x <= this.getNE().x) && (irect.getNE().y >= this.getSW().y) && (irect.getNE().y <= this.getNE().x)
						) ? true : false ;
	}
	
	this.extend = function(ixy)
	{
		if(!this.contains(ixy))
		{
			this.xy1 = new dgXY(Math.min(this.getSW().x,ixy.x),Math.min(this.getSW().y,ixy.y));
			this.xy2 = new dgXY(Math.max(this.getNE().x,ixy.x),Math.max(this.getNE().y,ixy.y));
		}
	}
	
	this.isEmpty = function()
	{
		return (this.xy1 == null || this.xy2 == null) ? true : false;
	}
	
	return this;
	
}

//extend functions
function dgMenuFunc(fname, cfunc,icon)
{
	this.mname = fname;
	this.afunc = cfunc;
	this.icon = icon;
	return this;
}

function printMap(dposx,dposy,e)
{
	ddposx = (dposx != null) ? dposx : e.clientX;
	ddposy = (dposy != null) ? dposy : e.clientY;
	if(document.getElementById('prtDialog') == null)
	{
		prtddiv = document.createElement('div');
		prtddiv.id = 'prtDialog';
		prtddiv.style.cssText = "background-color:#000000;position:absolute;width:260px;height:180px;border:outset 2px #A0A0A0;background-color:#F0F0F0;left:" + ddposx + "px;top:" + ddposy + "px;z-index:99;vertical-align:middle;";
		prtddiv.innerHTML = "<table style='width:100%;height:100%;vertical-align:middle;font-size:small;'><tr><td style='border:solid 1px #BBBBBB;'>格式</td><td style='border:solid 1px #BBBBBB;'><select id='mapSize'><option value='A4'>A4</option><option value='A3'>A3</option></select><select id='maplp'><option value='0'>橫式</option><option value='1'>直式</option></select></td></tr><tr><td style='border:solid 1px #BBBBBB;'>標題</td><td style='border:solid 1px #BBBBBB;'><input id='mapTitle' type='text' style='width:200px;' value='逢甲大學地理資訊系統中心' /></td></tr><tr><td style='border:solid 1px #BBBBBB;'>備註</td><td style='border:solid 1px #BBBBBB;'><textarea id='mapMemo' style='width:200px;height:60px;'>http://www.gis.tw/</textarea></td></tr><tr><td colspan='2' style='text-align:center;border:solid 1px #BBBBBB;'><input type='button' style='background-color:#CCCCCC;' value='列印' onclick='doPrint(this);' /></td></tr></table>";
		
		timg = new Image();
		timg.src = _dgmap4path + 'imgs/close.gif';
		timg.onclick = function()
			{
				//dd.elements['printPrompt'].hide(true);
				this.parentNode.style.display = 'none';
			}
		prtddiv.appendChild(timg);
		timg.style.cssText = "position:absolute;left:" + (parseInt(prtddiv.style.width)-25) + "px;top:" + (5) + "px;cursor:pointer;";


		document.body.appendChild(prtddiv);

	}
	else if(document.getElementById('prtDialog').style.visibility == 'hidden')
	{
		document.getElementById('prtDialog').style.visibility = 'visible';	
		document.getElementById('prtDialog').style.left = ddposx + 'px';
		document.getElementById('prtDialog').style.top = ddposy + 'px';
	}
	else
	{
		document.getElementById('prtDialog').style.visibility = 'hidden';	
	}
}

function doPrint(butnObj)
{
	document.getElementById('prtDialog').style.visibility = 'hidden';
	//document.getElementById('exMenu').style.visibility = 'hidden';
	window.open('printmap.htm', 'printWin');
}

var dgCMenu = [];
function dgFMenu(e)
{
	if(e.button == 2)
	{
		if(!document.getElementById('exMenu'))
		{


			exmdiv = document.createElement('div');
			exmdiv.id = 'exMenu';
			exmdiv.style.cssText = 'position:absolute;border: 2px dashed #808080;background-color:#FCFCFC;z-index:998;color:#555FAA;font-size:15px;padding: 2px';
			exmdiv.style.left = (findPos(this.div)[0] + e.clientX) + 'px';
			exmdiv.style.top = (findPos(this.div)[1] + e.clientY) + 'px';
			for(ic=0;ic<dgCMenu.length;ic++)
			{
				tmpdiv = document.createElement('div').cloneNode(true);
				tmpdiv.style.cssText = 'position:relative;margin:2px;white-space:nowrap;';
				tmpdiv.onmouseover = function()
						{
							this.style.cursor = 'pointer';
							this.style.backgroundColor = '#C0C0C0';
						};
				tmpdiv.onmouseout = function()
						{
							this.style.backgroundColor = '#E7E7E7';
						};
				tmpdiv.innerHTML = dgCMenu[ic].mname;
				tmpdiv.onclick = dgCMenu[ic].afunc;
				exmdiv.appendChild(tmpdiv);
			}
	
			document.body.appendChild(exmdiv);
			
		}
		else
		{
		    exmdiv.style.left = (findPos(this.div)[0] + e.clientX) + 'px';
		    exmdiv.style.top = (findPos(this.div)[1] + e.clientY) + 'px';
			exmdiv.style.visibility = 'visible';
		}
	}
	else
	{
		if(document.getElementById('exMenu'))
		{
			if(document.getElementById('prtDialog'))
			{
				prtddiv.style.visibility = 'hidden';
			}
			exmdiv.style.visibility = 'hidden';
		}
	}
}

//Gerry Add
//計算長度
function  calLength(drawRval) 
{
    
    var XMin=9999999 , YMin =9999999,XMax =0, YMax=0 ;
    var all_len = 0;
    var x_y_len = 0 ;

	if (drawRval.length >1)
	{
		for (i=0;i<drawRval.length-1;i++)
		{
			if (XMin > drawRval[i].x)
				XMin = drawRval[i].x ;
			if (YMin > drawRval[i].y)
				YMin = drawRval[i].y ;
				
			if (XMax < drawRval[i].x)
				XMax = drawRval[i].x ;
			if (YMax < drawRval[i].y)
				YMax = drawRval[i].y ;
	
	
			x_y_len = Math.sqrt((drawRval[i].x-drawRval[i+1].x)*(drawRval[i].x-drawRval[i+1].x)+(drawRval[i].y-drawRval[i+1].y)*(drawRval[i].y-drawRval[i+1].y));
		    all_len = x_y_len + all_len;
	
		}
		
		PolyCX = (XMin +XMax) /2 ;
		PolyCY = (YMin +YMax) /2 ;
 
		return all_len;
	}
	else
	{
		PolyCX = 0 ;
		PolyCY = 0 ;
		return 0 ;
	}
}

//Gerry Add
//計算面積
function calArea(drawRval) 
{
	
	var XMin=9999999 , YMin =9999999,XMax =0, YMax=0 ;
	
	var sum=0,sub=0,carea=0;
	        var tempx,tempy;
	     
	 if (drawRval.length >3)
     {
        
	        
	
	        for(i=0;i<drawRval.length-1;i++)
	        {
	                
	                if (XMin > drawRval[i].x)
						XMin = drawRval[i].x ;
					if (YMin > drawRval[i].y)
						YMin = drawRval[i].y ;
						
					if (XMax < drawRval[i].x)
						XMax = drawRval[i].x ;
					if (YMax < drawRval[i].y)
						YMax = drawRval[i].y ;

	                
	                tempx = parseFloat(drawRval[i].x);
	                tempy = parseFloat(drawRval[i+1].y);
	                sum += tempx * tempy;
	
	                tempx = parseFloat(drawRval[i+1].x);
	                tempy = parseFloat(drawRval[i].y);
	                sub += tempx * tempy;
	        }
	        tempx = parseFloat(drawRval[parseInt(drawRval.length)-1].x) ;
	        tempy = parseFloat(drawRval[0].y);
	        sum += tempx * tempy;
	
	        tempx = parseFloat(drawRval[parseInt(drawRval.length)-1].y) ;
	        tempy = parseFloat(drawRval[0].x);
	        sub += tempx * tempy;
	        carea = Math.abs(sum-sub);
	        carea /= 2;
	        //carea = carea * dis_x * dis_y;
	        
	        PolyCX = (XMin +XMax) /2 ;
			PolyCY = (YMin +YMax) /2 ;

	        return carea;
      }
      else
      {
      		PolyCX = 0 ;
			PolyCY = 0 ;

        	return 0 ;
      }
}


//# easymap7 class
function dgGStyle() {}

window.easymap = Easymap;
window.Easymap = Easymap;

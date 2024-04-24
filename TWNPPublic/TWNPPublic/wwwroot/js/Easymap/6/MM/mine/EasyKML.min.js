/* 
 * GIS.FCU.MM
 * KML的 extension
 * version: 1.0
*  last updated: 2016/03/31     vector add mmtype 
* 
*  2016/03/29  created
*  2016/12/14  add: kml request timeout event
*  2016/12/23  add: popup always on top
*  2017/02/07  fix: onFeatureSelect() > if content is emtpy, then it dosen't have to popup\
*  2017/04/07  fix: processKml() let without <?xml tag start also can fit
 *  */
function base64_decode(data){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,dec="",tmp_arr=[];if(!data){return data;}
data+='';do{h1=b64.indexOf(data.charAt(i++));h2=b64.indexOf(data.charAt(i++));h3=b64.indexOf(data.charAt(i++));h4=b64.indexOf(data.charAt(i++));bits=h1<<18|h2<<12|h3<<6|h4;o1=bits>>16&0xff;o2=bits>>8&0xff;o3=bits&0xff;if(h3==64){tmp_arr[ac++]=String.fromCharCode(o1);}else if(h4==64){tmp_arr[ac++]=String.fromCharCode(o1,o2);}else{tmp_arr[ac++]=String.fromCharCode(o1,o2,o3);}}while(i<data.length);dec=tmp_arr.join('');dec=this.utf8_decode(dec);return dec;}
function base64_encode(data){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!data){return data;}
data=this.utf8_encode(data+'');do{o1=data.charCodeAt(i++);o2=data.charCodeAt(i++);o3=data.charCodeAt(i++);bits=o1<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b64.charAt(h1)+b64.charAt(h2)+b64.charAt(h3)+b64.charAt(h4);}while(i<data.length);enc=tmp_arr.join('');switch(data.length%3){case 1:enc=enc.slice(0,-2)+'==';break;case 2:enc=enc.slice(0,-1)+'=';break;}
return enc;}
function utf8_encode(argString){var string=(argString+'');var utftext="";var start,end;var stringl=0;start=end=0;stringl=string.length;for(var n=0;n<stringl;n++){var c1=string.charCodeAt(n);var enc=null;if(c1<128){end++;}else if(c1>127&&c1<2048){enc=String.fromCharCode((c1>>6)|192)+String.fromCharCode((c1&63)|128);}else{enc=String.fromCharCode((c1>>12)|224)+String.fromCharCode(((c1>>6)&63)|128)+String.fromCharCode((c1&63)|128);}
if(enc!==null){if(end>start){utftext+=string.substring(start,end);}
utftext+=enc;start=end=n+1;}}
if(end>start){utftext+=string.substring(start,string.length);}
return utftext;}
EzMap.EasyKML = OpenLayers.Class({

    /**
     * APIProperty: id
     * {String}
     */
	id: null,

    /**
     * APIProperty: map
     * {<OpenLayers.Map>} This variable is set when the layer is added to 
     *     the map, via the accessor function setMap().
     */
    map: null,

    /**
     * APIProperty: alwaysOnTopSwitch
     * {boolean} wheather open alwaysOnTop function: some kind of laysers named "_ALWAYS_ON_TOP_" initialized, 
	 *			will put the z-Index top more as possible.
     */
	 alwaysOnTopSwitch: false,
    /**
     * APIProperty: proxy
     * {String} Proxy server url, to solve javascript can't process
	 *		crossdomain problem.
     */
    proxy: "",

    /**
     * APIProperty: select
     * {<OpenLayers.Control.SelectFeature>} This variable is set when the a kml feature
	 *		is selected
     */
    select: null,
	
    /**
     * APIProperty: featureStyle
     * {OpenLayers.StyleMap} This variable is used to save feature style
     */
    featureStyle: {},

    /**
     * APIProperty: lastNetworkLinkUnixTime
     * {string} 最後一次Network的時間(unixtime格式)
     */
	lastNetworkLinkUnixTime: 0,

    /**
     * APIProperty: popup
     * {<OpenLayers.Popup.FramedCloud>} This variable is used to popup feature window
     */
    popup: null,

    /**
     * APIProperty: kmls
     * {<MM.BaseType.KML>} This variable is set when the a kml is added
     */
    kmls: null,

    /**
     * APIProperty: networkLinks
     * {<MM.BaseType.NetworkLink>} This variable is set save reload network link when 
	 *		event is lauched.
     */
    networkLinks: null,

    /**
     * APIProperty: parser
     * {<OpenLayers.Format.KML>} This variable is used to parse XML
     */
    parser: null,
	

    /**
     * APIProperty: addKmlWatchDog
     * {<OpenLayers.Format.KML>} This variable is used to prevant
	 *		load a kml to long, it can close loading status
     */
    addKmlWatchDog: null,

    /**
     * APIProperty: removingKmlName
     * {String} to prevant networklink kml continue to add
	 *		after remove kml
     */
    removingKmlName: null,
	
    dgkmls: null,
    /**
     * used for double click 
     */
    dblclick_handler: null,

    /**
     * 
     * */
    /**
     * Constructor: OpenLayers.API
     *
     * Parameters:
     * name - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function (name, options) {

        this.kmls = new Array();
        this.networkLinks = new Array();
        this.dgkmls = new Array();

		this.select = new OpenLayers.Control.SelectFeature([]);

		//讓polygon 也可以drag
		this.select.handlers['feature'].stopDown = false;
		this.select.handlers['feature'].stopUp = false;

		this.parser = new OpenLayers.Format.KML({});
    },

    /**
     * Method: setProxy
     * Set the Proxy url
     * Parameters:
     * map - {string}
     */
    setProxy: function(url) {
        this.proxy = url;		
    },
    /**
     * Method: setMap
     * Set the map property for the API. 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        if (this.map == null) {
            this.map = map;
        }
		this.map.addControl(this.select);
        this.map.events.on({
            'moveend': this.onMoveend,
            'zoomend': this.onZoomend,
            'click':this.click,
            scope: this
        });

    },
    /**
     * Method: click
     *   
     */
    click: function (evt) {
        // 同一點位如果有開啟，在這裡拿掉
        this.destoryKmlCluster();
    },
    /**
     * Method: onMoveend
     * networkLink 重load 時的事件
     * Parameters:
     * map - {<MM.BaseType.NetworkLink>}
     */
    onZoomend: function (evt) {

        this.onMoveend(evt);

        this.destoryKmlCluster();
    },
	onMoveend: function(evt){
		
		//防呆處理
	    var now_UTC = EzMap.Tools.unixtime();
		
		var diff_UTC = parseInt(now_UTC) - parseInt(this.lastNetworkLinkUnixTime);

		if(diff_UTC <= 1 )	return;								//三秒內又動作就不處理
		
		this.lastNetworkLinkUnixTime = EzMap.Tools.unixtime();

		if(evt.type == "zoomend")	return;						//zoom的事件就不處理
		if(evt.type == "mouseup")   return;			

		if(this.networkLinks.length <=0) return;				//沒有就不處理了
		
		//if(_map.getControl("_MeasureToolbar_NAV_")){			//先判斷有沒有載入測量
		//	if(_map.getControl("_MeasureToolbar_NAV_").active == false) 
		//		return;											//如果正在測量時，也不處理
		//}

		//看一下還有沒有popup，有的話就拿掉
		for(var i=0;i<this.map.popups.length;i++){
			//this.map.removePopup(this.map.popups[i]);
		}	
		
		//開始networklink處理
		for(var i=0; i< this.networkLinks.length ;i++){
			var name = this.networkLinks[i].name;
			var href = this.networkLinks[i].href;
			var viewFormat = this.networkLinks[i].viewFormat;

            //# 設定不使用networklink
			var dgkml = this.getDgkml(name);
			if (dgkml.useNetworkLink != undefined && dgkml.useNetworkLink == false) continue;

            //# 
			if(viewFormat){
				href = this.formatUrl(href, viewFormat);
			}
			this.removeLayer(name);
		    //this.addKml(name,href);

			this.processKml(name,href);//2015/2/25 addkml input is changed to dgKml format

		}
	},
    /**
     * Method: addLayer
     * Add a vector to map
     * Parameters:
     * name - {string} 
     * layer - {<OpenLayers.Layer.Vector>}
     */
    addLayer: function(name,layer) {

        var KML = new EzMap.BaseType.KML();
		KML.name = name;
		KML.layer = layer;

		this.kmls.push(KML);
		this.map.addLayer(layer);
		
		var dgkml = this.getDgkml(name);

		layer.setOpacity(dgkml.opacity);
    },
    /**
     * Method: removeLayer
     * remove a vector to map
     * Parameters:
     * name - {string} 
     */
	removeLayer: function(name){

		for(var i=this.kmls.length-1; i >= 0 ;i--){
			if(name == this.kmls[i].name){
				
				this.map.removeLayer(this.kmls[i].layer);
				this.kmls.indexPop(i);
			}
		}
	},
    /**
     * Method: removeAllNetworkLinks
     * Remove all added NetworkLinks
     */
	removeAllNetworkLinks: function(){
		
		this.networkLinks = [];
		
	},
    /**
     * Method: removeAllKmls
     * Remove all added kmls
     */
	removeAllKmls: function(){

		for(var i=this.kmls.length-1; i >= 0;i--){
			try{
				if(this.kmls[i].name)
					this.removeKml(this.kmls[i].name);
			}catch(err){

			}
		}
	},
    /**
     * Method: removeKml
     * Add a vector to map
     * Parameters:
     * name - {string} 
     * layer - {<OpenLayers.Layer.Vector>}
     */
    removeKml: function(name) {
		
		this.removingKmlName = name;

		//註冊一個事件，讓MM.Control.StatusBar可以顯示狀態
		//_map.events.triggerEvent("preaddlayer");

		this.select.deactivate();
		
		//刪除networkLink
		for(var i=0;i<this.networkLinks.length;i++){
			if(name == this.networkLinks[i].name){
				this.networkLinks.indexPop(i);			
			}
		}

		//從圖台移除
		for(var i=0; i<this.map.popups.length;i++){
			this.map.removePopup(this.map.popups[i]);
		}
		
		//移除選擇事件/
		for(var i=0;i<this.select.layers.length;i++){
			if(name == this.select.layers[i].name){

				var tmp = this.select.layers[i];
				this.select.layers.indexPop(i);			
					
				this.removeLayer(name);
				tmp.destroy();
			}
		}
		
		this.removeLayer(name);
		this.select.activate();

        //移除dgkml
		this.delDgkml(name);


    },
    /**
     * Method: interruptLoadedKml
     * 檢查一下是不是已經將這個kml remove掉了
	 *	是的話就不再執行了
     * Parameters:
     * data - {string}
     */
	 interruptLoadedKml: function(name){
		if(name == this.removingKmlName){
			return true;
		}
		return false;
	 },
	
    /**
     * Method: namespaceNormalization
     * 正規化一下kml的namespace
     * Parameters:
     * data - {string}
     */
	namespaceNormalization: function(data){
		if(data){
			var rest = "";
			var xmltag = data.substring(0,data.indexOf('>')+1);
			rest = data.substring(data.indexOf('>') + 2, data.length);
			var kmltag = rest.substring(0,rest.indexOf('>')+1);
			kmltag = kmltag.replace("\n","");
			kmltag = kmltag.replace(" ","");
			rest = rest.substring(rest.indexOf('>')+1,rest.length);

			if(kmltag.length <= 10){
				kmltag = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">';

				return data = xmltag + kmltag + rest;
			}
			
		}
		return data;
	},
    /**
     * Method: addKml
     * Set the map property for the API. 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
	addKml: function(dgkml){
		
		var name = dgkml.id;
		var href = dgkml.url;
		var asyncs = dgkml.async;

		this.removingKmlName = null;//清空removingKml的名稱

		if (EzMap.Tools.isEmpty(name) || EzMap.Tools.isEmpty(href)) {
			return;
		}

		var kml = this.getKmlByName(name);

		if(kml){return;}//代表有新增過了		

		//註冊一個事件，讓MM.Control.StatusBar可以顯示狀態
		this.map.events.triggerEvent("preaddlayer");


		var kmlInfo = {};
		kmlInfo.name = name;
		kmlInfo.href = href
		kmlInfo.asyncs = asyncs;
		kmlInfo.obj = this;

		this.dgkmls.push(dgkml);

		setTimeout(function(scope){
		    kmlInfo.obj.processKml(kmlInfo.name, kmlInfo.href, kmlInfo.asyncs);
		},20);

		//預防無效的kml，佔住狀態列"處理中"太久
		this.addKmlWatchDog = setTimeout(function(){
			kmlInfo.obj.map.events.triggerEvent("addlayer");

			var dgkml = kmlInfo.obj.getDgkml(kmlInfo.name);
			if (dgkml) {
			    if (dgkml.callback) {
			        dgkml.callback(dgkml);
			    }
			    if (dgkml.onFail) {
			        dgkml.onFail(dgkml);
			    }
			}


		},6*1000);
		
	},
	getDgkml: function (name) {

	    for (var i = 0; i < this.dgkmls.length; i++) {
	        if (name == this.dgkmls[i].id) {
	            return this.dgkmls[i];
	        }
	    }
	    return null;
	},
	delDgkml: function(name){

	    for (var i = 0; i < this.dgkmls.length; i++) {
	        if (name == this.dgkmls[i].id) {
	            this.dgkmls[i] = {};
	        }
	    }
	    return null;
	},
    /**
     * Method: addKml
     * Set the map property for the API. 
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
	processKml: function (name, href, sw_async) {

	    var href = this.formatCrossdomain(href);
	    if (sw_async == undefined) {
	        var dgkml = this.getDgkml(name);
            if(dgkml.async != undefined)
	            sw_async = this.getDgkml(name).async;
	    }
	    if (sw_async == undefined || sw_async == false) {
	        var data = this.parser.fetchLink(href);
	        this.processData(name,data, href);
	    } else {
	        var instance = this;
            OpenLayers.Request.GET({
                url: href, async: true, callback: function (request) {
                    var data = request.responseText;
                    instance.processData(name,data, href);
                }
            });
	    }

    },
    processData: function (name,data,href) {

        //# HtmlDecode
        //if (this.proxy != "") {
        //    var span = document.createElement("SPAN");
        //    span.innerHTML = data;
        //    data = span.innerText;
        //}

        //# 來源讀取到timeout的case
        if (data.indexOf('GISMM_EASYMAP_KML_PROXY_TIMEOUT') >= 0) {
            this.map.events.triggerEvent("addlayer");
            this.map.events.triggerEvent("requestkmltimeout");

            var dgkml = this.getDgkml(name);
            if (dgkml.callback)
                dgkml.callback(dgkml);
            if (dgkml.onFail) {
                dgkml.onFail(dgkml);
                
            }
            clearTimeout(this.addKmlWatchDog);
            return;
        }
        if (data == "" || (data.indexOf('<?xml') <= -1 && data.indexOf('<kml') <= -1)) {
            this.map.events.triggerEvent("addlayer");
            var dgkml = this.getDgkml(name);
            if (dgkml.callback)
                dgkml.callback(dgkml);
            if (dgkml.onFail) {
                dgkml.onFail(dgkml);
            }
            clearTimeout(this.addKmlWatchDog);
            return;
        }
        data = this.namespaceNormalization(data);	//namespace正規化

        this.processXml(name, data, href);
    },
	processXml: function(name,data,href){
		
		if(typeof data == "string") {
		    data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
		    this.formatXML(data);
		}
		//看看xml的內容
		if (data) {	

			var types = ["NetworkLink", "Placemark","GroundOverlay"];
			for(var i=0, len=types.length; i<len; ++i) {

				var type = types[i];
				var nodes = this.parser.getElementsByTagNameNS(data, "*", type);
				// skip to next type if no nodes are found
				if(nodes.length == 0) { 
					continue;
				}
				switch (type.toLowerCase()) {
					case "groundoverlay":
						this.addGroundOverlay(name,nodes,href);
						break;

					case "link":
					case "networklink":
						this.addNetworkLink(name,nodes);
						break;
					 
					case "placemark":
						this.addBasicKml(name,data);
						break;
				}
			}

			this.map.events.triggerEvent("addlayer");
		}
	},
    /**
     * Method: getKmlByName
	 * avoid crossdomain url
     * Parameters:
     * name - {string}
     */
	formatCrossdomain: function(href){
		
		if(!href || href == null || href.length <= 0){
			return "";
		}

		var newHref = href;

		//href如果有跨站，不能傳&、?
		if(this.proxy.length >=1){

			var paramsInSide = href.indexOf('?',0);
			paramsInSide += href.indexOf('&',0);

			if(paramsInSide > 0){
				newHref = href.replace("?","[question]");
				for(var i=0;i<=20;i++){
					newHref = newHref.replace("&","[and]");
				}
			}
		}

	    /*不支援;掛其他參數*/
		if (newHref.indexOf(';') >= 0) {
		    newHref = newHref.substring(0, newHref.indexOf(';'));
		}
	    /*替代extent參數*/
		if (newHref.indexOf('[bboxEast]') >= 0) {
            var bounds = this.map.getExtent().transform(this.map.getProjectionObject(),
                            new OpenLayers.Projection("EPSG:4326"));
            newHref = newHref.replace('[bboxEast]', bounds.left);
            newHref = newHref.replace('[bboxWest]', bounds.right);
            newHref = newHref.replace('[bboxNorth]', bounds.top);
            newHref = newHref.replace('[bboxSouth]', bounds.bottom);
		}
		if (this.proxy == '') {
		    return newHref;	//一率經過proxy,裡面有timeout判斷掉懷掉的連線
		} else {
		    return this.proxy + escape(newHref);	//一率經過proxy,裡面有timeout判斷掉懷掉的連線
		}
	},
	formatXML: function (data) {

	    for (var i = 0; i < data.childNodes.length; i++) {
	        var node = data.childNodes[i];
	        if (node == undefined || node == null) continue;
	        if (node["attribute"] == undefined) {
	            if (node.childNodes.length >= 1) {
	                this.formatXML(node);
	            } else {
	                continue;
	            }
	        }
	        if (node.attributes.length >= 1) {
	            if (node.attributes['id'] != undefined && node.attributes['id'].length >= 1) {
	                node.attributes.removeNamedItem("id");

	            }
	        }
	        if (node.childNodes.length >= 1) {
	            this.formatXML(node);
	        } else {
	            return null;
	        }
	    }
	    return null;
	},
    /**
     * Method: getKmlByName
     * Parameters:
     * name - {string}
     */
    getKmlByName: function(name) {
        if (EzMap.Tools.isEmpty(name)) {
			return null;
		}
		
		for(var i=0; i < this.kmls.length; i++){
			if(name == this.kmls[i].name){
				return this.kmls[i].layer;
			}
		}

    },
    /**
     * Method: addNetworkLink
     * Parameters:
     * data - {xml document}
     */
    addNetworkLink: function(name,nodes) {

        for(var i=0, len=nodes.length; i<len; i++) {
            var href = this.parser.parseProperty(nodes[i], "*", "href");

            if (href == null || href.length <= 0) {
                continue;
            }
            var viewFormat = this.parser.parseProperty(nodes[i], "*", "viewFormat");
			
            //default viewFormat
            if (!viewFormat) viewFormat = "BBOX=[bboxWest],[bboxSouth],[bboxEast],[bboxNorth]";

			var NL = new EzMap.BaseType.NetworkLink();
			NL.name = name;
			NL.href = href;
			NL.viewFormat = viewFormat;
			this.networkLinks.push(NL);

			href = this.formatUrl(href, viewFormat);

			
		    this.processKml(name,href);

			
        }

    },

    /**
     * Method: addGroundOverlay
     * Parameters:
     * data - {xml document}
     */
    addGroundOverlay: function(name,nodes,originHref) {
		
		if(this.interruptLoadedKml(name)){//如果已經把這個kmlremove掉，就不繼續了
			clearTimeout(this.addKmlWatchDog);
			return;
		}


		for(var i=0, len=nodes.length; i<len; i++) {
			
			var href = this.parser.parseProperty(nodes[i], "*", "href");
			
			var north = this.parser.parseProperty(nodes[i], "*", "north");
			var south = this.parser.parseProperty(nodes[i], "*", "south");
			var east = this.parser.parseProperty(nodes[i], "*", "east");
			var west = this.parser.parseProperty(nodes[i], "*", "west");
			var color = this.parser.parseProperty(nodes[i], "*", "color");
			var viewRefreshMode = this.parser.parseProperty(nodes[i], "*", "viewRefreshMode");

			var bounds = new OpenLayers.Bounds(west, south, east, north);
			bounds.transform(new OpenLayers.Projection("EPSG:4326"),
							 new OpenLayers.Projection("EPSG:900913"));

			//如果是networkLink的圖
			if(viewRefreshMode){
				
				var viewFormat = "BBOX=[bboxWest],[bboxSouth],[bboxEast],[bboxNorth]";
				var NL = new EzMap.BaseType.NetworkLink();
				NL.name = name;
				NL.href = originHref;
				NL.viewFormat = null;
				this.networkLinks.push(NL);

				href += this.formatUrl(href,viewFormat);

				bounds = this.map.getExtent();

			}
		    //opacity
			var opacity = 1;
			if (color != undefined) {
			    if (color.length >= 2) {
			        opacity = parseInt(color.substring(0, 2), 16);
			        opacity = opacity / 255;
			    }
			}
			var graphic = new OpenLayers.Layer.Image(
				name,
				href,
				bounds ,
				new OpenLayers.Size(100, 100) ,
				{
				    'opacity': opacity,
					'isBaseLayer': false, 
					'visibility': true,
					projection: new OpenLayers.Projection("EPSG:900913"),
					numZoomLevels : 20,
					maxResolution: 'auto'
				});



			var dgkml = this.getDgkml(name);

			graphic.mmtype = "dgkml";
			graphic.dgkml = dgkml;

			dgkml.layer = graphic;
			this.addLayer(name,graphic);
			
			graphic.setOpacity(dgkml.opacity);

			clearTimeout(this.addKmlWatchDog);

			break;
		}
		
		if(dgkml.callback)
			dgkml.callback(dgkml);

    },
    /**
     * Method: addBasicKml
     * Parameters:
     * name - {string}
	 * href - {string}
     */
    addBasicKml: function(name,data) {
		
        var self = this;

		if(this.interruptLoadedKml(name)){//如果已經把這個kmlremove掉，就不繼續了
			return;
		}

		this.select.deactivate();

		var dgkml = this.getDgkml(name);

		var KML = new EzMap.Format.KML({
					internalProjection: new OpenLayers.Projection("EPSG:900913"),
					externalProjection: new OpenLayers.Projection("EPSG:4326"),
					extractStyles: true, //是否使用kml裡面的style
					extractAttributes: true,
					labelVisible: dgkml.labelVisible,
                    iconVisible: dgkml.iconVisible,
					kmlns: "http://www.opengis.net/kml/2.2",
					maxDepth: 200
				});

	
		var vector = new OpenLayers.Layer.Vector(name, {
			projection: this.map.displayProjection
		});

		var features = KML.read(data);
		vector.addFeatures(features);
		vector.mmtype = "dgkml";
		vector.dgkml = dgkml;
        
        //add
		dgkml.layer = vector;
		this.addLayer(name,vector);

		if(name != "_TAICHUANG_"){
			this.select.layers.push(vector);
		}
		
		var onFeatureSelect = null;
		var onFeatureUnselect = null;

		var t = {};
		t.dgkml = dgkml;
		if (dgkml.featureSelectDisabled == false && dgkml.onFeatureSelect) {//user disable featureselect
		    onFeatureSelect = function (event) {
		        t.dgkml.onFeatureSelect(event);
		    };
		} else {
		    if (dgkml.featureSelectDisabled == false) {//user disable featureselect
		        onFeatureSelect = function (event) {
		            self.onFeatureSelect(event);
		        };
		    }

		}

		if (dgkml.featureSelectDisabled == false && dgkml.onFeatureUnselect) {
		    onFeatureUnselect = function (event) {
		        t.dgkml.onFeatureUnselect(event);
		    };
		} else {
		    if (dgkml.featureSelectDisabled == false) {//user disable featureselect
		        onFeatureUnselect = function (event) {
		            self.onFeatureUnselect(event);
		        };
		    }
		}

		var self = this;
		var _onFeatureSelect = onFeatureSelect;

		if (dgkml.featureSelectDisabled == false){
		    vector.events.on({
			    "featureselected": function(event){
				    _onFeatureSelect(event,self);
			    }
		    });

		    var _onFeatureUnselect = onFeatureUnselect;
		    vector.events.on({
			    "featureunselected": function(event){
				    _onFeatureUnselect(event,self);
			    }
		    });
		}
		
        //dblclick handler
		if (dgkml.dblclick) {
		    if (this.dblclick_handler == null) {

		        this.dblclick_handler = new OpenLayers.Handler.Click(
				    this.select,  // The select control
				    {
				        click: function (evt) {

				            var feature = this.layer.getFeatureFromEvent(evt);

				            dgkml.onFeatureSelect(feature,evt,self);

				        }, dblclick: function (evt) {

				            var feature = this.layer.getFeatureFromEvent(evt);
				            dgkml.dblclick(feature,evt,self);

				        }
				    },
				    {
				        single: true,
				        double: true,
				        stopDouble: true,
				        stopSingle: true
				    }
			    );
		        this.dblclick_handler.activate();
		    }
		} else {
		    this.select.activate();
		}
		
		clearTimeout(this.addKmlWatchDog);


		this.alwaysOnTop();
		this.popupAlwaysOnTop();

		if(dgkml.callback){
		    dgkml.callback(dgkml);
		}

        //whether to use UpperZoomByBoundary
		if (dgkml.useUpperZoomByBoundary === true) {
		    var LEFT = 0;
		    var BOTTOM = 9999999;
		    var RIGHT = 99999999;
		    var TOP = 0;

            if(features.length >= 1){
		        
                if (features[0].geometry != null && features[0].geometry.bounds != null){

                    LEFT = features[0].geometry.bounds.left;
                    RIGHT = features[0].geometry.bounds.right;
                    TOP = features[0].geometry.bounds.top;
                    BOTTOM = features[0].geometry.bounds.bottom;
                    for (var i = 0; i < features.length; i++) {
		                var feature = features[i];
		                var left = features[i].geometry.bounds.left;
		                var right = features[i].geometry.bounds.right;
		                var top = features[i].geometry.bounds.top;
		                var bottom = features[i].geometry.bounds.bottom;

		                if (LEFT > left) LEFT = left;
		                if (RIGHT < right) RIGHT = right;
		                if (BOTTOM > bottom) BOTTOM = bottom;
		                if (TOP < top) TOP = top;
                    }

                    var bounds = new OpenLayers.Bounds(LEFT, BOTTOM, RIGHT, TOP);


                    var center = bounds.getCenterLonLat();

                    var zoom = this.map.getZoomForExtent(bounds);

                    this.map.setCenter(center, zoom);
                }
            }
		}
    },
    cluster: function (dgkml,features) {

        if (dgkml.group == undefined) dgkml.group = {};
        for (var i = 0; i<features.length;i++){
            var feature = features[i];
            feature.dgkml = dgkml;
            var x = parseInt(feature.geometry.x);
            var y = parseInt(feature.geometry.y);
            if (dgkml.group[x] == undefined) {
                dgkml.group[x] = {};
                dgkml.group[x].items = [];
                dgkml.group[x].y = y;
                dgkml.group[x].x = x;
            }
            
            dgkml.group[x].items.push(feature);
            
        }
    },
    popupAlwaysOnTop: function () {
        try{
            var olPopup = document.getElementsByClassName("olPopup");
            if(olPopup.length >= 1){
                olPopup[0].style.zIndex = 10000;
            }
        }catch(err){}
    },
	openAlwaysOnTop: function (){
		this.alwaysOnTopSwitch = true;
	},
	closeAlwaysOnTop: function (){
		this.alwaysOnTopSwitch = false;
		this.select.deactivate();
		this.select.activate(); 
	},
	/**
	 *	將MARKER開頭的Name置頂
	 *
	 */
	alwaysOnTop: function(){
		
		//alwaysOnTop功能要不要打開
		if(this.alwaysOnTopSwitch == false)
			return;

		try{
			var maxZIndex = 0;
			for(var i=0; i < _map.layers.length; i++){
				var max = _map.layers[i].getZIndex();

				if(max > maxZIndex){
					maxZIndex = max;
				}
			}

			if(parseInt(maxZIndex) <= 0) return;

			maxZIndex = parseInt(maxZIndex) + 1;
			for(var i=0; i < _map.layers.length; i++){
				var name = _map.layers[i].name.substring(0,8);
				var name2 = _map.layers[i].name.substring(0,15);

				if(name == "_MARKER_"){
					_map.layers[i].setZIndex(maxZIndex);
					maxZIndex = parseInt(maxZIndex) + 1;
				}
				if(name2 == "_ALOWYS_ON_TOP_"){
					_map.layers[i].setZIndex(maxZIndex);
					maxZIndex = parseInt(maxZIndex) + 1;
				}
			}
		}catch(ee){
		}
	},
    /**
     * Method: addGroundOverlay
     * Parameters:
     * data - {xml document}
     */
	formatUrl: function (href, viewFormat) {

	    if (href == null) return "";

		var bounds = this.map.getExtent();
		bounds.transform(new OpenLayers.Projection("EPSG:900913"),
						 new OpenLayers.Projection("EPSG:4326"));

		viewFormat = viewFormat.replace("[bboxWest]",bounds.left);
		viewFormat = viewFormat.replace("[bboxSouth]",bounds.bottom);
		viewFormat = viewFormat.replace("[bboxEast]",bounds.right);
		viewFormat = viewFormat.replace("[bboxNorth]",bounds.top);
		viewFormat = viewFormat.replace("[lookatLon]",500);
		viewFormat = viewFormat.replace("[lookatLat]",500);
		viewFormat = viewFormat.replace("[horizPixels]",500);
		viewFormat = viewFormat.replace("[vertPixels]",500);

		viewFormat = viewFormat.replace("[lookatRange]",0);
		viewFormat = viewFormat.replace("[lookatTilt]",90);
		
		var paramsInSide = href.indexOf('?',0);
		paramsInSide += href.indexOf('&',0);

		if(paramsInSide > 0){

			var lastChar = href.substring(href.length-1,href.length);
			switch(lastChar){
				case "?":
				case "&":
					return href + viewFormat;
				default:
					lastChar = href.substring(href.length-4,href.length);

					if(lastChar == "&amp;"){
						return href + viewFormat;
					}

			}

			return href+ "&" + viewFormat;
		}

		return href +"?"+viewFormat;
	},
    /**
     * Method: onFeatureSelect
     * Parameters:
     * name - {string}
     */
    onFeatureSelect: function (event) {

        //# unselect immediately
        this.select.unselectAll();

	    //# check whether are there a lot of point at the same position
	    var feature = event.feature;
	    var cluster = [];
	    for (var i = 0; i < event.object.features.length; i++) {
	        var f = event.object.features[i];

	        if (f.geometry.x === undefined) continue;

	        var x = parseInt(f.geometry.x);
            var y = parseInt(f.geometry.y);
	        if (cluster[x+''+y] == undefined) {
                cluster[x+''+y] = [];
	        }
            cluster[x+''+y].push(f);
	    }
	    if(cluster.length <= 0){
	        this.onFeatureSelectOne(event);
	    } else {

	        var features = [];
	        //# if there're lots of markers at the same point
            var fs = cluster[parseInt(feature.geometry.x) + ''+ parseInt(feature.geometry.y)];

	        for (var i = 0; i < fs.length; i++) {
	            if (parseInt(feature.geometry.y) == parseInt(fs[i].geometry.y)) {
	                features.push(fs[i]);
	            }
	        }

	        if (features.length >= 2) {
	            this.onFeatureSelectMulti(event, features);
	        } else {
	            this.onFeatureSelectOne(event);
	        }
	    }

	},
	onFeatureSelectMulti: function (event,features) {
	    
	    this.destoryKmlCluster.apply(this,[event]);

	    var markers = new OpenLayers.Layer.Markers("_EASYKML_CLUSTER_");
	    this.map.addLayer(markers);
	    var topz = 0;
	    for (var i = 0; i < this.map.layers.length; i++) {
	        var l = this.map.layers[i];
	        var z = parseInt(l.getZIndex());
	        if (z >= topz) {
	            topz = z;
	        }
	    }
	    markers.setZIndex(topz);

	    var feature = features[0];
	    var xxyy = { lon: feature.geometry.x, lat: feature.geometry.y };

	    for (var i = 0; i < features.length; i++) {
	        var f = features[i];
	        var id = 'EzMapEasyKMLAtSamePosition-' + i;

	        var iconwidth = f.style.graphicWidth;
	        var iconheight = f.style.graphicHeight;

	        if (iconwidth == undefined) iconwidth = 32;
	        if (iconheight == undefined) iconheight = iconwidth;

	        var imghtml = "<img id='" + id + "' \
                            width='"+ iconwidth + "' \
                            height='"+ iconheight + "' \
                            class='' \
                            src='" + f.style.externalGraphic + "'/>";
	        var icon = new EzMap.HtmlStr(imghtml, this.map.tt);
	        var size = new OpenLayers.Size(32, 37);
	        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
	        var marker = new OpenLayers.Marker(xxyy, icon);
	        marker.attributes = f.attributes;
	        markers.addMarker(marker);

	        var self = this;
	        marker.events.register('click', marker, function (evt) {


	            var p = this.map.tt.easymap.mm.toWGS84(this.lonlat.lon, this.lonlat.lat);
	            var html = '';
	            if (this.attributes.name != undefined) {
	                html += "<h4><div class='easymap-popup-title'>" + this.attributes.name + "</div></h4>";
	            }
	            if (this.attributes.description != undefined) {
	                html += this.attributes.description;
	            }
	            var xxyy = new dgXY(p.lon, p.lat);

	            //var self = this;

	            var popup = new OpenLayers.Popup.FramedCloud(
                        "easymap-popup-default",
                        this.lonlat,
                        new OpenLayers.Size(260, 120),
                        html,
                        null,
                        true,
                        function (e) {
                            self.map.removePopup(self.popup);
                            self.select.unselectAll();
                        });
	            popup.autoSize = true;
	            self.popup = popup;
	            this.map.addPopup(popup);
	        });

	        //continue;
	        //求位置
	        var x = (0 + 50 * Math.cos(-(30 * (i + 1)) * Math.PI / 180));
	        var y = (0 + 50 * Math.sin(-(30 * (i + 1)) * Math.PI / 180));

	        x -= iconwidth / 2;
	        y -= iconwidth / 2;

	        var div = document.getElementById(id).parentElement.parentElement;
	        div.classList += ' EzMapEasyKMLAtSamePosition';
	        div.attributes['rx'] = x;
	        div.attributes['ry'] = y;
	        //create class
	        div.style.webkitTransform = 'translate(' + x + 'px, ' + y + 'px)';
	    }
	},
    onFeatureSelectOne: function(event) {

        //start infowindow
        var self = this;

		var feature = event.feature;
		var selectedFeature = feature;
		var ezType = feature.attributes.ezType;
		var width = feature.attributes.width;
		var height = feature.attributes.height;
		var content = "";
		var title = "";
		var description = "";
		var ezIsShowTitle = feature.attributes.ezIsShowTitle;

		var popup_autosize = true;

		if (width == null || width == "" || parseInt(width) <= 50) {
		    width = 380;
		} else {
		    width = parseInt(width);
		    popup_autosize = false;
		}
		if (height == null || height == "" || parseInt(height) <= 50) {
		    height = 300;
		} else {
		    height = parseInt(height);
		}

		//highlight
		var obj = {};
		obj.strokeColor = feature.style.strokeColor;
		obj.strokeWidth = feature.style.strokeWidth;
		this.featureStyle = obj;
		
		var strokeColor = "#FFFF00";
		var strokeWidth = "2";
		
		if(_featureSelectStyle){
			if(_featureSelectStyle.strokeColor) strokeColor = _featureSelectStyle.strokeColor;
			if(_featureSelectStyle.strokeWidth) strokeWidth = _featureSelectStyle.strokeWidth;
		}

		feature.style.strokeColor = strokeColor;
		feature.style.strokeWidth = strokeWidth;
		event.object.redraw();
		
		//將標題排版一下
		title = feature.attributes.name;
		if(typeof title == "undefined"){
			title = "";
		}else{
		    title = "<h4><div class='easymap-popup-title'>" + title + "</div></h4>";
		}
        //從kml控制要不要顯示title
		if (ezIsShowTitle) {
		    if (ezIsShowTitle == "0") {
		        title = "";
		    }
		}

		//將內容排版一下
		if(feature.attributes.description){

			description = feature.attributes.description;
		}else{//沒設定描述就把所有的attributes列出來

			for(var name in feature.attributes){

				if(!name) continue;

				var value = feature.attributes[name].value;
				
				if (typeof name == "undefined") continue;
				if (typeof value == "undefined") continue;

				var tr = "<tr><td>"+name+"</td><td>"+value+"</td></tr>";
				description += tr;							
			}
			if(description.length >0){
			    description = "<table style='margin:10px;' class='popup-table' border=1>" + description + "</table><br/>";
			}
		}

		//自訂的type
		if (ezType) {
		    var proxy_iframe = _dgmap4path + "services/proxy_iframe.aspx?url=";
		    url = feature.attributes.url;

		    switch (ezType.toString().toLowerCase()) {
		        case "script"://run script
		            var program = feature.attributes.ezProgram;
		            eval(program);
		            return;
		            break;
		        case "blank"://open new window
                    if(description != ""){
                        window.open(description);
                    }
		            return;
		            break;
		        case "ajax":
		            
		            if (width == null || width == "" || parseInt(width) <= 50) { width = 380; }
		            if (height == null || height == "" || parseInt(height) <= 50) { height = 300; }

		            if (url && url.length >= 1) {
		                url = proxy_iframe + url;
		            }
		            else {

		                url = proxy_iframe + description;
		            }

		            var request = OpenLayers.Request.GET({
		                url: url,
		                callback: function (data) {
		                    var r = data.responseText;
		                    var div = document.getElementById("easymap-popup-ajaxcontent");
		                    div[base64_decode("aW5uZXJIVE1M")] = r; //innerHTML
		                }
		            });

		            description = "<div id='easymap-popup-ajaxcontent' style='width:"+width+"px;height:"+height+"px'></div>";
		            break;
				case "iframe":

					//if(!url) url = description;

					if(width == null || width == "" || parseInt(width) <= 50){width = 380;}
					if(height == null || height == "" || parseInt(height) <= 50){height = 300;}
					var h = height - 10;
					if (url && url.length >= 1) {

					    if (description)
					    {
						    description = description + "<br/><iframe frameborder=0 width='" + width + "' height='" + h + "' src='" + url + "'></iframe>";
						}
						else
						{
						    description = "<iframe frameborder=0 width='" + width + "' height='" + h + "' src='" + url + "'></iframe>";
						}
					}
					else
					{
						description = "<iframe frameborder=0 width='" + width + "' height='" + h + "' src='" + description + "'></iframe>";
					}
					break;
		        case "iframe_proxy":

		            description = description.replace("?", "[question]");
		            description = description.replace("&", "[and]");
		            description = description.replace("&", "[and]");
		            description = description.replace("&", "[and]");
		            description = description.replace("&", "[and]");
		            description = description.replace("&", "[and]");

		            if (url && url.length >= 1) {
		                if (description) {
		                    description = description + "<br/><iframe frameborder=0 width='" + width + "' height='" + height + "' src='" + proxy_iframe + url + "'></iframe>";
		                }
		                else {
		                    description = "<iframe frameborder=0 width='" + width + "' height='" + height + "' src='" + proxy_iframe + url + "'></iframe>";
		                }
		            }
		            else {

		                if (description.substring(0, 4).toLowerCase() == "http") {
		                    description = "<iframe frameborder=0 width='" + width + "' height='" + height + "' src='" + proxy_iframe + description + "'></iframe>";
		                }
		            }
		            break;
			}
		}
		
		content = title + description;
		//content = title + "<br/><a href='javascript:alert(3);' style='margin:2px;' class='btn btn-info btn-line  topicQuery-dialog-year-group' rel='"+name+"'>勾選</a>";
		
        //# if content is empty, don't have to popup.
		if (content == "") return;

		if (popup_autosize == true) {
		    content = '<div style="verflow:auto;min-height:70px;padding-bottom:20px;">' + content + '</div>';
		    width = 300;
		    height = 300;
		} else {
		    content = '<div style="width:' + width + 'px;height:' + height + 'px;overflow:auto;">' + content + '</div>';
		}

		for(var i=0;i<this.map.popups.length;i++){
			this.map.removePopup(this.map.popups[i]);
		}
		content += '<br/></br>';
		this.popup = new OpenLayers.Popup.FramedCloud(
				"easymap-popup-default", 
				feature.geometry.getBounds().getCenterLonLat(),
				new OpenLayers.Size(width, height),
				content,
				null, 
				true, 
				function (e) {
				    self.map.removePopup(self.popup);
				    self.select.unselectAll();
				});
		this.popup.autoSize = popup_autosize;
		feature.popup = this.popup;
		this.map.addPopup(this.popup);
		
        //# raise popup the most top
		var z = 1;
		for (var i = 0; i < this.map.layers.length; i++) {
		    var layer = this.map.layers[i];
		    var lz = layer.getZIndex();

		    try {
		        lz = parseInt(lz);
		    } catch (err) {
		        lz = 0;
		    }

		    if (lz > z) {
		        z = lz;
		    }
		}
		this.popup.div.style.zIndex = z+"";

    },

    /**
     * destory easykml cluster
     **/
    destoryKmlCluster: function (event) {
        if (this.map.getLayersByName('_EASYKML_CLUSTER_').length >= 1) {
            this.map.removeLayer(this.map.getLayersByName('_EASYKML_CLUSTER_')[0]);
            this.select.unselectAll();
        }
    },
    /**
     * Method: onClose
     * Parameters:
     */
    onClose: function () {
        if (this.select) {
            this.select.unselectAll();
        }
	},
    /**
     * Method: onFeatureSelect
     * Parameters:
     * name - {string}
     */
    onFeatureUnselect: function(event) {

		var feature = event.feature;

		//recover highlight
		feature.style.strokeColor = this.featureStyle.strokeColor;
		feature.style.strokeWidth = this.featureStyle.strokeWidth;

		event.object.redraw();

		if(feature.popup) {
			this.map.removePopup(feature.popup);
			feature.popup.destroy();
			delete feature.popup;
		}

    }
});

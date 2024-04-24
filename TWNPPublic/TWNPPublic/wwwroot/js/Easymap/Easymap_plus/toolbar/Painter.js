



if (ezmapplus.toolbar.painter == undefined)
    ezmapplus.toolbar.painter = {};

(function (ezmapplus) {

    ezmapplus.toolbar.painter.name = 'painter';
    ezmapplus.toolbar.painter.on = true;

    //click icon
    ezmapplus.toolbar.painter.start = function () {

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.painter.name);
        var div = ezmapplus.toolbar.map.createDiv('ezmapplus_toolbar_painter', { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_painter";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/painter.png' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "小畫家");

        //# click map
        $(div).bind("click touchstart", function () {
            //# start
            _Painter.start_ui();
        });
    }

    ezmapplus.toolbar.painter.update_state = function () {

        try {
            var active = ezmapplus.toolbar.painter.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=painter]")[0];
            if (active === true) {
                t.className = "active";
                $(t).css('background-color', ezmapplus.toolbar.active_backgroundcolor);
                //$(t).css('border', '1px solid #880015');
                $(t).css('border-radius', '4px');
            }
            if (active === false) {
                t.className = "";
                $(t).css('background-color', '');
                $(t).css('border', '0px solid #ff0000');
                $(t).css('border-radius', '0px');
            }
        } catch (err) {

        }
    }

    function format(v) {

        var num = new Number(v);
        var n = num.toFixed(5);

        if (n <= 0) return 0;

        return n;
    }
})(ezmapplus);

/**************************************************
小畫家

***************************************************/
function Painter(map,wwwroot){

	this.map = map;

	this.olMap = map.mm.map;
	
	this.mapControls = {};		//畫圖的map控制項

	this.nowAction = "point";

	this.actions = [];			//

	this.actionIndex = 1;

	this.wwwroot = wwwroot;		//本系統的主目錄

	this.init();
	
	this.icon = "";				//畫圖示的icon路徑

	this.lengthOfPathMeasure = 0;

	this.click = null;

}

Painter.prototype.registerClickHandler = function(ontrigger){
	
	OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
		defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		},

		initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
				{}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
				this, arguments
			); 
			this.handler = new OpenLayers.Handler.Click(
				this, {
					'click': this.trigger
				}, this.handlerOptions
			);
		}, 

		trigger: ontrigger

	});
}
Painter.prototype.startClickHandler = function(){

	if(this.click && this.click.active == true) return;	//如果已經啟動中，就不再繼續

	this.click = new OpenLayers.Control.Click();
	this.olMap.addControl(this.click);
	this.click.activate();
}
Painter.prototype.endClickHandler = function(){

	if(this.click)
		this.click.deactivate();

	//讓某些圖層永遠置頂
	this.map.mm.easykml.alwaysOnTop();
}
Painter.prototype.init = function() { 
	
	var THIS = this;
	
	//加入預設的圖示圖層
	var markers = new OpenLayers.Layer.Markers( "_ALOWYS_ON_TOP_MARKERS_" );
	THIS.olMap.addLayer(markers);
	

	//加入文字的預設圖層
    var template = {
        strokeColor: "#0000FF",
        strokeOpacity: 1,
        strokeWidth: 3,
        fillColor: "#00AAFF",
        fillOpacity: 1,
        pointRadius: 5,
        pointerEvents: "visiblePainted",

        externalGraphic: "${url}", //"/OLClient/img/marker-gold.png", //externalGraphic url from attribute url use "${url}"
        graphicXOffset : -11,
        graphicYOffset : -25,
        graphicWidth   : 21,
        graphicHeight  : 25,
        rotation:0,

        label : "${name}", //label from attribute name

        labelXOffset: 0,
        labelYOffset: 0,
        fontColor: "red",
        fontSize: "12px",
        fontFamily: "Arial",
        fontWeight: "bold",
        labelAlign: "lt"
    };
	var style = new OpenLayers.Style(template);
	var tmp = new OpenLayers.StyleMap({"default": style});
			
    var labels = new OpenLayers.Layer.Vector("_ALOWYS_ON_TOP_LABELS_", {
        styleMap: tmp
    });
	THIS.olMap.addLayer(labels);


	//
	$( "#dialog-painter" ).dialog({
	    width: 400,
	    height: 400,
	    collapsible: true,
	    maximizable: true,
	    draggable: true,
		position: { my: "left top", at: "left+75 top+120" },
		//關閉小畫家事件
		close: function(event, ui){

			var len = THIS.actions.length;
			for(var i=len; i>0 ;i--){
				THIS.removeDraw(THIS.actions[i-1]);
			}

			THIS.actions = [];
			THIS.endDraw();

			$("#dialog-painter-control-pan").click();

			//開啟剛剛因限制目錄而關閉的tab
			$( "#directories" ).tabs( "enable", 0 );
			$( "#directories" ).tabs( "enable", 2 );

			//關閉某些圖層置頂功能
			THIS.map.mm.easykml.closeAlwaysOnTop();
		}
	});

	//if(_Tools.isMobile() == true)
	//	$( "#dialog-painter" ).draggable();	//手機版可以拖拉

	//按扭
	$(".painter-button").button();
 	$("#dialog-painter-control").buttonset();

	//color picker:外框
	$('#dialog-painter-color-box-frame').colorPicker({			
	  defaultColor: 0, // index of the default color (optional)
	  columns: 13,     // number of columns (optional)  
	  color: ['#FF7400', 
			  '#FFFFFF', 
			  '#EEEEEE', 
		      '#FFFF88', 
		      '#CDEB8B', 
		      '#6BBA70', 
		      '#006E2E', 
		      '#C3D9FF', 
		      '#4096EE', 
		      '#356AA0', 
		      '#FF0096',
		      '#B02B2C',
			  '#000000'], // list of colors (optional)
	  // click event - selected color is passed as arg.
	  click: function(color){
		  $('#dialog-painter-color-output-frame').val(color);
		  THIS.startDraw(THIS.nowAction);
	  }
	});
	//color picker:填滿
	$('#dialog-painter-color-box-fill').colorPicker({			
	  defaultColor: 0, // index of the default color (optional)
	  columns: 13,     // number of columns (optional)  
	  color: ['#FF7400', 
			  '#FFFFFF', 
			  '#EEEEEE', 
		      '#FFFF88', 
		      '#CDEB8B', 
		      '#6BBA70', 
		      '#006E2E', 
		      '#C3D9FF', 
		      '#4096EE', 
		      '#356AA0', 
		      '#FF0096',
		      '#B02B2C',
			  '#000000'], // list of colors (optional)
	  // click event - selected color is passed as arg.
	  click: function(color){
		  $('#dialog-painter-color-output-fill').val(color);
		  THIS.startDraw(THIS.nowAction);
	  }
	});
	//color picker:label
	$('#dialog-painter-color-box-label').colorPicker({			
	  defaultColor: 0, // index of the default color (optional)
	  columns: 13,     // number of columns (optional)  
	  color: ['#000000', 
			  '#FFFFFF', 
			  '#EEEEEE', 
		      '#FFFF88', 
		      '#CDEB8B', 
		      '#6BBA70', 
		      '#006E2E', 
		      '#C3D9FF', 
		      '#4096EE', 
		      '#356AA0', 
		      '#FF0096',
		      '#B02B2C',
			  '#FF7400'], // list of colors (optional)
	  // click event - selected color is passed as arg.
	  click: function(color){
		  $('#dialog-painter-color-output-label').val(color);
		  THIS.startDraw(THIS.nowAction);
	  }
	});


	

	$( "#dialog-painter" ).dialog("close");
	
	//開啟小畫家的事件
	$("#painter-icon-image").click(function(){
		$( "#dialog-painter" ).dialog("open");
		
		//限制圖層目錄，只能開關這個目錄下的圖層
		$( "#directories" ).tabs({ active: 1 });
		$( "#directories" ).tabs({ disabled: [ 0, 2 ] });
		
		//開啟某些圖層置頂功能
		THIS.map.mm.easykml.openAlwaysOnTop();
	});

	/* 
	 * UI
	 * */
	MM.table.createTable("printer-table");
	//$( "#dialog-painter" ).dialog("close");
	
	//記錄表
    //$("#dialog-painter-record").jqGrid({
    //  datatype: "local",
    //  height: 220,
	//  width: 375,
    //  colNames:['編號','型態', '說明','定位', '刪除',''],
    //  colModel:[
	//		{name:'id',index:'id', width:30, sorttype:"int"},
	//		{name:'drawType',index:'drawType', width:30},
	//		{name:'note',index:'note', width:170},
	//		{name:'update',index:'update', width:60},
	//		{name:'deletion',index:'deletion', width:60, sortable:false},
	//		{name:'rowIndex',index:'rowIndex', hidden: true}
    //  ],
	//	gridComplete: function(event){
		
	//			var ids = $("#dialog-painter-record").jqGrid('getDataIDs');
	//			var rows = $("#dialog-painter-record").jqGrid("getRowData");

	//			var len = $("#dialog-painter-record").jqGrid()[0].rows.length;
				
	//			if(len == 1) return;//標題列
				
	//			//如果不是新增時，那個欄位只一個元件，不然就不理他了
	//			if($("#dialog-painter-record").jqGrid()[0].rows[len-1].cells[3].childNodes.length >=2)
	//				return;
				
	//			//input本身
	//			var btnZoomto = document.createElement('input');
	//			btnZoomto.id = 'tdialog-painter-record-zoomto-'+len;
	//			btnZoomto.type= "button";
	//			btnZoomto.name= "checkbox";
	//			btnZoomto.value = "定位";
	//			btnZoomto.title = rows[len-2].rowIndex;
	//			btnZoomto.onclick = function(event){
					
	//				var action = THIS.getAction(this.title);
					
	//				if(action.action == "icon"){	//圖示

	//					var lonlat = new OpenLayers.LonLat(action.draw.lonlat.lon, action.draw.lonlat.lat).transform(
	//							new OpenLayers.Projection("EPSG:900913"), 
	//							new OpenLayers.Projection("EPSG:4326"));

	//					var xxyy = new dgXY(lonlat.lon, lonlat.lat);
	//					THIS.map.zoomToXY(xxyy,12);
	//					return;
	//				}
	//				if(action.action == "label"){	//文字

	//					var lonlat = new OpenLayers.LonLat(action.draw.geometry.x, action.draw.geometry.y).transform(
	//							new OpenLayers.Projection("EPSG:900913"), 
	//							new OpenLayers.Projection("EPSG:4326"));
	//					var xxyy = new dgXY(lonlat.lon, lonlat.lat);
	//					THIS.map.zoomToXY(xxyy,12);
	//					return;
	//				}
	//				if(action.draw.feature.geometry.x){	//線面
	//					var lonlat = newOpenLayers.LonLat(action.draw.feature.geometry.x, action.draw.feature.geometry.y).transform(
	//							new OpenLayers.Projection("EPSG:900913"), 
	//							new OpenLayers.Projection("EPSG:4326"));
	//					var xxyy = new dgXY(lonlat.lon, lonlat.lat);
	//					THIS.map.zoomToXY(xxyy,11);
						
	//				}else{//點

	//					THIS.olMap.zoomToExtent(action.draw.feature.geometry.bounds);

	//				}	
	//			};

	//			//input本身
	//			var btndelete = document.createElement('input');
	//			btndelete.id = 'dialog-painter-record-delete-'+len;
	//			btndelete.type= "button";
	//			btndelete.name= "checkbox";
	//			btndelete.value = "刪除";
	//			btndelete.title = rows[len-2].rowIndex;
	//			btndelete.onclick = function(event){
					
	//				var action = THIS.getAction(this.title);

	//				THIS.removeDraw(action);	

	//			}
				
	//			$("#dialog-painter-record").jqGrid()[0].rows[len-1].cells[3].appendChild(btnZoomto);				
	//			$("#dialog-painter-record").jqGrid()[0].rows[len-1].cells[4].appendChild(btndelete);
	
	//		},
    //  multiselect: false
    //  //,caption: "Manipulating Array Data"
    //});  
 
	//平移
	$("#dialog-painter-control-pan").click(function(){

		THIS.endDraw();
		THIS.endClickHandler();	//結束MAP的CLICK事件，因為文字有可能開啟了事件卻沒關閉
		$("#dialog-painter-color-container")[0].style.height = "0px";	//顏色高度
		$("#dialog-painter-icon")[0].style.height = "0px";		//icon高度
		$("#dialog-painter-color-container").hide();			//關閉顏色選擇
		$("#dialog-painter-icon").hide();						//關閉icon選擇
		
	});
	
	//畫圖示
	$("#dialog-painter-control-icon").click(function(){


		THIS.endDraw();
		THIS.endClickHandler();	//結束MAP的CLICK事件，因為文字有可能開啟了事件卻沒關閉
		THIS.startDraw("icon");
		
		$("#dialog-painter-color-container")[0].style.height = "0px";
		$("#dialog-painter-icon")[0].style.height = "50px";		//icon高度
		$("#dialog-painter-color-container").hide();			//關閉顏色選擇
		$("#dialog-painter-icon").show();						//開啟icon選擇
	});
	//畫圖示
	$("#dialog-painter-icon img").click(function(obj){
		
		THIS.olMap.getLayersByName("_ALOWYS_ON_TOP_MARKERS_")[0].setZIndex(9999999999);//置頂

		THIS.icon = this.src;
		THIS.startClickHandler();
		
		$("#dialog-painter-icon img").each(function(){			//覆原選取的icon邊框
			this.style.borderWidth = "0px";
			this.style.borderColor = "#999999";
		});

		this.style.borderWidth = "1px";
		this.style.borderColor = "#999999";
	});


	//註冊map的click event
	THIS.registerClickHandler(function(e){
		
		var lonlat = THIS.olMap.getLonLatFromPixel(e.xy);

		switch(THIS.nowAction){
			case "icon":

				$("#dialog-painter-icon img").each(function(){			//覆原選取的icon邊框
					this.style.borderWidth = "0px";
					this.style.borderColor = "#999999";
				});

				
				var size = new OpenLayers.Size(24,24);
				var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
				var icon = new OpenLayers.Icon(THIS.icon,size,offset);

				var markers = THIS.olMap.getLayersByName("_ALOWYS_ON_TOP_MARKERS_")[0];
				var marker = new OpenLayers.Marker(new OpenLayers.LonLat(lonlat.lon,lonlat.lat),icon);
				markers.addMarker(marker);
				
				THIS.handler_ofDraw(marker);

				THIS.endClickHandler();
				break;

			case "label":
				
				
				var text = $("#dialog-painter-label-text").val();
				if(text.length <= 0){
					alert("尚未輸入呈現文字");
					return;
				}

				var ll = new OpenLayers.LonLat(lonlat.lon, lonlat.lat);

				var point = new OpenLayers.Geometry.Point(ll.lon, ll.lat);
				var pointFeature = new OpenLayers.Feature.Vector(point,null,null);
				pointFeature.attributes = {};
				pointFeature.attributes["name"] = text;
				pointFeature.attributes["url"]  = "http://203.66.45.213/TCSAFE/images/1pxInvisible.png";
				
				try{
					var labels = THIS.olMap.getLayersByName("_ALOWYS_ON_TOP_LABELS_")[0];
				
					//if(_Tools.isIE() == true){
						labels.styleMap.styles["default"].defaultStyle.fontColor = $("#dialog-painter-color-output-label").val();
						labels.styleMap.styles["default"].defaultStyle.fontSize = $("#dialog-painter-label-size").val()+"px";						
					//}else{
						//labels.styleMap.styles.default.defaultStyle.fontColor = $("#dialog-painter-color-output-label").val();
						//labels.styleMap.styles.default.defaultStyle.fontSize = $("#dialog-painter-label-size").val()+"px";
					//}

				
					labels.addFeatures([pointFeature]);

					THIS.handler_ofDraw(pointFeature);
				}catch(err){}
				break;
		}


		
	});
	//筆刷

	$("#dialog-painter-control-pencil").click(function(){
		THIS.startDraw("pencil");
		THIS.endClickHandler();	//結束MAP的CLICK事件，因為文字有可能開啟了事件卻沒關閉

		$("#dialog-painter-color-container")[0].style.height = "45px";
		$("#dialog-painter-icon")[0].style.height = "0px";		//icon高度
		$("#dialog-painter-color-container").show();
		$("#dialog-painter-color-container-frame").show();		
		$("#dialog-painter-color-container-fill").hide();
		$("#dialog-painter-color-container-label").hide();
		$("#dialog-painter-icon").hide();						//關閉icon選擇

	});
	//畫點
	$("#dialog-painter-control-point").click(function(){
		THIS.startDraw("point");
		THIS.endClickHandler();	//結束MAP的CLICK事件，因為文字有可能開啟了事件卻沒關閉
		$("#dialog-painter-color-container")[0].style.height = "85px";
		$("#dialog-painter-color-container").show();	
		$("#dialog-painter-color-container-frame").show();
		$("#dialog-painter-color-container-fill").show();
		$("#dialog-painter-color-container-label").hide();
		$("#dialog-painter-icon").hide();						//開啟icon選擇
	});
	//畫線
	$("#dialog-painter-control-line").click(function(){
		THIS.startDraw("line");
		THIS.endClickHandler();	//結束MAP的CLICK事件，因為文字有可能開啟了事件卻沒關閉

		$("#dialog-painter-color-container")[0].style.height = "45px";
		$("#dialog-painter-icon")[0].style.height = "0px";		//icon高度
		$("#dialog-painter-color-container").show();
		$("#dialog-painter-color-container-frame").show();		
		$("#dialog-painter-color-container-fill").hide();
		$("#dialog-painter-color-container-label").hide();
		$("#dialog-painter-icon").hide();						//關閉icon選擇
	});
	//畫面
	$("#dialog-painter-control-polygon").click(function(){
		THIS.startDraw("polygon");
		THIS.endClickHandler();	//結束MAP的CLICK事件，因為文字有可能開啟了事件卻沒關閉

		$("#dialog-painter-color-container")[0].style.height = "85px";
		$("#dialog-painter-icon")[0].style.height = "0px";		//icon高度
		$("#dialog-painter-color-container").show();	
		$("#dialog-painter-color-container-frame").show();
		$("#dialog-painter-color-container-fill").show();
		$("#dialog-painter-color-container-label").hide();
		$("#dialog-painter-icon").hide();						//關閉icon選擇
	});
	//文字
	$("#dialog-painter-control-label").click(function(){

		THIS.startDraw("label");	
		THIS.startClickHandler();

		$("#dialog-painter-color-container")[0].style.height = "85px";
		$("#dialog-painter-icon")[0].style.height = "0px";		//icon高度
		$("#dialog-painter-color-container").show();	
		$("#dialog-painter-color-container-frame").hide();
		$("#dialog-painter-color-container-fill").hide();
		$("#dialog-painter-color-container-label").show();
		$("#dialog-painter-icon").hide();						//關閉icon選擇
	});
	//出圖
	$("#dialog-painter-control-export").click(function(){
		var wwwroot = THIS.wwwroot;
		THIS.ex(wwwroot);
	});

	/* 
	 * map controls 
	 * */
	OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';


	var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
	renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

	vectors = new OpenLayers.Layer.Vector("_ALOWYS_ON_TOP_PAINTER_VECTOR_", {
		renderers: renderer
	});

	this.olMap.addLayers([vectors]);

	// style the sketch fancy
	var sketchSymbolizers = {
		"Point": {
			pointRadius: 4,
			graphicName: "square",
			fillColor: "white",
			fillOpacity: 1,
			strokeWidth: 1,
			strokeOpacity: 1,
			strokeColor: "#333333"
		},
		"Line": {
			strokeWidth: 3,
			strokeOpacity: 1,
			strokeColor: "#666666",
			strokeDashstyle: "dash"
		},
		"Polygon": {
			strokeWidth: 2,
			strokeOpacity: 1,
			strokeColor: "#666666",
			fillColor: "white",
			fillOpacity: 0.3
		}
	};
	var style = new OpenLayers.Style();
	style.addRules([
		new OpenLayers.Rule({symbolizer: sketchSymbolizers})
	]);
	var styleMap = new OpenLayers.StyleMap({"default": style});

	this.mapControls = {
		point: new OpenLayers.Control.DrawFeature(vectors,
					OpenLayers.Handler.Point),
		line: new OpenLayers.Control.DrawFeature(vectors,
					OpenLayers.Handler.Path),
		pencil: new OpenLayers.Control.DrawFeature(vectors,
					OpenLayers.Handler.Path, {
								displayClass: 'olControlDrawFeaturePolygon',
								handlerOptions: {
								  freehand: true
								}
							}),
		polygon: new OpenLayers.Control.DrawFeature(vectors,
					OpenLayers.Handler.Polygon),
		regular: new OpenLayers.Control.DrawFeature(vectors,
					OpenLayers.Handler.RegularPolygon,
					{handlerOptions: {sides: 5}}),
		modify: new OpenLayers.Control.ModifyFeature(vectors)
	};
	
	for(var key in this.mapControls) {
		this.olMap.addControl(this.mapControls[key]);

		this.mapControls[key].events.register("featureadded", this.mapControls[key], function(obj,event){
			THIS.handler_ofDraw(obj);
		});

	}


}; 
//# 開啟介面
Painter.prototype.start_ui = function () {
    $("#dialog-painter").dialog("open");

    //限制圖層目錄，只能開關這個目錄下的圖層
    $("#directories").tabs({ active: 1 });
    $("#directories").tabs({ disabled: [0, 2] });

    //開啟某些圖層置頂功能
    //THIS.map.mm.easykml.openAlwaysOnTop();
}
//開始畫畫
Painter.prototype.startDraw = function(name){
	this.nowAction = name;
	
	if(this.nowAction == "label"){
		for(key in this.mapControls) {
			var control = this.mapControls[key];
			control.deactivate();
		}
		return;
	}
	if(this.nowAction == "icon"){
		for(key in this.mapControls) {
			var control = this.mapControls[key];
			control.deactivate();
		}
		return;
	}

	for(key in this.mapControls) {
		var control = this.mapControls[key];
		if(name == key) {
			control.activate();

			control.layer.styleMap.styles["default"].defaultStyle.strokeColor = $("#dialog-painter-color-output-frame").val();
			control.layer.styleMap.styles["default"].defaultStyle.fillColor = $("#dialog-painter-color-output-fill").val();
		} else {
			control.deactivate();
		}
	}
}
//結束畫畫
Painter.prototype.endDraw = function(){

	for(key in this.mapControls) {
		this.mapControls[key].deactivate();
	}
}
Painter.prototype.removeDraw = function(action){
	
	if(action.action == "icon"){

		this.olMap.getLayersByName("_ALOWYS_ON_TOP_MARKERS_")[0].removeMarker(action.draw);
		this.removeRecord(action.rowIndex);
		return;
	}
	if(action.action == "label"){

		this.olMap.getLayersByName("_ALOWYS_ON_TOP_LABELS_")[0].removeFeatures([action.draw]);
		this.removeRecord(action.rowIndex);
		return;
	}
	this.olMap.getLayersByName("_ALOWYS_ON_TOP_PAINTER_VECTOR_")[0].removeFeatures([action.draw.feature]);

	this.removeRecord(action.rowIndex);
}
//結束一個畫畫的事件
Painter.prototype.handler_ofDraw = function(obj){
	
	this.addRecord(obj);
}
//新增一筆紀錄
Painter.prototype.addRecord = function(obj){

	var index = this.actionIndex;
	var lenIndex = $("#dialog-painter-record").jqGrid()[0].rows.length;
	var note = this.lengthOfPathMeasure;


	var painter = new Painter_action();
	painter.rowIndex = index;
	painter.action = this.nowAction;
	painter.draw = obj;
	
	this.actions.push(painter);
	
	var drawType = this.getActionTwName(this.nowAction);

	var result = 0;
	switch(this.nowAction){
		case "pencil"://筆刷
			//計算長度
			var length = 0.0;
			var components = obj.feature.geometry.components;
			if ( components && (components.length > 1)) {
				for(var i=1, len=components.length; i<=len-1; i++) {
					length += components[i-1].distanceTo(components[i]);
				}
			}
			
			result = parseInt(length);
			if(result < 1000){
				result = result + "公尺";
			}else{
				result = (result/1000) + "公里";
			}
			break;
		case "label":
			var x = obj.geometry.x;
			var y = obj.geometry.y;
			var lonlat = this.map.mm.toWGS84(x,y);
			var lon = (parseInt(lonlat.lon*10000)/10000);
			var lat = (parseInt(lonlat.lat*10000)/10000);
			result = obj.attributes.name+"["+lon+","+lat+"]";
			break;
		case "icon":
			var x = obj.lonlat.lon;
			var y = obj.lonlat.lat;
			var lonlat = this.map.mm.toWGS84(x,y);
			var lon = (parseInt(lonlat.lon*10000)/10000);
			var lat = (parseInt(lonlat.lat*10000)/10000);
			result = lon+","+lat;
			break;
		case "point":
			var x = obj.feature.geometry.x;
			var y = obj.feature.geometry.y;
			var lonlat = this.map.mm.toWGS84(x,y);
			var lon = (parseInt(lonlat.lon*10000)/10000);
			var lat = (parseInt(lonlat.lat*10000)/10000);
			result = lon+","+lat;
			break;
		case "line":
			//計算長度
			var length = 0.0;
			var components = obj.feature.geometry.components;
			if ( components && (components.length > 1)) {
				for(var i=1, len=components.length; i<=len-1; i++) {
					length += components[i-1].distanceTo(components[i]);
				}
			}
			
			result = parseInt(length);
			if(result < 1000){
				result = result + "公尺";
			}else{
				result = (result/1000) + "公里";
			}
			break;
		case "polygon":
			result = obj.feature.geometry.getArea();

			if(result < 1000){
				result = result + "平方公尺";
			}else{
				result = (result/1000) + "平方公里";
			}
			break;
	}


	painter.note = result;


	var mydata = [
		{id: lenIndex, drawType: drawType,note: painter.note, update:"", deletion:"", rowIndex: index}
	];

	$("#dialog-painter-record").jqGrid('addRowData',index,mydata[0]);
	
	this.actionIndex++;
}
Painter.prototype.getActionTwName = function(){
	var name = "";
	switch(this.nowAction){
		case "pencil":
			name = "筆刷";
			break;
		case "label":
			name = "文字";
			break;
		case "icon":
			name = "圖示";
			break;
		case "point":
			name = "點";
			break;
		case "line":
			name = "線";
			break;
		case "polygon":
			name = "面";
			break;
	}
	return name;
}
//刪除一筆紀錄
Painter.prototype.removeRecord = function(sn){

	$("#dialog-painter-record").jqGrid('delRowData',sn);
	

	for(var i=0;i<this.actions.length;i++){
		if(sn == this.actions[i].rowIndex){
			this.actions.indexPop(i);
		}

	}

}
//取得一個操作細結
Painter.prototype.getAction = function(rowIndex){
	for(var i=0; i<this.actions.length;i++){
		if(parseInt(rowIndex) == parseInt(this.actions[i].rowIndex)){
			return this.actions[i];
		}
	}
}
//出圖
Painter.prototype.ex = function(wwwroot){

	$( "#dialog-loading" ).dialog("open");
	document.getElementById("dialog-loading-text").innerHTML = "圖片產製中,請耐心等待...";

	//列印前影藏起來控制項
	var panZoomBar_Left;
	if(this.olMap.getControlsByClass("MM.Control.PanZoomBar").length >=1 ){
		panZoomBar_Left = this.olMap.getControlsByClass("MM.Control.PanZoomBar")[0].div.style.left;
		this.olMap.getControlsByClass("MM.Control.PanZoomBar")[0].div.style.left = "-200px";
	}

	//行動版的出圖如果沒有隱藏下列項目，出圖會湖掉
	if(_Tools.isMobile() == true)
	{
		this.map.document.getElementById("mobile-arrow").style.display = "none";
	}

	var value = document.getElementById('map').innerHTML;
	
	var thatmap = this.olMap;
	setTimeout(function(){
		//thatmap.getControlsByClass("MM.Control.PanZoomBar")[0].div.style.left = panZoomBar_Left;
	},100);


	var w = this.map.getWidth();
	var h = this.map.getHeight();
	$.ajax({
		url: wwwroot+"plugin/exportImage/handler.ashx",
		data: {content:value,w:w,h:h},
		type:"POST",
		dataType:'text',
		timeout: 15*1000,
		success: function(msg){
			  
			  /* 下列為自已找的元件，然後產生的圖片，不過沒有完整的下載*/
			  var url = msg;
			  
			  if(url == "error"){
				  alert("產製圖片失敗，請再重試一次，造成不便之處，敬請原諒!");
				  $( "#dialog-loading" ).dialog("close");
				  return;
			  }
			  
			  if(_Tools.isMobile() == true)
			  {
				  $("#dialog-painter-control-dl")[0].style.display = "";
				  $("#dialog-painter-control-dl")[0].href = url;
				  $( "#dialog-loading" ).dialog("close");
				  return;
			  }

			  if(_Tools.isIE() == true){
				  window.location.href = url;			  
			  }else{
				   var $ifrm = $("<iframe style='display:none' />");
					$ifrm.attr("src", "http://203.66.45.213/tcsafe/modules/main/plugin/exportImage/download.ashx?url="+url);
					$ifrm.appendTo("body");
					$ifrm.load(function () {
						//if the download link return a page
						//load event will be triggered
						$("body").append(
							"<div>Failed to download <i>'" + dlLink + "'</i>!");
					});
				 
				  //document.getElementById("dialog-painter-control-download").href = url;
				  //document.getElementById("dialog-painter-control-download").click();
			  }
			  $( "#dialog-loading" ).dialog("close");

		},

		 error:function(xhr, ajaxOptions, thrownError){ 
			//alert("產製圖片失敗!"); 
			$( "#dialog-loading" ).dialog("close");
		 }
	});
	//alert("圖片產製中，請耐心等待..."); 
}
/**************************************************
一個紀錄的結構

***************************************************/
function Painter_action(){
	this.rowIndex = 0;		//在row裡面的index
	this.action = "";		//哪個操作
	this.draw = {};			//openlayer實作
}
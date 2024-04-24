/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Button.js
 */

/**
 * Class: MM.Control.Print
 * It is designed to be used with a 
 * <OpenLayers.Control.Panel>.
 * 
 * Inherits from:
 *  - <OpenLayers.Control>
 */
EzMap.Control.Print = OpenLayers.Class(OpenLayers.Control.Button, {

    /**
     * APIProperty: iconProxy
     * 記錄icon跟資料庫要資料的網址
     */
    iconProxy: "",

    /**
     * Method: trigger
     * 
     * Called whenever this control is being rendered inside of a panel and a 
     *     click occurs on this controls element. Actually zooms to the maximum
     *     extent of this controls map.
     */
    trigger: function() {

        if (this.map) {
			
			//取出目前在圖台中載入的kml
			var kml_layers="";
			for(var i=0;i<this.map.layers.length;i++){

				var name = this.map.layers[i].name;
				//只有KML圖層開頭是"L"
				if("L" != name.substring(0,1).toUpperCase()) continue;

				name = name +"L";//以防止資料庫抓到類似的id
				kml_layers += name+"_";
			}

			//取出ICON的資訊
			var parser = new OpenLayers.Format.KML({});
			var ICON = parser.fetchLink(this.iconProxy+kml_layers);
			
			//產生iframe
			var ifrm = document.createElement("IFRAME"); 
			ifrm.setAttribute("id", "print_frame"); 
			ifrm.style.width = "0px"; 
			ifrm.style.height = "0px"; 
			document.body.appendChild(ifrm); 

			//產生icon的排版div
			var icon_div = document.createElement("div"); 
			icon_div.setAttribute("id", "icon_div"); 
			icon_div.innerHTML = ICON;
			icon_div.style.position = "absolute";
			icon_div.style.left = "10px";
			icon_div.style.top = "550px";
			icon_div.style.width = "800px"; 
			icon_div.style.height = "6px"; 
			
			//列印前影藏起來控制項
			var panZoomBar_Left;
			if(this.map.getControlsByClass("MM.Control.PanZoomBar").length >=1 ){
				panZoomBar_Left = this.map.getControlsByClass("MM.Control.PanZoomBar")[0].div.style.left;
				this.map.getControlsByClass("MM.Control.PanZoomBar")[0].div.style.left = "-200px";
			}
			var measureBar_Left;
			if(this.map.getControlsByClass("MM.Control.MeasureToolbar").length >=1 ){
				measureBar_Left = this.map.getControlsByClass("MM.Control.MeasureToolbar")[0].div.style.left;
				this.map.getControlsByClass("MM.Control.MeasureToolbar")[0].div.style.left = "-500px";
			}
			document.getElementById("_MAPSWITCHER_").style.display = "none";	//切換底圖control
			
			
			var thatmap = this.map;
			setTimeout(function(){
				thatmap.getControlsByClass("MM.Control.PanZoomBar")[0].div.style.left = panZoomBar_Left;
				thatmap.getControlsByClass("MM.Control.MeasureToolbar")[0].div.style.left = measureBar_Left;
				document.getElementById("_MAPSWITCHER_").style.display = "";
			},100);

			//將圖與資料放到iframe並列印
			var mapsize = this.map.getSize();
			window.frames["print_frame"].document.body.innerHTML = document.documentElement.innerHTML;
			var a = window.frames["print_frame"];
			a.document.getElementById("map").style.width = mapsize.w+"px";
			window.frames["print_frame"].document.body.appendChild(icon_div);
			window.frames["print_frame"].window.focus();
			window.frames["print_frame"].window.print();
			


			return;
			//下方為使用截圖方式的列印，css可以完整，不過測量無法截圖
			html2canvas(document.body, {
			  onrendered: function(canvas) {
				//document.body.appendChild(canvas);

					var ifrm = document.createElement("IFRAME"); 
					ifrm.setAttribute("id", "print_frame"); 
					ifrm.style.width = "0px"; 
					ifrm.style.height = "0px"; 

					document.body.appendChild(ifrm); 
					setTimeout(function(){
						window.frames["print_frame"].document.body.appendChild(canvas);
						window.frames["print_frame"].window.focus();
						window.frames["print_frame"].window.print();
					},200);
			  },
			  width: 500,
		      allowTaint: true,
			  useCORS:true
			});			

        }    
    },

    CLASS_NAME: "MM.Control.Print"
});

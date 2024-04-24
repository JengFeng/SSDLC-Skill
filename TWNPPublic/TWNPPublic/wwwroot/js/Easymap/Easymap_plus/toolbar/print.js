

ezmapplus.toolbar.print = {};
(function (ezmapplus) {

    ezmapplus.toolbar.print.name = 'print';
    ezmapplus.toolbar.print.on = true;
	ezmapplus.toolbar.print.img_chk_interval = null;
    ezmapplus.toolbar.print.selectStyle = true;
    ezmapplus.toolbar.print.start = function () {     
        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.print.name);
        var div = ezmapplus.toolbar.map.createDiv('easymap-toolbar-print', { x: p[0], y: p[1] });
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/print.gif'>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "列印");

        var mapWidth = ezmapplus.toolbar.map.getWidth();
        var mapHeight = ezmapplus.toolbar.map.getHeight();

        //# 列印方向
        if(ezmapplus.toolbar.print.selectStyle){
            renderBtnPrint(mapWidth, mapHeight);
        }
        else{
            $(div).bind("click touchstart", function () {
                ezmapplus.toolbar.print.run('horizontal');
            });
        }

        function renderBtnPrint(mapWidth, mapHeight){
            divHtml = '<div style="text-align:center;width:100px;"> \
                           <span>列印方向</span> <br /> \
                           <input type="button" id="btnPrint1" onclick="ezmapplus.toolbar.print.setBtnPrint({0});" value="直式" />&nbsp; \
                           <input type="button" id="btnPrint2" onclick="ezmapplus.toolbar.print.setBtnPrint({1});" value="橫式" /> \
                       </div>';
            divHtml = divHtml.replace('{0}', "'vertical'");
            divHtml = divHtml.replace('{1}', "'horizontal'");
            MM.tip.click('.easymap_plus_measure_tooltip[data-powertip=列印]', divHtml, 'bottom center');
        }
    }

    //# 設定列印方向按鈕功能
    ezmapplus.toolbar.print.setBtnPrint = function(printStyle){
        if(printStyle =='vertical'){
            ezmapplus.toolbar.print.run('vertical');
        }
        else if(printStyle =='horizontal'){
            ezmapplus.toolbar.print.run('horizontal');
        }
    }
    //# 執行列印
    ezmapplus.toolbar.print.run = function(printStyle){
        setTimeout(function () {
                MM.mask.show();

                // 關閉控制項
                ezmapplus.toolbar.hide_control();

            //# 將經緯度關閉
            if (document.getElementById("background") != null) {
                document.getElementById("background").style.display = "none";
            }
            if (document.getElementById("mousePosition") != null) {
                document.getElementById("mousePosition").style.display = "none";
            }
                

                //# 直式列印還原地圖用
                var w0 = ezmapplus.toolbar.map.getWidth();
                var h0 = ezmapplus.toolbar.map.getHeight();

                if(printStyle =='vertical'){
                    map.resize(630, 891);   // 將地圖調整為直式
                    setTimeout('', 500);
                }

                //# 第一次載入先把目前的畫面擷取一張
                var value = ezmapplus.toolbar.map.olmap.div.innerHTML;
                var w = ezmapplus.toolbar.map.getWidth();
                var h = ezmapplus.toolbar.map.getHeight();

                //# 讓scaleline不會至bottom
                if(printStyle =='vertical'){
                    value = "<div style='height:" + h + "px;margin-top:-50px;'>" + value + "</div>";
                }
                else {
                    value = "<div style='height:" + h + "px'>" + value + "</div>";
                }
                //# scaleline的css
                value += "<link href='../../Easymap/css/map.css' rel='stylesheet' />";

                //# 防止安全性
                value = escape(value);

                //# 圖示 todo: 改成easyui
                if (ezmapplus.toolbar.use_icon_legend == true) {

                    var iconstr = "";
                    var iconheight = 0;
                    var kmls = parent.document.getElementById("IF_LAYER").contentWindow.LPool.kmls;
                    for (var i = 0; i < kmls.length; i++) {
                        var kml = kmls[i];
                        iconstr += "<div style='height:30px'>";
                        iconstr += "<img width=24 height=24 src='../../../uploadfile/ezlayer/icon/" + kml.ICON + "'/>&nbsp;" + kml.NAME;
                        iconstr += "</div>";
                        iconheight += 30;
                    }
                    iconheight += 10;
                    iconstr = "<div style='margin-top:4px;height:" + iconheight + "px'>" + iconstr + "</div>";
                    iconstr = escape(iconstr);

                    value += iconstr;
                    h += iconheight;
                }

                //# compass
                if (ezmapplus.toolbar.use_campass == true){
                    var compass = "";
                    compass = "<div style='position:absolute;right:10px;top:40px;z-index:99999999;'>";
                    compass += "<img width=80 height=80 src='../compass.png'/>";
                    compass += "</div>";
                    value += escape(compass);
                }
                value += escape("<style>.MMControlScaleLineTop{display:none;}.MMControlScaleLineBottom{display:none;}</style>");

                //# start snapshot
                $.ajax({
                    url: "http://map.gis.tw/snapshot/go.ashx",
                    data: { c: value, w: w, h: h, PageNum: "" ,f:'pdf'},
                    type: "POST",
                    dataType: 'text',
                    timeout: 30 * 1000,
                    success: function (text) {

                        //# 開啟控制項
                        ezmapplus.toolbar.show_control();

                        //# 將經緯度打開
                        document.getElementById("background").style.display = "";
                        document.getElementById("mousePosition").style.display = "";

                        // 還原地圖大小
                        map.resize(w0, h0);   // 將地圖調整為直式

                        try{
                            var json = $.parseJSON(text)

                            var a = document.createElement('a');
                            a.id = 'mm_iframe_used_for_download';
                            a.href = json.url;
                            a.setAttribute("download", "map_" + new Date().yyyyMMddHHmmss() + ".pdf");
                            a.innerText = "download";
                            a.target = '_blank';
                            document.getElementsByTagName("body")[0].appendChild(a);


                            $("#mm_iframe_used_for_download")[0].click();
                            $("#mm_iframe_used_for_download").remove();
                        }catch(err){
                            MM.alert('產生pdf失敗，請再操作一次');
                        }

                        MM.mask.hide();
                    },

                    error: function (xhr, ajaxOptions, thrownError) {
                        //# 開啟控制項
                        ezmapplus.toolbar.show_control();

                        MM.mask.hide();
                        //$.notify("非常抱歉，列印操作失敗，等待後請重新操作", "info");
                    }
                });
            }, 20);
    }
})(ezmapplus);
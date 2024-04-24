
if (ezmapplus.toolbar.identify172 == undefined)
    ezmapplus.toolbar.identify172 = {};
(function (ezmapplus) {

    ezmapplus.toolbar.identify172.name = 'identify172';
    ezmapplus.toolbar.identify172.on = true;
    ezmapplus.toolbar.identify172.active = false;
    ezmapplus.toolbar.identify172.isShowedTip = true;

    ezmapplus.toolbar.identify172.start = function () {

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.identify172.name);

        var div = ezmapplus.toolbar.map.createDiv('easymap-toolbar-identify172', { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_identify172";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/identify172.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "點查詢");

        $(div).bind("click touchstart", function () {

            if (ezmapplus.toolbar.identify172.active == true) {
                ezmapplus.toolbar.identify172.active = false;
                ezmapplus.toolbar.update_state();
                ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                return;
            }

            ezmapplus.toolbar.identify172.active = true;

            //# 調整狀態
            var isDrawMode = ezmapplus.toolbar.map.isDrawMode();
            if (isDrawMode == true) {
                ezmapplus.toolbar.map.cancelDrawMode();
                ezmapplus.toolbar.update_state();
                return;
            }

            //# 關掉航照與地籍 不然第二次使用identify172會有問題
            ezmapplus.toolbar.reset_air();
            ezmapplus.toolbar.reset_rmap();
            ezmapplus.toolbar.update_state();
            //# 事件
            if (ezmapplus.toolbar.isMobile == false) {
                ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('onmouseup', function (e,dgxy) { //重新設定onmousedown事件

                    //# 點圖片不算
                    if (e.target.tagName != undefined && e.target.tagName.toLowerCase() == "img") return;

                    ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                    ezmapplus.toolbar.identify172.active = false;

                    var apoint = null;
                    var x = 0;
                    var y = 0;
                    if (e.clientX != undefined) {
                        apoint = ezmapplus.toolbar.map.revXY(e.clientX, e.clientY); //取得事件的坐標，並將坐標轉換成TM2坐標
                        x = format(apoint.x);
                        y = format(apoint.y);
                    } else {

                        x = dgxy.x;
                        y = dgxy.y;
                    }
                    

                    

                    

                    //# 讀取圖符號
                    run(x, y);

                    ezmapplus.toolbar.update_state();
                });
            } else {
                ezmapplus.toolbar.map.attachEvent('touchend', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('touchend', function (e) { //重新設定onmousedown事件

                    //# 點圖片不算
                    if (e.target.tagName.toLowerCase() == "img") return;

                    ezmapplus.toolbar.map.attachEvent('touchend', null); //先將原有的onmousedown事件清除
                    ezmapplus.toolbar.identify172.active = false;

                    var p = $(ezmapplus.toolbar.map.div).position();

                    var left = e.changedTouches[0].pageX;
                    var top = e.changedTouches[0].pageY;
                    var apoint = ezmapplus.toolbar.map.revXY(left,top); //取得事件的坐標，並將坐標轉換成TM2坐標

                    var x = 0;
                    var y = 0;

                    x = format(apoint.x);
                    y = format(apoint.y);

                    //# 讀取圖符號
                    run(x, y);

                    ezmapplus.toolbar.update_state();

                });
            }
        });
    }

    //# 讀取圖符號
    function run(x, y) {

        //# zoomto 
        var xxyy = new dgXY(x, y);
        if (ezmapplus.toolbar.identifyZoom) {
            if (ezmapplus.toolbar.map.getZoom() <= ezmapplus.toolbar.identifyZoom - 1) {
                ezmapplus.toolbar.map.zoomToXY(xxyy, ezmapplus.toolbar.identifyZoom);
            }
        } else {
            if (ezmapplus.toolbar.map.getZoom() <= 16) {
                ezmapplus.toolbar.map.zoomToXY(xxyy, 17);
            }
        }

        //# 紀錄一下現在的位置
        ezmapplus.toolbar.x = x;
        ezmapplus.toolbar.y = y;

        //# message window
        var xxyy = new dgXY(x, y);
        var html = "";
        html += "<div id='ezmapplus_measure_i_window' style='margin:0px;padding:0px;font-family: Microsoft JhengHei;overflow:hidden;'>";
        html += "   <img style='width:20px;height:20px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABOElEQVRIS+2VMUoDQRSGv3/0DoKtRcwxbAQRGxtLrUSLaGHARtFCQVAQtBFEtPQA4gU8gYiNEW29gyG/jGxAdDeZ3Zgu0y077/tm35v3Vgx5qQR/CpgDDNwD7ymxqYI1SefAeAb9tL0OXPWTpAhqkp6BsV+wKJkG3npJUgRbkk7yILY3gPhlhStF0JR0XCDYBM4GFdQlPeWkqG27DrwOKojxDUmnPyQR3gAu/qPIXUYNmM8e7oCXfvD4PqUGKZxKRZ6VtJ2T+y4sXtMm8FipBiGEa9srvYJt7wCHlQTABLAoaSEbEX84tneBg6qC77gQwr7tvYI+GAlGKUro5GHeohlJsVPjDIq/y7zVAlq2j4CHvA2FsyiEcGN7OWUQSbrsdDqrpQTAJLDUYxZ1eW3gFvgoK0g5fN89X+7RhBkLMMiKAAAAAElFTkSuQmCC'/>";
        html += "   <span style='font-weight:bold;'>點查詢</span>";

        html += "   <div id='ezmapplus_measure_i_window_land_info'>";
        html += "       <img id='ezmapplus_measure_i_window_land_info-loading' src='" + ezmapplus.toolbar.path + "images/ajax-loader.gif'/>";
        html += "   </div>";

        html += "   <div id='ezmapplus_measure_i_window_history'>";
        html += "       <img id='ezmapplus_measure_i_window_history-loading' src='" + ezmapplus.toolbar.path + "images/ajax-loader.gif'/>";
        html += "   </div>";

        html += "</div>";


        var width = $(window).width();
        if (width >= 350) {
            width = 350;
        } else {
            width = $(window).width() - 60;
        }
        ezmapplus.toolbar.map.openInfoWindow(xxyy, html, width, 200, function () {

            //刪航照圖
            //reset_air();

            //刪地籍圖
            //reset_rmap();

            //刪bbox
            //reset_bbox();

            ezmapplus.toolbar.map.closeInfoWindow();

            //abort all ajax
            ezmapplus.toolbar.abort_ajax();

            if (ezmapplus.toolbar.identify172.isShowedTip != true) {

                ezmapplus.toolbar.identify172.isShowedTip = true;

                $.notify({
                }, {
                    style: 'ezmapplus_measure_i_foo',
                    autoHide: true,
                    clickToHide: true
                });
            }
        }); //顯示訊息

        //# 取得資訊
        run_information(x,y);
        //# 取得範圍
        run_range(x, y);

        //# 取得歷史航照: 這個地方的地段地號
        MM.ajax.url = ezmapplus.toolbar.path + "service.aspx/get_land1";
        MM.ajax.params = { X: x, Y: y };
        MM.ajax.success = run1;
        MM.ajax.timeout = 20000;
        MM.ajax.error = function (msg) {
            ezmapplus.toolbar.error();
        }
        MM.ajax.web_method();
    }
    //# 取得資訊
    function run_information(x, y) {

        //# 地段地號資訊
        $.getJSON("https://map.gis.tw/identify/qq.ashx?Lon=" + x + "&Lat=" + y, function (data) {
            ezmapplus.toolbar.identify172.land_info = data;

            //container
            var content = document.createElement("div");
            content.style.padding = "10px";

            //item image
            var img_item = document.createElement("img");
            img_item.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACb0lEQVQ4T42TXUiTURjH/+e4nC+mjGkJThFpxSyZLLBY0EW+WLKJILGL2BBFW4ksCQr1Im+CvDJKlojUXaAktItQ8yO0u9VFHyTlvCidm7hgWVv7cr3vG+cdG/OjjwPn4jzn//895zznOQS7Rqm21GBqN3Xzdfz5kuKSwwIRpI3Nja+zM7OTi2OLD/wr/vfZFpK14Gy3baOWSxZbMVeM8HYYcSEOAgJOwSFfkQ9fyCeNPx5/5LrjcgCIM28awDXfb54x1BrOKqhi96F2rGO/YlhyLy24brhMDCIDjNeND3UXdO1lB8v+amabSTGJzcgmlieXh91OdxdRaVUGfpB/wzaLuCIU5BbIEJ1ah/qKetkw4ZlAMB6U48FYUL6eKIni3LU5PdFd1o2U15dfSadmAJVSBaVCiYbKBjQdacJWfAsDrwbg+eYBu0J6eKe9Q6Tmbs0KV8Id3X12SihySA5ajregQ9+BQDSArvku+H/6M9KIL7JEqkarEvQAzWVRu94Oa5V1Tx3UnFp+jUAkgNbnrVgPr8saISZEiMapSVBFCuA46UBbddseAKsNA/jDflieWeAL+2SNlJAipPBWoYceosf+VP7e073oOdUjZ2182ghvyJuRChvCB0Iv0mFyhnTuB+g39oPNtdAa+Cc8VkOrO2TSS+kegQY16MRb0ExTySKz1ow+Yx+iySjs03as/thphgQRTlSnOtGMEdQi85T/7CYmeI0hTKE73cp5sGIKFTj3X+YvmMcYzAC2sz9THngMQo+roKD7gkSIeAcnFnCTmZkmG5DyqHEC1bBDgzqoUCnHvuMzfHiBjxhFEJ+y4b8BOKXWhhIluD4AAAAASUVORK5CYII=";
            img_item.style.marginRight = "6px";

            //相關資訊
            var txt_pick = document.createElement("span");
            txt_pick.innerText = "地段地號資訊";
            txt_pick.style.fontSize = "14px";

            //地段string
            var div_section = document.createElement("div");
            if (ezmapplus.toolbar.identify172.land_info.error_code == '3') {
                ezmapplus.toolbar.identify172.land_info.result = '查無該位置地段地號';
            }
            var sectionstring = ezmapplus.toolbar.identify172.land_info.result;
            div_section.innerHTML = "" + sectionstring;
            div_section.style.paddingLeft = "25px";
            div_section.style.paddingRight = "0px";

            content.appendChild(img_item);
            content.appendChild(txt_pick);
            content.appendChild(div_section);
            
            $("#ezmapplus_measure_i_window_land_info").append(content);
            $("#ezmapplus_measure_i_window_land_info-loading").remove();
        });

    }
    //# 取得範圍
    function run_range(x, y) {

        $.getJSON("https://map.gis.tw/identify/qq.ashx?Lon=" + x + "&Lat=" + y, function (data) {

            var section = data.new_section;
            var landno = data.landno8;

            $.getJSON("https://map.gis.tw/identify/landno2bbox.ashx?field=" + section + "^" + landno, function (data) {

                if (ezmapplus.toolbar.identify172.polygon != null) {
                    ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.identify172.polygon);
                    ezmapplus.toolbar.identify172.polygon = null;
                }

                var dgxys = MM.easyobject.ranges_to_dgxy(data.bbox);
                ezmapplus.toolbar.identify172.polygon = new dgPolygon(dgxys, "rgba(88,83,26,0.6)", "rgba(14,120,12,0.1)", 2);

                ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.identify172.polygon);

            });

        }).fail(function () {
            console.log("ezmap>toolbar>identify172>run_range error");
        });

    }
    function run1(msg) {

        if (msg == "") {
            ezmapplus.toolbar.error();
            return "";
        }

        var json = $.parseJSON(msg).d;
        if (json == "") {
            ezmapplus.toolbar.error();
            return "";
        }

        json = $.parseJSON($.parseJSON(msg).d);

        ezmapplus.toolbar.land_info = json[0];

        ezmapplus.toolbar.land_info.officeStr = $.base64.atob(json[0].officeStr, true);
        ezmapplus.toolbar.land_info.sectStr = $.base64.atob(json[0].sectStr, true);

        var x = ezmapplus.toolbar.x;
        var y = ezmapplus.toolbar.y;

        //# 歷史航照
        run_history(x, y);

        //# 地籍圖
        //是否開啟地籍圖
        if (ezmapplus.toolbar.use_rmap === true) {
            run_rmap(x, y);
        }
        //是否開啟地籍圖圖層
        if (ezmapplus.toolbar.use_rmap_layer === true) {
            if (parent != undefined && parent.Layer_kml != undefined) {
                parent.Layer_kml("地政司地籍圖", true);
            }
            
        }

    }

    //# 歷史航照
    function run_history(x, y) {

        //# 先清空popup的結果
        $("#ezmapplus_measure_i_window_history").empty();

        //# loading
        var img_loading = document.createElement("img");
        img_loading.src = ezmapplus.toolbar.path + "images/ajax-loader.gif";
        img_loading.id = "ezmapplus_measure_i_window_history_loading";
        $("#ezmapplus_measure_i_window_history").append(img_loading);

        //# mapno
        MM.ajax.url = ezmapplus.toolbar.path + "service.aspx/get_mapno";
        MM.ajax.params = { X: x, Y: y };
        MM.ajax.success = run_history_layer;
        MM.ajax.timeout = 10000;
        MM.ajax.error = function (msg) {

            $("#ezmapplus_measure_i_window_history").empty();
            var txt_pick = document.createElement("span");
            txt_pick.innerText = "無法取得歷史航照資料:";
            txt_pick.style.fontSize = "14px";

            console.error("easymap_plus:measure_i:run_history");
        }
        MM.ajax.web_method();
    }
    function run_history_layer(msg) {

        var json = window.$.parseJSON(msg);
        var json = $.parseJSON(json.d);

        var mapno = json.mapno;

        //# 紀錄mapno
        ezmapplus.toolbar.mapno = mapno;

        //# 使用mapno讀取歷史航照
        MM.ajax.url = "http://210.69.25.150/WMSs/QueryWMS.ashx?mapno=" + mapno;
        MM.ajax.success = function () { };
        MM.ajax.timeout = 10000;
        MM.ajax.error = function (msg) {
        }
        ezmapplus.toolbar.ajaxHandler_history = MM.ajax.jsonp();

    }


    //# 畫bbox
    function run_bbox() {

        var section = ezmapplus.toolbar.land_info.office_id;
        var landno8 = ezmapplus.toolbar.land_info.landno8;

        MM.ajax.url = ezmapplus.toolbar.path + "service.aspx/get_bbox";
        MM.ajax.params = { office_id: "", landno: landno8 };
        MM.ajax.timeout = 10000;
        MM.ajax.success = function (msg) {

            if (msg == "") {

                return;
            }

            var json = $.parseJSON($.parseJSON(msg).d);

            if (json.status == "success") {

                reset_bbox();


                var points = [];

                for (var i = 0; i < json.bbox.length; i++) {
                    var bbox = json.bbox[i];

                    try {
                        var lon = parseFloat(bbox.lon);
                        var lat = parseFloat(bbox.lat);

                        points.push(new dgXY(lon, lat));

                    } catch (err) {
                        continue;
                    }
                }
                ezmapplus.toolbar.bbox = new dgPolygon(points, "rgba(0,0,200,0.6)", "rgba(200,0,200,0.6)", 8);


                ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.bbox);
            }
        };

        MM.ajax.error = function (msg) {
            console.error("easymap_plus:measure_i:run_bbox");
        }
        MM.ajax.web_method();
    }

    ezmapplus.toolbar.identify172.update_state = function () {

        try {
            var active = ezmapplus.toolbar.identify172.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=identify172]")[0];
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

    //# jsonp 的結果自動呼叫
    ezmapplus.toolbar.identify172.makeDDLOption = function(result) {

        //# 刪除loading
        $("#ezmapplus_measure_i_window_history_loading").remove();

        //

        var ddlData = $("<select id='ddlData' style='width:180px;margin-left:10px;'></select>");
        if (result.length == undefined) {
            ddlData.append('<option value="" selected="selected" data-mapno="">無法取得資料,請重新點選</option>');
        } else {
            ddlData.append('<option value="" selected="selected" data-mapno="">請選擇圖層</option>');
        }
        for (i = 0; i < result.length; i++) {

            //判斷哪一年的
            var showYear = "";
            try {
                var Y = result[i].Title.split("_");
                var y = Y[1];
                if (y.substring(0, 1) == "0" || y.substring(0, 1) == "1") {
                    showYear = "【20" + y.substring(0, 2) + "年】";
                } else {
                    showYear = "【民國" + y.substring(0, 2) + "年】";
                }
            } catch (err) { }
            ddlData.append('<option value="' + result[i].NAME + '">' + result[i].Title + showYear + '</option>');
        }


        //content
        var content = document.createElement("div");
        content.style.paddingLeft = "10px";

        //item image
        var img_item = document.createElement("img");
        img_item.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACb0lEQVQ4T42TXUiTURjH/+e4nC+mjGkJThFpxSyZLLBY0EW+WLKJILGL2BBFW4ksCQr1Im+CvDJKlojUXaAktItQ8yO0u9VFHyTlvCidm7hgWVv7cr3vG+cdG/OjjwPn4jzn//895zznOQS7Rqm21GBqN3Xzdfz5kuKSwwIRpI3Nja+zM7OTi2OLD/wr/vfZFpK14Gy3baOWSxZbMVeM8HYYcSEOAgJOwSFfkQ9fyCeNPx5/5LrjcgCIM28awDXfb54x1BrOKqhi96F2rGO/YlhyLy24brhMDCIDjNeND3UXdO1lB8v+amabSTGJzcgmlieXh91OdxdRaVUGfpB/wzaLuCIU5BbIEJ1ah/qKetkw4ZlAMB6U48FYUL6eKIni3LU5PdFd1o2U15dfSadmAJVSBaVCiYbKBjQdacJWfAsDrwbg+eYBu0J6eKe9Q6Tmbs0KV8Id3X12SihySA5ajregQ9+BQDSArvku+H/6M9KIL7JEqkarEvQAzWVRu94Oa5V1Tx3UnFp+jUAkgNbnrVgPr8saISZEiMapSVBFCuA46UBbddseAKsNA/jDflieWeAL+2SNlJAipPBWoYceosf+VP7e073oOdUjZ2182ghvyJuRChvCB0Iv0mFyhnTuB+g39oPNtdAa+Cc8VkOrO2TSS+kegQY16MRb0ExTySKz1ow+Yx+iySjs03as/thphgQRTlSnOtGMEdQi85T/7CYmeI0hTKE73cp5sGIKFTj3X+YvmMcYzAC2sz9THngMQo+roKD7gkSIeAcnFnCTmZkmG5DyqHEC1bBDgzqoUCnHvuMzfHiBjxhFEJ+y4b8BOKXWhhIluD4AAAAASUVORK5CYII=";
        img_item.style.marginRight = "6px";

        //選擇航照時間
        var txt_pick = document.createElement("span");
        txt_pick.innerText = "歷史航照檢索:";
        txt_pick.style.fontSize = "14px";

        content.appendChild(img_item);
        content.appendChild(txt_pick);
        content.appendChild(ddlData[0]);

        $("#ezmapplus_measure_i_window_history").append(content);
        $("#ezmapplus_measure_i_window_history-loading").remove();
        $(ddlData).on('change', function () {

            //# add layer
            var layer = this.value;
            var mapno = ezmapplus.toolbar.mapno;

            ezmapplus.toolbar.reset_air();

            ezmapplus.toolbar.source = new dgSource("WMS", {
                name: "__identify_name",
                chname: "_HistoryWMS",
                bg: false,
                url: "http://210.69.25.156/rice4/webpages/wms.asmx/GetMap?layerids=wmshistory,cadjoint&layer=" + layer + "&mapno=" + mapno,
                matrixSet: "EPSG:4326",
                matrixIds: null,
                singleTile: true
            });
            ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.source);

            if (ezmapplus.toolbar.rmap) {
                ezmapplus.toolbar.map.setItemTop(ezmapplus.toolbar.rmap);
            }
            //將開啟的 地政司地籍 圖層提到最高
            if (map.mm != undefined) {
                for (var i = 0; i < map.mm.map.layers.length; i++) {
                    var l = map.mm.map.layers[i];
                    if (l.chname == '地政司地籍') {
                        map.mm.map.setLayerIndex(map.mm.map.layers[1], map.mm.map.layers.length);
                        break;
                    }
                }
            }



            //將測量結果提到最高
            //measure_top_result();
        });
    }

    function format(v) {

        var num = new Number(v);
        var n = num.toFixed(5);

        if (n <= 0) return 0;

        return n;
    }


})(ezmapplus);

//jsonp 使用
function makeDDLOption(result) {
    ezmapplus.toolbar.identify172.makeDDLOption(result);
}
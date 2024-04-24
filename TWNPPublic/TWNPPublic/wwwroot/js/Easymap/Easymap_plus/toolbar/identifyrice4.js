
if (ezmapplus.toolbar.identifyrice4 == undefined)
    ezmapplus.toolbar.identifyrice4 = {};//rice4 identify
(function (ezmapplus) {

    var left = ezmapplus.toolbar.identifyrice4.position[0];
    var top = ezmapplus.toolbar.identifyrice4.position[1];

    ezmapplus.toolbar.identifyrice4.isShowedTip = true;
    ezmapplus.toolbar.identifyrice4.on = true;
    ezmapplus.toolbar.identifyrice4.start = function () {

        var div = map.createDiv(null, { x: left, y: top });
        div.id = "ezmapplus_toolbar_identifyrice4";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/identifyrice4.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "點查詢");
        ezmapplus.toolbar.identifyrice4.button_div = div;
        $(div).bind("click touchstart", function () {

            //# 調整狀態
            if (ezmapplus.toolbar.get_status("identifyrice4") == false) {
                ezmapplus.toolbar.activate("identifyrice4");

            } else {
                ezmapplus.toolbar.disactivate("identifyrice4");
                return;
            }

            //# 關掉航照與地籍 不然第二次使用identifyrice4會有問題
            ezmapplus.toolbar.reset_air();
            ezmapplus.toolbar.reset_rmap();

            //# 事件
            if (ezmapplus.toolbar.isMobile == false) {
                map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                map.attachEvent('onmouseup', function (e) { //重新設定onmousedown事件

                    //# 點圖片不算
                    if (e.target.tagName.toLowerCase() == "img") return;

                    var apoint = ezmapplus.toolbar.map.revXY(e.clientX, e.clientY); //取得事件的坐標，並將坐標轉換成TM2坐標

                    var x = 0;
                    var y = 0;

                    x = format(apoint.x);
                    y = format(apoint.y);

                    //# 讀取圖符號
                    run(x, y);

                    ezmapplus.toolbar.disactivate("identifyrice4");
                });
            } else {
                ezmapplus.toolbar.map.attachEvent('touchstart', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('touchstart', function (e) { //重新設定onmousedown事件

                    //# 點圖片不算
                    if (e.target.tagName.toLowerCase() == "img") return;

                    var apoint = ezmapplus.toolbar.map.revXY(e.clientX, e.clientY); //取得事件的坐標，並將坐標轉換成TM2坐標

                    var x = 0;
                    var y = 0;

                    x = format(apoint.x);
                    y = format(apoint.y);

                    //# 讀取圖符號
                    run(x, y);

                    ezmapplus.toolbar.disactivate("identifyrice4");

                });
            }
        });
    }

    //# 讀取圖符號
    function run(x, y) {

        //# zoomto 
        var xxyy = new dgXY(x, y);
        if (ezmapplus.toolbar.identifyrice4Zoom) {
            if (ezmapplus.toolbar.map.getZoom() <= ezmapplus.toolbar.identifyrice4Zoom - 1) {
                ezmapplus.toolbar.map.zoomToXY(xxyy, ezmapplus.toolbar.identifyrice4Zoom);
            }
        } else {
            if (ezmapplus.toolbar.map.getZoom() <= 16) {
                ezmapplus.toolbar.map.zoomToXY(xxyy, 17);
            }
        }
        //ezmapplus.measure_i.map.zoomTo(18);

        //# 紀錄一下現在的位置
        ezmapplus.toolbar.x = x;
        ezmapplus.toolbar.y = y;

        //# message window
        var xxyy = new dgXY(x, y);
        var html = "";
        html += "<div id='ezmapplus_measure_i_window' style='margin:0px;padding:0px;font-family: Microsoft JhengHei;overflow:hidden;'>";
        html += "   <img style='width:20px;height:20px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABOElEQVRIS+2VMUoDQRSGv3/0DoKtRcwxbAQRGxtLrUSLaGHARtFCQVAQtBFEtPQA4gU8gYiNEW29gyG/jGxAdDeZ3Zgu0y077/tm35v3Vgx5qQR/CpgDDNwD7ymxqYI1SefAeAb9tL0OXPWTpAhqkp6BsV+wKJkG3npJUgRbkk7yILY3gPhlhStF0JR0XCDYBM4GFdQlPeWkqG27DrwOKojxDUmnPyQR3gAu/qPIXUYNmM8e7oCXfvD4PqUGKZxKRZ6VtJ2T+y4sXtMm8FipBiGEa9srvYJt7wCHlQTABLAoaSEbEX84tneBg6qC77gQwr7tvYI+GAlGKUro5GHeohlJsVPjDIq/y7zVAlq2j4CHvA2FsyiEcGN7OWUQSbrsdDqrpQTAJLDUYxZ1eW3gFvgoK0g5fN89X+7RhBkLMMiKAAAAAElFTkSuQmCC'/>";
        html += "   <span style='font-weight:bold;'>點查詢</span>";
        html += "   <div id='ezmapplus_measure_i_window_history'>";
        html += "       <img src='" + ezmapplus.toolbar.path + "images/ajax-loader.gif'/>";
        html += "   </div>";
        html += "   <div id='ezmapplus_measure_i_window_info'></div>";
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

            if (ezmapplus.toolbar.identifyrice4.isShowedTip != true) {

                ezmapplus.toolbar.identifyrice4.isShowedTip = true;

                $.notify({
                }, {
                    style: 'ezmapplus_measure_i_foo',
                    autoHide: true,
                    clickToHide: true
                });
            }
        }); //顯示訊息

        //# 取得資訊
        run_information();

        //# 取得 這個地方的地段地號
        MM.ajax.url = ezmapplus.toolbar.path + "rice4.aspx/get_land1";
        MM.ajax.params = { X: x, Y: y };
        MM.ajax.success = run1;
        MM.ajax.timeout = 20000;
        MM.ajax.error = function (msg) {
            ezmapplus.toolbar.error();
        }
        MM.ajax.web_method();
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
            parent.Layer_kml("地政司地籍圖", true);
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
        MM.ajax.url = ezmapplus.toolbar.path + "rice4.aspx/get_mapno";
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
    //# 地籍圖
    function run_rmap(x, y) {

        //# mapno
        MM.ajax.url = ezmapplus.toolbar.path + "rice4.aspx/get_layer";
        MM.ajax.params = { X: x, Y: y };
        MM.ajax.timeout = 20000;
        MM.ajax.success = function (msg) {

            var json = $.parseJSON(msg);

            if (json.d == "") {

                return;
            }

            //# 區段地籍圖
            var op = {};
            op.bg = false;
            op.name = "EASYMAP_MEASURE_I_RMAP";
            op.chname = "地籍";
            op.url = "http://210.61.137.230/R02map/wmts";
            op.layer = json.d; //"BC0310";
            op.matrixSet = "EPSG:3857";
            op.format = "image/png";
            op.serverResolutions = null;

            reset_rmap();

            ezmapplus.toolbar.rmap = new dgSource("WMTS", op);
            ezmapplus.toolbar.map.addItem(ezmapplus.measure_i.rmap);


            ezmapplus.toolbar.sectno = json.d;

            //將測量結果提到最高
            measure_top_result();

        };

        MM.ajax.error = function (msg) {
            console.error("easymap_plus:measure_i:run_rmap");
        }
        MM.ajax.web_method();

    }

    //# 畫bbox
    function run_bbox() {

        var section = ezmapplus.toolbar.land_info.office_id;
        var landno8 = ezmapplus.toolbar.land_info.landno8;

        MM.ajax.url = ezmapplus.toolbar.path + "rice4.aspx/get_bbox";
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


    //# jsonp 的結果自動呼叫
    ezmapplus.toolbar.identifyrice4.makeDDLOption = function(result) {

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

        $(ddlData).on('change', function () {

            //# add layer
            var layer = this.value;
            var mapno = ezmapplus.toolbar.mapno;

            ezmapplus.toolbar.reset_air();

            ezmapplus.toolbar.source = new dgSource("WMS", {
                name: "__identifyrice4_name",
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

            //將測量結果提到最高
            //measure_top_result();
        });
    }
    function run_information() {

        //# loading
        var img_loading = document.createElement("img");
        img_loading.src = ezmapplus.toolbar.path + "images/ajax-loader.gif";
        img_loading.id = "ezmapplus_measure_i_window_loading";
        $("#ezmapplus_measure_i_window_info").append(img_loading);


        //# 讀取該點位資訊
        var x = ezmapplus.toolbar.x;
        var y = ezmapplus.toolbar.y;

        MM.ajax.url = ezmapplus.toolbar.path + "rice4.aspx/get_information";
        MM.ajax.params = { X: x, Y: y };
        MM.ajax.timeout = 10000;
        MM.ajax.success = function (msg) {

            if (msg == "") {
                $("#ezmapplus_measure_i_window_loading").remove();
                return;
            }

            $("#ezmapplus_measure_i_window_loading").remove();

            var msg = $.parseJSON(msg).d;

            //content
            var content = document.createElement("div");
            content.style.padding = "10px";

            //item image
            var img_item = document.createElement("img");
            img_item.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACb0lEQVQ4T42TXUiTURjH/+e4nC+mjGkJThFpxSyZLLBY0EW+WLKJILGL2BBFW4ksCQr1Im+CvDJKlojUXaAktItQ8yO0u9VFHyTlvCidm7hgWVv7cr3vG+cdG/OjjwPn4jzn//895zznOQS7Rqm21GBqN3Xzdfz5kuKSwwIRpI3Nja+zM7OTi2OLD/wr/vfZFpK14Gy3baOWSxZbMVeM8HYYcSEOAgJOwSFfkQ9fyCeNPx5/5LrjcgCIM28awDXfb54x1BrOKqhi96F2rGO/YlhyLy24brhMDCIDjNeND3UXdO1lB8v+amabSTGJzcgmlieXh91OdxdRaVUGfpB/wzaLuCIU5BbIEJ1ah/qKetkw4ZlAMB6U48FYUL6eKIni3LU5PdFd1o2U15dfSadmAJVSBaVCiYbKBjQdacJWfAsDrwbg+eYBu0J6eKe9Q6Tmbs0KV8Id3X12SihySA5ajregQ9+BQDSArvku+H/6M9KIL7JEqkarEvQAzWVRu94Oa5V1Tx3UnFp+jUAkgNbnrVgPr8saISZEiMapSVBFCuA46UBbddseAKsNA/jDflieWeAL+2SNlJAipPBWoYceosf+VP7e073oOdUjZ2182ghvyJuRChvCB0Iv0mFyhnTuB+g39oPNtdAa+Cc8VkOrO2TSS+kegQY16MRb0ExTySKz1ow+Yx+iySjs03as/thphgQRTlSnOtGMEdQi85T/7CYmeI0hTKE73cp5sGIKFTj3X+YvmMcYzAC2sz9THngMQo+roKD7gkSIeAcnFnCTmZkmG5DyqHEC1bBDgzqoUCnHvuMzfHiBjxhFEJ+y4b8BOKXWhhIluD4AAAAASUVORK5CYII=";
            img_item.style.marginRight = "6px";

            //相關資訊
            var txt_pick = document.createElement("span");
            txt_pick.innerText = "相關資訊";
            txt_pick.style.fontSize = "14px";


            //msg            
            var div_msg = document.createElement("div");
            div_msg.innerHTML = msg;
            div_msg.style.paddingLeft = "25px";
            div_msg.style.paddingRight = "0px";

            //地段string
            var div_section = document.createElement("div");

            try {
                var sectionstring = ezmapplus.toolbar.land_info.sectStr + MM.farmer.landno8_to_dash(ezmapplus.toolbar.land_info.landno);
                //div_section.innerHTML = "地段地號:" + sectionstring + "地號";
                div_section.style.paddingLeft = "25px";
                div_section.style.paddingRight = "0px";
            } catch (err) { }

            content.appendChild(img_item);
            content.appendChild(txt_pick);
            content.appendChild(div_msg);
            content.appendChild(div_section);

            $("#ezmapplus_measure_i_window_info").append(content);
        };

        MM.ajax.error = function (msg) {
            ezmapplus.toolbar.error();
        }
        MM.ajax.web_method();
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
    ezmapplus.toolbar.identifyrice4.makeDDLOption(result);
}
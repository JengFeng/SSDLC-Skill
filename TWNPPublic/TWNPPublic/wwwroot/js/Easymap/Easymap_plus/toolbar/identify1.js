
if (ezmapplus.toolbar.identify1 == undefined)
    ezmapplus.toolbar.identify1 = {};
(function (ezmapplus) {

    ezmapplus.toolbar.identify1.name = 'identify1';
    ezmapplus.toolbar.identify1.on = true;
    ezmapplus.toolbar.identify1.active = false;
    ezmapplus.toolbar.identify1.isShowedTip = true;

    ezmapplus.toolbar.identify1.polygon = null;//存放畫出來的polygon
    ezmapplus.toolbar.identify1.start = function () {

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.identify1.name);

        var div = ezmapplus.toolbar.map.createDiv(null, { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_identify1";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/identify1.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "點查詢");

        $(div).bind("click touchstart", function () {

            if (ezmapplus.toolbar.identify1.active == true) {
                ezmapplus.toolbar.identify1.active = false;
                ezmapplus.toolbar.update_state();
                ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('touchend', null); //先將原有的onmousedown事件清除
                return;
            }

            ezmapplus.toolbar.identify1.active = true;

            //# 調整狀態
            var isDrawMode = ezmapplus.toolbar.map.isDrawMode();
            if (isDrawMode == true) {
                ezmapplus.toolbar.map.cancelDrawMode();
                ezmapplus.toolbar.update_state();
                return;
            }

            //# 關掉航照與地籍 不然第二次使用identify會有問題
            ezmapplus.toolbar.reset_air();
            ezmapplus.toolbar.reset_rmap();
            ezmapplus.toolbar.update_state();
            //# 事件
            if (ezmapplus.toolbar.isMobile == false) {
                ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('onmouseup', function (e) { //重新設定onmousedown事件

                    //# 點圖片不算
                    if (e.target.tagName.toLowerCase() == "img") return;

                    ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                    ezmapplus.toolbar.identify1.active = false;


                    var apoint = ezmapplus.toolbar.map.revXY(e.clientX, e.clientY); //取得事件的坐標，並將坐標轉換成TM2坐標

                    var x = 0;
                    var y = 0;

                    x = format(apoint.x);
                    y = format(apoint.y);

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
                    ezmapplus.toolbar.identify1.active = false;



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
        //ezmapplus.measure_i.map.zoomTo(18);

        //# 紀錄一下現在的位置
        ezmapplus.toolbar.x = x;
        ezmapplus.toolbar.y = y;

        //# message window
        var xxyy = new dgXY(x, y);
        var html = "";
        html += "<div id='ezmapplus_measure_i_window' style='margin:0px;padding:0px;font-family: Microsoft JhengHei;overflow:hidden;'>";
        //html += "   <img style='width:20px;height:20px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABOElEQVRIS+2VMUoDQRSGv3/0DoKtRcwxbAQRGxtLrUSLaGHARtFCQVAQtBFEtPQA4gU8gYiNEW29gyG/jGxAdDeZ3Zgu0y077/tm35v3Vgx5qQR/CpgDDNwD7ymxqYI1SefAeAb9tL0OXPWTpAhqkp6BsV+wKJkG3npJUgRbkk7yILY3gPhlhStF0JR0XCDYBM4GFdQlPeWkqG27DrwOKojxDUmnPyQR3gAu/qPIXUYNmM8e7oCXfvD4PqUGKZxKRZ6VtJ2T+y4sXtMm8FipBiGEa9srvYJt7wCHlQTABLAoaSEbEX84tneBg6qC77gQwr7tvYI+GAlGKUro5GHeohlJsVPjDIq/y7zVAlq2j4CHvA2FsyiEcGN7OWUQSbrsdDqrpQTAJLDUYxZ1eW3gFvgoK0g5fN89X+7RhBkLMMiKAAAAAElFTkSuQmCC'/>";
        html += "   <span style='font-weight:bold;'>點查詢</span>";
        //html += "   <div id='ezmapplus_measure_i_window_history'>";
        //html += "       <img src='" + ezmapplus.toolbar.path + "images/ajax-loader.gif'/>";
        //html += "   </div>";
        html += "   <div id='ezmapplus_measure_i_window_land_info'></div>";
        html += "   <div id='ezmapplus_measure_i_window_info'></div>";
        html += "</div>";


        var width = $(window).width();
        if (width >= 300) {
            width = 300;
        } else {
            width = $(window).width() - 60;
        }
        ezmapplus.toolbar.map.openInfoWindow(xxyy, html, width, 180, function () {

            ezmapplus.toolbar.map.closeInfoWindow();

            //abort all ajax
            ezmapplus.toolbar.abort_ajax();

            if (ezmapplus.toolbar.identify1.isShowedTip != true) {

                ezmapplus.toolbar.identify1.isShowedTip = true;

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

    }

    ezmapplus.toolbar.identify1.update_state = function () {

        try {
            var active = ezmapplus.toolbar.identify1.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=identify1]")[0];
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

    //# 取得資訊
    function run_information(x, y) {

        //# 地段地號資訊
        $.getJSON("http://59.120.223.172/identify/qq.ashx?Lon="+x+"&Lat="+y, function (data) {
            ezmapplus.toolbar.identify1.land_info = data;
            
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

            var sectionstring = ezmapplus.toolbar.identify1.land_info.result;
            div_section.innerHTML = "" + sectionstring;
            div_section.style.paddingLeft = "25px";
            div_section.style.paddingRight = "0px";
            
            content.appendChild(img_item);
            content.appendChild(txt_pick);
            content.appendChild(div_section);

            $("#ezmapplus_measure_i_window_land_info").append(content);
        });
        //# 相關資訊
        run_information1();
    }
    function run_information1() {
        //# loading
        var img_loading = document.createElement("img");
        img_loading.src = ezmapplus.toolbar.path + "images/ajax-loader.gif";
        img_loading.id = "ezmapplus_measure_i_window_loading";
        $("#ezmapplus_measure_i_window_info").append(img_loading);


        //# 讀取該點位資訊
        var x = ezmapplus.toolbar.x;
        var y = ezmapplus.toolbar.y;

        MM.ajax.url = ezmapplus.toolbar.path + "service.aspx/get_information";
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


            content.appendChild(img_item);
            content.appendChild(txt_pick);
            content.appendChild(div_msg);
            

            $("#ezmapplus_measure_i_window_info").append(content);
        };

        MM.ajax.error = function (msg) {
            ezmapplus.toolbar.error();
        }
        MM.ajax.web_method();
    }
    //# 取得範圍
    function run_range(x,y) {

        $.getJSON("http://59.120.223.172/identify/qq.ashx?Lon="+x+"&Lat="+y, function (data) {

            var section = data.new_section;
            var landno = data.landno8;

            $.getJSON("http://59.120.223.172/identify/landno2bbox.ashx?field="+section+"^"+landno, function (data) {

                if (ezmapplus.toolbar.identify1.polygon != null) {
                    ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.identify1.polygon);
                    ezmapplus.toolbar.identify1.polygon = null;
                }

                var dgxys = MM.easyobject.ranges_to_dgxy(data.bbox);
                ezmapplus.toolbar.identify1.polygon = new dgPolygon(dgxys, "rgba(88,83,26,0.6)", "rgba(14,120,12,0.1)", 2);

                ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.identify1.polygon);

            });

        }).fail(function () {
            console.log("ezmap>toolbar>identify1>run_range error");
        });

    }
    function format(v) {

        var num = new Number(v);
        var n = num.toFixed(5);

        if (n <= 0) return 0;

        return n;
    }

    ezmapplus.toolbar.identify1.update_state = function () {

        try {
            var active = ezmapplus.toolbar.identify1.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=identify1]")[0];
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

})(ezmapplus);

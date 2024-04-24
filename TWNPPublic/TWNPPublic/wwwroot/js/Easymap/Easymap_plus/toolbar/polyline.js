

if (ezmapplus.toolbar.polyline == undefined)
    ezmapplus.toolbar.polyline = {};

(function (ezmapplus) {
    ezmapplus.toolbar.polyline.name = 'polyline';
    ezmapplus.toolbar.polyline.on = true;
    ezmapplus.toolbar.polyline.markers = [];
    ezmapplus.toolbar.polyline.start = function () {


        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.polyline.name);
        //# 事件
        var div = ezmapplus.toolbar.map.createDiv('easymap-toolbar-polyline', { x: p[0], y: p[1] });

        div.id = "ezmapplus_toolbar_polyline";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/callength.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "距離測量");
        $(div).bind("click touchstart", function () {

            var isDrawMode = ezmapplus.toolbar.map.isDrawMode();
            if (isDrawMode == true) {
                ezmapplus.toolbar.map.cancelDrawMode();
                ezmapplus.toolbar.update_state();
                return;
            }


            setTimeout(function () {

                ezmapplus.toolbar.map.setDrawMode('polyline', function (e) { //畫完一個

                    //# 計算中心點
                    var points = ezmapplus.toolbar.map.getDrawResult();

                    if (points.length <= 2) return;

                    var x = 0;
                    var y = 0;
                    for (var i = 0; i < points.length; i++) {
                        x += points[i].x;
                        y += points[i].y;
                    }
                    x = x / points.length;
                    y = y / points.length;

                    //# 貼上結果
                    var draw = ezmapplus.toolbar.map.getDrawMeasure();
                    if (ezmapplus.toolbar.polyline.marker != null) {

                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polyline.marker);
                        ezmapplus.toolbar.polyline.marker = null;
                    }

                    var xxyy = new dgXY(x, y);
                    var measure = MM.math.formatFloat(draw.measure, 2);

                    if (measure <= 1000) {
                        measure = measure + "公尺";
                    } else {
                        measure = MM.math.formatFloat((measure / 1000), 2) + "公里";
                    }

                    var marker = new dgMarker(xxyy, "<div style='width:320px;font-weight:bold;color:red;font-size:14px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + measure + "</div>");

                    ezmapplus.toolbar.polyline.markers.push(marker);
                    ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.polyline.markers[ezmapplus.toolbar.polyline.markers.length - 1]);

                    //將測量結果提到最高
                    //measure_top_result();
                    ezmapplus.toolbar.update_state();
                }, function (e) { //# 每次畫

                    //# 計算中心點
                    var points = ezmapplus.toolbar.map.getDrawResult();
                    if (points == null) return;
                    if (points.length <= 2) return;

                    var x = 0;
                    var y = 0;
                    for (var i = 0; i < points.length; i++) {
                        x += points[i].x;
                        y += points[i].y;
                    }
                    x = x / points.length;
                    y = y / points.length;

                    //# 貼上結果
                    var draw = ezmapplus.toolbar.map.getDrawMeasure();
                    if (ezmapplus.toolbar.polyline.marker != null) {

                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polyline.marker);
                        ezmapplus.toolbar.polyline.marker = null;
                    }
                    var xxyy = new dgXY(x, y);
                    var measure = MM.math.formatFloat(draw.measure, 2);

                    if (measure <= 1000) {
                        measure = measure + "公尺";
                    } else {
                        measure = MM.math.formatFloat((measure / 1000), 2) + "公里";
                    }

                    ezmapplus.toolbar.polyline.marker = new dgMarker(xxyy, "<div style='width:320px;font-weight:bold;color:red;font-size:14px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + measure + "</div>");

                    ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.polyline.marker);

                    //將測量結果提到最高
                   // measure_top_result();
                });

                ezmapplus.toolbar.update_state();
            }, 20);

        });

        //# icon hover
        //if(ezmapplus.toolbar.polyline.iconHover != undefined){
        //    $(div).bind("mouseover", function () {
        //        $(this).find("img").attr("src", ezmapplus.toolbar.path + "images/" + ezmapplus.toolbar.polyline.iconHover)
        //    });
        //    $(div).bind("mouseout", function () {
        //        $(this).find("img").attr("src", ezmapplus.toolbar.path + "images/" + ezmapplus.toolbar.polyline.icon)
        //    });
        //}
    }

    ezmapplus.toolbar.polyline.reset = function () {
        if (ezmapplus.toolbar.polyline.markers.length >= 1) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polyline.markers);
            ezmapplus.toolbar.polyline.markers = [];
        }
        if (ezmapplus.toolbar.polyline.marker != null) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polyline.marker);
            ezmapplus.toolbar.polyline.marker = null;
        }
    }
    //更新狀態
    ezmapplus.toolbar.polyline.update_state = function () {

        try{
            var active = map.mm.map.getControlsByClass("EzMap.Control.MeasureToolbar")[0].path.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=callength]")[0];
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
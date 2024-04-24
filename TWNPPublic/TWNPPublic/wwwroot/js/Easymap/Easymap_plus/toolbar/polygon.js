
if (ezmapplus.toolbar.polygon == undefined)
    ezmapplus.toolbar.polygon = {};
(function (ezmapplus) {

    ezmapplus.toolbar.polygon.name = 'polygon';
    ezmapplus.toolbar.polygon.markers = [];
    ezmapplus.toolbar.polygon.on = true;
    ezmapplus.toolbar.polygon.start = function () {

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.polygon.name);
        var div = ezmapplus.toolbar.map.createDiv('easymap-toolbar-polygon', { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_polygon";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/calarea.gif'' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "不規則面積測量");
        $(div).bind("click touchstart", function () {

            var isDrawMode = ezmapplus.toolbar.map.isDrawMode();
            if (isDrawMode == true) {
                ezmapplus.toolbar.map.cancelDrawMode();
                ezmapplus.toolbar.update_state();
                return;
            }

            setTimeout(function () {
                ezmapplus.toolbar.map.setDrawMode('polygon', function (e) { //畫完一個

                    //清掉最後兩點距離
                    if (ezmapplus.toolbar.polygon.lastTwomarker != null) {
                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polygon.lastTwomarker);
                        ezmapplus.toolbar.polygon.lastTwomarker = null;
                    }

                    //# 計算中心點
                    var points = ezmapplus.toolbar.map.getDrawResult();

                    if (points.length <= 4) return;

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
                    if (ezmapplus.toolbar.polygon.marker != null) {

                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polygon.marker);
                        ezmapplus.toolbar.polygon.marker = null;
                    }
                    var xxyy = new dgXY(x, y);
                    var measure = MM.math.formatFloat(draw.measure, 2);

                    if (measure <= (1000 * 1000)) {
                        measure = measure + "平方公尺";
                    } else {
                        measure = MM.math.formatFloat((measure / (1000 * 1000)), 2) + "平方公里";
                    }

                    var marker = new dgMarker(xxyy, "<div style='width:320px;font-weight:bold;color:red;font-size:14px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + measure + "</div>");

                    ezmapplus.toolbar.polygon.markers.push(marker);
                    ezmapplus.toolbar.map.addItem(marker);

                    //將測量結果提到最高
                    //measure_top_result();
                    ezmapplus.toolbar.update_state();
                }, function (e) { //# 每次畫

                    //# 計算中心點
                    var points = ezmapplus.toolbar.map.getDrawResult();

                    if (points == null) return;
                    //# 計算一下最後兩點的距離

                    if (points.length >= 4) {
                        var distance = 0;

                        var l2 = points[points.length - 4];
                        var l1 = points[points.length - 3];
                        distance = ezmapplus.toolbar.map.mm.calDistance(l2, l1);

                        if (distance <= 1000) {
                            distance = MM.math.formatFloat(distance, 2) + "公尺";
                        } else {
                            distance = MM.math.formatFloat((distance / 1000), 2) + "公里";
                        }

                        if (ezmapplus.toolbar.polygon.lastTwomarker != null) {
                            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polygon.lastTwomarker);
                            ezmapplus.toolbar.polygon.lastTwomarker = null;
                        }



                        var center = new dgXY((l1.x + l2.x) / 2, (l1.y + l2.y) / 2);
                        //ezmapplus.measure_i.polygon.lastTwomarker = new dgMarker(center, "<div style='width:320px;font-weight:bold;color:green;font-size:14px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + distance + "</div>");
                        //ezmapplus.measure_i.map.addItem(ezmapplus.measure_i.polygon.lastTwomarker);
                    }

                    if (points.length <= 4) return;

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
                    if (ezmapplus.toolbar.polygon.marker != null) {

                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polygon.marker);
                        ezmapplus.toolbar.polygon.marker = null;
                    }
                    var xxyy = new dgXY(x, y);
                    var measure = MM.math.formatFloat(draw.measure, 2);

                    if (measure <= (1000 * 1000)) {
                        measure = measure + "平方公尺";
                    } else {
                        measure = MM.math.formatFloat((measure / (1000 * 1000)), 2) + "平方公里";
                    }



                    ezmapplus.toolbar.polygon.marker = new dgMarker(xxyy, "<div style='width:320px;font-weight:bold;color:red;font-size:14px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + measure + "</div>");

                    ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.polygon.marker);

                    //將測量結果提到最高
                    //measure_top_result();
                });
                ezmapplus.toolbar.update_state();
            }, 20);
        });
    }

    ezmapplus.toolbar.polygon.reset = function () {

        //# 關閉畫area結果
        if (ezmapplus.toolbar.polygon.markers.length >= 1) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polygon.markers);
            ezmapplus.toolbar.polygon.markers = [];
        }
        if (ezmapplus.toolbar.polygon.marker != null) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polygon.marker);
            ezmapplus.toolbar.polygon.marker = null;
        }
        if (ezmapplus.toolbar.polygon.lastTwomarker != null) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.polygon.lastTwomarker);
            ezmapplus.toolbar.polygon.lastTwomarker = null;
        }
    }

    //更新狀態
    ezmapplus.toolbar.polygon.update_state = function () {

        try {
            var active = map.mm.map.getControlsByClass("EzMap.Control.MeasureToolbar")[0].polygon.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=calarea]")[0];
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
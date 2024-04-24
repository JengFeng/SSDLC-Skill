
if (ezmapplus.toolbar.circle == undefined)
    ezmapplus.toolbar.circle = {};
(function (ezmapplus) {

    ezmapplus.toolbar.circle.name = 'circle';
    ezmapplus.toolbar.circle.on = true;
    ezmapplus.toolbar.circle.markers = [];
    ezmapplus.toolbar.circle.start = function () {

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.circle.name);
        var div = ezmapplus.toolbar.map.createDiv('easymap-toolbar-circle', { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_circle";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/circle.gif'' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "圓面積測量");
        $(div).bind("click touchstart", function () {

            var isDrawMode = ezmapplus.toolbar.map.isDrawMode();
            if (isDrawMode == true ) {
                ezmapplus.toolbar.map.cancelDrawMode();
                ezmapplus.toolbar.update_state();
                return;
            }

            setTimeout(function () {
                ezmapplus.toolbar.map.setDrawMode('circle', function (e) { //畫完一個
                    var isDrawMode = ezmapplus.toolbar.map.isDrawMode();
                    if (isDrawMode == false && e == null) {
                        ezmapplus.toolbar.map.cancelDrawMode();
                        ezmapplus.toolbar.update_state();
                        return;
                    }
                    //# 計算中心點
                    var points = ezmapplus.toolbar.map.getDrawResult();
                    var info = ezmapplus.toolbar.map.getDrawMeasure();

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
                    var draw = map.getDrawMeasure();
                    if (ezmapplus.toolbar.circle.marker != null) {

                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.circle.marker);
                        ezmapplus.toolbar.circle.marker = null;
                    }
                    var xxyy = new dgXY(x, y);
                    var measure = MM.math.formatFloat(draw.measure, 2);

                    if (measure <= (1000 * 1000)) {
                        measure = "面積" + measure + "平方公尺";
                    } else {
                        measure = "面積" + MM.math.formatFloat((measure / (1000 * 1000)), 2) + "平方公里";
                    }

                    var radius = info.radius;

                    if (radius <= 1000) {
                        radius = "半徑" + radius + "公尺";
                    } else {
                        radius = "半徑" + MM.math.formatFloat((radius / 1000), 2) + "公里";
                    }

                    var marker = new dgMarker(xxyy, "<div style='width:320px;font-weight:bold;color:red;font-size:14px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + radius + "<br/>" + measure + "</div>");

                    ezmapplus.toolbar.circle.markers.push(marker);
                    ezmapplus.toolbar.map.addItem(marker);

                    //將測量結果提到最高
                    //measure_top_result();
                    ezmapplus.toolbar.update_state();
                }, function (e) { //# 每次畫
                    
                    var isDrawMode = ezmapplus.toolbar.map.isDrawMode();
                    if (isDrawMode == false && e == null) {
                        ezmapplus.toolbar.map.cancelDrawMode();
                        ezmapplus.toolbar.update_state();
                        return;
                    }

                    //# 計算中心點
                    var points = ezmapplus.toolbar.map.getDrawResult();
                    var info = ezmapplus.toolbar.map.getDrawMeasure();
                    if (points == null) return;
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

                    var xxyy = new dgXY(x, y);
                    var measure = MM.math.formatFloat(draw.measure, 2);

                    if (measure <= (1000 * 1000)) {
                        measure = measure + "平方公尺";
                    } else {
                        measure = MM.math.formatFloat((measure / (1000 * 1000)), 2) + "平方公里";
                    }


                    //# 畫半徑
                    if (ezmapplus.toolbar.circle.line != null) {

                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.circle.line);
                        ezmapplus.toolbar.circle.line = null;
                    }

                    var points = [];
                    points.push(new dgXY(info.start.lon, info.start.lat));
                    points.push(new dgXY(info.end.lon, info.end.lat));
                    ezmapplus.toolbar.circle.line = new dgPolyline(points, "rgba(200,0,0,0.8)", 2);

                    ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.circle.line);

                    //# 半徑文字
                    if (ezmapplus.toolbar.circle.marker != null) {
                        ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.circle.marker);
                        ezmapplus.toolbar.circle.marker = null;
                    }

                    var radius = info.radius;

                    if (radius <= 1000) {
                        radius = "半徑" + radius + "公尺";
                    } else {
                        radius = "半徑" + MM.math.formatFloat((radius / 1000), 2) + "公里";
                    }

                    ezmapplus.toolbar.circle.marker = new dgMarker(xxyy, "<div style='width:320px;font-weight:bold;color:red;font-size:14px;text-shadow: 0px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'>" + radius + "</div>");
                    ezmapplus.toolbar.map.addItem(ezmapplus.toolbar.circle.marker);

                    //將測量結果提到最高
                    //measure_top_result();
                });
                ezmapplus.toolbar.update_state();
            }, 20);
            
        });
    }

    ezmapplus.toolbar.circle.reset = function () {

        //# 圓
        if (ezmapplus.toolbar.circle.marker != null) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.circle.marker);
            ezmapplus.toolbar.circle.marker = null;
        }
        if (ezmapplus.toolbar.circle.markers.length >= 1) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.circle.markers);
            ezmapplus.toolbar.circle.markers = [];
        }
    }

    //更新狀態
    ezmapplus.toolbar.circle.update_state = function () {

        try {
            var active = map.mm.map.getControlsByClass("EzMap.Control.MeasureToolbar")[0].circle.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=circle]")[0];
            if (active === true) {
                t.className = "active";
                $(t).css('background-color', ezmapplus.toolbar.active_backgroundcolor);
                //$(t).css('border', '1px solid #880015');
                $(t).css('border-radius', '4px');
            }
            if (active === false || active == null) {
                t.className = "";
                $(t).css('background-color', '');
                $(t).css('border', '0px solid #ff0000');
                $(t).css('border-radius', '0px');
            }
        } catch (err) {

        }
    }
})(ezmapplus);
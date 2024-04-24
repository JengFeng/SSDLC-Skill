



(function (coordinate) {
    
    coordinate.map = null;

    coordinate.window = null;

    coordinate.marker = null;

    //按下查詢
    coordinate.run = function () {

        var coord = new CoordTrans();

        var t = $("#coordinate-format option:selected").val();
        var x = $("#coordinate-txt-x").val();
        //var y = $("#coordinate-txt-y").val();

        //格式檢查
        if (!x) {
            alert("尚未輸入查詢的點位");
            return;
        }
        if (x.indexOf(',') <= 0) {
            alert("經緯度或XY格式錯誤(範例:120.64681,24.180936)");
            return;
        }

        var xy = x.split(',');

        var x = xy[0];
        var y = xy[1];

        x = parseFloat(x);
        y = parseFloat(y);

        //轉換
        coord.from(x, y, t);

        var TWD67 = coord.toTWD67();
        var TM2_67 = coord.toTM2_67();
        var WGS84 = coord.toWGS84();
        var TM2_97 = coord.toTM2_97();


        //顯示
        var html = "";

        html = "<font color='gray'>TWD67經緯度:</font>" + TWD67.x + "," + TWD67.y;
        html += "<br/><font color='gray'>TWD67二度分帶:</font>" + TM2_67.x + "," + TM2_67.y;
        html += "<br/><font color='gray'>TWD97(WGS84)經緯度:</font>" + WGS84.x + "," + WGS84.y;
        html += "<br/><font color='gray'>TWD97二度分帶:</font>" + TM2_97.x + "," + TM2_97.y;

        $("#coordinate-result").slideDown();

        $("#coordinate-result-content").empty();
        $("#coordinate-result-content")[0].innerHTML = html;

        if (coordinate.is_zoom_map === true) {

            if (coordinate.map == null) return;

            //marker 
            if (coordinate.marker != null) {

                coordinate.map.removeItem(coordinate.map);
            }
            var icon = new coordinate.window.dgIcon("data:image/png;base64,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", 32, 32);
            var xxyy = new coordinate.window.dgXY(WGS84.x, WGS84.y);
            coordinate.marker = new coordinate.window.dgMarker(xxyy, icon);

            var x = MM.math.formatFloat(WGS84.x, 5);
            var y = MM.math.formatFloat(WGS84.y, 5);

            coordinate.marker.setContent("<h3>" + x+","+y + "</h3>");
            coordinate.map.addItem(coordinate.marker);


            //zoomto
            if (coordinate.map.getZoom() >= coordinate.default_zoom) {
                coordinate.map.zoomToXY(xxyy, coordinate.map.getZoom());
            } else {
                coordinate.map.zoomToXY(xxyy, coordinate.default_zoom);
            }
            
        }
    }
})(coordinate);



if (ezmapplus.toolbar.river == undefined)
    ezmapplus.toolbar.river = {};//河川公地查詢
(function (ezmapplus) {


    var left = ezmapplus.toolbar.river.position[0];
    var top = ezmapplus.toolbar.river.position[1];

    ezmapplus.toolbar.river.on = true;
    ezmapplus.toolbar.river.markers = [];
    ezmapplus.toolbar.river.start = function () {

        var div = ezmapplus.toolbar.map.createDiv(null, { x: left, y: top });
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/river.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "河川地查詢");
        $(div).bind("click touchstart", function () {
            _RmapOrRiver = "river";

            if (ef.isMobile == false) {
                ezmapplus.toolbar.map.attachEvent('onmousedown', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('onmousedown', measure_identify0); ////重新設定onmousedown事件
            } else {
                setTimeout(function () {
                    ezmapplus.toolbar.map.attachEvent('touchstart', null); //先將原有的onmousedown事件清除
                    ezmapplus.toolbar.map.attachEvent('touchstart', measure_identify0); ////重新設定onmousedown事件
                }, 300);

            }
        });
    }

    function measure_identify0(e) {

        var apoint = ezmapplus.toolbar.map.revXY(e.clientX, e.clientY); //取得事件的坐標，並將坐標轉換成TM2坐標

        //map.openInfoWindow(apoint, apoint.x + "," + apoint.y); //顯示訊息
        if (ezmapplus.toolbar.isMobile == false) {
            ezmapplus.toolbar.map.attachEvent('onmousedown', null); //先將原有的onmousedown事件清除
        } else {
            ezmapplus.toolbar.map.attachEvent('touchstart', null); //先將原有的onmousedown事件清除
        }
        //gerry service is TM2 67
        var o = ezmapplus.toolbar.map.coordTrans(apoint.x, apoint.y, "WGS84");
        var resultxy = o.toTM2_67();

        mask_enable();

        ////ajax to get data
        var tmp = {};
        tmp.obj = resultxy;
        $.ajax({
            url: "webpages/DrawMap_Identify.ashx?x=" + resultxy.x + "&y=" + resultxy.y + "&t=" + _RmapOrRiver,
            type: "get",
            dataType: 'text',
            timeout: 10 * 1000,
            success: function (ArrStr) {

                mask_disable();

                //開啟圖層
                switch (_RmapOrRiver) {
                    case "rmap"://農田坵塊圖
                        ezlayer.checkRmap();
                        break;
                    case "river"://河川公地圖
                        ezlayer.checkByName("河川公地圖", true);
                        break;
                }

                if (ArrStr == "" || ArrStr.length <= 0) return;


                var id_result = ArrStr.split("^");

                if (id_result.length <= 0) return;

                var nameArr = id_result[0].split(",");
                var section = nameArr[0];
                var landno = nameArr[1];

                //座標轉換
                var point = tmp.obj;
                var o = parent.map.coordTrans(point.x, point.y, "TM2_67");
                var point = o.toWGS84();

                //popup
                measure_identify1(point, section, landno);

                //polygon
                measure_identify2(id_result[1]);

                //zoomto
                //var z = map.getZoom();
                //if (z <= 17) {
                //    var xxyy = new dgXY(point.x, point.y);
                //    map.zoomToXY(xxyy, 17);
                //} else {
                //    var xxyy = new dgXY(point.x, point.y);
                //    map.zoomToXY(xxyy, z);
                //}
            },

            error: function (xhr, ajaxOptions, thrownError) {

                alert("請重新操作一次");
                console.error("map_identify:" + xhr);
                mask_disable();
            }
        });
    }
    function measure_identify1(point, section, landno) {


        $.ajax({
            url: "webpages/DrawMap_getSection.ashx?sid=" + section,
            type: "get",
            dataType: 'text',
            timeout: 15 * 1000,
            success: function (sectionstr) {

                //顯示訊息

                var xxyy = new parent.dgXY(point.x, point.y);
                try {
                    ezmapplus.toolbar.map.openInfoWindow(xxyy, sectionstr + landno);
                } catch (err) {
                    console.error(err);
                }
                mask_disable();
            },

            error: function (xhr, ajaxOptions, thrownError) {
                mask_disable();
            }
        });
    }
    var _ez_measure_polygon = null;
    function measure_identify2(pointstr) {

        if (_ez_measure_polygon != null) {
            ezmapplus.toolbar.map.removeItem(_ez_measure_polygon);
            _ez_measure_polygon = null;
        }

        var tmPoints = pointstr.split(",");

        var tmpCount = tmPoints.length;
        if (tmPoints.length % 2 > 0) {
            tmpCount = tmPoints.length - 1;
        }
        var A_pps = [];
        for (i = 0; i < tmpCount; i = i + 2) {
            var o = ezmapplus.toolbar.map.coordTrans(tmPoints[i], tmPoints[i + 1], "TM2_67");
            var resultxy = o.toWGS84();
            A_pps.push(new parent.dgXY(resultxy.x, resultxy.y));
        }
        mypoints = A_pps;
        _ez_measure_polygon = new parent.dgPolygon(mypoints, "rgba(0,0,200,0.7)", "rgba(0,0,160,0.3)", 3);

        try {
            ezmapplus.toolbar.map.addItem(_ez_measure_polygon);
        } catch (err) {
            console.error(err);
        }
    }
})(ezmapplus);
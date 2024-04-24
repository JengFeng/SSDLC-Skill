
if (ezmapplus.toolbar.coordinate == undefined)
    ezmapplus.toolbar.coordinate = {};//坐標查詢
(function (ezmapplus) {

    var left = ezmapplus.toolbar.coordinate.position[0];
    var top = ezmapplus.toolbar.coordinate.position[1];

    ezmapplus.toolbar.coordinate.on = true;
    ezmapplus.toolbar.coordinate.start = function () {
        var div = map.createDiv(null, { x: left, y: top });
        div.id = "ezmapplus_toolbar_coordinate";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/identify.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "坐標查詢");

        $(div).bind("click touchstart", function () {
            setTimeout(function () {

                panel('F_coordinate', ezmapplus.toolbar.path + 'coordinate.aspx', '坐標查詢');
            }, 200);
        });
    }

})(ezmapplus);
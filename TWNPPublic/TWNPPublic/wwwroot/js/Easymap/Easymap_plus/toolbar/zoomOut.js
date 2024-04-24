
			
OpenLayers.Control.CustomNavToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {

    initialize: function (options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([
          new EzMap.Control.ZoomBox({
              alwaysZoom: false,
              zoomOnClick: false,
              out: true,
              afterzoom: function () {
                  ezmapplus.toolbar.zoomOut.deactivate();
              }
          })
        ]);
        // To make the custom navtoolbar use the regular navtoolbar style
        this.displayClass = 'olControlNavToolbar'
    },


    /**
     * Method: draw 
     * calls the default draw, and then activates mouse defaults.
     */
    draw: function () {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        this.defaultControl = this.controls[0];
        return div;
    }
});
if (ezmapplus.toolbar.zoomOut == undefined)
    ezmapplus.toolbar.zoomOut = {};
(function (ezmapplus) {

    ezmapplus.toolbar.zoomOut.name = 'zoomOut';
    ezmapplus.toolbar.zoomOut.on = true;
    ezmapplus.toolbar.zoomOut.markers = [];

    ezmapplus.toolbar.zoomOut.switch = false;//開關
    ezmapplus.toolbar.zoomOut.panel = null;//主要控制的
    ezmapplus.toolbar.zoomOut.button_div = null;//按鈕
    ezmapplus.toolbar.zoomOut.start = function () {


        ezmapplus.toolbar.zoomOut.panel = new OpenLayers.Control.CustomNavToolbar();

        ezmapplus.toolbar.map.mm.map.addControl(ezmapplus.toolbar.zoomOut.panel);

        ezmapplus.toolbar.zoomOut.panel.div.style.display = "none";
        ezmapplus.toolbar.zoomOut.panel.deactivate();
        ezmapplus.toolbar.zoomOut.switch = false;

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.zoomOut.name);
        var div = ezmapplus.toolbar.map.createDiv(null, { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_zoomOut";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/zoomOut.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "縮小");
        ezmapplus.toolbar.zoomOut.button_div = div;
        $(div).bind("click touchstart", function () {

            //如果zoomIn已經開啟了，先關掉
            if (ezmapplus.toolbar.zoomIn.on) {
                if (ezmapplus.toolbar.zoomIn.switch === true) {
                    ezmapplus.toolbar.zoomIn.deactivate();
                }
            }

            if (ezmapplus.toolbar.zoomOut.switch === false) {


                ezmapplus.toolbar.zoomOut.panel.activate();
                ezmapplus.toolbar.zoomOut.switch = true;
                ezmapplus.toolbar.update_state();
            } else {

                ezmapplus.toolbar.zoomOut.deactivate();
            }

        });
    }
    ezmapplus.toolbar.zoomOut.deactivate = function () {

        var nav = ezmapplus.toolbar.map.mm.map.getControl("_MAIN_NAVIGATION_");

        ezmapplus.toolbar.zoomOut.panel.deactivate();
        ezmapplus.toolbar.zoomOut.switch = false;
        ezmapplus.toolbar.update_state();
    }

    //更新狀態
    ezmapplus.toolbar.zoomOut.update_state = function () {

        try {
            var active = ezmapplus.toolbar.zoomOut.switch;
            var t = $(".easymap_plus_measure_tooltip > img[src*=zoomOut]")[0];
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
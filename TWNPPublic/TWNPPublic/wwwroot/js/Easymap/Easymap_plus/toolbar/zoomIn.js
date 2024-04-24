
			
OpenLayers.Control.CustomNavToolbarIn = OpenLayers.Class(OpenLayers.Control.Panel, {

    initialize: function (options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([
          new EzMap.Control.ZoomBox({
              alwaysZoom: false,
              zoomOnClick: false,
              out: false,
              afterzoom: function () {
                  ezmapplus.toolbar.zoomIn.deactivate();
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
if (ezmapplus.toolbar.zoomIn == undefined)
    ezmapplus.toolbar.zoomIn = {};
(function (ezmapplus) {

    ezmapplus.toolbar.zoomIn.name = 'zoomIn';
    ezmapplus.toolbar.zoomIn.on = true;
    ezmapplus.toolbar.zoomIn.markers = [];

    ezmapplus.toolbar.zoomIn.switch = false;//開關
    ezmapplus.toolbar.zoomIn.panel = null;//主要控制的
    ezmapplus.toolbar.zoomIn.button_div = null;//按鈕
    ezmapplus.toolbar.zoomIn.start = function () {


        ezmapplus.toolbar.zoomIn.panel = new OpenLayers.Control.CustomNavToolbarIn();

        ezmapplus.toolbar.map.mm.map.addControl(ezmapplus.toolbar.zoomIn.panel);

        ezmapplus.toolbar.zoomIn.panel.div.style.display = "none";
        ezmapplus.toolbar.zoomIn.panel.deactivate();
        ezmapplus.toolbar.zoomIn.switch = false;

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.zoomIn.name);
        var div = ezmapplus.toolbar.map.createDiv(null, { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_zoomIn";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/zoomIn.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "放大");
        ezmapplus.toolbar.zoomIn.button_div = div;
        $(div).bind("click touchstart", function () {

            //如果zoomOut已經開啟了，先關掉
            if (ezmapplus.toolbar.zoomOut.on) {
                if (ezmapplus.toolbar.zoomOut.switch === true) {
                    ezmapplus.toolbar.zoomOut.deactivate();
                }
            }

            if (ezmapplus.toolbar.zoomIn.switch === false) {


                ezmapplus.toolbar.zoomIn.panel.activate();
                ezmapplus.toolbar.zoomIn.switch = true;
                ezmapplus.toolbar.update_state();
            } else {

                ezmapplus.toolbar.zoomIn.deactivate();
            }

        });
    }
    ezmapplus.toolbar.zoomIn.deactivate = function () {
        var nav = ezmapplus.toolbar.map.mm.map.getControl("_MAIN_NAVIGATION_");

        ezmapplus.toolbar.zoomIn.panel.deactivate();
        ezmapplus.toolbar.zoomIn.switch = false;
        ezmapplus.toolbar.update_state();
    }

    //更新狀態
    ezmapplus.toolbar.zoomIn.update_state = function () {

        try {
            var active = ezmapplus.toolbar.zoomIn.switch;
            var t = $(".easymap_plus_measure_tooltip > img[src*=zoomIn]")[0];
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
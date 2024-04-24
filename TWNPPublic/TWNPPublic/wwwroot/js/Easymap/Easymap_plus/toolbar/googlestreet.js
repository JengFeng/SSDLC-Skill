
if (ezmapplus.toolbar.googlestreet == undefined)
    ezmapplus.toolbar.googlestreet = {};
(function (ezmapplus) {

    ezmapplus.toolbar.googlestreet.name = 'googlestreet';
    ezmapplus.toolbar.googlestreet.on = true;

    //click icon
    ezmapplus.toolbar.googlestreet.start = function () {
        
        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.googlestreet.name);
        var div = ezmapplus.toolbar.map.createDiv(null, { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_googlestreet";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/googlestreet.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "google街景");

        //# click map
        $(div).bind("click touchstart", function () {
            
            if (ezmapplus.toolbar.googlestreet.active == true) {
                ezmapplus.toolbar.googlestreet.active = false;
                ezmapplus.toolbar.update_state();
                ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                return;
            } else {
                ezmapplus.toolbar.googlestreet.active = true;
                ezmapplus.toolbar.update_state();
            }

            if (ezmapplus.toolbar.isMobile == false) {
                ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('onmouseup', function (e) { //重新設定onmousedown事件
                    ezmapplus.toolbar.map.attachEvent('onmouseup', null); //先將原有的onmousedown事件清除
                    

                    //# 點圖片不算
                    if (e.target.tagName.toLowerCase() == "img") return;

                    ezmapplus.toolbar.googlestreet.active = false;


                    var apoint = ezmapplus.toolbar.map.revXY(e.clientX, e.clientY); //取得事件的坐標，並將坐標轉換成TM2坐標

                    var x = 0;
                    var y = 0;

                    x = format(apoint.x);
                    y = format(apoint.y);

                    var url = "https://www.google.com/maps?q&layer=c&cbll=" + y + "," + x + "&hl=zh-TW";

                    window.open(url);

                    ezmapplus.toolbar.update_state();
                });
            } else {
                ezmapplus.toolbar.map.attachEvent('touchend', null); //先將原有的onmousedown事件清除
                ezmapplus.toolbar.map.attachEvent('touchend', function (e) { //重新設定onmousedown事件
                    ezmapplus.toolbar.map.attachEvent('touchend', null); //先將原有的onmousedown事件清除
                    

                    //# 點圖片不算
                    if (e.target.tagName.toLowerCase() == "img") return;

                    ezmapplus.toolbar.googlestreet.active = false;

                    var p = $(ezmapplus.toolbar.map.div).position();

                    var left = e.changedTouches[0].pageX;
                    var top = e.changedTouches[0].pageY;
                    var apoint = ezmapplus.toolbar.map.revXY(left, top); //取得事件的坐標，並將坐標轉換成TM2坐標

                    var x = 0;
                    var y = 0;

                    x = format(apoint.x);
                    y = format(apoint.y);

                    var url = "https://www.google.com/maps?q&layer=c&cbll=" + y + "," + x + "&hl=zh-TW";

                    window.open(url);

                    ezmapplus.toolbar.update_state();
                });
            }
        });
    }

    ezmapplus.toolbar.googlestreet.update_state = function () {

        try {
            var active = ezmapplus.toolbar.googlestreet.active;
            var t = $(".easymap_plus_measure_tooltip > img[src*=googlestreet]")[0];
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

    function format(v) {

        var num = new Number(v);
        var n = num.toFixed(5);

        if (n <= 0) return 0;

        return n;
    }
})(ezmapplus);
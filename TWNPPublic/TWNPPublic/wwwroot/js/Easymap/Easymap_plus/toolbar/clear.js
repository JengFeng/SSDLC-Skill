
if (ezmapplus.toolbar.clear == undefined)
    ezmapplus.toolbar.clear = {};
(function (ezmapplus) {

    ezmapplus.toolbar.clear.onClearComplete = null;//清除完成觸發事件
    ezmapplus.toolbar.clear.onClearCompletes = [];//可以多個:清除完成觸發事件
    ezmapplus.toolbar.clear.name = 'clear';
    ezmapplus.toolbar.clear.on = true;
    ezmapplus.toolbar.clear.start = function () {

        var x = 0;
        var y = 0;
        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.clear.name);
        var div = ezmapplus.toolbar.map.createDiv('easymap-toolbar-clear', { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_clear";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/clear.gif'' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "清除結果");
        $(div).bind("click touchstart", function () {

            try {
                if (ezmapplus.toolbar.map.mm.measure.isActive() == true) {

                    $.notify("尚未完成目前測量，無法清除結果", "warn");
                    return;
                }
            } catch (err) { }

            setTimeout(function () {

                try{
                    //# 刪除畫圖
                    ezmapplus.toolbar.map.clearDraw();

                    //# 刪除圖層
                    ezmapplus.toolbar.reset_air();

                    //# 刪除地籍
                    ezmapplus.toolbar.reset_rmap();

                    //# 刪bbox
                    reset_bbox();

                    //# 關閉popup
                    ezmapplus.toolbar.map.closeInfoWindow()

                    //# abort ajax
                    ezmapplus.toolbar.abort_ajax();
                
                    //# run all reset
                    reset_all();
                } catch (err) { }

                //# 清除gps 標記
                try {
                    if (ezmapplus.GPS != null) {
                        ezmapplus.GPS.clearPoint();
                    }
                } catch (err) { }

                
                //清除成功觸發事件
                if (ezmapplus.toolbar.clear.onClearComplete != null) {
                    ezmapplus.toolbar.clear.onClearComplete();
                }
                if (ezmapplus.toolbar.clear.onClearCompletes.length > 0) {
                    for (var i = 0; i < ezmapplus.toolbar.clear.onClearCompletes.length; i++) {
                        ezmapplus.toolbar.clear.onClearCompletes[i]();
                    }
                }
            }, 100);
        });
    }

    //刪bbox
    function reset_bbox() {
        if (ezmapplus.toolbar.bbox != null) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.bbox);
            ezmapplus.toolbar.bbox = null;
        }
    }
    function reset_all() {

        for (var prop in ezmapplus.toolbar) {

            if (typeof ezmapplus.toolbar[prop] === 'object') {

                if (ezmapplus.toolbar[prop] == null) continue;
                if (ezmapplus.toolbar[prop].on !== undefined && ezmapplus.toolbar[prop].on === true) {

                    if (ezmapplus.toolbar[prop].reset != undefined){
                        ezmapplus.toolbar[prop].reset();
                    }
         
                }
            }

        }
    }



})(ezmapplus);
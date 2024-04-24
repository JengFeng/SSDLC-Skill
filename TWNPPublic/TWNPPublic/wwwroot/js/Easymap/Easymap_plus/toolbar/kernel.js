
ezmapplus.toolbar.active_backgroundcolor = 'rgb(255, 0, 35)';
(function (ezmapplus) {


    ezmapplus.toolbar.getMapControlV = false;
    ezmapplus.toolbar.getMapTypeSelectorV = false;


    //# kernel
    ezmapplus.toolbar.set_map = function (map) {
        ezmapplus.toolbar.map = map;

        ezmapplus.toolbar.getMapControlV = map.getMapControlV();
        ezmapplus.toolbar.getMapTypeSelectorV = map.getMapTypeSelectorV();
    }

    ezmapplus.toolbar.start = function () {

        
        for (var prop in ezmapplus.toolbar) {

            if (typeof ezmapplus.toolbar[prop] === 'object') {

                if (ezmapplus.toolbar[prop] == null) continue;
                if (ezmapplus.toolbar[prop].on !== undefined && ezmapplus.toolbar[prop].on === true) {

                    ezmapplus.toolbar[prop].start();
                }
            }
            
        }

        //按鈕的提示
        tooltip();

        ezmapplus.toolbar.hover();
    }
    //更新每個tool的state:畫外框
    ezmapplus.toolbar.update_state = function () {
        for (var prop in ezmapplus.toolbar) {

            if (typeof ezmapplus.toolbar[prop] === 'object') {

                if (ezmapplus.toolbar[prop] == null) continue;
                if (ezmapplus.toolbar[prop].on !== undefined && ezmapplus.toolbar[prop].on === true) {

                    if (ezmapplus.toolbar[prop].update_state != undefined) {

                        if (ezmapplus.toolbar.disable_update_state == false) {
                            ezmapplus.toolbar[prop].update_state();
                        }
                        


                        //# 事件
                        if (ezmapplus.toolbar[prop].active!= undefined){
                            if (ezmapplus.toolbar[prop].active == true) {
                                if (ezmapplus.toolbar[prop].iconclick != null) {
                                    ezmapplus.toolbar[prop].iconclick();
                                }
                            }
                            if (ezmapplus.toolbar[prop].active == false) {
                                if (ezmapplus.toolbar[prop].mapclick != null) {
                                    ezmapplus.toolbar[prop].mapclick();
                                }
                            }
                        }
                    }
                }
            }

        }
    }

    //看看那些需要hover
    ezmapplus.toolbar.hover = function () {

        //按鈕hover
        for (var prop in ezmapplus.toolbar) {

            if (typeof ezmapplus.toolbar[prop] === 'object') {

                if (ezmapplus.toolbar[prop] == null) continue;
                if ($("#ezmapplus_toolbar_" + prop).length <= 0) continue;

                if (ezmapplus.toolbar[prop].icon !== undefined) {
                    $("#ezmapplus_toolbar_" + prop).find("img").attr("src", ezmapplus.toolbar.path + "images/" + ezmapplus.toolbar[prop].icon);
                }
                if (ezmapplus.toolbar[prop].iconHover !== undefined) {

                    $("#ezmapplus_toolbar_"+prop).bind("mouseover", function () {
                        $(this).find("img").attr("src", ezmapplus.toolbar.path + "images/" + ezmapplus.toolbar[this.id.split("_")[2]].iconHover)
                    });
                    $("#ezmapplus_toolbar_" + prop).bind("mouseout", function () {
                        $(this).find("img").attr("src", ezmapplus.toolbar.path + "images/" + ezmapplus.toolbar[this.id.split("_")[2]].icon)
                    });

                }
            }

        }
    }
    function tooltip() {
        //# tooltip
        $('.easymap_plus_measure_tooltip').powerTip({ followMouse: true });

        // mouse-on examples
        $('.easymap_plus_measure_tooltip').powerTip({ placement: 'se' });
        $('.easymap_plus_measure_tooltip').powerTip({
            placement: 'se',
            mouseOnToPopup: true,
            fadeInTime: 160,
            fadeOutTime: 20
        });
        $("#powerTip").css("font-size", "14px");
        $("#powerTip").css("font-family", "Microsoft JhengHei");
        $("#powerTip").css("padding", "4px");
    }

    //輸入功能回傳位置
    ezmapplus.toolbar.get_position = function (tool) {

        var offset = ezmapplus.toolbar.positionOffset;

        var p = [];
        p[0] = ezmapplus.toolbar.position[0];
        p[1] = ezmapplus.toolbar.position[1];
        for (var i = 0; i < ezmapplus.toolbar.tools.length; i++) {
            if (ezmapplus.toolbar.tools[i] == tool) {
                
                p [0] = ezmapplus.toolbar.position[0] + (offset*i);
                break;
            }
        }
        return p;
    }
    //開啟控制項
    ezmapplus.toolbar.show_control = function() {
        ezmapplus.toolbar.map.setMapControlV(ezmapplus.toolbar.getMapControlV);       //工具列
        ezmapplus.toolbar.map.setMapTypeSelectorV(ezmapplus.toolbar.getMapTypeSelectorV);  //多主題圖
        $(".MMControlcreateDiv img").show();
    }
    //關閉控制項
    ezmapplus.toolbar.hide_control = function() {
        ezmapplus.toolbar.map.setMapControlV(false);       //工具列
        ezmapplus.toolbar.map.setMapTypeSelectorV(false);  //多主題圖
        $(".MMControlcreateDiv img").hide();                 //按鈕
    }
    //刪除航照圖
    ezmapplus.toolbar.reset_air = function() {
        if (ezmapplus.toolbar.source != null) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.source);
            ezmapplus.toolbar.source = null;
        }
    }
    //刪地籍圖
    ezmapplus.toolbar.reset_rmap = function() {
        if (ezmapplus.toolbar.rmap != null) {
            ezmapplus.toolbar.map.removeItem(ezmapplus.toolbar.rmap);
            ezmapplus.toolbar.rmap = null;
        }

    }
    //錯誤處裡
    ezmapplus.toolbar.error = function () {
        $("#ezmapplus_measure_i_window_history")[0].innerHTML = "<h5>抱歉!發生未知的錯誤，請重新操作一次</h5>";
    }
    //關閉ajax連線
    ezmapplus.toolbar.abort_ajax = function() {
        if (ezmapplus.toolbar.ajaxHandler_history != null) {
            ezmapplus.toolbar.ajaxHandler_history.abort();
        }
    }
    //將測量結果提到最高
    function measure_top_result() {
        return;
        //# 測量結果提到最高
        try {
            ezmapplus.measure_i.map.olmap.setLayerIndex(ezmapplus.measure_i.map.olmap.getLayersByName("_MM_LAYER_MEASURE_")[0], 10000);
        } catch (err) { }


        var markers = null;
        markers = map.olmap.getLayersByClass("OpenLayers.Layer.Markers");
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            ezmapplus.measure_i.map.olmap.setLayerIndex(marker, 10000000 + i);
        }

    }

    var isMobile = false;
    function is_mobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }
    isMobile = is_mobile();


    ezmapplus.toolbar.isMobile = isMobile;

})(ezmapplus);

if (ezmapplus.toolbar.snapshot == undefined)
    ezmapplus.toolbar.snapshot = {};
(function (ezmapplus) {

    ezmapplus.toolbar.snapshot.name = 'snapshot';
    ezmapplus.toolbar.snapshot.on = true;
    ezmapplus.toolbar.snapshot.start = function () {

        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.snapshot.name);
        var div = ezmapplus.toolbar.map.createDiv(null, { x: p[0], y: p[1] });
        div.id = "ezmapplus_toolbar_snapshot";
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/convert.gif' width='" + ezmapplus.toolbar.iconSize[0] + "' height='" + ezmapplus.toolbar.iconSize[1] + "'/>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "匯出圖片");

        $(div).bind("click touchstart", function () {
            setTimeout(function () {
                run();
            }, 100);
        });
    }
    function run() {

        MM.mask.show();

        //# 關閉控制項
        ezmapplus.toolbar.hide_control();

        ///第一次載入先把目前的畫面擷取一張
        var value = ezmapplus.toolbar.map.olmap.div.innerHTML;
        var w = ezmapplus.toolbar.map.getWidth();
        var h = ezmapplus.toolbar.map.getHeight();

        //# 讓scaleline不會至bottom
        value = "<div style='height:" + h + "px'>" + value + "</div>";

        value = escape(value);


        $.ajax({
            url: "http://59.120.223.172/snapshot/go.ashx",
            data: { c: value, w: w, h: h, PageNum: "" },
            type: "POST",
            dataType: 'text',
            timeout: 30 * 1000,
            success: function (text) {

                //# 開啟控制項
                ezmapplus.toolbar.show_control();

                //# 解除鎖定
                MM.mask.hide();

                //# 下載
                var json = $.parseJSON(text)
                if (MM.isIE() == true) {
                    window.location.href = ezmapplus.toolbar.path + "snapshot/download.ashx?url=" + json.url;

                } else {

                    var a = document.createElement('a');
                    a.id = 'mm_iframe_used_for_download';
                    a.href = json.url;
                    a.setAttribute("download", "map_" + new Date().yyyyMMddHHmmss() + ".png");
                    a.innerText = "download";
                    a.target = '_blank';
                    document.getElementsByTagName("body")[0].appendChild(a);


                    $("#mm_iframe_used_for_download")[0].click();
                    $("#mm_iframe_used_for_download").remove();
                }
                MM.alert("圖片已產生");
            },

            error: function (xhr, ajaxOptions, thrownError) {

                //# 開啟控制項
                ezmapplus.toolbar.show_control();

                MM.mask.hide();

                $.notify("非常抱歉，圖片產製失敗，等待後請重新操作", "info");
            }
        });
    }
})(ezmapplus);
//example:
/*

*/
/// 該檔只能在 /js/mmjs/ 下，因為要用ajax讀相對路徑的資料
/// include 
///         jquery.js
///         MM.ajax
///         modules/ezlayer/*

var r = new RegExp("(^|(.*?\\/))(" + "ezlayer.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');
    if (src == null) continue;
    if (src.toLowerCase().indexOf("mmjs") < 0) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}
///////////////////////////////////////
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

if (MM.ajax == undefined){
    document.write('<script src="'+l+'ajax.js"></script>');
}

(function (ajax) {

     
    MM.ezlayer = {};
    MM.ezlayer.path = l.substring(0, l.indexOf("js"));
    //取得所有圖層
    MM.ezlayer.get_layers = function (success_callback,fail_callback) {

        //# 開始處裡資料
        MM.ajax.url = MM.ezlayer.path + "modules/ezlayer/services/service.aspx/get_layers";
        MM.ajax.success = function (m) {
            var layers = [];
            var xml = $.parseXML(m);
            $(xml).find("NewDataSet").find("Table").each(function () {

                var LAYER_SN = $(this).find("LAYER_SN").eq(0).text();
                var NAME = $(this).find("NAME").eq(0).text();
                var TYPES = $(this).find("TYPES").eq(0).text();
                var PATH = $(this).find("PATH").eq(0).text();
                var ICON = $(this).find("ICON").eq(0).text();
                var MAXZ = $(this).find("MAXZ").eq(0).text();
                var MINZ = $(this).find("MINZ").eq(0).text();
                var LAYER = $(this).find("LAYER").eq(0).text();
                var LEGEND = $(this).find("LEGEND").eq(0).text();

                MAXZ = parseInt(MAXZ);
                MINZ = parseInt(MINZ);

                LAYER_SN = parseInt(LAYER_SN);
 
                var obj = {
                    id: LAYER_SN,
                    LAYER_SN: LAYER_SN,
                    NAME: NAME,
                    TYPES: TYPES,
                    PATH: PATH,
                    ICON: ICON,
                    MAXZ: MAXZ,
                    MINZ: MINZ,
                    LAYER: LAYER,
                    LEGEND: LEGEND
                };
                layers.push(obj);

            });
            if (layers.length >= 1) {
                success_callback(layers);
            } else {
                success_callback(null);
            }
        };
        MM.ajax.error = fail_callback;
        MM.ajax.web_method();
    }

    //利用id取得圖層
    MM.ezlayer.get_layer_by_id = function (id,success_callback, fail_callback) {

        //# 開始處裡資料
        MM.ajax.url = MM.ezlayer.path + "modules/ezlayer/services/service.aspx/get_layer";
        MM.ajax.params = { id: id };
        MM.ajax.success = function (m) {
            var layers = [];
            var xml = $.parseXML(m);
            $(xml).find("NewDataSet").find("Table").each(function () {

                var LAYER_SN = $(this).find("LAYER_SN").eq(0).text();
                var NAME = $(this).find("NAME").eq(0).text();
                var TYPES = $(this).find("TYPES").eq(0).text();
                var PATH = $(this).find("PATH").eq(0).text();
                var ICON = $(this).find("ICON").eq(0).text();
                var MAXZ = $(this).find("MAXZ").eq(0).text();
                var MINZ = $(this).find("MINZ").eq(0).text();
                var LAYER = $(this).find("LAYER").eq(0).text();
                var LEGEND = $(this).find("LEGEND").eq(0).text();

                MAXZ = parseInt(MAXZ);
                MINZ = parseInt(MINZ);

                LAYER_SN = parseInt(LAYER_SN);

                var obj = {
                    id: LAYER_SN,
                    LAYER_SN: LAYER_SN,
                    NAME: NAME,
                    TYPES: TYPES,
                    PATH: PATH,
                    ICON: ICON,
                    MAXZ: MAXZ,
                    MINZ: MINZ,
                    LAYER: LAYER,
                    LEGEND: LEGEND
                };
                layers.push(obj);

            }); 
            if (layers.length >= 1) {
                success_callback(layers[0]);
            }else{
                success_callback(null);
            }
        };
        MM.ajax.error = fail_callback;
        MM.ajax.web_method();
    }
})(MM);

/**
 * version: 1.1
 * last updated: 2016/03/29     fix: function showId() error
 * 
 * 1.0  2016/03/26 created
 * */

if (window.MM) {
	MM = window.MM;
}else{
	window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "mask.js" + ")(\\?|$)"),
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

if (!window.jQuery) {
    document.write('<script src="' + l + 'plugin/jAlert/jquery.js"></script>');
}

document.write('<script src="' + l + 'plugin/jquery.overlay/loadingoverlay.js"></script>');

(function(MM){
		
		MM.mask = {};

		MM.mask.icon = "";

		MM.mask.show = function () {
		    $.LoadingOverlay("show");
		}

    MM.mask.showInText = function (text) {
        if (text == undefined) return;
        if (text == null) return;
            var customElement = $("<div>", {
                "css": {
                    "border": "0px dashed gold",
                    "font-size": "24px",
                    "text-align": "center",
                    "padding": "10px"
                },
                "class": "your-custom-class",
                "text": text
            });
            $.LoadingOverlay("show", {
                image: "",
                custom: customElement
            });
		}
		MM.mask.hide = function () {
		    $.LoadingOverlay("hide");
		}
		MM.mask.showId = function (id) {

		}
		MM.mask.hideId = function (id) {

		}


})(MM);
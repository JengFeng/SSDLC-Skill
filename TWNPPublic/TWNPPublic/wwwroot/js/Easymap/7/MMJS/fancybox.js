//office website: http://www.jqueryrain.com/?E9cX7DiW
/*
    examples: 
            
            MM.alert('title','content','red');

            MM.confirm(function(){
                console.log('ok');
            },function(){
                console.log('not ok');
            },'blue');
*/
//updated: 2016/10/24
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

var r = new RegExp("(^|(.*?\\/))(" + "fancybox.js" + ")(\\?|$)"),
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

document.write('<link href="' + l + 'plugin/fancybox/jquery.fancybox-1.3.4.css" rel="stylesheet" type="text/css"/>');
document.write('<script src="' + l + 'plugin/fancybox/jquery.mousewheel-3.0.4.pack.js"></script>');
document.write('<script src="' + l + 'plugin/fancybox/jquery.fancybox-1.3.4.pack.js"></script>');

(function (MM) {
    
    
    MM.fancybox.iframe = function (e) {

    }
})(MM);




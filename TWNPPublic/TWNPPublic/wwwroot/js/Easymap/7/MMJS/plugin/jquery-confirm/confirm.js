/* https://craftpip.github.io/jquery-confirm/
ex:

            $.dialog({
                boxWidth: '40%',
                useBootstrap: false,
                title: '',
                content: '<div style="width:100%;height:500px;;background-color:#ddd;"></div>',
                animation: 'zoom',
                closeAnimation: 'zoom',
                onContentReady: function () {
                    // when content is fetched & rendered in DOM
                    alert('onContentReady');

                }
            });
*/
var r = new RegExp("(^|(.*?\\/))(" + "confirm.js" + ")(\\?|$)"),
	s = document.getElementsByTagName('script'),
	src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');

    if (src == null) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}

if (!window.jQuery) {
    document.write('<script src="' + l + 'jquery.js"></script>');
}
document.write('<link href="' + l + 'jquery-confirm.min.css" rel="stylesheet" type="text/css"/>');
document.write('<script src="' + l + 'jquery-confirm.min.js"></script>');
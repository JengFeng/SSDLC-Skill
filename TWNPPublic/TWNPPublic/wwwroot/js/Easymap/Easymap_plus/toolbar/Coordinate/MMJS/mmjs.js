
/// <reference path="base.js" />
/// <reference path="mask.js" />
/// <reference path="cookie.js" />
/// <reference path="utility.js" />
/// <reference path="validate.js" />
/**************************************************
	js物件化管理案
	功能:載入所有js檔案
***************************************************/
(function () {
    
        var r = new RegExp("(^|(.*?\\/))(" + "mmjs.js" + ")(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for (var i = 0, len = s.length; i < len; i++) {
            src = s[i].getAttribute('src');
            if (src) {
                m = src.match(r);
                if (m) {
                    l = m[1];
                    break;
                }
            }
        }


        var host = l;	//主網頁到本檔的路徑
        var jsFiles = [
                "base.js",              //Date String Array基本class extend
                "utility.js",             //基本工具
                "mask.js",              //mask
                "cookie.js",            //cookie: set get del
                "validate.js",          //各式驗證
                "ajax.js"               //ajax簡化
            ]; // etc.
	
        var scriptTags = new Array(jsFiles.length);
        
        for (var i=0, len=jsFiles.length; i<len; i++) {
            scriptTags[i] = "<script src='" + host + jsFiles[i] +
                                   "'></script>"; 
        }
        if (scriptTags.length > 0) {
            document.write(scriptTags.join(""));
        }

})();


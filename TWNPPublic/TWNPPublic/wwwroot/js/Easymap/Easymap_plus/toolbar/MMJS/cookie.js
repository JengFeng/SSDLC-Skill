
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.cookie = {};
  

    MM.cookie.set = function (name, value) {
        /// <summary>
        /// 設定cookie
        /// </summary>
        /// <param name="name"></param>
        /// <param name="value"></param>
        var argv = MM.cookie.set.arguments;
        var argc = MM.cookie.set.arguments.length;
        var expires = (argc > 2) ? argv[2] : new Date();
        var path = (argc > 3) ? argv[3] : null;
        var domain = (argc > 4) ? argv[4] : null;
        var secure = (argc > 5) ? argv[5] : false;
        expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) +
        ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
        ((path == null) ? "" : ("; path=" + path)) +
        ((domain == null) ? "" : ("; domain=" + domain)) +
        ((secure == true) ? "; secure" : "");
    }
    MM.cookie.get = function (name) {
        /// <summary>
        /// 取得cookie
        /// </summary>
        /// <param name="name"></param>
        var arg = name + "=";
        var alen = arg.length;
        var clen = document.cookie.length;
        var i = 0;
        while (i < clen) {
            var j = i + alen;
            if (document.cookie.substring(i, j) == arg) {
                offset = j;
                var endstr = document.cookie.indexOf(";", offset);
                if (endstr == -1) endstr = document.cookie.length;
                return unescape(document.cookie.substring(offset, endstr));
            }
            i = document.cookie.indexOf(" ", i) + 1;
            if (i == 0) break;
        }
        return null;
    }
    MM.cookie.oget = function (cname) {
        /// <summary>
        /// 取得未經過解碼的cookie。可透過encodeURIComponent() and decodeURIComponent() 加解碼
        /// </summary>
        /// <param name="cname"></param>
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }


    MM.cookie.del = function (name) {
        var expdate = new Date();
        expdate.setTime(expdate.getTime() - 1);
        MM.cookie.set(name, "");
    }

})(MM);


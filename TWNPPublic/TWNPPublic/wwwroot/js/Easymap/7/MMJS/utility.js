
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.global = {};
    MM.global.home = document.URL.substr(0, document.URL.lastIndexOf('/'))+"/";

    MM.getEById = function (objId) {
        /// <summary>
        /// 取得ClientID Element，同getelementbyid。目前針對txtBox
        /// </summary>
        /// <param name="objId">Server Control ID</param>
        //var myID = $("input[id*=" + objId + "]")[0].id
        var inp = document.getElementById(objId);
        if (!inp) inp = document.getElementById("ctl00_" + objId);
        if (!inp) inp = document.getElementById("ctl00_ContentPlaceHolder1_" + objId);
        if (!inp) inp = document.getElementById("ctl00_ContentPlaceHolder2_" + objId);
        
        return inp;
    }

    MM.getId = function (objId) {
        /// <summary>
        /// 取得ClientID。目前針對txtBox
        /// </summary>
        /// <param name="objId">Server Control ID</param>
        //var myID = $("input[id*=" + objId + "]")[0].id
        var inp = document.getElementById(objId);
        if (!inp) inp = document.getElementById("ctl00_" + objId);
        if (!inp) inp = document.getElementById("ctl00_ContentPlaceHolder1_" + objId);
        if (!inp) inp = document.getElementById("ctl00_ContentPlaceHolder2_" + objId);

        return inp.id;
    }

    MM.getLocal = function () {
        /// <summary>
        /// 取得MM.js的相對路徑
        /// </summary>
        var r = new RegExp("(^|(.*?\\/))(" + 'MM.js' + ")(\\?|$)"),
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
        return l;
    }

    MM.getScriptTagPath = function (filename) {
        /// <summary>
        /// 取得MM.js的相對路徑
        /// </summary>
        var r = new RegExp("(^|(.*?\\/))(" + filename + ")(\\?|$)"),
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
        return l;
    }

    MM.isNullOrEmpty = function (v) {

        if (v === null || v === undefined || v === "" || v.length <= 0) {
            return true;
        }

        return false;
    }
    MM.isNum = function (con) {
        /// <summary>
        /// 數字檢驗
        /// </summary>
        /// <param name="con"></param>
        if (con) {
            if (isNaN(con.value)) {
                alert("請輸入數字的格式！");
                con.value = "";
                return false;
            }
            return true;
        }
    }
    MM.parseInt = function (v) {
        if (/^(\-|\+)?([0-9]+|Infinity)$/.test(v))
            return Number(v);
        return NaN;
    }
    MM.parseFloat = function (v) {
        if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(v))
            return Number(v);
        return NaN;
    }
    MM.isDate = function (con) {
        /// <summary>
        /// 日期檢驗
        /// </summary>
        /// <param name="con"></param>
        if (con) {
            var date = con.value;
            if (date.length == 0) return false;
            var result = date.match(/\d{4}\/\d{2}\/\d{2} [0-2]\d:[0-6]\d/g);
            //if (result == null || (date.length != 16 && date.length != 11))
            if (result == null) {
                if (!(date.length == 16 || date.length == 11)) {
                    alert("請輸入日期格式：yyyy/MM/dd HH:mm\nyyyy:四位數 年份\nMM :二位數 月份\ndd    :二位數 天數\nHH   :二位數 小時\nmm  :二位數 分鐘");
                    con.value = "";
                    return false;
                }

            }
            return true;
        }
    }
    MM.isMobile = function () {

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        else {
            return false;
        }
    }
    MM.isIE = function () {
        var sAgent = window.navigator.userAgent;
        var Idx = sAgent.indexOf("MSIE");
        var v = 0;
        // If IE, return version number.
        if (Idx > 0)
            v = parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));

            // If IE 11 then look for Updated user agent string.
        else if (!!navigator.userAgent.match(/Trident\/7\./))
            v = 11;

        else
            v = 0; //It is not IE

        if (v <= 0)
            return false;
        else
            return true;

    }

    MM.QueryString = function (sParam) {
        /// <summary>
        /// 同C#QueryString
        /// </summary>
        /// <param name="sParam"></param>
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return decodeURIComponent(sParameterName[1]);
            }
        }
        return null;
    }
    MM.get = MM.QueryString;
    MM.fullscreen = function (id, diffh,diffw) {

        var width = screen.availWidth;
        var height = screen.availHeight;
        window.moveTo(0, 0);
        window.resizeTo(width, height);
        window.focus();

        var div = document.getElementById(id);
        var awidth = window.innerWidth;
        var aheight = window.innerHeight;
        var gwidth = 0;
        var gheight = 0;

        if (diffh) gheight = diffh;
        if (diffw) gwidth = diffw;

        div.style.width = awidth - gwidth + "px";
        div.style.height = aheight - gheight + "px";
    }
    MM.getRoot = function () {
        var P = window.location.pathname.split('/');
        var rc = mmlayer.path.substring(0, mmlayer.path.toLowerCase().toLowerCase().indexOf('modules')).split('/').length;
        var r = '';
        for (var i = 0; i < P.length - rc; i++) {
            r += P[i] + '/'
        }
        r = window.location.protocol + '//' + window.location.host + r;

        return r;
    }
    //# urlstring to 物件
    MM.urlstr2object = function (str) {

        if (str === "") return null;

        var attrs = str.split('&');

        var obj = {};
        for (var i = 0; i < attrs.length; i++) {

            var attr = attrs[i];

            if (attr == "") continue;

            attr = attr.replace('=', '="');

            if (attr.indexOf('=') >= 0) {

                attr = attr.substring(0, attr.indexOf('=')).toLowerCase() + attr.substring(attr.indexOf('='), attr.length);
            }

            eval('obj.' + attr + '";');
        }

        return obj;
    }
    //# 參數字串轉換物件
    MM.attrstr2object = function (str) {

        if (str == undefined) return null;
        if (str === "") return null;

        var attrs = null;
        if (str.indexOf(";") === -1) {
            if (str.indexOf("=") >= 0) {
                attrs = [];
                attrs.push(str);
            } else {
                return null;
            }

        } else {
            attrs = str.split(';');
        }
        var obj = {};
        for (var i = 0; i < attrs.length; i++) {

            var attr = attrs[i];

            if (attr == "") continue;

            attr = attr.replace('=', '="');

            if (attr.indexOf('=') >= 0) {

                attr = attr.substring(0, attr.indexOf('=')) + attr.substring(attr.indexOf('='), attr.length);
            }

            eval('obj.' + attr + '";');
        }
        //統一參數格式小寫
        for (attr in obj) {
            obj[attr.toLowerCase()] = obj[attr];
        }
        return obj;
    }
    //# 顏色hex轉rgba
    MM.hexToRgbA = function (hex,opacity) {
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');

            if (opacity == undefined) opacity = '1';
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+opacity+')';
        }
        throw null;
    }
})(MM);




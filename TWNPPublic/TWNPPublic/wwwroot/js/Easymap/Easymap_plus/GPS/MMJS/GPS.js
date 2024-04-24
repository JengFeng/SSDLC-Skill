/**
 * version: 1.1
 * include RWD.js 
 * include lightbox.js
 * 1.0  2017/05/23 created
 * */

if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.GPS = {};

    MM.GPS.ios_functionname = "SetGps";
    MM.GPS.ios_fail_functionname = "GetGpsFail";
    MM.GPS.callback = null;

    MM.GPS.run = function () {
        /*
        緯度,經度,精度(meter),前進速度(meter/second),前進方向(正北順時針角度),海拔高度,海拔高度精度(meter)
        Ex: “121.8894,23.6757,500,2.5,62,400,40”
        */

        switch (MM.GPS.os().toLowerCase()) {
            case "ios":

                parent.callSwift.GetGps(MM.GPS.ios_functionname, MM.GPS.ios_fail_functionname);
                break;
            case "android":

                //Andriod 有兩個公用變數Android|app
                if (typeof parent.Android !== 'undefined' ||
                    typeof parent.app !== 'undefined') {
                    var p = null;
                    if (typeof parent.Android !== 'undefined') {
                        p = parent.Android.GetGps();  //回傳範例120.22xxx ,24.17xxx
                    }
                    if (typeof parent.app !== 'undefined') {
                        p = parent.app.GetGps();  //回傳範例24.17xxx,120.22xxx  
                        if (p.length <= 0 || p.indexOf(",") <= 0) {
                            MM.alert("狀態","請再操作一次");
                            return;
                        }
                        var tP = p.split(",");
                        p = tP[1] + "," + tP[0];
                    }
                    if (p.length <= 0 || p.indexOf(",") <= 0) {
                        MM.alert("狀態", "請再操作一次");
                        return;
                    }


                    var P = p.split(",");

                    var lon = P[0];
                    var lat = P[1];
                    var accuracy = 500;
                    //看有沒有傳這個參數
                    if (P.length >= 3) {
                        accuracy = P[2];
                    }
                    lat = parseFloat(lat);
                    lon = parseFloat(lon);
                    accuracy = parseInt(accuracy);

                    if (MM.GPS.callback != null) {

                        MM.GPS.callback(lon, lat, accuracy);
                    }
                }


                break;
            default:
                alert('尚未支援');
                break;
        }
    }

    MM.GPS.os = function () {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
            return 'iOS';
        }
        else if (userAgent.match(/Android/i)) {
            return 'Android';
        }
        else {
            return 'unknown';
        }
    }
})(MM);
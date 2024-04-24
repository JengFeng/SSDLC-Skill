/**
 * version: 1.1
 * 1.0  2016/04/26 created
 * */

if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.RWD = {};
    // 是否為行動裝置
    MM.RWD.isMobile = function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }
    // 是否為手機
    MM.RWD.isPhone = function () {

        if (MM.mobile.isMobile() == true) {
            var w = screen.width;
            var h = screen.height;
            if (w < 1024 && h < 1024) {
                return true;
            }

            return false;
        }
        return false;
    }
    // 是否為平板
    MM.RWD.isPad = function () {
        if (MM.RWD.isMobile() == true) {
            var w = screen.width;
            var h = screen.height;


            if (w >= 1024 || h >= 1024) {
                return true;
            }

            return false;
        }
        return false;
    }
})(MM);
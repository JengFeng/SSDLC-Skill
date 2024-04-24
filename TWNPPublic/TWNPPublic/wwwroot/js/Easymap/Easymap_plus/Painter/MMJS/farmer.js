
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.farmer = {};

    /// <summary>
    /// 解析地號 並改成8碼
    /// </summary>
    MM.farmer.is_landno_correct_and_formated = function (id) {

        var obj49 = document.getElementById(id);
        var SP, TL, TR, L, R;        if (obj49.value == "") {
            
            return false;
        }        if (obj49.value.indexOf(" ") != -1) {            obj49.value = '';            return false;
        }        L = 4;        R = 4;        SP = obj49.value.indexOf("-");        if (SP == -1) {
            TL = obj49.value;            TR = "";
        }        else {
            TL = obj49.value.substr(0, SP);            TR = obj49.value.substr(SP + 1, 254);
        }        if ((TR.length + TL.length) != (L + R)) {            //error//            if ((TL == "" && TR == "") || (TL.length > L || TR.length > R) || (TL == "")) {                obj49 = '';                return false;
            }            obj49.value = MM.farmer.LPAD(TL, "0", L) + MM.farmer.LPAD(TR, "0", R);
        }        return true;
    }
    /// <summary>
    /// 解析地號8碼,並直接提示
    /// </summary>
    MM.farmer.check_landno = function (id) {

        var obj49 = document.getElementById(id);
        var SP, TL, TR, L, R;        if (obj49.value == "") {
            if (MM.alert != undefined) {
                MM.alert("尚未輸入地號");
            } else {
                alert("尚未輸入地號");
            }
            
            return false;
        }        if (obj49.value.indexOf(" ") != -1) {
            if (MM.alert != undefined) {
                MM.alert("尚未輸入地號");
            } else {
                alert("尚未輸入地號");
            }            obj49.value = '';            return false;
        }        L = 4;        R = 4;        SP = obj49.value.indexOf("-");        if (SP == -1) {
            TL = obj49.value;            TR = "";
        }        else {
            TL = obj49.value.substr(0, SP);            TR = obj49.value.substr(SP + 1, 254);
        }        if ((TR.length + TL.length) != (L + R)) {            //error//            if ((TL == "" && TR == "") || (TL.length > L || TR.length > R) || (TL == "")) {
                if (MM.alert != undefined) {
                    MM.alert("輸入錯誤");
                } else {
                    alert("輸入錯誤");
                }                obj49 = '';                return false;
            }            obj49.value = MM.farmer.LPAD(TL, "0", L) + MM.farmer.LPAD(TR, "0", R);
        }        return true;
    }

    /// <summary>
    /// 地號八碼轉成dash的格式
    /// </summary>
    MM.farmer.landno8_to_dash = function (landno) {

        if (landno.length != 8) return landno;

        var f = landno.substr(0, 4);
        var t = landno.substr(4, 4);

        var df = parseInt(f);
        var dt = parseInt(t);

        if (dt > 0) {
            return df + "-" + dt;
        } else {
            return df;
        }
    }

    MM.farmer.LPAD = function (txt, chr, flen) {
        var cnt, lp;
        lp = flen - txt.length;        for (cnt = 1; cnt <= lp; cnt++)            txt = chr + txt;        return txt;
    }
})(MM);




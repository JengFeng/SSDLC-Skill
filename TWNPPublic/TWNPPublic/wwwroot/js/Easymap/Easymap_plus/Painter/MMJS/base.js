//2016/12/21 fix:inArrayPosition() return -1 when not similar items
//2017/01/11 add:Array.prototype.insert() Array.prototype.indexPush()



Array.prototype.clone = function () {
    /// <summary>
    /// 複製陣列
    /// </summary>
    return this.slice(0);
};
Array.prototype.max = function () {
    /// <summary>
    /// 找最大值
    /// </summary>
    var max = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
    return max;
};
Array.prototype.min = function () {
    /// <summary>
    /// 找最小值
    /// </summary>
    var min = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) if (this[i] < min) min = this[i];
    return min;
};
Array.prototype.sum = function () {
    /// <summary>
    /// 總和
    /// </summary>
    var sum = 0;
    for (var i = 1; i < this.length; i++) {
        if (isNaN(this[i])) return false;

        sum += this[i];
    }
    return sum;
};
Array.prototype.average = function () {
    /// <summary>
    /// 計算平均
    /// </summary>

    switch (this.length) {
        case 0:
            return 0;
            break;
        case 1:
            return this[0];
            break;

    }
    return (this.sum() / (this.length - 1));

};
Array.prototype.inArray = function (value) {
    /// <summary>
    /// 輸入值有沒有在Array裡面
    /// </summary>
    /// <param name="value"></param>
    /// <returns type=""></returns>

    var i;
    for (i = 0; i < this.length; i++) {
        // Matches identical (===), not just similar (==).
        if (this[i] === value) {
            return true;
        }
    }
    return false;
};
Array.prototype.inArrayPosition = function (value) {
    /// <summary>
    /// 輸入的值在哪個索引位子
    /// </summary>
    /// <param name="value"></param>
    /// <returns type=""></returns>
    var i;
    for (i = 0; i < this.length; i++) {
        // Matches identical (===), not just similar (==).
        if (this[i] === value) {
            return i;
        }
    }
    return -1;
};
Array.prototype.sw = function (p0, p1) {
    /// <summary>
    /// 交換索引位子
    /// </summary>
    /// <param name="p0"></param>
    /// <param name="p1"></param>
    var tmp = null;
    tmp = this[p1];
    this[p1] = this[p0];
    this[p0] = tmp;

};
Array.prototype.indexPop = function (index) {
    /// <summary>
    /// 刪除索引位子
    /// </summary>
    /// <param name="index"></param>
    if (index == null) return;

	for(var i = index;i<this.length-1;i++){
		this.sw(i,i+1);
	}
    this.pop();
}
Array.prototype.indexPush = function (index, item) {
    this.splice(index, 0, item);
};
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
Array.prototype.getById = function (id) {
    /// <summary>
    /// 利用id取得array　object裡的物件
    /// object結構
    /// [{
    ///     id:'a1',
    ///     content:''
    /// },{
    ///     id:'a2',
    ///     content:''
    /// }]
    /// </summary>
    /// <param name="id"></param>
    if (id == null) return;

    try{
        for (var i = 0; i < this.length; i++) {
            if (this[i] == undefined) continue;
            if (this[i].id == id) {

                return this[i];
            }
        }

    } catch (err) {
        return;
    }
}
Array.prototype.popById = function (id) {
    /// <summary>
    /// 利用id取得array　object裡的物件
    /// object結構
    /// [{
    ///     id:'a1',
    ///     content:''
    /// },{
    ///     id:'a2',
    ///     content:''
    /// }]
    /// </summary>
    /// <param name="id"></param>
    if (id == null) return;

    for (var i = 0; i < this.length; i++) {
        if (this[i] == undefined) continue;
        if (this[i].id == id) {
            this.indexPop(i);
            break;
        }
    }

}
Array.prototype.sortBy = function (by, dir, ignoreCase) {
    /// <summary>
    /// 利用by(某attr的名稱string)排序
    /// object結構
    /// [{
    ///     id:'a1',
    ///     sort:0
    /// },{
    ///     id:'a2',
    ///     sort:1
    /// }]
    /// </summary>
    /// <param name="id"></param>
    if (by == null) return;
    if (dir == undefined) dir = "asc";
    if (ignoreCase == undefined) ignoreCase = false;
    try {
        for (var i = 0; i < this.length; i++) {

            if (this[i][by] == undefined) continue;
            if (this[i][by] == null) continue;

            var sort_i = this[i][by];

            for (var j = i; j < this.length; j++) {
                var sort_j = this[j][by];

                if (ignoreCase == true) {
                    sort_i = sort_i.toLowerCase();
                    sort_j = sort_j.toLowerCase();
                }
                if (sort_j < sort_i) {
                    this.sw(i, j);
                    sort_i = this[i][by];
                }
            }
        }

    } catch (err) {
        return;
    }
}

Date.isLeapYear = function (year) {
    /// <summary>
    /// 是否為閏年
    /// </summary>
    /// <param name="year"></param>
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};
Date.prototype.isLeapYear = function () {
    /// <summary>
    /// 是否為閏年
    /// </summary>
    return Date.isLeapYear(this.getFullYear());
};
Date.getDaysInMonth = function (year, month) {
    /// <summary>
    /// 某月有幾天
    /// </summary>
    /// <param name="year"></param>
    /// <param name="month"></param>
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};
Date.prototype.getDaysInMonth = function () {
    /// <summary>
    /// 某月有幾天
    /// </summary>
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};
Date.prototype.addDays = function (days) {
    /// <summary>
    /// 加天數
    /// </summary>
    /// <param name="days"></param>
    /// <returns type=""></returns>
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}
Date.prototype.addMonths = function (value) {
    /// <summary>
    /// 加月數
    /// </summary>
    /// <param name="value"></param>
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};
Date.prototype.yyyyMMdd = function () {
    /// <summary>
    /// DateFormat
    /// </summary>
    return this.format("yyyyMMdd");
};
Date.prototype.yyyyMMddhhmm = function () {
    /// <summary>
    /// DateFormat
    /// </summary>
    return this.format("yyyyMMddHHmm");
};
Date.prototype.yyyyMMddHHmmss = function () {
    /// <summary>
    /// DateFormat
    /// </summary>
    return this.format("yyyyMMddHHmmss");
};
Date.prototype.format = function (formatstring) {
    /// <summary>
    /// DateFormat
    /// </summary>
    /// <param name="formatstring"></param>

    var yyyy = this.getFullYear().toString();
    var MM = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var HH = this.getHours().toString();
    var mm = this.getMinutes().toString();
    var ss = this.getSeconds().toString();

    MM = (MM[1] ? MM : "0" + MM[0]);
    dd = (dd[1] ? dd : "0" + dd[0]);
    HH = (HH[1] ? HH : "0" + HH[0]);
    mm = (mm[1] ? mm : "0" + mm[0]);
    ss = (ss[1] ? ss : "0" + ss[0]);

    formatstring = formatstring.replace("yyyy", yyyy);
    formatstring = formatstring.replace("MM", MM);
    formatstring = formatstring.replace("dd", dd);
    formatstring = formatstring.replace("HH", HH);
    formatstring = formatstring.replace("mm", mm);
    formatstring = formatstring.replace("ss", ss);

    return formatstring;
};
Date.diff = function (a, b, ms) {

    if (!ms) ms = 1000;
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds());

    return Math.floor((utc2 - utc1) / ms);
}
Date.diffInDays = function (a, b) {
    return Date.diff(a, b, 1000 * 60 * 60 * 24);
}

String.prototype.IsNullOrEmpty = function (str) {

    if (this.length <= 0) return true;
    if (str === "") return true;

    return false;
}
String.prototype.trim = function () {
    /// <summary>
    ///去除頭尾空白 
    /// </summary>
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.lTrim = function () {
    /// <summary>
    /// 去除左側（頭）空白
    /// </summary>
    return this.replace(/(^\s*)/g, "");
}
String.prototype.rTrim = function () {
    /// <summary>
    /// 去除右側（尾）空白
    /// </summary>
    return this.replace(/(\s*$)/g, "");
}
String.prototype.Trim = function () {
    /// <summary>
    /// 利用LTrim、RTrim來實做的trim
    /// </summary>
    return this.lTrim().rTrim();
}
String.format = function () {
    /// <summary>
    /// 可在Javascript中使用如同C#中的string.format
    /// 使用方式 : var fullName = String.format('Hello. My name is {0} {1}.', 'FirstName', 'LastName');
    /// </summary>
    /// <returns type=""></returns>
    var s = arguments[0];
    if (s == null) return "";
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = getStringFormatPlaceHolderRegEx(i);
        s = s.replace(reg, (arguments[i + 1] == null ? "" : arguments[i + 1]));
    }
    return cleanStringFormatResult(s);
}
String.prototype.format = function () {
    /// <summary>
    /// 可在Javascript中使用如同C#中的string.format (對jQuery String的擴充方法)
    /// 使用方式 : var fullName = 'Hello. My name is {0} {1}.'.format('FirstName', 'LastName');
    /// </summary>
    /// <returns type=""></returns>
    var txt = this.toString();
    for (var i = 0; i < arguments.length; i++) {
        var exp = getStringFormatPlaceHolderRegEx(i);
        txt = txt.replace(exp, (arguments[i] == null ? "" : arguments[i]));
    }
    return cleanStringFormatResult(txt);
}


//讓輸入的字串可以包含{}
function getStringFormatPlaceHolderRegEx(placeHolderIndex) {
    return new RegExp('({)?\\{' + placeHolderIndex + '\\}(?!})', 'gm')
}
//當format格式有多餘的position時，就不會將多餘的position輸出
//ex:
// var fullName = 'Hello. My name is {0} {1} {2}.'.format('firstName', 'lastName');
// 輸出的 fullName 為 'firstName lastName', 而不會是 'firstName lastName {2}'
function cleanStringFormatResult(txt) {
    if (txt == null) return "";
    return txt.replace(getStringFormatPlaceHolderRegEx("\\d+"), "");
}


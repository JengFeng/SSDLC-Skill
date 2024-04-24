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

    MM.math = {};

    // 小數點後幾位
    MM.math.formatFloat = function (num, pos)
    {
        var size = Math.pow(10, pos);
        return Math.round(num * size) / size;
    }
    MM.math.rand = function (min, max) {
        return (Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
    MM.math.randomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
})(MM);
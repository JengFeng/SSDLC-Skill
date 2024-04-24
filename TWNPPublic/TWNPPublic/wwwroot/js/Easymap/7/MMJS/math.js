/**
 * version: 1.1
 * 1.0  2016/04/26 created
 * 2023-01-08 Add isInteger
 * */

window.MM ? MM = window.MM : window.MM = {};

(function (MM) {

    MM.math = {};

    MM.math.formatFloat = function (num, pos)
    {
        var size = Math.pow(10, pos);
        return Math.round(num * size) / size;
    }   // 小數點後幾位
    MM.math.rand = function (min, max) {
        return (Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
    MM.math.randomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
    MM.math.isInteger = val => {
        return /^-?\d+$/.test(val);
    }                  // 是否為整數
    MM.math.isFloat = val => {
        return /^(-?\d+)(\.\d+)?$/.test(val);
    }                    // 是否為浮點數
})(MM);
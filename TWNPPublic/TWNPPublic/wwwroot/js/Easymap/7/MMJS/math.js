/**
 * version: 1.1
 * 1.0  2016/04/26 created
 * */
function my_fix_random() {
    //var array = new Uint32Array(1);
    //var v = window.crypto.getRandomValues(array)[0];
    //return parseFloat((v / (Math.pow(10, v.toString().length))).toFixed(10));    
    var crypto =  window.crypto /*native*/ || window.msCrypto /*IE11 native*/ || window.msrCrypto; /*polyfill*/
    return parseFloat(((new Uint32Array(1))[0] / 4294967295).toString(36).substring(2, 15) + (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295));
}

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
        return (my_fix_random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
    MM.math.randomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(my_fix_random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
})(MM);
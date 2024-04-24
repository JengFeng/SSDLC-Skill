
if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {

    MM.easyobject = {};

    /// <summary>
    /// 將range string 轉成dgxy array
    /// range ex:x,y,x,y,x,y 206945.367734,2674155.399046,206945.464309,2674155.675461,206968.005180,2674160.599100
    /// </summary>
    MM.easyobject.range_to_dgxy = function (range) {

        var RANGE = range.split(',');

        var DGXY = [];
        for (var i = 0; i<RANGE.length-1;i+=2){

            var x = parseFloat(RANGE[i]);
            var y = parseFloat(RANGE[i + 1]);

            var dgxy = {x:x,y:y};
            DGXY.push(dgxy);
        }

        return DGXY;
    }

    /// <summary>
    /// 將range array 轉成dgxy array
    /// range array 
    /// [
    ///     { lon:121.8,lat:23.5},
    ///     { lon:122.8,lat:25.5},
    ///     { lon:123.8,lat:22.5}
    /// ]
    /// </summary>
    MM.easyobject.ranges_to_dgxy = function (ranges) {


        var DGXY = [];
        for (var i = 0; i < ranges.length ; i ++) {
            var range = ranges[i]
            var x = parseFloat(range.lon);
            var y = parseFloat(range.lat);

            var dgxy = { x: x, y: y };
            DGXY.push(dgxy);
        }

        return DGXY;
    }

    /// <summary>
    /// 將dgxys array 轉成bbox
    /// </summary>
    MM.easyobject.dgxys_to_bbox = function (dgxys) {

        //# 找出左上右下
        var left = dgxys[0].x;
        var right = dgxys[0].x;
        var top = dgxys[0].y;
        var bottom = dgxys[0].y;

        for (var i = 0; i < dgxys.length ; i++) {
            var x = dgxys[i].x;
            var y = dgxys[i].y;

            if (x < left) {
                left = x;
            }
            if (x > right) {
                right = x;
            }
            if (y < bottom) {
                bottom = y;
            }
            if (y > top) {
                top = y;
            }
        }

        return [left, bottom, right, top];
    }
    /// <summary>
    /// 將range string 轉成bbox
    /// range ex:x,y,x,y,x,y 206945.367734,2674155.399046,206945.464309,2674155.675461,206968.005180,2674160.599100
    /// </summary>
    MM.easyobject.range_to_bbox = function (range) {

        var dgxys = MM.easyobject.range_to_dgxy(range);

        if (dgxys.length <= 0) {

            return [0,0,0,0];
        }

        //# 找出左上右下
        var left = dgxys[0].x;
        var right = dgxys[0].x;
        var top = dgxys[0].y;
        var bottom = dgxys[0].y;

        for (var i = 0; i < dgxys.length ; i++)
        {
            var x = dgxys[i].x;
            var y = dgxys[i].y;

            if (x < left) {
                left = x;
            }
            if (x > right) {
                right = x;
            }
            if (y < bottom) {
                bottom = y;
            }
            if (y > top) {
                top = y;
            }
        }

        return [left,bottom,right,top];
    }

    /// <summary>
    /// 將range string 轉成 center
    /// range ex:x,y,x,y,x,y 206945.367734,2674155.399046,206945.464309,2674155.675461,206968.005180,2674160.599100
    /// </summary>
    MM.easyobject.range_to_center = function (range) {

        var BBOX = MM.easyobject.range_to_bbox(range);

        var x = (BBOX[0] + BBOX[2]) / 2;
        var y = (BBOX[1] + BBOX[3]) / 2;

        return [x, y];
    }
})(MM);




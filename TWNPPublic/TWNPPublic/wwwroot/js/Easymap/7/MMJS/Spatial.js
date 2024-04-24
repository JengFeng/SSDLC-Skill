/*
    MM.spatial.isInsidePolygon([{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}],{x:50,y:50})
*/
var r = new RegExp("(^|(.*?\\/))(" + "spatial.js" + ")(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, l = "";
for (var i = 0, len = s.length; i < len; i++) {
    src = s[i].getAttribute('src');
    if (src == null) continue;
    if (src.toLowerCase().indexOf("mmjs") < 0) continue;
    if (src.toLowerCase()) {
        m = src.match(r);
        if (m) {
            l = m[1];
            break;
        }
    }
}

if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

(function (MM) {
    /*
    struecture
    dgxy{
        float x
        float y
    }
    */
    if(MM == undefined) var MM = {};
    
    MM.spatial = {}
    MM.spatial.path = l;
    MM.spatial.cityJson = [];
    MM.spatial.townJson = [];

    MM.spatial._getCityJson = function () {

        if (MM.spatial.cityJson.length >= 1) return;

        var request = new XMLHttpRequest();
        request.open('GET', MM.spatial.path+'data/city.json', false);  // `false` makes the request synchronous
        request.send(null);

        if (request.status === 200) {
            if (request.responseText.length >= 1) {
                MM.spatial.cityJson = JSON.parse(request.responseText);
            }
                
        }
    }
    MM.spatial._getTownJson = function () {
        if (MM.spatial.townJson.length >= 1) return;

        var request = new XMLHttpRequest();
        request.open('GET', MM.spatial.path + 'data/town.json', false);  // `false` makes the request synchronous
        request.send(null);

        if (request.status === 200) {
            if (request.responseText.length >= 1) {
                MM.spatial.townJson = JSON.parse(request.responseText);
            }

        }
    }

    MM.spatial.getCityByXY = function (x, y) {

        this._getCityJson();

        if (MM.spatial.cityJson.features == undefined) return;

        for (var i = 0; i <MM.spatial.cityJson.features.length;i++) {
            var feature = MM.spatial.cityJson.features[i];

            if (feature.geometry == undefined || feature.geometry.coordinates == undefined) continue;

            var coordinates = feature.geometry.coordinates;
            
            for (var j = 0; j < coordinates.length; j++) {
                var coords = coordinates[j];
                var points = [];
                for (var k = 0; k < coords[0].length; k++) {
                    var coordinate = coords[0][k];
                    points.push({
                        x: coordinate[0], y: coordinate[1]
                    })

                }
                var isIn = MM.spatial.isInsidePolygon(points, { x: x, y: y });
                if (isIn == 1) {

                    return feature.properties;
                }
                
            }
           
        }
        return null;
    }
    MM.spatial.getTownByXY = function (x, y) {
        this._getTownJson();

        if (MM.spatial.townJson.features == undefined) return;

        for (var i = 0; i<MM.spatial.townJson.features.length; i++) {
            var feature = MM.spatial.townJson.features[i];

            if (feature.geometry == undefined || feature.geometry.coordinates == undefined) continue;
            var coordinates = feature.geometry.coordinates;


            for (var j = 0; j < coordinates.length; j++) {
                var coords = coordinates[j];

                var points = [];
                try {
                    for (var k = 0; k < coords[0].length; k++) {
                        var coordinate = coords[0][k];

                        points.push({
                            x: coordinate[0], y: coordinate[1]
                        })

                    }
                } catch (err) {
                    console.log(err);
                }

                var isIn = MM.spatial.isInsidePolygon(points, { x: x, y: y });
                if (isIn == 1) {

                    return feature.properties;
                }

            }

        }
        return null;
    }
    MM.spatial.isTwoLineIntersect = function () { }
    MM.spatial.isInsidePolygon = function (polygon, dgxy) {
        
           if (polygon.length < 3)  return false; 
  
           var n = polygon.length;
            // Create a point for line segment from p to infinite 
           var extreme = { x: 9999999999999, y: dgxy.y };
  
            // Count intersections of the above line with sides of polygon 
            var count = 0, i = 0; 
            do
            { 
                var next = (i+1)%n; 
  
                // Check if the line segment from 'p' to 'extreme' intersects 
                // with the line segment from 'polygon[i]' to 'polygon[next]' 
                if (MM.spatial._doIntersect(polygon[i], polygon[next], dgxy, extreme))
                { 
                    // If the point 'p' is colinear with line segment 'i-next', 
                    // then check if it lies on segment. If it lies, return true, 
                    // otherwise false 
                    if (MM.spatial._orientation(polygon[i], dgxy, polygon[next]) == 0)
                        return MM.spatial._onSegment(polygon[i], dgxy, polygon[next]);
  
                    count++; 
                } 
                i = next; 
            } while (i != 0); 
  
            // Return true if count is odd, false otherwise 
            return count&1;  // Same as (count%2 == 1)
        
    }
    
    MM.spatial._onSegment = function (p, q, r) {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && 
                q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) 
            return true; 
        return false; 
    }
    MM.spatial._orientation = function (p, q, r) {
            
        var val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y); 
      
        if (val == 0) return 0;  // colinear 
        return (val > 0)? 1: 2; // clock or counterclock wise         
    }
    MM.spatial._doIntersect = function (p1, q1, p2, q2) {
        // Find the four orientations needed for general and 
        // special cases 
        var o1 = MM.spatial._orientation(p1, q1, p2);
        var o2 = MM.spatial._orientation(p1, q1, q2);
        var o3 = MM.spatial._orientation(p2, q2, p1);
        var o4 = MM.spatial._orientation(p2, q2, q1);
      
        // General case 
        if (o1 != o2 && o3 != o4) 
            return true; 
      
        // Special Cases 
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
        if (o1 == 0 && MM.spatial._onSegment(p1, p2, q1)) return true;
      
        // p1, q1 and p2 are colinear and q2 lies on segment p1q1 
        if (o2 == 0 && MM.spatial._onSegment(p1, q2, q1)) return true;
      
        // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
        if (o3 == 0 && MM.spatial._onSegment(p2, p1, q2)) return true;
      
         // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
        if (o4 == 0 && MM.spatial._onSegment(p2, q1, q2)) return true;
      
        return false; // Doesn't fall in any of the above cases        
        
        
    }
})(MM);

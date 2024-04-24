/**
 examples
    
        MM.coord.from(23765, 2837266, MM.coord.TM2_67);
        var o = MM.coord.toWGS84();

        MM.coord.from(121, 23, MM.coord.WGS84);
        var o = MM.coord.toTM2_97();

 version
    2016/10/18     inital: 整合 
 * */

if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}



(function (MM) {

    MM.coord = new CoordTrans();

    MM.coord.from_dgxys = function (dgxys, from, to) {


        var DGXYS = [];
        for (var i = 0; i < dgxys.length; i++) {
            var dg = dgxys[i];
            this.from(dg.x, dg.y, from);

            var o = { x: null, y: null };
            var s = null;
            switch (to) {
                case this.WGS84:
                    s = this.toWGS84();
                    break;
                case this.TM2_67:
                    s = this.toTM2_67();
                    break;
                case this.TM2_97:
                    s = this.toTM2_97;
                    break;
            }
            o.x = s.x;
            o.y = s.y;
            DGXYS.push(o);
        }
        return DGXYS;
    }
})(MM);

/*=============================================*/
/*===== CoordTrans 物件						===*/
/*=============================================*/

function CoordTrans() { 

		//坐標系統定義
        this.TM2_67 = "TM2_67";
        this.T67 = "67";
        this.TM2_97 = "TM2_97";
        this.T97 = "97";

		this.TWD67 = "TWD67";
		this.TWD97 = "TWD97";
		this.WGS84 = "WGS84";
        this.W84
		
		this.fromCoord = "";
	    this.x = ""; 
	    this.y = ""; 
	    
		//設定坐標系統資訊
	    this.from = function (x, y, coord) {

	        coord = coord.replace('-','_');

			this.x = parseFloat(x);
			this.y = parseFloat(y);
			this.fromCoord = coord;
		}

		//輸出TWD67
		this.toTM2_67 = function(){

			var p = [];

			switch(this.fromCoord){
			case this.TM2_97:
			case this.T97:
				var p3=fromTM2(TWD97_A, TWD97_ECC, TWD97_ECC2, 0, 121, TWD97_TM2, this.x,this.y);
				var x3=p3[0];
				var y3=p3[1];
				
				var p1=toTWD67(x3, y3, 0);
				var x1=p1[0];
				var y1=p1[1];
				
				p2=toTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, x1, y1);

				p[0]=p2[0];
				p[1]=p2[1];
				break;
			case this.TM2_67:
			case this.T67:
				p[0] = this.x;
				p[1] = this.y;
				break;
			case this.TWD67:

				var x1 = this.x;
				var y1 =this.y;
				
				p=toTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, x1, y1);

				break;
			case this.TWD97:
			case this.WGS84:
			case this.W84:
            default:
				var x3= this.x;
				var y3= this.y;
				
				p1=toTWD67(x3, y3, 0);
				x1=p1[0];
				y1=p1[1];
				
				var p2 = toTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, x1, y1);
				p[0]=p2[0];
				p[1]=p2[1];

				break;
			}
			
			var tmp = {};
			try{
				
				tmp.lon = p[0];
				tmp.lat = p[1];
				tmp.x = p[0];
				tmp.y = p[1];
			}catch(err){
				return null;
			}

			return tmp;
		}

		//輸出TWD97
		this.toTM2_97 = function(){
			var p = [];

			switch(this.fromCoord){
			case this.TM2_97:
			case this.T97:
				p[0] = this.x;
				p[1] = this.y;
				break;
			case this.TM2_67:
			case this.T67:


				x2=this.x;
				y2=this.y;
				
				p1=fromTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, x2, y2);
				x1=p1[0];
				y1=p1[1];
				
				p3=toTWD97(x1, y1, 0);
				x3=p3[0];
				y3=p3[1];
				
				p=toTM2(TWD97_A, TWD97_ECC, TWD97_ECC2, 0, 121, TWD97_TM2, x3, y3);


				break;
			case this.TWD67:
				var x1 = this.x;
				var y1 = this.y;

				var x = this.x;
				var y = this.y;
				
				p2=toTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, x1, y1);
				x2=p2[0];
				y2=p2[1];
				
				p3=toTWD97(x, y, 0);
				x3=p3[0];
				y3=p3[1];
				
				p=toTM2(TWD97_A, TWD97_ECC, TWD97_ECC2, 0, 121, TWD97_TM2, x3, y3);

				break;
			case this.TWD97:
			case this.WGS84:
			default:
				var x3= this.x;
				var y3= this.y;
				
				p =  toTM2(TWD97_A, TWD97_ECC, TWD97_ECC2, 0, 121, TWD97_TM2, x3, y3);

				break;
			}
			
			var tmp = {};
			try{
				
				tmp.lon = p[0];
				tmp.lat = p[1];
				tmp.x = p[0];
				tmp.y = p[1];
			}catch(err){
				return null;
			}

			return tmp;
		}
		
		
		this.toTWD67 = function(){
			var p = [];

			switch(this.fromCoord){
			    case this.TM2_97:
			    case this.T97:
					var x4 = this.x;
					var y4 = this.y;
					
					p3 = fromTM2(TWD97_A, TWD97_ECC, TWD97_ECC2, 0, 121, TWD97_TM2, x4, y4);
					x3 = p3[0];
					y3 = p3[1];
					
					p = toTWD67(x3, y3, 0);
					
					break;
			    case this.TM2_67:
			    case this.T67:
					var x2 = this.x;
					var y2 = this.y;
					
					p = fromTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, x2, y2);

					break;
				case this.TWD67:
					p[0] = this.x;
					p[1] = this.y;
					break;
				case this.TWD97:
				case this.WGS84:
					var x3 = this.x;
					var y3 = this.y;
					
					p = toTWD67(x3, y3, 0);

					break;
			}

			var tmp = {};
			try{
				
				tmp.lon = p[0];
				tmp.lat = p[1];
				tmp.x = p[0];
				tmp.y = p[1];
			}catch(err){
				return null;
			}

			return tmp;
		}

		//輸出WGS84
		
		this.toWGS84 = function(){

			var p = [];

			switch(this.fromCoord){
			case this.TM2_97:
			case this.T97:

				p = fromTM2(TWD97_A, TWD97_ECC, TWD97_ECC2, 0, 121, TWD97_TM2, this.x, this.y);
				break;
			case this.TM2_67:
			case this.T67:

				var p1=fromTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, this.x, this.y);
				var p2 = toTWD97(p1[0], p1[1], 0);
				
				p[0] = p2[0];
				p[1] = p2[1];

				break;
			case this.TWD67:
				var x1 = this.x;
				var y1 = this.y;
				var x = this.x;
				var y = this.y;
				
				p2=toTM2(TWD67_A, TWD67_ECC, TWD67_ECC2, 0, 121, TWD67_TM2, x1, y1);
				x2=p2[0];
				y2=p2[1];
				
				p=toTWD97(x, y, 0);

				break;
			case this.TWD97:
			case this.WGS84:
			default:
				p[0] = this.x;
				p[1] = this.y;
				break;
			}
			
			var tmp = {};
			try{
				
				tmp.lon = p[0];
				tmp.lat = p[1];
				tmp.x = p[0];
				tmp.y = p[1];
			}catch(err){
				return null;
			}

			return tmp;
		}

		this.toTWD97 = function(){
			return this.toWGS84();
		};

};




/*
  Definition of math related value
*/

COS67_5 = 0.3826834323650897717284599840304;
PI = 3.14159265358979323;
HALF_PI = 1.570796326794896615;
DEG_RAD = 0.01745329251994329572;
RAD_DEG = 57.295779513082321031;

/*
  Definition of datum related value
*/

AD_C = 1.0026000;

TWD67_A = 6378160.0;
TWD67_B = 6356774.7192;
TWD67_ECC = 0.00669454185458;
TWD67_ECC2 = 0.00673966079586;
TWD67_DX = -752.32;   // different from garmin and already knowned value, but those all value only
TWD67_DY = -361.32;   // got 5-15m accuracy. the real offical value is holded by somebody and not
TWD67_DZ = -180.51;   // release to public. if can got more enough twd67/twd97 control point coordinare,
TWD67_RX = -0.00000117;   // then we can calculate a better value than now.
TWD67_RY = 0.00000184;    // 
TWD67_RZ = 0.00000098;    // and, also lack twd67/twd97 altitude convertion value...
TWD67_S = 0.00002329;    //


TWD97_A = 6378137.0;
TWD97_B = 6356752.3141;
TWD97_ECC = 0.00669438002290;
TWD97_ECC2 = 0.00673949677556;

TWD67_TM2 = 0.9999;    // TWD67->TM2 scale
TWD97_TM2 = 0.9999;    // TWD97->TM2 scale

//ho = toTM2(TWD97_A, TWD97_ECC, TWD97_ECC2, 0, 121, TWD97_TM2, inX, inY);
// center longitude of taiwan is 121, for penghu is 119
dx = 250000;   // TM2 in Taiwan should add 250000

function mercator(y, a, ecc)
{
    if(y == 0.0)
    {
        return 0.0;
    }
    else
    {
        return a * (
        ( 1.0 - ecc/4.0 - 3.0*ecc*ecc/64.0 - 5.0*ecc*ecc*ecc/256.0 ) * y -
        ( 3.0*ecc/8.0 + 3.0*ecc*ecc/32.0 + 45.0*ecc*ecc*ecc/1024.0 ) * Math.sin(2.0 * y) +
        ( 15.0*ecc*ecc/256.0 + 45.0*ecc*ecc*ecc/1024.0 ) * Math.sin(4.0 * y) -
        ( 35.0*ecc*ecc*ecc/3072.0 ) * Math.sin(6.0 * y) );
    }
}

function toTWD67(inx, iny, inz) //97經緯度 to 67經緯度
{
    var r, pole, sin_lat, cos_lat;
    var lat, lon, height;
    var x1, y1, z1, x2, y2, z2;
    var q, q2, t, t1, s, s1, sum, sin_b, cos_b, sin_p, cos_p;

    lon = inx*DEG_RAD;
    lat = iny*DEG_RAD;
    height = inz*DEG_RAD;

    if(lat<-HALF_PI&&lat>-1.001*HALF_PI)
        lat = -HALF_PI;
    else if(lat>HALF_PI&&lat<1.001*HALF_PI)
        lat = HALF_PI;
    else if((lat<-HALF_PI)||(lat>HALF_PI))
        return;

    if(lon>PI)
        lon -= (2*PI);

    sin_lat = Math.sin(lat);
    cos_lat = Math.cos(lat);
    r = TWD97_A/(Math.sqrt(1.0-TWD97_ECC*sin_lat*sin_lat));
    x1 = (r+height)*cos_lat*Math.cos(lon);
    y1 = (r+height)*cos_lat*Math.sin(lon);
    z1 = ((r*(1-TWD97_ECC))+height)*sin_lat;

    x2 = x1-TWD67_DX-TWD67_S*(lon+TWD67_RZ*lat-TWD67_RY*height);
    y2 = y1-TWD67_DY-TWD67_S*(-TWD67_RZ*lon+lat+TWD67_RX*height);
    z2 = z1-TWD67_DZ-TWD67_S*(TWD67_RY*lon-TWD67_RX*lat+height);

    pole = 0;

    if(x2!=0.0)
    {
        lon=Math.atan2(y2,x2);
    }
    else
    {
        if(y2>0)
        {
            lon = HALF_PI;
        }
        else if(y2<0)
        {
            lon=-HALF_PI;
        }
        else
        {
            pole=1;

            lon=0;

            if(z2>0)
            {
                lat=HALF_PI;
            }
            else if(z2<0)
            {
                lat=-HALF_PI;
            }
            else
            {
                lat=HALF_PI;

                xx = lon*RAD_DEG;
                yy = lat*RAD_DEG;
                zz = -TWD67_B;

                return [xx,yy,zz];
            }
        }
    }

    q2 = x2*x2+y2*y2;
    q = Math.sqrt(q2);
    t = z2*AD_C;
    s = Math.sqrt(t*t+q2);
    sin_b = t/s;
    cos_b = q/s;
    t1 = z2+TWD67_B*TWD67_ECC2*sin_b*sin_b*sin_b;
    sum = q-TWD67_A*TWD67_ECC*cos_b*cos_b*cos_b;
    s1 = Math.sqrt(t1*t1+sum*sum);
    sin_p = t1/s1;
    cos_p = sum/s1;
    r = TWD67_A/Math.sqrt(1.0-TWD67_ECC*sin_p*sin_p);

    if(cos_p>=COS67_5)
    {
        height=q/cos_p-r;
    }
    else if(cos_p<=-COS67_5)
    {
        height=q/-cos_p-r;
    }
    else
    {
        height=z2/sin_p+r*(TWD67_ECC-1.0);
    }

    if(!pole)
    {
        lat = Math.atan(sin_p/cos_p);
    }

    xx = lon*RAD_DEG;
    yy = lat*RAD_DEG;
    zz = height;
    
	return [xx,yy,zz];
}

function toTM2(a, ecc, ecc2, lat, lon, scale, inx, iny) //經緯度轉TM2度
{
    var x0, y0, x1, y1, m0, m1;
    var n, t, c, A;

    x0 = inx*DEG_RAD;
    y0 = iny*DEG_RAD;

    x1 = lon*DEG_RAD;
    y1 = lat*DEG_RAD;

    m0 = mercator(y1, a, ecc);
    m1 = mercator(y0, a, ecc);

    n = a/Math.sqrt(1-ecc*Math.pow(Math.sin(y0), 2.0));
    t = Math.pow(Math.tan(y0), 2.0);
    c = ecc2*Math.pow(Math.cos(y0), 2.0);
    A = (x0-x1)*Math.cos(y0);

    xx = scale*n*(A + (1.0 - t + c)*A*A*A/6.0 + (5.0 - 18.0*t + t*t + 72.0*c - 58.0*ecc2)*Math.pow(A, 5.0)/120.0) + 250000;
    yy = scale*(m1 - m0 + n*Math.tan(y0)*(A*A/2.0 + (5.0 - t + 9.0*c + 4*c*c)*Math.pow(A, 4.0)/24.0 + (61.0 - 58.0*t + t*t + 600.0*c - 330.0*ecc2)*Math.pow(A, 6.0)/720.0));
    
    return [xx,yy];
}

function fromTM2(a, ecc, ecc2, lat, lon, scale, x, y) //TM2 to 經緯度
{
    var x0, y0, x1, y1, phi, m, m0, mu, e1;
    var c1, t1, n1, r1, d;

    x0 = x-dx;
    y0 = y;

    x1 = lon*DEG_RAD;
    y1 = lat*DEG_RAD;

    m0 = mercator(y1, a, ecc);
    m = m0 + y0/scale;

    e1 = (1.0-Math.sqrt(1.0-ecc))/(1.0+Math.sqrt(1.0-ecc));
    mu = m / (a * (1.0 - ecc/4.0 - 3.0*ecc*ecc/64.0 - 5.0*ecc*ecc*ecc/256.0));

    phi = mu + (3.0*e1/2.0 - 27.0*Math.pow(e1, 3.0)/32.0)*Math.sin(2.0*mu)
        + (21.0*e1*e1/16.0 - 55.0*Math.pow(e1,4.0)/32.0)*Math.sin(4.0*mu)
        + 151.0*Math.pow(e1,3.0)/96.0*Math.sin(6.0*mu) + 1097.0*Math.pow(e1,4.0)/512.0*Math.sin(8.0*mu);

    c1 = ecc2*Math.pow(Math.cos(phi),2.0);
    t1 = Math.pow(Math.tan(phi),2.0);
    n1 = a/Math.sqrt(1-ecc*Math.pow(Math.sin(phi),2.0));
    r1 = a*(1.0-ecc)/Math.pow(1.0-ecc*Math.pow(Math.sin(phi),2.0), 1.5);
    d = x0/(n1*scale);

    xx = (x1+(d-(1.0+2.0*t1+c1)*Math.pow(d,3.0)/6.0
        +(5.0-2.0*c1+28.0*t1-3.0*c1*c1+8.0*ecc2+24.0*t1*t1)*Math.pow(d,5.0)/120.0)/Math.cos(phi))*RAD_DEG;
    yy = (phi-n1*Math.tan(phi)/r1*(d*d/2.0-(5.0+3.0*t1+10.0*c1-4.0*c1*c1-9.0*ecc2)
        *Math.pow(d,4.0)/24.0+(61.0+90.0*t1+298.0*c1+45.0*t1*t1-252.0*ecc2-3.0*c1*c1)*Math.pow(d,6.0)/72.0))*RAD_DEG;
	return [xx,yy];
}

function toTWD97(x, y, z) //67經緯度 to 97經緯度
{
    var r, pole, sin_lat, cos_lat;
    var lat, lon, height;
    var x1, y1, z1, x2, y2, z2;
    var q, q2, t, t1, s, s1, sum, sin_b, cos_b, sin_p, cos_p;

    lon = x*DEG_RAD;
    lat = y*DEG_RAD;
    height = z*DEG_RAD;

    if(lat<-HALF_PI&&lat>-1.001*HALF_PI)
        lat = -HALF_PI;
    else if(lat>HALF_PI&&lat<1.001*HALF_PI)
        lat = HALF_PI;
    else if((lat<-HALF_PI)||(lat>HALF_PI))
        return;

    if(lon>PI)
        lon -= (2*PI);

    sin_lat = Math.sin(lat);
    cos_lat = Math.cos(lat);
    r = TWD67_A/(Math.sqrt(1.0-TWD67_ECC*sin_lat*sin_lat));
    x1 = (r+height)*cos_lat*Math.cos(lon);
    y1 = (r+height)*cos_lat*Math.sin(lon);
    z1 = ((r*(1-TWD67_ECC))+height)*sin_lat;

    x2 = x1+TWD67_DX+TWD67_S*(lon+TWD67_RZ*lat-TWD67_RY*height);
    y2 = y1+TWD67_DY+TWD67_S*(-TWD67_RZ*lon+lat+TWD67_RX*height);
    z2 = z1+TWD67_DZ+TWD67_S*(TWD67_RY*lon-TWD67_RX*lat+height);

    pole = 0;

    if(x2!=0.0)
    {
        lon=Math.atan2(y2,x2);
    }
    else
    {
        if(y2>0)
        {
            lon = HALF_PI;
        }
        else if(y2<0)
        {
            lon=-HALF_PI;
        }
        else
        {
            pole=1;

            lon=0;

            if(z2>0)
            {
                lat=HALF_PI;
            }
            else if(z2<0)
            {
                lat=-HALF_PI;
            }
            else
            {
                lat=HALF_PI;

                x = lon*RAD_DEG;
                y = lat*RAD_DEG;
                z = -TWD97_B;

                return;
            }
        }
    }

    q2 = x2*x2+y2*y2;
    q = Math.sqrt(q2);
    t = z2*AD_C;
    s = Math.sqrt(t*t+q2);
    sin_b = t/s;
    cos_b = q/s;
    t1 = z2+TWD97_B*TWD97_ECC2*sin_b*sin_b*sin_b;
    sum = q-TWD97_A*TWD97_ECC*cos_b*cos_b*cos_b;
    s1 = Math.sqrt(t1*t1+sum*sum);
    sin_p = t1/s1;
    cos_p = sum/s1;
    r = TWD97_A/Math.sqrt(1.0-TWD97_ECC*sin_p*sin_p);

    if(cos_p>=COS67_5)
    {
        height=q/cos_p-r;
    }
    else if(cos_p<=-COS67_5)
    {
        height=q/-cos_p-r;
    }
    else
    {
        height=z2/sin_p+r*(TWD97_ECC-1.0);
    }

    if(!pole)
    {
        lat = Math.atan(sin_p/cos_p);
    }

    xx = lon*RAD_DEG;
    yy = lat*RAD_DEG;
    zz = height;
	
	return [xx,yy,zz];
}





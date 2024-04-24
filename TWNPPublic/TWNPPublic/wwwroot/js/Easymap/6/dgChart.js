

var r = new RegExp("(^|(.*?\\/))(" + "dgchart.js" + ")(\\?|$)"),
	s = document.getElementsByTagName('script'),
	src, m, l = "";
	for(var i=0, len=s.length; i<len; i++) {
		src = s[i].getAttribute('src');
		if(src) {
			m = src.match(r);
			if(m) {
				l = m[1];
				break;
			}
		}
	}

_dgmap4path = l;


document.write("<script type='text/javascript' src='" + _dgmap4path + "modules/dgchart/d3.min.js'></script>");
document.write("<script type='text/javascript' src='" + _dgmap4path + "modules/dgchart/dgchart.js'></script>");

function dgChart(charttype, dgxy, dataset,options) {

	this.type = "dgchart";
	this.charttype = charttype;
	this.xy = dgxy;
	this.dataset = dataset;
	this.options = options;
}

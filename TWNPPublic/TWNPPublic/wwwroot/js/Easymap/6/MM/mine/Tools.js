
/**
 * Namespace: MM.Layer
 * Only create <MM.Layer> namespace.
 */
EzMap.Tools = function () {
};

/**
 * Method: isEmpty
 * check weather input value null/empty or not
 * Parameters:
 * val - {string}
 */
EzMap.Tools.isEmpty = function (val) {
	return (val === undefined || val == null || val.length <= 0) ? true : false;
};

/**
 * Method: isEmpty
 * check weather input value null/empty or not
 * Parameters:
 * val - {string}
 */
EzMap.Tools.getHost = function (val) {

	var l = document.createElement("a");
	l.href = val;
	return l.hostname;
};

/**
 * Method: isEmpty
 * check weather the device now wheather mobile or not
 */
EzMap.Tools.isMobileDevice = function () {

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		return true;
	}		
	return false;
}

/**
 * Method: unixtime
 * ¨ú±oUnixtime
 */
EzMap.Tools.unixtime = function () {

	var foo = new Date; // Generic JS date object
	var unixtime_ms = foo.getTime();
	var unixtime = parseInt(unixtime_ms / 1000);

	return unixtime;
}

EzMap.Tools.isBoolean = function (tf) {

	return typeof tf === 'boolean';
}
EzMap.Tools.isNumber = function (str) {

	return !isNaN(str);
}
EzMap.Tools.isArray = function (object) {

    if (object.constructor === Array) return true;
    else return false;

}

EzMap.Tools.getIeVersion = function () {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}
EzMap.Tools.isFireFox = function () {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}
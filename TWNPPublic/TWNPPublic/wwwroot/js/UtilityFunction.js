function GetWebSiteURL(url) {
    return (location.href.indexOf('swns') > -1 ? '/swns' : '') + url;
}
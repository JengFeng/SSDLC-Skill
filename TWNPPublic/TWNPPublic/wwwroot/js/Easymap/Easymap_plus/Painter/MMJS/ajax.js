//example:
/*
    //# 開始處裡資料
    MM.ajax.url = "test.aspx/get_dir";
    MM.ajax.params = { field: 3 };
    MM.ajax.success = function (m) {
    };
    MM.ajax.error = function (e) {
    }
    MM.ajax.web_method();
*/
/// 需使用jquery.js

if (window.MM) {
    MM = window.MM;
} else {
    window.MM = {};
}

/*!
 * 解決 ie9 無法使用的問題
 * jQuery-ajaxTransport-XDomainRequest - v1.0.3 - 2014-06-06
 * https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest
 * Copyright (c) 2014 Jason Moon (@JSONMOON)
 * Licensed MIT (/blob/master/LICENSE.txt)
 */
(function (a) { if (typeof define === 'function' && define.amd) { define(['jquery'], a) } else if (typeof exports === 'object') { module.exports = a(require('jquery')) } else { a(jQuery) } }(function ($) { if ($.support.cors || !$.ajaxTransport || !window.XDomainRequest) { return } var n = /^https?:\/\//i; var o = /^get|post$/i; var p = new RegExp('^' + location.protocol, 'i'); $.ajaxTransport('* text html xml json', function (j, k, l) { if (!j.crossDomain || !j.async || !o.test(j.type) || !n.test(j.url) || !p.test(j.url)) { return } var m = null; return { send: function (f, g) { var h = ''; var i = (k.dataType || '').toLowerCase(); m = new XDomainRequest(); if (/^\d+$/.test(k.timeout)) { m.timeout = k.timeout } m.ontimeout = function () { g(500, 'timeout') }; m.onload = function () { var a = 'Content-Length: ' + m.responseText.length + '\r\nContent-Type: ' + m.contentType; var b = { code: 200, message: 'success' }; var c = { text: m.responseText }; try { if (i === 'html' || /text\/html/i.test(m.contentType)) { c.html = m.responseText } else if (i === 'json' || (i !== 'text' && /\/json/i.test(m.contentType))) { try { c.json = $.parseJSON(m.responseText) } catch (e) { b.code = 500; b.message = 'parseerror' } } else if (i === 'xml' || (i !== 'text' && /\/xml/i.test(m.contentType))) { var d = new ActiveXObject('Microsoft.XMLDOM'); d.async = false; try { d.loadXML(m.responseText) } catch (e) { d = undefined } if (!d || !d.documentElement || d.getElementsByTagName('parsererror').length) { b.code = 500; b.message = 'parseerror'; throw 'Invalid XML: ' + m.responseText; } c.xml = d } } catch (parseMessage) { throw parseMessage; } finally { g(b.code, b.message, c, a) } }; m.onprogress = function () { }; m.onerror = function () { g(500, 'error', { text: m.responseText }) }; if (k.data) { h = ($.type(k.data) === 'string') ? k.data : $.param(k.data) } m.open(j.type, j.url); m.send(h) }, abort: function () { if (m) { m.abort() } } } }) }));

(function ($, ajax) {

     
    MM.ajax = {};

    //# 必填
    MM.ajax.url = '';
    
    //# 預設
    MM.ajax.params = {};
    MM.ajax.timeout = 3000;
    MM.ajax.type = 'GET';
    MM.ajax.dataType = 'text';
    MM.ajax.contentType = 'text/plain';//application/json; charset=utf-8

    MM.ajax.success = function (msg) {
    }
    MM.ajax.error = function (err) {
        console.log(err);
        MM.mask.hide();
    }

    //
    MM.ajax.run = function () {

        var data = "";
        for (var key in MM.ajax.params) {
            //data += key + ":\"" + MM.ajax.params[key] + "\",";
            data += "\""+key + "\":\"" + MM.ajax.params[key] + "\",";
        }
        data = data.substring(0, data.length - 1);
        data = "{" + data + "}";

        var ajax = $.ajax({
            url: MM.ajax.url,
            data: data,
            type: MM.ajax.type,
            crossDomain: true,
            dataType: MM.ajax.dataType,
            timeout: MM.ajax.timeout,
            contentType: MM.ajax.contentType,
            success: MM.ajax.success,
            error: MM.ajax.error
        });

        return ajax;
    }

    //# 讀VS的 WebMethod
    MM.ajax.web_service = function () {

        var data = "";
        for (var key in MM.ajax.params) {
            //data += key + ":\"" + MM.ajax.params[key] + "\",";
            data += "\""+key + "\":\"" + MM.ajax.params[key] + "\",";
        }
        data = data.substring(0, data.length - 1);
        data = "{" + data + "}";

        $.ajax({
            type: MM.ajax.type,
            url: MM.ajax.url,
            dataType: 'xml',
            data: data,
            success: MM.ajax.success,
            error: MM.ajax.error
        });
    }
    //# 讀網頁裡的 WebMethod
    MM.ajax.web_method = function () {

        var data = "";
        for (var key in MM.ajax.params) {
            data += "\""+key + "\":\"" + MM.ajax.params[key] + "\",";
        }
        data = data.substring(0, data.length - 1);
        data = "{" + data + "}";

        var ajax = $.ajax({
            url: MM.ajax.url,
            data: data,
            type: "POST",
            dataType: 'text',
            contentType: "application/json; charset=utf-8",
            timeout: MM.ajax.timeout,
            success: MM.ajax.success,
            error: MM.ajax.error
        });

        return ajax;
    }

    MM.ajax.jsonp = function () {

        var data = "";
        for (var key in MM.ajax.params) {
            //data += key + ":\"" + MM.ajax.params[key] + "\",";
            data += "\""+key + "\":\"" + MM.ajax.params[key] + "\",";            
        }
        data = data.substring(0, data.length - 1);
        data = "{" + data + "}";

        var ajax = $.ajax({
            url: MM.ajax.url,
            type: "POST",
            timeout: MM.ajax.timeout,
            data: data,
            dataType: 'jsonp',
            success: MM.ajax.success,
            error: MM.ajax.error,
            jsonpCallback: MM.ajax.success
        });

        return ajax;
    }
})($, MM);
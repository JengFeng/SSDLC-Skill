(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["dg"] = factory();
	else
		root["dg"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

// UNUSED EXPORTS: dg3D, dgCurve, dgGML, dgGMarker, dgGStyle, dgGText, dgGeoJson, dgHeatmap, dgIcon, dgKml, dgMarker, dgMenuFunc, dgMergeVector, dgPoint, dgPolygon, dgPolyline, dgSPoint, dgSource, dgStaticImage, dgText, dgWFS, dgWKT, dgWindy, dgXY, dgXYZ

;// CONCATENATED MODULE: ./src/dg/dgPoint.js
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgPoint = /*#__PURE__*/function () {
  function dgPoint(xy, color, radius) {
    _classCallCheck(this, dgPoint);
    this._id = "";
    this._type = 'point';
    this._label = ".";
    this._x = xy.x;
    this._y = xy.y;
    this._strokeStyle = color;
    this._fillStyle = color;
    this._ptRadius = radius;
    this._lineWidth = radius;
    this._instance = null;
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
    this.bufferObj = null;
    return this;
  }
  _createClass(dgPoint, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        var d = {
          text: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getColor == null ? null : originStyles[0].getText().getColor(),
          textfill: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().getColor == null ? null : originStyles[0].getText().getFill().getColor(),
          stroke: originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().getColor == null ? null : originStyles[0].getStroke().getColor(),
          fill: originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().getColor == null ? null : originStyles[0].getFill().getColor(),
          image: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill() == null || originStyles[0].getImage().getFill().getColor == null ? null : originStyles[0].getImage().getFill().getColor(),
          //改顏色必需觸發一次改大小，才會生效
          //point 特有
          radius: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().getRadius()
        };
        this._flashFocusData.orinStyle.push(d);
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              for (var _i = 0, _max_i = features.length; _i < _max_i; _i++) {
                var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                this._flashFocusData.orinStyle[_i].text == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().setColor == null ? null : originStyles[0].getText().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].textfill == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().setColor == null ? null : originStyles[0].getText().getFill().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].stroke == null || originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().setColor == null ? null : originStyles[0].getStroke().setColor(this._flashFocusData.flashColor);
                //console.log(this._easymap);
                var new_color_with_opacity = this._easymap.colorValues(this._flashFocusData.flashColor);
                //這裡用 0.5 opacity 
                this._flashFocusData.orinStyle[_i].fill == null || originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().setColor == null ? null : originStyles[0].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].image == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill().setColor == null ? null : originStyles[0].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].radius == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i].radius);
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              for (var _i2 = 0, _max_i2 = features.length; _i2 < _max_i2; _i2++) {
                var originStyles = features[_i2].getStyleFunction().call(null, features[_i2]);
                this._flashFocusData.orinStyle[_i2].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[_i2].text);
                this._flashFocusData.orinStyle[_i2].textfill == null ? '' : originStyles[0].getText().getFill().setColor(this._flashFocusData.orinStyle[_i2].textfill);
                this._flashFocusData.orinStyle[_i2].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[_i2].stroke);
                this._flashFocusData.orinStyle[_i2].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[_i2].fill);
                this._flashFocusData.orinStyle[_i2].image == null ? '' : originStyles[0].getImage().getFill().setColor(this._flashFocusData.orinStyle[_i2].image);
                this._flashFocusData.orinStyle[_i2].radius == null || originStyles[0].getImage == null || originStyles[0].getImage().setRadius == null ? '' : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i2].radius);
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      clearInterval(this._flashFocusData.runInterval); //stop
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        this._flashFocusData.orinStyle[i].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[i].text);
        this._flashFocusData.orinStyle[i].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[i].stroke);
        this._flashFocusData.orinStyle[i].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[i].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "setLabel",
    value: function setLabel(label) {
      this._label = label;
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        if (features.length > 0) {
          features[0].set("name", label);
        }
      }
    }
  }, {
    key: "getLabel",
    value: function getLabel() {
      return this._label;
    }
  }, {
    key: "setXY",
    value: function setXY(tmpxy) {
      this._x = tmpxy.x;
      this._y = tmpxy.y;
      //this.instance.reposMark();
      //console.log("功能未完成...");

      var p3857 = ol.proj.transform([this._x, this._y], "EPSG:4326", "EPSG:3857");
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        //console.log(p3857);
        features[0].getGeometry().setCoordinates([p3857[0], p3857[1]]);
      }
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      return new dgXY(this._x, this._y);
    }
    /*getExtent() {
        let b = new Object();
        b['lt_x'] = this._x;
        b['lt_y'] = this._y;
        b['rb_x'] = this._x;
        b['rb_y'] = this._y;
        return b;
    }*/
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "getXY",
    value: function getXY() {
      return new dgXY(this._x, this._y);
    }
  }, {
    key: "getFillColor",
    value: function getFillColor() {
      return this._fillStyle;
    }
  }, {
    key: "setFillColor",
    value: function setFillColor(val) {
      this._fillStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        //改顏色必需觸發一次改大小，才會生效
        features[0].getStyle().getImage().getFill().setColor(this._fillStyle);
        features[0].getStyle().getImage().setRadius(this._lineWidth);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getStrokeWidth",
    value: function getStrokeWidth() {
      return this._lineWidth;
    }
  }, {
    key: "setStrokeWidth",
    value: function setStrokeWidth(val) {
      if (!isNaN(val) == false) val = 1;
      this._lineWidth = parseFloat(val);
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        //var originStyles = features[0].getStyleFunction().call(null, features[0]);
        //let s = originStyles[0].getStroke();
        //s.setWidth(val);
        ////redraw
        //features[0].setStyle(features[0].getStyle());
        features[0].getStyle().getImage().setRadius(this._lineWidth);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }]);
  return dgPoint;
}();
/* harmony default export */ const dg_dgPoint = (dgPoint);
;// CONCATENATED MODULE: ./src/dg/dgText.js
function dgText_typeof(o) { "@babel/helpers - typeof"; return dgText_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgText_typeof(o); }
function dgText_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgText_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgText_toPropertyKey(o.key), o); } }
function dgText_createClass(e, r, t) { return r && dgText_defineProperties(e.prototype, r), t && dgText_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgText_toPropertyKey(t) { var i = dgText_toPrimitive(t, "string"); return "symbol" == dgText_typeof(i) ? i : i + ""; }
function dgText_toPrimitive(t, r) { if ("object" != dgText_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgText_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgText = /*#__PURE__*/function () {
  //From : https://openlayers.org/en/latest/examples/vector-labels.html
  function dgText(xy, label, color, fontSize) {
    dgText_classCallCheck(this, dgText);
    this._id = "";
    this._type = 'text';
    this._label = label;
    this._fontSize = fontSize;
    this._rotate = 0; //旋轉角度
    this._x = xy.x;
    this._y = xy.y;
    //this._strokeStyle = 'rgba(255,255,255,1)';   
    //this._fillStyle = color;    
    this._textColor = color; //'rgba(255,0,0,1)'; // 文字顏色
    this._textOuterColor = 'rgba(255,255,255,0.5)';
    this._ptRadius = 0;
    this._lineWidth = 0;
    this._instance = null;
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
    /*this._style = new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({color: 'rgba(255, 0, 0, 0.1)'}),
        stroke: new Stroke({color: 'red', width: 1}),
      }),
      text: createTextStyle(feature, resolution, myDom.points),
    });
    */
    return this;
  }
  dgText_createClass(dgText, [{
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgText_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        var d = {
          text: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getColor == null ? null : originStyles[0].getText().getColor(),
          textfill: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().getColor == null ? null : originStyles[0].getText().getFill().getColor(),
          stroke: originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().getColor == null ? null : originStyles[0].getStroke().getColor(),
          fill: originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().getColor == null ? null : originStyles[0].getFill().getColor(),
          image: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill() == null || originStyles[0].getImage().getFill().getColor == null ? null : originStyles[0].getImage().getFill().getColor(),
          //改顏色必需觸發一次改大小，才會生效
          //point 特有
          radius: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().getRadius()
        };
        this._flashFocusData.orinStyle.push(d);
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              for (var _i = 0, _max_i = features.length; _i < _max_i; _i++) {
                var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                this._flashFocusData.orinStyle[_i].text == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().setColor == null ? null : originStyles[0].getText().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].textfill == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().setColor == null ? null : originStyles[0].getText().getFill().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].stroke == null || originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().setColor == null ? null : originStyles[0].getStroke().setColor(this._flashFocusData.flashColor);
                //console.log(this._easymap);
                var new_color_with_opacity = this._easymap.colorValues(this._flashFocusData.flashColor);
                //這裡用 0.5 opacity 
                this._flashFocusData.orinStyle[_i].fill == null || originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().setColor == null ? null : originStyles[0].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].image == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill().setColor == null ? null : originStyles[0].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].radius == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i].radius);
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              for (var _i2 = 0, _max_i2 = features.length; _i2 < _max_i2; _i2++) {
                var originStyles = features[_i2].getStyleFunction().call(null, features[_i2]);
                this._flashFocusData.orinStyle[_i2].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[_i2].text);
                this._flashFocusData.orinStyle[_i2].textfill == null ? '' : originStyles[0].getText().getFill().setColor(this._flashFocusData.orinStyle[_i2].textfill);
                this._flashFocusData.orinStyle[_i2].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[_i2].stroke);
                this._flashFocusData.orinStyle[_i2].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[_i2].fill);
                this._flashFocusData.orinStyle[_i2].image == null ? '' : originStyles[0].getImage().getFill().setColor(this._flashFocusData.orinStyle[_i2].image);
                this._flashFocusData.orinStyle[_i2].radius == null || originStyles[0].getImage == null || originStyles[0].getImage().setRadius == null ? '' : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i2].radius);
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      clearInterval(this._flashFocusData.runInterval); //stop
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        this._flashFocusData.orinStyle[i].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[i].text);
        this._flashFocusData.orinStyle[i].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[i].stroke);
        this._flashFocusData.orinStyle[i].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[i].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "setXY",
    value: function setXY(tmpxy) {
      this._x = tmpxy.x;
      this._y = tmpxy.y;
      //this.instance.reposMark();
      //console.log("功能未完成...");

      var p3857 = ol.proj.transform([this._x, this._y], "EPSG:4326", "EPSG:3857");
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        //console.log(p3857);
        features[0].getGeometry().setCoordinates([p3857[0], p3857[1]]);
      }
    }
  }, {
    key: "getXY",
    value: function getXY() {
      return new dgXY(this._x, this._y);
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      return new dgXY(this._x, this._y);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var b = new Object();
      b['lt_x'] = this._x;
      b['lt_y'] = this._y;
      b['rb_x'] = this._x;
      b['rb_y'] = this._y;
      return b;
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "getTextColor",
    value: function getTextColor() {
      return this._textColor;
    }
  }, {
    key: "getRotate",
    value: function getRotate() {
      return this._rotate;
    }
  }, {
    key: "setText",
    value: function setText(val) {
      this._label = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        features[0].getStyle().getText().setText(this._label);
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
        features[0].set("name", this._label);
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getText",
    value: function getText() {
      return this._label;
    }
  }, {
    key: "setRotate",
    value: function setRotate(val) {
      //val = 0~360
      val = parseInt(val) % 360;
      this._rotate = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        //ff.getStyle().getText().setRotation(360/(360/6.3));
        features[0].getStyle().getText().setRotation(this._rotate / (360 / 6.3));
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "setTextColor",
    value: function setTextColor(val) {
      this._textColor = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        features[0].getStyle().getText().getFill().setColor(this._textColor);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getFontSize",
    value: function getFontSize() {
      return parseInt(this._fontSize);
    }
  }, {
    key: "setFontSize",
    value: function setFontSize(val) {
      if (!isNaN(val) == false) val = 1;
      this._fontSize = parseFloat(val);
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        features[0].getStyle().getText().setScale(this._fontSize / 10.0);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }]);
  return dgText;
}();
/* harmony default export */ const dg_dgText = (dgText);
;// CONCATENATED MODULE: ./src/dg/dg3D.js
function dg3D_typeof(o) { "@babel/helpers - typeof"; return dg3D_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dg3D_typeof(o); }
function dg3D_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dg3D_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dg3D_toPropertyKey(o.key), o); } }
function dg3D_createClass(e, r, t) { return r && dg3D_defineProperties(e.prototype, r), t && dg3D_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dg3D_toPropertyKey(t) { var i = dg3D_toPrimitive(t, "string"); return "symbol" == dg3D_typeof(i) ? i : i + ""; }
function dg3D_toPrimitive(t, r) { if ("object" != dg3D_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dg3D_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dg3D = /*#__PURE__*/function () {
  function dg3D(layertype, url, options) {
    dg3D_classCallCheck(this, dg3D);
    this._type = 'dg3d'; // 3dtiles|kml|geojson|gltf;
    this._layerType = layertype;
    this._url = url;
    this._options = options;
    /**
     * type=gltf
     *      option={
     *          dgxy    
     *          z 
     *          scale
     *          animationLoop = NONE|REPEAT|MIRRORED_REPEAT
     *      }
     *          
     * */
    if (this._options == undefined) {
      this._options = {};
    }
  }
  dg3D_createClass(dg3D, [{
    key: "setFeatureClick",
    value: function setFeatureClick(handler) {
      this.onFeatureSelect = handler;
    }
  }, {
    key: "setFeatureHover",
    value: function setFeatureHover(handler) {
      this.onFeatureHover = handler;
    }
  }]);
  return dg3D;
}();
/* harmony default export */ const dg_dg3D = (dg3D);
;// CONCATENATED MODULE: ./src/dg/dgIcon.js
function dgIcon_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var dgIcon_dgIcon = function dgIcon(src, w, h, ops) {
  dgIcon_classCallCheck(this, dgIcon);
  this._src = src == null ? null : src;
  this._width = w == null ? 0 : w;
  this._height = h == null ? 0 : h;
  this._w = this._width;
  this._h = this._height;
  this._rotate = 0; //���ਤ��
  this._scale = 1; //��j�j�p
  this._opacity = 1; //�z����
  this._options = ops; /**
                       * _options:{
                       *      scale:1,     //1 = 100%
                       *      rotate:0,    //0~360
                       *      opacity:1    //0~1 �z���� 
                       * }
                       * 
                       * */
};
/* harmony default export */ const dg_dgIcon = (dgIcon_dgIcon);
;// CONCATENATED MODULE: ./src/dg/dgStaticImage.js
function dgStaticImage_typeof(o) { "@babel/helpers - typeof"; return dgStaticImage_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgStaticImage_typeof(o); }
function dgStaticImage_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgStaticImage_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgStaticImage_toPropertyKey(o.key), o); } }
function dgStaticImage_createClass(e, r, t) { return r && dgStaticImage_defineProperties(e.prototype, r), t && dgStaticImage_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgStaticImage_toPropertyKey(t) { var i = dgStaticImage_toPrimitive(t, "string"); return "symbol" == dgStaticImage_typeof(i) ? i : i + ""; }
function dgStaticImage_toPrimitive(t, r) { if ("object" != dgStaticImage_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgStaticImage_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgStaticImage_dgStaticImage = /*#__PURE__*/function () {
  //From : https://openlayers.org/en/latest/examples/static-image.html
  function dgStaticImage(src, dgXY_lt_xy, dgXY_rb_xy, ops) {
    dgStaticImage_classCallCheck(this, dgStaticImage);
    this._type = "dgstaticimage";
    this._src = src == null ? null : src;
    this._lt_xy = new dgXY(dgXY_lt_xy.x, dgXY_lt_xy.y);
    this._rb_xy = new dgXY(dgXY_rb_xy.x, dgXY_rb_xy.y);
    this._instance = null;
    this._width = "auto";
    this._height = "auto";
    this._rotate = 0;
    this._options = ops;
    /**
     * _options:{
     *      width: 800 //�j��s���e
     *      height: 800 //�j��s����
     * }
     * 
     * */
    if (dgStaticImage_typeof(this._options) == "object") {
      if (typeof this._options.width != "undefined") this._width = this._options.width;
      if (typeof this._options.height != "undefined") this._height = this._options.height;
      if (typeof this._options.rotate != "undefined") this._rotate = this._options.rotate;
    }
    return this;
  }
  dgStaticImage_createClass(dgStaticImage, [{
    key: "getCenter",
    value: function getCenter() {
      return new dgXY((this._lt_xy.x + this._rb_xy.x) / 2.0, (this._lt_xy.y + this._rb_xy.y) / 2.0);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().imageExtent_;
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //���o�|���d�򪺭��n
      //�^�����褽��
      var _extent = this._instance.getSource().imageExtent_;
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      return this.getExtentArea();
      /*let _extent = this._instance.getSource().imageExtent_;
      let _extent_3826 = ol.extent.applyTransform(
          _extent,
          ol.proj.getTransform('EPSG:3857', 'EPSG:3826')
      )*/
      /*
      �ߡG�w�������y�ФW�|�I�]a,b�^�]c,d�^�]e,f�^�]g,h�^�D�|�I�ҧΦ��|��Ϊ����n�H
      �ϡG
      |a�@b|
      |c�@d|
      |e�@f|�@���H 2 = �]a x d + c x f + e x h + g x b - b x c - d x e - f x g - h x a�^���H 2
      |g�@h|
      |a�@b|
      */
      //let _size = (_extent_3826[0].x * _extent_3826[1].y + _extent_3826[1].x * _extent_3826[2].y + _extent_3826[2].x * _extent_3826[3].y + _extent_3826[3].x * _extent_3826[0].y
      //    - _extent_3826[0].y * _extent_3826[1].x - _extent_3826[1].y * _extent_3826[2].x - _extent_3826[2].y * _extent_3826[3].x - _extent_3826[3].y * _extent_3826[0].x) / 2.0;
      //return _size;
    }
    /*setExtent(dgXY_lt_xy, dgXY_rb_xy) {
        this._lt_xy = new dgXY(Math.min(dgXY_lt_xy.x, dgXY_rb_xy.x), Math.max(dgXY_lt_xy.y, dgXY_rb_xy.y));
        this._rb_xy = new dgXY(Math.max(dgXY_lt_xy.x, dgXY_rb_xy.x), Math.min(dgXY_lt_xy.y, dgXY_rb_xy.y));
        this.setURL(this._src);
    }
    */
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      if (this._instance != null) {
        var p3857_lt = ol.proj.transform([this._lt_xy.x, this._lt_xy.y], "EPSG:4326", "EPSG:3857");
        var p3857_rb = ol.proj.transform([this._rb_xy.x, this._rb_xy.y], "EPSG:4326", "EPSG:3857");
        var left = p3857_lt[0];
        var top = p3857_lt[1];
        var right = p3857_rb[0];
        var bottom = p3857_rb[1];
        this._easymap._olmap.getView().fit([left, bottom, right, top], this._easymap._olmap.getSize());
      }
    }
  }, {
    key: "getURL",
    value: function getURL() {
      return this._src;
    }
  }, {
    key: "setURL",
    value: function setURL(src) {
      this._src = src;
      var p3857_lt = ol.proj.transform([this._lt_xy.x, this._lt_xy.y], "EPSG:4326", "EPSG:3857");
      var p3857_rb = ol.proj.transform([this._rb_xy.x, this._rb_xy.y], "EPSG:4326", "EPSG:3857");
      //�o�̪� extent �� minx miny maxx maxy
      var extent = [p3857_lt[0], p3857_rb[1], p3857_rb[0], p3857_lt[1]
      /*Math.min(p3857_lt[0], p3857_rb[0]),
      Math.min(p3857_lt[1], p3857_rb[1]),
      Math.max(p3857_lt[0], p3857_rb[0]),
      Math.max(p3857_lt[1], p3857_rb[1])*/];
      var s = new ol.source.ImageStatic({
        url: this._src,
        crossOrigin: 'anonymous',
        projection: "EPSG:3857",
        imageExtent: extent,
        imageLoadFunction: function (image, src) {
          //console.log(src);
          //console.log(image);
          image.getImage().src = src;
          //console.log(ol.extent);
          //console.log(extent);
          //window['wtf'] = this;
          //window['wtf1'] = image;              

          image.getImage().width = this._width == "auto" ? ol.extent.getWidth(extent) : this._width;
          image.getImage().height = this._height == "auto" ? ol.extent.getHeight(extent) : this._height;

          //image.getImage().width = ol.extent.getWidth(extent);
          //image.getImage().height = ol.extent.getHeight(extent);

          //console.log(dgstaticimage);
          //console.log(image.getImage().width);
          //console.log(ol.extent.getWidth(extent));
          //console.log(ol.extent.getHeight(extent));
        }.bind(this)
        //imageSmoothing: false, 
      });
      this._instance.setSource(s);
    }
  }]);
  return dgStaticImage;
}();
/* harmony default export */ const dg_dgStaticImage = (dgStaticImage_dgStaticImage);
;// CONCATENATED MODULE: ./src/dg/dgKml.js
function dgKml_typeof(o) { "@babel/helpers - typeof"; return dgKml_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgKml_typeof(o); }
function dgKml_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgKml_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgKml_toPropertyKey(o.key), o); } }
function dgKml_createClass(e, r, t) { return r && dgKml_defineProperties(e.prototype, r), t && dgKml_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgKml_toPropertyKey(t) { var i = dgKml_toPrimitive(t, "string"); return "symbol" == dgKml_typeof(i) ? i : i + ""; }
function dgKml_toPrimitive(t, r) { if ("object" != dgKml_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgKml_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgKml = /*#__PURE__*/function () {
  function dgKml(url, callback) {
    dgKml_classCallCheck(this, dgKml);
    //private
    this._easymap = null;
    this._type = 'dgkml';
    this._url = url;
    this._callback = callback;
    this._instance = null;
    this._async = false;
    this._setUpperZoomByBoundary = false; //whether uses most best view range
    this._xhr = null; //networklink httprequest
    //考慮新增，但意義不大，實際還是以 kml 內容為主
    //this._defaultIconScale = 1.0; //預設大小改 1.0 好了?
    this._gMarkerEnabled = false;
    this._distance = 50;
    this._threshold = 1;
    this._Style = new dgGStyle();
    this._dash = {
      lineDash: [0, 0],
      lineCap: 'round'
    };
    //2022-01-24 修正 dgGStyle 裡的 _easymap
    //改到 easymap.js 裡 #
    //this._Style._easymap = this._easymap;

    this._isZoomClusterEnabled = true; //whether 到某zoom關閉cluster
    this._clusterZoom = 17; // 預設18層以上不分群
    this._defaultStyles = null;
    this._zIndex = 1;
    this._isLinestringArrowEnabled = false; //是否開啟LineString arrow

    this._showInSelect = true; //可顯示在點開的下拉選單
    this._lineStringIconsrc = '';
    this._lineStringStyle = null;
    this._lineStringWidth = 2;
    this._zoomThreshold = 0;
    this._featureSelect = true;
    this._styleCache = {
      //加快cluster style
      h: null,
      m: null,
      l: null
    };
    //public
    this.url = url;

    //#events 
    this.onFeatureSelect = null;
    this.onFeatureUnselect = null;
    this._onFeatureHover = null;
    this.labelVisible = false; //whether label shows or not
    this.iconVisible = false; //whether icon shows or not
    this.useNetworkLink = true; //whether use networklink
    this.opacity = 1;
    this._styleUpdated = null; //已更新過的 style

    this._heatmapObj = null; //如果變成 heatmap 這裡就不是 null
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
    this._wkt = null;
    this.bufferObj = null;
    return this;
  }
  dgKml_createClass(dgKml, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgKml_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        features[i]._easymapFeatureOrinStyle = new Array();
        for (var j = 0, max_j = originStyles.length; j < max_j; j++) {
          var d = {
            text: originStyles[j].getText == null || originStyles[j].getText() == null || originStyles[j].getText().getColor == null ? null : originStyles[j].getText().getColor(),
            textfill: originStyles[j].getText == null || originStyles[j].getText() == null || originStyles[j].getText().getFill == null || originStyles[j].getText().getFill() == null || originStyles[j].getText().getFill().getColor == null ? null : originStyles[j].getText().getFill().getColor(),
            stroke: originStyles[j].getStroke == null || originStyles[j].getStroke() == null || originStyles[j].getStroke().getColor == null ? null : originStyles[j].getStroke().getColor(),
            fill: originStyles[j].getFill == null || originStyles[j].getFill() == null || originStyles[j].getFill().getColor == null ? null : originStyles[j].getFill().getColor(),
            image: originStyles[j].getImage == null || originStyles[j].getImage() == null || originStyles[j].getImage().getFill == null || originStyles[j].getImage().getFill() == null || originStyles[j].getImage().getFill().getColor == null ? null : originStyles[j].getImage().getFill().getColor(),
            //改顏色必需觸發一次改大小，才會生效
            //point 特有
            radius: originStyles[j].getImage == null || originStyles[j].getImage() == null || originStyles[j].getImage().getRadius == null ? null : originStyles[j].getImage().getRadius()
          };
          //this._flashFocusData.orinStyle.push(d);
          features[i]._easymapFeatureOrinStyle.push(d);
        }
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              for (var _i = 0, _max_i = features.length; _i < _max_i; _i++) {
                var _color = features[_i]._dgkml._flashFocusData.flashColor;
                var isNeedFlash = false; //如果需要閃才會變 true
                if (features[_i]._dgkml._flashFocusData.filters == null) {
                  isNeedFlash = true; //沒有限制條件，皆要閃
                } else if (Array.isArray(features[_i]._dgkml._flashFocusData.filters)) {
                  for (var _j = 0, _max_j = features[_i]._dgkml._flashFocusData.filters.length; _j < _max_j; _j++) {
                    var _obj = features[_i]._dgkml._flashFocusData.filters[_j];
                    //console.log(obj);
                    if (_obj['attr'] == null || _obj['kind'] == null || _obj['value'] == null) {
                      console.log(" filter 條件異常，需為：{'attr':'欄位','kind':'如: == 、 != 、 >= 、 <= 、 > 、 < 、 like','value':'123' ");
                      continue;
                    }
                    var _dataObj = features[_i].values_;
                    //console.log(_dataObj);
                    if (_dataObj[_obj['attr']] == null) {
                      console.log(" filter 條件異常，kml 屬性資料沒有「" + _obj['attr'] + "」");
                      continue; //continue for
                    }
                    switch (_obj['kind'].toLowerCase()) {
                      case '==':
                        {
                          if (_dataObj[_obj['attr']] == _obj['value']) {
                            isNeedFlash = true;
                          }
                        }
                        break;
                      case '!=':
                        {
                          if (_dataObj[_obj['attr']] != _obj['value']) {
                            isNeedFlash = true;
                          }
                        }
                        break;
                      case '>':
                        {
                          if (parseFloat(_dataObj[_obj['attr']]) > parseFloat(_obj['value'])) {
                            isNeedFlash = true;
                          }
                        }
                        break;
                      case '>=':
                        {
                          if (parseFloat(_dataObj[_obj['attr']]) >= parseFloat(_obj['value'])) {
                            isNeedFlash = true;
                          }
                        }
                        break;
                      case '<':
                        {
                          if (parseFloat(_dataObj[_obj['attr']]) < parseFloat(_obj['value'])) {
                            isNeedFlash = true;
                          }
                        }
                        break;
                      case '<=':
                        {
                          if (parseFloat(_dataObj[_obj['attr']]) <= parseFloat(_obj['value'])) {
                            isNeedFlash = true;
                          }
                        }
                        break;
                      case 'like':
                        {
                          if (features[_i]._dgkml._easymap._is_string_like(_dataObj[_obj['attr']], '%' + _obj['value'] + '%')) {
                            isNeedFlash = true;
                          }
                        }
                        break;
                    }
                    if (isNeedFlash) {
                      //如果有客製符合的顏色
                      _color = _obj['flashColor'] != null ? _obj['flashColor'] : _color;
                      break;
                    } //break for
                  }
                }
                if (isNeedFlash) {
                  var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                  var new_color_with_opacity = features[_i]._dgkml._easymap.colorValues(_color);
                  console.log(obj);
                  console.log(_color);
                  for (var _j2 = 0, _max_j2 = originStyles.length; _j2 < _max_j2; _j2++) {
                    features[_i]._easymapFeatureOrinStyle[_j2].text == null || originStyles[_j2].getText == null || originStyles[_j2].getText() == null || originStyles[_j2].getText().setColor == null ? null : originStyles[_j2].getText().setColor(_color);
                    features[_i]._easymapFeatureOrinStyle[_j2].textfill == null || originStyles[_j2].getText == null || originStyles[_j2].getText() == null || originStyles[_j2].getText().getFill == null || originStyles[_j2].getText().getFill() == null || originStyles[_j2].getText().getFill().setColor == null ? null : originStyles[_j2].getText().getFill().setColor(_color);
                    features[_i]._easymapFeatureOrinStyle[_j2].stroke == null || originStyles[_j2].getStroke == null || originStyles[_j2].getStroke() == null || originStyles[_j2].getStroke().setColor == null ? null : originStyles[_j2].getStroke().setColor(_color);
                    //console.log(this._easymap);

                    //這裡用 0.5 opacity 
                    features[_i]._easymapFeatureOrinStyle[_j2].fill == null || originStyles[_j2].getFill == null || originStyles[_j2].getFill() == null || originStyles[_j2].getFill().setColor == null ? null : originStyles[_j2].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                    features[_i]._easymapFeatureOrinStyle[_j2].image == null || originStyles[_j2].getImage == null || originStyles[_j2].getImage() == null || originStyles[_j2].getImage().getFill == null || originStyles[_j2].getImage().getFill().setColor == null ? null : originStyles[_j2].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                    features[_i]._easymapFeatureOrinStyle[_j2].radius == null || originStyles[_j2].getImage == null || originStyles[_j2].getImage() == null || originStyles[_j2].getImage().getRadius == null ? null : originStyles[_j2].getImage().setRadius(features[_i]._easymapFeatureOrinStyle[_j2].radius);
                  }
                } else {
                  var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                  for (var _j3 = 0, _max_j3 = originStyles.length; _j3 < _max_j3; _j3++) {
                    features[_i]._easymapFeatureOrinStyle[_j3].text == null ? null : originStyles[_j3].getText().setColor(features[_i]._easymapFeatureOrinStyle[_j3].text);
                    features[_i]._easymapFeatureOrinStyle[_j3].textfill == null ? null : originStyles[_j3].getText().getFill().setColor(features[_i]._easymapFeatureOrinStyle[_j3].textfill);
                    features[_i]._easymapFeatureOrinStyle[_j3].stroke == null ? null : originStyles[_j3].getStroke().setColor(features[_i]._easymapFeatureOrinStyle[_j3].stroke);
                    features[_i]._easymapFeatureOrinStyle[_j3].fill == null ? null : originStyles[_j3].getFill().setColor(features[_i]._easymapFeatureOrinStyle[_j3].fill);
                    features[_i]._easymapFeatureOrinStyle[_j3].image == null ? null : originStyles[_j3].getImage().getFill().setColor(features[_i]._easymapFeatureOrinStyle[_j3].image);
                    features[_i]._easymapFeatureOrinStyle[_j3].radius == null || originStyles[_j3].getImage == null || originStyles[_j3].getImage().setRadius == null ? null : originStyles[_j3].getImage().setRadius(features[_i]._easymapFeatureOrinStyle[_j3].radius);
                  }
                }
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              for (var _i2 = 0, _max_i2 = features.length; _i2 < _max_i2; _i2++) {
                var originStyles = features[_i2].getStyleFunction().call(null, features[_i2]);
                for (var _j4 = 0, _max_j4 = originStyles.length; _j4 < _max_j4; _j4++) {
                  features[_i2]._easymapFeatureOrinStyle[_j4].text == null ? '' : originStyles[_j4].getText().setColor(features[_i2]._easymapFeatureOrinStyle[_j4].text);
                  features[_i2]._easymapFeatureOrinStyle[_j4].textfill == null ? '' : originStyles[_j4].getText().getFill().setColor(features[_i2]._easymapFeatureOrinStyle[_j4].textfill);
                  features[_i2]._easymapFeatureOrinStyle[_j4].stroke == null ? '' : originStyles[_j4].getStroke().setColor(features[_i2]._easymapFeatureOrinStyle[_j4].stroke);
                  features[_i2]._easymapFeatureOrinStyle[_j4].fill == null ? '' : originStyles[_j4].getFill().setColor(features[_i2]._easymapFeatureOrinStyle[_j4].fill);
                  features[_i2]._easymapFeatureOrinStyle[_j4].image == null ? '' : originStyles[_j4].getImage().getFill().setColor(features[_i2]._easymapFeatureOrinStyle[_j4].image);
                  features[_i2]._easymapFeatureOrinStyle[_j4].radius == null || originStyles[_j4].getImage == null || originStyles[_j4].getImage().setRadius == null ? '' : originStyles[_j4].getImage().setRadius(features[_i2]._easymapFeatureOrinStyle[_j4].radius);
                }
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      //自然走完
      this._flashFocusData.runTimes = 1;
      this._flashFocusData._cFlag = -1;
      /*
      clearInterval(this._flashFocusData.runInterval); //stop
      let features = this._instance.getSource().getFeatures();
      for (let i = 0, max_i = features.length; i < max_i; i++) {
          var originStyles = features[i].getStyleFunction().call(null, features[i]);
          (features[i]._easymapFeatureOrinStyle[j].text == null) ? '' : originStyles[0].getText().setColor(features[i]._easymapFeatureOrinStyle[j].text);
          (features[i]._easymapFeatureOrinStyle[j].stroke == null) ? '' : originStyles[0].getStroke().setColor(features[i]._easymapFeatureOrinStyle[j].stroke);
          (features[i]._easymapFeatureOrinStyle[j].fill == null) ? '' : originStyles[0].getFill().setColor(features[i]._easymapFeatureOrinStyle[j].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
      */
    }
  }, {
    key: "getZIndex",
    value: function getZIndex() {
      return this._zIndex;
    }
  }, {
    key: "setZIndex",
    value: function setZIndex(val) {
      this._zIndex = parseInt(val);
      //console.log(this);
      if (this._easymap != null && this._easymap.setItemZIndex != null) {
        this._easymap.setItemZIndex(this, this.getZIndex());
      }
    }
  }, {
    key: "setZoomWithoutCluster",
    value: function setZoomWithoutCluster(tf, zoom) {
      if (typeof tf != 'boolean') return;
      this._isZoomClusterEnabled = tf;
      this._clusterZoom = parseInt(zoom);
    }
  }, {
    key: "enableLineStringArrow",
    value: function enableLineStringArrow(iconsrc, strokeStyle, lineWidth, zoomThreshold) {
      this._isLinestringArrowEnabled = true;
      this._lineStringIconsrc = iconsrc;
      this._lineStringStyle = strokeStyle;
      this._lineStringWidth = lineWidth;
      if (zoomThreshold == undefined) zoomThreshold = 0;
      this._zoomThreshold = zoomThreshold; //超過哪個zoom才開啟，預設為0
    }
  }, {
    key: "disalbeLineStringArrow",
    value: function disalbeLineStringArrow() {
      this._isLinestringArrowEnabled = false;
    }
  }, {
    key: "enableHeatmap",
    value: function enableHeatmap(opt) {
      if (this._instance != null) {
        if (this._heatmapObj != null) {
          this._easymap.removeItem(this._heatmapObj);
        }
        this._heatmapObj = new dgHeatmap(this, opt);
        this._easymap.addItem(this._heatmapObj);
        this.setOpacity(0);
      } else {
        console.log("dgKml 需先 addItem 至圖台才能使用 enableHeatmap...");
      }
    }
  }, {
    key: "disableHeatmap",
    value: function disableHeatmap() {
      if (this._heatmapObj != null) {
        this._easymap.removeItem(this._heatmapObj);
      }
      if (this.getOpacity() == 0) {
        this.setOpacity(1);
      }
    }
  }, {
    key: "enableCluster",
    value: function enableCluster(distance, threshold, dgGStyle) {
      this._gMarkerEnabled = true;
      this._distance = distance;
      this._threshold = threshold;
      this._Style = dgGStyle;
    }
  }, {
    key: "setClusterEnable",
    value: function setClusterEnable(distance, threshold, dgGStyle) {
      this._gMarkerEnabled = true;
      this._distance = distance;
      this._threshold = threshold;
      this._Style = dgGStyle;
    }
  }, {
    key: "setLabelVisible",
    value: function setLabelVisible(tf) {
      if (typeof tf != 'boolean') return;
      this.labelVisible = tf;
    }
  }, {
    key: "setIconVisible",
    value: function setIconVisible(tf) {
      if (typeof tf != 'boolean') return;
      this.iconVisible = tf;
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary(tf) {
      if (typeof tf != 'boolean') return;
      this._setUpperZoomByBoundary = tf;
      if (tf == true) {
        if (this._instance != null) {
          var features = this._instance.getSource().getFeatures();
          this._easymap._zoomByBoundary(features);
        }
      }
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      if (!isNaN(val) == false) val = 1;
      this.opacity = parseFloat(val);
      //console.log(this);        
      this._instance.setOpacity(this.opacity);
    }
  }, {
    key: "getOpacity",
    value: function getOpacity() {
      return this.opacity;
    }
  }, {
    key: "getStrokeWidth",
    value: function getStrokeWidth() {
      return this._lineStringWidth;
    }
  }, {
    key: "setFillColor",
    value: function setFillColor(val) {
      this._fillStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        for (var i = 0, max_i = features.length; i < max_i; i++) {
          var originStyles = features[i].getStyleFunction().call(null, features[i]);
          if (originStyles[0].getFill() == null) continue;
          originStyles[0].getFill().setColor(val);

          //redraw
          //features[0].setStyle(features[0].getStyle());
        }
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "setStrokeWidth",
    value: function setStrokeWidth(val) {
      if (!isNaN(val) == false) val = 1;
      this._lineStringWidth = parseFloat(val);
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        for (var i = 0, max_i = features.length; i < max_i; i++) {
          var originStyles = features[i].getStyleFunction().call(null, features[i]);
          //console.log(originStyles);
          if (originStyles[0].getStroke == null) continue;
          var s = originStyles[0].getStroke();
          s.setWidth(val);
          //redraw
          //features[i].setStyle(features[i].getStyle());
        }
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getStrokeColor",
    value: function getStrokeColor() {
      return this._lineStringStyle;
    }
  }, {
    key: "setStrokeColor",
    value: function setStrokeColor(val) {
      this._lineStringStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        for (var i = 0, max_i = features.length; i < max_i; i++) {
          var originStyles = features[i].getStyleFunction().call(null, features[i]);
          if (originStyles[0].getStroke == null) continue;
          originStyles[0].getStroke().setColor(val);
          //redraw
          //features[i].setStyle(features[i].getStyle());
        }
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "setFeatureClick",
    value: function setFeatureClick(handler) {
      this.onFeatureSelect = handler;
    }
  }, {
    key: "setFeatureHover",
    value: function setFeatureHover(handler) {
      this._onFeatureHover = handler;
    }
  }, {
    key: "setFeatureSelectDisabled",
    value: function setFeatureSelectDisabled() {
      this._featureSelect = true;
    }
  }, {
    key: "setFeatureSelect",
    value: function setFeatureSelect(tf) {
      if (typeof tf != 'boolean') return;
      this._featureSelect = tf;
    }
  }, {
    key: "getShowInSelect",
    value: function getShowInSelect() {
      return this._showInSelect;
    }
  }, {
    key: "setShowInSelect",
    value: function setShowInSelect(tf) {
      if (typeof tf != 'boolean') return;
      this._showInSelect = tf;
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      return new dgXY((_extent_4326[0] + _extent_4326[2]) / 2.0, (_extent_4326[1] + _extent_4326[3]) / 2.0);
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      var _size = 0;
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].getGeometry().getArea != null) {
          _size += this._instance.getSource().getFeatures()[i].getGeometry().getArea();
        }
      }
      return _size;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {}
  }, {
    key: "getAttributeByName",
    value: function getAttributeByName() {}
  }, {
    key: "getStyleByName",
    value: function getStyleByName() {}
    /*
     * map._olmap.getLayers().getArray()[1].getSource().getFeatures()[0].getStyleFunction().call(map._olmap.getLayers().getArray()[1].getSource().getFeatures()[0])
     * */
    /*
    /*
        fill	{Boolean}
        fillColor	{String}
        fillOpacity	{Number}
        stroke	{Boolean}
        strokeColor	{String}
        strokeOpacity	{Number}
        strokeWidth	{Number}
        strokeLinecap	{String}
        strokeDashstyle	{String}
        graphic	{Boolean}
        pointRadius	{Number}
        pointerEvents	{String}
        cursor	{String}
        externalGraphic	{String}
        graphicWidth	{Number}
        graphicHeight	{Number}
        graphicOpacity	{Number}
        graphicXOffset	{Number}
        graphicYOffset	{Number}
        rotation	{Number}
        graphicZIndex	{Number}
        graphicName	{String}
        graphicTitle	{String}
        title	{String}
        backgroundGraphic	{String}
        backgroundGraphicZIndex	{Number}
        backgroundXOffset	{Number}
        backgroundYOffset	{Number}
        backgroundHeight	{Number}
        backgroundWidth	{Number}
        label	{String}
        labelAlign	    {String}
        labelXOffset	{Number}
        labelYOffset	{Number}
        labelSelect	{Boolean}
        labelOutlineColor	{String}
        labelOutlineWidth	{Number}
        labelOutlineOpacity	{Number}
        fontColor	{String}
        fontOpacity	{Number}
        fontFamily	{String}
        fontSize	{String}
        fontStyle	{String}
        fontWeight	{String}
        display	{String}
        imageOpacity    {Number}        ImageOverlay
    */
  }, {
    key: "getUpdateStyle",
    value: function getUpdateStyle() {
      return this._styleUpdated;
    }
  }, {
    key: "updateStyle",
    value: function updateStyle(style) {
      if (style == undefined) return;

      //let type = this._instance.getType().toLowerCase();
      if (this.getType() == null) return;
      var type = this.getType().toLowerCase();
      if (type == 'image') {
        if (style.imageOpacity != undefined) {
          var opacity = parseFloat(style.imageOpacity);
          this._instance.setOpacity(opacity);
        }
      }
      if (type == 'vector') {
        var features = this._instance.getSource().getFeatures();
        if (features.length <= 0) return;
        var originStyles = features[0].getStyleFunction().call(null, features[0]);

        //# 重建olStyle
        var styler = [];
        //console.log(this); 
        for (var i = 0; i < originStyles.length; i++) {
          styler.push(this._easymap._getOlStyleFromStyleFunction(originStyles[i]));
        }
        //# 更新style
        for (var _i3 = 0; _i3 < originStyles.length; _i3++) {
          this._easymap._updateOlStyle(styler[_i3], style);
        }

        //# 讀出 Feature
        /*for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            feature.setStyle(styler);
          }*/
        this._instance.getSource().dispatchEvent('change');
      }
      if (this._styleUpdated == null) {
        this._styleUpdated = this._easymap._objMergeDeep(style);
      } else {
        this._styleUpdated = this._easymap._objMergeDeep(this._styleUpdated, style);
      }
    }
  }, {
    key: "enableDashed",
    value: function enableDashed(val) {
      //val 可不填，預設為 [4,8]
      //啟動 dash
      if (val == null) {
        this._dash.lineDash = [4, 8];
      } else {
        this._dash.lineDash = val;
      }
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        if (features.length > 0) {
          for (var i = 0, max_i = features.length; i < max_i; i++) {
            var originStyles = features[i].getStyleFunction().call(null, features[i]);
            if (originStyles.length > 0) {
              originStyles[0].getStroke().setLineDash(this._dash.lineDash);
            }
            //features[i].setStyle(features[i].getStyle());
          }
          this._instance.getSource().dispatchEvent('change');
        } else {
          console.log("Error ... features 為 0");
        }
      }
    }
  }, {
    key: "disableDashed",
    value: function disableDashed() {
      this.enableDashed([0, 0]);
    }
  }, {
    key: "updateStyleByName",
    value: function updateStyleByName(name, style) {
      if (name == undefined) return;
      if (style == undefined) return;
      var features = this._instance.getSource().getFeatures();
      var targetFeature = null;

      //# 讀出 Name 的 Feature
      for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var properties = feature.getProperties();
        if (properties.name == undefined) continue;
        if (name == properties.name) {
          targetFeature = feature;
          break;
        }
      }
      if (targetFeature == null) return false;
      var originStyles = targetFeature.getStyleFunction().call(null, targetFeature);

      //# 重建olStyle
      var styler = [];
      for (var _i4 = 0, max_i = originStyles.length; _i4 < max_i; _i4++) {
        styler.push(this._getOlStyleFromStyleFunction(originStyles[_i4]));
      }
      //# 更新style
      for (var _i5 = 0; _i5 < originStyles.length; _i5++) {
        this._updateOlStyle(styler[_i5], style);
      }
      targetFeature.setStyle(styler);
    }
  }, {
    key: "updateStyleByAttribute",
    value: function updateStyleByAttribute() {}
  }, {
    key: "getGeometryTypes",
    value: function getGeometryTypes() {
      var m = [];
      var features = this._instance.getSource().getFeatures();
      for (var i = 0; i < features.length; i++) {
        var geometryType = features[i].getGeometry().getType();
        if (m.indexOf(geometryType) == -1) {
          m.push(geometryType);
        }
      }
      return m;
    }
  }, {
    key: "getType",
    value: function getType() {
      if (this._instance != null) {
        if (this._instance.getType != null) {
          return this._instance.getType();
        } else {
          if (this._instance.constructor.name.toLowerCase() == "imagelayer") {
            return "image";
          } else {
            return "vector";
          }
        }
      }
      return null;
    }
  }, {
    key: "disableScaleRotate",
    value: function disableScaleRotate() {
      if (this._interaction != null) {
        this._easymap._olmap.removeInteraction(this._interaction);
      }
    }
  }, {
    key: "enableScaleRotate",
    value: function enableScaleRotate(obj) {
      this.disableScaleRotate();
      /*obj : 
      {              
        scale : true,
        rotate : true,
        stop: function(evt){
        }
      }
      */
      var firstPoint = false;
      var isScale = true;
      var isRotate = true;
      if (typeof obj != "undefined" && typeof obj.scale == "boolean") {
        isScale = obj.scale;
      }
      if (typeof obj != "undefined" && typeof obj.rotate == "boolean") {
        isRotate = obj.rotate;
      }
      this._interaction = new ol.interaction.Transform({
        enableRotatedTransform: false,
        /* Limit interaction inside bbox * /
        condition: function(e, features) {
          return ol.extent.containsXY([-465960, 5536486, 1001630, 6514880], e.coordinate[0], e.coordinate[1]);
        },
        /* */
        addCondition: ol.condition.shiftKeyOnly,
        // filter: function(f,l) { return f.getGeometry().getType()==='Polygon'; },
        layers: [this._instance],
        //window.data[2].easyobj._instance],
        hitTolerance: 2,
        translateFeature: true,
        //$("#translateFeature").prop('checked'),
        scale: isScale,
        //$("#scale").prop('checked'),
        rotate: isRotate,
        //$("#rotate").prop('checked'),
        keepAspectRatio: ol.condition.always,
        //$("#keepAspectRatio").prop('checked') ? ol.events.condition.always : undefined,
        translate: true,
        //$("#translate").prop('checked'),
        stretch: true //$("#stretch").prop('checked')
      });
      //map.addInteraction(interaction);
      //console.log(this);    
      this._easymap._olmap.addInteraction(this._interaction);
      // Style handles
      //setHandleStyle();
      // Events handlers
      var startangle = 0;
      var d = [0, 0];

      // Handle rotate on first point
      var firstPoint = false;
      // default center
      firstPoint = false;
      this._interaction.setCenter();
      this._interaction.on(['select'], function (e) {
        if (firstPoint && e.features && e.features.getLength()) {
          interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
        //console.log(this);
        if (this.onedit_select != null) {
          //console.log(this.onclick.toString());
          //當編輯結束以後，會觸發 onedit_select 事件
          this.onedit_select(e);
        }
      }.bind(this));
      this._interaction.on(['rotatestart', 'translatestart'], function (e) {
        // Rotation
        startangle = e.feature.get('angle') || 0;
        // Translation
        d = [0, 0];
      });
      this._interaction.on('rotating', function (e) {
        //$('#info').text("rotate: "+((e.angle*180/Math.PI -180)%360+180).toFixed(2)); 
        // Set angle attribute to be used on style !
        e.feature.set('angle', startangle - e.angle);
      });
      this._interaction.on('translating', function (e) {
        d[0] += e.delta[0];
        d[1] += e.delta[1];
        //$('#info').text("translate: "+d[0].toFixed(2)+","+d[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on('scaling', function (e) {
        //$('#info').text("scale: "+e.scale[0].toFixed(2)+","+e.scale[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on(['rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        switch (this._type) {
          case 'dgkml':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            try {
              for (var i = 0; i < e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                this._xs.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                this._ys.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
              }
            } catch (_unused) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "enableEditor",
    value: function enableEditor() {
      this.disableEditor();
      this._modify = new ol.interaction.Modify({
        source: this._instance.getSource()
      });
      this._easymap._olmap.addInteraction(this._modify);
      this._modify.on(['modifyend', 'rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        //console.log(e);
        //console.log(this);
        //window['wtf']=e;
        //window['wtff']=this;
        switch (this._type) {
          case 'dgkml':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            //console.log(e);
            //window['wtf']=e;   
            try {
              for (var i = 0; i < e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                this._xs.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                this._ys.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
              }
            } catch (_unused2) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "disableEditor",
    value: function disableEditor() {
      if (this._modify != null) {
        this._easymap._olmap.removeInteraction(this._modify);
      }
    }
  }, {
    key: "getClosestData",
    value: function getClosestData(wkt_or_dgxy, counts) {
      // 此 getClosestData 可以搜尋 wkt 陣列的資料，查找最接近傳入 WKT 或 dgXY 的內容，counts 為回傳筆數，如為 null 則全數回傳。
      switch (wkt_or_dgxy.constructor.name.toLowerCase()) {
        case "dgxy":
          {
            wkt_or_dgxy = "POINT(" + wkt_or_dgxy.x + " " + wkt_or_dgxy.y + ")";
          }
          break;
      }
      //統一用 wkt 來讀取
      if (!Array.isArray(this._wkt)) {
        console.log("此 dgWKT 尚未載入 wkt ");
        return false;
      }
      var gf = new ol.format.WKT();
      var from_geome = gf.readFeatures(wkt_or_dgxy, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      var output = new Array();
      for (var i = 0, max_i = this._wkt.length; i < max_i; i++) {
        var geome = gf.readFeatures(this._wkt[i]['wkt'], {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        //this._wkt[i]['geome'] = geome;
        //只跟 geome[0] 比
        output.push(this._wkt[i]);
        var index = output.length - 1;
        output[index]['getClosestData_index'] = i;
        output[index]['getClosestData_distance'] = this._easymap._getShortestLineDistance(from_geome[0].getGeometry(), geome[0].getGeometry());
      }

      //排序
      output = this._easymap._array_sort(output, "getClosestData_distance", "ASC");
      //看看 counts 有沒有值
      if (!isNaN(counts)) {
        output = output.slice(0, counts);
      }
      return output;
      //window['wtf_output'] = output;
      //window['wtf'] = from_geome;
    }
  }]);
  return dgKml;
}();
/* harmony default export */ const dg_dgKml = (dgKml);
;// CONCATENATED MODULE: ./src/dg/dgXY.js
function dgXY_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var dgXY_dgXY = function dgXY(cdx, cdy, tf) {
  dgXY_classCallCheck(this, dgXY);
  this.x = cdx == null ? null : parseFloat(cdx);
  this.y = cdy == null ? null : parseFloat(cdy);
  this.os = tf == null ? false : tf;
  this.xy = [this.x, this.y];
  this.yx = [this.y, this.x];
  this.lon = this.x;
  this.lat = this.y;
};
/* harmony default export */ const dg_dgXY = (dgXY_dgXY);
;// CONCATENATED MODULE: ./src/dg/dgXYZ.js
function dgXYZ_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var dgXYZ = function dgXYZ(cdx, cdy, cdz, tf) {
  dgXYZ_classCallCheck(this, dgXYZ);
  this.x = cdx == null ? null : parseFloat(cdx);
  this.y = cdy == null ? null : parseFloat(cdy);
  this.z = cdy == null ? null : parseFloat(cdz);
  this.os = tf == null ? false : tf;
  this.xyz = [this.x, this.y, this.z];
  this.zyx = [this.z, this.y, this.x];
  this.lon = this.x;
  this.lat = this.y;
  this.alt = this.z;
};
/* harmony default export */ const dg_dgXYZ = (dgXYZ);
;// CONCATENATED MODULE: ./src/dg/dgMarker.js
function dgMarker_typeof(o) { "@babel/helpers - typeof"; return dgMarker_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgMarker_typeof(o); }
function dgMarker_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgMarker_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgMarker_toPropertyKey(o.key), o); } }
function dgMarker_createClass(e, r, t) { return r && dgMarker_defineProperties(e.prototype, r), t && dgMarker_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgMarker_toPropertyKey(t) { var i = dgMarker_toPrimitive(t, "string"); return "symbol" == dgMarker_typeof(i) ? i : i + ""; }
function dgMarker_toPrimitive(t, r) { if ("object" != dgMarker_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgMarker_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgMarker = /*#__PURE__*/function () {
  function dgMarker(dgxy, mobj, drag) {
    dgMarker_classCallCheck(this, dgMarker);
    this._easymap = null;
    this._type = 'dgmarker';
    this._dgxy = dgxy == null ? null : dgxy;
    this._dgicon = mobj;
    this._htmlstr = '';
    this._drag = drag == null ? false : drag;
    this._instance = null;
    this._scale = 1;
    this._opacity = 1;
    this._rotate = 0;
    this._anchor = [0.5, 1]; // 預設底部中間
    this._icontype = 'dgicon'; //dgicon|string
    this._text = '';
    this._textStyle = null; //text style
    var dg_DEFAULT_ICON = "imgs/icon01.png";
    this.bufferObj = null;
    //# 事件介面
    this.ondragend = null; //v7
    this.onclick = null;
    this.ondblclick = null;
    this.mouseover = null;
    this.mouseout = null;
    this.mousedown = null;
    this.mouseup = null;
    this.dragfeatures = [];
    if (mobj instanceof dgIcon) {
      this._icontype = "dgicon";
      /*this._icontype = "string";
      this._dgicon = null;
      this._htmlstr = "<img \
                          src=\""+mobj._src+"\" \
                          width=\""+mobj._w+"\" \
                          height=\""+mobj._h+"\" \
                          
                       >";
                       */
    } else if (typeof mobj == 'string') {
      this._icontype = "string";
      this._dgicon = null;
      this._htmlstr = mobj;
    }
  }
  dgMarker_createClass(dgMarker, [{
    key: "getAnchor",
    value: function getAnchor() {
      return this._anchor;
    }
  }, {
    key: "setAnchor",
    value: function setAnchor(anchor) {
      this._anchor = anchor;
      if (this._instance == null) {
        console.log("map.addItem 後才能 setAnchor");
        return;
      }
      this._instance.getSource().getFeatures()[0].getStyle().getImage().setAnchor(anchor);
      //this._instance.getSource().dispatchEvent('change');
      this._instance.getSource().getFeatures()[0].changed(); // 通知變化，觸發重繪
    }
  }, {
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "getScale",
    value: function getScale() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setScale");
        return;
      }
      return this._instance.getSource().getFeatures()[0].getStyle().getImage().getScale();
    }
  }, {
    key: "setScale",
    value: function setScale(scale) {
      this._scale = scale;
      if (this._icontype == "dgicon") {
        this._dgicon._scale = scale;
      }
      if (this._instance == null) {
        console.log("map.addItem 後才能 setScale");
        return;
      }
      this._instance.getSource().getFeatures()[0].getStyle().getImage().setScale(scale);
      //this._instance.getSource().dispatchEvent('change');
      this._instance.getSource().getFeatures()[0].changed(); // 通知變化，觸發重繪
    }
  }, {
    key: "getOpacity",
    value: function getOpacity() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 getOpacity");
        return;
      }
      return this._instance.getSource().getFeatures()[0].getStyle().getImage().getOpacity();
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(opacity) {
      if (this._icontype == "dgicon") {
        this._dgicon._opacity = opacity;
      }
      this._opacity = opacity;
      if (this._instance == null) {
        console.log("map.addItem 後才能 setOpacity");
        return;
      }
      this._instance.getSource().getFeatures()[0].getStyle().getImage().setOpacity(opacity);
      //this._instance.getSource().dispatchEvent('change');
      this._instance.getSource().getFeatures()[0].changed(); // 通知變化，觸發重繪
    }
  }, {
    key: "getRotation",
    value: function getRotation() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 getRotation");
        return;
      }
      return this._instance.getSource().getFeatures()[0].getStyle().getImage().getRotation();
    }
  }, {
    key: "setRotation",
    value: function setRotation(rotation) {
      this._rotate = rotation;
      if (this._icontype == "dgicon") {
        this._dgicon._rotate = rotation;
      }
      if (this._instance == null) {
        console.log("map.addItem 後才能 setRotation");
        return;
      }
      this._instance.getSource().getFeatures()[0].getStyle().getImage().setRotation(rotation * (Math.PI / 180.0));
      //this._instance.getSource().dispatchEvent('change');
      this._instance.getSource().getFeatures()[0].changed(); // 通知變化，觸發重繪
    }
  }, {
    key: "getIcon",
    value: function getIcon() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 getIcon");
        return;
      }
      return this._instance.getSource().getFeatures()[0].getStyle().getImage().getSrc();
    }
  }, {
    key: "setIcon",
    value: function setIcon(src) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setIcon");
        return;
      }
      if (this._icontype == "string") {
        console.log("只支援 dgicon ，網頁模式請直接對 dom 設定");
        return;
      }
      var _this = this;
      this._instance.getSource().getFeatures()[0].getStyle().setImage(new ol.style.Icon({
        src: src,
        // 新圖片
        scale: _this._dgicon._scale,
        opacity: _this._dgicon._opacity,
        rotation: _this._dgicon._rotate * (Math.PI / 180)
      }));

      //this._instance.getSource().dispatchEvent('change');
      this._instance.getSource().getFeatures()[0].changed(); // 通知變化，觸發重繪
    }
  }, {
    key: "enableDrag",
    value: function enableDrag() {
      var _this = this;
      var Drag = function (PointerInteraction) {
        function Drag() {
          PointerInteraction.call(this, {
            handleDownEvent: function handleDownEvent(evt) {
              var feature = evt.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
              });
              if (feature) {
                var findex = _this._OriginFeature.array_.findIndex(function (f) {
                  return f == feature;
                });
                if (findex != -1) {
                  _this.coordinate_ = evt.coordinate;
                  _this.feature_ = feature;
                } else return false;
              }
              return !!feature;
            },
            handleDragEvent: function handleDragEvent(evt) {
              //設定為拖移
              _this._IsDrag = true;
              var deltaX = evt.coordinate[0] - _this.coordinate_[0];
              var deltaY = evt.coordinate[1] - _this.coordinate_[1];
              var geometry = _this.feature_.getGeometry();
              geometry.translate(deltaX, deltaY);
              _this.coordinate_[0] = evt.coordinate[0];
              _this.coordinate_[1] = evt.coordinate[1];
            },
            handleMoveEvent: function handleMoveEvent(evt) {
              if (_this.cursor_) {
                var map = evt.map;
                var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                  return feature;
                });
                var element = evt.map.getTargetElement();
                if (feature) {
                  //確認是否是該物件
                  var findex = _this._OriginFeature.array_.findIndex(function (f) {
                    return f == feature;
                  });
                  if (findex != -1 && element.style.cursor != _this.cursor_) {
                    _this.previousCursor_ = element.style.cursor;
                    element.style.cursor = _this.cursor_;
                  }
                } else if (_this.previousCursor_ !== undefined) {
                  element.style.cursor = _this.previousCursor_;
                  _this.previousCursor_ = undefined;
                }
              }
            },
            handleUpEvent: function handleUpEvent(evt) {
              //確定為拖移在執行
              if (_this._IsDrag) {
                var f = _this.feature_.get('_dgmarker');
                if (f.ondragend != undefined) {
                  var p = ol.proj.transform(_this.feature_.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
                  var xy = new dgXY(p[0], p[1]);
                  f.ondragend.apply(f, [xy, f]);
                }
              }
              _this._IsDrag = false;
              _this.coordinate_ = null;
              _this.feature_ = null;
              return false;
            }
          });
          _this.coordinate_ = null;
          _this.cursor_ = 'pointer';
          _this.feature_ = null;
          _this.previousCursor_ = undefined;
          _this._IsDrag = false;
          _this.dragfeatures = [];
          _this.dragfeatures.push(_this._iconFeature);
          _this._OriginFeature = new ol.Collection(_this.dragfeatures);
        }
        if (PointerInteraction) Drag.__proto__ = PointerInteraction;
        Drag.prototype = Object.create(PointerInteraction && PointerInteraction.prototype);
        Drag.prototype.constructor = Drag;
        return Drag;
      }(ol.interaction.Pointer);
      this.disableDrag();
      this._dragInteraction = new Drag();
      this._easymap._olmap.addInteraction(this._dragInteraction);
      this._drag = true;
    }
  }, {
    key: "disableDrag",
    value: function disableDrag() {
      this._drag = false;
      if (this._easymap != null) {
        this._easymap._olmap.getInteractions().remove(this._dragInteraction);
        this._dragInteraction = null;
      }
    }
  }, {
    key: "_setText",
    value: function _setText(text, style) {
      this._text = text;
      this._textStyle = style;
      if (this._instance == null) return;
      var features = this._instance.getSource().getFeatures();
      for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        if (this._id == feature._dgmarkerId) {
          var originStyles = feature.getStyleFunction().call(null, feature);
          if (originStyles.length >= 1) {
            //# 更新style
            if (originStyles[0].text_ != null) {
              originStyles[0].text_.text_ = text;
            }
            if (this._textStyle != null) {
              //originStyles[0].text_.offsetY_ = this._textStyle.offsetY;
              this._updateOlStyles(originStyles, style);
            }
            //# 重建olStyle
            var styler = [];
            for (var _i = 0; _i < originStyles.length; _i++) {
              styler.push(this._getOlStyleFromStyleFunction(originStyles[_i]));
            }
            //# 置換新的 style
            //feature.setStyle(styler);
          }
        }
      }
      this._instance.getSource().dispatchEvent('change');
      //this._instance.getSource().getFeatures()[0].changed();        // 通知變化，觸發重繪
    }
  }, {
    key: "getXY",
    value: function getXY() {
      //By John
      //var p = this._instance.getSource().getFeatures()[0].getGeometry().getCoordinates();
      //var p = ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
      //var p = this._dgxy;        
      if (this._instance != null && this._instance.getPosition != null) {
        var p = this._instance.getPosition();
        p = ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
        this._dgxy = new dgXY(p[0], p[1]);
        return this._dgxy;
      } else if (this._instance.getSource != null) {
        var p = this._instance.getSource().getFeatures()[0].getGeometry().getCoordinates();
        var p = ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
        this._dgxy = new dgXY(p[0], p[1]);
        return this._dgxy;
      } else {
        return this._dgxy;
      }
    }
  }, {
    key: "getXYZ",
    value: function getXYZ() {
      var o = {};
      o['dgXY'] = this.getXY();
      o['x'] = o['dgXY'].x;
      o['y'] = o['dgXY'].y;
      o['z'] = this.getZ();
      o['height'] = this.getZ();
      return o;
    }
  }, {
    key: "getZ",
    value: function getZ() {
      if (this._icontype == "dgicon") {
        var _p = this._instance.getSource().getFeatures()[0].getGeometry().getCoordinates();
        var _z = 0;
        if (_p.length == 3) {
          _z = _p[2];
        }
        return _z;
      }
      if (this._instance != null && this._instance.getPosition != null) {
        var p = this._instance.getPosition();
        var z = 0;
        if (p.length == 3) {
          z = p[2];
        }
        return z;
      } else {
        var _p2 = this._instance.getSource().getFeatures()[0].getGeometry().getCoordinates();
        var _z2 = 0;
        if (_p2.length == 3) {
          _z2 = _p2[2];
        }
        return _z2;
      }
    }
  }, {
    key: "setZ",
    value: function setZ(z) {
      this._z = z;
      if (this._icontype == "dgicon") {
        //貼地的要移掉才能生效
        this._instance.getSource().getFeatures()[0].getGeometry().values_.altitudeMode = ""; //原為 clampToGround
        var _p = this._instance.getSource().getFeatures()[0].getGeometry().getCoordinates();
        this._instance.getSource().getFeatures()[0].getGeometry().setCoordinates([_p[0], _p[1], z]);
        return;
      }
      if (this._instance != null && this._instance.getPosition != null) {
        var _p3 = this._instance.getPosition();
        this._instance.setPosition([_p3[0], _p3[1], z]);
      } else if (this._instance.getSource != null) {
        var p = this._instance.getSource().getFeatures()[0].getGeometry().getCoordinates();
        p[2] = z;
        this._instance.getSource().getFeatures()[0].getGeometry().setCoordinates(p);
      }
    }
  }, {
    key: "setXYZ",
    value: function setXYZ(dgxy, z) {
      this.setXY(dgxy);
      this.setZ(z);
    }
  }, {
    key: "setXY",
    value: function setXY(dgxy) {
      //By John
      /*this._dgxy = dgxy;
      this._instance.getSource().getFeatures().forEach(function (f) {
          if (this._id === f.get('_easymapId')) {
              f.setGeometry(new ol.geom.Point(ol.proj.transform(this._dgxy.xy, 'EPSG:4326', 'EPSG:3857')));
          }
      }.bind(this));
      */
      if (this._icontype == "dgicon") {
        var _p4 = ol.proj.transform(dgxy.xy, 'EPSG:4326', 'EPSG:3857');
        if (this._instance.getSource().getFeatures().length >= 1) {
          var feature = this._instance.getSource().getFeatures()[0];
          feature.getGeometry().setCoordinates(_p4);
        }
        return;
      }
      if (dgxy.x != null && dgxy.y != null) {
        if (this._instance != null && this._instance.setPosition != null) {
          var p = ol.proj.transform([dgxy.x, dgxy.y], 'EPSG:4326', 'EPSG:3857');
          this._dgxy = dgxy;
          this._instance.setPosition(p);
        } else {
          this._dgxy = dgxy;
          console.log("setXY 需先 addItem 至圖台才能使用，或是 new dgMarker 時定義位置");
        }
      } else {
        console.log("傳入的不是 dgXY 格式...");
      }
    }
  }, {
    key: "setContent",
    value: function setContent(mobj) {
      /*if(this._icontype == "dgicon")
      {
        console.log("dgicon 版的 dgmarker 無法更新內容...(待議)");
        return; 
      }
      */
      if (dgMarker_typeof(mobj) == 'object') {
        tmpdiv = document.createElement('div');
        tmpdiv.appendChild(mobj);
        this.content = tmpdiv.innerHTML;
        //By John
        /*if(this._instance!=null && this._instance.element !=null)
        {
          this._instance.element.innerHTML=tmpdiv.innerHTML;
        }
        else
        {
          console.log("setContent必需先 addItem 至圖台才能使用");
        }*/
      } else if (typeof mobj == 'string') {
        this.content = mobj;
        //By John
        /*if(this._instance!=null && this._instance.element !=null)
        {
          this._instance.element.innerHTML=mobj;
        }
        else
        {
          console.log("setContent必需先 addItem 至圖台才能使用");
        }
        */
      }
      this.onclick = function (xy, feature) {
        // 寫在這似乎只有 dgicon 有效
        this._easymap._openInfoWindow(this.getXY(), '', this.content);
        //console.log(feature);
        //console.log(this);
        //this.openInfoWindow(xy, this.content);
      }.bind(this);
    }
  }, {
    key: "openInfoWindow",
    value: function openInfoWindow(wcontent, ww, wh) {
      //By John
      if (ww == null || wh == null) {
        if (this._easymap != null) {
          this._easymap.openInfoWindow(this.getXY(), wcontent);
        }
      } else {
        ww = parseInt(ww);
        wh = parseInt(wh);
        if (this._easymap != null) {
          this._easymap.openInfoWindow(this.getXY(), wcontent, ww, wh);
        }
      }
    }
  }]);
  return dgMarker;
}();
/* harmony default export */ const dg_dgMarker = (dgMarker);
;// CONCATENATED MODULE: ./src/dg/dgGMarker.js
function dgGMarker_typeof(o) { "@babel/helpers - typeof"; return dgGMarker_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgGMarker_typeof(o); }
function dgGMarker_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgGMarker_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgGMarker_toPropertyKey(o.key), o); } }
function dgGMarker_createClass(e, r, t) { return r && dgGMarker_defineProperties(e.prototype, r), t && dgGMarker_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgGMarker_toPropertyKey(t) { var i = dgGMarker_toPrimitive(t, "string"); return "symbol" == dgGMarker_typeof(i) ? i : i + ""; }
function dgGMarker_toPrimitive(t, r) { if ("object" != dgGMarker_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgGMarker_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgGMarker = /*#__PURE__*/function () {
  function dgGMarker(markers, distance, threshold) {
    dgGMarker_classCallCheck(this, dgGMarker);
    this._easymap = null;
    this._type = "gmarker";
    this._instance = null;
    this._isCusterZoom = false;
    this._zoom = 0;
    this._Style = null;
    this._role = null;
    this._clusterSource = null; //分群的class
    this._distance = 50;
    this._threshold = null;
    this._markers = [];
    this._click = null;
    this._mouseover = null;
    this._mouseout = null;
    this._mousedown = null;
    if (distance) this._distance = distance;
    if (threshold) this._threshold = threshold;
    this._markers = markers;
    this._Style = new dgGStyle();
    this._isZoomWithoutCluster = false; //是否再否階層後不分群
    this._zoomWithoutCluster = 99; //哪一層後不分群
  }
  dgGMarker_createClass(dgGMarker, [{
    key: "setZIndexTop",
    value: function setZIndexTop() {}
  }, {
    key: "setRole",
    value: function setRole(role) {
      this._role = role;
      //將 this._Style 的樣式調成 role 的內容
      /*
       * role：https://easymap.gis.tw/easymap/api.html#marker%E5%88%86%E7%BE%A4(GMarker)-%E6%B8%AC%E8%A9%A6%E4%BA%8B%E4%BB%B6
       var role = {
          high: 100,  //大於該值為high
          medium: 20, //大於該值小於high值，為Medium; 小於該值為Low
          highColor: 'rgb()
          picHigh: "<div style='position:absolute;left:-29px;top:-29px;'><img src='easymap/imgs/nuclear-b.png' width='58' height='58'></div>", //大於100個marker
          picMedium: "<div style='position:absolute;left:-29px;top:-29px;'><img src='easymap/imgs/nuclear-g.png' width='58' height='58'></div>",       //介於20~100個marker
          picLow: "<div style='position:absolute;left:-29px;top:-29px;'><img src='easymap/imgs/nuclear-y.png' width='58' height='58'></div>",           //小於20個marker
          texttagHigh: texttag,    //{0}為cluster的數量
          texttagMedium: texttag,  //{0}為cluster的數量
          texttagLow: texttag     //{0}為cluster的數量
          //文字顯示的css
      };
      */
      if (this._role.high != null) {
        this._Style.setHigh(this._role.high);
      }
      if (this._role.medium != null) {
        this._Style.setMedium(this._role.medium);
      }
    }
  }, {
    key: "setZoomWithoutCluster",
    value: function setZoomWithoutCluster(tf, zoom) {
      this._isZoomWithoutCluster = tf;
      this._zoomWithoutCluster = parseInt(zoom);
    }
  }, {
    key: "setDistance",
    value: function setDistance(distance) {}
  }, {
    key: "setThreshold",
    value: function setThreshold(threshold) {}
  }, {
    key: "register",
    value: function register(eventType, callback) {
      if (!eventType) return;
      if (!callback) return;
      switch (eventType) {
        case "click":
          this._click = callback;
          break;
        default:
      }
    }
  }]);
  return dgGMarker;
}();
/* harmony default export */ const dg_dgGMarker = (dgGMarker);
;// CONCATENATED MODULE: ./src/dg/dgGStyle.js
function dgGStyle_typeof(o) { "@babel/helpers - typeof"; return dgGStyle_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgGStyle_typeof(o); }
function dgGStyle_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgGStyle_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgGStyle_toPropertyKey(o.key), o); } }
function dgGStyle_createClass(e, r, t) { return r && dgGStyle_defineProperties(e.prototype, r), t && dgGStyle_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgGStyle_toPropertyKey(t) { var i = dgGStyle_toPrimitive(t, "string"); return "symbol" == dgGStyle_typeof(i) ? i : i + ""; }
function dgGStyle_toPrimitive(t, r) { if ("object" != dgGStyle_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgGStyle_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgGStyle_dgGStyle = /*#__PURE__*/function () {
  function dgGStyle() {
    dgGStyle_classCallCheck(this, dgGStyle);
    this._high = 100; //大於該值為high
    this._medium = 20; //大於該值小於high值，為Medium; 小於該值為Low
    this._colorHigh = {
      r: 247,
      g: 14,
      b: 26
    };
    this._colorMedium = {
      r: 255,
      g: 153,
      b: 0
    };
    this._colorLow = {
      r: 37,
      g: 169,
      b: 59
    };
  }
  dgGStyle_createClass(dgGStyle, [{
    key: "setHigh",
    value: function setHigh(high) {
      this._high = high;
    }
  }, {
    key: "setMedium",
    value: function setMedium(medium) {
      this._medium = medium;
    }
  }, {
    key: "getHigh",
    value: function getHigh() {
      return this._high;
    }
  }, {
    key: "getMedium",
    value: function getMedium() {
      return this._medium;
    }
  }, {
    key: "setColorHigh",
    value: function setColorHigh(color) {
      var rgb = this._hexToRgbA(color);
      this._colorHigh.r = rgb[0];
      this._colorHigh.g = rgb[1];
      this._colorHigh.b = rgb[2];
    }
  }, {
    key: "setColorMedium",
    value: function setColorMedium(color) {
      var rgb = this._hexToRgbA(color);
      this._colorMedium.r = rgb[0];
      this._colorMedium.g = rgb[1];
      this._colorMedium.b = rgb[2];
    }
  }, {
    key: "setColorLow",
    value: function setColorLow(color) {
      var rgb = this._hexToRgbA(color);
      this._colorLow.r = rgb[0];
      this._colorLow.g = rgb[1];
      this._colorLow.b = rgb[2];
    }
  }, {
    key: "_hexToRgbA",
    value: function _hexToRgbA(hex) {
      var c;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [c >> 16 & 255, c >> 8 & 255, c & 255, 255];
      }
      //console.log(this);
      if (typeof hex == "string" && this._is_string_like(hex.toLowerCase(), "rgb(%")) {
        var _c = hex.split(",");
        return [parseInt(_c[0].toLowerCase().replace("rgba(", "")), parseInt(_c[1]), parseInt(_c[2].replace(")", "")), 255];
      }
      if (typeof hex == "string" && this._is_string_like(hex.toLowerCase(), "rgba(%")) {
        var _c2 = hex.split(",");
        return [parseInt(_c2[0].toLowerCase().replace("rgba(", "")), parseInt(_c2[1]), parseInt(_c2[2]), parseFloat(_c2[3].replace(")", ""))];
      }
      throw null;
    }
  }, {
    key: "_strpos",
    value: function _strpos(haystack, needle, offset) {
      var i = (haystack + '').indexOf(needle, offset || 0);
      return i === -1 ? false : i;
    }
  }, {
    key: "_is_string_like",
    value: function _is_string_like($data, $find_string) {
      var $tieneini = 0;
      if ($find_string == "") return 1;
      var $vi = $find_string.split("%");
      var $offset = 0;
      for (var $n = 0, $max_n = $vi.length; $n < $max_n; $n++) {
        if ($vi[$n] == "") {
          if ($vi[0] == "") {
            $tieneini = 1;
          }
        } else {
          var $newoff = this._strpos($data, $vi[$n], $offset);
          if ($newoff !== false) {
            if (!$tieneini) {
              if ($offset != $newoff) {
                return false;
              }
            }
            if ($n == $max_n - 1) {
              if ($vi[$n] != this._substr($data, $data.length - $vi[$n].length, $vi[$n].length)) {
                return false;
              }
            } else {
              $offset = $newoff + $vi[$n].length;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    }
  }, {
    key: "_substr",
    value: function _substr(str, start, len) {
      var i = 0,
        allBMP = true,
        es = 0,
        el = 0,
        se = 0,
        ret = '';
      str += '';
      var end = str.length;
      this.php_js = this.php_js || {};
      this.php_js.ini = this.php_js.ini || {};
      switch (this.php_js.ini['unicode.semantics'] && this.php_js.ini['unicode.semantics'].local_value.toLowerCase()) {
        case 'on':
          for (i = 0; i < str.length; i++) {
            if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
              allBMP = false;
              break;
            }
          }
          if (!allBMP) {
            if (start < 0) {
              for (i = end - 1, es = start += end; i >= es; i--) {
                if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
                  start--;
                  es--;
                }
              }
            } else {
              var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
              while (surrogatePairs.exec(str) != null) {
                var li = surrogatePairs.lastIndex;
                if (li - 2 < start) {
                  start++;
                } else {
                  break;
                }
              }
            }
            if (start >= end || start < 0) {
              return false;
            }
            if (len < 0) {
              for (i = end - 1, el = end += len; i >= el; i--) {
                if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
                  end--;
                  el--;
                }
              }
              if (start > end) {
                return false;
              }
              return str.slice(start, end);
            } else {
              se = start + len;
              for (i = start; i < se; i++) {
                ret += str.charAt(i);
                if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
                  se++;
                }
              }
              return ret;
            }
            break;
          }
        case 'off':
        default:
          if (start < 0) {
            start += end;
          }
          end = typeof len === 'undefined' ? end : len < 0 ? len + end : len + start;
          return start >= str.length || start < 0 || start > end ? !1 : str.slice(start, end);
      }
      return undefined;
    }
  }]);
  return dgGStyle;
}();
/* harmony default export */ const dg_dgGStyle = (dgGStyle_dgGStyle);
;// CONCATENATED MODULE: ./src/dg/dgCurve.js
function dgCurve_typeof(o) { "@babel/helpers - typeof"; return dgCurve_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgCurve_typeof(o); }
function dgCurve_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgCurve_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgCurve_toPropertyKey(o.key), o); } }
function dgCurve_createClass(e, r, t) { return r && dgCurve_defineProperties(e.prototype, r), t && dgCurve_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgCurve_toPropertyKey(t) { var i = dgCurve_toPrimitive(t, "string"); return "symbol" == dgCurve_typeof(i) ? i : i + ""; }
function dgCurve_toPrimitive(t, r) { if ("object" != dgCurve_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgCurve_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgCurve = /*#__PURE__*/function () {
  function dgCurve(xy, ss, fs, ptR, sw, ang1, ang2, clockw) {
    dgCurve_classCallCheck(this, dgCurve);
    this._id = "";
    this._type = 'curve';
    this._x = xy.x;
    this._y = xy.y;
    this._strokeStyle = ss;
    this._fillStyle = fs;
    this._ptRadius = ptR;
    this._lineWidth = sw;
    this._arcAngle1 = ang1;
    this._arcAngle2 = ang2;
    this._clockwise = clockw;
    this._dash = {
      lineDash: [0, 0],
      lineCap: 'round'
    };
    this._instance = null;
    this._xs = new Array();
    this._ys = new Array();
    this._xys = new Array();
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
    this.bufferObj = null;
    return this;
  }
  dgCurve_createClass(dgCurve, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgCurve_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        var d = {
          text: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getColor == null ? null : originStyles[0].getText().getColor(),
          textfill: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().getColor == null ? null : originStyles[0].getText().getFill().getColor(),
          stroke: originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().getColor == null ? null : originStyles[0].getStroke().getColor(),
          fill: originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().getColor == null ? null : originStyles[0].getFill().getColor(),
          image: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill() == null || originStyles[0].getImage().getFill().getColor == null ? null : originStyles[0].getImage().getFill().getColor(),
          //改顏色必需觸發一次改大小，才會生效
          //point 特有
          radius: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().getRadius()
        };
        this._flashFocusData.orinStyle.push(d);
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              for (var _i = 0, _max_i = features.length; _i < _max_i; _i++) {
                var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                this._flashFocusData.orinStyle[_i].text == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().setColor == null ? null : originStyles[0].getText().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].textfill == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().setColor == null ? null : originStyles[0].getText().getFill().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].stroke == null || originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().setColor == null ? null : originStyles[0].getStroke().setColor(this._flashFocusData.flashColor);
                //console.log(this._easymap);
                var new_color_with_opacity = this._easymap.colorValues(this._flashFocusData.flashColor);
                //這裡用 0.5 opacity 
                this._flashFocusData.orinStyle[_i].fill == null || originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().setColor == null ? null : originStyles[0].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].image == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill().setColor == null ? null : originStyles[0].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].radius == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i].radius);
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              for (var _i2 = 0, _max_i2 = features.length; _i2 < _max_i2; _i2++) {
                var originStyles = features[_i2].getStyleFunction().call(null, features[_i2]);
                this._flashFocusData.orinStyle[_i2].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[_i2].text);
                this._flashFocusData.orinStyle[_i2].textfill == null ? '' : originStyles[0].getText().getFill().setColor(this._flashFocusData.orinStyle[_i2].textfill);
                this._flashFocusData.orinStyle[_i2].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[_i2].stroke);
                this._flashFocusData.orinStyle[_i2].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[_i2].fill);
                this._flashFocusData.orinStyle[_i2].image == null ? '' : originStyles[0].getImage().getFill().setColor(this._flashFocusData.orinStyle[_i2].image);
                this._flashFocusData.orinStyle[_i2].radius == null || originStyles[0].getImage == null || originStyles[0].getImage().setRadius == null ? '' : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i2].radius);
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      clearInterval(this._flashFocusData.runInterval); //stop
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        this._flashFocusData.orinStyle[i].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[i].text);
        this._flashFocusData.orinStyle[i].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[i].stroke);
        this._flashFocusData.orinStyle[i].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[i].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "setXY",
    value: function setXY(tmpxy) {
      this._x = tmpxy.x;
      this._y = tmpxy.y;
      //this.instance.reposMark();
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      return new dgXY(this._x, this._y);
    }
  }, {
    key: "enableDashed",
    value: function enableDashed(val) {
      //val 可不填，預設為 [4,8]
      //啟動 dash
      if (val == null) {
        this._dash.lineDash = [4, 8];
      } else {
        this._dash.lineDash = val;
      }
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        if (features.length > 0) {
          var originStyles = features[0].getStyleFunction().call(null, features[0]);
          originStyles[0].getStroke().setLineDash(this._dash.lineDash);
          //features[0].setStyle(features[0].getStyle());
          this._instance.getSource().dispatchEvent('change');
        } else {
          console.log("Error ... features 為 0");
        }
      }
    }
  }, {
    key: "disableDashed",
    value: function disableDashed() {
      this.enableDashed([0, 0]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      var _size = 0;
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].getGeometry().getArea != null) {
          _size += this._instance.getSource().getFeatures()[i].getGeometry().getArea();
        }
      }
      return _size;
    }
    /*getExtent() {
        let b = new Object();
        if (this._instance != null) {
            let features = this._instance.getSource().getFeatures();
            let _extent = features[0].getGeometry().getExtent()
            let p0 = ol.proj.transform([_extent[0], _extent[1]], "EPSG:3857", "EPSG:4326");
            let p1 = ol.proj.transform([_extent[2], _extent[3]], "EPSG:3857", "EPSG:4326");
            b['lt_x'] = p0[0];
            b['lt_y'] = p0[1];
            b['rb_x'] = p1[0];
            b['rb_y'] = p1[1];
            return b;
        }
        return null;
    }*/
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "getStrokeWidth",
    value: function getStrokeWidth() {
      return this._lineWidth;
    }
  }, {
    key: "setStrokeWidth",
    value: function setStrokeWidth(val) {
      if (!isNaN(val) == false) val = 1;
      this._lineWidth = parseFloat(val);
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        var originStyles = features[0].getStyleFunction().call(null, features[0]);
        originStyles[0].getStroke().setWidth(val);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getStrokeColor",
    value: function getStrokeColor() {
      return this._strokeStyle;
    }
  }, {
    key: "setStrokeColor",
    value: function setStrokeColor(val) {
      this._strokeStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        var originStyles = features[0].getStyleFunction().call(null, features[0]);
        originStyles[0].getStroke().setColor(val);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getFillColor",
    value: function getFillColor() {
      return this._fillStyle;
    }
  }, {
    key: "setFillColor",
    value: function setFillColor(val) {
      this._fillStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        var originStyles = features[0].getStyleFunction().call(null, features[0]);
        originStyles[0].getFill().setColor(val);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "setRotate",
    value: function setRotate(r, obj) {
      //obj 可以指定用坐標的哪個點來作旋轉軸
      //參考：https://gist.github.com/fernandoc1/b6d196e3e32975e29fae4dff60a73ac4
      //預設使用 extent 中心點
      //r 是旋轉角度 0~360
      var message = "\n            //\u50B3\u5165\u503C\u932F\u8AA4...\u4EE5\u4E0B\u662F\u65CB\u8F49\u7BC4\u4F8B\n            \n            curveObj.setRotate(45); // \u4EE5\u5716\u578B\u7684\u4E2D\u5FC3\u9EDE(getExtent / 2.0) \u53F3\u65CB45\u5EA6\n            curveObj.setRotate(45,{ // \u4EE54326\u5750\u6A19 121,23 \u70BA\u4E2D\u5FC3\u9EDE\uFF0C\u65CB\u8F4945\u5EA6\n                anchor: [ 121,23 ]  \n            });\n            \n";
      if (isNaN(r)) {
        console.log(message);
        return;
      }
      var gE = this.getExtent();
      var rotate_Point = [(gE[0] + gE[2]) / 2.0, (gE[1] + gE[3]) / 2.0]; //Extent 中心
      if (typeof obj != "undefined" && typeof obj.anchor != "undefined") {
        rotate_Point = obj.anchor;
      }
      r = parseFloat(r);
      this._instance.getSource().getFeatures()[0].getGeometry().rotate(-1 * r * Math.PI / 180.0, ol.proj.transform(rotate_Point, 'EPSG:4326', 'EPSG:3857'));

      //寫回 xys
      this._setXYS();
    }
  }, {
    key: "_setXYS",
    value: function _setXYS() {
      //把目前圖型畫的內容寫回 xy、xys
      this._xs = new Array();
      this._ys = new Array();
      this._xys = new Array();
      for (var i = 0; i < this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
        this._xs.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
        this._ys.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
        this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
      }
    }
  }]);
  return dgCurve;
}();
/* harmony default export */ const dg_dgCurve = (dgCurve);
;// CONCATENATED MODULE: ./src/dg/dgPolyline.js
function dgPolyline_typeof(o) { "@babel/helpers - typeof"; return dgPolyline_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgPolyline_typeof(o); }
function dgPolyline_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgPolyline_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgPolyline_toPropertyKey(o.key), o); } }
function dgPolyline_createClass(e, r, t) { return r && dgPolyline_defineProperties(e.prototype, r), t && dgPolyline_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgPolyline_toPropertyKey(t) { var i = dgPolyline_toPrimitive(t, "string"); return "symbol" == dgPolyline_typeof(i) ? i : i + ""; }
function dgPolyline_toPrimitive(t, r) { if ("object" != dgPolyline_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgPolyline_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgPolyline = /*#__PURE__*/function () {
  function dgPolyline(pts, ss, sw) {
    dgPolyline_classCallCheck(this, dgPolyline);
    this._type = 'polyline';
    this._xys = pts;
    this._instance = null;
    this._pcount = this._xys.length;
    this._strokeStyle = ss;
    this._lineWidth = sw;
    this._isLinestringArrowEnabled = false;
    this._lineStringIconsrc = '';
    this._lineStringIconsrcScale = 1.0; //比例放大
    this._xs = new Array();
    this._ys = new Array();
    this.bufferObj = null;
    this._dash = {
      lineDash: [0, 0],
      lineCap: 'round'
    };
    for (var i = 0; i < this._xys.length; i++) {
      this._xs.push(this._xys[i].x);
      this._ys.push(this._xys[i].y);
    }
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
    return this;
  }
  dgPolyline_createClass(dgPolyline, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgPolyline_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        var d = {
          text: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getColor == null ? null : originStyles[0].getText().getColor(),
          textfill: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().getColor == null ? null : originStyles[0].getText().getFill().getColor(),
          stroke: originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().getColor == null ? null : originStyles[0].getStroke().getColor(),
          fill: originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().getColor == null ? null : originStyles[0].getFill().getColor(),
          image: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill() == null || originStyles[0].getImage().getFill().getColor == null ? null : originStyles[0].getImage().getFill().getColor(),
          //改顏色必需觸發一次改大小，才會生效
          //point 特有
          radius: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().getRadius()
        };
        this._flashFocusData.orinStyle.push(d);
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              for (var _i = 0, _max_i = features.length; _i < _max_i; _i++) {
                var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                this._flashFocusData.orinStyle[_i].text == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().setColor == null ? null : originStyles[0].getText().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].textfill == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().setColor == null ? null : originStyles[0].getText().getFill().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].stroke == null || originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().setColor == null ? null : originStyles[0].getStroke().setColor(this._flashFocusData.flashColor);
                //console.log(this._easymap);
                var new_color_with_opacity = this._easymap.colorValues(this._flashFocusData.flashColor);
                //這裡用 0.5 opacity 
                this._flashFocusData.orinStyle[_i].fill == null || originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().setColor == null ? null : originStyles[0].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].image == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill().setColor == null ? null : originStyles[0].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].radius == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i].radius);
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              for (var _i2 = 0, _max_i2 = features.length; _i2 < _max_i2; _i2++) {
                var originStyles = features[_i2].getStyleFunction().call(null, features[_i2]);
                this._flashFocusData.orinStyle[_i2].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[_i2].text);
                this._flashFocusData.orinStyle[_i2].textfill == null ? '' : originStyles[0].getText().getFill().setColor(this._flashFocusData.orinStyle[_i2].textfill);
                this._flashFocusData.orinStyle[_i2].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[_i2].stroke);
                this._flashFocusData.orinStyle[_i2].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[_i2].fill);
                this._flashFocusData.orinStyle[_i2].image == null ? '' : originStyles[0].getImage().getFill().setColor(this._flashFocusData.orinStyle[_i2].image);
                this._flashFocusData.orinStyle[_i2].radius == null || originStyles[0].getImage == null || originStyles[0].getImage().setRadius == null ? '' : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i2].radius);
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      clearInterval(this._flashFocusData.runInterval); //stop
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        this._flashFocusData.orinStyle[i].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[i].text);
        this._flashFocusData.orinStyle[i].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[i].stroke);
        this._flashFocusData.orinStyle[i].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[i].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      var x = null;
      var y = null;
      for (var i = 0; i < this._xys.length; i++) {
        if (i == 0) {
          x = this._xys[i].x;
          y = this._xys[i].y;
        } else {
          x += this._xys[i].x;
          y += this._xys[i].y;
        }
      }
      x /= this._xys.length;
      y /= this._xys.length;
      return new dgXY(x, y);
    }
    /*getExtent() {
        let b = new Object();
        if (this._instance != null) {
            let features = this._instance.getSource().getFeatures();
            let _extent = features[0].getGeometry().getExtent()
            let p0 = ol.proj.transform([_extent[0], _extent[1]], "EPSG:3857", "EPSG:4326");
            let p1 = ol.proj.transform([_extent[2], _extent[3]], "EPSG:3857", "EPSG:4326");
            b['lt_x'] = p0[0];
            b['lt_y'] = p0[1];
            b['rb_x'] = p1[0];
            b['rb_y'] = p1[1];
            return b;
        }
        b['lt_x'] = null;
        b['lt_y'] = null;
        b['rb_x'] = null;
        b['rb_y'] = null;
        for (let i = 0; i < this._xys.length; i++) {
            if (i == 0) {
                b['lt_x'] = this._xys[i].x;
                b['lt_y'] = this._xys[i].y;
                b['rb_x'] = this._xys[i].x;
                b['rb_y'] = this._xys[i].y;
            }
            else {
                b['lt_x'] = Math.min(b['lt_x'], this._xys[i].x);
                b['lt_y'] = Math.max(b['lt_y'], this._xys[i].y);
                b['rb_x'] = Math.max(b['rb_x'], this._xys[i].x);
                b['rb_y'] = Math.min(b['rb_y'], this._xys[i].y);
            }
        }
        return b;
    }*/
  }, {
    key: "enableDashed",
    value: function enableDashed(val) {
      //val 可不填，預設為 [4,8]
      //啟動 dash
      if (val == null) {
        this._dash.lineDash = [4, 8];
      } else {
        this._dash.lineDash = val;
      }
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        if (features.length > 0) {
          var originStyles = features[0].getStyleFunction().call(null, features[0]);
          originStyles[0].getStroke().setLineDash(this._dash.lineDash);
          //features[0].setStyle(features[0].getStyle());
          this._instance.getSource().dispatchEvent('change');
        } else {
          console.log("Error ... features 為 0");
        }
      }
    }
  }, {
    key: "enableLineStringArrow",
    value: function enableLineStringArrow(iconsrc, op) {
      var _this = this;
      //zoomThreshold
      //亦可換成 easymap/imgs/arror.png
      if (iconsrc == null || iconsrc == '') {
        iconsrc = "https://openlayers.org/en/latest/examples/data/arrow.png";
      }
      this._lineStringIconsrc = iconsrc;
      //if (zoomThreshold == undefined) zoomThreshold = 0;
      //this._zoomThreshold = zoomThreshold;//超過哪個zoom才開啟，預設為0
      if (dgPolyline_typeof(op) == "object") {
        if (typeof op.scale != "undefined") {
          this._lineStringIconsrcScale = op.scale;
        }
      }
      if (this._instance == null) {
        console.log("需要在 addItem 後才能使用");
        return;
      }
      if (this._isLinestringArrowEnabled == true) {
        console.log("已經上過箭頭了...");
        return;
      }
      this._isLinestringArrowEnabled = true;
      var features = this._instance.getSource().getFeatures();
      var _loop = function _loop(i, max_i) {
        var styles = [];
        //orin s 
        orin_style = _this._instance.getSource().getFeatures()[i].getStyle();
        if (orin_style != null) {
          styles.push(orin_style);
        }
        var feature = features[i];
        feature._lineStringIconsrc = _this._lineStringIconsrc;
        var geometry = feature.getGeometry();
        var type = geometry.getType();
        //let properties = feature.getProperties()

        if (type.toLowerCase() == 'linestring' || type.toLowerCase() == 'multilinestring') {} else {
          return "continue";
        }
        var segments = null;
        if (type.toLowerCase() == 'multilinestring') {
          segments = geometry.getLineString();
        } else {
          segments = geometry;
        }
        // From : https://openlayers.org/en/latest/examples/line-arrows.html
        segments.forEachSegment(function (start, end) {
          var dx = end[0] - start[0];
          var dy = end[1] - start[1];
          var rotation = Math.atan2(dy, dx);
          // arrows
          //var styles = feature.getStyleFunction().call(null, feature);
          styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(end),
            image: new ol.style.Icon({
              src: this._lineStringIconsrc,
              anchor: [0.75, 0.5],
              rotateWithView: true,
              rotation: -rotation,
              scale: this._lineStringIconsrcScale
            })
          }));
        }.bind(_this));
        feature.setStyle(styles);
      };
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var orin_style;
        var _ret = _loop(i, max_i);
        if (_ret === "continue") continue;
      }
      //this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "disableLineStringArrow",
    value: function disableLineStringArrow() {
      if (this._isLinestringArrowEnabled == false) {
        console.log("還沒上過箭頭...");
        return;
      }
      this._isLinestringArrowEnabled = false;
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var feature = features[i];
        var styles = feature.getStyle();
        if (Array.isArray(styles)) {
          styles = styles[0];
        }
        /*for (let j = 0, max_j = styles.length; j < max_j; j++) {
            if (styles[j].image_ != null && styles[j].image_.getSrc != null && styles[j].image_.getSrc() == this._lineStringIconsrc) {
                //回到原始狀態...
                styles[j] = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: width * 2,
                        fill: new ol.style.Fill({
                            color: white //Basically points change to white here
                        }),
                    });
                });
            }
        }
        styles = styles.filter(function (el) {
            return el != null;
        });
        */
        //https://stackoverflow.com/questions/65754068/how-to-remove-style-from-individual-feature-of-a-vector-layer-in-open-layers            
        feature.setStyle(styles);
      }
      //this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "disableDashed",
    value: function disableDashed() {
      this.enableDashed([0, 0]);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "getVertexCount",
    value: function getVertexCount() {
      return this._xys.length - 2;
    }
  }, {
    key: "getVertex",
    value: function getVertex(iidx) {
      return this._xys[iidx - 1];
    }
  }, {
    key: "addVertex",
    value: function addVertex(ixy) {
      if (this._instance != null) this._instance.removeItem(this);
      this._xys.push(ixy);
      this._xs.push(ixy.x);
      this._ys.push(ixy.y);
      this._pcount = this._xys.length;
      if (this._instance != null) this._instance.addItem(this);
    }
  }, {
    key: "getStrokeWidth",
    value: function getStrokeWidth() {
      return this._lineWidth;
    }
  }, {
    key: "setStrokeWidth",
    value: function setStrokeWidth(val) {
      if (!isNaN(val) == false) val = 1;
      this._lineWidth = parseFloat(val);
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        var originStyles = features[0].getStyleFunction().call(null, features[0]);
        originStyles[0].getStroke().setWidth(val);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getStrokeColor",
    value: function getStrokeColor() {
      return this._strokeStyle;
    }
  }, {
    key: "setStrokeColor",
    value: function setStrokeColor(val) {
      this._strokeStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        var originStyles = features[0].getStyleFunction().call(null, features[0]);
        originStyles[0].getStroke().setColor(val);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "setRotate",
    value: function setRotate(r, obj) {
      //obj 可以指定用坐標的哪個點來作旋轉軸
      //參考：https://gist.github.com/fernandoc1/b6d196e3e32975e29fae4dff60a73ac4
      //預設使用 extent 中心點
      //r 是旋轉角度 0~360
      var message = "\n            //\u50B3\u5165\u503C\u932F\u8AA4...\u4EE5\u4E0B\u662F\u65CB\u8F49\u7BC4\u4F8B\n            \n            polylineObj.setRotate(45); // \u4EE5\u5716\u578B\u7684\u4E2D\u5FC3\u9EDE(getExtent / 2.0) \u53F3\u65CB45\u5EA6\n            polylineObj.setRotate(45,{ // \u4EE54326\u5750\u6A19 121,23 \u70BA\u4E2D\u5FC3\u9EDE\uFF0C\u65CB\u8F4945\u5EA6\n                anchor: [ 121,23 ]  \n            });\n            \n";
      if (isNaN(r)) {
        console.log(message);
        return;
      }
      var gE = this.getExtent();
      var rotate_Point = [(gE[0] + gE[2]) / 2.0, (gE[1] + gE[3]) / 2.0]; //Extent 中心
      if (typeof obj != "undefined" && typeof obj.anchor != "undefined") {
        rotate_Point = obj.anchor;
      }
      r = parseFloat(r);
      this._instance.getSource().getFeatures()[0].getGeometry().rotate(-1 * r * Math.PI / 180.0, ol.proj.transform(rotate_Point, 'EPSG:4326', 'EPSG:3857'));

      //寫回 xys
      this._setXYS();
    }
  }, {
    key: "_setXYS",
    value: function _setXYS() {
      //把目前圖型畫的內容寫回 xy、xys
      this._xs = new Array();
      this._ys = new Array();
      this._xys = new Array();
      for (var i = 0; i < this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
        this._xs.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
        this._ys.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
        this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
      }
    }
  }]);
  return dgPolyline;
}();
/* harmony default export */ const dg_dgPolyline = (dgPolyline);
;// CONCATENATED MODULE: ./src/dg/dgPolygon.js
function dgPolygon_typeof(o) { "@babel/helpers - typeof"; return dgPolygon_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgPolygon_typeof(o); }
function dgPolygon_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgPolygon_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgPolygon_toPropertyKey(o.key), o); } }
function dgPolygon_createClass(e, r, t) { return r && dgPolygon_defineProperties(e.prototype, r), t && dgPolygon_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgPolygon_toPropertyKey(t) { var i = dgPolygon_toPrimitive(t, "string"); return "symbol" == dgPolygon_typeof(i) ? i : i + ""; }
function dgPolygon_toPrimitive(t, r) { if ("object" != dgPolygon_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgPolygon_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgPolygon = /*#__PURE__*/function () {
  function dgPolygon(pts, ss, fs, sw) {
    dgPolygon_classCallCheck(this, dgPolygon);
    var npts = pts.slice();
    this._id = null;
    this._type = 'polygon';
    this._xys = npts;
    this._instance = null;
    this._attributes = {};
    this._dash = {
      lineDash: [0, 0],
      lineCap: 'round'
    };
    if (npts[0] != npts[pts.length - 1]) {
      this._xys.push(npts[0]);
    }
    this._pcount = this._xys.length;
    this._strokeStyle = ss;
    this._fillStyle = fs;
    this._lineWidth = sw;
    this._xs = new Array();
    this._ys = new Array();
    this.bufferObj = null;
    for (var i = 0; i < this._pcount; i++) {
      this._xs.push(this._xys[i].x);
      this._ys.push(this._xys[i].y);
    }
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
  }
  dgPolygon_createClass(dgPolygon, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgPolygon_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        var d = {
          text: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getColor == null ? null : originStyles[0].getText().getColor(),
          textfill: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().getColor == null ? null : originStyles[0].getText().getFill().getColor(),
          stroke: originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().getColor == null ? null : originStyles[0].getStroke().getColor(),
          fill: originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().getColor == null ? null : originStyles[0].getFill().getColor(),
          image: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill() == null || originStyles[0].getImage().getFill().getColor == null ? null : originStyles[0].getImage().getFill().getColor(),
          //改顏色必需觸發一次改大小，才會生效
          //point 特有
          radius: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().getRadius()
        };
        this._flashFocusData.orinStyle.push(d);
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              for (var _i = 0, _max_i = features.length; _i < _max_i; _i++) {
                var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                this._flashFocusData.orinStyle[_i].text == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().setColor == null ? null : originStyles[0].getText().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].textfill == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().setColor == null ? null : originStyles[0].getText().getFill().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].stroke == null || originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().setColor == null ? null : originStyles[0].getStroke().setColor(this._flashFocusData.flashColor);
                //console.log(this._easymap);
                var new_color_with_opacity = this._easymap.colorValues(this._flashFocusData.flashColor);
                //這裡用 0.5 opacity 
                this._flashFocusData.orinStyle[_i].fill == null || originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().setColor == null ? null : originStyles[0].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].image == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill().setColor == null ? null : originStyles[0].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].radius == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i].radius);
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              for (var _i2 = 0, _max_i2 = features.length; _i2 < _max_i2; _i2++) {
                var originStyles = features[_i2].getStyleFunction().call(null, features[_i2]);
                this._flashFocusData.orinStyle[_i2].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[_i2].text);
                this._flashFocusData.orinStyle[_i2].textfill == null ? '' : originStyles[0].getText().getFill().setColor(this._flashFocusData.orinStyle[_i2].textfill);
                this._flashFocusData.orinStyle[_i2].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[_i2].stroke);
                this._flashFocusData.orinStyle[_i2].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[_i2].fill);
                this._flashFocusData.orinStyle[_i2].image == null ? '' : originStyles[0].getImage().getFill().setColor(this._flashFocusData.orinStyle[_i2].image);
                this._flashFocusData.orinStyle[_i2].radius == null || originStyles[0].getImage == null || originStyles[0].getImage().setRadius == null ? '' : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i2].radius);
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      clearInterval(this._flashFocusData.runInterval); //stop
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        this._flashFocusData.orinStyle[i].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[i].text);
        this._flashFocusData.orinStyle[i].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[i].stroke);
        this._flashFocusData.orinStyle[i].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[i].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "enableDashed",
    value: function enableDashed(val) {
      //val 可不填，預設為 [4,8]
      //啟動 dash
      if (val == null) {
        this._dash.lineDash = [4, 8];
      } else {
        this._dash.lineDash = val;
      }
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        if (features.length > 0) {
          var originStyles = features[0].getStyleFunction().call(null, features[0]);
          originStyles[0].getStroke().setLineDash(this._dash.lineDash);
          //features[0].setStyle(features[0].getStyle());
          this._instance.getSource().dispatchEvent('change');
        } else {
          console.log("Error ... features 為 0");
        }
      }
    }
  }, {
    key: "disableDashed",
    value: function disableDashed() {
      this.enableDashed([0, 0]);
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      var x = null;
      var y = null;
      for (var i = 0; i < this._xys.length; i++) {
        if (i == 0) {
          x = this._xys[i].x;
          y = this._xys[i].y;
        } else {
          x += this._xys[i].x;
          y += this._xys[i].y;
        }
      }
      x /= this._xys.length;
      y /= this._xys.length;
      return new dgXY(x, y);
    }
    /*getExtent() {
        let b = new Object();
        if (this._instance != null) {
            let features = this._instance.getSource().getFeatures();
            let _extent = features[0].getGeometry().getExtent()
            let p0 = ol.proj.transform([_extent[0], _extent[1]], "EPSG:3857", "EPSG:4326");
            let p1 = ol.proj.transform([_extent[2], _extent[3]], "EPSG:3857", "EPSG:4326");
            b['lt_x'] = p0[0];
            b['lt_y'] = p0[1];
            b['rb_x'] = p1[0];
            b['rb_y'] = p1[1];
            return b;
        }
        b['lt_x'] = null;
        b['lt_y'] = null;
        b['rb_x'] = null;
        b['rb_y'] = null;
        for (let i = 0; i < this._xys.length; i++) {
            if (i == 0) {
                b['lt_x'] = this._xys[i].x;
                b['lt_y'] = this._xys[i].y;
                b['rb_x'] = this._xys[i].x;
                b['rb_y'] = this._xys[i].y;
            }
            else {
                b['lt_x'] = Math.min(b['lt_x'], this._xys[i].x);
                b['lt_y'] = Math.max(b['lt_y'], this._xys[i].y);
                b['rb_x'] = Math.max(b['rb_x'], this._xys[i].x);
                b['rb_y'] = Math.min(b['rb_y'], this._xys[i].y);
            }
        }
        return b;
    }
    */
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      var _size = 0;
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].getGeometry().getArea != null) {
          _size += this._instance.getSource().getFeatures()[i].getGeometry().getArea();
        }
      }
      return _size;
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "getVertexCount",
    value: function getVertexCount() {
      return this.xys.length - 1;
    }
  }, {
    key: "getVertex",
    value: function getVertex(iidx) {
      return this.xys[iidx - 1];
    }
  }, {
    key: "addVertex",
    value: function addVertex(ixy) {
      if (this.instance != null) this.instance.removeItem(this);
      tmpxy = this.xys.pop();
      this.xys.push(ixy);
      this.xys.push(tmpxy);
      tmpx = this.xs.pop();
      this.xs.push(ixy.x);
      this.xs.push(tmpx);
      tmpy = this.ys.pop();
      this.ys.push(ixy.y);
      this.ys.push(tmpy);
      this.pcount = this.xys.length;
      if (this.instance != null) this.instance.addItem(this);
    }
  }, {
    key: "addAttributes",
    value: function addAttributes(objects) {
      for (var wtfkey in objects) {
        this.attributes[wtfkey] = objects[wtfkey];
      }
    }
  }, {
    key: "getStrokeWidth",
    value: function getStrokeWidth() {
      return this._lineWidth;
    }
  }, {
    key: "setStrokeWidth",
    value: function setStrokeWidth(val) {
      if (!isNaN(val) == false) val = 1;
      this._lineWidth = parseFloat(val);
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        var originStyles = features[0].getStyleFunction().call(null, features[0]);
        originStyles[0].getStroke().setWidth(val);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getStrokeColor",
    value: function getStrokeColor() {
      return this._strokeStyle;
    }
  }, {
    key: "setStrokeColor",
    value: function setStrokeColor(val) {
      this._strokeStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        var originStyles = features[0].getStyleFunction().call(null, features[0]);
        originStyles[0].getStroke().setColor(val);
        //redraw
        //features[0].setStyle(features[0].getStyle());
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "getFillColor",
    value: function getFillColor() {
      return this._fillStyle;
    }
  }, {
    key: "setFillColor",
    value: function setFillColor(val) {
      this._fillStyle = val;
      var features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
        for (var i = 0, max_i = features.length; i < max_i; i++) {
          var originStyles = features[i].getStyleFunction().call(null, features[i]);
          if (originStyles[0].getFill() == null) continue;
          originStyles[0].getFill().setColor(val);

          //redraw
          //features[0].setStyle(features[0].getStyle());
        }
        this._instance.getSource().dispatchEvent('change');
      } else {
        console.log("Error ... features 為 0");
      }
    }
  }, {
    key: "setRotate",
    value: function setRotate(r, obj) {
      //obj 可以指定用坐標的哪個點來作旋轉軸
      //參考：https://gist.github.com/fernandoc1/b6d196e3e32975e29fae4dff60a73ac4
      //預設使用 extent 中心點
      //r 是旋轉角度 0~360
      var message = "\n            //\u50B3\u5165\u503C\u932F\u8AA4...\u4EE5\u4E0B\u662F\u65CB\u8F49\u7BC4\u4F8B\n            \n            polygonObj.setRotate(45); // \u4EE5\u5716\u578B\u7684\u4E2D\u5FC3\u9EDE(getExtent / 2.0) \u53F3\u65CB45\u5EA6\n            polygonObj.setRotate(45,{ // \u4EE54326\u5750\u6A19 121,23 \u70BA\u4E2D\u5FC3\u9EDE\uFF0C\u65CB\u8F4945\u5EA6\n                anchor: [ 121,23 ]  \n            });\n            \n";
      if (isNaN(r)) {
        console.log(message);
        return;
      }
      var gE = this.getExtent();
      var rotate_Point = [(gE[0] + gE[2]) / 2.0, (gE[1] + gE[3]) / 2.0]; //Extent 中心
      if (typeof obj != "undefined" && typeof obj.anchor != "undefined") {
        rotate_Point = obj.anchor;
      }
      r = parseFloat(r);
      this._instance.getSource().getFeatures()[0].getGeometry().rotate(-1 * r * Math.PI / 180.0, ol.proj.transform(rotate_Point, 'EPSG:4326', 'EPSG:3857'));

      //寫回 xys
      this._setXYS();
    }
  }, {
    key: "_setXYS",
    value: function _setXYS() {
      //把目前圖型畫的內容寫回 xy、xys
      this._xs = new Array();
      this._ys = new Array();
      this._xys = new Array();
      for (var i = 0; i < this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
        this._xs.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
        this._ys.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
        this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
      }
    } //2022-05-20 加入 setRotate 功能
    /*enableRotate() {
          
        var select = new ol.interaction.Select()
        select.getFeatures().extend(this._instance.getSource().getFeatures())
          var rotate = new ol.interaction.RotateFeatureInteraction({
            features: select.getFeatures()[0],
            angle: -1.5708,
            style: createStyle()
        })
          rotate.on('rotatestart', evt => console.log('rotate start', evt))
        rotate.on('rotating', evt => console.log('rotating', evt))
        rotate.on('rotateend', evt => console.log('rotate end', evt))
          this._easymap._olmap.addInteraction(select);
        this._easymap._olmap.addInteraction(rotate);
          // custom style factory
        function createStyle() {
            var white = [255, 255, 255, 0.8]
            var blue = [0, 153, 255, 0.8]
            var red = [209, 0, 26, 0.9]
            var width = 2
              var styles = {
                anchor: [
                    new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: new ol.style.Fill({
                                color: blue
                            }),
                            stroke: new ol.style.Stroke({
                                color: blue,
                                width: 1
                            }),
                            radius: 4,
                            points: 6
                        }),
                        zIndex: Infinity
                    })
                ],
                arrow: [
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: white,
                            width: width + 3,
                            lineDash: [10, 10]
                        }),
                        text: new ol.style.Text({
                            font: '14px sans-serif',
                            offsetX: 25,
                            offsetY: -25,
                            fill: new ol.style.Fill({
                                color: 'blue'
                            }),
                            stroke: new ol.style.Stroke({
                                color: white,
                                width: width + 1
                            })
                        }),
                        zIndex: Infinity
                    }),
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: red,
                            width: width + 1,
                            lineDash: [10, 10]
                        }),
                        zIndex: Infinity
                    })
                ]
            }
              return function (feature, resolution) {
                var style
                var angle = feature.get('angle') || 0
                  switch (true) {
                    case feature.get('rotate-anchor'):
                        style = styles['anchor']
                        style[0].getImage().setRotation(-angle)
                          return style
                    case feature.get('rotate-arrow'):
                        style = styles['arrow']
                          var coordinates = feature.getGeometry().getCoordinates()
                        // generate arrow polygon
                        var geom = new ol.geom.LineString([
                            coordinates,
                            [coordinates[0], coordinates[1] + 100 * resolution]
                        ])
                          // and rotate it according to current angle
                        geom.rotate(angle, coordinates)
                        style[0].setGeometry(geom)
                        style[1].setGeometry(geom)
                        style[0].getText().setText(Math.round(-angle * 180 / Math.PI) + '°')
                          return style
                }
            }
        }
    }*/
  }]);
  return dgPolygon;
}();
/* harmony default export */ const dg_dgPolygon = (dgPolygon);
;// CONCATENATED MODULE: ./src/dg/dgMenuFunc.js
function dgMenuFunc_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
var dgMenuFunc = function dgMenuFunc(fname, cfunc, icon) {
  dgMenuFunc_classCallCheck(this, dgMenuFunc);
  var o = new Object();
  o.mname = fname;
  o.afunc = cfunc;
  o.icon = icon;
  return o;
};
/* harmony default export */ const dg_dgMenuFunc = (dgMenuFunc);
;// CONCATENATED MODULE: ./src/dg/dgSource.js
function dgSource_typeof(o) { "@babel/helpers - typeof"; return dgSource_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgSource_typeof(o); }
function dgSource_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgSource_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgSource_toPropertyKey(o.key), o); } }
function dgSource_createClass(e, r, t) { return r && dgSource_defineProperties(e.prototype, r), t && dgSource_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgSource_toPropertyKey(t) { var i = dgSource_toPrimitive(t, "string"); return "symbol" == dgSource_typeof(i) ? i : i + ""; }
function dgSource_toPrimitive(t, r) { if ("object" != dgSource_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgSource_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgSource = /*#__PURE__*/function () {
  function dgSource(layer, options) {
    dgSource_classCallCheck(this, dgSource);
    this._id = options.name;
    this._type = 'dgSource';
    this._layerType = layer;
    if (options.getUrl != null) {
      this._getUrl = options.getUrl;
    }
    /**
     * url
     */
    this._options = options;
    this.options = options;
    this._events = [];
    if (Array.isArray(this._options.url) == true) {
      for (var i = 0; i < this._options.url.length; i++) {
        this._options.url[i] = this._options.url[i].replace(/\$/g, '');
      }
    } else {
      this._options.url = this._options.url.replace(/\$/g, '');
    }
  }
  dgSource_createClass(dgSource, [{
    key: "getOpacity",
    value: function getOpacity() {
      if (this._instance != null && this._instance.getOpacity != null) {
        return this._instance.getOpacity();
      }
      if (this._options.opacity != null) {
        return this._options.opacity;
      }
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      val = parseFloat(val);
      this._options.opacity = val;
      if (this._instance != null && this._instance.setOpacity != null) {
        return this._instance.setOpacity(val);
      }
    }
  }]);
  return dgSource;
}();
/* harmony default export */ const dg_dgSource = (dgSource);
;// CONCATENATED MODULE: ./src/dg/dgGeoJson.js
function dgGeoJson_typeof(o) { "@babel/helpers - typeof"; return dgGeoJson_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgGeoJson_typeof(o); }
function dgGeoJson_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgGeoJson_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgGeoJson_toPropertyKey(o.key), o); } }
function dgGeoJson_createClass(e, r, t) { return r && dgGeoJson_defineProperties(e.prototype, r), t && dgGeoJson_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgGeoJson_toPropertyKey(t) { var i = dgGeoJson_toPrimitive(t, "string"); return "symbol" == dgGeoJson_typeof(i) ? i : i + ""; }
function dgGeoJson_toPrimitive(t, r) { if ("object" != dgGeoJson_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgGeoJson_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgGeoJson = /*#__PURE__*/function () {
  function dgGeoJson(url, srs, callback) {
    dgGeoJson_classCallCheck(this, dgGeoJson);
    //private
    this._easymap = null;
    this._type = 'dggeojson';
    this._url = url;
    this._geojson = null;
    this._wkt = null;
    this._callback = callback;
    this._instance = null;
    this._async = false;
    this._isCluster = false; //是否要群聚顯示
    this._dataSRS = "EPSG:4326"; //預設 4326
    if (srs != null) {
      this._dataSRS = srs;
    }
    //arrow 用
    this._isLinestringArrowEnabled = false;
    this._lineStringIconsrc = '';
    this._lineStringIconsrcScale = 1.0; //比例放大

    this._setUpperZoomByBoundary = false; //whether uses most best view range
    this._xhr = null;
    this._styleFunction = function (feature) {
      feature._easymapClass = 'dggeojson';
      feature._dggeojson = this;

      //feature.onFeatureSelect = this.onFeatureSelect;
      //feature.onFeatureUnselect = this.onFeatureUnselect;
      //feature._onFeatureHover = this._onFeatureHover;
      //From : https://stackoverflow.com/questions/54907386/add-a-text-next-to-the-point-open-layer

      //2022-07-18
      //如果 getType 為 線，把 text placement 改成線            
      //改這裡要小心上面也有一段是一樣的
      //Point Polygon LineString
      //window['wtf'] = st;
      var label = feature.get('label');
      var min_zoom = feature.get('min_zoom');
      var max_zoom = feature.get('max_zoom');
      var pic = feature.get('pic');
      //console.log("min_zoom: " + min_zoom);
      //console.log("max_zoom: " + max_zoom);
      //console.log("this.getZoom(): " + this.getZoom());
      //如果資料有 min_zoom 與 max_zoom 判斷目前的 zoom level 決定要不要顯示 text
      var outputStyle = [];
      //window['wtf'] = this;
      //console.log(this);
      outputStyle.push(this._styles[feature.getGeometry().getType()]);
      if (label != null && label != '') {
        //From : https://stackoverflow.com/questions/54907386/add-a-text-next-to-the-point-open-layer
        if (min_zoom != null && max_zoom != null) {
          if (this._easymap.getZoom() < min_zoom || this._easymap.getZoom() > max_zoom) {
            label = null;
          }
        }
        this._styles.Text.getText().setText(label);

        //2022-07-18
        //如果 getType 為 線，把 text placement 改成線
        //改這裡要小心上面也有一段是一樣的
        //Point Polygon LineString
        //window['wtf'] = st;
        switch (feature.getGeometry().getType().toLowerCase()) {
          case "point":
            {
              this._styles.Text.getText().setPlacement('point');
              this._styles.Text.getText().setOffsetY(20);
            }
            break;
          case "linestring":
          case "polyline":
          case "multilinestring":
            {
              this._styles.Text.getText().setPlacement('line');
            }
            break;
        }
        outputStyle.push(this._styles.Text);
        //console.log("feature.getGeometry().getType(): " + feature.getGeometry().getType());
      }

      //如果有圖片
      if (pic != null) {
        //From : https://openlayers.org/en/latest/examples/icon.html                                
        //this._styles.Image.getImage().getImage().width = 32;
        //this._styles.Image.getImage().getImage().height = 32;                

        //console.log(pic);
        //似乎要先設定圖片大小，再放圖，才不會出問題
        //this._styles.Image.getImage().getImage().width = 64; //preset
        //this._styles.Image.getImage().getImage().height = 64; //preset
        //this._styles.Image.getImage().getImage().src = pic;
        //'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAY0lEQVR42u3QAREAAAQEMJKL/nI4W4R1JVOPtQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEHDfArMdn4FHyLy9AAAAAElFTkSuQmCC'
        this._styles.Image = new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            crossOrigin: 'anonymous',
            scale: this._iconScale,
            src: pic
          })
        });
        outputStyle.push(this._styles.Image);
      }
      //console.log(outputStyle);

      //如果自身有 //this._flashFocusData.orinStyle 直接參考!?

      if (feature._dggeojson._flashFocusData.isPlaying == true && feature._dggeojson._flashFocusData.orinStyle != null) {
        //在閃動時
        //console.log(feature._dggeojson);
        //看閃有顏色的還是閃原本的

        switch (feature._dggeojson._flashFocusData._cFlag) {
          case 1:
            {
              //console.log(feature);
              var _data_index = feature.values_.data_index;
              if (_data_index == null) {
                break; //break switch
              }
              //let _dataObj = feature._dggeojson._wkt[feature._dgwkt._dataIndexToFeatureIndex(_data_index)];
              var _color = feature._dggeojson._flashFocusData.flashColor;
              var isNeedFlash = false; //如果需要閃才會變 true
              if (feature._dggeojson._flashFocusData.filters == null) {
                isNeedFlash = true; //沒有限制條件，皆要閃
              } else if (isNeedFlash == false && Array.isArray(feature._dggeojson._flashFocusData.filters)) {
                var _data_index2 = feature.values_.data_index;
                if (_data_index2 == null) {
                  break; //break switch
                }
                var _dataObj = feature._dggeojson._wkt[_data_index2];
                for (var j = 0, max_j = feature._dggeojson._flashFocusData.filters.length; j < max_j; j++) {
                  //看此筆資料是否符合限制條件
                  var _obj = feature._dggeojson._flashFocusData.filters[j];
                  if (_obj['attr'] == null || _obj['kind'] == null || _obj['value'] == null) {
                    console.log(" filter 條件異常，需為：{'attr':'欄位','kind':'如: == 、 != 、 >= 、 <= 、 > 、 < 、 like','value':'123' ");
                    continue;
                  }

                  //console.log(feature);

                  //console.log(obj);
                  //console.log(_dataObj);
                  if (_dataObj[_obj['attr']] == null) {
                    console.log(" filter 條件異常，geojson 屬性資料沒有「" + _obj['attr'] + "」");
                    continue; //continue for
                  }
                  switch (_obj['kind'].toLowerCase()) {
                    case '==':
                      {
                        if (_dataObj[_obj['attr']] == _obj['value']) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '!=':
                      {
                        if (_dataObj[_obj['attr']] != _obj['value']) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '>':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) > parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '>=':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) >= parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '<':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) < parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '<=':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) <= parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case 'like':
                      {
                        if (feature._dggeojson._easymap._is_string_like(_dataObj[_obj['attr']], '%' + _obj['value'] + '%')) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                  }
                  if (isNeedFlash) {
                    //如果有客製符合的顏色
                    _color = _obj['flashColor'] != null ? _obj['flashColor'] : _color;
                    break;
                  } //break for
                }
              }
              if (isNeedFlash) {
                //此筆資料要閃
                //console.log("此筆資料要閃...");
                var new_color_with_opacity = feature._dggeojson._easymap.colorValues(_color);
                for (var _j = 0, _max_j = outputStyle.length; _j < _max_j; _j++) {
                  //window['wtf'] = outputStyle[i];
                  var _rgb = 'rgb(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ')';
                  outputStyle[_j].getText == null || outputStyle[_j].getText() == null || outputStyle[_j].getText().setColor == null ? null : outputStyle[_j].getText().setColor(_rgb);
                  outputStyle[_j].getText == null || outputStyle[_j].getText() == null || outputStyle[_j].getText().getFill == null || outputStyle[_j].getText().getFill() == null || outputStyle[_j].getText().getFill().setColor == null ? null : outputStyle[_j].getText().getFill().setColor(_rgb);
                  outputStyle[_j].getStroke == null || outputStyle[_j].getStroke() == null || outputStyle[_j].getStroke().setColor == null ? null : outputStyle[_j].getStroke().setColor(_rgb);
                  //console.log(this._easymap);

                  //這裡用 0.5 opacity 
                  outputStyle[_j].getFill == null || outputStyle[_j].getFill() == null || outputStyle[_j].getFill().setColor == null ? null : outputStyle[_j].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                  outputStyle[_j].getImage == null || outputStyle[_j].getImage() == null || outputStyle[_j].getImage().getFill == null || outputStyle[_j].getImage().getFill() == null || outputStyle[_j].getImage().getFill().setColor == null ? null : outputStyle[_j].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                  outputStyle[_j].getImage == null || outputStyle[_j].getImage() == null || outputStyle[_j].getImage().getRadius == null || outputStyle[_j].getImage().getRadius() == null ? null : outputStyle[_j].getImage().setRadius(feature._easymapFeatureOrinStyle[_j].radius);
                }
              } else {
                for (var _j2 = 0, _max_j2 = outputStyle.length; _j2 < _max_j2; _j2++) {
                  feature._easymapFeatureOrinStyle[_j2].text == null ? null : outputStyle[_j2].getText().setColor(feature._easymapFeatureOrinStyle[_j2].text);
                  feature._easymapFeatureOrinStyle[_j2].textfill == null ? '' : outputStyle[_j2].getText().getFill().setColor(feature._easymapFeatureOrinStyle[_j2].textfill);
                  feature._easymapFeatureOrinStyle[_j2].stroke == null ? '' : outputStyle[_j2].getStroke().setColor(feature._easymapFeatureOrinStyle[_j2].stroke);
                  feature._easymapFeatureOrinStyle[_j2].fill == null ? '' : outputStyle[_j2].getFill().setColor(feature._easymapFeatureOrinStyle[_j2].fill);
                  feature._easymapFeatureOrinStyle[_j2].image == null ? '' : outputStyle[_j2].getImage().getFill().setColor(feature._easymapFeatureOrinStyle[_j2].image);
                  feature._easymapFeatureOrinStyle[_j2].radius == null || outputStyle[_j2].getImage == null || outputStyle[_j2].getImage().setRadius == null || outputStyle[_j2].getImage().getRadius() == null ? '' : outputStyle[_j2].getImage().setRadius(feature._easymapFeatureOrinStyle[_j2].radius);
                }
              }
            }
            break;
          case -1:
            {
              //原本的樣式，不用加料
              //console.log(feature);
              var _data_index3 = feature.values_.data_index;
              if (_data_index3 == null) {
                break; //continue for
              }
              // use orin style
              for (var _j3 = 0, _max_j3 = outputStyle.length; _j3 < _max_j3; _j3++) {
                feature._easymapFeatureOrinStyle[_j3].text == null ? null : outputStyle[_j3].getText().setColor(feature._easymapFeatureOrinStyle[_j3].text);
                feature._easymapFeatureOrinStyle[_j3].textfill == null ? '' : outputStyle[_j3].getText().getFill().setColor(feature._easymapFeatureOrinStyle[_j3].textfill);
                feature._easymapFeatureOrinStyle[_j3].stroke == null ? '' : outputStyle[_j3].getStroke().setColor(feature._easymapFeatureOrinStyle[_j3].stroke);
                feature._easymapFeatureOrinStyle[_j3].fill == null ? '' : outputStyle[_j3].getFill().setColor(feature._easymapFeatureOrinStyle[_j3].fill);
                feature._easymapFeatureOrinStyle[_j3].image == null ? '' : outputStyle[_j3].getImage().getFill().setColor(feature._easymapFeatureOrinStyle[_j3].image);
                feature._easymapFeatureOrinStyle[_j3].radius == null || outputStyle[_j3].getImage == null || outputStyle[_j3].getImage().setRadius == null ? '' : outputStyle[_j3].getImage().setRadius(feature._easymapFeatureOrinStyle[_j3].radius);
              }
            }
            break;
        }
      }

      //如果有 arrow
      if (this._isLinestringArrowEnabled) {
        var geometry = feature.getGeometry();
        var type = geometry.getType();
        //let properties = feature.getProperties()

        //console.log(type.toLowerCase());
        if (type.toLowerCase() == 'linestring' || type.toLowerCase() == 'multilinestring') {
          var segments = null;
          if (type.toLowerCase() == 'multilinestring') {
            segments = geometry.getLineString();
          } else {
            segments = geometry;
          }
          // From : https://openlayers.org/en/latest/examples/line-arrows.html
          segments.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            // arrows
            //var styles = feature.getStyleFunction().call(null, feature);
            outputStyle.push(new ol.style.Style({
              geometry: new ol.geom.Point(end),
              image: new ol.style.Icon({
                src: this._lineStringIconsrc,
                anchor: [0.75, 0.5],
                rotateWithView: true,
                rotation: -rotation,
                scale: this._lineStringIconsrcScale
              })
            }));
          }.bind(this));
        }
      } // 有 arrow if

      return outputStyle;
    }.bind(this);
    this._style_cluster_custom = null;
    //networklink httprequest
    this._styles_cluster = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 18,
        stroke: new ol.style.Stroke({
          color: '#fff'
        }),
        fill: new ol.style.Fill({
          color: '#3399CC'
        })
      }),
      text: new ol.style.Text({
        //text: size.toString(),
        fill: new ol.style.Fill({
          color: '#fff'
        }),
        padding: [5, 5, 5, 5]
      })
    }); //預設群聚樣式
    this._styles = {
      'Text': new ol.style.Style({
        text: new ol.style.Text({
          text: '',
          font: '12pt sans-serif',
          stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.75
          }),
          backgroundFill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.3)'
          }),
          placement: 'point',
          //point、line...
          offsetY: 0,
          overflow: false
        })
      }),
      'Point': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiPoint': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.1)'
        })
      }),
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      }),
      'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'magenta'
        }),
        image: new ol.style.Circle({
          radius: 10,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'magenta'
          })
        })
      }),
      'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
      /*
       * //有圖再插
      'Image': new ol.style.Style({
          image: new ol.style.Icon({
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              crossOrigin: 'anonymous',
              scale: 1,
              src: 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAY0lEQVR42u3QAREAAAQEMJKL/nI4W4R1JVOPtQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEHDfArMdn4FHyLy9AAAAAElFTkSuQmCC'
          })
      })
      */
    }; //預設單點樣式
    //this._gMarkerEnabled = false;
    //this._distance = 50;
    //this._threshold = 1;
    //this._Style = new dgGStyle();
    //this._isZoomClusterEnabled = true; //whether 到某zoom關閉cluster
    //this._clusterZoom = 17;            // 預設18層以上不分群
    //this._defaultStyles = null;
    this._zIndex = 1;

    //this._isLinestringArrowEnabled = false;//是否開啟LineString arrow

    //this._showInSelect = true; //可顯示在點開的下拉選單
    //this._lineStringIconsrc = '';
    //this._lineStringStyle = null;
    this._lineStringWidth = 1;
    //this._zoomThreshold = 0;
    this._featureSelect = true;
    /*this._styleCache = {//加快cluster style
        h: null,
        m: null,
        l: null
    };*/
    //public
    this.url = url;

    //#events 
    this.onFeatureSelect = null;
    this.onFeatureUnselect = null;
    this._onFeatureHover = null;
    this.labelVisible = false; //whether label shows or not
    this.iconVisible = false; //whether icon shows or not
    this.useNetworkLink = true; //whether use networklink
    this.opacity = 1;
    this._clusterDistance = [40, 20]; //啥範圍才群聚
    this._minClusterSize = 2; //最小多小才群聚
    this._clusterSource = null;
    this._iconScale = 0.35;
    this._iconSize = [64, 64];
    this._isClusterClickZoomToBBOX = true; //按到數值，自動 zoom 到範圍
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1,
      //switch 1 and -1
      filter: null // 可以依條件設定要操作的對象
    };
    this.bufferObj = null;
    return this;
  }
  dgGeoJson_createClass(dgGeoJson, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgGeoJson_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.filters = null; //preset 
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)', filters: [{ attr ... kind ... value ... flashColor }]}");
      } else {
        //Default
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = null;
        if (features[i].getStyleFunction() == null) {
          originStyles = this._styleFunction(features[i]);
        } else {
          originStyles = features[i].getStyleFunction().call(null, features[i]);
        }
        var d = new Array();
        for (var j = 0, max_j = originStyles.length; j < max_j; j++) {
          d.push({
            text: originStyles[j].getText == null || originStyles[j].getText() == null || originStyles[j].getText().getColor == null ? null : originStyles[j].getText().getColor(),
            textfill: originStyles[j].getText == null || originStyles[j].getText() == null || originStyles[j].getText().getFill == null || originStyles[j].getText().getFill() == null || originStyles[j].getText().getFill().getColor == null ? null : originStyles[j].getText().getFill().getColor(),
            stroke: originStyles[j].getStroke == null || originStyles[j].getStroke() == null || originStyles[j].getStroke().getColor == null ? null : originStyles[j].getStroke().getColor(),
            fill: originStyles[j].getFill == null || originStyles[j].getFill() == null || originStyles[j].getFill().getColor == null ? null : originStyles[j].getFill().getColor(),
            image: originStyles[j].getImage == null || originStyles[j].getImage() == null || originStyles[j].getImage().getFill == null || originStyles[j].getImage().getFill() == null || originStyles[j].getImage().getFill().getColor == null ? null : originStyles[j].getImage().getFill().getColor(),
            //改顏色必需觸發一次改大小，才會生效
            //point 特有
            radius: originStyles[j].getImage == null || originStyles[j].getImage() == null || originStyles[j].getImage().getRadius == null ? null : originStyles[j].getImage().getRadius()
          });
        } // for j originStyles
        //this._flashFocusData.orinStyle.push(d);
        features[i]._easymapFeatureOrinStyle = d;
      } // for
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        //let features = this._instance.getSource().getFeatures();
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "setCluster",
    value: function setCluster(_bool) {
      if (typeof _bool != "boolean") {
        console.log("只接受 true or false ，如: setCluster(true); ");
        return;
      }
      this._isCluster = _bool; //true or false
      //do something..
      if (this._instance != null) {
        //代表已套過，移除重新再套一次
        this._easymap.removeItem(this);
        this._easymap.addItem(this);
      }
    }
  }, {
    key: "getCluster",
    value: function getCluster() {
      return this._isCluster;
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      //自然走完
      this._flashFocusData.runTimes = 1;
      this._flashFocusData._cFlag = -1;
      //clearInterval(this._flashFocusData.runInterval); //stop        
      //this._instance.getSource().dispatchEvent('change');        
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      return this._styles;
    }
    /*setStyle(op) {
        if (this._styles == null) {
            this._styles = this._easymap._objMergeDeep(this._defaultStyle);
        }
        if (typeof (op) == "object") {
            for (var k in op) {
                this._styles[k] = this._easymap._objMergeDeep(op[k]);
            }
        }
    }*/
  }, {
    key: "getCenter",
    value: function getCenter() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      return new dgXY((_extent_4326[0] + _extent_4326[2]) / 2.0, (_extent_4326[1] + _extent_4326[3]) / 2.0);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      var _size = 0;
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].getGeometry().getArea != null) {
          _size += this._instance.getSource().getFeatures()[i].getGeometry().getArea();
        }
      }
      return _size;
    }
  }, {
    key: "getZIndex",
    value: function getZIndex() {
      return this._zIndex;
    }
  }, {
    key: "setZIndex",
    value: function setZIndex(val) {
      this._zIndex = parseInt(val);
      //console.log(this);
      if (this._easymap != null && this._easymap.setItemZIndex != null) {
        this._easymap.setItemZIndex(this, this.getZIndex());
      }
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      this._setUpperZoomByBoundary = true;
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      if (!isNaN(val) == false) val = 1;
      this.opacity = parseFloat(val);
      //console.log(this);        
      this._instance.setOpacity(this.opacity);
    }
  }, {
    key: "setFeatureClick",
    value: function setFeatureClick(handler) {
      this.onFeatureSelect = handler;
    }
  }, {
    key: "setFeatureHover",
    value: function setFeatureHover(handler) {
      this._onFeatureHover = handler;
    } //updateStyleByAttribute() { }
  }, {
    key: "getType",
    value: function getType() {
      if (this._instance != null) {
        return this._instance.getType();
      }
      return null;
    }
  }, {
    key: "disableScaleRotate",
    value: function disableScaleRotate() {
      if (this._interaction != null) {
        this._easymap._olmap.removeInteraction(this._interaction);
        this._interaction = null;
      }
    }
  }, {
    key: "enableScaleRotate",
    value: function enableScaleRotate(obj) {
      /*obj : 
      {              
        scale : true,
        rotate : true,
        stop: function(evt){
        }
      }
      */
      var firstPoint = false;
      var isScale = true;
      var isRotate = true;
      if (typeof obj != "undefined" && typeof obj.scale == "boolean") {
        isScale = obj.scale;
      }
      if (typeof obj != "undefined" && typeof obj.rotate == "boolean") {
        isRotate = obj.rotate;
      }
      this._interaction = new ol.interaction.Transform({
        enableRotatedTransform: false,
        /* Limit interaction inside bbox * /
        condition: function(e, features) {
          return ol.extent.containsXY([-465960, 5536486, 1001630, 6514880], e.coordinate[0], e.coordinate[1]);
        },
        /* */
        addCondition: ol.condition.shiftKeyOnly,
        // filter: function(f,l) { return f.getGeometry().getType()==='Polygon'; },
        layers: [this._instance],
        //window.data[2].easyobj._instance],
        hitTolerance: 2,
        translateFeature: true,
        //$("#translateFeature").prop('checked'),
        scale: isScale,
        //$("#scale").prop('checked'),
        rotate: isRotate,
        //$("#rotate").prop('checked'),
        keepAspectRatio: ol.condition.always,
        //$("#keepAspectRatio").prop('checked') ? ol.events.condition.always : undefined,
        translate: true,
        //$("#translate").prop('checked'),
        stretch: true //$("#stretch").prop('checked')
      });
      //map.addInteraction(interaction);
      //console.log(this);    
      this._easymap._olmap.addInteraction(this._interaction);
      // Style handles
      //setHandleStyle();
      // Events handlers
      var startangle = 0;
      var d = [0, 0];

      // Handle rotate on first point
      var firstPoint = false;
      // default center
      firstPoint = false;
      this._interaction.setCenter();
      this._interaction.on(['select'], function (e) {
        if (firstPoint && e.features && e.features.getLength()) {
          interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
        //console.log(this);
        if (this.onedit_select != null) {
          //console.log(this.onclick.toString());
          //當編輯結束以後，會觸發 onedit_select 事件
          this.onedit_select(e);
        }
      }.bind(this));
      this._interaction.on(['rotatestart', 'translatestart'], function (e) {
        // Rotation
        startangle = e.feature.get('angle') || 0;
        // Translation
        d = [0, 0];
      });
      this._interaction.on('rotating', function (e) {
        //$('#info').text("rotate: "+((e.angle*180/Math.PI -180)%360+180).toFixed(2)); 
        // Set angle attribute to be used on style !
        e.feature.set('angle', startangle - e.angle);
      });
      this._interaction.on('translating', function (e) {
        d[0] += e.delta[0];
        d[1] += e.delta[1];
        //$('#info').text("translate: "+d[0].toFixed(2)+","+d[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on('scaling', function (e) {
        //$('#info').text("scale: "+e.scale[0].toFixed(2)+","+e.scale[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on(['rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        switch (this._type) {
          case 'dggeojson':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            try {
              for (var i = 0; i < e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                this._xs.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                this._ys.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
              }
            } catch (_unused) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "enableEditor",
    value: function enableEditor() {
      this._modify = new ol.interaction.Modify({
        source: this._instance.getSource()
      });
      this._easymap._olmap.addInteraction(this._modify);
      this._modify.on(['modifyend', 'rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        //console.log(e);
        //console.log(this);
        //window['wtf']=e;
        //window['wtff']=this;
        switch (this._type) {
          case 'dggeojson':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            //console.log(e);
            //window['wtf']=e;   
            try {
              for (var i = 0; i < e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                this._xs.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                this._ys.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
              }
            } catch (_unused2) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "disableEditor",
    value: function disableEditor() {
      if (this._modify != null) {
        this._easymap._olmap.removeInteraction(this._modify);
        this._modify = null;
      }
    }
  }, {
    key: "_dataIndexToFeatureIndex",
    value: function _dataIndexToFeatureIndex(di) {
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].values_.data_index == di) {
          return i;
        }
      }
    }
  }, {
    key: "setClusterClickZoomToBBOX",
    value: function setClusterClickZoomToBBOX(_bool) {
      if (typeof _bool != "boolean") {
        console.log("只接受 true or false ，如: setCluster(true); ");
        return;
      }
      this._isClusterClickZoomToBBOX = _bool; //true or false
    }
  }, {
    key: "getClusterClickZoomToBBOX",
    value: function getClusterClickZoomToBBOX() {
      return this._isClusterClickZoomToBBOX;
    }
  }, {
    key: "setIconScale",
    value: function setIconScale(v) {
      this._iconScale = parseFloat(v);

      //reload style
      if (this._instance != null) {
        //this._instance.setStyle(this._instance.getStyle());
        this._instance.getSource().dispatchEvent('change');
      }
    }
  }, {
    key: "getIconScale",
    value: function getIconScale() {
      return this._iconScale;
    }
  }, {
    key: "setMinClusterSize",
    value: function setMinClusterSize(v) {
      this._minClusterSize = parseInt(v, 10);
      if (this._clusterSource != null) {
        //重載變動
        this._clusterSource.setDistance(this._clusterDistance[0]);
        if (this._instance != null) {
          //代表已套過，移除重新再套一次
          this._easymap.removeItem(this);
          this._easymap.addItem(this);
        }
      }
    }
  }, {
    key: "getMinClusterSize",
    value: function getMinClusterSize() {
      return this._minClusterSize;
    }
  }, {
    key: "setClusterDistance",
    value: function setClusterDistance(arr) {
      if (!Array.isArray(arr)) {
        console.log("設定群聚間距，如 geojsonObj.setClusterDistance( [ 40 , 20 ] );");
        return;
      }
      this._clusterDistance = arr;
      if (this._clusterSource != null) {
        //直接變動
        this._clusterSource.setDistance(parseInt(arr[0], 10));
        this._clusterSource.setMinDistance(parseInt(arr[1], 10));
      }
    }
  }, {
    key: "getClusterDistance",
    value: function getClusterDistance() {
      return this._clusterDistance;
    }
  }, {
    key: "getClosestData",
    value: function getClosestData(wkt_or_dgxy, counts) {
      // 此 getClosestData 可以搜尋 wkt 陣列的資料，查找最接近傳入 WKT 或 dgXY 的內容，counts 為回傳筆數，如為 null 則全數回傳。
      switch (wkt_or_dgxy.constructor.name.toLowerCase()) {
        case "dgxy":
          {
            wkt_or_dgxy = "POINT(" + wkt_or_dgxy.x + " " + wkt_or_dgxy.y + ")";
          }
          break;
      }
      //統一用 wkt 來讀取
      if (!Array.isArray(this._wkt)) {
        console.log("此 dgWKT 尚未載入 wkt ");
        return false;
      }
      var gf = new ol.format.WKT();
      var from_geome = gf.readFeatures(wkt_or_dgxy, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      var output = new Array();
      for (var i = 0, max_i = this._wkt.length; i < max_i; i++) {
        var geome = gf.readFeatures(this._wkt[i]['wkt'], {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        //this._wkt[i]['geome'] = geome;
        //只跟 geome[0] 比
        output.push(this._wkt[i]);
        var index = output.length - 1;
        output[index]['getClosestData_index'] = i;
        output[index]['getClosestData_distance'] = this._easymap._getShortestLineDistance(from_geome[0].getGeometry(), geome[0].getGeometry());
      }

      //排序
      output = this._easymap._array_sort(output, "getClosestData_distance", "ASC");
      //看看 counts 有沒有值
      if (!isNaN(counts)) {
        output = output.slice(0, counts);
      }
      return output;
      //window['wtf_output'] = output;
      //window['wtf'] = from_geome;
    }
  }, {
    key: "enableLineStringArrow",
    value: function enableLineStringArrow(iconsrc, op) {
      //zoomThreshold
      //亦可換成 easymap/imgs/arror.png
      if (iconsrc == null || iconsrc == '') {
        iconsrc = "https://openlayers.org/en/latest/examples/data/arrow.png";
      }
      this._lineStringIconsrc = iconsrc;
      //if (zoomThreshold == undefined) zoomThreshold = 0;
      //this._zoomThreshold = zoomThreshold;//超過哪個zoom才開啟，預設為0
      if (dgGeoJson_typeof(op) == "object") {
        if (typeof op.scale != "undefined") {
          this._lineStringIconsrcScale = op.scale;
        }
      }
      if (this._instance == null) {
        console.log("需要在 addItem 後才能使用");
        return;
      }
      if (this._isLinestringArrowEnabled == true) {
        console.log("已經上過箭頭了...");
        return;
      }
      this._isLinestringArrowEnabled = true;
      /*
      let features = this._instance.getSource().getFeatures();
            for (let i = 0, max_i = features.length; i < max_i; i++) {
          let styles = [
              // linestring
              
          ];
          //orin s 
          var orin_style = this._instance.getSource().getFeatures()[i].getStyle();
          if (orin_style != null) {
              styles.push(orin_style);
          }
          let feature = features[i]
          feature._lineStringIconsrc = this._lineStringIconsrc;
          let geometry = feature.getGeometry()
          let type = geometry.getType()
          //let properties = feature.getProperties()
          
          console.log(type.toLowerCase());
          if (
              type.toLowerCase() == 'linestring' ||
              type.toLowerCase() == 'multilinestring'
          ) {
          } else {
              continue
          }
            let segments = null
          if (type.toLowerCase() == 'multilinestring') {
              segments = geometry.getLineString()
          } else {
              segments = geometry
          }
          // From : https://openlayers.org/en/latest/examples/line-arrows.html
          segments.forEachSegment(
              function (start, end) {
                  var dx = end[0] - start[0];
                  var dy = end[1] - start[1];
                  var rotation = Math.atan2(dy, dx);
                  // arrows
                  //var styles = feature.getStyleFunction().call(null, feature);
                  styles.push(
                      new ol.style.Style({
                          geometry: new ol.geom.Point(end),
                          image: new ol.style.Icon({
                              src: this._lineStringIconsrc,
                              anchor: [0.75, 0.5],
                              rotateWithView: true,
                              rotation: -rotation,
                              scale: this._lineStringIconsrcScale
                          })
                      })
                  );
              }.bind(this)
          )
          feature.setStyle(styles)
      }
      */
      this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "disableLineStringArrow",
    value: function disableLineStringArrow() {
      if (this._isLinestringArrowEnabled == false) {
        console.log("還沒上過箭頭...");
        return;
      }
      this._isLinestringArrowEnabled = false;
      /*
      let features = this._instance.getSource().getFeatures();
      for (let i = 0, max_i = features.length; i < max_i; i++) {
          let feature = features[i];
          var styles = feature.getStyle();
          if (Array.isArray(styles)) {
              styles = styles[0];
          }
          
          //https://stackoverflow.com/questions/65754068/how-to-remove-style-from-individual-feature-of-a-vector-layer-in-open-layers            
          feature.setStyle(styles);
      }
      */

      this._instance.getSource().dispatchEvent('change');
    }
  }]);
  return dgGeoJson;
}();
/* harmony default export */ const dg_dgGeoJson = (dgGeoJson);
;// CONCATENATED MODULE: ./src/dg/dgWKT.js
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) { n[e] = r[e]; } return n; }
function dgWKT_typeof(o) { "@babel/helpers - typeof"; return dgWKT_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgWKT_typeof(o); }
function dgWKT_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgWKT_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgWKT_toPropertyKey(o.key), o); } }
function dgWKT_createClass(e, r, t) { return r && dgWKT_defineProperties(e.prototype, r), t && dgWKT_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgWKT_toPropertyKey(t) { var i = dgWKT_toPrimitive(t, "string"); return "symbol" == dgWKT_typeof(i) ? i : i + ""; }
function dgWKT_toPrimitive(t, r) { if ("object" != dgWKT_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgWKT_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgWKT = /*#__PURE__*/function () {
  function dgWKT(url, srs, callback) {
    dgWKT_classCallCheck(this, dgWKT);
    //private
    this._easymap = null;
    this._easymapClass = 'dgwkt';
    this._type = 'dgwkt';
    this._xys = new Array();
    this._xs = new Array();
    this._ys = new Array();
    this._url = url;
    this._wkt = null;
    this._wkt_style = null; // 2024-08-15 增加，如果有 wkt_style 就用 wkt_style
    this._callback = callback;
    this._instance = null;
    this._async = false;
    this._isCluster = false; //是否要群聚顯示
    this._dataSRS = "EPSG:4326"; //預設 4326
    if (srs != null) {
      this._dataSRS = srs;
    }
    this._clusterDistance = [40, 20]; //啥範圍才群聚
    this._minClusterSize = 2; //最小多小才群聚
    this._clusterSource = null;
    this._iconScale = 0.35;
    this._iconSize = [64, 64];
    this._isClusterClickZoomToBBOX = true; //按到數值，自動 zoom 到範圍
    this._point_positionY = 20; // 2025-03-18 預設為 20 其他是 0
    this._linestring_positionY = 0; // 2025-03-18 預設為 0
    this._polygon_positionY = 0; // 2025-03-18 預設為 0
    //2024-07-23 增加 spiderdisplay
    this._spiderDisplayMapEvent = null;
    this._spiderDisplayWKTOBJ = null;
    this._isSpiderDisplay = false;
    this._spiderDisplayZoomLevel = 15; //超過多少 level 才會變蜘蛛展開 ?

    this.enableSpiderDisplay = function (zoom) {
      this._isSpiderDisplay = true;
      //第幾階以後，點擊重複坐標點位，會有蜘蛛畫面展示?
      this._spiderDisplayZoomLevel = parseFloat(zoom);
      if (this._easymap != null) {
        this._easymap.removeItem(this._spiderDisplayWKTOBJ);
      }
    };
    this.displaySpiderDisplay = function () {
      this._isSpiderDisplay = false;
    };
    this._setUpperZoomByBoundary = false; //whether uses most best view range
    this._xhr = null; //networklink httprequest

    this._dash = {
      lineDash: [0, 0],
      lineCap: 'round'
    };
    this._styleFunction = function (feature) {
      feature._easymapClass = 'dgwkt';
      feature._dgwkt = this;

      //feature.onFeatureSelect = this.onFeatureSelect;
      //feature.onFeatureUnselect = this.onFeatureUnselect;
      //feature._onFeatureHover = this._onFeatureHover;
      //From : https://stackoverflow.com/questions/54907386/add-a-text-next-to-the-point-open-layer

      //2022-07-18
      //如果 getType 為 線，把 text placement 改成線            
      //改這裡要小心上面也有一段是一樣的
      //Point Polygon LineString
      //window['wtf'] = st;
      var label = feature.get('label');
      var min_zoom = feature.get('min_zoom');
      var max_zoom = feature.get('max_zoom');
      var pic = feature.get('pic');
      var style_setting = feature.get('style_setting');
      //console.log("min_zoom: " + min_zoom);
      //console.log("max_zoom: " + max_zoom);
      //console.log("this.getZoom(): " + this.getZoom());
      //如果資料有 min_zoom 與 max_zoom 判斷目前的 zoom level 決定要不要顯示 text
      var outputStyle = [];
      //window['wtf'] = this;
      //console.log(this);
      //註冊是什麼類型的樣式
      var fStyle = this._styles[feature.getGeometry().getType()]; // 全域樣式
      fStyle.kind = feature.getGeometry().getType().toLowerCase();
      if (style_setting != null) {
        if (feature._feature_style == null) {
          //用來存客製樣式
          feature._feature_style = {};
        }
      }
      if (style_setting != null) {
        //客製的為新建                      
        if (feature._feature_style[fStyle.kind] == null) {
          switch (fStyle.kind) {
            case "text":
              s = new ol.style.Text({
                text: label,
                // 私域的文字設定位置
                font: '12pt sans-serif',
                stroke: new ol.style.Stroke({
                  color: 'black',
                  width: 0.75
                }),
                backgroundFill: new ol.style.Fill({
                  color: 'rgba(255,255,255,0.3)'
                }),
                placement: 'point',
                //point、line...
                offsetY: 0,
                overflow: false
              });
              break;
            case "point":
              feature._feature_style[fStyle.kind] = new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 5,
                  fill: new ol.style.Fill({
                    color: 'transparent'
                  }),
                  stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 1
                  })
                })
              });
              break;
            case "linestring":
              feature._feature_style[fStyle.kind] = new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: 'green',
                  width: 1
                })
              });
              break;
            case "multilinestring":
              feature._feature_style[fStyle.kind] = new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: 'green',
                  width: 1
                })
              });
              break;
            case "multipoint":
              feature._feature_style[fStyle.kind] = new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 5,
                  fill: new ol.style.Fill({
                    color: 'transparent'
                  }),
                  stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 1
                  })
                })
              });
              break;
            case 'multipolygon':
              feature._feature_style[fStyle.kind] = new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: 'yellow',
                  width: 1
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 0, 0.1)'
                })
              });
              break;
            case 'polygon':
              feature._feature_style[fStyle.kind] = new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: 'blue',
                  lineDash: [4],
                  width: 3
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(0, 0, 255, 0.1)'
                })
              });
              break;
            case 'geometrycollection':
              feature._feature_style[fStyle.kind] = new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: 'magenta',
                  width: 2
                }),
                fill: new ol.style.Fill({
                  color: 'magenta'
                }),
                image: new ol.style.Circle({
                  radius: 10,
                  fill: null,
                  stroke: new ol.style.Stroke({
                    color: 'magenta'
                  })
                })
              });
              break;
          }
          feature._feature_style[fStyle.kind].kind = fStyle.kind;
        }
        outputStyle.push(feature._feature_style[fStyle.kind]);
      } else {
        // 使用全域樣式
        outputStyle.push(fStyle);
      }
      //console.log("Before outputStyle..."); 
      //console.log(outputStyle);

      if (label != null && label != '') {
        //From : https://stackoverflow.com/questions/54907386/add-a-text-next-to-the-point-open-layer
        if (min_zoom != null && max_zoom != null) {
          if (this._easymap.getZoom() < min_zoom || this._easymap.getZoom() > max_zoom) {
            label = null;
          }
        }

        // 全域的文字設定位置
        this._styles.Text.getText().setText(label);

        //2022-07-18
        //如果 getType 為 線，把 text placement 改成線
        //改這裡要小心上面也有一段是一樣的
        //Point Polygon LineString
        //window['wtf'] = st;
        switch (feature.getGeometry().getType().toLowerCase()) {
          case "point":
            {
              this._styles.Text.getText().setPlacement('point');
              // 這裡是 style_function，會一直重刷，不要寫在這
              //console.log("GGGGGGGGGGGGG");
              //console.log(this._styles.Text.getText().getOffsetY());
              this._styles.Text.getText().setOffsetY(this._point_positionY);
            }
            break;
          case "linestring":
          case "polyline":
          case "multilinestring":
            {
              this._styles.Text.getText().setPlacement('line');
              this._styles.Text.getText().setOffsetY(this._linestring_positionY);
            }
            break;
          case "polygon":
          case "multipolygon":
          case "geometrycollection":
            {
              this._styles.Text.getText().setPlacement('point');
              this._styles.Text.getText().setOffsetY(this._polygon_positionY);
            }
            break;
        }
        this._styles.Text.kind = "Text";
        if (style_setting != null) {
          if (feature._feature_style['text'] == null) {
            feature._feature_style['text'] = new ol.style.Style({
              text: new ol.style.Text({
                text: label,
                font: '12pt sans-serif',
                stroke: new ol.style.Stroke({
                  color: 'black',
                  width: 0.75
                }),
                backgroundFill: new ol.style.Fill({
                  color: 'rgba(255,255,255,0.3)'
                }),
                placement: 'point',
                //point、line...
                offsetY: 0,
                overflow: false
              })
            });
            feature._feature_style['text'].kind = "text";
            feature._feature_style['text'].getText().setText(label);
            switch (feature.getGeometry().getType().toLowerCase()) {
              case "point":
                {
                  feature._feature_style['text'].getText().setPlacement('point');
                  feature._feature_style['text'].getText().setOffsetY(20);
                }
                break;
              case "linestring":
              case "polyline":
              case "multilinestring":
                {
                  feature._feature_style['text'].getText().setPlacement('line');
                }
                break;
            }
          }
          outputStyle.push(feature._feature_style['text']);
        } else {
          outputStyle.push(this._styles.Text);
        }
        //console.log("feature.getGeometry().getType(): " + feature.getGeometry().getType());
      }

      //console.log("After outputStyle...");
      //console.log(outputStyle);

      //如果有圖片

      var isPicCheck = false;
      if (typeof pic == "string") {
        isPicCheck = true;
      } else if (dgWKT_typeof(pic) == "object" && Object.keys(pic).length > 0) {
        isPicCheck = true;
      }
      if (isPicCheck) {
        //From : https://openlayers.org/en/latest/examples/icon.html                                
        //this._styles.Image.getImage().getImage().width = 32;
        //this._styles.Image.getImage().getImage().height = 32;  
        //From : https://stackoverflow.com/questions/36835929/in-openlayers-3-how-to-fill-the-polygon-with-a-picture-from-a-url                
        //console.log(pic);
        //似乎要先設定圖片大小，再放圖，才不會出問題
        //this._styles.Image.getImage().getImage().width = 64; //preset
        //this._styles.Image.getImage().getImage().height = 64; //preset
        //this._styles.Image.getImage().getImage().src = pic;
        //'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAY0lEQVR42u3QAREAAAQEMJKL/nI4W4R1JVOPtQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEHDfArMdn4FHyLy9AAAAAElFTkSuQmCC'
        if (style_setting != null) {
          // 自定 style_setting
          var _anchor = [0.5, 0.5];
          if (this._anchor != null) {
            _anchor = this._anchor.slice();
          }
          var _scale = feature.get('scale');
          _scale = _scale == null ? this._iconScale : _scale;
          //console.log("pic: ............");
          //console.log(pic);
          //if (feature._feature_style['image'] == null) {
          var o = {
            anchor: _anchor,
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            crossOrigin: 'anonymous',
            scale: _scale,
            //size: this._iconSize,
            src: pic
          };
          // 如果有指定大小

          feature._feature_style['image'] = new ol.style.Style({
            image: new ol.style.Icon(o)
          });
          feature._feature_style['image'].kind = "Image";
          //}
          outputStyle.push(feature._feature_style['image']);

          //From : https://stackoverflow.com/questions/36835929/in-openlayers-3-how-to-fill-the-polygon-with-a-picture-from-a-url
          if (feature._canvas_dom == null) {
            feature._canvas_dom = document.createElement('canvas');
            feature._ctx = feature._canvas_dom.getContext('2d');
            feature._img = new Image();
            feature._img.crossOrigin = "anonymous";
            feature._img.src = pic;
          }
          var pattern = feature._ctx.createPattern(feature._img, 'repeat');
          feature._feature_style['fill'] = new ol.style.Style({
            fill: new ol.style.Fill({
              color: pattern
            })
          });
          feature._feature_style['fill'].kind = "fill";
          outputStyle.push(feature._feature_style['fill']);
        } // 私有換圖
        else {
          // 全域換圖
          var _anchor = [0.5, 0.5];
          if (this._anchor != null) {
            _anchor = this._anchor.slice();
          }
          var _scale = feature.get('scale');
          _scale = _scale == null ? this._iconScale : _scale;
          this._styles.Image = new ol.style.Style({
            image: new ol.style.Icon({
              anchor: _anchor,
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              crossOrigin: 'anonymous',
              scale: _scale,
              src: pic
            })
          });
          this._styles.Image.kind = "Image";
          outputStyle.push(this._styles.Image);
          //From : https://stackoverflow.com/questions/36835929/in-openlayers-3-how-to-fill-the-polygon-with-a-picture-from-a-url
          if (feature._canvas_dom == null) {
            feature._canvas_dom = document.createElement('canvas');
            feature._ctx = feature._canvas_dom.getContext('2d');
            feature._img = new Image();
            feature._img.crossOrigin = "anonymous";
            feature._img.onload = function () {
              //console.log("onload...");
              //console.log(feature._img);
              feature._ctx.canvas.width = feature._img.width;
              feature._ctx.canvas.height = feature._img.height;
              feature._ctx.drawImage(feature._img, 0, 0, feature._img.width, feature._img.height);
              //feature._feature_style.image.size = [feature._img.width, feature._img.height];
              //feature._img.size_ = [feature._img.width, feature._img.height];
            };
          }
          feature._img.src = pic;

          // 發生錯誤的樣子!?
          var pattern = feature._ctx.createPattern(feature._img, 'repeat');
          if (feature._feature_style == null) {
            feature._feature_style = {};
          }
          feature._feature_style['fill'] = new ol.style.Style({
            fill: new ol.style.Fill({
              color: pattern
            })
          });
          feature._feature_style['fill'].kind = "fill";
          outputStyle.push(feature._feature_style['fill']);
        }
      }
      //console.log(outputStyle);

      //如果自身有 //this._flashFocusData.orinStyle 直接參考!?

      //2023-01-06 增加，可以自定 style_setting
      if (style_setting != null) {
        for (var i = 0, max_i = outputStyle.length; i < max_i; i++) {
          var style_kind = outputStyle[i]["kind"].toLowerCase(); //polygon...text....
          for (var ck in style_setting) {
            if (ck.toLowerCase() != style_kind) {
              continue; //不一樣的跳過
            }

            //console.log(outputStyle);
            //window['wtf'] = outputStyle;

            //console.log(style_setting);
            //window['wtfs'] = style_setting;
            switch (style_kind) {
              case "image":
                if (style_setting[ck]["opacity"] != null) {
                  outputStyle[i].getImage().setOpacity(style_setting[ck]["opacity"]);
                }
                if (style_setting[ck]["rotate"] != null) {
                  outputStyle[i].getImage().setRotation(style_setting[ck]["rotate"] * (Math.PI / 180.0));
                }
                if (style_setting[ck]["anchor"] != null) {
                  outputStyle[i].getImage().setAnchor(style_setting[ck]["anchor"]);
                }
                if (style_setting[ck]["scale"] != null) {
                  outputStyle[i].getImage().setScale(style_setting[ck]["scale"]);
                }
                //if (soutputStyle[i].getImage().getImage().__size != null) { outputStyle[i].getImage().size_ = style_setting[ck]["size"]; }
                //if (feature._img.size_ != null) {
                //    outputStyle[i].getImage().getImage().size_ = feature._img.size_;
                //}
                outputStyle[i].getImage().getImage().src = pic;
                break;
              case "text":
                if (style_setting[ck]["font"] != null) {
                  outputStyle[i].getText().setFont(style_setting[ck]["font"]);
                }
                if (style_setting[ck]["font-color"] != null) {
                  outputStyle[i].getText().getFill().setColor(style_setting[ck]["font-color"]);
                }
                if (style_setting[ck]["background-color"] != null) {
                  outputStyle[i].getText().getBackgroundFill().setColor(style_setting[ck]["background-color"]);
                }
                if (style_setting[ck]["font-stroke-color"] != null) {
                  outputStyle[i].getText().getStroke().setColor(style_setting[ck]["font-stroke-color"]);
                }
                if (style_setting[ck]["font-stroke-width"] != null) {
                  outputStyle[i].getText().getStroke().setWidth(style_setting[ck]["font-stroke-width"]);
                }
                if (style_setting[ck]["offsetX"] != null) {
                  outputStyle[i].getText().setOffsetX(style_setting[ck]["offsetX"]);
                }
                if (style_setting[ck]["offsetY"] != null) {
                  outputStyle[i].getText().setOffsetY(style_setting[ck]["offsetY"]);
                }
                // 私域的文字設定
                if (label != null && label != '') {
                  // 看 min max
                  if (min_zoom != null && max_zoom != null) {
                    if (this._easymap.getZoom() < min_zoom || this._easymap.getZoom() > max_zoom) {
                      label = null;
                    }
                  }
                  outputStyle[i].getText().setText(label);
                }
                break;
              case "point":
              case "multipoint":
                // 判斷是圖還是圓點
                if (outputStyle[i].getImage().constructor.name == "Icon") {
                  if (style_setting['Image']["opacity"] != null) {
                    outputStyle[i].getImage().setOpacity(style_setting['Image']["opacity"]);
                  }
                  if (style_setting['Image']["rotate"] != null) {
                    outputStyle[i].getImage().setRotation(style_setting['Image']["rotate"] * (Math.PI / 180.0));
                  }
                  if (style_setting['Image']["anchor"] != null) {
                    outputStyle[i].getImage().setAnchor(style_setting['Image']["anchor"]);
                  }
                  if (style_setting['Image']["scale"] != null) {
                    outputStyle[i].getImage().setScale(style_setting['Image']["scale"]);
                  }
                } else {
                  // Circle
                  if (style_setting[ck]["radius"] != null) {
                    outputStyle[i].getImage().setRadius(style_setting[ck]["radius"]);
                  }
                  if (style_setting[ck]["color"] != null) {
                    outputStyle[i].getImage().getStroke().setColor(style_setting[ck]["color"]);
                  }
                  if (style_setting[ck]["width"] != null) {
                    outputStyle[i].getImage().getStroke().setWidth(style_setting[ck]["width"]);
                  }
                  if (style_setting[ck]["fill-color"] != null) {
                    outputStyle[i].getImage().getFill().setColor(style_setting[ck]["fill-color"]);
                  }
                }
                break;
              case "linestring":
              case "multilinestring":
                if (style_setting[ck]["width"] != null) {
                  outputStyle[i].getStroke().setWidth(style_setting[ck]["width"]);
                }
                if (style_setting[ck]["stroke-color"] != null) {
                  outputStyle[i].getStroke().setColor(style_setting[ck]["stroke-color"]);
                }
                if (style_setting[ck]["linedash"] != null) {
                  outputStyle[i].getStroke().setLineDash(style_setting[ck]["linedash"]);
                }
                if (style_setting[ck]["linecap"] != null) {
                  outputStyle[i].getStroke().setLineCap(style_setting[ck]["linecap"]);
                }
                /*break;
                                              if (style_setting[ck]["width"] != null) { outputStyle[i].getStroke().setWidth(style_setting[ck]["width"]); }
                if (style_setting[ck]["stroke-color"] != null) { outputStyle[i].getStroke().setColor(style_setting[ck]["stroke-color"]); }
                if (style_setting[ck]["linedash"] != null) { outputStyle[i].getStroke().setLineDash(style_setting[ck]["linedash"]); }
                if (style_setting[ck]["linecap"] != null) { outputStyle[i].getStroke().setLineCap(style_setting[ck]["linecap"]); }
                */
                break;
              case "polygon":
              case "multipolygon":
              case "geometrycollection":
                if (style_setting[ck]["width"] != null) {
                  outputStyle[i].getStroke().setWidth(style_setting[ck]["width"]);
                }
                if (style_setting[ck]["stroke-color"] != null) {
                  outputStyle[i].getStroke().setColor(style_setting[ck]["stroke-color"]);
                }
                if (style_setting[ck]["fill-color"] != null) {
                  outputStyle[i].getFill().setColor(style_setting[ck]["fill-color"]);
                }
                if (style_setting[ck]["linedash"] != null) {
                  outputStyle[i].getStroke().setLineDash(style_setting[ck]["linedash"]);
                }
                if (style_setting[ck]["linecap"] != null) {
                  outputStyle[i].getStroke().setLineCap(style_setting[ck]["linecap"]);
                }

                //
                /*
                  break;
                                              if (style_setting[ck]["width"] != null) { outputStyle[i].getStroke().setWidth(style_setting[ck]["width"]); }
                if (style_setting[ck]["stroke-color"] != null) { outputStyle[i].getStroke().setColor(style_setting[ck]["stroke-color"]); }
                if (style_setting[ck]["fill-color"] != null) { outputStyle[i].getFill().setColor(style_setting[ck]["stroke-color"]); }
                if (style_setting[ck]["linedash"] != null) { outputStyle[i].getStroke().setLineDash(style_setting[ck]["linedash"]); }
                if (style_setting[ck]["linecap"] != null) { outputStyle[i].getStroke().setLineCap(style_setting[ck]["linecap"]); }
                */
                break;
            }
          }
        }
      }
      if (feature._dgwkt._flashFocusData.isPlaying == true) {
        //在閃動時
        //console.log(feature._dgwkt);
        //看閃有顏色的還是閃原本的

        switch (feature._dgwkt._flashFocusData._cFlag) {
          case 1:
            {
              //console.log(feature);
              var _data_index = feature.values_.data_index;
              if (_data_index == null) {
                break; //break switch
              }
              //let _dataObj = feature._dgwkt._wkt[feature._dgwkt._dataIndexToFeatureIndex(_data_index)];
              var _color = feature._dgwkt._flashFocusData.flashColor;
              var isNeedFlash = false; //如果需要閃才會變 true
              if (feature._dgwkt._flashFocusData.filters == null) {
                isNeedFlash = true; //沒有限制條件，皆要閃
              } else if (isNeedFlash == false && Array.isArray(feature._dgwkt._flashFocusData.filters)) {
                var _data_index2 = feature.values_.data_index;
                if (_data_index2 == null) {
                  break; //break switch
                }
                var _dataObj = feature._dgwkt._wkt[_data_index2];
                for (var j = 0, max_j = feature._dgwkt._flashFocusData.filters.length; j < max_j; j++) {
                  //看此筆資料是否符合限制條件
                  var _obj = feature._dgwkt._flashFocusData.filters[j];
                  if (_obj['attr'] == null || _obj['kind'] == null || _obj['value'] == null) {
                    console.log(" filter 條件異常，需為：{'attr':'欄位','kind':'如: == 、 != 、 >= 、 <= 、 > 、 < 、 like','value':'123' ");
                    continue;
                  }

                  //console.log(feature);

                  //console.log(obj);
                  //console.log(_dataObj);
                  if (_dataObj[_obj['attr']] == null) {
                    console.log(" filter 條件異常，wkt 屬性資料沒有「" + _obj['attr'] + "」");
                    continue; //continue for
                  }
                  switch (_obj['kind'].toLowerCase()) {
                    case '==':
                      {
                        if (_dataObj[_obj['attr']] == _obj['value']) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '!=':
                      {
                        if (_dataObj[_obj['attr']] != _obj['value']) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '>':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) > parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '>=':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) >= parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '<':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) < parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case '<=':
                      {
                        if (parseFloat(_dataObj[_obj['attr']]) <= parseFloat(_obj['value'])) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                    case 'like':
                      {
                        if (feature._dgwkt._easymap._is_string_like(_dataObj[_obj['attr']], '%' + _obj['value'] + '%')) {
                          isNeedFlash = true;
                        }
                      }
                      break;
                  }
                  if (isNeedFlash) {
                    //如果有客製符合的顏色
                    _color = _obj['flashColor'] != null ? _obj['flashColor'] : _color;
                    break;
                  } //break for
                }
              }
              if (isNeedFlash) {
                //此筆資料要閃
                //console.log("此筆資料要閃...");
                var new_color_with_opacity = feature._dgwkt._easymap.colorValues(_color);
                for (var _j = 0, _max_j = outputStyle.length; _j < _max_j; _j++) {
                  //window['wtf'] = outputStyle[i];
                  var _rgb = 'rgb(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ')';
                  outputStyle[_j].getText == null || outputStyle[_j].getText() == null || outputStyle[_j].getText().setColor == null ? null : outputStyle[_j].getText().setColor(_rgb);
                  outputStyle[_j].getText == null || outputStyle[_j].getText() == null || outputStyle[_j].getText().getFill == null || outputStyle[_j].getText().getFill() == null || outputStyle[_j].getText().getFill().setColor == null ? null : outputStyle[_j].getText().getFill().setColor(_rgb);
                  outputStyle[_j].getStroke == null || outputStyle[_j].getStroke() == null || outputStyle[_j].getStroke().setColor == null ? null : outputStyle[_j].getStroke().setColor(_rgb);
                  //console.log(this._easymap);

                  //這裡用 0.5 opacity 
                  outputStyle[_j].getFill == null || outputStyle[_j].getFill() == null || outputStyle[_j].getFill().setColor == null ? null : outputStyle[_j].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                  outputStyle[_j].getImage == null || outputStyle[_j].getImage() == null || outputStyle[_j].getImage().getFill == null || outputStyle[_j].getImage().getFill() == null || outputStyle[_j].getImage().getFill().setColor == null ? null : outputStyle[_j].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                  outputStyle[_j].getImage == null || outputStyle[_j].getImage() == null || outputStyle[_j].getImage().getRadius == null || feature._easymapFeatureOrinStyle == null ? null : outputStyle[_j].getImage().setRadius(feature._easymapFeatureOrinStyle[_j].radius);
                }
              } else {
                for (var _j2 = 0, _max_j2 = outputStyle.length; _j2 < _max_j2; _j2++) {
                  feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j2].text == null ? null : outputStyle[_j2].getText().setColor(feature._easymapFeatureOrinStyle[_j2].text);
                  feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j2].textfill == null ? null : outputStyle[_j2].getText().getFill().setColor(feature._easymapFeatureOrinStyle[_j2].textfill);
                  feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j2].stroke == null ? null : outputStyle[_j2].getStroke().setColor(feature._easymapFeatureOrinStyle[_j2].stroke);
                  feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j2].fill == null ? null : outputStyle[_j2].getFill().setColor(feature._easymapFeatureOrinStyle[_j2].fill);
                  feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j2].image == null ? null : outputStyle[_j2].getImage().getFill().setColor(feature._easymapFeatureOrinStyle[_j2].image);
                  feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j2].radius == null || outputStyle[_j2].getImage == null || outputStyle[_j2].getImage().setRadius == null ? null : outputStyle[_j2].getImage().setRadius(feature._easymapFeatureOrinStyle[_j2].radius);
                }
              }
            }
            break;
          case -1:
            {
              //原本的樣式，不用加料
              //console.log(feature);
              var _data_index3 = feature.values_.data_index;
              if (_data_index3 == null) {
                break; //continue for
              }
              // use orin style
              for (var _j3 = 0, _max_j3 = outputStyle.length; _j3 < _max_j3; _j3++) {
                feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j3].text == null ? null : outputStyle[_j3].getText().setColor(feature._easymapFeatureOrinStyle[_j3].text);
                feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j3].textfill == null ? '' : outputStyle[_j3].getText().getFill().setColor(feature._easymapFeatureOrinStyle[_j3].textfill);
                feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j3].stroke == null ? '' : outputStyle[_j3].getStroke().setColor(feature._easymapFeatureOrinStyle[_j3].stroke);
                feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j3].fill == null ? '' : outputStyle[_j3].getFill().setColor(feature._easymapFeatureOrinStyle[_j3].fill);
                feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j3].image == null ? '' : outputStyle[_j3].getImage().getFill().setColor(feature._easymapFeatureOrinStyle[_j3].image);
                feature._easymapFeatureOrinStyle == null || feature._easymapFeatureOrinStyle[_j3].radius == null || outputStyle[_j3].getImage == null || outputStyle[_j3].getImage().setRadius == null ? '' : outputStyle[_j3].getImage().setRadius(feature._easymapFeatureOrinStyle[_j3].radius);
              }
            }
            break;
        }
      }
      return outputStyle;
    }.bind(this);
    this._style_cluster_custom = null;
    /*
    [
        {
            min: 2,
            max: 100,
            style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 18,
                        stroke: new ol.style.Stroke({
                            color: '#fff',
                        }),
                        fill: new ol.style.Fill({
                            color: '#3399CC',
                        }),
                    }),
                    text: new ol.style.Text({
                        //text: size.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff',
                        }),
                        padding: [5, 5, 5, 5]
                    }),
                })
        }
    ];
    */
    this._styles_cluster = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 18,
        stroke: new ol.style.Stroke({
          color: '#fff'
        }),
        fill: new ol.style.Fill({
          color: '#3399CC'
        })
      }),
      text: new ol.style.Text({
        //text: size.toString(),
        fill: new ol.style.Fill({
          color: '#fff'
        }),
        padding: [5, 5, 5, 5]
      })
    }); //預設群聚樣式

    // 預設全域樣式
    this._styles = {
      'Text': new ol.style.Style({
        text: new ol.style.Text({
          text: '',
          font: '12pt sans-serif',
          stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.75
          }),
          backgroundFill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.3)'
          }),
          placement: 'point',
          //point、line...
          offsetY: 0,
          overflow: false
        })
      }),
      'Point': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: 'transparent'
          }),
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiPoint': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: 'transparent'
          }),
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.1)'
        })
      }),
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      }),
      'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'magenta'
        }),
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({
            color: 'transparent'
          }),
          stroke: new ol.style.Stroke({
            color: 'magenta'
          })
        })
      }),
      'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
      /*
       * //有圖再插
      'Image': new ol.style.Style({
          image: new ol.style.Icon({
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              crossOrigin: 'anonymous',
              scale: 1,
              src: 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAY0lEQVR42u3QAREAAAQEMJKL/nI4W4R1JVOPtQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEHDfArMdn4FHyLy9AAAAAElFTkSuQmCC'
          })
      })
      */
    }; //預設單點樣式

    //this._gMarkerEnabled = false;
    //this._distance = 50;
    //this._threshold = 1;
    //this._Style = new dgGStyle();
    //this._isZoomClusterEnabled = true; //whether 到某zoom關閉cluster
    //this._clusterZoom = 17;            // 預設18層以上不分群
    //this._defaultStyles = null;
    this._zIndex = 1;

    //this._isLinestringArrowEnabled = false;//是否開啟LineString arrow

    //this._showInSelect = true; //可顯示在點開的下拉選單
    //this._lineStringIconsrc = '';
    //this._lineStringStyle = null;
    this._lineStringWidth = 1;
    //this._zoomThreshold = 0;
    this._featureSelect = true;
    /*this._styleCache = {//加快cluster style
        h: null,
        m: null,
        l: null
    };*/
    //public
    this.url = url;

    //#events 
    this.onFeatureSelect = null;
    this.onFeatureUnselect = null;
    this._onFeatureHover = null;
    this.labelVisible = false; //whether label shows or not
    this.iconVisible = false; //whether icon shows or not
    this.useNetworkLink = true; //whether use networklink
    this.opacity = 1;
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1,
      //switch 1 and -1
      filter: null // 可以依條件設定要操作的對象
    };
    this.bufferObj = null;
    return this;
  }
  dgWKT_createClass(dgWKT, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "_dataIndexToFeatureIndex",
    value: function _dataIndexToFeatureIndex(di) {
      var fs = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = fs.length; i < max_i; i++) {
        if (fs[i].values_.features != null) {
          //cluster
          for (var j = 0, max_j = fs[i].values_.features.length; j < max_j; j++) {
            if (fs[i].values_.features[j].values_.data_index == di) {
              return [i, j];
            }
          }
        } else {
          if (fs[i].values_.data_index == di) {
            return i;
          }
        }
      }
      return null;
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgWKT_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.filters = null; //preset 
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)', filters: [{ attr ... kind ... value ... flashColor }]}");
      } else {
        //Default
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = null;
        if (features[i].getStyleFunction() == null) {
          originStyles = this._styleFunction(features[i]);
        } else {
          originStyles = features[i].getStyleFunction().call(null, features[i]);
        }
        var d = new Array();
        for (var j = 0, max_j = originStyles.length; j < max_j; j++) {
          d.push({
            text: originStyles[j].getText == null || originStyles[j].getText() == null || originStyles[j].getText().getColor == null ? null : originStyles[j].getText().getColor(),
            textfill: originStyles[j].getText == null || originStyles[j].getText() == null || originStyles[j].getText().getFill == null || originStyles[j].getText().getFill() == null || originStyles[j].getText().getFill().getColor == null ? null : originStyles[j].getText().getFill().getColor(),
            stroke: originStyles[j].getStroke == null || originStyles[j].getStroke() == null || originStyles[j].getStroke().getColor == null ? null : originStyles[j].getStroke().getColor(),
            fill: originStyles[j].getFill == null || originStyles[j].getFill() == null || originStyles[j].getFill().getColor == null ? null : originStyles[j].getFill().getColor(),
            image: originStyles[j].getImage == null || originStyles[j].getImage() == null || originStyles[j].getImage().getFill == null || originStyles[j].getImage().getFill() == null || originStyles[j].getImage().getFill().getColor == null ? null : originStyles[j].getImage().getFill().getColor(),
            //改顏色必需觸發一次改大小，才會生效
            //point 特有
            radius: originStyles[j].getImage == null || originStyles[j].getImage() == null || originStyles[j].getImage().getRadius == null ? null : originStyles[j].getImage().getRadius()
          });
        } // for j originStyles
        //this._flashFocusData.orinStyle.push(d);
        features[i]._easymapFeatureOrinStyle = d;
      } // for
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        //let features = this._instance.getSource().getFeatures();
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes - 1 < 0) {
                //停了                            
                clearInterval(this._flashFocusData.runInterval);
                this._flashFocusData.isPlaying = false;
                return;
              }
              this._flashFocusData.runTimes--;
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      //自然走完
      this._flashFocusData.runTimes = 0;
      this._flashFocusData._cFlag = -1;
      //clearInterval(this._flashFocusData.runInterval); //stop        
      //this._instance.getSource().dispatchEvent('change');
      //this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "setClusterClickZoomToBBOX",
    value: function setClusterClickZoomToBBOX(_bool) {
      if (typeof _bool != "boolean") {
        console.log("只接受 true or false ，如: setCluster(true); ");
        return;
      }
      this._isClusterClickZoomToBBOX = _bool; //true or false
    }
  }, {
    key: "getClusterClickZoomToBBOX",
    value: function getClusterClickZoomToBBOX() {
      return this._isClusterClickZoomToBBOX;
    }
  }, {
    key: "setIconScale",
    value: function setIconScale(v) {
      this._iconScale = parseFloat(v);

      //reload style
      if (this._instance != null) {
        //this._instance.setStyle(this._instance.getStyle());
        this._instance.getSource().dispatchEvent('change');
      }
    }
  }, {
    key: "setLabel",
    value: function setLabel(index, txt) {
      if (this._wkt == null || this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      var featureIndex = this._dataIndexToFeatureIndex(index);
      this._wkt[index].label = txt;
      this._instance.getSource().getFeatures()[featureIndex].set("label", txt);
    }
  }, {
    key: "getLabel",
    value: function getLabel(index) {
      if (this._wkt == null || this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      return this._wkt[index].label;
    }
  }, {
    key: "getIconScale",
    value: function getIconScale() {
      return this._iconScale;
    }
  }, {
    key: "setCluster",
    value: function setCluster(_bool) {
      if (typeof _bool != "boolean") {
        console.log("只接受 true or false ，如: setCluster(true); ");
        return;
      }
      this._isCluster = _bool; //true or false
      //do something..
      if (this._instance != null) {
        //代表已套過，移除重新再套一次
        this._easymap.removeItem(this);
        this._easymap.addItem(this);
      }
    }
  }, {
    key: "getCluster",
    value: function getCluster() {
      return this._isCluster;
    }
  }, {
    key: "setMinClusterSize",
    value: function setMinClusterSize(v) {
      this._minClusterSize = parseInt(v, 10);
      if (this._clusterSource != null) {
        //重載變動
        this._clusterSource.setDistance(this._clusterDistance[0]);
        if (this._instance != null) {
          //代表已套過，移除重新再套一次
          this._easymap.removeItem(this);
          this._easymap.addItem(this);
        }
      }
    }
  }, {
    key: "getMinClusterSize",
    value: function getMinClusterSize() {
      return this._minClusterSize;
    }
  }, {
    key: "setClusterDistance",
    value: function setClusterDistance(arr) {
      if (!Array.isArray(arr)) {
        console.log("設定群聚間距，如 wktObj.setClusterDistance( [ 40 , 20 ] );");
        return;
      }
      this._clusterDistance = arr;
      if (this._clusterSource != null) {
        //直接變動
        this._clusterSource.setDistance(parseInt(arr[0], 10));
        this._clusterSource.setMinDistance(parseInt(arr[1], 10));
      }
    }
  }, {
    key: "getClusterDistance",
    value: function getClusterDistance() {
      return this._clusterDistance;
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      return this._styles;
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      return new dgXY((_extent_4326[0] + _extent_4326[2]) / 2.0, (_extent_4326[1] + _extent_4326[3]) / 2.0);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      var _size = 0;
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].getGeometry().getArea != null) {
          _size += this._instance.getSource().getFeatures()[i].getGeometry().getArea();
        }
      }
      return _size;
    }
  }, {
    key: "getZIndex",
    value: function getZIndex() {
      return this._zIndex;
    }
  }, {
    key: "setZIndex",
    value: function setZIndex(val) {
      this._zIndex = parseInt(val);
      //console.log(this);
      if (this._easymap != null && this._easymap.setItemZIndex != null) {
        this._easymap.setItemZIndex(this, this.getZIndex());
      }
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      this._setUpperZoomByBoundary = true;
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      if (!isNaN(val) == false) val = 1;
      this.opacity = parseFloat(val);
      //console.log(this);        
      this._instance.setOpacity(this.opacity);
    }
  }, {
    key: "setFeatureClick",
    value: function setFeatureClick(handler) {
      this.onFeatureSelect = handler;
    }
  }, {
    key: "setFeatureHover",
    value: function setFeatureHover(handler) {
      this._onFeatureHover = handler;
    }
  }, {
    key: "getStrokeColor",
    value: function getStrokeColor() {
      return this._strokeStyle;
    }
  }, {
    key: "setStrokeColor",
    value: function setStrokeColor(val) {
      this._strokeStyle = val;
      if (this._instance == null) return;
      this.getStyle().Polygon.getStroke().setColor(val);
      this.getStyle().LineString.getStroke().setColor(val);
      this.getStyle().MultiPolygon.getStroke().setColor(val);
      this.getStyle().GeometryCollection.getStroke().setColor(val);
      this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "getFillColor",
    value: function getFillColor() {
      return this._fillStyle;
    }
  }, {
    key: "setFillColor",
    value: function setFillColor(val) {
      this._fillStyle = val;
      if (this._instance == null) return;
      this.getStyle().Polygon.getFill().setColor(val);
      this.getStyle().MultiPolygon.getFill().setColor(val);
      this.getStyle().GeometryCollection.getFill().setColor(val);
      this._instance.getSource().dispatchEvent('change');
      /*let features = this._instance.getSource().getFeatures();
      if (features.length > 0) {
          for (var i = 0, max_i = features.length; i < max_i; i++) {
              var originStyles = features[i].getStyleFunction().call(null, features[i]);
              if (originStyles[j].getFill() == null) continue;
              originStyles[j].getFill().setColor(val);
                //redraw
              //features[0].setStyle(features[0].getStyle());
          }
          this._instance.getSource().dispatchEvent('change');
      }
      else {
          console.log("Error ... features 為 0");
      }*/
    }
  }, {
    key: "enableDashed",
    value: function enableDashed(val) {
      this.setLineDash(val);
    }
  }, {
    key: "setLineDash",
    value: function setLineDash(val) {
      //虛線樣式，[0] 為實線，若虛線可為 [4,2] 長短長短 或 [4,2,2] 長短短長短短...
      if (!Array.isArray(val)) {
        console.log("虛線樣式，[0] 為實線，若虛線可為 [4,2] 長短長短 或 [4,2,2] 長短短長短短...");
        return;
      }
      this._lineDashStyle = val;
      if (this._instance == null) return;
      this.getStyle().Polygon.getStroke().setLineDash(val);
      this.getStyle().MultiLineString.getStroke().setLineDash(val);
      this.getStyle().GeometryCollection.getStroke().setLineDash(val);
      this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "getStrokeWidth",
    value: function getStrokeWidth() {
      return this._lineWidth;
    }
  }, {
    key: "setStrokeWidth",
    value: function setStrokeWidth(val) {
      if (!isNaN(val) == false) val = 1;
      this._lineWidth = parseFloat(val);
      this.getStyle().Polygon.getStroke().setWidth(val);
      this.getStyle().LineString.getStroke().setWidth(val);
      this.getStyle().Point.getImage().setRadius(val);
      this.getStyle().MultiPolygon.getStroke().setWidth(val);
      this.getStyle().GeometryCollection.getStroke().setWidth(val);

      //更新樣式!?
      /*for (var i = 0, max_i = this._wkt.length; i < max_i; i++) {
          //if(this._wkt[i].)
      }
      */

      this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "setLineCap",
    value: function setLineCap(val) {
      //邊緣樣式，圓角 round、實線 square、斷線 butt
      if (["round", "square", "butt"].indexOf(val) == -1) {
        console.log("邊緣樣式，圓角 round、實線 square、斷線 butt");
        return;
      }
      this._lineCapStyle = val;
      if (this._instance == null) return;
      this.getStyle().Polygon.getStroke().setLineCap(val);
      this.getStyle().GeometryCollection.getStroke().setLineCap(val);
      this._instance.getSource().dispatchEvent('change');
    } //updateStyleByAttribute() { }
  }, {
    key: "getType",
    value: function getType() {
      if (this._instance != null) {
        return this._instance.getType();
      }
      return null;
    }
  }, {
    key: "setXY",
    value: function setXY(data_index, dgxy) {
      //針對 wkt 物件的哪一筆資料，重設位置(限制 Point 才可以)
      //map.addItem(wktObj); 後，原資料會在 wktObj._wkt[data_index]
      if (this._instance == null) return;
      var featureIndex = this._dataIndexToFeatureIndex(data_index);
      if (featureIndex == null || typeof featureIndex == "undefined") return;
      if (Array.isArray(featureIndex)) {
        //cluster
        //console.log(featureIndex);
        this._instance.getSource().getFeatures()[featureIndex[0]].values_.features[featureIndex[1]].getGeometry().setCoordinates(this._easymap.projTransfer([dgxy.x, dgxy.y], "EPSG:4326", "EPSG:3857"));
        this._wkt[data_index]['wkt'] = "POINT(".concat(dgxy.x, " ").concat(dgxy.y, ")");
      } else {
        this._instance.getSource().getFeatures()[featureIndex].getGeometry().setCoordinates(this._easymap.projTransfer([dgxy.x, dgxy.y], "EPSG:4326", "EPSG:3857"));
        this._wkt[data_index]['wkt'] = "POINT(".concat(dgxy.x, " ").concat(dgxy.y, ")");
      }
    }
  }, {
    key: "showIndex",
    value: function showIndex(data_index) {
      //顯示某一筆資料
      if (this._instance == null) return;
      if (this._wkt[data_index]['_feature'] != null) {
        var isCluster = this.getCluster();
        if (isCluster) {
          this.setCluster(false);
        }
        this._instance.getSource().addFeature(this._wkt[data_index]['_feature']);
        this._wkt[data_index]['_feature'] = null;
        if (isCluster) {
          this.setCluster(true);
        }
      }
    }
  }, {
    key: "hideIndex",
    value: function hideIndex(data_index) {
      // 隱藏某一筆資料
      if (this._instance == null) return;
      if (this._wkt[data_index]['_feature'] == null) {
        var isCluster = this.getCluster();
        if (isCluster) {
          this.setCluster(false);
        }
        var featureIndex = this._dataIndexToFeatureIndex(data_index);
        this._wkt[data_index]['_feature'] = this._instance.getSource().getFeatures()[featureIndex];

        // 移除 feature
        this._instance.getSource().removeFeature(this._wkt[data_index]['_feature']);

        // 如果想要從陣列中移除，可以使用 splice
        // 將對應位置設為 null，避免 undefined 錯誤
        this._instance.getSource().getFeatures().splice(featureIndex, 1);
        if (isCluster) {
          this.setCluster(true);
        }
      }
    }
  }, {
    key: "updateWKT",
    value: function updateWKT(data_index, wktObj) {
      var EPSG = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "EPSG:4326";
      //針對 wkt 物件的哪一筆資料，重設位置
      //map.addItem(wktObj); 後，原資料會在 wktObj._wkt[data_index]
      if (this._instance == null) return;
      var featureIndex = this._dataIndexToFeatureIndex(data_index);
      if (featureIndex == null || typeof featureIndex == "undefined") {
        return;
      }
      if (dgWKT_typeof(wktObj) != "object") {
        console.log("wktObj需為物件，裡面要有 label 或 wkt...");
        return;
      }
      if (wktObj['wkt'] != null) {
        var gf = new ol.format.WKT();
        var geome = gf.readGeometry(wktObj['wkt'], {
          dataProjection: EPSG,
          featureProjection: 'EPSG:3857'
        });
        //console.log(featureIndex);
        this._instance.getSource().getFeatures()[featureIndex].setGeometry(geome);
        featureIndex = this._dataIndexToFeatureIndex(data_index);
        this._wkt[data_index]['wkt'] = wktObj['wkt'];
      }
      if (wktObj['label'] != null) {
        this._instance.getSource().getFeatures()[featureIndex].setProperties({
          'label': wktObj['label']
        });
        this._wkt[data_index]['label'] = wktObj['label'];
      }
      if (wktObj['min_zoom'] != null) {
        this._instance.getSource().getFeatures()[featureIndex].setProperties({
          'min_zoom': wktObj['min_zoom']
        });
        this._wkt[data_index]['min_zoom'] = wktObj['min_zoom'];
      }
      if (wktObj['max_zoom'] != null) {
        this._instance.getSource().getFeatures()[featureIndex].setProperties({
          'max_zoom': wktObj['max_zoom']
        });
        this._wkt[data_index]['max_zoom'] = wktObj['max_zoom'];
      }
      if (wktObj['pic'] != null) {
        this._instance.getSource().getFeatures()[featureIndex].set('pic', wktObj['pic']);
      }
      if (wktObj['style_setting'] != null) {
        this._instance.getSource().getFeatures()[featureIndex].set('style_setting', wktObj['style_setting']);
      }
      /*
      if (wktObj['pic'] != null) {
          //有圖
          this._wkt[data_index]['pic'] = wktObj['pic'];
          let mx = this._instance.styleFunction_(this._instance.getSource().getFeatures()[featureIndex]);
          this._instance.getSource().getFeatures()[featureIndex].set('pic', wktObj['pic']);
          mx.map(function (k) {
              switch (k.kind.toLowerCase()) {
                  case "point":
                      var op = new ol.style.Icon({
                          anchor: [0.5, 0.5],
                          anchorXUnits: 'fraction',
                          anchorYUnits: 'fraction',
                          crossOrigin: 'anonymous',
                          scale: 1,
                          size: [64, 64],
                          src: wktObj['pic']
                      });
                      //alert('gg');
                      
                      if (wktObj['size'] != null) {
                          op.size = [...wktObj['size']];
                      }
                      if (wktObj['scale'] != null) {
                          op.scale = wktObj['scale'];
                      }
                      var mxImg = k.setImage(op);
                      mxImg = k.getImage();
                      if (wktObj['size'] != null) {
                          mxImg.size_ = [...wktObj['size']];
                      }
                      if (wktObj['scale'] != null) {
                          mxImg.scale_ = wktObj['scale'];
                      }
                      mxImg.size_ = (mxImg.size_ == null) ? [64, 64] : [...mxImg.size_];
                      mxImg.scale_ = (mxImg.scale_ == null) ? 1.0 : mxImg.scale_;
                        //這是圖了
                      for (var ko in wktObj) {
                          ko = ko.toLowerCase();
                          //console.log(ko);
                          switch (ko) {
                              case "pic":
                                  var s = mxImg.getSize();
                                  if (s == null) {
                                      s = [...mxImg.size_];
                                  }
                                  this._ConvertImageToBase64WithResize(wktObj[ko], s[0], s[1]).then(function (b64) {
                                      mxImg.getImage().src = b64;
                                      //重繪
                                      if (wktObj['auto-refresh'] == null || wktObj['auto-refresh'] == true) {
                                          this.refresh();
                                      }
                                  }.bind(this));
                                  break;
                              case "scale":
                                  mxImg.setScale(parseFloat(wktObj[ko]));
                                  break;
                              case "position":
                                  mxImg.offset_ = wktObj[ko];
                                  break;
                              case "size":
                                  //console.log(wktObj);
                                  //window['wtf'] = mxImg;
                                  mxImg.size_ = [...wktObj[ko]];
                                  //console.log(mxImg.size_);
                                  this._ConvertImageToBase64WithResize(wktObj['pic'], mxImg.size_[0], mxImg.size_[1]).then(function (b64) {
                                      mxImg.getImage().src = b64;
                                      //重繪
                                      if (wktObj['auto-refresh'] == null || wktObj['auto-refresh'] == true) {
                                          this.refresh();
                                      }
                                  }.bind(this));
                                  break;
                          }
                      }
                      break;
                  case "polygon":
                      var feature = this._instance.getSource().getFeatures()[featureIndex];
                      var s = [64, 64];
                      if (wktObj['size'] != null) {
                          s = [...wktObj['size']];
                      }
                      this._ConvertImageToBase64WithResize(wktObj['pic'], s[0], s[1]).then(function (b64) {
                          //console.log(b64);
                          //console.log(feature);
                          var op = {
                              anchor: [0.5, 0.5],
                              anchorXUnits: 'fraction',
                              anchorYUnits: 'fraction',
                              crossOrigin: 'anonymous',
                              //scale: this._iconScale,
                              scale: 1,
                              size: [64, 64],
                              src: b64
                          };
                          if (wktObj['size'] != null) {
                              op.size = [...wktObj['size']];
                          }
                          if (wktObj['scale'] != null) {
                              op.scale = wktObj['scale'];
                          }
                          k.setImage(new ol.style.Icon(op));
                            //From : https://stackoverflow.com/questions/36835929/in-openlayers-3-how-to-fill-the-polygon-with-a-picture-from-a-url
                          if (feature._canvas_dom == null) {
                              feature._canvas_dom = document.createElement('canvas');
                              feature._canvas_dom.width = 64;
                              feature._canvas_dom.height = 64;
                              if (wktObj['size'] != null) {
                                  feature._canvas_dom.width = wktObj['size'][0];
                                  feature._canvas_dom.height = wktObj['size'][1];
                              }
                              feature._ctx = feature._canvas_dom.getContext('2d');
                              feature._img = new Image();
                          }
                          feature._img.src = b64;
                          var pattern = feature._ctx.createPattern(feature._img, 'repeat');
                          k.setFill(new ol.style.Fill({
                              color: pattern
                          }));
                          //重繪
                          if (wktObj['auto-refresh'] == null || wktObj['auto-refresh'] == true) {
                              feature._dgwkt.refresh();
                          }
                      });
                      break;
              }
          }.bind(this));
      }
      */
      //this._instance.getSource().changed();
    }
  }, {
    key: "getIntersectsIndexsFromWKT",
    value: function getIntersectsIndexsFromWKT(wktString) {
      var srs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "EPSG:4326";
      var format = new ol.format.WKT();
      var output_index = [];
      var wktGeometry = format.readGeometry(wktString, {
        dataProjection: new ol.proj["get"](srs),
        featureProjection: this._easymap._olmap.getView().getProjection()
      });

      // 將 WKT Geometry 轉換為 ol.geom.Geometry
      var wktFeature = new ol.Feature({
        geometry: wktGeometry
      });
      var wktExtent = wktGeometry.getExtent();
      this._instance.getSource().getFeatures().forEach(function (feature) {
        var featureGeometry = feature.getGeometry();

        // 檢查幾何體是否相交
        if (featureGeometry.intersectsExtent(wktExtent)) {
          if (featureGeometry.intersectsCoordinate(wktGeometry.getCoordinates())) {
            output_index.push(feature.values_.data_index);
          }
        }
      });
      return output_index;
    }
  }, {
    key: "setIcon",
    value: function setIcon(data_index, obj) {
      //可以針對 icon 設定新圖
      //obj 為
      /*
      { 
          'pic': 'data:image/png;base64, ...  或 https://3wa.tw/pic/3wa_logo.png', //新圖(選填)
          'scale': 1, //大小(選填)
          'postion': [0, 0], //圖片偏移(選填)            
          'auto-refresh': true //自動重匯，預設 true，如為 false，適合大量資料修改，全改完再呼叫 wktObj.refresh()
      }
      */
      if (this._instance == null) return;
      if (dgWKT_typeof(obj) != "object") {
        console.log("錯誤 setIcon 傳入值為...");
        console.log({
          'pic': 'data:image/png;base64, ...  或 https://3wa.tw/pic/3wa_logo.png',
          //新圖(選填)
          'scale': 1,
          //大小比例(選填) , 暫不支援
          'postion': [0, 0] //圖片偏移(選填) , 暫不支援 0~1
          //'size': [64, 64] //圖片大小(選填) , 暫不支援
        });
        return;
      }
      var featureIndex = this._dataIndexToFeatureIndex(data_index);
      //可能找不到!?
      //console.log("TTTTTTTTTTTTTTTTT");
      //console.log(featureIndex);
      //window['wtf'] = featureIndex;
      if (featureIndex == null || typeof featureIndex == "undefined") {
        return;
      }
      // featureIndex 有可能是 Array 當 cluster 啟動後
      var feature = null;
      if (Array.isArray(featureIndex)) {
        //Cluster模式
        //"wktCluster" 可以跳過
        //feature = this._instance.getSource().getFeatures()[featureIndex[1]];
        feature = this._instance.getSource().getFeatures()[featureIndex[0]].values_.features[featureIndex[1]];
      } else {
        //一般模式
        feature = this._instance.getSource().getFeatures()[featureIndex];
      }
      for (var ko in obj) {
        ko = ko.toLowerCase();
        switch (ko) {
          case "pic":
            feature.set("pic", obj[ko]);
            break;
          case "scale":
            feature.set("scale", obj[ko]);
            this._iconScale = obj[ko];
            if (this._wkt[data_index].style_setting != null) {
              this._wkt[data_index].style_setting.Image.scale = obj[ko];
            }
            break;
          case "postion":
            feature.set("postion", obj[ko]);
            this._anchor = obj[ko].slice();
            if (this._wkt[data_index].style_setting != null) {
              this._wkt[data_index].style_setting.Image.anchor = obj[ko].slice();
            }
            break;
          case "size":
            feature.set("pic_size", obj[ko]);
            this._pic_size = obj[ko].slice();
            break;
        }
      }
      this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "setIcon_old",
    value: function setIcon_old(data_index, obj) {
      //可以針對 icon 設定新圖
      //obj 為
      /*
      { 
          'pic': 'data:image/png;base64, ...  或 https://3wa.tw/pic/3wa_logo.png', //新圖(選填)
          'scale': 1, //大小(選填)
          'postion': [0, 0], //圖片偏移(選填)
          'size': [64, 64], //圖片大小(選填)
          'auto-refresh': true //自動重匯，預設 true，如為 false，適合大量資料修改，全改完再呼叫 wktObj.refresh()
      }
      */
      if (this._instance == null) return;
      if (dgWKT_typeof(obj) != "object") {
        console.log("錯誤 setIcon 傳入值為...");
        console.log({
          'pic': 'data:image/png;base64, ...  或 https://3wa.tw/pic/3wa_logo.png',
          //新圖(選填)
          'scale': 1,
          //大小比例(選填) , 暫不支援
          'postion': [0, 0],
          //圖片偏移(選填) , 暫不支援
          'size': [64, 64] //圖片大小(選填) , 暫不支援
        });
        return;
      }
      var featureIndex = this._dataIndexToFeatureIndex(data_index);
      if (featureIndex == null || typeof featureIndex == "undefined") return;
      if (Array.isArray(featureIndex)) {
        var mx = this._instance.styleFunction_(this._instance.getSource().getFeatures()[featureIndex[0]]);
        if (!Array.isArray(mx)) return;
        mx.map(function (k) {
          if (k.kind != "Image") {
            return;
          }
          var mxImg = k.getImage();
          //這是圖了
          for (var ko in obj) {
            ko = ko.toLowerCase();
            switch (ko) {
              case "pic":
                var s = mxImg.getSize();
                this._ConvertImageToBase64WithResize(obj[ko], s[0], s[1]).then(function (b64) {
                  mxImg.getImage().src = b64;
                  //重繪
                  if (obj['auto-refresh'] == null || obj['auto-refresh'] == true) {
                    this.refresh();
                  }
                }.bind(this));
                break;
              case "scale":
                mxImg.setScale(parseFloat(obj[ko]));
                break;
              case "position":
                mxImg.offset_ = obj[ko];
                break;
              case "size":
                mxImg.size_ = _toConsumableArray(obj[ko]);
                break;
            }
          }
        }.bind(this));
      } else {
        var _mx = this._instance.styleFunction_(this._instance.getSource().getFeatures()[featureIndex]);
        _mx.map(function (k) {
          if (k.kind != "Image") {
            return;
          }
          var mxImg = k.getImage();
          //這是圖了
          for (var ko in obj) {
            ko = ko.toLowerCase();
            switch (ko) {
              case "position":
                mxImg.offset_ = obj[ko];
                break;
              case "size":
                mxImg.size_ = _toConsumableArray(obj[ko]);
                break;
              case "scale":
                mxImg.scale_ = parseFloat(obj[ko]);
                break;
            }
          }
          mxImg.size_ = mxImg.size_ == null ? [64, 64] : _toConsumableArray(mxImg.size_);
          mxImg.scale_ = mxImg.scale_ == null ? 1.0 : mxImg.scale_;
          for (var ko in obj) {
            ko = ko.toLowerCase();
            switch (ko) {
              case "pic":
                var s = mxImg.getSize();
                if (s == null) {
                  s = _toConsumableArray(mxImg.size_);
                }
                this._ConvertImageToBase64WithResize(obj[ko], s[0], s[1]).then(function (b64) {
                  mxImg.getImage().src = b64;
                  //mxImg.getImage().width = s[0];
                  //mxImg.getImage().height = s[1];
                  //mxImg.getImage().setScale(mxImg.scale_);
                  //重繪
                  if (obj['auto-refresh'] == null || obj['auto-refresh'] == true) {
                    this.refresh();
                  }
                }.bind(this));
                break;
              case "scale":
                mxImg.scale_ = parseFloat(obj[ko]);
                mxImg.setScale(mxImg.scale_);
                this.refresh();
                break;
              case "position":
                mxImg.offset_ = obj[ko];
                break;
              case "size":
                mxImg.size_ = _toConsumableArray(obj[ko]);
                break;
            }
          }
        }.bind(this));
      }
    }
  }, {
    key: "_ConvertImageToBase64WithResize",
    value: function _ConvertImageToBase64WithResize(imageData) {
      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
          // 创建一个 Canvas 元素
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');

          // 设置 Canvas 大小
          canvas.width = width;
          canvas.height = height;

          // 绘制调整大小后的图像
          context.drawImage(image, 0, 0, width, height);

          // 将 Canvas 转换为 Base64 图像
          var resizedBase64Image = canvas.toDataURL('image/png');
          canvas.remove();
          resolve(resizedBase64Image);
        };
        image.onerror = function () {
          return reject('Failed to load the image.');
        };
        if (imageData.startsWith('data:image')) {
          // 如果输入是 Base64 图像数据
          image.src = imageData;
        } else {
          // 如果输入是图像 URL
          fetch(imageData).then(function (response) {
            return response.blob();
          }).then(function (blob) {
            var reader = new FileReader();
            reader.onload = function () {
              image.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })["catch"](reject);
        }
      });
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this._instance.getSource().dispatchEvent('change');
    }
  }, {
    key: "_setXYS",
    value: function _setXYS() {
      //把目前圖型畫的內容寫回 xy、xys
      this._xs = new Array();
      this._ys = new Array();
      this._xys = new Array();
      for (var i = 0; i < this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
        this._xs.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
        this._ys.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
        this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
      }
    }
  }, {
    key: "disableScaleRotate",
    value: function disableScaleRotate() {
      if (this._interaction != null) {
        this._easymap._olmap.removeInteraction(this._interaction);
        this._interaction = null;
      }
    }
  }, {
    key: "enableScaleRotate",
    value: function enableScaleRotate(obj) {
      this.disableScaleRotate();
      /*obj : 
      {              
        scale : true,
        rotate : true,
        stop: function(evt){
        }
      }
      */
      var firstPoint = false;
      var isScale = true;
      var isRotate = true;
      if (typeof obj != "undefined" && typeof obj.scale == "boolean") {
        isScale = obj.scale;
      }
      if (typeof obj != "undefined" && typeof obj.rotate == "boolean") {
        isRotate = obj.rotate;
      }
      this._interaction = new ol.interaction.Transform({
        enableRotatedTransform: false,
        /* Limit interaction inside bbox * /
        condition: function(e, features) {
          return ol.extent.containsXY([-465960, 5536486, 1001630, 6514880], e.coordinate[0], e.coordinate[1]);
        },
        /* */
        addCondition: ol.condition.shiftKeyOnly,
        // filter: function(f,l) { return f.getGeometry().getType()==='Polygon'; },
        layers: [this._instance],
        //window.data[2].easyobj._instance],
        hitTolerance: 2,
        translateFeature: true,
        //$("#translateFeature").prop('checked'),
        scale: isScale,
        //$("#scale").prop('checked'),
        rotate: isRotate,
        //$("#rotate").prop('checked'),
        keepAspectRatio: ol.condition.always,
        //$("#keepAspectRatio").prop('checked') ? ol.events.condition.always : undefined,
        translate: true,
        //$("#translate").prop('checked'),
        stretch: true //$("#stretch").prop('checked')
      });
      //map.addInteraction(interaction);
      //console.log(this);    
      this._easymap._olmap.addInteraction(this._interaction);
      // Style handles
      //setHandleStyle();
      // Events handlers
      var startangle = 0;
      var d = [0, 0];

      // Handle rotate on first point
      var firstPoint = false;
      // default center
      firstPoint = false;
      this._interaction.setCenter();
      this._interaction.on(['select'], function (e) {
        if (firstPoint && e.features && e.features.getLength()) {
          interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
        if (e.features && e.features.getLength()) {
          //console.log(this); // this 是 wktobj
          //console.log(e); // e
          //window['wtf'] = e;
          // 放大或縮小的圖示!?
          if (isRotate == true) {
            this._interaction.style.rotate[0].setImage(new ol.style.Icon({
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              //rotation: Math.PI / 2.0,
              src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAADLAAAAywAEoZFrbAAAFd0lEQVRYw+2WW2xUVRSG/7XPdGbofTpDL1ZQyqWCqTGppQE0WgkhJhpCYgICalLj5RF98IEHjRoTnogJBI1EQzBGjJdoeFATIEKaESFWqrEFqtOkLaXaMlBomZlzzl6/Dy0whU6nrSa+uJL1crL3Wt/+1zprb+B/+49N5rqRJJhMgn/9BSST44GKioC6OqCkBAJAJH/4uQOMjYGOU4t0+iG4rgK4iIKCfpSX9wqQ4aVLikgEJg9EYC4nBwmIGHZ0NOLIkbfQ3h5GcfFVWbZsmM3N3ayu/lYWL/5egGGqkiI5QWYFoKogeV1ag2SyFKdOVepXX5WioAAoKwMqKx80q1Y9xscfP47m5vclEokLmc7aNwe5SajqdQ+oaphkiY3HW+0LL1zxSkqYAW64W1hIf/Vq3+7de0YHBp4jOU/JuSlA8vqpDcngxB4h4MiCBVe4fv1PUlERczKZOyWRKNa2toAmk7DxuGMuXKg3qdTr2LoVUlX1kZJuvp6YUnZVNapaqKolN9zaUlW9W8lmJVvUdZ/SePxtf9euX/y1a91MOMwMQK+ujnbPnnN65cpjuVTIJ72o6rxJyW96sZJFE16o5HxNpx+1x4595m/blnInIPw1a2i//voTkrWcDcQEQDBH8lxAxUrer21tn/tr17oZx6EbDNJ/5ZVh7e9/kqTJzmHyAAiAglmIJhjf8zsaG/fKli1nTXU16LpAPF6uP/74KIDIjAEAODNYMxU5JBz+FU1NR2Xp0rQYA+3sdDA4uBJALLsMMwGYiwmADAKBY7JiRRKhEJDJwCSTNezvL52NAnMf1YCViooeqa8fQygEqAIDAyEODNRkx50EcP2f/9dMZFIwWguoTsp52yCiKm78r6TFzMa1TPHB6NWrd8jAwDx4HmAMpLraRyz257hAOQBgTKEAxQAEIg6A8HSlIGBBXgXgTv6MIEZHV2p7exnSaSAchsZiQ2bhwpFpFYDnrdbOzlZ2d5fB9xXGOFMCqAKlpY5ZteosIpF3QfbeWCdC+v4idHWtZ3d3Ma2Fs2SJSlVVuwSDF7MvpUkAIgIdGxvB6dPLsGtXI/v6cjeEMZBHHvFYV5eQSORSVhAFUM3Ozhf100/v5/nzIsYADzwwKsuXHwUwPG0xSQb17NlX7dNPX3aDwUm3XLZ7NTW0+/ad1pGRhyemX7GS5Urea7u69vjbt192y8vHR3FDA+3HH3+j5JK8Te57Huy1a3fZQ4e+8+67T6dK7gYCtFu3XtMzZ94huUzJRTaZXGn/+ONl++WXh/3Nm0fdaHQctKqK9o03zuvQ0DaSt82V23rACQSAQKCfjY0fmo0bG5hI1HB09NbGg46MBM3x40/w3Ll6ZDKFMjRUrSdPzucPP0SYSICeBxOLQZ555rJs3vwBYrFDBCxmYhPzIGaPHHnPX7fOm7IMoRDdigp6lZXqVlbSjUbphkI3S1RfT7tjx6Dt6npTyah63oxy32xyEppOP2x37/7Nq629KX9REd2yMrrBIF3HoWsMXWOYCQTohkL0FixQf9OmlN2/P66Dg88rWa6pVM4BN+2QkVDoJFpaDsqJEztw8GBYolGYZ59NYunSS9LTU4be3gKMjARgjCIatVi0KIXa2g5paDiMpqbDAnQynfYkHM75HswJIOO1TmH58s9kw4YWp6OjhbW1nmlt/QL33PMuE4n56O+vhLXzoZpBOHxR6ur6pKbmPIBBjo5mWFiI6ZLn7YOJUjja09Nqd+4ctgcO/KzDw02aSsF96SWQdEiGSAZJGnviBNRaKAn29c0oT140S0IuXIjB2tcQifSiqGi3ABkga6Bn2WwfnXlXTyhhCNwBIAUgaW655f6JzQhXXRcwZtwBGDP7R1Iu+xuhFoFpyt/TiQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0xMi0xMVQxNDoxNjoxMCswODowMPAYnoEAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMTItMTFUMTQ6MTY6MTArMDg6MDCBRSY9AAAAAElFTkSuQmCC'
            }));
          }
        }
        //console.log(this);
        if (this.onedit_select != null) {
          //console.log(this.onclick.toString());
          //當編輯結束以後，會觸發 onedit_select 事件
          this.onedit_select(e);
        }
      }.bind(this));
      this._interaction.on(['rotatestart', 'translatestart'], function (e) {
        // Rotation
        startangle = e.feature.get('angle') || 0;
        // Translation
        d = [0, 0];
      });
      this._interaction.on('rotating', function (e) {
        //$('#info').text("rotate: "+((e.angle*180/Math.PI -180)%360+180).toFixed(2)); 
        // Set angle attribute to be used on style !
        e.feature.set('angle', startangle - e.angle);
      });
      this._interaction.on('translating', function (e) {
        d[0] += e.delta[0];
        d[1] += e.delta[1];
        //$('#info').text("translate: "+d[0].toFixed(2)+","+d[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on('scaling', function (e) {
        //$('#info').text("scale: "+e.scale[0].toFixed(2)+","+e.scale[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on(['rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        switch (this._type) {
          case 'dgwkt':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            try {
              switch (e.feature.getGeometry().getType().toLowerCase()) {
                case "geometrycollection":
                  {
                    //todo: fix multiple geometrycollection
                    for (var i = 0; i < e.feature.getGeometry().getGeometries()[0].clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                      this._xs.push(e.feature.getGeometry().getGeometries()[0].clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                      this._ys.push(e.feature.getGeometry().getGeometries()[0].clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                      this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
                    }
                  }
                  break;
                default:
                  {
                    for (var i = 0; i < e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                      this._xs.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                      this._ys.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                      this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
                    }
                  }
                  break;
              }
            } catch (_unused) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys1");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "enableEditor",
    value: function enableEditor() {
      this.disableEditor();
      this._modify = new ol.interaction.Modify({
        source: this._instance.getSource()
      });
      this._easymap._olmap.addInteraction(this._modify);
      this._modify.on(['modifyend', 'rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        //console.log(e);
        //console.log(this);
        //window['wtf']=e;
        //window['wtff']=this;
        switch (this._type) {
          case 'dgwkt':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            //console.log(e);
            //window['wtf']=e;   
            try {
              switch (e.features.array_[0].getGeometry().getType().toLowerCase()) {
                case "geometrycollection":
                  {
                    //todo: fix multiple geometrycollection
                    for (var i = 0; i < e.features.array_[0].getGeometry().getGeometries()[0].clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                      this._xs.push(e.features.array_[0].getGeometry().getGeometries()[0].clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                      this._ys.push(e.features.array_[0].getGeometry().getGeometries()[0].clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                      this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
                    }
                  }
                  break;
                default:
                  {
                    for (var i = 0; i < e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                      this._xs.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                      this._ys.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                      this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
                    }
                  }
                  break;
              }
            } catch (_unused2) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys2");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "disableEditor",
    value: function disableEditor() {
      if (this._modify != null) {
        this._easymap._olmap.removeInteraction(this._modify);
        this._modify = null;
      }
    }
  }, {
    key: "enableHeatmap",
    value: function enableHeatmap(opt) {
      if (this._instance != null) {
        if (this._heatmapObj != null) {
          this._easymap.removeItem(this._heatmapObj);
        }
        this._heatmapObj = new dgHeatmap(this, opt);
        this._easymap.addItem(this._heatmapObj);
        this.setOpacity(0);
      } else {
        console.log("dgWKT 需先 addItem 至圖台才能使用 enableHeatmap...");
      }
    }
  }, {
    key: "disableHeatmap",
    value: function disableHeatmap() {
      if (this._heatmapObj != null) {
        this._easymap.removeItem(this._heatmapObj);
      }
      if (this.getOpacity() == 0) {
        this.setOpacity(1);
      }
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      if (!isNaN(val) == false) val = 1;
      this.opacity = parseFloat(val);
      //console.log(this);        
      this._instance.setOpacity(this.opacity);
    }
  }, {
    key: "getOpacity",
    value: function getOpacity() {
      return this.opacity;
    }
  }, {
    key: "getClosestData",
    value: function getClosestData(wkt_or_dgxy, counts) {
      // 此 getClosestData 可以搜尋 wkt 陣列的資料，查找最接近傳入 WKT 或 dgXY 的內容，counts 為回傳筆數，如為 null 則全數回傳。
      switch (wkt_or_dgxy.constructor.name.toLowerCase()) {
        case "dgxy":
          {
            wkt_or_dgxy = "POINT(" + wkt_or_dgxy.x + " " + wkt_or_dgxy.y + ")";
          }
          break;
      }
      //統一用 wkt 來讀取
      if (!Array.isArray(this._wkt)) {
        console.log("此 dgWKT 尚未載入 wkt ");
        return false;
      }
      var gf = new ol.format.WKT();
      var from_geome = gf.readFeatures(wkt_or_dgxy, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      var output = new Array();
      for (var i = 0, max_i = this._wkt.length; i < max_i; i++) {
        var geome = gf.readFeatures(this._wkt[i]['wkt'], {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        //this._wkt[i]['geome'] = geome;
        //只跟 geome[0] 比
        output.push(this._wkt[i]);
        var index = output.length - 1;
        output[index]['getClosestData_index'] = i;
        output[index]['getClosestData_distance'] = this._easymap._getShortestLineDistance(from_geome[0].getGeometry(), geome[0].getGeometry());
      }

      //排序
      output = this._easymap._array_sort(output, "getClosestData_distance", "ASC");
      //看看 counts 有沒有值
      if (!isNaN(counts)) {
        output = output.slice(0, counts);
      }
      return output;
      //window['wtf_output'] = output;
      //window['wtf'] = from_geome;
    }
  }]);
  return dgWKT;
}();
/* harmony default export */ const dg_dgWKT = (dgWKT);
;// CONCATENATED MODULE: ./src/dg/dgGML.js
function dgGML_typeof(o) { "@babel/helpers - typeof"; return dgGML_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgGML_typeof(o); }
function dgGML_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgGML_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgGML_toPropertyKey(o.key), o); } }
function dgGML_createClass(e, r, t) { return r && dgGML_defineProperties(e.prototype, r), t && dgGML_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgGML_toPropertyKey(t) { var i = dgGML_toPrimitive(t, "string"); return "symbol" == dgGML_typeof(i) ? i : i + ""; }
function dgGML_toPrimitive(t, r) { if ("object" != dgGML_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgGML_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgGML = /*#__PURE__*/function () {
  //From : http://bl.ocks.org/pbogden/6301219
  function dgGML(url, srs, callback) {
    dgGML_classCallCheck(this, dgGML);
    //private
    this._easymap = null;
    this._type = 'dggml';
    this._url = url;
    this._gml_version = "GML"; //default GML, GML2, GML3、GML32、GMLBase
    this._gml_hasZ = false; //有沒有 Z 軸 https://openlayers.org/en/latest/apidoc/module-ol_format_GML2-GML2.html
    this._gml = null;
    this._callback = callback;
    this._instance = null;
    this._async = false;
    this._dataSRS = "EPSG:4326"; //預設 4326
    if (srs != null) {
      this._dataSRS = srs;
    }
    this._setUpperZoomByBoundary = false; //whether uses most best view range
    this._xhr = null; //networklink httprequest
    this._styles = {
      'Point': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiPoint': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.1)'
        })
      }),
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      }),
      'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'magenta'
        }),
        image: new ol.style.Circle({
          radius: 10,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'magenta'
          })
        })
      }),
      'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
    };
    //this._gMarkerEnabled = false;
    //this._distance = 50;
    //this._threshold = 1;
    //this._Style = new dgGStyle();
    //this._isZoomClusterEnabled = true; //whether 到某zoom關閉cluster
    //this._clusterZoom = 17;            // 預設18層以上不分群
    //this._defaultStyles = null;
    this._zIndex = 1;

    //this._isLinestringArrowEnabled = false;//是否開啟LineString arrow

    //this._showInSelect = true; //可顯示在點開的下拉選單
    //this._lineStringIconsrc = '';
    //this._lineStringStyle = null;
    this._lineStringWidth = 1;
    //this._zoomThreshold = 0;
    this._featureSelect = true;
    /*this._styleCache = {//加快cluster style
        h: null,
        m: null,
        l: null
    };*/
    //public
    this.url = url;

    //#events 
    this.onFeatureSelect = null;
    this.onFeatureUnselect = null;
    this._onFeatureHover = null;
    this.labelVisible = false; //whether label shows or not
    this.iconVisible = false; //whether icon shows or not
    this.useNetworkLink = true; //whether use networklink
    this.opacity = 1;
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
    this.bufferObj = null;
    return this;
  }
  dgGML_createClass(dgGML, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(meter) {
      if (this._instance == null) {
        console.log("map.addItem 後才能 setBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
      this.buffer = meter;
      this.bufferObj = this._easymap.dgToBufferDg(this, meter);
      this._easymap.addItem(this.bufferObj);
    }
  }, {
    key: "removeBuffer",
    value: function removeBuffer() {
      if (this._instance == null) {
        console.log("map.addItem 後才能 removeBuffer");
        return;
      }
      this._easymap.removeItem(this.bufferObj);
    }
  }, {
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgGML_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Object();
      var s = this.getStyle();
      for (var kind in s) {
        var originStyles = new Array();
        originStyles.push(s[kind]);
        var d = {
          text: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getColor == null ? null : originStyles[0].getText().getColor(),
          textfill: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().getColor == null ? null : originStyles[0].getText().getFill().getColor(),
          stroke: originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().getColor == null ? null : originStyles[0].getStroke().getColor(),
          fill: originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().getColor == null ? null : originStyles[0].getFill().getColor(),
          image: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill() == null || originStyles[0].getImage().getFill().getColor == null ? null : originStyles[0].getImage().getFill().getColor(),
          //改顏色必需觸發一次改大小，才會生效
          //point 特有
          radius: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().getRadius()
        };
        this._flashFocusData.orinStyle[kind] = d;
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              var _s = this.getStyle();
              for (var kind in _s) {
                var _originStyles = new Array();
                _originStyles.push(_s[kind]);
                this._flashFocusData.orinStyle[kind].text == null || _originStyles[0].getText == null || _originStyles[0].getText() == null || _originStyles[0].getText().setColor == null ? null : _originStyles[0].getText().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[kind].textfill == null || _originStyles[0].getText == null || _originStyles[0].getText() == null || _originStyles[0].getText().getFill == null || _originStyles[0].getText().getFill() == null || _originStyles[0].getText().getFill().setColor == null ? null : _originStyles[0].getText().getFill().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[kind].stroke == null || _originStyles[0].getStroke == null || _originStyles[0].getStroke() == null || _originStyles[0].getStroke().setColor == null ? null : _originStyles[0].getStroke().setColor(this._flashFocusData.flashColor);
                //console.log(this._easymap);
                var new_color_with_opacity = this._easymap.colorValues(this._flashFocusData.flashColor);
                //這裡用 0.5 opacity 
                this._flashFocusData.orinStyle[kind].fill == null || _originStyles[0].getFill == null || _originStyles[0].getFill() == null || _originStyles[0].getFill().setColor == null ? null : _originStyles[0].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[kind].image == null || _originStyles[0].getImage == null || _originStyles[0].getImage() == null || _originStyles[0].getImage().getFill == null || _originStyles[0].getImage().getFill().setColor == null ? null : _originStyles[0].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[kind].radius == null || _originStyles[0].getImage == null || _originStyles[0].getImage() == null || _originStyles[0].getImage().getRadius == null ? null : _originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[kind].radius);
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              var _s2 = this.getStyle();
              for (var kind in _s2) {
                var _originStyles2 = new Array();
                _originStyles2.push(_s2[kind]);
                this._flashFocusData.orinStyle[kind].text == null ? '' : _originStyles2[0].getText().setColor(this._flashFocusData.orinStyle[kind].text);
                this._flashFocusData.orinStyle[kind].textfill == null ? '' : _originStyles2[0].getText().getFill().setColor(this._flashFocusData.orinStyle[kind].textfill);
                this._flashFocusData.orinStyle[kind].stroke == null ? '' : _originStyles2[0].getStroke().setColor(this._flashFocusData.orinStyle[kind].stroke);
                this._flashFocusData.orinStyle[kind].fill == null ? '' : _originStyles2[0].getFill().setColor(this._flashFocusData.orinStyle[kind].fill);
                this._flashFocusData.orinStyle[kind].image == null ? '' : _originStyles2[0].getImage().getFill().setColor(this._flashFocusData.orinStyle[kind].image);
                this._flashFocusData.orinStyle[kind].radius == null || _originStyles2[0].getImage == null || _originStyles2[0].getImage().setRadius == null ? '' : _originStyles2[0].getImage().setRadius(this._flashFocusData.orinStyle[kind].radius);
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      clearInterval(this._flashFocusData.runInterval); //stop
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        this._flashFocusData.orinStyle[i].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[i].text);
        this._flashFocusData.orinStyle[i].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[i].stroke);
        this._flashFocusData.orinStyle[i].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[i].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      return this._styles;
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      return new dgXY((_extent_4326[0] + _extent_4326[2]) / 2.0, (_extent_4326[1] + _extent_4326[3]) / 2.0);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      var _size = 0;
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].getGeometry().getArea != null) {
          _size += this._instance.getSource().getFeatures()[i].getGeometry().getArea();
        }
      }
      return _size;
    }
  }, {
    key: "getZIndex",
    value: function getZIndex() {
      return this._zIndex;
    }
  }, {
    key: "setZIndex",
    value: function setZIndex(val) {
      this._zIndex = parseInt(val);
      //console.log(this);
      if (this._easymap != null && this._easymap.setItemZIndex != null) {
        this._easymap.setItemZIndex(this, this.getZIndex());
      }
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      this._setUpperZoomByBoundary = true;
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      if (!isNaN(val) == false) val = 1;
      this.opacity = parseFloat(val);
      //console.log(this);        
      this._instance.setOpacity(this.opacity);
    }
  }, {
    key: "setFeatureClick",
    value: function setFeatureClick(handler) {
      this.onFeatureSelect = handler;
    }
  }, {
    key: "setFeatureHover",
    value: function setFeatureHover(handler) {
      this._onFeatureHover = handler;
    } //updateStyleByAttribute() { }
  }, {
    key: "getType",
    value: function getType() {
      if (this._instance != null) {
        return this._instance.getType();
      }
      return null;
    }
  }, {
    key: "getClosestData",
    value: function getClosestData(wkt_or_dgxy, counts) {
      // 此 getClosestData 可以搜尋 wkt 陣列的資料，查找最接近傳入 WKT 或 dgXY 的內容，counts 為回傳筆數，如為 null 則全數回傳。
      switch (wkt_or_dgxy.constructor.name.toLowerCase()) {
        case "dgxy":
          {
            wkt_or_dgxy = "POINT(" + wkt_or_dgxy.x + " " + wkt_or_dgxy.y + ")";
          }
          break;
      }
      //統一用 wkt 來讀取
      if (!Array.isArray(this._wkt)) {
        console.log("此 dgWKT 尚未載入 wkt ");
        return false;
      }
      var gf = new ol.format.WKT();
      var from_geome = gf.readFeatures(wkt_or_dgxy, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      var output = new Array();
      for (var i = 0, max_i = this._wkt.length; i < max_i; i++) {
        var geome = gf.readFeatures(this._wkt[i]['wkt'], {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        //this._wkt[i]['geome'] = geome;
        //只跟 geome[0] 比
        output.push(this._wkt[i]);
        var index = output.length - 1;
        output[index]['getClosestData_index'] = i;
        output[index]['getClosestData_distance'] = this._easymap._getShortestLineDistance(from_geome[0].getGeometry(), geome[0].getGeometry());
      }

      //排序
      output = this._easymap._array_sort(output, "getClosestData_distance", "ASC");
      //看看 counts 有沒有值
      if (!isNaN(counts)) {
        output = output.slice(0, counts);
      }
      return output;
      //window['wtf_output'] = output;
      //window['wtf'] = from_geome;
    }
  }]);
  return dgGML;
}();
/* harmony default export */ const dg_dgGML = (dgGML);
;// CONCATENATED MODULE: ./src/dg/dgMergeVector.js
function dgMergeVector_typeof(o) { "@babel/helpers - typeof"; return dgMergeVector_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgMergeVector_typeof(o); }
function dgMergeVector_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgMergeVector_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgMergeVector_toPropertyKey(o.key), o); } }
function dgMergeVector_createClass(e, r, t) { return r && dgMergeVector_defineProperties(e.prototype, r), t && dgMergeVector_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgMergeVector_toPropertyKey(t) { var i = dgMergeVector_toPrimitive(t, "string"); return "symbol" == dgMergeVector_typeof(i) ? i : i + ""; }
function dgMergeVector_toPrimitive(t, r) { if ("object" != dgMergeVector_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgMergeVector_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgMergeVector = /*#__PURE__*/function () {
  function dgMergeVector(vector, xy) {
    dgMergeVector_classCallCheck(this, dgMergeVector);
    this._id = null;
    this._type = 'mergevector';
    this._instance = vector;
    this._xy = {
      x: xy.x,
      y: xy.y
    };
  }
  dgMergeVector_createClass(dgMergeVector, [{
    key: "getCenter",
    value: function getCenter() {
      return new dgXY(this._xy.x, this._xy.y);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var b = new Object();
      return b;
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }]);
  return dgMergeVector;
}();
/* harmony default export */ const dg_dgMergeVector = (dgMergeVector);
;// CONCATENATED MODULE: ./src/dg/dgHeatmap.js
function dgHeatmap_toConsumableArray(r) { return dgHeatmap_arrayWithoutHoles(r) || dgHeatmap_iterableToArray(r) || dgHeatmap_unsupportedIterableToArray(r) || dgHeatmap_nonIterableSpread(); }
function dgHeatmap_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function dgHeatmap_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return dgHeatmap_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? dgHeatmap_arrayLikeToArray(r, a) : void 0; } }
function dgHeatmap_iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function dgHeatmap_arrayWithoutHoles(r) { if (Array.isArray(r)) return dgHeatmap_arrayLikeToArray(r); }
function dgHeatmap_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) { n[e] = r[e]; } return n; }
function dgHeatmap_typeof(o) { "@babel/helpers - typeof"; return dgHeatmap_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgHeatmap_typeof(o); }
function dgHeatmap_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgHeatmap_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgHeatmap_toPropertyKey(o.key), o); } }
function dgHeatmap_createClass(e, r, t) { return r && dgHeatmap_defineProperties(e.prototype, r), t && dgHeatmap_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgHeatmap_toPropertyKey(t) { var i = dgHeatmap_toPrimitive(t, "string"); return "symbol" == dgHeatmap_typeof(i) ? i : i + ""; }
function dgHeatmap_toPrimitive(t, r) { if ("object" != dgHeatmap_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgHeatmap_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgHeatmap_dgHeatmap = /*#__PURE__*/function () {
  function dgHeatmap(dgObj, obj) {
    dgHeatmap_classCallCheck(this, dgHeatmap);
    //private
    this._easymap = null;
    this._type = 'dgheatmap';
    this._instance = null;
    this._layerSourceObj = null;
    if (dgObj._instance != null && dgObj._instance.getSource() != null) {
      this._layerSourceObj = dgObj._instance.getSource();
    }
    //default
    this._heatmapOpt = {
      blur: 10,
      radius: 6,
      field: null //是否用裡面的值來當熱區
    };
    if (obj != null) {
      this._heatmapOpt = this._objMergeDeep(this._heatmapOpt, obj);
    }
  }
  dgHeatmap_createClass(dgHeatmap, [{
    key: "_objMergeDeep",
    value: function _objMergeDeep() {
      var _this = this;
      var isObject = function isObject(obj) {
        return obj && dgHeatmap_typeof(obj) === 'object';
      };
      for (var _len = arguments.length, objects = new Array(_len), _key = 0; _key < _len; _key++) {
        objects[_key] = arguments[_key];
      }
      return objects.reduce(function (prev, obj) {
        Object.keys(obj).forEach(function (key) {
          var pVal = prev[key];
          var oVal = obj[key];
          if (Array.isArray(pVal) && Array.isArray(oVal)) {
            prev[key] = pVal.concat.apply(pVal, dgHeatmap_toConsumableArray(oVal));
          } else if (isObject(pVal) && isObject(oVal)) {
            prev[key] = _this._objMergeDeep(pVal, oVal);
          } else {
            prev[key] = oVal;
          }
        });
        return prev;
      }, {});
    }
  }, {
    key: "setBlur",
    value: function setBlur(val) {
      this._heatmapOpt.blur = val;
      this._instance.setBlur(val);
    }
  }, {
    key: "getBlur",
    value: function getBlur() {
      return this._heatmapOpt.blur;
    }
  }, {
    key: "setRadius",
    value: function setRadius(val) {
      this._heatmapOpt.radius = val;
      this._instance.setRadius(val);
      return this._heatmapOpt;
    } //setField(){
    //}
  }]);
  return dgHeatmap;
}();
/* harmony default export */ const dg_dgHeatmap = (dgHeatmap_dgHeatmap);
;// CONCATENATED MODULE: ./src/dg/dgWFS.js
function dgWFS_typeof(o) { "@babel/helpers - typeof"; return dgWFS_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgWFS_typeof(o); }
function dgWFS_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgWFS_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgWFS_toPropertyKey(o.key), o); } }
function dgWFS_createClass(e, r, t) { return r && dgWFS_defineProperties(e.prototype, r), t && dgWFS_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgWFS_toPropertyKey(t) { var i = dgWFS_toPrimitive(t, "string"); return "symbol" == dgWFS_typeof(i) ? i : i + ""; }
function dgWFS_toPrimitive(t, r) { if ("object" != dgWFS_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgWFS_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgWFS = /*#__PURE__*/function () {
  function dgWFS(url, srs, callback) {
    dgWFS_classCallCheck(this, dgWFS);
    //private
    this._easymap = null;
    this._type = 'dgwfs';
    this._xys = new Array();
    this._xs = new Array();
    this._ys = new Array();
    this._url = url;
    this._wfs = null;
    this._callback = callback;
    this._instance = null;
    this._async = false;
    this._dataSRS = "EPSG:3857"; //預設 3857
    if (srs != null) {
      this._dataSRS = srs;
    }
    this._setUpperZoomByBoundary = false; //whether uses most best view range
    this._xhr = null; //networklink httprequest
    this._styles = {
      'Text': new ol.style.Style({
        text: new ol.style.Text({
          text: '',
          font: '12pt sans-serif',
          stroke: new ol.style.Stroke({
            color: 'black',
            width: 0.75
          }),
          backgroundFill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.3)'
          }),
          overflow: false
        })
      }),
      'Point': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'green',
          width: 1
        })
      }),
      'MultiPoint': new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 1
          })
        })
      }),
      'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.1)'
        })
      }),
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      }),
      'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'magenta'
        }),
        image: new ol.style.Circle({
          radius: 10,
          fill: null,
          stroke: new ol.style.Stroke({
            color: 'magenta'
          })
        })
      }),
      'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
    };
    //this._gMarkerEnabled = false;
    //this._distance = 50;
    //this._threshold = 1;
    //this._Style = new dgGStyle();
    //this._isZoomClusterEnabled = true; //whether 到某zoom關閉cluster
    //this._clusterZoom = 17;            // 預設18層以上不分群
    //this._defaultStyles = null;
    this._zIndex = 1;

    //this._isLinestringArrowEnabled = false;//是否開啟LineString arrow

    //this._showInSelect = true; //可顯示在點開的下拉選單
    //this._lineStringIconsrc = '';
    //this._lineStringStyle = null;
    this._lineStringWidth = 1;
    //this._zoomThreshold = 0;
    this._featureSelect = true;
    /*this._styleCache = {//加快cluster style
        h: null,
        m: null,
        l: null
    };*/
    //public
    this.url = url;

    //#events 
    this.onFeatureSelect = null;
    this.onFeatureUnselect = null;
    this._onFeatureHover = null;
    this.labelVisible = false; //whether label shows or not
    this.iconVisible = false; //whether icon shows or not
    this.useNetworkLink = true; //whether use networklink
    this.opacity = 1;
    this._flashFocusData = {
      orinStyle: null,
      isPlaying: false,
      runTimes: 5,
      duration: 300,
      flashColor: 'rgb(255,0,0)',
      runInterval: null,
      _cFlag: 1 //switch 1 and -1
    };
    return this;
  }
  dgWFS_createClass(dgWFS, [{
    key: "enableFlashFocus",
    value: function enableFlashFocus(obj) {
      if (this._flashFocusData.isPlaying) {
        console.log("正在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      if (dgWFS_typeof(obj) != "object") {
        this._flashFocusData.runTimes = 5;
        this._flashFocusData.duration = 300;
        this._flashFocusData.flashColor = 'rgb(255,0,0)';
        console.log("閃光效果參數，可為 null，或是 {'runTimes':5 , duration:300, flashColor: 'rgb(255,0,0)'}");
      } else {
        for (var k in obj) {
          //console.log(obj.k);
          //console.log(k);
          this._flashFocusData[k] = obj[k];
        }
      }
      //備份原本的樣式
      this._flashFocusData.orinStyle = new Array();
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        var d = {
          text: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getColor == null ? null : originStyles[0].getText().getColor(),
          textfill: originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().getColor == null ? null : originStyles[0].getText().getFill().getColor(),
          stroke: originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().getColor == null ? null : originStyles[0].getStroke().getColor(),
          fill: originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().getColor == null ? null : originStyles[0].getFill().getColor(),
          image: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill() == null || originStyles[0].getImage().getFill().getColor == null ? null : originStyles[0].getImage().getFill().getColor(),
          //改顏色必需觸發一次改大小，才會生效
          //point 特有
          radius: originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().getRadius()
        };
        this._flashFocusData.orinStyle.push(d);
      }
      this._flashFocusData.isPlaying = true;
      this._flashFocusData.runInterval = setInterval(function () {
        //console.log(this);
        //window['wtf'] = this;
        switch (this._flashFocusData._cFlag) {
          case 1:
            //run new color
            {
              for (var _i = 0, _max_i = features.length; _i < _max_i; _i++) {
                var originStyles = features[_i].getStyleFunction().call(null, features[_i]);
                this._flashFocusData.orinStyle[_i].text == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().setColor == null ? null : originStyles[0].getText().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].textfill == null || originStyles[0].getText == null || originStyles[0].getText() == null || originStyles[0].getText().getFill == null || originStyles[0].getText().getFill() == null || originStyles[0].getText().getFill().setColor == null ? null : originStyles[0].getText().getFill().setColor(this._flashFocusData.flashColor);
                this._flashFocusData.orinStyle[_i].stroke == null || originStyles[0].getStroke == null || originStyles[0].getStroke() == null || originStyles[0].getStroke().setColor == null ? null : originStyles[0].getStroke().setColor(this._flashFocusData.flashColor);
                //console.log(this._easymap);
                var new_color_with_opacity = this._easymap.colorValues(this._flashFocusData.flashColor);
                //這裡用 0.5 opacity 
                this._flashFocusData.orinStyle[_i].fill == null || originStyles[0].getFill == null || originStyles[0].getFill() == null || originStyles[0].getFill().setColor == null ? null : originStyles[0].getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].image == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getFill == null || originStyles[0].getImage().getFill().setColor == null ? null : originStyles[0].getImage().getFill().setColor('rgba(' + new_color_with_opacity[0] + ',' + new_color_with_opacity[1] + ',' + new_color_with_opacity[2] + ',0.5)');
                this._flashFocusData.orinStyle[_i].radius == null || originStyles[0].getImage == null || originStyles[0].getImage() == null || originStyles[0].getImage().getRadius == null ? null : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i].radius);
              }
              this._instance.getSource().dispatchEvent('change');
            }
            break;
          case -1:
            //run orin color
            {
              for (var _i2 = 0, _max_i2 = features.length; _i2 < _max_i2; _i2++) {
                var originStyles = features[_i2].getStyleFunction().call(null, features[_i2]);
                this._flashFocusData.orinStyle[_i2].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[_i2].text);
                this._flashFocusData.orinStyle[_i2].textfill == null ? '' : originStyles[0].getText().getFill().setColor(this._flashFocusData.orinStyle[_i2].textfill);
                this._flashFocusData.orinStyle[_i2].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[_i2].stroke);
                this._flashFocusData.orinStyle[_i2].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[_i2].fill);
                this._flashFocusData.orinStyle[_i2].image == null ? '' : originStyles[0].getImage().getFill().setColor(this._flashFocusData.orinStyle[_i2].image);
                this._flashFocusData.orinStyle[_i2].radius == null || originStyles[0].getImage == null || originStyles[0].getImage().setRadius == null ? '' : originStyles[0].getImage().setRadius(this._flashFocusData.orinStyle[_i2].radius);
              }
              this._instance.getSource().dispatchEvent('change');
              if (this._flashFocusData.runTimes != -1 && this._flashFocusData.runTimes-- <= 0) {
                //停了
                this._flashFocusData.isPlaying = false;
                clearInterval(this._flashFocusData.runInterval);
                return;
              }
            }
            break;
        }
        this._flashFocusData._cFlag *= -1;
      }.bind(this), this._flashFocusData.duration);
    }
  }, {
    key: "disableFlashFocus",
    value: function disableFlashFocus() {
      if (!this._flashFocusData.isPlaying) {
        console.log("沒在閃...");
        return;
      }
      if (this._instance == null) {
        console.log("需 map.addItem 以後才能使用");
        return;
      }
      clearInterval(this._flashFocusData.runInterval); //stop
      var features = this._instance.getSource().getFeatures();
      for (var i = 0, max_i = features.length; i < max_i; i++) {
        var originStyles = features[i].getStyleFunction().call(null, features[i]);
        this._flashFocusData.orinStyle[i].text == null ? '' : originStyles[0].getText().setColor(this._flashFocusData.orinStyle[i].text);
        this._flashFocusData.orinStyle[i].stroke == null ? '' : originStyles[0].getStroke().setColor(this._flashFocusData.orinStyle[i].stroke);
        this._flashFocusData.orinStyle[i].fill == null ? '' : originStyles[0].getFill().setColor(this._flashFocusData.orinStyle[i].fill);
      }
      this._instance.getSource().dispatchEvent('change');
      this._flashFocusData.isPlaying = false;
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      return this._styles;
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      return new dgXY((_extent_4326[0] + _extent_4326[2]) / 2.0, (_extent_4326[1] + _extent_4326[3]) / 2.0);
    }
  }, {
    key: "getExtent",
    value: function getExtent() {
      var _extent = this._instance.getSource().getExtent();
      var _extent_4326 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:4326'));
      var b = new Object();
      b['lt_x'] = _extent_4326[0];
      b['lt_y'] = _extent_4326[3];
      b['rb_x'] = _extent_4326[2];
      b['rb_y'] = _extent_4326[1];
      return _extent_4326;
    }
  }, {
    key: "getExtentArea",
    value: function getExtentArea() {
      //取得四角範圍的面積
      //回應平方公尺
      var _extent = this._instance.getSource().getExtent();
      var _extent_3826 = ol.extent.applyTransform(_extent, ol.proj.getTransform('EPSG:3857', 'EPSG:3826'));
      return Math.abs(_extent_3826[2] - _extent_3826[0]) * (_extent_3826[3] - _extent_3826[1]);
    }
  }, {
    key: "getArea",
    value: function getArea() {
      var _size = 0;
      for (var i = 0, max_i = this._instance.getSource().getFeatures().length; i < max_i; i++) {
        if (this._instance.getSource().getFeatures()[i].getGeometry().getArea != null) {
          _size += this._instance.getSource().getFeatures()[i].getGeometry().getArea();
        }
      }
      return _size;
    }
  }, {
    key: "getZIndex",
    value: function getZIndex() {
      return this._zIndex;
    }
  }, {
    key: "setZIndex",
    value: function setZIndex(val) {
      this._zIndex = parseInt(val);
      //console.log(this);
      if (this._easymap != null && this._easymap.setItemZIndex != null) {
        this._easymap.setItemZIndex(this, this.getZIndex());
      }
    }
  }, {
    key: "setUpperZoomByBoundary",
    value: function setUpperZoomByBoundary() {
      this._setUpperZoomByBoundary = true;
      if (this._instance != null) {
        var features = this._instance.getSource().getFeatures();
        this._easymap._zoomByBoundary(features);
      }
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      if (!isNaN(val) == false) val = 1;
      this.opacity = parseFloat(val);
      //console.log(this);        
      this._instance.setOpacity(this.opacity);
    }
  }, {
    key: "setFeatureClick",
    value: function setFeatureClick(handler) {
      this.onFeatureSelect = handler;
    }
  }, {
    key: "setFeatureHover",
    value: function setFeatureHover(handler) {
      this._onFeatureHover = handler;
    } //updateStyleByAttribute() { }
  }, {
    key: "getType",
    value: function getType() {
      if (this._instance != null) {
        return this._instance.getType();
      }
      return null;
    }
  }, {
    key: "_setXYS",
    value: function _setXYS() {
      //把目前圖型畫的內容寫回 xy、xys
      this._xs = new Array();
      this._ys = new Array();
      this._xys = new Array();
      for (var i = 0; i < this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
        this._xs.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
        this._ys.push(this._instance.getSource().getFeatures()[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
        this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
      }
    }
  }, {
    key: "disableScaleRotate",
    value: function disableScaleRotate() {
      if (this._interaction != null) {
        this._easymap._olmap.removeInteraction(this._interaction);
        this._interaction = null;
      }
    }
  }, {
    key: "enableScaleRotate",
    value: function enableScaleRotate(obj) {
      this.disableScaleRotate();
      /*obj : 
      {              
        scale : true,
        rotate : true,
        stop: function(evt){
        }
      }
      */
      var firstPoint = false;
      var isScale = true;
      var isRotate = true;
      if (typeof obj != "undefined" && typeof obj.scale == "boolean") {
        isScale = obj.scale;
      }
      if (typeof obj != "undefined" && typeof obj.rotate == "boolean") {
        isRotate = obj.rotate;
      }
      this._interaction = new ol.interaction.Transform({
        enableRotatedTransform: false,
        /* Limit interaction inside bbox * /
        condition: function(e, features) {
          return ol.extent.containsXY([-465960, 5536486, 1001630, 6514880], e.coordinate[0], e.coordinate[1]);
        },
        /* */
        addCondition: ol.condition.shiftKeyOnly,
        // filter: function(f,l) { return f.getGeometry().getType()==='Polygon'; },
        layers: [this._instance],
        //window.data[2].easyobj._instance],
        hitTolerance: 2,
        translateFeature: true,
        //$("#translateFeature").prop('checked'),
        scale: isScale,
        //$("#scale").prop('checked'),
        rotate: isRotate,
        //$("#rotate").prop('checked'),
        keepAspectRatio: ol.condition.always,
        //$("#keepAspectRatio").prop('checked') ? ol.events.condition.always : undefined,
        translate: true,
        //$("#translate").prop('checked'),
        stretch: true //$("#stretch").prop('checked')
      });
      //map.addInteraction(interaction);
      //console.log(this);    
      this._easymap._olmap.addInteraction(this._interaction);
      // Style handles
      //setHandleStyle();
      // Events handlers
      var startangle = 0;
      var d = [0, 0];

      // Handle rotate on first point
      var firstPoint = false;
      // default center
      firstPoint = false;
      this._interaction.setCenter();
      this._interaction.on(['select'], function (e) {
        if (firstPoint && e.features && e.features.getLength()) {
          interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
        //console.log(this);
        if (this.onedit_select != null) {
          //console.log(this.onclick.toString());
          //當編輯結束以後，會觸發 onedit_select 事件
          this.onedit_select(e);
        }
      }.bind(this));
      this._interaction.on(['rotatestart', 'translatestart'], function (e) {
        // Rotation
        startangle = e.feature.get('angle') || 0;
        // Translation
        d = [0, 0];
      });
      this._interaction.on('rotating', function (e) {
        //$('#info').text("rotate: "+((e.angle*180/Math.PI -180)%360+180).toFixed(2)); 
        // Set angle attribute to be used on style !
        e.feature.set('angle', startangle - e.angle);
      });
      this._interaction.on('translating', function (e) {
        d[0] += e.delta[0];
        d[1] += e.delta[1];
        //$('#info').text("translate: "+d[0].toFixed(2)+","+d[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on('scaling', function (e) {
        //$('#info').text("scale: "+e.scale[0].toFixed(2)+","+e.scale[1].toFixed(2)); 
        if (firstPoint) {
          this._interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
        }
      });
      this._interaction.on(['rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        switch (this._type) {
          case 'dgwfs':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            try {
              for (var i = 0; i < e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                this._xs.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                this._ys.push(e.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
              }
            } catch (_unused) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "enableEditor",
    value: function enableEditor() {
      this.disableEditor();
      this._modify = new ol.interaction.Modify({
        source: this._instance.getSource()
      });
      this._easymap._olmap.addInteraction(this._modify);
      this._modify.on(['modifyend', 'rotateend', 'translateend', 'scaleend'], function (e) {
        //$('#info').text("");
        //只要停下，就把  extent、新位置寫回
        //console.log(e);
        //console.log(this);
        //window['wtf']=e;
        //window['wtff']=this;
        switch (this._type) {
          case 'dgwfs':
            this._xs = new Array();
            this._ys = new Array();
            this._xys = new Array();
            //console.log(e);
            //window['wtf']=e;   
            try {
              for (var i = 0; i < e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates.length; i += 2) {
                this._xs.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i]);
                this._ys.push(e.features.array_[0].getGeometry().clone().transform("EPSG:3857", "EPSG:4326").flatCoordinates[i + 1]);
                this._xys.push(new dgXY(this._xs[this._xs.length - 1], this._ys[this._xs.length - 1]));
              }
            } catch (_unused2) {
              console.log("Fix me ... 無法存入 _xs、_ys、_xys");
            }
            break;
        }
        if (typeof obj != "undefined" && typeof obj.stop != "undefined") {
          obj.stop(e);
        }
        if (this.onedit_end) {
          //當編輯結束以後，會觸發 oneditend 事件
          this.onedit_end(e);
        }
      }.bind(this));
    }
  }, {
    key: "disableEditor",
    value: function disableEditor() {
      if (this._modify != null) {
        this._easymap._olmap.removeInteraction(this._modify);
        this._modify = null;
      }
    }
  }]);
  return dgWFS;
}();
/* harmony default export */ const dg_dgWFS = (dgWFS);
;// CONCATENATED MODULE: ./src/dg/dgWindy.js
function dgWindy_typeof(o) { "@babel/helpers - typeof"; return dgWindy_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, dgWindy_typeof(o); }
function dgWindy_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function dgWindy_defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, dgWindy_toPropertyKey(o.key), o); } }
function dgWindy_createClass(e, r, t) { return r && dgWindy_defineProperties(e.prototype, r), t && dgWindy_defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function dgWindy_toPropertyKey(t) { var i = dgWindy_toPrimitive(t, "string"); return "symbol" == dgWindy_typeof(i) ? i : i + ""; }
function dgWindy_toPrimitive(t, r) { if ("object" != dgWindy_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != dgWindy_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var dgWindy = /*#__PURE__*/function () {
  function dgWindy(url, srs, callback) {
    dgWindy_classCallCheck(this, dgWindy);
    //url 可為：http://esri.github.io/wind-js/gfs.json
    //url 可為：https://www.wrbtycg.tw/GFS/gfs.json
    //private

    //這裡是在 addItem 後才會生效
    /*
    this.windcanvas = document.createElement('canvas');
    //this.windcanvas.id = "CursorLayer"; //不用 id
    this.windcanvas.width = 1224;
    this.windcanvas.height = 768;
    this.windcanvas.style.zIndex = 99999999999999;
    this.windcanvas.style.position = "absolute";
    this.windcanvas.style.border = "0px solid";
    this.windcanvas.style.left = "0px";
    this.windcanvas.style.top = "0px";
    this.windlayer = new ol.Overlay({
        element: this.windcanvas,
        stopEvent: false
    });
    */
    this._easymap = null;
    this._easymapClass = 'dgwindy';
    this._type = 'dgwindy';
    this._url = url;
    this._callback = callback;
    this._instance = null;
    this._async = false;
    this.windcanvas = null; //canvas
    this._isVisible = true; //default show
    this._dataSRS = "EPSG:4326"; //預設 4326
    if (srs != null) {
      this._dataSRS = srs;
    }
    this.opacity = 1;
    this._isCWBData = false; //如資料要翻轉，可設 true 中央氣象局的資料需調整
    this._isHeatmap = false; //需要熱區圖嗎
    this.windSpeed = 30.0; // 預設風速
    this.windy = null; //放 obj
    return this;
  }
  dgWindy_createClass(dgWindy, [{
    key: "setFixCWBDataRotate",
    value: function setFixCWBDataRotate(tf) {
      // 如果資料為 cwb 中央氣象局，需加入翻轉修正
      this._isCWBData = Boolean(tf);
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(val) {
      // 0~1
      if (!isNaN(val) == false) val = 1;
      this.opacity = parseFloat(val);
      //console.log(this);        
      this.windcanvas.style.opacity = this.opacity;
    }
  }, {
    key: "_playHeatmap",
    value: function _playHeatmap() {
      var tf = this._isHeatmap;
      if (tf == false && this._heatmapObj != null && this._easymap != null && this._heatmapDom != null && this._dgStaticImage != null) {
        //this._easymap.removeItem(this._heatmapObj);
        this._heatmapDom = null;
        this._easymap.removeItem(this._dgStaticImage);
        this.redraw(this);
        return;
      }
      // 要套資料
      //資料在: this.windy.params.data
      //轉成 dgWKT ?
      if (this.windy == null) return;
      var nx = this.windy.params.data[0].header.nx,
        ny = this.windy.params.data[0].header.ny,
        lo1 = this.windy.params.data[0].header.lo1,
        la1 = this.windy.params.data[0].header.la1,
        lo2 = this.windy.params.data[0].header.lo2,
        la2 = this.windy.params.data[0].header.la2;
      this._heatmapDom = document.createElement('div');
      this._heatmapDom.width = this._easymap.getWidth();
      this._heatmapDom.height = this._easymap.getHeight();
      this._heatmapDom.style.width = this._easymap.getWidth() + 'px';
      this._heatmapDom.style.height = this._easymap.getHeight() + 'px';
      this._heatmapDom.style.position = "absolute";
      this._heatmapDom.style.zIndex = -1;
      document.getElementById(this._easymap._targetId).appendChild(this._heatmapDom);
      this._heatmapObj = new myheatmap.create({
        container: this._heatmapDom
      });
      var step = 0;
      var mData = [];
      this.windy.params.data[0].data.map(function (item) {
        var d = {};
        d['x'] = this._easymap.arduino_map(step % nx, 0, nx, 0, this._heatmapDom.width);
        d['y'] = this._easymap.arduino_map(Math.floor(step / nx), 0, ny, 0, this._heatmapDom.height);
        d['value'] = item;
        //let lon =  this._easymap.arduino_map(step % nx, 0, nx, lo1, lo2);
        //let lat =  this._easymap.arduino_map(Math.floor(step / nx), 0, ny, la1, la2);
        //d['wkt'] = 'POINT(' + lon + ' ' + lat + ')';
        //wktarr.push(d);
        mData.push(d);
        step++;
      }.bind(this));
      this._heatmapObj.setData({
        max: 100.0,
        data: mData
      });
      //改用 static image 畫上
      setTimeout(function () {
        //fix lo1 
        var _lo1 = lo1,
          _lo2 = lo2;
        if (lo1 > 180 || lo2 > 180) {
          _lo1 = lo1 - 180;
          _lo2 = lo2 - 180;
        }
        var lt = new dgXY(_lo1, la1);
        var rb = new dgXY(_lo2, la2);

        //console.log(this._heatmapObj.getDataURL());
        console.log(lt);
        console.log(rb);

        //this._heatmapObj.getDataURL()
        this._dgStaticImage = new dgStaticImage(this._heatmapObj.getDataURL(), lt, rb, {
          width: this._heatmapDom.width,
          //要看 svg 的 寬
          height: this._heatmapDom.height,
          //要看 svg 的 高
          rotate: 0 //旋轉340度
        });
        this._easymap.addItem(this._dgStaticImage);
        this._dgStaticImage._instance.setOpacity(0.5);
        this.redraw(this);
      }.bind(this, lo1, la1, lo2, la2), 100);
      /*
      console.log(wktarr);
      this._wktObj = new dgWKT(wktarr, "EPSG:4326", function (e) { });
      this._easymap.addItem(this._wktObj);
      this._heatmapObj = new dgHeatmap(this._wktObj, {
          blur: 20,  //點大小
          radius: 8, //圓角程度
          field: 'value' //如果要用資料的某欄來當作數值
      });
      this._easymap.addItem(this._heatmapObj);
      */
    }
  }, {
    key: "setEnableHeatmap",
    value: function setEnableHeatmap(tf) {
      tf = Boolean(tf);
      this._isHeatmap = Boolean(tf);
      this._playHeatmap();
    }
  }, {
    key: "getOpacity",
    value: function getOpacity() {
      return this.opacity;
    }
  }, {
    key: "setVisible",
    value: function setVisible(trueFalse) {
      if (typeof trueFalse != "boolean") {
        trueFalse = true;
        this._isVisible = true;
      }
      this._instance.setVisible(trueFalse);
      this._isVisible = trueFalse;
    }
  }, {
    key: "setWindSpeed",
    value: function setWindSpeed(floatData) {
      this.windSpeed = parseFloat(floatData);
      if (this._instance != null) {
        this.windy.setWindSpeed(this.windSpeed);
        this.redraw(this);
      }
    }
  }, {
    key: "getVisible",
    value: function getVisible() {
      return this._isVisible;
    }
  }, {
    key: "_add_mapevent",
    value: function _add_mapevent() {
      //圖台加入事件
      if (this.windcanvas == null) {
        console.log("_add_mapevent windcanvas not exists...");
        return;
      }
      if (this._instance == null) {
        console.log("_add_mapevent _instance not exists...");
        return;
      }
      this._easymap.attachEvent("moveend", function (evt) {
        this.redraw(this);
      }.bind(this));
    }
  }, {
    key: "redraw",
    value: function redraw(obj) {
      if (obj.windcanvas == null) {
        console.log("redraw windcanvas not exists...");
        return;
      }
      if (obj._instance == null) {
        console.log("redraw _instance not exists...");
        return;
      }
      obj.windy.stop();
      setTimeout(function () {
        var w = obj._easymap.getWidth(),
          h = obj._easymap.getHeight();
        obj.windcanvas.width = w;
        obj.windcanvas.height = h;
        var BBox = obj._easymap.getRectBound();
        obj.windy.start([[0, 0], [w, h]], w, h, [[BBox[0], BBox[3]], [BBox[2], BBox[1]]]);
        obj._instance.setVisible(true);
      }.bind(obj), 500);
    }
  }]);
  return dgWindy;
}();
/* harmony default export */ const dg_dgWindy = (dgWindy);
;// CONCATENATED MODULE: ./src/dg/index.js
function dg_classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }























//import dgBuffer from './dgBuffer'
var dgGText = function dgGText() {
  dg_classCallCheck(this, dgGText);
};
var dgSPoint = function dgSPoint() {
  dg_classCallCheck(this, dgSPoint);
};
window.dgGText = dgGText;
window.dgPoint = dg_dgPoint;
window.dgText = dg_dgText;
window.dgSPoint = dgSPoint;
window.dg3D = dg_dg3D;
window.dgIcon = dg_dgIcon;
window.dgStaticImage = dg_dgStaticImage;
window.dgKml = dg_dgKml;
window.dgXY = dg_dgXY;
window.dgXYZ = dg_dgXYZ;
window.dgMarker = dg_dgMarker;
window.dgGMarker = dg_dgGMarker;
window.dgGStyle = dg_dgGStyle;
window.dgCurve = dg_dgCurve;
window.dgPolyline = dg_dgPolyline;
window.dgPolygon = dg_dgPolygon;
window.dgMenuFunc = dg_dgMenuFunc;
window.dgSource = dg_dgSource;
window.dgGeoJson = dg_dgGeoJson;
window.dgWKT = dg_dgWKT;
window.dgGML = dg_dgGML;
window.dgMergeVector = dg_dgMergeVector;
window.dgHeatmap = dg_dgHeatmap;
window.dgWFS = dg_dgWFS;
window.dgWindy = dg_dgWindy;
//window.dgBuffer = dgBuffer

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
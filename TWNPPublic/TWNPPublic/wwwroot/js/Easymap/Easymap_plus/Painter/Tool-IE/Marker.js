function Marker(ezmap) {
    this._map = ezmap;
    this._point = null;
    this._hisObj = null;

    this._name = '';
    this._iconPath = '';
    this._className = 'marker';

    this.setIconPath = function(iconPath, name) {
        this._iconPath = iconPath;
        this._name = name;
        this.updateStyle();
    }


    this.onclick = function(e, dgxy, callback) {

        if (this._iconPath != "") {

            this._point = dgxy;

            this._hisObj = new historyObj("圖示");
            this._hisObj.msg = this._name;
            this._hisObj.centerPT = this._calCenterPt();
            this._hisObj.setNewGuid();
            this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);


            var icon = new dgIcon(this._iconPath, ezmapplus.painter.iconSize[0], ezmapplus.painter.iconSize[1]);
            var _marke = new dgMarker(dgxy, icon, false);

            _marke.historyObj = this._hisObj;
            this._hisObj._feature = _marke;

            map.addItem(_marke);
            callback();
        }
        else {
            MM.notify.warn('請選擇圖示');
        }
    }

    this.drop = function(e, dgxy, callback) {

        if (this._iconPath != "") {

            this._point = dgxy;

            this._hisObj = new historyObj("圖示");
            this._hisObj.msg = this._name;
            this._hisObj.centerPT = this._calCenterPt();
            this._hisObj.setNewGuid();
            this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);


            var icon = new dgIcon(this._iconPath, ezmapplus.painter.iconSize[0], ezmapplus.painter.iconSize[1]);
            var _marke = new dgMarker(dgxy, icon, false);

            _marke.historyObj = this._hisObj;
            this._hisObj._feature = _marke;

            map.addItem(_marke);
            callback();
        }
        else {
            MM.notify.warn('請選擇圖示');
        }
    }

    this.updateStyle = function() {
        if (this._hisObj && this._hisObj.IsEditMode) {
            var icon = new dgIcon(this._iconPath, ezmapplus.painter.iconSize[0], ezmapplus.painter.iconSize[1]);
            map.removeItem(this._hisObj._feature);

            this._hisObj.msg = this._name;
            this._hisObj._feature._dgicon = icon;

            map.addItem(this._hisObj._feature);
            if (this._hisObj.updateHistory) {
                this._hisObj.updateHistory();
            }
        }
    }

    this._calCenterPt = function() {
        return this._point;
    }
}

function historyObj(type){
    this.guid = '';
    this.msg = '';
    this.centerPT = null;
    this.type = type;
    this._ptTool = null;

    this._feature = null;
    this.IsEditMode = false;
    this.updateHistory = null;

    this.Aling = function() { }
    this.setNewGuid = function() { this.guid = this._Getguid(); }
    this._Getguid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }
}

if (typeof Object.assign != 'function') {
    Object.assign = function (target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}
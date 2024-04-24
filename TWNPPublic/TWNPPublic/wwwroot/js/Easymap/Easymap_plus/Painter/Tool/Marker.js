class Marker {
    constructor(ezmap, ol) {
        this._map = ezmap;
        this._ol = ol;
        this._point = null;
        this._hisObj = null;

        this._name = '';
        this._iconPath = '';
        this._className = 'marker';
    }
    // 設定icon 路徑
    setIconPath(iconPath, name) {
        this._iconPath = iconPath;
        this._name = name;
        this.updateStyle();
    }
    setStyleText(name) {
        this._name = name;
        this._hisObj._feature._setText(name, { offsetY: 8 });
        this.updateStyle();
    }
    // click事件
    onclick(e, dgxy, callback) {

        if (this._iconPath != "") {

            this._point = dgxy;

            this._hisObj = new historyObj("圖示");
            this._hisObj.msg = this._name.replace('.png','').replace('.jpg','');
            this._hisObj.centerPT = this._calCenterPt();
            this._hisObj.setNewGuid();
            this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
            

            var icon = new dgIcon(this._iconPath, ezmapplus.painter.iconSize[0], ezmapplus.painter.iconSize[1]);
            var _marke = new dgMarker(dgxy, icon, true);

            _marke._setText(this._hisObj.msg, { offsetY: 8 });
            _marke.historyObj = this._hisObj;
            // this._map._items.push({
            //     items: [_marke]
            // });
            this._hisObj._feature = _marke;

            this._map.addItem(_marke);
            _marke._instance.historyObj = this._hisObj;
            callback();
        }
        else {
            MM.notify.warn('請選擇圖示');
        }
    }
    // 拖曳事件
    drop(e, dgxy, callback) {

        if (this._iconPath != "") {

            this._point = dgxy;

            this._hisObj = new historyObj("圖示");
            this._hisObj.msg = this._name;
            this._hisObj.centerPT = this._calCenterPt();
            this._hisObj.setNewGuid();
            this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);


            var icon = new dgIcon(this._iconPath, ezmapplus.painter.iconSize[0], ezmapplus.painter.iconSize[1]);
            var _marke = new dgMarker(dgxy, icon, false);

            _marke._setText(this._hisObj.msg, { offsetY: 8 });
            _marke.historyObj = this._hisObj;
            // this._map._items.push({
            //     items: [_marke]
            // });
            this._hisObj._feature = _marke;

            map.addItem(_marke);
            _marke._instance.historyObj = this._hisObj;
            callback();
        }
        else {
            MM.notify.warn('請選擇圖示');
        }
    }

    buildItem() {
        var icon = new dgIcon(this._iconPath, ezmapplus.painter.iconSize[0], ezmapplus.painter.iconSize[1]);
        var _marke = new dgMarker(this._point, icon, true);
        _marke._setText(this._name, { offsetY: 8 });
        this._map.addItem(_marke);
        this._hisObj._feature = _marke;
        _marke.historyObj = this._hisObj;
        _marke._instance.historyObj = this._hisObj;
    }

    // 更新style
    updateStyle() {
        if (this._hisObj && this._hisObj.IsEditMode) {
            var icon = new dgIcon(this._iconPath, ezmapplus.painter.iconSize[0], ezmapplus.painter.iconSize[1]);
            map.removeItem(this._hisObj._feature);
            this._hisObj.msg = this._name;
            this._hisObj._feature._dgicon = icon;
            map.addItem(this._hisObj._feature);
            this._hisObj._feature._instance.historyObj = this._hisObj;

        }
    }
    // 計算中心點
    _calCenterPt() {
        return this._point;
    }


}
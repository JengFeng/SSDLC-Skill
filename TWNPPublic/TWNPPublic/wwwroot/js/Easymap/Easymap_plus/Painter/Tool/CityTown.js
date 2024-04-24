class CityTown {
    constructor(ezmap, ol, colorLine, width, colorFill, points) {
        this._map = ezmap;
        this._ol = ol;
        this._points = points;

        this._colorLine = colorLine;
        this._width = width;
        this._colorFill = colorFill;

        this._hisObj = null;
        this._className = 'cityTown';
    }

    // 設定顏色
    setStyleColor(color, type) {
        if (type === 1) {
            this._colorLine = color;
        }
        else {
            this._colorFill = color;
        }
        this.updateStyle();
    }
    // 設定寬
    setStyleWidth(width) {
        this._width = width;
        this.updateStyle();
    }
    // 加上互動handler
    addCityTown(callback) {
        this._hisObj = new historyObj("區塊");
        this._hisObj.msg = "1234" + "平方公尺";
        this._hisObj.centerPT = this._calCenterPt();
        this._hisObj.setNewGuid();
        this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        
        var townPolygon = new dgPolygon(this._points, this._colorLine, this._colorFill, this._width);
        this._hisObj._feature = townPolygon;
        this._map.addItem(this._hisObj._feature);
        this._hisObj._feature.historyObj = this._hisObj;
        townPolygon._instance.historyObj = this._hisObj;

        callback();

        //# zoom
        MM.easymap.map = ezmapplus.painter._map;
        MM.easymap.zoomToBBOXByDgXYs(this._points);
    }

    buildItem() {
        var townPolygon = new dgPolygon(this._points, this._colorLine, this._colorFill, this._width);
        this._hisObj._feature = townPolygon;
        this._map.addItem(this._hisObj._feature);
        this._hisObj._feature.historyObj = this._hisObj;
        townPolygon._instance.historyObj = this._hisObj;
    }

    // 更新style
    updateStyle() {
        if (this._hisObj && this._hisObj.IsEditMode) {
            map.removeItem(this._hisObj._feature);
            this._hisObj._feature._strokeStyle = $('.Modules_Easymap_plus_Painter_CityTown_Color_Line').val();
            this._hisObj._feature._fillStyle = $('.Modules_Easymap_plus_Painter_CityTown_Color_Fill').val();
            this._hisObj._feature._lineWidth = $('.Modules_Easymap_plus_Painter_CityTown_Width').val();
            map.addItem(this._hisObj._feature);
            this._hisObj._feature._instance.historyObj = this._hisObj;
        }
    }

    // 計算中心點
    _calCenterPt() {

        let i, j;
        let ai, atmp = 0, xtmp = 0, ytmp = 0;
        let p = this._points;

        if ((p.length === 2) || (p.length === 3 && p[0] === p[2]))
            return new dgXY((p[1].X + p[0].X) / 2, (p[1].Y + p[0].Y) / 2);

        let n = p.length;
        for (i = n - 1, j = 0; j < n; i = j, j++) {
            ai = p[i].x * p[j].y - p[j].x * p[i].y;
            atmp += ai;
            xtmp += (p[j].x + p[i].x) * ai;
            ytmp += (p[j].y + p[i].y) * ai;
        }

        if (atmp != 0) {
            return new dgXY((xtmp / (3 * atmp)), (ytmp / (3 * atmp)));
        }

    }
    
}
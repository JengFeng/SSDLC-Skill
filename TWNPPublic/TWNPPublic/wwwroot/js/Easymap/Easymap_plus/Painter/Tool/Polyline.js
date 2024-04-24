
/**
 * 表格物件
 * */
class historyObj {
    constructor(type) {
        this.guid = '';
        this.msg = '';
        this.centerPT = null;
        this.type = type;
        this._ptTool = null;

        this._feature = null;
        this.IsEditMode = false;
        this.updateHistory = null;
        
    }

    Aling() { }
    setNewGuid() { this.guid = this._Getguid(); }   // 產生唯一碼
    _Getguid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }                                   // 取得唯一碼
}

class Polyline {

    constructor(ezmap, ol, color, width) {
        this._map = ezmap;
        this._ol = ol;
        this._points = [];

        this._color = color;
        this._width = width;

        this._hisObj = null;

        this._interactionDraw = null;
        this._Layer = null;
        this._className = 'polyline';
    }
    // 設定顏色
    setStyleColor(color, type ) {
        this._color = color;
        this.updateStyle();
    }
    // 設定寬
    setStyleWidth(width) {
        this._width = width;
        this.updateStyle();
    }
    // 加上互動handler
    addPolylineInteraction(callback) {

        var has = false;
        this._map._olmap.getInteractions().getArray().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.Draw) {
                has = true;
                return;
            }
        });

        if (!has) {
            this._interactionDraw = new this._ol.interaction.Draw({
                source: this._getSource(),
                type: 'LineString',
            });

            this._interactionDraw.on('drawstart', function (e) {
                this._interactionDraw.source_ = this._getSource();
                this._points = [];
            }.bind(this));
            this._interactionDraw.on('drawend', function (e) {

                e.feature.getGeometry().getCoordinates().forEach(function (pt) {
                    var p = ol.proj.transform(pt, 'EPSG:3857', 'EPSG:4326');
                    this._points.push(new dgXY(p[0], p[1]));
                }.bind(this));

                this._hisObj = new historyObj("線");
                this._hisObj.msg = this._map._formatLength(e.feature.getGeometry()) + "公尺";
                this._hisObj.centerPT = this._calCenterPt();
                this._hisObj.setNewGuid();
                this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
                this._hisObj._feature = e.feature;
                this._hisObj._feature.setStyle(this._getStyle());
                this._hisObj._feature.values_.description = this._hisObj.msg;
                this._hisObj._feature.values_.geomType = "Polyline";
                this._Layer.historyObj = this._hisObj;
                this._Layer._toolType = "Polyline";
                this._map._items.push({
                    items: [this._Layer]
                });


                callback();

            }.bind(this));

            this._map._olmap.addInteraction(this._interactionDraw);
        }
    }
    // 更新style
    updateStyle() {
        if (this._hisObj && this._hisObj.IsEditMode) {
            this._hisObj._feature.setStyle(this._getStyle());
        }
    }
    // 計算中心點
    _calCenterPt() {

        let i, j;
        let ai, atmp = 0, xtmp = 0, ytmp = 0;
        let p = this._points;

        if ((p.length === 2) || (p.length === 3 && p[0] === p[2]))
            return new dgXY((p[1].x + p[0].x) / 2, (p[1].y + p[0].y) / 2);

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
    // 取得ol source
    _getSource() {

        let style = this._getStyle();

        let source = new this._ol.source.Vector();

        this._Layer = new this._ol.layer.Vector({
            source: source,
            style: [style]
        });

        this._map._olmap.addLayer(this._Layer);

        return source;
    }
    // 取得ol style
    _getStyle() {
        return new this._ol.style.Style({
            stroke: new this._ol.style.Stroke({
                color: this._color,
                width: this._width
            }),
        })
    }
    
}


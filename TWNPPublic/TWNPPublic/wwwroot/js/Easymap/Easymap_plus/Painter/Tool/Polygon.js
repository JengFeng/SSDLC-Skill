class Polygon {
    constructor(ezmap, ol, colorLine, width, colorFill) {
        this._map = ezmap;
        this._ol = ol;
        this._points = [];

        this._colorLine = colorLine;
        this._width = width;
        this._colorFill = colorFill;

        this._hisObj = null;
        this._interactionDraw = null;
        this._Layer = null;
        this._className = 'polygon';
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
    addPolygonInteraction(callback) {

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
                type: 'Polygon',
            });

            this._interactionDraw.on('drawstart', function (e) {
                this._interactionDraw.source_ = this._getSource();
                this._points = [];
            }.bind(this));
            this._interactionDraw.on('drawend', function (e) {

                e.feature.getGeometry().getCoordinates()[0].forEach(function (pt) {
                    var p = ol.proj.transform(pt, 'EPSG:3857', 'EPSG:4326');
                    this._points.push(new dgXY(p[0], p[1]));
                }.bind(this));

                this._hisObj = new historyObj("區塊");
                this._hisObj.msg = this._map._formatArea(e.feature.getGeometry()) + "平方公尺";
                this._hisObj.centerPT = this._calCenterPt();
                this._hisObj.setNewGuid();
                this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
                this._hisObj._feature = e.feature;
                this._hisObj._feature.setStyle(this._getStyle());
                this._hisObj._feature.values_.description = this._hisObj.msg;
                this._hisObj._feature.values_.geomType = "Polygon";
                this._Layer.historyObj = this._hisObj;
                this._Layer._toolType = "Polygon";
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
            fill: new ol.style.Fill({
                color: this._colorFill
            }),
            stroke: new this._ol.style.Stroke({
                color: this._colorLine,
                width: this._width
            }),
        })
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
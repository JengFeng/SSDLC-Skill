class Draw {
    constructor(ezmap, ol, color, width) {
        this._map = ezmap;
        this._ol = ol;
        this._point = null;
        this._color = color;
        this._width = width;
        this._hisObj = null;

        this.centerPT = null;
        this._interactionDraw = null;
        this._Layer = null;
        this._className = 'draw';

    }
    // 設定顏色
    setStyleColor(color, type) {
        this._color = color;
        this.updateStyle();
    }
    // 設定寬
    setStyleWidth(width) {
        this._width = width;
        this.updateStyle();
    }
    // 加上互動handler
    addDrawInteraction(callback) {

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
                freehand: true
            });

            this._interactionDraw.on('drawstart', function (e) {
                this._interactionDraw.source_ = this._getSource();

                let p = ol.proj.transform(e.feature.getGeometry().getCoordinates()[0], 'EPSG:3857', 'EPSG:4326');
                this._point = new dgXY(p[0], p[1]);
                

            }.bind(this));
            this._interactionDraw.on('drawend', function (e) {

                this._hisObj = new historyObj("手繪線段");
                this._hisObj.msg = "手繪線段";
                this._hisObj.centerPT = this._calCenterPt();
                this._hisObj.setNewGuid();
                this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
                this._hisObj._feature = e.feature;
                this._hisObj._feature.setStyle(this._getStyle());
                this._hisObj._feature.values_.description = this._hisObj.msg;
                this._hisObj._feature.values_.geomType = "Draw";
                
                this._Layer.historyObj = this._hisObj;
                this._Layer._toolType = "Draw";
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
                stroke: new this._ol.style.Stroke({
                    color: this._color,
                    width: this._width
                }),
            })
    }
    // 計算中心點
    _calCenterPt() {
        return this._point;  
    }
}
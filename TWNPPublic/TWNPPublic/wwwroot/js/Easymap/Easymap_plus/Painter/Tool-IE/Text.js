class Text {
    constructor(ezmap, ol,color,text) {
        this._map = ezmap;
        this._ol = ol;
        this._point = null;
        this._hisObj = null;

        this._color = color;
        this._text = text;
        this._className = 'text';
    }

    setStyleColor(color, type) {
        this._color = color;
        this.updateStyle();
    }

    setStyleText(text) {
        this._text = text;
        this.updateStyle();
    }

    onclick(e, dgxy, callback) {

        if (this._text) {
            this._point = dgxy;

            this._hisObj = new historyObj("文字");
            this._hisObj.msg = this._text;
            this._hisObj.centerPT = this._calCenterPt();
            this._hisObj.setNewGuid();
            this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
          

            this._addTextItem(this._hisObj);
            callback();
        }
        else {
            MM.notify.warn('請輸入文字內容');
        }
    }

    _addTextItem(hisobj) {

        let source = new this._ol.source.Vector();
        let lonlat = ol.proj.fromLonLat(this._point.xy);
        let TextFeature = new ol.Feature({
            geometry: new this._ol.geom.Point(lonlat)
        });

        TextFeature.setStyle(this._getStyle());
        this._hisObj._feature = TextFeature;


        source.addFeature(TextFeature);

        let vector = new this._ol.layer.Vector({ source: source });

        this._map._olmap.addLayer(vector);

        vector.historyObj = hisobj;
        vector._toolType = "Text";
        this._map._items.push({
            items: [vector]
        })

    }

    updateStyle() {
        if (this._hisObj && this._hisObj.IsEditMode) {
            this._hisObj.msg = this._text;
            this._hisObj._feature.setStyle(this._getStyle());
            if (this._hisObj.updateHistory) {
                this._hisObj.updateHistory();
            }
        }
    }

    _calCenterPt() {
        return this._point;
    }

    _getStyle() {
        return [
            new this._ol.style.Style({
                //fill: new ol.style.Fill({
                //    color: 'rgba(255,255,255,0.4)'
                //}),
                //stroke: new ol.style.Stroke({
                //    color: '#3399CC',
                //    width: 1.25
                //}),
                text: new ol.style.Text({
                    font: '15px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: this._color }),
                    stroke: new ol.style.Stroke({
                        //color: '#fff',
                        width: 1
                    }),
                    text: this._text
                })
            })
        ];
    }

}
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
    // 設定顏色
    setStyleColor(color, type) {
        this._color = color;
        this.updateStyle();
    }
    // 設定文字
    setStyleText(text) {
        this._text = text;
        if(this._hisObj != undefined) 
            this._hisObj.msg = text;
        this.updateStyle();
    }
    // click事件
    onclick(e, dgxy, callback) {

        if (this._text) {
            this._point = dgxy;

            this._hisObj = new historyObj("文字");
            this._hisObj.msg = this._text;
            this._hisObj.centerPT = this._calCenterPt();
            this._hisObj.setNewGuid();
            this._hisObj._ptTool = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
          
            var icon = new dgIcon(ezmapplus.painter.path + 'images/transparent.png', 0, 0);
            var marker = new dgMarker(dgxy, icon, true);
            this._hisObj._feature = marker;
            this.setStyle();
            this._map.addItem(marker);
            marker.historyObj = this._hisObj;
            marker._instance.historyObj = this._hisObj;

            callback();
        }
        else {
            MM.notify.warn('請輸入文字內容');
        }
    }

    buildItem() {
        var icon = new dgIcon(ezmapplus.painter.path + 'images/transparent.png', 0, 0);
        var marker = new dgMarker(this._point, icon, true);
        marker._setText(this._text, {
            color: this._color,
            fontSize: 15,
        });
        this._map.addItem(marker);
        this._hisObj._feature = marker;
        marker.historyObj = this._hisObj;
        marker._instance.historyObj = this._hisObj;
    }

    // 設定style
    setStyle() {
        this._text = $('.Modules_Easymap_plus_Painter_Text').val();
        this._color = $('.Modules_Easymap_plus_Painter_Text_Color').val();
        var size = $('.Modules_Easymap_plus_Painter_Text_Size option:selected').val();
        this._hisObj._feature._setText(this._text, {
            color: this._color,
            fontSize: size,
        });
    }
    // 更新style
    updateStyle() {
        if (this._hisObj && this._hisObj.IsEditMode) {
            map.removeItem(this._hisObj._feature);
            this.setStyle();
            map.addItem(this._hisObj._feature);
            this._hisObj._feature._instance.historyObj = this._hisObj;
            if (this._hisObj.updateHistory) {
                this._hisObj.updateHistory();
            }
        }
    }
    // 取得點位
    _calCenterPt() {
        return this._point;
    }
    // 取得style
    _getStyle() {
        return  new this._ol.style.Style({
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
                });
    }

}
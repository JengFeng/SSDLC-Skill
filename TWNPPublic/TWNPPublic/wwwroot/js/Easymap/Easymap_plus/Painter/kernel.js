
(function (ezmapplus) {
    var painter = ezmapplus.painter;

    painter._map = null; //easymap

    painter._varable = null;//private

    //當前操作類別
    painter._drawType = '';
    //當前操作Tool
    painter._eventTool = null;
    //歷史清單
    painter._historyTable = null;
    painter._historyList = [];
    // click interaction
    painter._dblClickInteraction = null;
    painter._markerSelectType = null;
    painter._markerdivBox = null;

    //# public 
    painter.start = function () {

        var colorFunction = function () {
            $(this).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                format: $(this).attr('data-format') || 'hex',
                keywords: $(this).attr('data-keywords') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom',
                swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
                change: function (hex, opacity) {
                    var val;
                    val = hex ? hex : 'transparent';
                    ezmapplus.painter.setStyleColor(val, 1);
                },
                theme: 'default'
            });
        }

        // 顏色選擇器
        $('.Modules_Easymap_plus_Painter_Polygon_Color_Line').each(colorFunction);
        $('.Modules_Easymap_plus_Painter_PolyLine_Color_Line').each(colorFunction);
        $('.Modules_Easymap_plus_Painter_CityTown_Color_Line').each(colorFunction);
        $('.Modules_Easymap_plus_Painter_Draw_Color').each(colorFunction);
        $('.Modules_Easymap_plus_Painter_Text_Color').each(colorFunction);

        //text 改變大小
        $('.Modules_Easymap_plus_Painter_Text_Size').change(function () { ezmapplus.painter.update(); });

        // 顏色選擇器(fill)
        $('.Modules_Easymap_plus_Painter_Polygon_Color_Fill,.Modules_Easymap_plus_Painter_CityTown_Color_Fill').each(function () {
            $(this).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                format: $(this).attr('data-format') || 'hex',
                keywords: $(this).attr('data-keywords') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom',
                swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
                change: function (hex, opacity) {
                    var val;
                    val = hex ? hex : 'transparent';
                    ezmapplus.painter.setStyleColor(val, 2);
                },
                theme: 'default'
            });

        });

        //ajax example
        $.ajax({
            url: painter.path + "files.json",//"sPainter.ashx?f=get_layers",
            type: 'get',
            crossDomain: true,
            dataType: 'json',
            timeout: 30 * 1000,
            contentType: 'application/json; charset=utf-8',
            success: function (r) {

                r.forEach(function (e) {
                    var option = document.createElement("option");
                    option.text = e.Directorie;
                    option.value = e.Directorie;

                    painter._markerSelectType.add(option);
                });

                painter._markerSelectType.onchange = function (event) {

                    var files = '';
                    r.forEach(function (e) {
                        if (e.Directorie === event.target.value) {
                            files = e.Files;
                        }
                    });

                    var iconHtml = '';

                    for (var i = 0; i < files.length; i++) {
                        var e = files[i];
                        var div = document.createElement("div");
                        var img = document.createElement("img");
                        var span = document.createElement("span");
                        var spanTit = document.createElement("span");

                        img.src = ezmapplus.root + e.path.replace('http', 'https');
                        img.name = e.name;
                        img.alt = "";
                        img.className = 'Ezmap_Marker_icon_css';
                        img.draggable = true;

                        span.appendChild(img)
                        span.className = "iconImg";
                        spanTit.className = "iconTitle";
                        spanTit.innerText = e.name;

                        div.className = "icon";
                        div.appendChild(span);
                        //取消文字顯示
                        //div.appendChild(spanTit); 

                        iconHtml += div.outerHTML;
                    }

                    painter._markerdivBox.innerHTML = iconHtml;

                    $(".Ezmap_Marker_icon_css").on('dragstart', function () {
                        if (painter._eventTool == null) {
                            painter._drawType = "Marker";
                            _InteractionIni(true);
                            painter._eventTool = new Marker(painter._map);
                        }

                        if (painter._drawType === "Marker" ||
                            painter._drawType === "Edit") {
                            painter._eventTool.setIconPath(this.src, this.name);
                        }
                    });

                    $(".Ezmap_Marker_icon_css").click(function () {
                        $(this).siblings().removeClass("active");
                        $(this).addClass("active");

                        if (painter._eventTool == null) {
                            painter._drawType = "Marker";
                            _InteractionIni(true);
                            painter._eventTool = new Marker(painter._map);
                        }

                        if (painter._drawType === "Marker" ||
                            painter._drawType === "Edit") {
                            painter._eventTool.setIconPath(this.src, this.name);
                        }
                    });
                };

            },
            error: function () {

            }
        });
    };

    //# private
    painter._privateFunction = function () {

    }
    //# 綁定
    painter.bindMarker = function (selector, selectType, divBox) {
        painter._markerSelectType = document.getElementById(selectType);

        painter._markerdivBox = document.getElementById(divBox);

        document.getElementById(selector).onclick = function () {

            //reset table edit
            painter._resetBtnEdit();

            painter._drawType = "Marker";
            _InteractionIni();
            painter._eventTool = new Marker(painter._map);
        }

    }
    painter.bindPolyline = function (selector) {

        document.getElementById(selector).onclick = function () {

            //reset table edit
            painter._resetBtnEdit();

            painter._drawType = "Polyline";
            _InteractionIni();
            painter._eventTool =
                new Polyline(
                    painter._map,
                    ol,
                    $('.Modules_Easymap_plus_Painter_PolyLine_Color_Line').val(),
                    $('.Modules_Easymap_plus_Painter_PolyLine_Width').val()
                );
            painter._eventTool.addPolylineInteraction(painter._AddHistoryTable);
        }
    }
    painter.bindPolygon = function (selector) {
        document.getElementById(selector).onclick = function () {
            //reset table edit
            painter._resetBtnEdit();

            painter._drawType = "Polygon";
            _InteractionIni();
            painter._eventTool =
                new Polygon(
                    painter._map,
                    ol,
                    $('.Modules_Easymap_plus_Painter_Polygon_Color_Line').val(),
                    $('.Modules_Easymap_plus_Painter_Polygon_Width').val(),
                    $('.Modules_Easymap_plus_Painter_Polygon_Color_Fill').val()
                );
            painter._eventTool.addPolygonInteraction(painter._AddHistoryTable);
        }
    }
    painter.bindText = function (selector, color, text) {
        document.getElementById(selector).onclick = function () {
            //reset table edit
            painter._resetBtnEdit();

            painter._drawType = "Text";
            _InteractionIni();
            painter._eventTool =
                new Text(
                    painter._map,
                    ol,
                    $('.Modules_Easymap_plus_Painter_Text_Color').val(),
                    $('.Modules_Easymap_plus_Painter_Text').val()
                );
        }
    }
    painter.bindDraw = function (selector, color, width) {
        document.getElementById(selector).onclick = function () {

            //reset table edit
            painter._resetBtnEdit();

            painter._drawType = "Draw";
            _InteractionIni();

            painter._eventTool =
                new Draw(painter._map,
                    ol,
                    $('.Modules_Easymap_plus_Painter_Draw_Color').val(),
                    $('.Modules_Easymap_plus_Painter_Draw_Width').val()
                );
            painter._eventTool.addDrawInteraction(painter._AddHistoryTable);
        }
    }
    painter.bindCityTown = function (selector, citySelect, townSelect, btnCity, btnTown) {
        citySelect = '#' + citySelect;
        townSelect = '#' + townSelect;
        btnCity = '#' + btnCity;
        btnTown = '#' + btnTown;

        var allCity, allTown, cityInfo, townInfo;
        var city = '';
        var town = '';

        $.getJSON(painter.path+'town.json', function (data) {
            allTown = data.features;
        });
        $.getJSON(painter.path +'city.json', function (data) {
            allCity = data.features;
            for (var i = 0; i < data.features.length; i++) {
                var cityName = data.features[i].properties.COUNTYNAME;
                $(citySelect).append("<option value='" + cityName + "'>" + cityName + "</option>");
            }
        });

        //選取城市綁定鄉區
        $(citySelect).change(function () {
            city = $(citySelect).val();
            $(townSelect).empty();
            $(townSelect).append("<option value=''>" + "請選擇鄉鎮" + "</option>");
            if (city == '') return;

            $.each(allCity, function (index, value) {
                if (value.properties.COUNTYNAME === city) {
                    cityInfo = value.geometry.coordinates[0];
                }
            });

            $.each(allTown, function (index, value) {
                if (value.properties.COUNTYNAME === city) {
                    $(townSelect).append("<option value='" + value.properties.TOWNNAME + "'>" + value.properties.TOWNNAME + "</option>");
                }
            });

        });
        //選取鄉區產生區塊和鄉區資訊
        $(townSelect).change(function () {
            if (city == '') return;
            city = $(citySelect).val();
            town = $(townSelect).val();
            if (town == '') return;

            $.each(allTown, function (index, value) {
                if (value.properties.COUNTYNAME === city && value.properties.TOWNNAME === town) {
                    townInfo = value.geometry.coordinates[0];
                }
            });
        });

        $(btnCity).click(function () {
            if (city == '') return;
            
            paintRegion(cityInfo[0]);
        });

        $(btnTown).click(function () {
            if (town == '') return;
            
            paintRegion(townInfo[0])
        }); 

        var paintRegion = function(data) {
            var points = [];
            $.each(data, function (index, value) {
                points.push(new dgXY(value[0], value[1]));
            });
            
            painter._resetBtnEdit();
            painter._drawType = "CityTown";
            _InteractionIni();
            painter._eventTool =
                new CityTown(
                    painter._map,
                    ol,
                    $('.Modules_Easymap_plus_Painter_CityTown_Color_Line').val(),
                    $('.Modules_Easymap_plus_Painter_CityTown_Width').val(),
                    $('.Modules_Easymap_plus_Painter_CityTown_Color_Fill').val(),
                    points
                );
            painter._eventTool.addCityTown(painter._AddHistoryTable);
        };
    }
    
    // 互動事件
    _InteractionIni = function () {



        if (painter._drawType !== "Marker") {
            painter._markerSelectType.selectedIndex = 0;
            //painter._markerdivBox.innerHTML = "";
        }
        if (MM.isIE() == true) {
        } else {
            painter._map._olmap.getInteractions().getArray().forEach(function (interaction) {
                if (interaction instanceof ol.interaction.Draw) {
                    painter._map._olmap.removeInteraction(interaction);
                }
            }.bind(this));
        }


    }.bind(this);

    //綁定歷史清單
    painter.bindHistoryTable = function (selector) {
        painter._historyTable = document.getElementById(selector);
        painter._addRowData(['編號', '型態', '說明', '顯示', '定位', '刪除', '編輯'], true);
    }
    // 移除現在使用的tool
    painter.RemoveTool = function () {
        painter._eventTool = null;
        painter._drawType = "";
        painter._resetBtnEdit();
        _InteractionIni();
    }
    //加入新的清單
    painter._AddHistoryTable = function () {

        //map.mm.items
        this.map._items.forEach(function (datas, index) {
            datas.items.forEach(function (data) {

                if (data.historyObj !== null &&
                    data.historyObj !== undefined) {
                    
                    let isShow = false;

                    //檢查是否已顯示在畫面
                    painter._historyList.forEach(function (d) {
                        if (d.historyObj.guid === data.historyObj.guid) {
                            isShow = true;
                            return;
                        }
                    });

                    if (!isShow) {
                        painter._addRowDataByTool(data, index+1);
                        //加入已顯示清單
                        painter._historyList.push(data);
                    }
                }
            });
        });

    }
    //# 匯出
    painter.mapExport = function () {
        //# js-native的匯出 站時沒用
        if (true) {
            var srcCanvas = document.getElementById(painter.map._targetId);
            srcCanvas = $('#map canvas')[0];
            var destinationCanvas = document.createElement("canvas");
            destinationCanvas.width = srcCanvas.width;
            destinationCanvas.height = srcCanvas.height;

            var destCtx = destinationCanvas.getContext('2d');

            //create a rectangle with the desired color
            destCtx.fillStyle = "#ccc";
            destCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height);

            //draw the original canvas onto the destination canvas
            destCtx.drawImage(srcCanvas, 0, 0);

            //finally use the destinationCanvas.toDataURL() method to get the desired output;
            var dataUrl = destinationCanvas.toDataURL();

            if (document.getElementById('easymap-plus-painter-image-download') == null) {
                var a = document.createElement('a');
                a.id = 'easymap-plus-painter-image-download';
                a.download = 'map.png';
                document.body.append(a);
            }
            link = document.getElementById('easymap-plus-painter-image-download');

            //link.href = dataUrl;
            link.href = srcCanvas.toDataURL("image/jpeg");
            link.click();
        }
        return;
        painter.map._olmap.once('rendercomplete', function (event) {

            var node = document.getElementById(painter.map._targetId);

            domtoimage.toPng(node)
                .then(function (dataUrl) {

                    var link = document.getElementById('easymap-plus-painter-image-download');
                    if (link == null) {
                        var a = document.createElement('a');
                        a.id = 'easymap-plus-painter-image-download';
                        a.download = 'map.png';
                        document.body.append(a);
                        link = document.getElementById('easymap-plus-painter-image-download');
                    }
                    link.href = dataUrl;
                    link.click();
                })
                .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });

        });
        painter.map._olmap.renderSync();
    }
    //匯出kml
    painter.mapExportKml = function () {
        var features = [];
        var styles = [];
        var layers = painter.map._olmap.getLayers().getArray();
        for (var i = 1; i < layers.length; i++) {
            var layer = layers[i];
            var feature = layer.getSource().getFeatures()[0];

            if (feature == undefined) continue;
            if(typeof feature.style_ === 'function')
                feature.setStyle(feature.style_);
            else
                feature.setStyle(Easymap._getOlStyleFromStyleFunction(feature.style_));
            feature.values_.geomType = layer.historyObj._ptTool._className;
            //layer.getSource().forEachFeature(function (feature) {

            //    style = new ol.style.Style({
            //        I don't know how to get the color of your kml to fill each room
            //        fill: new ol.style.Fill({ color: '#ee0' }),
            //        stroke: new ol.style.Stroke({ color: '#0d0' }),
            //        text: new ol.style.Text({
            //            text: feature.get('name'),
            //            font: '12px Calibri,sans-serif',
            //            fill: new ol.style.Fill({ color: '#000' }),
            //            stroke: new ol.style.Stroke({
            //                color: '#fff', width: 2
            //            })
            //        })
            //    });
            //    feature.setStyle(style);
            //});
            if (feature != null) {
                features.push(feature);
            }
        }
        if (features.length > 0) {
            var format = new ol.format.KML({
                showPointNames: true,
                writeStyles: true,
            });
            var kml = format.writeFeatures(features, {featureProjection: 'EPSG:3857'});
            var filename = "KML.kml";
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(kml));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
        else {
            alert("請在地圖上標註項目")
        }
    }
    // 匯入KML
    painter.mapImportKML = function () {
        var selectedFile;
        var element = document.createElement('input');
        element.setAttribute('type', 'file');
        element.setAttribute('id', 'inputKML');
        element.setAttribute('accept', '.kml');
        element.onchange = function () {
            selectedFile = this.files[0];
            reader.readAsText(selectedFile);
        }
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            
            var kmlContent = event.target.result;
            kmlContent = kmlContent.replace('xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"', '');
            
            let formatKml = new ol.format.KML({
                extractStyles: true,
                showPointNames: true,
            });
            //# 產生features
            let features = formatKml.readFeatures(kmlContent,
                {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
            
            // 取出 feature 建立幾何物件與圖層向量
            for (var idx = 0; idx < features.length; idx++) {
                var style = features[idx].getStyle()(features[idx]);
                let vectorsource = new ol.source.Vector({
                    format: formatKml,
                    features: [features[idx]]
                });
                
                var kml = new ol.layer.Vector({
                    source: vectorsource,
                    style: style
                });
                var geometryObj;
                kml.historyObj = new historyObj(features[idx].getGeometry().getType());
                kml.historyObj.setNewGuid();
                kml.historyObj._feature = features[idx];
                var coordinates = features[idx].getGeometry().transform('EPSG:3857', 'EPSG:4326').getCoordinates();
                try {
                    switch(kml.historyObj.type) {
                        case "Polygon":
                            kml.historyObj.type = '區塊';
                            var points = [];
                            for(var i = 0; i < coordinates[0].length-1; i++) {
                                points.push(new dgXY(coordinates[0][i][0], coordinates[0][i][1]));
                            }
                            if (features[idx].values_.geomType == "cityTown") {
                                kml._toolType = 'CityTown';
                                geometryObj = new CityTown(painter._map, ol, style[0].stroke_.color_, style[0].stroke_.width, style[0].fill_.color_, points);
                                geometryObj._hisObj = kml.historyObj;
                                geometryObj.buildItem();
                            } else {
                                kml._toolType = 'Polygon';
                                geometryObj = new Polygon(painter._map, ol, style[0].stroke_.color_, style[0].stroke_.width, style[0].fill_.color_);
                                geometryObj._points = points;
                            }
                            geometryObj._hisObj = kml.historyObj;
                            geometryObj._hisObj.msg = features[idx].values_.description ? features[idx].values_.description: "";
                            break;
                        case "LineString":
                            if (features[idx].values_.geomType == "draw") {
                                kml._toolType = 'Draw';
                                kml.historyObj.type = '線';
                                geometryObj = new Draw(painter._map, ol, style[0].stroke_.color_, style[0].stroke_.width);
                                geometryObj._point = new dgXY(coordinates[0][0], coordinates[0][1]);
                            } else {
                                kml._toolType = 'Polyline';
                                kml.historyObj.type = '手繪線段';
                                geometryObj = new Polyline(painter._map, ol, style[0].stroke_.color_, style[0].stroke_.width);
                                var points = [];
                                for(var i = 0; i < coordinates.length; i++) {
                                    points.push(new dgXY(coordinates[i][0], coordinates[i][1]));
                                }
                                geometryObj._points = points;
                            }
                            geometryObj._hisObj = kml.historyObj;
                            geometryObj._hisObj.msg = features[idx].values_.description ? features[idx].values_.description: "";
                            break;
                        case "Point":
                            if (features[idx].values_.geomType == "text") {
                                kml._toolType = 'Text';
                                kml.historyObj.type = '文字';
                                geometryObj = new Text(painter._map, ol, style[0].text_.fill_.color_, style[1].text_.text_);
                            } else {
                                kml._toolType = 'Marker';
                                kml.historyObj.type = '圖示';
                                geometryObj = new Marker(painter._map, ol);
                                geometryObj._iconPath = style[0].image_.iconImage_.src_;
                                geometryObj._name = style[1].text_.text_;
                            }
                            geometryObj._hisObj = kml.historyObj;
                            geometryObj._hisObj.msg = style[1].text_.text_;
                            geometryObj._point = new dgXY(coordinates[0], coordinates[1]);
                            geometryObj.buildItem();
                            break;
                    }
                    features[idx].getGeometry().transform('EPSG:4326', 'EPSG:3857');
                    kml.historyObj.centerPT = geometryObj._calCenterPt();
                    kml.historyObj._ptTool = geometryObj;
                    if(kml._toolType != 'Text' && kml._toolType != 'Marker' && kml._toolType != 'CityTown') {
                        geometryObj._feature = features[idx];
                        painter._map._items.push({
                            items: [kml]
                        });
                        painter.map._olmap.addLayer(kml);
                    } 
                    painter._AddHistoryTable();

                } catch(err) {
                    console.log(err);
                }
            }
        });
    }
    //# 清除所有marker
    painter.clear = function () {
        painter.ClearAllMakrer();
    }

    painter.ClearAllMakrer = function () {
        painter._clearTabla();
        for (var i = 0; i < painter._historyList.length; i++) {
            var Tool = painter._historyList[i];
            if (Tool._toolType === 'Text' ||
                Tool._toolType === 'Draw' ||
                Tool._toolType === 'Polyline' ||
                Tool._toolType === 'Polygon' ||
                Tool._toolType === 'CityTown') {
                painter.map._olmap.removeLayer(Tool);
            }
            else {
                painter._map.removeItem(Tool);
            }

        }
        painter._historyList = [];
        painter._map._items = [];
    }
    //加入歷史資料
    painter._addRowData = function (arrayData, IsFirst) {
        if (IsFirst == undefined) IsFirst = false;
        if (IsFirst) {
            let row = painter._historyTable.insertRow(0);
            arrayData.forEach(function (data, index) {
                let cell = row.insertCell(index);
                cell.innerHTML = data;
            });
        } else {

            let row = painter._historyTable.insertRow(-1);
            arrayData.forEach(function (data, index) {
                let cell = row.insertCell(index);
                if (typeof (data) === 'string' || typeof (data) === 'number') {
                    cell.innerHTML = data;
                }
                else {
                    cell.appendChild(data);
                }
            });
        }


    }
    // 修改:文字
    painter._textChange = function (input) {
        var markerid = $(input).attr('marker-id');
        for (var i = 0; i < ezmapplus.painter._historyList.length; i++) {
            var item = ezmapplus.painter._historyList[i];
            if (item._id == markerid && item.historyObj.IsEditMode) {
                item.historyObj._ptTool.setStyleText(input.value);
            }
        }
        painter._clearTabla();
        painter._historyList.forEach(function (e, index) {
            painter._addRowDataByTool(e, index + 1);
        });
    }
    // 加入歷史table
    painter._addRowDataByTool = function (Tool, index) {
        var msg = '';
        if (Tool.historyObj.type == '圖示') {
            msg = '<input marker-id="' + Tool._id + '" type="input" value="' + Tool.historyObj.msg + '" onblur="ezmapplus.painter._textChange(this);"/>';
        } else {
            msg = Tool.historyObj.msg;
        }
        painter._addRowData([
            index,
            Tool.historyObj.type,
            msg,
            _getBtnEye(Tool),
            _getBtnLoaction(Tool),
            _getBtnDelete(Tool),
            _getBtnEdit(Tool)
        ]);
    }
    // 清空表格
    painter._clearTabla = function () {
        let table = painter._historyTable;

        for (var i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
    }
    //set Style
    painter.setStyleColor = function (color, type) {
        if (this._eventTool && this._eventTool.setStyleColor) {
            this._eventTool.setStyleColor(color, type);
        }
    }
    // 修改: 所有tool
    painter.update = function () {
        if (this._eventTool && this._eventTool.updateStyle) {
            this._eventTool.updateStyle();
        }
    }
    // 設定寬
    painter.setStyleWidth = function (width) {
        if (this._eventTool && this._eventTool.setStyleWidth) {
            this._eventTool.setStyleWidth(width);
        }
    }
    // 設定文字
    painter.setStyleText = function (text) {
        if (this._eventTool && this._eventTool.setStyleText) {
            this._eventTool.setStyleText(text);
        }
    }

    //地圖初始化
    painter.bindMap = function (Ezmap) {
        this._map = Ezmap;
        this._map.attachEvent('singleclick', function (e, dgxy) {

            if (this._eventTool !== undefined &&
                this._eventTool !== null &&
                this._drawType !== "Edit") {
                if (this._eventTool.onclick !== undefined) {
                    this._eventTool.onclick(e, dgxy, this._AddHistoryTable);
                }
            }

        }.bind(this));

        this._map.attachEvent('dblclick', function (e, dgxy) {

            if (this._eventTool !== undefined &&
                this._eventTool !== null &&
                this._drawType !== "Edit") {
                if (this._eventTool.ondbclick !== undefined) {
                    this._eventTool.ondbclick(e, dgxy, this._AddHistoryTable);
                }
            }

        }.bind(this));

        $('#' + map._targetId).on("dragover", function (e) {
            e.preventDefault();
        });

        $('#' + map._targetId).on("drop", function (e) {
            e.preventDefault();

            if (this._eventTool !== undefined &&
                this._eventTool !== null &&
                this._drawType !== "Edit") {
                if (this._eventTool.drop !== undefined) {

                    var lonlat = map.revXY(e.offsetX, e.offsetY);
                    var dgxy = new dgXY(lonlat.x, lonlat.y);

                    this._eventTool.drop(e, dgxy, this._AddHistoryTable);
                }
            }
        }.bind(this));

    }
    // 產生按鈕
    _getBtnLoaction = function (Tool) {

        let btnLocation = document.createElement('a');
        let LoactionI = document.createElement('i');
        btnLocation.className = 'drawing-btn btn-location';
        btnLocation.href = "javascritp:;";
        LoactionI.className = "ion-ios-location";
        btnLocation.appendChild(LoactionI);
        btnLocation.onclick = function () {
            painter._eventTool = null;
            painter._map.panTo(Tool.historyObj.centerPT);
        };

        return btnLocation;
    }
    _getBtnDelete = function (Tool) {

        let btnDelete = document.createElement('a');
        let DeleteI = document.createElement('i');
        btnDelete.className = 'drawing-btn btn-delete';
        btnDelete.href = "javascritp:;";
        DeleteI.className = "ion-android-delete";
        btnDelete.appendChild(DeleteI);
        btnDelete.onclick = function () {
            painter._eventTool = null;
            painter._clearTabla();

            for (var i = 0; i < painter._historyList.length; i++) {
                if (painter._historyList[i] === Tool) {
                    painter._historyList.splice(i, 1);
                }
            }

            painter._historyList.forEach(function (e, index) {
                painter._addRowDataByTool(e, index + 1);
            });

            if (Tool._toolType === 'Text' ||
                Tool._toolType === 'Draw' ||
                Tool._toolType === 'Polyline' ||
                Tool._toolType === 'Polygon') {
                painter.map._olmap.removeLayer(Tool);

                for (var i = 0; i < painter._map._items.length; i++) {
                    if (painter._map._items[i].items[0] === Tool) {
                        painter._map._items.splice(i, 1);
                    }
                }
            }
            else {
                painter._map.removeItem(Tool);
            }
        };

        return btnDelete;
    }
    _getBtnEye = function (Tool) {

        let btnEye = document.createElement('a');
        let EyeI = document.createElement('i');
        btnEye.className = 'drawing-btn btn-eye open';
        btnEye.href = "javascritp:;";
        EyeI.className = "ion-eye";
        btnEye.appendChild(EyeI);
        btnEye.onclick = function () {
            _toggleClass(this, 'open');
            painter._eventTool = null;
            if (_hasClass(this, 'open')) {
                _removeClass(this.getElementsByTagName('i')[0], 'ion-eye-disabled');

                //需而外處理
                if (Tool._toolType === 'Text' ||
                    Tool._toolType === 'Draw' ||
                    Tool._toolType === 'Polyline' ||
                    Tool._toolType === 'Polygon' ||
                    Tool._toolType === 'CityTown') {
                    painter.map._olmap.addLayer(Tool);
                }
                else {
                    painter._map.addItem(Tool);
                }
            }
            else {
                _addClass(this.getElementsByTagName('i')[0], 'ion-eye-disabled');

                //需而外處理
                if (Tool._toolType === 'Text' ||
                    Tool._toolType === 'Draw' ||
                    Tool._toolType === 'Polyline' ||
                    Tool._toolType === 'Polygon' ||
                    Tool._toolType === 'CityTown') {
                    painter.map._olmap.removeLayer(Tool);
                }
                else {
                    painter._map.removeItem(Tool);
                }
            }
        };

        return btnEye;
    }
    //# reset table edit status
    painter._resetBtnEdit = function () {
        $('.ezmapplus-painter-table-edit').each(function () {
            this.innerText = '編輯';
            this._isEdit = false;
        });
    }
    _getBtnEdit = function (Tool) {
        let btnEdit = document.createElement('a');
        btnEdit.href = "javascritp:;";
        btnEdit.innerText = Tool.historyObj.IsEditMode ? '編輯中' : '編輯';
        btnEdit._isEdit = Tool.historyObj.IsEditMode ? true : false;
        btnEdit._id = Tool._id;
        btnEdit.className = 'ezmapplus-painter-table-edit';
        btnEdit.onclick = function () {

            if (this._isEdit == false) {

                //reset all
                Tool.historyObj.IsEditMode = true;
                painter._eventTool = Tool.historyObj._ptTool;
                painter._resetBtnEdit();

                this._isEdit = true;
                this.innerText = "編輯中";

            } else {
                this.innerText = "編輯";
                this._isEdit = false;
                painter._clearTabla();
                painter._historyList.forEach(function (e, index) {
                    painter._addRowDataByTool(e, index + 1);
                });
                Tool.historyObj.IsEditMode = false;
                painter.RemoveTool();
            }
            
            painter._drawType = "Edit";
            _InteractionIni();
            // painter._eventTool = Tool.historyObj._ptTool;
            // painter._eventTool._hisObj.IsEditMode = true;
            // painter._eventTool._hisObj.updateHistory = function () {
            //     return;
            //     painter._clearTabla();
            //     painter._historyList.forEach(function (e, index) {
            //         painter._addRowDataByTool(e, index + 1);
            //     });
            // }
            //# 選擇編輯按鈕callback
            if (ezmapplus.painter.onSelectEdit != null) {
                var classname = Tool.historyObj._ptTool._className;
                ezmapplus.painter.onSelectEdit.call(classname, classname);
            }
        }

        return btnEdit;
    }
    // utitles ===================================
    _toggleClass = function (obj, cls) {
        if (_hasClass(obj, cls)) {
            _removeClass(obj, cls);
        }
        else {
            _addClass(obj, cls);
        }
    };
    _hasClass = function (obj, cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
    _addClass = function (obj, cls) {
        if (!this._hasClass(obj, cls))
            obj.className += " " + cls;
    }
    _removeClass = function (obj, cls) {
        if (_hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }

})(ezmapplus);
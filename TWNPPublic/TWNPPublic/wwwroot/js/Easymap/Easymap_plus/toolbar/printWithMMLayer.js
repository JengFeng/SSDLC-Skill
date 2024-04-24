ezmapplus.toolbar.printWithMMLayer = {};
(function (ezmapplus) {
    
    ezmapplus.toolbar.printWithMMLayer.name = 'printWithMMLayer';
    ezmapplus.toolbar.printWithMMLayer.on = true;
	ezmapplus.toolbar.printWithMMLayer.img_chk_interval = null;
    ezmapplus.toolbar.printWithMMLayer.selectStyle = true;
    ezmapplus.toolbar.printWithMMLayer.defaultOptions = true;
    ezmapplus.toolbar.printWithMMLayer.doc = new jspdf.jsPDF();
    ezmapplus.toolbar.printWithMMLayer.start = function () {     
        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.printWithMMLayer.name);
        var div = ezmapplus.toolbar.map.createDiv('ezmapplus_toolbar_printWithMMLayer', { x: p[0], y: p[1] });
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/print.gif'>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "輸出PDF");

        var mapWidth = ezmapplus.toolbar.map.getWidth();
        var mapHeight = ezmapplus.toolbar.map.getHeight();

        //# 列印方向
        if(ezmapplus.toolbar.printWithMMLayer.selectStyle){
            renderBtnPrint(mapWidth, mapHeight);
        }
        else{
            $(div).bind("click touchstart", function () {
                ezmapplus.toolbar.printWithMMLayer.run('horizontal');
            });
        }

        function renderBtnPrint(mapWidth, mapHeight){
            options = '<input type="checkbox" checked id="chkScale"/ ><span>比例尺</span><input type="checkbox" checked id="chkDatetime"/ ><span>日期</span>\
                        <input type="checkbox" checked id="chkCompass"/ ><span>指北針</span><input type="checkbox" checked id="chkLegend"/ ><span>圖例</span><br/>';
            divHtml = '<div style="text-align:center;width:300 px;"> \
                           <span>輸出PDF</span> <br /> ' + (ezmapplus.toolbar.printWithMMLayer.defaultOptions? '' : options) + 
                          '<input type="text" id="PDFTitle" placeholder="你可以在這輸入PDF標題" style="margin:5px;" />\
                           <div style="display: inline-block; margin: 2px;">\
                                <input type="button" id="btnPrint1" onclick="ezmapplus.toolbar.printWithMMLayer.setBtnPrint({0});" value="輸出" />&nbsp; \
                            </div>\
                        </div>';
                            // <input type="button" id="btnPrint2" onclick="ezmapplus.toolbar.printWithMMLayer.setBtnPrint({1});" value="橫式" /> \
            divHtml = divHtml.replace('{0}', "'vertical'");
            // divHtml = divHtml.replace('{1}', "'horizontal'");
            MM.tip.click('.easymap_plus_measure_tooltip[data-powertip=輸出PDF]', divHtml, 'bottom center');
        }
    }

    //# 設定列印方向按鈕功能
    ezmapplus.toolbar.printWithMMLayer.setBtnPrint = function(printStyle){
        if(printStyle =='vertical'){
            ezmapplus.toolbar.printWithMMLayer.run('vertical');
        }
        else if(printStyle =='horizontal'){
            ezmapplus.toolbar.printWithMMLayer.run('horizontal');
        }
    }
    //# 執行列印
    ezmapplus.toolbar.printWithMMLayer.run = function(printStyle){
        
        function getImageDataURL(path, borderSize=1, rotate=0) {
            return new Promise(function(resolve, reject){
                var image = new Image();
                
                image.onload = function() {
                    var canvasTemp = document.createElement('canvas');
                    canvasTemp.setAttribute('height', image.height+borderSize*2);
                    canvasTemp.setAttribute('width', image.width+borderSize*2);
                    var ctx = canvasTemp.getContext("2d");

                    if (borderSize > 0) {
                        ctx.fillStyle = "black";
                        ctx.fillRect(0, 0, canvasTemp.width-borderSize, borderSize);
                        ctx.fillRect(borderSize, canvasTemp.height-borderSize, canvasTemp.width-borderSize, borderSize);
                        ctx.fillRect(canvasTemp.width-borderSize, 0, borderSize, canvasTemp.height-borderSize);
                        ctx.fillRect(0, borderSize, borderSize, canvasTemp.height-borderSize);
                    }

                    if (rotate != 0) {
                        ctx.translate(canvasTemp.width/2, canvasTemp.height/2);
                        ctx.rotate(rotate);
                        ctx.translate(-canvasTemp.width/2, -canvasTemp.height/2);
                    }

                    ctx.drawImage(image, borderSize, borderSize);
                    resolve([canvasTemp.toDataURL("image/png"), canvasTemp.width, canvasTemp.height]);
                }

                image.onerror = function() {
                    reject(path);
                }

                image.src = path;
            });
        }

        function transScale(scale) {
            switch(scale) {
                case 1:
                    return "5000 公里"; 
                case 2:
                    return "5000 公里"; 
                case 3:
                    return "2000 公里"; 
                case 4:
                    return "1000 公里"; 
                case 5:
                    return " 500 公里"; 
                case 6:
                    return " 200 公里"; 
                case 7:
                    return " 100 公里"; 
                case 8:
                    return "  50 公里"; 
                case 9:
                    return "  20 公里"; 
                case 10:
                    return "  10 公里"; 
                case 11:
                    return "   5 公里"; 
                case 12:
                    return "   5 公里"; 
                case 13:
                    return "   2 公里"; 
                case 14:
                    return "1000 公尺"; 
                case 15:
                    return " 500 公尺"; 
                case 16:
                    return " 200 公尺"; 
                case 17:
                    return " 100 公尺"; 
                case 18:
                    return "  50 公尺"; 
                case 19:
                    return "  20 公尺"; 
                case 20:
                    return "  10 公尺"; 
                case 21:
                    return "   5 公尺"; 
                case 22:
                    return "   5 公尺"; 
                case 23:
                    return "   2 公尺"; 
                case 24:
                    return "1000 公釐"; 
                case 25:
                    return " 500 公釐"; 
                case 26:
                    return " 200 公釐"; 
                case 27:
                    return " 100 公釐"; 
                case 28:
                    return "  50 公釐"; 
                default:
                    return "比例尺錯誤"; 
            }
        }

        function toggleToolsBar() {
            for(var i = 0; i < ezmapplus.toolbar.tools.length; i++) {
                var tool = document.getElementById("ezmapplus_toolbar_"+ezmapplus.toolbar.tools[i]);
                tool.hidden = tool.hidden? false: true;
            }

            if(ezmapplus.toolbar.map.statusbar.is_open) {
                ezmapplus.toolbar.map.statusbar.close();
                ezmapplus.toolbar.map.setScaleLineVisible(0);
                ezmapplus.toolbar.hide_control();

            } else {
                ezmapplus.toolbar.map.statusbar.open();
                ezmapplus.toolbar.map.setScaleLineVisible(1);
                ezmapplus.toolbar.show_control();

            }
        }

        function checkDocPositionY(currentY) {
            if(currentY >= (297 - 10)) {
                ezmapplus.toolbar.printWithMMLayer.doc.addPage();
                return 17.75;
            } 
            return currentY;
        }
        
        async function savePDF(orientation) {
            var docYPosition = 10;
            var w0 = ezmapplus.toolbar.map.getWidth();
            var h0 = ezmapplus.toolbar.map.getHeight();
            var doc = ezmapplus.toolbar.printWithMMLayer.doc;

            // Set Chinese Font Style 
            try {
                let {microsoft_bold} = await import("./js/microsoft-bold-normal.js");
                doc.addFileToVFS('microsoft-bold-normal.ttf', microsoft_bold);
                doc.addFont('microsoft-bold-normal.ttf', 'microsoft-bold', 'normal');
                doc.setFont("microsoft-bold");

            } catch {
                console.log("Chinese Font Style File is Loss, Chinese Text Will be Garbled!");
            }

            doc.setFontSize(18);

            // Add GIS Logo
            await getImageDataURL(ezmapplus.toolbar.path + "images/GisLogo.png", 0).then(result => {
                var DataURL = result[0], w = result[1], h = result[2];
                var LogoWidth = 35;
                var LogoHeight = h * 35/ w;
                doc.addImage(DataURL, 15, docYPosition, LogoWidth, LogoHeight);
                docYPosition += LogoHeight;

                // Set Custom Title
                if(document.getElementById("PDFTitle").value  != "") {
                    doc.text(document.getElementById("PDFTitle").value , 10 + LogoWidth + 10, docYPosition-2);
                }
            });

            // // Set Custom Title
            // if(document.getElementById("PDFTitle").value  != "") {
            //     docYPosition += 10;
            //     doc.text(document.getElementById("PDFTitle").value , 15, docYPosition-2);
            // }

            // Calculation Map's Width and Height
            if (w0 > h0) {
                var newWidth = doc.internal.pageSize.getWidth()-20;
                var newHeight = h0 * ((doc.internal.pageSize.getWidth()-20) / w0);
            } else {
                var newWidth = w0 * ((doc.internal.pageSize.getWidth()-20) / h0);
                var newHeight = doc.internal.pageSize.getWidth()-20;
            }
            
            toggleToolsBar();
            var mapDiv = document.getElementById(ezmapplus.toolbar.map._targetId);
            await html2canvas(mapDiv).then(canvas => {
                var image = canvas.toDataURL("image/png");
                docYPosition += 5
                doc.addImage(image, 'PNG', (doc.internal.pageSize.getWidth()-newWidth)/2, docYPosition, newWidth, newHeight);
            });
            
            toggleToolsBar();
            
            // Add Compass 
            if ((document.getElementById('chkCompass') != undefined ? document.getElementById('chkCompass').checked : true) || ezmapplus.toolbar.printWithMMLayer.defaultOptions) {
                await getImageDataURL(ezmapplus.toolbar.path + "images/compass.png", 0, ezmapplus.toolbar.map._olmap.getView().getRotation()).then(result => {
                    var DataURL = result[0], w = result[1], h = result[2];
                    var ScaleWidth = 20;
                    var ScaleHeight = h * 20/ w;
                    doc.addImage(DataURL, (doc.internal.pageSize.getWidth()+newWidth)/2-ScaleWidth-5, docYPosition+5, ScaleWidth, ScaleHeight);
                });
            }
            docYPosition += newHeight;
            docYPosition += 5;

            var currentDate = new Date();
            
            // Add Datetime
            if ((document.getElementById('chkDatetime') != undefined ? document.getElementById('chkDatetime').checked : true) || ezmapplus.toolbar.printWithMMLayer.defaultOptions) {
                doc.setFontSize(8);
                var strDatetime = currentDate.getFullYear() + '/' + (currentDate.getMonth()+1) + '/' + currentDate.getDate() + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes();
                doc.text(strDatetime, doc.internal.pageSize.getWidth()-15-strDatetime.length-3, 10);
                doc.setFontSize(18);
            }

            // Add Scale
            if ((document.getElementById('chkScale') != undefined ? document.getElementById('chkScale').checked : true) || ezmapplus.toolbar.printWithMMLayer.defaultOptions) {
                await getImageDataURL(ezmapplus.toolbar.path + "images/scale.png", borderSize=0).then(result => {
                    var DataURL = result[0], w = result[1], h = result[2];
                    var ScaleWidth = 20;
                    var ScaleHeight = h * 20/ w;
                    doc.addImage(DataURL, doc.internal.pageSize.getWidth()-15-ScaleWidth, docYPosition, ScaleWidth, ScaleHeight);
                    docYPosition += ScaleHeight;
                    doc.setFontSize(8);
                    doc.text("地圖資料 @"+currentDate.getFullYear() + " GISFCU   " + transScale(Math.round(ezmapplus.toolbar.map._olmap.getView().getZoom())) , doc.internal.pageSize.getWidth()-15-ScaleWidth-47 , docYPosition-2);
                    doc.setFontSize(18);
                });
            }
            

            if ((document.getElementById('chkLegend') != undefined ? document.getElementById('chkLegend').checked : true) || ezmapplus.toolbar.printWithMMLayer.defaultOptions) {
                doc.setFontSize(26);
                docYPosition += 10;
                doc.text("圖例" , doc.internal.pageSize.getWidth()/2-10, docYPosition);
                
                // List All Directory in MMLayer
                var treeDir = mmlayer.tree.getDirectories();
                var folderSN = mmlayer.tree.foldersn;
                for(var idxDir = 0; idxDir < treeDir.length; idxDir++) {
                    var dirNameOutput = false;
                    if(folderSN != "" && treeDir[idxDir].PARENT_SN != folderSN) { continue; }
                    var layerDirSN = treeDir[idxDir].LAYERDIR_SN
                    var layers = mmlayer.tree.getLayersByDirSN(layerDirSN);

                    // Layers Below the Directory
                    for (var idxLayer = 0; idxLayer < layers.length; idxLayer++) {
                        try {
                            if(!mmlayer.tree.getChecked(layers[idxLayer])) { continue; }
                        } catch(err) {
                            continue;
                        }
                        
                        if(!dirNameOutput) {
                            doc.setFontSize(18);
                            docYPosition = checkDocPositionY(docYPosition + 10); 
                            doc.text(treeDir[idxDir].NAME, 10, docYPosition);
                            dirNameOutput = true;
                        }

                        doc.setFontSize(14);
                        docYPosition = checkDocPositionY(docYPosition + 10);

                        // Layer's Marker 
                        await getImageDataURL(mmlayer.tree.iconpath + layers[idxLayer].ICON).then(result => {
                            var DataURL = result[0], w = result[1], h = result[2];
                            var iconHeight = 5;
                            var iconWidth = w * 5 / h;
                            doc.addImage(DataURL, 10, docYPosition-4, iconWidth, iconHeight);
                        }).catch(function(errPath) {
                            console.log("Image Not Find At " + errPath);
                        });

                        var splitText = doc.splitTextToSize(layers[idxLayer].NAME, 180)
                        for(var line = 0; line < splitText.length; line++) {
                            doc.text(splitText[line], 20, docYPosition);
                            if (line+1 != splitText.length)
                                docYPosition = checkDocPositionY(docYPosition + 7.75);
                        }
                        
                        // Layer's Legend
                        var legendPath = mmlayer.tree.uploadpath + "legend/" + layers[idxLayer].LEGEND;
                        await getImageDataURL(legendPath).then(result => {
                            var DataURL = result[0], w = result[1], h = result[2];
                            var legendHeight = 50;
                            var legendWidth = w * 50 / h;
                            docYPosition = checkDocPositionY(docYPosition + 10);
                            if (docYPosition+legendHeight > doc.internal.pageSize.getHeight()-4) {
                                doc.addPage()
                                docYPosition = 10;
                            }
                            doc.addImage(DataURL, (doc.internal.pageSize.getWidth()-legendWidth)/2, docYPosition, legendWidth, legendHeight);
                            docYPosition += legendHeight;
                        }).catch(function(errPath){
                            console.log("Image Not Find At " + errPath);
                        });
                    }
                }
            }

            // Output PDF Data URI
            // doc.output('datauri');
            doc.save(document.getElementById("PDFTitle").value == ""? 'GISFCU.pdf' : document.getElementById("PDFTitle").value + ".pdf");
            MM.mask.hide();
        }

        setTimeout(function () {
            MM.mask.show();
            // init doc
            ezmapplus.toolbar.printWithMMLayer.doc = new jspdf.jsPDF();

            //# 將經緯度關閉
            if (document.getElementById("background") != null) {
                document.getElementById("background").style.display = "none";
            }

            if (document.getElementById("mousePosition") != null) {
                document.getElementById("mousePosition").style.display = "none";
            }

            try {
                savePDF(printStyle);
            } catch(err) {
                console.log(err);
                MM.mask.hide();
            }

            setTimeout(function () { 
                MM.mask.hide(); 
            }, 20000);

        }, 20);
    }
})(ezmapplus);

function arduino_map(x, in_min, in_max, out_min, out_max) {
  //x = 輸入值
  //in 如 0~255
  //out 如 0~1024
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
} 
ezmapplus.toolbar.print7 = {};
(function (ezmapplus) {

    ezmapplus.toolbar.print7.name = 'print7';
    ezmapplus.toolbar.print7.on = true;
	ezmapplus.toolbar.print7.img_chk_interval = null;
    ezmapplus.toolbar.print7.selectStyle = true;
    ezmapplus.toolbar.print7.start = function () {     
        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.print7.name);
        var div = ezmapplus.toolbar.map.createDiv('easymap-toolbar-print7', { x: p[0], y: p[1] });
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/print.gif'>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "列印");

        var mapWidth = ezmapplus.toolbar.map.getWidth();
        var mapHeight = ezmapplus.toolbar.map.getHeight();

        //# 列印方向
        if(ezmapplus.toolbar.print7.selectStyle){
            renderBtnPrint(mapWidth, mapHeight);
        }
        else{
            $(div).bind("click touchstart", function () {
                ezmapplus.toolbar.print7.run('horizontal');
            });
        }

        function renderBtnPrint(mapWidth, mapHeight){
            divHtml = '<div style="text-align:center;width:100px;"> \
                           <span>列印方向</span> <br /> \
                           <input type="button" id="btnPrint1" onclick="ezmapplus.toolbar.print7.setBtnPrint({0});" value="直式" />&nbsp; \
                           <input type="button" id="btnPrint2" onclick="ezmapplus.toolbar.print7.setBtnPrint({1});" value="橫式" /> \
                       </div>';
            divHtml = divHtml.replace('{0}', "'vertical'");
            divHtml = divHtml.replace('{1}', "'horizontal'");
            MM.tip.click('.easymap_plus_measure_tooltip[data-powertip=列印]', divHtml, 'bottom center');
        }
    }

    //# 設定列印方向按鈕功能
    ezmapplus.toolbar.print7.setBtnPrint = function(printStyle){
        if(printStyle =='vertical'){
            ezmapplus.toolbar.print7.run('vertical');
        }
        else if(printStyle =='horizontal'){
            ezmapplus.toolbar.print7.run('horizontal');
        }
    }
    //# 執行列印
    ezmapplus.toolbar.print7.run = function(printStyle){
        setTimeout(function () {
            MM.mask.show();

            // 關閉控制項
            ezmapplus.toolbar.hide_control();

            //# 將經緯度關閉
            if (document.getElementById("background") != null) {
                document.getElementById("background").style.display = "none";
            }
            if (document.getElementById("mousePosition") != null) {
                document.getElementById("mousePosition").style.display = "none";
            }
                

            //# 直式列印還原地圖用
            var w0 = ezmapplus.toolbar.map.getWidth();
            var h0 = ezmapplus.toolbar.map.getHeight();

            var r = w0/h0;



            //# start printing
            //var srcCanvas = document.getElementById(ezmapplus.toolbar.map._targetId).children[0]; //.children[0];
            var srcCanvas = document.querySelectorAll("#"+ezmapplus.toolbar.map._targetId +" canvas")[0];

            if (printStyle == 'vertical') {// 直式

                                
                ezmapplus.toolbar.map.resize(206, 206/r);   // 將地圖調整為直式

                // Default export is a4 paper, portrait, using milimeters for units
                var doc = new jspdf.jsPDF({
                })

                //doc.text('Hello world!', 10, 10)

                doc.addImage(srcCanvas, 'PNG', 2, 2, 206, 206/r);
                doc.save('map.pdf'); 
            } else {// 橫式
            
                ezmapplus.toolbar.map.resize(293, 206);   // 將地圖調整為直式

                // Default export is a4 paper, portrait, using milimeters for units
                var doc = new jspdf.jsPDF({
                    orientation: 'landscape'
                })

                //doc.text('Hello world!', 10, 10)

                doc.addImage(srcCanvas, 'PNG', 2, 2, 293, 206);
                doc.save('map.pdf'); 
            }


            ezmapplus.toolbar.map.resize(w0,h0);


            setTimeout(function () {
                MM.mask.hide();
            }, 20);
        }, 20);
    }
})(ezmapplus);
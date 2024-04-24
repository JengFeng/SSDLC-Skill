ezmapplus.toolbar.controller = {};
(function (ezmapplus) {
    
    ezmapplus.toolbar.controller.name = 'controller';
    ezmapplus.toolbar.controller.on = true;
    ezmapplus.toolbar.controller.dPosition = null;
	ezmapplus.toolbar.controller.dScale = null;
    ezmapplus.toolbar.controller.start = function () {     

        //# init Position and Zoom Level
        ezmapplus.toolbar.controller.dPosition = ezmapplus.toolbar.map.getCenter();
        ezmapplus.toolbar.controller.dZoomLevel = ezmapplus.toolbar.map.getZoom();
        ezmapplus.toolbar.map.openDragRotate()
        var p = ezmapplus.toolbar.get_position(ezmapplus.toolbar.controller.name);
        var div = ezmapplus.toolbar.map.createDiv('ezmapplus_toolbar_controller', { x: p[0], y: p[1] });
        div.innerHTML = "<img style='cursor: pointer;' src='" + ezmapplus.toolbar.path + "images/controller.gif'>";
        div.className = "easymap_plus_measure_tooltip";
        div.setAttribute("data-powertip", "地圖控制器");

        renderBtnPrint();
        
        function renderBtnPrint(){
            divHtml = '<div style="text-align:center; width:80px; height: 100px;"> \
                           <span>地圖控制器</span> \
                           <div class="mapController" style="margin: 2.5px; margin-top: 5px;">\
                                <input type="button" id="btnResetMap" class="controller-btn reset" onclick="ezmapplus.toolbar.controller.resetMap();" /> \
                                <input type="button" id="btnMoveUp" class="controller-btn moveUp" onclick="ezmapplus.toolbar.controller.moveUp();" /> \
                                <input type="button" id="btnMoveDown" class="controller-btn moveDown" onclick="ezmapplus.toolbar.controller.moveDown();" /> \
                                <input type="button" id="btnMoveLeft" class="controller-btn moveLeft" onclick="ezmapplus.toolbar.controller.moveLeft();" /> \
                                <input type="button" id="btnMoveRight" class="controller-btn moveRight" onclick="ezmapplus.toolbar.controller.moveRight();" /> \
                            </div>\
                        </div>';

            MM.tip.click('.easymap_plus_measure_tooltip[data-powertip=地圖控制器]', divHtml, 'bottom center');
        }
    }

    // Vector Calculate of Current Rotation and ZoomLevel
    ezmapplus.toolbar.controller.vectorCalculator = function(orientation) {

        var currentCenter = ezmapplus.toolbar.map.getCenter();
        var currentRotation = ezmapplus.toolbar.map._olmap.getView().getRotation()*-1;
        var cuurentZoomLevel = ezmapplus.toolbar.map.getZoomLevel();
        var x, y;

        switch(orientation) {
            case "up":
                x = 0;
                y = 10000/(cuurentZoomLevel**5);
                break;
            case "down":
                x = 0;
                y = -10000/(cuurentZoomLevel**5);
                break;
            case "left":
                x = -10000/(cuurentZoomLevel**5);
                y = 0;
                break;
            case "right":
                x = 10000/(cuurentZoomLevel**5);
                y = 0;
                break;
            default:
                ezmapplus.toolbar.controller.resetMap();
                break;
        }

        var lon = currentCenter.lon + x*Math.cos(currentRotation) + y*Math.sin(currentRotation);
        var lat = currentCenter.lat + (-x*Math.sin(currentRotation)) + y*Math.cos(currentRotation);

        return new dgXY(lon, lat)
    }

    //# Reset Map Position, Zoom Level and Rotation
    ezmapplus.toolbar.controller.resetMap = function() {
        
        ezmapplus.toolbar.map.zoomToXY(ezmapplus.toolbar.controller.dPosition, ezmapplus.toolbar.controller.dZoomLevel);
        ezmapplus.toolbar.map.rotate(0);
        
    }

    ezmapplus.toolbar.controller.moveUp = function(){
        
        ezmapplus.toolbar.map.panTo(ezmapplus.toolbar.controller.vectorCalculator("up"));
    }

    ezmapplus.toolbar.controller.moveDown = function(){
        
        ezmapplus.toolbar.map.panTo(ezmapplus.toolbar.controller.vectorCalculator("down"));
        
    }

    ezmapplus.toolbar.controller.moveLeft = function(){
        
        ezmapplus.toolbar.map.panTo(ezmapplus.toolbar.controller.vectorCalculator("left"));
    }

    ezmapplus.toolbar.controller.moveRight = function(){

        ezmapplus.toolbar.map.panTo(ezmapplus.toolbar.controller.vectorCalculator("right"));
    }
    
})(ezmapplus);
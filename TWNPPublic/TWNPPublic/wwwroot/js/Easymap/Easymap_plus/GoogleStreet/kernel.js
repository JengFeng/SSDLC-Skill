
(function (ezmapplus) {

    // Google
    ezmapplus.GoogleStreet.svLat = null;
    ezmapplus.GoogleStreet.svLon = null;
    ezmapplus.GoogleStreet._Arrow = null;
    ezmapplus.GoogleStreet.panorama = null;    
    ezmapplus.GoogleStreet._StreeViewID = "";
    ezmapplus.GoogleStreet._MapID = "";

    ezmapplus.GoogleStreet.IconUrl = "";
    ezmapplus.GoogleStreet._IconWidth = 24;
    ezmapplus.GoogleStreet._IconHeight = 24;
    ezmapplus.GoogleStreet._IconUrl = "";

    ezmapplus.GoogleStreet._GoogleIcon = null;
    // 渲染時事件, 回傳狀態
    ezmapplus.GoogleStreet.onPanorama = null;
    // 街景被關閉時
    ezmapplus.GoogleStreet.onPanoramaClose = null;

    // Icon 圖樣
    ezmapplus.GoogleStreet._IconName = "icons8-marker-16.png";

    // 開始(拖曳)
    ezmapplus.GoogleStreet.start = function (map) {
        ezmapplus.GoogleStreet._MapID = map._targetId;

        $('#' + ezmapplus.GoogleStreet._MapID).on("dragover", function (ev) {
            ev.preventDefault();
        });

        $('#' + ezmapplus.GoogleStreet._MapID).on("drop", function (ev) {
            ev.preventDefault();

            var lonlat = map.revXY(ev.offsetX, ev.offsetY);
            var mdgxy = new dgXY(lonlat.x, lonlat.y);

            ezmapplus.GoogleStreet.svLat = mdgxy.y;
            ezmapplus.GoogleStreet.svLon = mdgxy.x;

            if (!ezmapplus.GoogleStreet._Arrow) {
                var url = ezmapplus.GoogleStreet.IconUrl == '' ? ezmapplus.GoogleStreet.path + "img/" + ezmapplus.GoogleStreet._IconName : ezmapplus.GoogleStreet.IconUrl;
                var icon = new dgIcon(url, ezmapplus.GoogleStreet._IconWidth, ezmapplus.GoogleStreet._IconHeight);
                var _marke = new dgMarker(mdgxy, icon, true);

                ezmapplus.GoogleStreet._IconUrl = url;
                ezmapplus.GoogleStreet._Arrow = _marke;

                _marke.ondragend = function (dgxy) {
                    ezmapplus.GoogleStreet.svLat = dgxy.y;
                    ezmapplus.GoogleStreet.svLon = dgxy.x;
                    initialize();
                };

                map.addItem(_marke);
            }
            else {
                ezmapplus.GoogleStreet._Arrow.setXY(mdgxy);
            }

            initialize();
        });
    }
    // 開始(點擊)
    ezmapplus.GoogleStreet.StartForCoord = function (map, coordinate) {
        ezmapplus.GoogleStreet.svLat = coordinate.y;
        ezmapplus.GoogleStreet.svLon = coordinate.x;

        if (!ezmapplus.GoogleStreet._Arrow) {

            var url = ezmapplus.GoogleStreet.IconUrl == '' ? ezmapplus.GoogleStreet.path + "img/" + ezmapplus.GoogleStreet._IconName : ezmapplus.GoogleStreet.IconUrl;
            var icon = new dgIcon(url, ezmapplus.GoogleStreet._IconWidth, ezmapplus.GoogleStreet._IconHeight);
            var _marke = new dgMarker(coordinate, icon, true);

            ezmapplus.GoogleStreet._IconUrl = url;
            ezmapplus.GoogleStreet._Arrow = _marke;

            _marke.ondragend = function (dgxy) {
                ezmapplus.GoogleStreet.svLat = dgxy.y;
                ezmapplus.GoogleStreet.svLon = dgxy.x;
                initialize();
            };

            map.addItem(_marke);
        }
        else {
            ezmapplus.GoogleStreet._Arrow.setXY(coordinate);
        }

        initialize();
    }

    ezmapplus.GoogleStreet.bindStreetView = function (select) {
        ezmapplus.GoogleStreet._StreeViewID = select;
    }
    // 綁定 Div Icon
    ezmapplus.GoogleStreet.bindIcon = function (select) {

        var obj = $('#' + select);
        var url = ezmapplus.GoogleStreet.IconUrl == '' ? ezmapplus.GoogleStreet.path + "img/" + ezmapplus.GoogleStreet._IconName : ezmapplus.GoogleStreet.IconUrl;
        var img = document.createElement('img');
        img.src = url;
        img.draggable = true;
        img.onload = function () {
            ezmapplus.GoogleStreet._IconWidth = this.width;
            ezmapplus.GoogleStreet._IconHeight = this.height;
        }
        obj.append(img);

    }
    // 設定 Icon 樣式
    ezmapplus.GoogleStreet.setIcon = function (url) {
        if (url == '') return;
        var url = url;
        var img = document.createElement('img');
        img.src = url;
        img.draggable = true;
        img.onload = function () {
            ezmapplus.GoogleStreet._IconWidth = this.width;
            ezmapplus.GoogleStreet._IconHeight = this.height;
        }
    }

    //移除地圖上的 dgMarker
    ezmapplus.GoogleStreet.removeMapMarker = function () {
        map.removeItem(ezmapplus.GoogleStreet._Arrow);
        ezmapplus.GoogleStreet._Arrow = null;
    }

    //關閉街景及移除 Marker
    ezmapplus.GoogleStreet.closePanorama = function () {

        ezmapplus.GoogleStreet.removeMapMarker();

        if ($('#' + ezmapplus.GoogleStreet._StreeViewID).children().length != 0) {
            $('#' + ezmapplus.GoogleStreet._StreeViewID).empty()
        }

        if (typeof ezmapplus.GoogleStreet.onPanoramaClose === 'function') {
            ezmapplus.GoogleStreet.onPanoramaClose(status);
        }
    }

    function initialize() {
        // Google StreetView

        new google.maps.StreetViewService().getPanorama(
            { location: { lat: ezmapplus.GoogleStreet.svLat, lng: ezmapplus.GoogleStreet.svLon },},
            function (streetViewPanoramaData, status) {

                if (typeof ezmapplus.GoogleStreet.onPanorama === 'function') {
                    ezmapplus.GoogleStreet.onPanorama(status);
                }
                
            if (status === google.maps.StreetViewStatus.OK) {
                //ok
                ezmapplus.GoogleStreet.panorama = new google.maps.StreetViewPanorama(
                    document.getElementById(ezmapplus.GoogleStreet._StreeViewID),
                    {
                        position: {
                            lat: ezmapplus.GoogleStreet.svLat,
                            lng: ezmapplus.GoogleStreet.svLon
                        },
                        pov: { heading: 360, pitch: 0 },
                        zoom: 1,
                        visible: true,
                        enableCloseButton: true
                    });

                ezmapplus.GoogleStreet.panorama.addListener('pano_changed', function () {

                    var mdgxy = new dgXY(
                        ezmapplus.GoogleStreet.panorama.getPosition().lng(),
                        ezmapplus.GoogleStreet.panorama.getPosition().lat()
                    );
                    ezmapplus.GoogleStreet._Arrow.setXY(mdgxy);

                    ezmapplus.GoogleStreet.svLat = ezmapplus.GoogleStreet.panorama.getPosition().lat();
                    ezmapplus.GoogleStreet.svLon = ezmapplus.GoogleStreet.panorama.getPosition().lat();


                    //要marker跟著走把註解打開
                    //var myLatlng = new google.maps.LatLng(mdgxy.lat, mdgxy.lon);
                    //ezmapplus.GoogleStreet._GoogleIcon.setPosition(myLatlng);
                }); 

                ezmapplus.GoogleStreet.panorama.addListener('closeclick', function () {
                    ezmapplus.GoogleStreet.closePanorama();

                });
                
                ezmapplus.GoogleStreet._GoogleIcon = new google.maps.Marker({
                    position: { lat: ezmapplus.GoogleStreet.svLat, lng: ezmapplus.GoogleStreet.svLon },
                    map: ezmapplus.GoogleStreet.panorama,
                    icon: ezmapplus.GoogleStreet._IconUrl,
                });
            }
        });
    }

})(ezmapplus);
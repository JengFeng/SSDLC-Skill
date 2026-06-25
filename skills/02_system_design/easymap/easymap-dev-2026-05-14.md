---
name: easymap-dev
description: Easymap 地圖 SDK 開發技能。當使用者在開發、整合、除錯或擴充 Easymap SDK 相關功能時，務必使用此技能。觸發條件包含：提到 Easymap、dgMarker、dgSource、dgGeoJson、dgWKT、dg3D、addItem、Easymap CDN、OpenLayers 地圖整合、OL-Cesium 3D 地圖，或任何與 Easymap 相關的開發任務，即使使用者沒有明確說「使用 Easymap skill」也應主動套用。
---

# Easymap AI Development Skill (2026-04-29)

這是一份給 AI 工具與 Easymap 開發同學使用的技能樹文件。目標不是取代完整原始碼，而是讓 AI 在處理 Easymap 7 整合、除錯、擴充、範例改寫時，能立刻使用正確心智模型、查找順序與常用 API。

## 作者與來源

- 準線智慧科技: https://www.focusit.com.tw/
- Easymap 官網: https://www.focusit.com.tw/easymap/
- 簡甫任: jeffrey@gis.tw
- 何宗翰: john@gis.tw
- 正式 Easymap CDN JS: https://www.focusit.com.tw/easymap/easymap/easymap.js
- 正式 API 範例 JS: http://www.focusit.com.tw/easymap/api.js

## AI 使用規則

當任務提到 Easymap、dgMarker、dgSource、dgGeoJson、dgWKT、dg3D、addItem、Easymap CDN、OpenLayers、OL-Cesium 或 Cesium 3D，優先套用本文件。

- 預設 Easymap 是瀏覽器端 CDN/global SDK，不是 npm tree-shaking ESM 套件。
- 優先使用 `Easymap + dg* + map.addItem(...) + map.removeItem(...)` 的公開生命週期。
- 除非正在做 SDK 內部擴充，不要直接操作 `_olmap`、`_items`、`_instance`、`_olcesium`。
- 遇到範例細節，先查本機 `D:\GD\5project\108easymap\code\easymap7\offical\api.js`。
- 臨時沒有本機檔時，查正式範例 `http://www.focusit.com.tw/easymap/api.js`。
- 遇到載入、預設底圖、投影、預設中心點、內建圖源，先查 `map_ini.js` 或原始碼 `src/map.init.js`。
- 遇到 `addItem`、popup、事件、繪圖、資料轉換、2D 圖層問題，查 `src/easymap.js`。
- 遇到 3D、Cesium、地形、glTF、3D Tiles、相機、3D 測量問題，查 `src/digi3d.js`。
- 遇到 `dg*` 物件建構、setter、事件 callback、資料格式，查 `src/dg/*.js`。
- 不要為了「現代化」破壞 CDN/global contract。Easymap 很多行為是為相容性與既有專案累積出來的。

## 權威來源與查找順序

1. 本機完整範例: `D:\GD\5project\108easymap\code\easymap7\offical\api.js`
2. 正式遠端範例: `http://www.focusit.com.tw/easymap/api.js`
3. 前端引入檔與 CDN loader: `D:\GD\5project\108easymap\code\easymap_official\offical\Easymap`
4. SDK 原始碼: `D:\GD\5project\108easymap\code\easymap_official\EasymapDev\src`
5. 主要原始碼入口: `src/easymap.js`、`src/digi3d.js`、`src/digimap.js`、`src/dg/index.js`

## 官方 `api.js` 範例抽取規則

`api.js` 是可直接反查的範例索引，不是單純 library。它的主要結構是 `window.data = [...]`，每個節點通常包含:

- `tab`: 範例分類，例如基本、底圖、Marker、繪圖、3D。
- `children[].name`: 範例顯示名稱。
- `children[].funName`: 範例函式名稱，適合用 `rg` 搜尋。
- `children[].methode`: 真正可抽出的範例程式。

要替使用者建立 Easymap example 時:

1. 先依需求在 `api.js` 搜尋 `name` / `funName` / 關鍵 API，例如 `setDrawMode`、`dgMarker`、`dgWKT`、`new dgSource`、`enable3D`、`dg3D('gltf'`。
2. 從 `methode` 抽核心公開 API 呼叫，不要把官方範例頁的 UI helper 一起搬過來，例如 `smallComment`、`myW`、`print_table`、`getRadioValue`、jQuery draggable 視窗。
3. 產出最小可跑 HTML: `div#map`、明確寬高、CDN `easymap.js`、`var map = new Easymap("map")`、再加目標功能。
4. 優先使用公開生命週期: `map.addItem(...)`、`map.removeItem(...)`、`map.attachEvent(...)`、`map.detachEvent(...)`、`map.setDrawMode(...)`、`map.getDrawMeasure()`。
5. 若範例需要 3D，一律把 3D 相關操作包在 `map.enable3D(function () { ... })` callback 裡。
6. 範例中若出現相對路徑，例如 `easymap/imgs/pin.png`、`data/*.kmz`、`data/*.json`，改成可被使用者部署的位置，或明確標註需要自行放檔。

官方 `api.js` 常見範例入口:

- 初始化: `dgFunc0`
- 右鍵選單與測量: `f_fmenu`
- 工具列、鷹眼、ScaleLine、Statusbar: `f_addcontrol`、`f_eagleEye`、`f_sw_scaleline`、`f_statusbar`
- 地圖移動與縮放: `f_getZoomLevel`、`f_zoomTo`、`f_zoomToXY`、`f_panTo`
- 繪圖測量: 搜尋 `setDrawMode`
- Marker: 搜尋 `dgMarker`、`f_marker`
- WKT / GeoJSON / KML: 搜尋 `dgWKT`、`dgGeoJson`、`dgKml`
- 3D: 搜尋 `enable3D`、`dg3D('gltf'`、`dg3D('3dtiles'`、`enable3DTerrain`、`panTo3D`

正式 CDN 引入以這個網址為準:

```html
<script src="https://www.focusit.com.tw/easymap/easymap/easymap.js"></script>
```

這個檔案是 loader，不只是單一核心類別。它會依路徑與環境載入相關 CSS、`dg.js`、`map_ini.js`、`7/easymap.js` 與多個第三方支援檔。

## 最短可用範例

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Easymap Demo</title>
  <style>
    html, body, #map {
      margin: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://www.focusit.com.tw/easymap/easymap/easymap.js"></script>
  <script>
    var map = new Easymap("map");

    var icon = new dgIcon("https://www.focusit.com.tw/easymap/easymap/7/imgs/marker.png", 32, 32);
    var marker = new dgMarker(new dgXY(121.517, 25.047), icon, false);

    marker.onclick = function (xy, self) {
      map.openInfoWindow(xy, "<h3>Hello Easymap</h3>", 180, 100);
    };

    map.addItem(marker);
  </script>
</body>
</html>
```

最短心法:

- HTML 必須有地圖容器，例如 `<div id="map"></div>`。
- 容器必須有可見寬高，否則地圖可能初始化但看不到。
- 建立圖台用 `new Easymap("map")`，參數是 div id。
- 建立資料物件用 `new dgMarker(...)`、`new dgWKT(...)`、`new dgSource(...)` 等。
- 加入圖台統一用 `map.addItem(item)`。

## 架構與載入模型

Easymap 7 的主要執行模型是 browser global:

- `window.Easymap` 是公開圖台入口。
- `window.ol` 是 OpenLayers。
- `window.dgXY`、`window.dgMarker`、`window.dgSource`、`window.dgWKT`、`window.dgGeoJson`、`window.dg3D` 等是公開資料物件。
- `src/dg/index.js` 負責將多數 `dg*` 類別掛到 `window`。
- `src/easymap.js` 最後會掛 `window.Easymap = Easymap`。

核心繼承鏈:

```text
digimap.js
  -> digi3d.js
    -> easymap.js
```

各層職責:

- `digimap.js`: 基礎狀態、工具函式、Ajax、投影轉換、WKT/GeoJSON/KML/GML 轉換、共用 helper。
- `digi3d.js`: OL-Cesium、Cesium viewer、3D 地形、3D Tiles、glTF、相機、3D 測量、3D 建物與 3D overlay。
- `easymap.js`: 建立 OpenLayers map、popup、事件、add/remove dispatch、底圖切換、繪圖測量、資料物件轉圖層。
- `map_ini.js` / `map.init.js`: 預設底圖、啟動中心、zoom、解析度、內建 WMTS/XYZ/WMS 設定。

CDN loader 會自動載入的重要檔案:

- `7/easymap.css`
- `7/dg.js`
- `map_ini.js`
- `7/MMJS/mmjs.js`
- `7/jszip/jszip.min.js`
- `7/easymap.js?_t=1`
- `7/ol-ext/ol-ext_day_night.js`
- `7/ol-ext/ol-ext.css`
- `7/font-awesome/4.7.0/css/font-awesome.min.css`
- `7/elm-pep/elm-pep.js`
- `7/olms/olms.js`
- `7/mapbox/mapbox-gl.js`
- `7/windy/windy.js?v=2`
- `7/html2canvas/html2canvas.min.js`
- `7/heatmapjs/heatmap.js`

Loader 支援一些 `no_*` 參數控制部分套件是否載入，例如 `no_elm-pep`、`no_mapbox`、`no_windy`、`no_html2canvas`、`no_heatmap`、`no_ext_day_night`。如果功能突然不存在，先確認 CDN loader 是否跳過該依賴。

## 核心 API 技能樹

### 圖台初始化

```js
var map = new Easymap("map");
```

初始化後通常可以立即使用:

- `map.addItem(itemOrArray)`
- `map.removeItem(itemOrArray)`
- `map.attachEvent(type, callback)`
- `map.openInfoWindow(dgxy, html, width, height, closeCallback)`
- `map.closeInfoWindow()`
- `map.zoomTo(level)`
- `map.zoomToXY(dgxy, zoom)`
- `map.panTo(dgxy)`
- `map.switchMapType(name)`
- `map.getCenter()`
- `map.getZoom()`
- `map.resize()`

### 座標與投影

Easymap app-facing 座標多數使用經緯度順序:

```js
var xy = new dgXY(121.517, 25.047); // lon, lat
var xyz = new dgXYZ(121.517, 25.047, 100); // lon, lat, altitude
```

常用座標 API:

```js
var center = map.getCenter();
map.zoomToXY(new dgXY(121.517, 25.047), 15);
map.panTo(new dgXY(121.517, 25.047));

var twd97 = new dgXY(302000, 2768000);
var wgs84 = map.projTransfer(twd97, "EPSG:3826", "EPSG:4326");
```

注意:

- OpenLayers view 內部常用 `EPSG:3857`。
- 台灣專案常見 `EPSG:3826`、`EPSG:3828`、`EPSG:4326`。
- Easymap 也有 YX / YXZ 變體投影，處理服務資料時要看來源 SRS。
- 如果點位跑到奇怪位置，第一個檢查 lon/lat 是否反了，第二個檢查 SRS 是否正確。

### 物件生命週期

最重要規則:

```js
map.addItem(itemOrArray);
map.removeItem(itemOrArray);
```

`addItem` 會做很多事情:

- 分配內部 id / group。
- 綁定 `_easymap`。
- 依 `_type` dispatch 到 `_addDgMarker`、`_addDgWKT`、`_addDgSource` 等。
- 建立 OpenLayers layer / feature / overlay 或 Cesium entity。
- 維護 `_items`、`_instance`、popup、click、hover、remove 關係。

常見 `_type` dispatch:

- `dgmarker` -> `_addDgMarker`
- `gmarker` -> `_addDgGMarker`
- `dgSource` / `dgsource` -> `_addDgSource`
- `dgkml` -> `_addDgKml`
- `dggeojson` -> `_addDgGeoJson`
- `dgwkt` -> `_addDgWKT`
- `dggml` -> `_addDgGML`
- `dgwfs` -> `_addDgWFS`
- `dgstaticimage` -> `_addStaticImages`
- `dgheatmap` -> `_addDgHeatmap`
- `dgwindy` -> `_addDgWindy`
- `dgmvt` -> `_addDgMVT`
- `dgwebglpoint` -> `_addDgWebGLPoint`
- `dg3d` -> 3D 物件流程

很多 setter 必須在 `addItem` 後才有 `_instance` 可操作，例如 marker 的 `setXY`、`setContent`，WKT/KML/GeoJSON 的 `setBuffer`、`enableHeatmap`。

### Marker 與 Icon

```js
var icon = new dgIcon("images/pin.png", 32, 32);
var marker = new dgMarker(new dgXY(121.517, 25.047), icon, true);

marker.onclick = function (xy, self, features) {
  map.openInfoWindow(xy, "<b>marker clicked</b>", 180, 100);
};

marker.ondragend = function (xy, self) {
  console.log("new position", xy);
};

map.addItem(marker);
```

使用建議:

- 第三個參數 `true` 表示可拖曳。
- 內容可以是 `dgIcon`，也可以是 HTML 字串。
- 要大量點位時，不要無腦建立上萬個 `dgMarker`；改用 `dgWKT`、`dgGMarker` 或 `dgWebGLPoint`。

### Popup / InfoWindow

```js
var xy = new dgXY(121.517, 25.047);
map.openInfoWindow(xy, "<h3>可以放 HTML</h3>", 150, 80, function () {
  console.log("closed");
});

map.closeInfoWindow();
```

使用建議:

- app-level 優先用 `openInfoWindow`，不要直接用 `_openInfoWindow`。
- marker 可用 `marker.openInfoWindow(content, width, height)`，但要先 `map.addItem(marker)`。
- popup 內容是 HTML 時，要注意資料來源是否可信。

### 事件系統

```js
map.attachEvent("onclick", function (evt, dgxy) {
  console.log("click", dgxy);
});

map.attachEvent("zoomend", function (evt) {
  console.log("zoom", map.getZoom());
});

map.attachEvent("moveend", function (evt) {
  console.log("center", map.getCenter());
});
```

常見事件:

- `onclick`
- `onmousemove`
- `pointermove`
- `moveend`
- `zoomstart`
- `zoomend`

使用建議:

- `attachEvent` 是公開包裝，會處理 Easymap 事件慣例。
- 如果要解除事件，使用 `detachEvent(type, callback)`，callback 必須是同一個函式參考。
- `api.js` 內常把 callback 存到 `window[...]`，是為了後續可以 detach 或重複範例操作。

### 繪圖與測量

```js
map.clearDraw();
map.setDrawMessage("開始繪製", "移動滑鼠繼續繪製");

map.setDrawMode("polygon", function () {
  var result = map.getDrawResult();
  var measure = map.getDrawMeasure();
  var obj = map.getDrawResultObject();
  console.log(result, measure, obj);
});
```

常見 draw mode:

- `polyline`
- `polygon`
- `circle`
- `box`
- `erbl`

常用 companion API:

- `map.setDrawMessage(startMessage, movingMessage)`
- `map.getDrawMeasure()`
- `map.getDrawResult()`
- `map.getDrawResultObject()`
- `map.clearDraw()`
- `map.cancelDrawMode()`
- `map.isDrawMode()`
- `map.geometryToWKT(geometry)`

把繪圖結果轉成 WKT overlay 的常見模式:

```js
map.setDrawMode("polyline", function () {
  var data = map.getDrawMeasure();
  var wktObj = new dgWKT(map.geometryToWKT(data.geom), "EPSG:4326");
  map.addItem(wktObj);
  wktObj.setFeatureClick(function () {});
});
```

### 資料轉換

常用轉換:

```js
map.KmlToWKTArr(kmlUrlOrString, function (wktarr) {
  var obj = new dgWKT(wktarr, "EPSG:4326");
  map.addItem(obj);
});

map.GeoJSONToWKTArr(geoJsonUrlOrString, "EPSG:4326", function (wktarr) {
  map.addItem(new dgWKT(wktarr, "EPSG:4326"));
});

map.GMLToWKTArr(gmlUrlOrString, "EPSG:4326", "GML2", function (wktarr) {
  map.addItem(new dgWKT(wktarr, "EPSG:4326"));
});
```

輸出:

```js
var kml = map.dgToKml([markerOrLayer]);
var geojson = map.dgToGeoJSON([wktObj], "EPSG:4326");
var wktarr = map.dgToWKTarr([wktObj], "EPSG:4326");
var extent = map.getDGSExtent([wktObj], "EPSG:4326");
```

### WKT / KML / GeoJSON / GML / WFS

`dgWKT` 是 Easymap 大量點線面資料的高頻選擇。

```js
var arr = [
  {
    label: "A",
    wkt: "POINT(121.517 25.047)",
    pic: "images/pin.png"
  },
  {
    label: "Line",
    wkt: "LINESTRING(121.5 25.0, 121.6 25.1)"
  }
];

var wktObj = new dgWKT(arr, "EPSG:4326", function () {
  console.log("loaded");
});

wktObj.setFeatureClick(function (properties, geometryType, dgxy, feature, browserEvt, features) {
  map.openInfoWindow(dgxy, properties.label || "WKT", 200, 120);
});

map.addItem(wktObj);
```

其他資料物件:

```js
var kml = new dgKml("data/demo.kml", function () {});
var geo = new dgGeoJson("data/demo.geojson", "EPSG:4326", function () {});
var gml = new dgGML("data/demo.gml", "EPSG:4326", function () {});
var wfs = new dgWFS("https://example.com/wfs", "EPSG:4326", function () {});

map.addItem([kml, geo, gml, wfs]);
```

大量資料建議:

- 幾百筆以內可用 `dgMarker`。
- 上千筆以上優先考慮 `dgWKT`、`dgGMarker`、`dgWebGLPoint`。
- WKT 可搭配 cluster、style、hover、click、spider display、heatmap。
- 若要動態改點位，先查 `dgWKT.setXY(index, dgxy)` 與 `api.js` 的移動範例。

### 圖層服務與 dgSource

`dgSource` 用於底圖或服務圖層。典型模式:

```js
var wmts = new dgSource("WMTS", {
  name: "MyWMTS",
  chname: "我的 WMTS",
  bg: false,
  url: "https://example.com/wmts",
  layer: "layer_name",
  matrixSet: "EPSG:3857",
  format: "image/png",
  opacity: 0.8
});

map.addItem(wmts);
```

WMS:

```js
var wms = new dgSource("WMS", {
  name: "MyWMS",
  bg: false,
  url: "https://example.com/geoserver/wms",
  layer: "workspace:layer",
  projection: "EPSG:4326",
  singleTile: true,
  opacity: 0.7
});

map.addItem(wms);
```

XYZ:

```js
var xyz = new dgSource("XYZ", {
  name: "MyXYZ",
  bg: false,
  url: "https://tile.example.com/{z}/{x}/{y}.png",
  opacity: 1
});

map.addItem(xyz);
```

常見 source family:

- `GOOGLE`
- `OSM`
- `WMTS`
- `WMS`
- `XYZ`
- `TMS`
- `MVT`
- `VectorTile`
- `WFS`
- `Cluster`
- `StaticImage`
- `WebGL`
- `arcgis`

如果 `dgSource` 不顯示:

- 確認 `url`、`layer`、`matrixSet`、`projection`。
- 確認是否 CORS 或 mixed content。
- 確認 `bg` 是否造成底圖/overlay 順序誤判。
- 查 `src/easymap.js` 的 `_getTileLayer(dgsource)`。

### 2D 視覺物件

常用簡單物件:

```js
var text = new dgText(new dgXY(121.517, 25.047), "文字", "#ff0000", 20);
var point = new dgPoint(new dgXY(121.52, 25.05), "#00aaff", 8);
var line = new dgPolyline([
  new dgXY(121.50, 25.04),
  new dgXY(121.55, 25.06)
], "#ff0000", 3);
var polygon = new dgPolygon([
  new dgXY(121.50, 25.04),
  new dgXY(121.55, 25.04),
  new dgXY(121.55, 25.08),
  new dgXY(121.50, 25.08)
], "#ff0000", "#ffff00", 2);

map.addItem([text, point, line, polygon]);
```

其他物件:

- `dgCurve`: 曲線。
- `dgStaticImage`: 用座標範圍貼一張圖。
- `dgMergeVector`: 合併 vector 類資料。
- `dgHeatmap`: 熱區。
- `dgWindy`: 風場。
- `dgMVT`: vector tile。
- `dgWebGLPoint`: 大量點位 WebGL 顯示。

### 地圖控制與 UI

```js
map.addMapControl([10, 10]);
map.setMapControl3DIconOnOff(true);
map.setScaleLineVisible(true);
map.setStatusBarVisible(true);
map.enableEagleEye();
map.disableEagleEye();
```

旋轉:

```js
map.openDragRotate();
map.rotate(45);
map.rotate(0);
map.closeDragRotate();
map.openMobileDragRotate();
map.closeMobileDragRotate();
```

截圖:

```js
map.screenshot(function (base64) {
  console.log(base64);
});
```

DragBox:

```js
map.enableDragBox(function (extent) {
  console.log(extent); // [minLon, minLat, maxLon, maxLat]
});

map.disableDragBox();
```

## 3D / Cesium 技能樹

3D 功能建立在 OL-Cesium + Cesium 上。使用 viewer、terrain、3D Tiles、glTF、3D 相機前，先呼叫 `map.enable3D(...)`。

```js
map.enable3D(function () {
  console.log("3D ready");
  map.enable3DTerrain();
});
```

重要規則:

- `enable3D()` 尚未完成前，不要直接使用 `map._olcesium`、viewer-only helper 或 Cesium scene。
- 地形、3D Tiles、glTF 的高度常需要重新校正。
- 若 3D 物件在地底或飄高，先看 `set3DGltfsToGround`、`setZ`、`enable3DTerrain`、`get3DGroundAltitude`。
- 3D asset path 與 Cesium runtime path 必須正確。

### glTF / GLB

```js
map.enable3D(function () {
  var model = new dg3D("gltf", "data/model.glb", {
    dgxy: new dgXY(121.517, 25.047),
    z: 10,
    scale: 1,
    heading: 0,
    pitch: 0,
    roll: 0
  });

  map.addItem(model);
});
```

### 3D Tiles

```js
map.enable3D(function () {
  var tileset = new dg3D("3dtiles", "data/tileset.json", {
    onload: function (self) {
      self.setZ(30);
    }
  });

  map.addItem(tileset);
});
```

### Cesium Ion

```js
map.enable3D(function () {
  var layer = new dg3D("3dion", 101575);
  map.addItem(layer);
});
```

### 3D 相機

```js
map.enable3D(function () {
  map.panTo3D(new dgXYZ(121.517, 25.047, 500), {
    heading: 0,
    pitch: -45,
    roll: 0
  });

  map.set3DAltitude(1000);
  map.set3DHeading(0);
  map.set3DTilt(1.0);
});
```

常用 3D API:

- `map.is3DEnabled()`
- `map.enable3D(callback)`
- `map.disable3D()`
- `map.set3DCesiumPath(path)`
- `map.get3DViewer()`
- `map.enable3DTerrain(sw)`
- `map.disable3DTerrain()`
- `map.isEnabled3DTerrain()`
- `map.setTerrainUrl(url)`
- `map.set3DGltfsToGround(items)`
- `map.get3DGroundAltitude(lon, lat, callback)`
- `map.get3DGroundAltitudeAsync(lon, lat)`
- `map.panTo3D(dgxyz, options)`
- `map.flyto(lon, lat, height, headingDeg, pitchDeg, rollDeg)`
- `map.dg3DLabelLine(text, lon, lat, altitude, styleKind, css)`
- `map.dg3DImageLine(html, lon, lat, altitude)`
- `map.enable3DGoogleBuilding(op)`
- `map.disable3DGoogleBuilding()`
- `map.enable3DOsmBuilding(op)`
- `map.disable3DOsmBuilding()`
- `map.easy3DMeasuring.start("line", callback)`
- `map.easy3DMeasuring.start("polygon", callback)`
- `map.easy3DMeasuring.stop()`

## api.js 範例索引

`api.js` 是非常重要的實戰知識庫，很多細節只在範例中最清楚。AI 不應把它整份背起來，而應依任務快速定位。

高頻分類:

- 初始化範例: 搜尋 `dgFunc0`、`new Easymap("map")`。
- 右鍵功能: 搜尋 `f_fmenu`，包含右鍵放置標記、測量線段、測量圓、矩形、多邊形、清除圖形。
- 基本地圖操作: 搜尋 `f_OpenDragRotate`、`f_MapRotate`、`f_addcontrol`、`f_statusbar`、`f_zoomTo`、`f_zoomToXY`、`f_panTo`、`f_switchMapType`。
- Popup: 搜尋 `f_openInfoWindow`。
- DragBox: 搜尋 `f_EnableDragBox`、`f_DisableDragBox`。
- 事件: 搜尋 `f_event`、`attachEvent`。
- 測量工具: 搜尋 `f_MeasuringTools`、`f_MeasuringTools_custom`、`f_MeasuringToolsInside`。
- 投影轉換: 搜尋 `f_projTransfer`。
- Ajax: 搜尋 `f_myAjax_async`。
- KML/GeoJSON/GML 轉 WKT: 搜尋 `f_data_format_change`。
- 2D 日照: 搜尋 `show2dSun`。
- 截圖列印: 搜尋 `f_happy_print`、`screenshot`。
- dgMarker: 搜尋 `f_marker`、`f_markers_change_marker`、`f_markers_tooMany`、`f_gmarker_event_show_hide`。
- 2D 物件: 搜尋 `f_dgText`、`f_dgPoint`、`f_dgPolyline`、`f_dgPolygon`、`f_dgCurve`、`f_dgStaticImage`。
- dgWKT 字串/陣列/url: 搜尋 `f_dgWKT_string`、`f_dgWKT_array`、`f_dgWKT_url`。
- WKT from KML: 搜尋 `f_dgWKT_from_kmlurl`。
- WKT 動態改位置/圖片: 搜尋 `f_dgWKT_changepic_position`、`f_dgWKT_change_wkt_position`、`f_dgWKT_change_wkt_position_v2`。
- WKT 蜘蛛展開: 搜尋 `f_dgWKT_spyder_display`。
- WKT 全域樣式: 搜尋 `f_dgWKT_style_global`。
- WKT hover/click: 搜尋 `setFeatureClick`、`setFeatureHover`、`setFeatureMouseOut`。
- dgSource: 搜尋 `new dgSource`、`WMTS`、`WMS`、`XYZ`、`MVT`。
- Heatmap: 搜尋 `dgHeatmap`、`enableHeatmap`。
- Windy: 搜尋 `dgWindy`、`windy`。
- WebGLPoint: 搜尋 `dgWebGLPoint`。
- 3D 啟動: 搜尋 `f_enable3D`、`enable3D`。
- 3D 相機: 搜尋 `f_panTo3D`、`set3DAltitude`、`set3DDistance`、`set3DHeading`、`set3DTilt`。
- 3D 地形高度: 搜尋 `f_get3DGroundAltitude`、`enable3DTerrain`。
- 3D 測量: 搜尋 `f_easy3DMeasuring`。
- 3D 位置設定: 搜尋 `f_easy3DSettingPosition`。
- 3D KML: 搜尋 `f_3Dkml`。
- 3D glTF: 搜尋 `gltf`、`GLTF_URL`、`dg3D('gltf'`。
- 3D Tiles: 搜尋 `dg3D('3dtiles'`、`tileset.json`。
- Cesium Ion: 搜尋 `dg3D('3dion'`。
- 3D 標籤: 搜尋 `dg3DLabelLine`、`dg3DImageLine`。
- 3D 管線/地表: 搜尋 `add3DGroundClass`、`GroundOverlayQuad`。

如果 API 名稱不確定，優先用 `rg` 搜尋:

```powershell
chcp 65001 | Out-Null
rg -n "setDrawMode|dgWKT|enable3D|dg3D\\('gltf'|new dgSource" D:\GD\5project\108easymap\code\easymap7\offical\api.js
```

## SDK 原始碼定位指南

新增或除錯 Easymap 功能時，用這個順序定位:

- CDN loader / 引入問題: `easymap_official\offical\Easymap\easymap.js`
- 預設底圖與啟動設定: `easymap_official\offical\Easymap\map_ini.js` 或 `EasymapDev\src\map.init.js`
- public map API: `EasymapDev\src\easymap.js`
- 3D / Cesium API: `EasymapDev\src\digi3d.js`
- 共用 helper / 轉換: `EasymapDev\src\digimap.js`
- global dg 類別 export: `EasymapDev\src\dg\index.js`
- Marker: `EasymapDev\src\dg\dgMarker.js`
- WKT: `EasymapDev\src\dg\dgWKT.js`
- GeoJSON: `EasymapDev\src\dg\dgGeoJson.js`
- KML: `EasymapDev\src\dg\dgKml.js`
- Source: `EasymapDev\src\dg\dgSource.js`
- 3D object: `EasymapDev\src\dg\dg3D.js`
- WebGL point: `EasymapDev\src\dg\dgWebGLPoint.js`

新增新型別的最低檢查表:

1. 建立 `dg*` model class，設定穩定 `_type`。
2. 在 `src/dg/index.js` import/export，並掛到 `window`。
3. 在 `Easymap.addItem` 或相關 dispatch 補上處理。
4. 在 `removeItem` 補清除邏輯。
5. 建立 feature/layer 時設定 `_easymapClass` 等標記。
6. 若有互動，補 popup/click/hover 路由。
7. 明確決定 2D-only、3D-only 或 2D/3D 都支援。

常見內部標記:

- `_easymapClass`
- `_easymapSubClass`
- `_easymapParentKmlId`
- `_easymapFeatureUID`
- `_instance`
- `_easymap`

## 除錯與效能決策表

### 地圖沒有出現

- 檢查 CDN loader 是否載入成功。
- 檢查 `<div id="map">` 是否有寬高。
- 檢查 console 是否有 `Easymap is not defined`。
- 檢查 `map_ini.js` 是否載入。
- 檢查 mixed content、CORS、404。

### 物件沒有出現

- 確認是否已 `map.addItem(item)`。
- 確認 item 的 `_type` 是否正確。
- 確認資料座標是 lon/lat 或指定 SRS。
- 確認 zoom/extent 是否在可見範圍。
- 確認該 setter 是否必須 addItem 後才能生效。

### 點位偏移或跑到國外

- 檢查 `new dgXY(lon, lat)` 是否誤放成 `lat, lon`。
- 檢查資料來源 EPSG，例如 `EPSG:4326`、`EPSG:3826`。
- 檢查是否需要 `map.projTransfer(...)`。
- 檢查 WKT 座標順序與 `dgWKT` 的 SRS。

### Popup 沒反應

- 確認使用 `setFeatureClick` 或 item onclick 的時機。
- 確認 item 已 `addItem`。
- 確認 feature/layer 沒被其他透明圖層蓋住。
- 確認 callback return 值沒有中斷預期流程。

### 3D 沒反應

- 先確認 `map.enable3D(callback)` callback 有執行。
- 確認 Cesium runtime path 存在。
- 確認 browser console 沒有 WebGL / Cesium asset 錯誤。
- 3D Tiles / glTF 檢查 URL、MIME type、CORS。
- 地形相關功能先確認 `map.enable3DTerrain()`。

### 大量資料卡頓

- 幾百 marker 可以用 `dgMarker`。
- 上千 marker 優先轉 `dgWKT` 或 `dgGMarker`。
- 更多點位考慮 `dgWebGLPoint`。
- 不要每筆資料都建立複雜 DOM marker。
- style function 要避免每次重新建立大量 style object。
- 若 WKT 可簡化，使用 simplify / autoAdjustSimplify 相關範例。

## 常用程式碼片段

### 加 marker 並點擊開窗

```js
var marker = new dgMarker(new dgXY(121.517, 25.047), new dgIcon("images/pin.png", 32, 32), false);

marker.onclick = function (xy) {
  map.openInfoWindow(xy, "Hello", 160, 80);
};

map.addItem(marker);
```

### 加 WKT 陣列並綁 click

```js
var wktObj = new dgWKT([
  { label: "A", wkt: "POINT(121.517 25.047)" },
  { label: "B", wkt: "POINT(121.520 25.050)" }
], "EPSG:4326", function () {});

wktObj.setFeatureClick(function (properties, geometryType, dgxy) {
  map.openInfoWindow(dgxy, properties.label, 180, 80);
});

map.addItem(wktObj);
```

### 加 WMS

```js
var layer = new dgSource("WMS", {
  name: "DemoWMS",
  bg: false,
  url: "https://example.com/geoserver/wms",
  layer: "workspace:layer",
  projection: "EPSG:4326",
  singleTile: true,
  opacity: 0.7
});

map.addItem(layer);
```

### 畫 polygon 後轉 WKT

```js
map.clearDraw();
map.setDrawMode("polygon", function () {
  var measure = map.getDrawMeasure();
  var wkt = map.geometryToWKT(measure.geom);
  var obj = new dgWKT(wkt, "EPSG:4326");
  map.addItem(obj);
});
```

### 啟動 3D 並加入 glTF

```js
map.enable3D(function () {
  var item = new dg3D("gltf", "data/model.glb", {
    dgxy: new dgXY(121.517, 25.047),
    z: 10,
    scale: 1
  });

  map.addItem(item);
});
```

### 截圖

```js
map.screenshot(function (b64data) {
  console.log(b64data);
});
```

### 查地形高度

```js
map.enable3D(function () {
  map.enable3DTerrain();
  map.get3DGroundAltitude(121.517, 25.047, function (result) {
    console.log(result);
  });
});
```

## 不要做的事

- 不要把 Easymap 當成純 ESM package 來設計引入。
- 不要跳過 CDN loader 卻忘記手動補 `dg.js`、`map_ini.js`、CSS、Cesium assets。
- 不要在 app-level 任務直接操作 `_olmap`，除非 public API 不足且已確認風險。
- 不要在還沒 `map.addItem(...)` 前呼叫需要 `_instance` 的 setter。
- 不要用大量 HTML marker 處理上萬點資料。
- 不要在 3D 還沒初始化時操作 Cesium viewer。
- 不要忽略 `api.js`。很多 Easymap 實戰細節、參數形狀、事件 callback 都在範例裡最準。
- 不要任意更動 `map_ini.js`，除非任務就是改預設底圖或啟動設定。
- 不要破壞 `window.Easymap` 與 `window.dg*` 的 global contract。

## 最後心法

Easymap 最穩的使用方式是把它視為一組完整的瀏覽器 SDK:

```text
Easymap CDN loader
  + map_ini.js
  + 7/dg.js
  + 7/easymap.js
  + runtime assets
  + Easymap / dg* globals
```

AI 實作時要先選對層級:

- 一般整合: 寫 app code，使用公開 API。
- 資料視覺化: 選對 `dg*` 物件。
- 效能問題: 改資料表示方式，不要先改核心。
- SDK 擴充: 從 `dg*` class、`addItem` dispatch、remove cleanup、popup/event routing 一路補齊。
- 3D 問題: 先確認 `enable3D`、Cesium assets、terrain、相機與高度。

若能不破壞 CDN/global contract，就優先選擇不破壞的作法。

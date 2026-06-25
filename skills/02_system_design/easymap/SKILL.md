---
name: easymap
description: Easymap 7 GIS 圖台開發助理。當任務提到 Easymap、dgMarker、dgSource、dgGeoJson、dgWKT、dg3D、dgIcon、addItem、Easymap CDN、OpenLayers、OL-Cesium、Cesium 3D，或寫 GIS 圖台、政府防災地圖、空間資訊應用時啟用。提供正確 CDN 引入、API 用法、2D/3D 開發心法、除錯流程、原始碼定位指南。詳細技能樹見同目錄 easymap-dev-2026-05-14.md（27 KB / 921 行）。
---

# Easymap Skill

完整技能樹（架構、API、3D Cesium、除錯、anti-pattern、程式碼片段）見：
**[easymap-dev-2026-05-14.md](./easymap-dev-2026-05-14.md)**

來源：準線智慧科技（focusit.com.tw）+ 逢甲大學 GIS 中心。作者 jeffrey@gis.tw / john@gis.tw。

## 觸發詞

- Easymap、Easymap 7、Easymap CDN
- `dgMarker` / `dgSource` / `dgGeoJson` / `dgWKT` / `dg3D` / `dgIcon` / `dgXY`
- `addItem` / `removeItem` / `openInfoWindow` / `attachEvent`
- OpenLayers、OL-Cesium、Cesium 3D、3D Tiles、glTF
- 政府防災地圖、GIS 圖台、空間資訊應用、雨量站、淹水監測

## 9 條核心規則（速覽）

1. **瀏覽器端 CDN/global SDK，不是 npm ESM**
2. 用 `Easymap + dg* + map.addItem(...) + map.removeItem(...)` 公開 lifecycle
3. **不操作** `_olmap` / `_items` / `_instance` / `_olcesium` 等私有屬性
4. 範例細節先查 `D:\GD\5project\108easymap\code\easymap7\offical\api.js`
5. 沒本機檔查正式範例 `http://www.focusit.com.tw/easymap/api.js`
6. 載入 / 底圖 / 投影問題查 `map_ini.js` 或 `src/map.init.js`
7. addItem / popup / 事件 / 2D 圖層問題查 `src/easymap.js`
8. 3D / Cesium / 地形問題查 `src/digi3d.js`
9. **不破壞 CDN/global contract**

## 最短可用範例

```html
<script src="https://www.focusit.com.tw/easymap/easymap/easymap.js"></script>
<div id="map" style="width:100%; height:100vh;"></div>
<script>
  var map = new Easymap("map");
  var icon = new dgIcon("https://www.focusit.com.tw/easymap/easymap/7/imgs/marker.png", 32, 32);
  var marker = new dgMarker(new dgXY(121.517, 25.047), icon, false);
  marker.onclick = function (xy) {
    map.openInfoWindow(xy, "<h3>Hello Easymap</h3>", 180, 100);
  };
  map.addItem(marker);
</script>
```

## 9 條 anti-pattern（不要做的事）

- 當 ESM package 設計引入
- 跳過 CDN loader 又忘記手動補 `dg.js` / `map_ini.js` / CSS / Cesium assets
- app-level 直接操作 `_olmap`（除非 public API 不足且確認風險）
- 還沒 `map.addItem(...)` 前呼叫需要 `_instance` 的 setter
- 用大量 HTML marker 處理上萬點（改用 `dgWKT` / `dgWebGLPoint`）
- 3D 還沒 `enable3D` 完成前操作 Cesium viewer
- 忽略 `api.js` 範例（很多細節只在那裡最準）
- 任意更動 `map_ini.js`（除非任務就是改預設底圖／啟動設定）
- 破壞 `window.Easymap` / `window.dg*` global contract

## 3D 啟動模式（最常踩坑）

```js
map.enable3D(function () {
  map.enable3DTerrain();
  // 此 callback 內才能安全使用 dg3D / Cesium 相關 API
});
```

## 詳細查找

詳細 API、座標投影、繪圖測量、資料轉換、WKT/KML/GeoJSON、dgSource、3D Cesium、除錯決策表、SDK 原始碼定位、常用程式碼片段，請見 [`easymap-dev-2026-05-14.md`](./easymap-dev-2026-05-14.md)。

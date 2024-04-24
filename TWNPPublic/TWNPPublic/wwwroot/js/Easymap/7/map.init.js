//////////////////////////////////////////////
//				參	數	設	定				//
//////////////////////////////////////////////
// import { dgSource } from './dg'
//初始座標系統
let _coord = 'WGS84'
/***
 * 項目
 *	TM2_67		TWD67二度分帶
 *	TM2_97		TWD97二度分帶
 *	TWD67		TWD67經緯度
 *	TWD97		TWD97經緯度
 *	WGS84		TWD97經緯度
 *			(以上之外的字串將以WGS84為預設)
 */

//圖台階層數
let _numZoomLevels = 22

//圖台解析度(底圖)
let _resolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]

//初始座標(請依照_Coord指定的座標系統給定正確的系統值)
let cx = 120.64681
let cy = 24.180936
//cx = 214116;
//cy = 2675116;

//初始zoom
let cz = 7

//鷹眼level差
let _dcz = 5

//錯誤圖片的路徑
let _error_pic = 'modules/easymap/imgs/onerror.png'

//除錯模式
let _debug = true

//方向按鈕背景寬高
var zmScaleBK = [5, 5]
//比例尺離左下角位置
var zmScaleLine = [10, 25]
//鷹眼位置
var zmWMap = [0, 0]
//切換底圖位置
var zmSwitcher = [10, 10]

//_sAuthor = true; //右下角logo
let _sStatus = true //下方狀態列
let _sScaleBar = true //左下角比例尺

//測量樣式
let _lineStyle = {
    strokeWidth: 3,
    strokeOpacity: 1,
    strokeColor: '#666666',
    strokeDashstyle: 'dash', //(“dot”, “dash”, “dashdot”, “longdash”, “longdashdot”, or “solid”)
}
//多邊型測量(圓形、矩形)
let _polygonStyle = {
    strokeWidth: 3,
    strokeOpacity: 1,
    strokeColor: '#666666',
    fillColor: '#ffffff',
    fillOpacity: 0.5,
    strokeDashstyle: 'dash', //(“dot”, “dash”, “dashdot”, “longdash”, “longdashdot”, or “solid”)
}

//初始圖層
//_mname = "VectorTile";	//需與下列"底圖設定"之圖層的name欄位相同
let _mname = 'google'

if (_dm4_maps == undefined) var _dm4_maps = []
/******************************************************************************************/
/******************************************************************************************/
/***			底			圖				設				定                          ***/
/******************************************************************************************/
/******************************************************************************************/
//預設resolutions
var _PUBLIC_RESOLUTIONS = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.29858214169740675,
    0.1492910708487034,
]
//預設servder resolutions
var _PUBLIC_SERVER_RESOLUTIONS = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.29858214169740675,
    0.1492910708487034,
]
/* 底圖設定：WMTS 格式
 *	格式說明(*為必填)
 *		_dm4_maps.push(new dgSource(type,options));
 *		type[string]	底圖的型態，目前提供下列
 *						1. OSM  谷歌切圖型式
 *						2. WMTS
 *
 *		options[object] 其他參數設定
 *			name*[string] 				底圖的英文名稱，在系統裡使用，請勿重覆
 *			chname*[string]				欲顯示的名稱，可中文
 *			bg*[bool]					是否為底圖
 *			url*[array]	 				WMTS service url
 *			layer*[string]				WMTS提供的圖層名稱
 *			matrixSet*[string]			座標系統
 *			matrixIds[array]			每一個zoom的坐標系統
 *			format[string]				圖片的MIME type, 預設為“image/jpeg”.
 *
 *
 */

///*******************/
///* 臺灣通用電子地圖 */
///*******************/
var op0 = {}
op0.bg = true
op0.name = 'EMAP5'
op0.chname = '臺灣通用電子地圖'
op0.iconMax = 'imgs/interchangeable.png'
op0.iconMin = 'imgs/mapF-2.png'
op0.url = 'https://wmts.nlsc.gov.tw/wmts'
op0.layer = 'EMAP'
op0.matrixSet = 'EPSG:3857'
op0.format = 'image/png'
op0.zoomOffset = 0
op0.serverResolutions = null
_dm4_maps.push(new dgSource('WMTS', op0))

/**************/
/* 通用版電子地圖透明 */
/**************/
var _options03 = {}
_options03.bg = true
_options03.name = 'EMAP_2'
_options03.chname = '通用版電子地圖透明'
_options03.iconMax = 'imgs/interchangeable.png'
_options03.iconMin = 'imgs/mapF-2.png'
_options03.url = 'https://maps.nlsc.gov.tw/S_Maps/wmts'
_options03.layer = 'EMAP2'
_options03.matrixSet = 'EPSG:3857'
_options03.format = 'image/png'
_options03.serverResolutions = null
_dm4_maps.push(new dgSource('WMTS', _options03))

/****************************/
/* 臺灣通用電子地圖正射影像  */
/***************************/
var _options06 = {}
_options06.bg = true
_options06.name = 'PHOTO2'
_options06.chname = '臺灣通用電子地圖正射影像'
_options06.iconMax = 'imgs/interchangeable.png'
_options06.iconMin = 'imgs/mapF-2.png'
_options06.url = 'https://wmts.nlsc.gov.tw/wmts'
_options06.layer = 'PHOTO2'
_options06.matrixSet = 'EPSG:3857'
_options06.format = 'image/png'
_options06.serverResolutions = null
_dm4_maps.push(new dgSource('WMTS', _options06))

/* 底圖設定：OSM 格式
 *	格式說明(*為必填)
 *		_dm4_maps.push(new dgSource(type,options));
 *		type[string]	底圖的型態，目前提供下列
 *						1. OSM  谷歌切圖型式
 *						2. WMTS
 *
 *		options[object] 其他參數設定
 *			name*[string] 				底圖的英文名稱，在系統裡使用，請勿重覆
 *			chname*[string]				欲顯示的名稱，可中文
 *			bg*[bool]					是否為底圖
 *			resolutions[array]			圖台的resolutions
 *			serverResolutions[array]	來源主機的resolutions
 *			url*[array]	 				圖資的網址，請以下列規則做格式化 (google規則切圖)，可輸入最多三個網址
 *										分散主機效能
 *											ex: https://mts1.google.com/vt?hl=zh-TW&gl=TW&lyrs=m&x=${x}&y=${y}&z=${z}
 */

/**************/
/* Easymap底圖 */
/**************/
var op1 = {}
op1.bg = true
op1.name = 'easymap'
op1.chname = 'Easymap'
op1.iconMax = 'imgs/easymap.png'
op1.iconMin = 'imgs/mapA-2.png'
op1.url =
    'http://59.120.223.173/TILEMAP/tcsafe20131014/${z}/${x}/z${z}x${x}y${y}.png'
op1.tileOptions = { crossOriginKeyword: null }
op1.resolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
op1.serverResolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
_dm4_maps.push(new dgSource('GOOGLE', op1))

/**************/
/*谷歌街道圖 */
/**************/
var _op1 = {}
_op1.bg = true
_op1.name = 'google'
_op1.chname = '谷歌街道圖'
_op1.iconMax = 'imgs/googlestreets.png'
_op1.iconMin = 'imgs/mapB-2.png'
_op1.url =
    'https://mts1.google.com/vt?hl=zh-TW&gl=TW&lyrs=m&x=${x}&y=${y}&z=${z}'
_op1.tileOptions = { crossOriginKeyword: null }
_op1.resolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
_op1.serverResolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]

//add a layer
_dm4_maps.push(new dgSource('GOOGLE', _op1))

/**************/
/*谷歌航照圖 */
/**************/
var _options3 = {}
_options3.bg = true
_options3.name = 'googlesatellite'
_options3.chname = '谷歌航照圖'
_options3.iconMax = 'imgs/googlestreets.png'
_options3.iconMin = 'imgs/mapB-2.png'
_options3.url =
    'https://mts1.google.com/vt/lyrs=m@267065157&hl=zh-TW&x=${x}&y=${y}&z=${z}&s=Gal&lyrs=s'
_options3.tileOptions = { crossOriginKeyword: null }
_options3.resolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
_options3.serverResolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
//add a layer
_dm4_maps.push(new dgSource('GOOGLE', _options3))

/**************/
/*谷歌地形圖 */
/**************/
var _options4 = {}
_options4.bg = true
_options4.name = 'googlephysical'
_options4.chname = '谷歌地形圖'
_options4.iconMax = 'imgs/googlestreets.png'
_options4.iconMin = 'imgs/mapB-2.png'
_options4.url =
    'https://mts1.google.com/vt/lyrs=m@267065157&hl=zh-TW&x=${x}&y=${y}&z=${z}&s=Gal&lyrs=t@129,r@183000000'
_options4.tileOptions = { crossOriginKeyword: null }
_options4.resolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
_options4.serverResolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
//add a layer
_dm4_maps.push(new dgSource('GOOGLE', _options4))

/**************/
/*谷歌灰階圖 */
/**************/
var _options5 = {}
_options5.bg = true
_options5.name = 'googlehybrid'
_options5.chname = '谷歌灰階圖'
_options5.iconMax = 'imgs/googlestreets.png'
_options5.iconMin = 'imgs/mapB-2.png'
_options5.url =
    'https://mts1.google.com/vt/lyrs=m@267065157&hl=zh-TW&x=${x}&y=${y}&z=${z}&s=Gal&lyrs=m@184000000&src=apiv3&hl=zh-TW&s=&apistyle=s.t%3A1%7Cp.s%3A-100%2Cs.t%3A5%7Cp.s%3A-100%2Cs.t%3A2%7Cp.s%3A-100%2Cs.t%3A3%7Cp.s%3A-100%2Cs.t%3A4%7Cp.s%3A-100%2Cs.t%3A6%7Cp.s%3A-100&s=G&style=api%7Csmartmaps'
_options5.tileOptions = { crossOriginKeyword: null }
_options5.resolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
_options5.serverResolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
//add a layer
_dm4_maps.push(new dgSource('GOOGLE', _options5))

/**************/
/*等高線圖 */
/**************/
var _options6 = {}
_options6.bg = true
_options6.name = 'averageLevel'
_options6.chname = '等高線圖'
_options6.iconMax = 'imgs/googlestreets.png'
_options6.iconMin = 'imgs/mapB-2.png'
_options6.url = 'https://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png'
_options6.tileOptions = { crossOriginKeyword: null }
_options6.resolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
_options6.serverResolutions = [
    156543.03390625,
    78271.516953125,
    39135.7584765625,
    19567.87923828125,
    9783.939619140625,
    4891.9698095703125,
    2445.9849047851562,
    1222.9924523925781,
    611.4962261962891,
    305.74811309814453,
    152.87405654907226,
    76.43702827453613,
    38.218514137268066,
    19.109257068634033,
    9.554628534317017,
    4.777314267158508,
    2.388657133579254,
    1.194328566789627,
    0.5971642833948135,
    0.2985821416974068,
    0.1492910708487034,
    0.0746455354243517,
]
//add a layer
_dm4_maps.push(new dgSource('GOOGLE', _options6))

///**************/
///*Vector Tile */
///**************/
var _op1 = {}
_op1.bg = true
_op1.name = 'VectorTile'
_op1.chname = '向量圖專'
_op1.url =
    'https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=UhguM5rA4BKa6p2UTZrG'
_op1.styleUrl =
    'https://api.maptiler.com/maps/dd75aeb4-d2af-4e01-b3d4-5bd7929b0a41/style.json?key=waCfAYgDuImswi5zkmku' //https://api.maptiler.com/maps/1e0b3a69-e541-4d53-848a-8810646c2551/style.json?key=NKc1L4DU8rAW16aWI7Pa';

//add a layer
_dm4_maps.push(new dgSource('VectorTile', _op1))

/**************/
/*空白圖層 */
/**************/

var _options7 = {}
_options7.bg = true
_options7.name = 'empty'
_options7.chname = 'empty'
_options7.iconMax = 'imgs/map-empty.png'
_options7.iconMin = 'imgs/mapB-2.png'
_options7.url = 'https://easymap.gis.tw/easymap/imgs/256white.png'
_options7.tileOptions = { crossOriginKeyword: null }

_dm4_maps.push(new dgSource('GOOGLE', _options7))

/************************/
/*國土測繪中心16進位格式 */
/************************/
var _options8 = {}
_options8.bg = true
_options8.name = 'NLSC'
_options8.url = 'https://giso.emic.gov.tw/tiles/一般版/L{z}/R{y}/C{x}.jpg'

//add a layer
_dm4_maps.push(new dgSource('NLSCHex', _options8))
window._easymap_directory_path = './Easymap'
// let _easymap_directory_path = window._EASYMAP_DIR_PATH
// export {
//     _coord,
//     _numZoomLevels,
//     _resolutions,
//     cx,
//     cy,
//     cz,
//     _dcz,
//     _error_pic,
//     _debug,
//     zmScaleBK,
//     zmScaleLine,
//     zmWMap,
//     zmSwitcher,
//     _sStatus,
//     _sScaleBar,
//     _lineStyle,
//     _polygonStyle,
//     _mname,
//     _dm4_maps,
//     _easymap_directory_path,
// }

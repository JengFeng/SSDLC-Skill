/* 圖層相關
 * LayerTree1.checkByLAYER_SN(layerSn, selected)    // 開關圖層 layerSn: 圖層識別碼、selected: 開/關 true/ false
 * LayerTree1.isCheckedByLAYER_SN(layerSn)          // 取得圖層開關狀態(依據圖層識別碼)
 * LayerTree1.uncheckAll()                          // 關閉所有圖層
 * LayerTree1.clear()                               // 清除所有圖層、圖徵
 *
 */
var LayerTree1 = null,
    LayerTree2 = null;

var LayerMenuTree = function () {
    //# Parameter
    this.isInited = false;   // 是否初始化
    this.version = 0;        // 圖台版本
    this.isInited = false;   // 是否初始化
    this._instance = null;   // 目錄的 Instance
    this.useRole = false;    // 是否依據使用者權限
    this.folderId = '';      // 動態根目錄識別碼
    this.iconUrl = '';       // 圖示根目錄
    this.fileUrl = '';       // 檔案根目錄
    this._layers = [];       // 圖層
    this._dirs = [];         // 目錄
    this._bgs = [];          // 底圖
    this.onSelect = null;    // 點選圖層之事件
    this.elm = {
        boxWindow: '',  // 視窗
        boxContent: '', // 視窗內容
        boxLegend: '',  // 圖例
        boxLayer: '',   // 圖層
        boxBasemap: '', // 底圖
        menuFolderCheckBox: 'li.folder-node > a > i.jstree-checkbox',
    }
    //# Public Function
    this.start = () => {
        var listLayer = getJsonData(GetLayerApi(), 'GET', null, '無圖層資料', '圖層資料錯誤');
        listLayer.forEach(item => {
            item.id = item.LAYER_SN;
            item.status = '';
        });
        this._layers = listLayer;
        //MM.easymap.items = listLayer;
        this._dirs = getJsonData(GetDirApi(), 'GET', null, '無圖層目錄資料', '圖層目錄資料錯誤');
        this._bgs = getJsonData(GetBaseMapApi(), 'GET', null, '無底圖資料', '底圖資料錯誤');
        Tmpl.init();
        RenderInit();
        RunderTree();
        RenderBgMap();
        
        RenderScrollBar($(this.elm.boxLegend));
        RenderScrollBar($(this.elm.boxBasemap));
        this.isInited = true;
    }                         // 開始(初始化圖層目錄)
    this.switchMap = (elm, name) => {
        if (name === undefined || name === '') return;
        var _map = GetLayerMap();
        _map.switchMap(name);
        $(elm).addClass('active').siblings().removeClass('active');
    }            // 切換底圖
    this.getLayers = () => {
        return this._layers;
    }                     // 取得圖層
    this.getDirectories = () => {
        return this._dirs;
    }                // 取得圖層目錄
    this.getLayersByDirname = dirName => {
        let list = [];
        this._layers.forEach(item => {
            if (item.DIR_NAME != dirName) return;
            list.push(item);
        });
        return list;
    }       // 取得圖層(依據圖層目錄名稱)
    this.getLayersByDirSN = dirSn => {
        let list = [];
        this._layers.forEach(item => {
            if (item.LAYERDIR_SN != dirSn) return;
            list.push(item);
        });
        return list;
    }           // 取得圖層(依據圖層目錄識別碼)
    this.getChecked = layer => {
        if (this._instance.get_node(layer.LAYER_SN) == null) return false;
        return this._instance.get_node(layer.LAYER_SN).state.selected;
    }                 // 取得圖層開關狀態(依據圖層)
    this.isCheckedByLAYER_SN = sn => {
        if (this._instance == undefined) return;
        if (this._instance.get_node(sn) == null) return false;
        return this._instance.get_node(sn).state.selected;
    }           // 取得圖層開關狀態(依據圖層識別碼)
    this.check = (layer, sw) => {
        sw ? this._instance.check_node(layer.LAYER_SN) : this._instance.uncheck_node(layer.LAYER_SN);
    }                // 開關圖層(依據圖層)
    this.checkByLAYER_SN = (layerSn, sw) => {
        layerSn = 'l_' + layerSn;
        sw ? this._instance.check_node(layerSn) : this._instance.uncheck_node(layerSn);
    }    // 開關圖層(依據圖層識別碼)
    this.checkByName = (name, sw) => {
        this._layers.every(item => {
            if (item.NAME != name) return true;
            sw ? this._instance.check_node(item.LAYER_SN) : this._instance.uncheck_node(item.LAYER_SN);
            return false;
        });
    }           // 開關圖層(依據圖層名稱)
    this.uncheckAll = () => {
        var layers = LayerSlef._instance.get_checked();
        layers.forEach(item => {
            LayerSlef._instance.uncheck_node(item);
        });
    }                    // 關閉所有圖層
    this.clearFeature = list => {
        while (list.length > 0) {
            if (map != null) map.removeItem(list[0]);
            if (map2 != null) map2.removeItem(list[0]);
            list.splice(0, 1);
        }
    }                // 剔除圖徵
    this.clear = () => {
        this.uncheckAll();
        //# 清除所有圖徵
        while (MM.easymap.items.length > 0) {
            MM.easymap.removeItem(MM.easymap.items[0]);
        }
    }                         // 清除所有圖層、圖徵
    //# Private Function
    let LayerSlef = this;
    let Tmpl = {
        legend: '', // 圖例
        bg: '',     // 底圖
        init() {
            $(LayerSlef.elm.boxBasemap).mCustomScrollbar('destroy');    // 先把 Scrollbar 撤除，以便拿取底圖項目
            this.legend = $(LayerSlef.elm.boxLegend).html().replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, '');
            this.bg = $(LayerSlef.elm.boxBasemap).html().replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, '');
            $(LayerSlef.elm.boxLegend).empty().removeClass('d-none');
            $(LayerSlef.elm.boxBasemap).empty().removeClass('d-none');
        }   // 初始化
    }                            // 樣板
    let RenderInit = () => {
        var _default = 0,
            $block = $(LayerSlef.elm.boxContent),
            $tabs = $block.find('.tabs'),
            $tabsLi = $tabs.find('li'),
            $tab_content = $block.find('.tab_content'),
            $tab_contentLi = $tab_content.find('li'),
            _width = $tab_content.width();

        // 當滑鼠移到 .tabs li 上時要套用 .hover 樣式
        // 移出時要移除 .hover 樣式
        $tabsLi
            .hover(function () {
                if ($(this).hasClass('active')) return; // 若被滑鼠移上去的 li 是目前顯示的頁籤就不做任何動作
                $(this).toggleClass('hover');
            })
            .click(function () {    // 當滑鼠點擊 .tabs li 時
                // 先取出被點擊及目前顯示的頁籤與索引
                var $active = $tabsLi.filter('.active').removeClass('active'),
                    _activeIndex = $active.index(),
                    $this = $(this).addClass('active').removeClass('hover'),
                    _index = $this.index(),
                    isNext = _index > _activeIndex;
                    if (_activeIndex == _index) return; // 如果被點擊的頁籤就是目前已顯示的頁籤, 則不做任何動作

                    // 依索引大或小來決定移動的位置
                    $tab_contentLi.eq(_activeIndex).stop().animate({
                        left: isNext ? -_width : _width
                    }).end().eq(_index).css('left', isNext ? _width : -_width).stop().animate({
                        left: 0
                    });
            });

        // 先把預設要顯示的頁籤加上 .active 樣式及顯示相對應的內容
        $tabsLi.eq(_default).addClass('active');
        $tab_contentLi.eq(_default).siblings().css({ left: _width });
    }                // 渲染初始化
    let RenderBgMap = () => {
        $(LayerSlef.elm.boxBasemap).empty();
        $(LayerSlef.elm.boxBasemap).empty();
        var clickElm = LayerSlef.version == 1 ? 'LayerTree1' : 'LayerTree2';
        LayerSlef._bgs.forEach(item => {
            var isActive = item.PRELOAD === '1' ? ' active' : '',
                imgUrl = (location.href.indexOf('localhost') < 0 ? location.href : origin) + '/images/' + item.LEGEND,
                boxItem = Tmpl.bg
                    .replace('{isActive}', isActive)
                    .replace('{clickElm}', clickElm)
                    .replace('{item.LAYER}', item.LAYER)
                    .replace('//:0', imgUrl)
                    .replace(/{item.LAYER_NAME}/g, item.LAYER_NAME);
            $(LayerSlef.elm.boxBasemap).append(boxItem);
        });
        $(LayerSlef.elm.boxBasemap).addClass('layerBoxScrollbar');
        RenderScrollBar($(LayerSlef.elm.boxBasemap));
    }               // 渲染底圖
    let RunderTree = () => {
        var dataLayers = getJsonData(GetLayerListApi(LayerSlef.folderId), 'GET', null, '無圖層清單資料', '圖層清單資料錯誤'),
            iconOrigin = location.href.indexOf('localhost') < 0 ? location.href : origin,
            list = [];
        
        dataLayers.forEach(item => {
            item.icon = iconOrigin + item.icon;
            if (item.children == null) return;
            item.children.forEach(item2 => {
                item2.icon = iconOrigin + item2.icon;
                item2.legend = iconOrigin + item2.legend;
            });
            list.push(item);
        });

        $(LayerSlef.elm.boxLayer)
            .on('loaded.jstree', function (e, data) {
                LayerSlef._instance = data.instance;
                HideFolderCheckBox();   // 隱藏 Folder 的 Checkbox
                if (LayerSlef.onLoad != null) LayerSlef.onLoad(LayerSlef.getLayers(), LayerSlef.getDirectories());
                RenderScrollBar($(LayerSlef.elm.boxLayer));
            })
            .on('open_node.jstree', function (e, data) {
                HideFolderCheckBox();   // 隱藏 Folder 的 Checkbox
            })     // Initial
            .on('hover_node.jstree', function (e, data) {
                $('li[role="treeitem"] a').each(function (index) { $(this).prop('title', $(this).text()) })
            })
            .on('changed.jstree', function (e, data) {
                if (data.node == undefined) return true;
                //# 資料夾
                if (data.node.children.length >= 1) {
                    LayerSlef._instance.toggle_node(data.node.id);
                    return true;
                }
                //# 圖層
                var layerId = parseInt(data.node.id.replace('l_', '')),
                    layer = LayerSlef._layers.getById(layerId),
                    selected = data.node.state.selected;
                if (layer == undefined) return;

                RenderLayerItem(data.node, selected);    // 渲染圖層
                if (LayerSlef.onSelect != null) LayerSlef.onSelect(layer, selected); // 選擇圖層額外事件

                //# 是否顯示可視階層
                //if (MM.easymap.in_zoom(layer) == false && selected) {
                //    layer.status = 'not_in_zoom';
                //    LayerSlef._gray(layer.id);
                //    return;
                //}

                if (selected) {
                    MM.easymap.addItem(layer);
                    layer.status = 'added';
                }
                else {
                    if (layer.status != '') MM.easymap.removeItem(layer);
                    layer.status = '';
                }

                //# 連動圖層設定 todo
            })       // 圖層開/關時
            .on('load_all.jstree', function (e, data) {   
            })
            .on('after_open.jstree', function (e, data) {
            })    // 開啟 Folder 之後
            .on('dehover_node.jstree', function (e, data) {
            })  // 
            .jstree({
                plugins: ['wholerow', 'checkbox'],
                checkbox: {
                    'keep_selected_style': false,   // a boolean indicating if the selected style of a node should be kept, or removed
                    "whole_node": true, // a boolean indicating if clicking anywhere on the node should act as clicking on the checkbox
                    "three_state": false,   // checkbox 跟 child 對應反應(a boolean indicating if checkboxes should cascade down and have an undetermined state)
                    "cascade": 'up+undetermined',
                    // This setting controls how cascading and undetermined nodes are applied
                    // If 'up' is in the string - cascading up is enabled, 
                    // if 'down' is in the string - cascading down is enabled, 
                    // if 'undetermined' is in the string - undetermined nodes will be used.
                    "tie_selection": true
                    // This setting controls if checkbox are bound to the general tree selection or to an internal array maintained by the checkbox plugin. 
                    // Defaults to true, only set to false if you know exactly what you are doing.
                },
                core: {
                    animation: 350,
                    data: list
                    //data: {
                    //    url: GetLayerListApi(),
                    //    data: function (node) {
                    //        console.log(data)
                    //        //return {
                    //        //    id: '',
                    //        //    ROLE_SN: '',
                    //        //    iconpath: escape(LayerSlef.iconpath),
                    //        //    userole: false,
                    //        //    foldersn: LayerSlef.folderId
                    //        //};
                    //        //return JSON.parse(data);
                    //        }
                    //}
                }
            });
    }                // 排序圖層目錄
    let RenderLayerItem = (item, sw) => {
        if (sw) {
            RenderLayerLegend(item);
            $('#' + item.id).click(function () {
                if (this.checked) return;
                LayerSlef._instance.uncheck_node(this.id);
            });
        }
        else {
            document.getElementById(item.id).parentNode.parentNode.parentNode.parentNode.remove();
        }
    }   // 渲染圖層
    let RenderLayerLegend = item => {
        var div = Tmpl.legend
            .replace('{checkBoxId}', item.id)
            .replace(/{name}/g, item.text)
            .replace('//:0', item.original.legend);
        $(LayerSlef.elm.boxLegend + ' .mCSB_container').append(div);
    }       // 渲染圖例
    let RenderScrollBar = elm => {
        elm.mCustomScrollbar({
            autoHideScrollbar: true,
            advanced: {
                updateOnContentResize: true,
                updateOnImageLoad: false
            },
            theme: "minimal-dark",
            mouseWheel: { preventDefault: true }
        });
        elm.mCustomScrollbar("update");
    }          // 渲染滾軸
    let getJsonData = (dataUrl, type, obj, noneMsg, errMsg, callback) => {
        let data = null,
            ajax = $.ajax({
                url: dataUrl,
                type: type,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                async: false,
                data: obj == null ? null : JSON.stringify(obj),
                success(result) {
                    if (!result == '') {
                        let l = JSON.parse(result);
                        if (typeof (callBack) != 'undefined') callBack.apply(l);
                        else data = l;
                    }
                    else console.log(noneMsg);
                },
                error(error) {
                    console.log(errMsg);
                }
            });
        ajax.always(function () { });
        return data != null ? data : [];
    }   // 取得 Json 資料
    let GetLayerMap = () => {
        return LayerSlef.version == 1 ? Layer1.map : Layer2.map;
    }               // 取得圖台
    //# JsTree
    let HideFolderCheckBox = () => {
        $(LayerSlef.elm.menuFolderCheckBox).hide();
    }        // 隱藏 Folder 的 Checkbox
    return this;
}

function LayerMenuInit1(item) {
    console.log('圖臺目錄 1 初始化');
    //# MMJS Easymap 設定
    MM.easymap.map = item.map;
    MM.easymap.proxy = GetFileProxyApi() + '?dataUrl=';
    MM.easymap.uploadpath = item.uploadPath != undefined ?
        item.uploadPath :
        ((location.href.indexOf('localhost') < 0 ? location.href : origin) + '/uploadFiles/EzLayer/');   // 檔案路徑

    LayerTree1 = new LayerMenuTree();
    LayerTree1.folderId = item.folderId !== undefined ? item.folderId : '0';    // 無設定，預設根目錄
    LayerTree1.version = 1;
    LayerTree1.elm.boxWindow = '#boxLayerWindow1';
    LayerTree1.elm.boxContent = '#boxLayerAbgne1';
    LayerTree1.elm.boxLegend = '#boxLegend1';
    LayerTree1.elm.boxLayer = '#boxLayer1';
    LayerTree1.elm.boxBasemap = '#boxBg1'
    LayerTree1.onSelect = item.onSelect != undefined ? item.onSelect : null;  // 選擇圖層事件
    LayerTree1.start();
}

function LayerMenuInit2(item) {
    console.log('圖臺目錄 2 初始化');
    //# MMJS Easymap 設定
    MM.easymap.map = item.map;
    MM.easymap.proxy = GetFileProxyApi() + '?dataUrl=';
    MM.easymap.uploadpath = item.uploadPath != undefined ?
        item.uploadPath :
        ((location.href.indexOf('localhost') < 0 ? location.href : origin) + '/uploadFiles/EzLayer/');   // 檔案路徑

    LayerTree2 = new LayerMenuTree();
    LayerTree2.version = 2;
    LayerTree2.folderId = item.folderId !== undefined ? item.folderId : '0';    // 無設定，預設根目錄
    LayerTree2.elm.boxWindow = '#boxLayerWindow2';
    LayerTree2.elm.boxContent = '#boxLayerAbgne2';
    LayerTree2.elm.boxLegend = '#boxLegend2';
    LayerTree2.elm.boxLayer = '#boxLayer2';
    LayerTree2.elm.boxBasemap = '#boxBg2'
    LayerTree2.onSelect = item.onSelect != undefined ? item.onSelect : null;  // 選擇圖層事件
    LayerTree2.start();
}
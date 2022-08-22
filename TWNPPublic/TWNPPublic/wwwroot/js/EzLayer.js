/* 圖層相關
 * LayerTree1.checkByLAYER_SN(layerSn, selected)    // 開關圖層 layerSn: 圖層識別碼、selected: 開/關 true/ false
 * LayerTree1.isCheckedByLAYER_SN(layerSn)          // 取得圖層開關狀態(依據圖層識別碼)
 * LayerTree1.uncheckAll()                          // 關閉所有圖層
 * LayerTree1.clear()                               // 清除所有圖層、圖徵
 *
 */
var LayerTree1 = null, LayerTree2 = null;

var LayerMenuTree = function () {
    //# Parameter
    this.inited = false;     // 是否初始化
    this.version = 0;        // 圖台版本
    this.easymap = null;     // Easynap
    this._instance = null;   // 目錄的 Instance
    this.useRole = false;    // 是否依據使用者權限
    this.folderId = '';      // 動態根目錄識別碼
    this.iconUrl = '';       // 圖示根目錄
    this.fileUrl = '';       // 檔案根目錄
    this._layers = [];       // 圖層
    this._dirs = [];         // 目錄
    this._bgs = [];          // 底圖
    this.onSelect = null;    // 點選圖層之事件
    this._preloadLayerCounter = 0;
    this.elm = {
        boxWindow: '',  // 視窗
        boxContent: '', // 視窗內容
        boxLegend: '',  // 圖例
        boxLayer: '',   // 圖層
        boxBasemap: '', // 底圖
        menuFolderCheckBox: 'li.folder-node > a > i.jstree-checkbox',
        treeIcon: ''
    }
    //# Public Function
    this.start = () => {
        var listLayer = getJsonData(GetLayerApi(this.folderId), 'GET', null, '無圖層資料', '圖層資料錯誤');
        listLayer.forEach(item => {
            item.id = item.LAYER_SN;
            item.status = '';
        });
        this._layers = listLayer;
        //MM.easymap.items = listLayer;
        this._dirs = getJsonData(GetDirApi(), 'GET', null, '無圖層目錄資料', '圖層目錄資料錯誤');
        this._bgs = getJsonData(GetBaseMapApi(), 'GET', null, '無底圖資料', '底圖資料錯誤');

        GetLayerMap().attachEvent('moveend', () => { CheckLayerInZoom(); });    // 設定移動圖台案件

        Tmpl.init();
        RenderInit();
        RunderTree();
        RenderBgMap();
        
        RenderScrollBar($(this.elm.boxLegend));
        RenderScrollBar($(this.elm.boxBasemap));
        if (this.isHide) $(this.elm.boxWindow).hide();
        if ($(window).width() >= 768) $(`${this.elm.boxWindow} .layerBox`).addClass('open'); // 寬度以上自動開啟
        this.inited = true;
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
        sw ? this._instance.check_node('l_' + layer.LAYER_SN) : this._instance.uncheck_node('l_' + layer.LAYER_SN);
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
        var layers = LayerSelf._instance.get_checked();
        layers.forEach(item => {
            LayerSelf._instance.uncheck_node(item);
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
        while (this.easymap.items.length > 0) {
            this.easymap.removeItem(this.easymap.items[0]);
        }
    }                         // 清除所有圖層、圖徵
    //# Private Function
    let LayerSelf = this;
    let Tmpl = {
        legend: '', // 圖例
        bg: '',     // 底圖
        init() {
            $(LayerSelf.elm.boxBasemap).mCustomScrollbar('destroy');    // 先把 Scrollbar 撤除，以便拿取底圖項目
            this.legend = $(LayerSelf.elm.boxLegend).html().replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, '');
            this.bg = $(LayerSelf.elm.boxBasemap).html().replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, '');
            $(LayerSelf.elm.boxLegend).empty().removeClass('d-none');
            $(LayerSelf.elm.boxBasemap).empty().removeClass('d-none');
        }   // 初始化
    }                             // 樣板
    let RenderInit = () => {
        var _default = 0,
            $block = $(LayerSelf.elm.boxContent),
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
    }                 // 渲染初始化
    let RenderBgMap = () => {
        $(LayerSelf.elm.boxBasemap).empty();
        $(LayerSelf.elm.boxBasemap).empty();
        var clickElm = LayerSelf.version == 1 ? 'LayerTree1' : 'LayerTree2';
        LayerSelf._bgs.forEach(item => {
            var isActive = item.PRELOAD === '1' ? ' active' : '',
                imgUrl = GetWebsiteUrl() + '/images/' + item.LEGEND,
                boxItem = Tmpl.bg
                    .replace('{isActive}', isActive)
                    .replace('{clickElm}', clickElm)
                    .replace('{item.LAYER}', item.LAYER)
                    .replace('//:0', imgUrl)
                    .replace(/{item.LAYER_NAME}/g, item.LAYER_NAME);
            $(LayerSelf.elm.boxBasemap).append(boxItem);
        });
        $(LayerSelf.elm.boxBasemap).addClass('layerBoxScrollbar');
        RenderScrollBar($(LayerSelf.elm.boxBasemap));
    }                // 渲染底圖
    let RunderTree = () => {
        var dataLayers = getJsonData(GetLayerListApi(LayerSelf.folderId), 'GET', null, '無圖層清單資料', '圖層清單資料錯誤'),
            iconOrigin = GetWebsiteUrl(),
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

        $(LayerSelf.elm.boxLayer)
            .on('loaded.jstree', function (e, data) {
                LayerSelf._instance = data.instance;
                HideFolderCheckBox();                           // 隱藏 Folder 的 Checkbox
                SwitchSpecificFolderMode();                     // 如果限定資料夾，排一下版面
                setTimeout(() => { PreloadLayer(); }, 1000);    // 預載圖層
                if (LayerSelf.onLoad != null) LayerSelf.onLoad(LayerSelf.getLayers(), LayerSelf.getDirectories());
                RenderScrollBar($(LayerSelf.elm.boxLayer));     // 渲染滾軸
            })  // loaded
            .on('open_node.jstree', function (e, data) {
                HideFolderCheckBox();   // 隱藏 Folder 的 Checkbox
            })  // Initial
            .on('hover_node.jstree', function (e, data) {
                $('li[role="treeitem"] a').each(function (index) { $(this).prop('title', $(this).text()) })
            })  // hover_node
            .on('changed.jstree', function (e, data) {
                if (data.node == undefined) return true;
                //# 資料夾
                if (data.node.children.length >= 1) {
                    LayerSelf._instance.toggle_node(data.node.id);
                    return true;
                }
                //# 圖層
                var layerId = parseInt(data.node.id.replace('l_', '')),
                    layer = LayerSelf._layers.getById(layerId),
                    selected = data.node.state.selected;
                if (layer == undefined) return;

                RenderLayerItem(data.node, selected);    // 渲染圖層
                if (LayerSelf.onSelect != null) LayerSelf.onSelect(layer, selected); // 選擇圖層額外事件

                //# 是否顯示可視階層
                if (!GetInZoom(layer) && selected) {
                    layer.status = 'not_in_zoom';
                    RenderCheckboxGray(layer.LAYER_SN, true);
                    return;
                }

                if (selected) {
                    LayerSelf.easymap.addItem(layer);
                    layer.status = 'added';
                }
                else {
                    if (layer.status != '') LayerSelf.easymap.removeItem(layer);
                    layer.status = '';
                    RenderCheckboxGray(layer.LAYER_SN, false);
                }
                //# 連動圖層設定 todo
            })  // changed: 圖層開/關時
            .on('load_all.jstree', function (e, data) {
            })  // load_all
            .on('after_open.jstree', function (e, data) {
            })  // after_open: 開啟 Folder 之後
            .on('dehover_node.jstree', function (e, data) {
            })  // dehover_node:  Hover 至節點
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
                    //        //    iconpath: escape(LayerSelf.iconpath),
                    //        //    userole: false,
                    //        //    foldersn: LayerSelf.folderId
                    //        //};
                    //        //return JSON.parse(data);
                    //        }
                    //}
                }
            });
    }                 // 排序圖層目錄
    let RenderLayerItem = (item, sw) => {
        if (sw) {
            RenderLayerLegend(item);
            $('#' + item.id).click(function () {
                if (this.checked) return;
                LayerSelf._instance.uncheck_node(this.id);
            });
        }
        else document.getElementById(item.id).parentNode.parentNode.parentNode.parentNode.remove();
    }    // 渲染圖層
    let RenderLayerLegend = item => {
        let div = Tmpl.legend
            .replace('{checkBoxId}', item.id)
            .replace(/{name}/g, item.text)
            .replace('//:0', item.original.legend);
        $(LayerSelf.elm.boxLegend + ' .mCSB_container').append(div);
    }        // 渲染圖例
    let RenderScrollBar = elm => {
        elm.mCustomScrollbar({
            autoHideScrollbar: true,
            advanced: {
                updateOnContentResize: true,
                updateOnImageLoad: false
            },
            theme: 'minimal-dark',
            mouseWheel: { preventDefault: true }
        });
        elm.mCustomScrollbar('update');
    }           // 渲染滾軸
    let PreloadLayer = () => {
        let list = [];
        this._layers.forEach(item => {
            if (item.PRELOAD === '1') list.push(item.LAYER_SN);
        });
        // 分時段載入 解決 Eeasymap 同時處裡多個 Kml Cluster 問題
        let _intervalInstance = setInterval(function () {
            LayerSelf._instance.check_node('l_' + this[LayerSelf._preloadLayerCounter]);
            if (LayerSelf._preloadLayerCounter >= this.length) {
                clearInterval(_intervalInstance);
                CheckLayerInZoom();
            }
            LayerSelf._preloadLayerCounter++;
        }.bind(list), 200);
    }               // 預載圖層
    let CheckLayerInZoom = () => {
        this._layers.forEach(layer => {
            if (layer.status == undefined || layer.status == '') return;
            let isInZoom = GetInZoom(layer);
            if (isInZoom && layer.status != 'added') {
                LayerSelf.easymap.addItem(layer);
                layer.status = 'added';
                RenderCheckboxGray(layer.LAYER_SN, false);   // 解除變灰
            }
            if (!isInZoom && layer.status != 'not_in_zoom') {
                LayerSelf.easymap.removeItem(layer);
                layer.status = 'not_in_zoom';
                RenderCheckboxGray(layer.LAYER_SN, true);   // 變灰
            }
        });
    }           // 檢查圖層之階層
    let GetInZoom = layer => {
        let z = GetLayerMap().getZoom(),
            zMax = layer.MAXZ,
            zMin = layer.MINZ;
        if (zMax <= 0) zMax = 999;
        if (zMin < 0) zMin = 0;
        return z >= zMin && z <= zMax ? true : false;
    }               // 確認圖層層起是否於範圍內
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
        return this.version == 1 ? Layer1.map : Layer2.map;
    }                // 取得圖台
    let GetWebsiteUrl = () => {
        return location.href.indexOf('localhost') < 0 ? location.href.replace('#', '') : origin;
    }              // 取得本網站連結
    //# JsTree
    let SwitchSpecificFolderMode = () => {
        $(`${this.elm.boxWindow} .jstree`).css('marginLeft', '-30px');
        if (this.folderId === '' || parseInt(this.folderId) === 0) return;
        $(`${this.elm.boxWindow} .jstree-icon`).eq(0).hide();
        $(`${this.elm.boxWindow} .jstree-anchor`).eq(0).hide();
    }        // 如果限定資料夾，排一下版面
    let RenderCheckboxGray = (layerSn, sw) => {
        let a = $(`${LayerSelf.elm.boxLayer} ul li`).find(`#l_${layerSn}`).find('a');
        sw ? a.addClass('jstree-disabled') : a.removeClass('jstree-disabled');
    }   // 將 CheckBox 渲染/解除變灰
    let HideFolderCheckBox = () => {
        $(this.elm.menuFolderCheckBox).hide();
    }              // 隱藏 Folder 的 Checkbox
    return this;
}

function LayerTreeInit(version, item) {
    let interval = setInterval(() => {
        if (window[`Layer${version}`] === null || !window[`Layer${version}`].inited) return;
        clearInterval(interval);
        console.log(`圖臺目錄 ${version} 初始化`);
        let LayerTree = new LayerMenuTree();
        LayerTree.version = version;
        LayerTree.folderId = item.folderId !== undefined ? item.folderId : '0';    // 無設定，預設根目錄
        LayerTree.elm.boxWindow = `#boxLayerWindow${version}`;
        LayerTree.elm.boxContent = `#boxLayerAbgne${version}`;
        LayerTree.elm.boxLegend = `#boxLegend${version}`;
        LayerTree.elm.boxLayer = `#boxLayer${version}`;
        LayerTree.elm.boxBasemap = `#boxBg${version}`;
        LayerTree.onSelect = item.onSelect != undefined ? item.onSelect : null;  // 選擇圖層事件
        LayerTree.easymap = MM[`easymap${version === 1 ? '' : version}`];
        LayerTree.isHide = item.isHide === undefined ? false : item.isHide;      // 是否隱藏
        LayerTree.start();
        window[`LayerTree${version}`] = LayerTree;
    }, 500);
}

function LayerMenuInit1(item) {
    LayerTreeInit(1, item);
}

function LayerMenuInit2(item) {
    LayerTreeInit(2, item);
}
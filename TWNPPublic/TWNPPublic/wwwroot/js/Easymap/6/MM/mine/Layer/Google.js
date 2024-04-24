/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/XYZ.js
 */

/**
 * Class: OpenLayers.Layer.OSM
 * This layer allows accessing OpenStreetMap tiles. By default the OpenStreetMap
 *    hosted tile.openstreetmap.org Mapnik tileset is used. If you wish to use
 *    a different layer instead, you need to provide a different
 *    URL to the constructor. Here's an example for using OpenCycleMap:
 * 
 * (code)
 *     new OpenLayers.Layer.OSM("OpenCycleMap", 
 *       ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
 *        "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
 *        "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]); 
 * (end)
 *
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */
EzMap.Layer.Google = OpenLayers.Class(OpenLayers.Layer.XYZ, {

    /**
     * APIProperty: name
     * {String} The layer name. Defaults to "OpenStreetMap" if the first
     * argument to the constructor is null or undefined.
     */
    name: "Google",
	chanme: "谷歌",
    /**
     * APIProperty: url
     * {String} The tileset URL scheme. Defaults to
     * : http://[a|b|c].tile.openstreetmap.org/${z}/${x}/${y}.png
     * (the official OSM tileset) if the second argument to the constructor
     * is null or undefined. To use another tileset you can have something
     * like this:
     * (code)
     *     new OpenLayers.Layer.OSM("OpenCycleMap", 
     *       ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
     *        "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
     *        "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]); 
     * (end)
     */
    url: [
        'http://mt0.google.cn/vt?hl=zh-TW&gl=TW&lyrs=m&x=${x}&y=${y}&z=${z}',
        'http://mt0.google.cn/vt?hl=zh-TW&gl=TW&lyrs=m&x=${x}&y=${y}&z=${z}',
        'http://mt0.google.cn/vt?hl=zh-TW&gl=TW&lyrs=m&x=${x}&y=${y}&z=${z}'
    ],

    /**
     * Property: attribution
     * {String} The layer attribution.
     */
    attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",

    /**
     * Property: sphericalMercator
     * {Boolean}
     */
    sphericalMercator: true,

    /**
     * Property: wrapDateLine
     * {Boolean}
     */
    wrapDateLine: true,

    /** APIProperty: tileOptions
     *  {Object} optional configuration options for <OpenLayers.Tile> instances
     *  created by this Layer. Default is
     *
     *  (code)
     *  {crossOriginKeyword: 'anonymous'}
     *  (end)
     *
     *  When using OSM tilesets other than the default ones, it may be
     *  necessary to set this to
     *
     *  (code)
     *  {crossOriginKeyword: null}
     *  (end)
     *
     *  if the server does not send Access-Control-Allow-Origin headers.
     */
    tileOptions: null,

    /**
     * Constructor: OpenLayers.Layer.OSM
     *
     * Parameters:
     * name - {String} The layer name.
     * url - {String} The tileset URL scheme.
     * options - {Object} Configuration options for the layer. Any inherited
     *     layer option can be set in this object (e.g.
     *     <OpenLayers.Layer.Grid.buffer>).
     */
    initialize: function(name, url, options) {
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, arguments);
        this.tileOptions = OpenLayers.Util.extend({
            crossOriginKeyword: null
        }, this.options && this.options.tileOptions);
    },

    /**
     * Method: clone
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.OSM(
                this.name, this.url, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },
    /** 
     * extends from OpenLayers.Layer.Grid.addTileMonitoringHooks
	 * inorder to image onerror event icon replacement
     */
    addTileMonitoringHooks: function(tile) {
        
        var replacingCls = 'olTileReplacing';

        tile.onLoadStart = function() {
            //if that was first tile then trigger a 'loadstart' on the layer
            if (this.loading === false) {
                this.loading = true;
                this.events.triggerEvent("loadstart");
            }
            this.events.triggerEvent("tileloadstart", {tile: tile});
            this.numLoadingTiles++;
            if (!this.singleTile && this.backBuffer && this.gridResolution === this.backBufferResolution) {
                OpenLayers.Element.addClass(tile.getTile(), replacingCls);
            }
        };
      
        tile.onLoadEnd = function(evt) {
            this.numLoadingTiles--;
            var aborted = evt.type === 'unload';
            this.events.triggerEvent("tileloaded", {
                tile: tile,
                aborted: aborted
            });
            if (!this.singleTile && !aborted && this.backBuffer && this.gridResolution === this.backBufferResolution) {
                var tileDiv = tile.getTile();
                if (OpenLayers.Element.getStyle(tileDiv, 'display') === 'none') {
                    var bufferTile = document.getElementById(tile.id + '_bb');
                    if (bufferTile) {
                        bufferTile.parentNode.removeChild(bufferTile);
                    }
                }
                OpenLayers.Element.removeClass(tileDiv, replacingCls);
            }
            //if that was the last tile, then trigger a 'loadend' on the layer
            if (this.numLoadingTiles === 0) {
                if (this.backBuffer) {
                    if (this.backBuffer.childNodes.length === 0) {
                        // no tiles transitioning, remove immediately
                        this.removeBackBuffer();
                    } else {
                        // wait until transition has ended or delay has passed
                        this._transitionElement = aborted ?
                            this.div.lastChild : tile.imgDiv;
                        var transitionendEvents = this.transitionendEvents;
                        for (var i=transitionendEvents.length-1; i>=0; --i) {
                            OpenLayers.Event.observe(this._transitionElement,
                                transitionendEvents[i],
                                this._removeBackBuffer);
                        }
                        // the removal of the back buffer is delayed to prevent
                        // flash effects due to the animation of tile displaying
                        this.backBufferTimerId = window.setTimeout(
                            this._removeBackBuffer, this.removeBackBufferDelay
                        );
                    }
                }
                this.loading = false;
                this.events.triggerEvent("loadend");
            }
        };
        
        tile.onLoadError = function() {
            this.events.triggerEvent("tileerror", {tile: tile});
			tile.imgDiv.src = _error_pic;
        };
        
        tile.events.on({
            "loadstart": tile.onLoadStart,
            "loadend": tile.onLoadEnd,
            "unload": tile.onLoadEnd,
            "loaderror": tile.onLoadError,
            scope: this
        });
    },
    CLASS_NAME: "MM.Layer.Google"
});

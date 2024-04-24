
/**
 * Class: MM.BaseType.NetworkLink
 * netowrk link reload時，記錄的資訊
 */
EzMap.BaseType.NetworkLink = OpenLayers.Class({

    /**
     * APIProperty: name
     * {String}
     */
	name: null,

    /**
     * APIProperty: href
     * {String}
     */
	href: null,

    /**
     * APIProperty: viewRefreshMode
     * {string}
     */
	viewRefreshMode: null,

    /**
     * APIProperty: viewFormat
     * {string}
     */
	viewFormat: null,

    /**
     * Constructor: OpenLayers.API
     *
     * Parameters:
     * name - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, options) {
    }
});

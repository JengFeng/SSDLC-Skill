/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.MousePosition
 * The MousePosition control displays geographic coordinates of the mouse
 * pointer, as it is moved about the map.
 *
 * You can use the <prefix>- or <suffix>-properties to provide more information
 * about the displayed coordinates to the user:
 *
 * (code)
 *     var mousePositionCtrl = new OpenLayers.Control.MousePosition({
 *         prefix: '<a target="_blank" ' +
 *             'href="http://spatialreference.org/ref/epsg/4326/">' +
 *             'EPSG:4326</a> coordinates: '
 *         }
 *     );
 * (end code)
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
EzMap.Control.createDiv = OpenLayers.Class(OpenLayers.Control, {


    /**
     * Constructor: OpenLayers.Control.MousePosition
     *
     * Parameters:
     * options - {Object} Options for control.
     */
    initialize: function(options) {
        
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
		
    },

    CLASS_NAME: "MM.Control.createDiv"
});

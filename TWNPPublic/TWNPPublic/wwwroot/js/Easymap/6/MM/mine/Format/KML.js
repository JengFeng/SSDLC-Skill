

/**
 * @requires OpenLayers/BaseTypes/Date.js
 * @requires OpenLayers/Format/XML.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/Polygon.js
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Request/XMLHttpRequest.js
 * @requires OpenLayers/Projection.js
 * @requires OpenLayers/Format/KML.js
 */

/**
 * Class: MM.Format.KML
 *		繼承<OpenLayers.Format.KML>物件，擴充功能
 *
 *	1. 支援 proxy Server 以解決crossdomain不能存取的問題
 * 
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
EzMap.Format.KML = OpenLayers.Class(OpenLayers.Format.KML, {
	/**
	 * Constructor: OpenLayers.Format.KML
	 * Create a new parser for KML.
	 *
	 * Parameters:
	 * options - {Object} An optional object whose properties will be set on
	 *     this instance.
	 */
	initialize: function(options) {
		// compile regular expressions once instead of every time they are used
		this.regExes = {
			trimSpace: (/^\s*|\s*$/g),
			removeSpace: (/\s*/g),
			splitSpace: (/\s+|\t+/),
			trimComma: (/\s*,\s*/g),
			kmlColor: (/(\w{2})(\w{2})(\w{2})(\w{2})/),
			kmlIconPalette: (/root:\/\/icons\/palette-(\d+)(\.\w+)/),
			straightBracket: (/\$\[(.*?)\]/g)
		};
		// KML coordinates are always in longlat WGS84
		this.externalProjection = new OpenLayers.Projection("EPSG:4326");
		
		OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);

	},
    /**
     * Method: parseFeature
     * This function is the core of the KML parsing code in OpenLayers.
     *     It creates the geometries that are then attached to the returned
     *     feature, and calls parseAttributes() to get attribute data out.
     *
     * Parameters:
     * node - {DOMElement}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A vector feature.
     */
    parseFeature: function(node) {
        // only accept one geometry per feature - look for highest "order"
        var order = ["MultiGeometry", "Polygon", "LineString", "Point"];
        var type, nodeList, geometry, parser;
        for(var i=0, len=order.length; i<len; ++i) {
            type = order[i];
            this.internalns = node.namespaceURI ? 
                    node.namespaceURI : this.kmlns;
            nodeList = this.getElementsByTagNameNS(node, this.internalns, type);
            if (nodeList.length <= 0) {
                nodeList = this.getElementsByTagNameNS(node, "", type);
            }

            if(nodeList.length > 0) {
                // only deal with first geometry of this type
                var parser = this.parseGeometry[type.toLowerCase()];
                if(parser) {
                    geometry = parser.apply(this, [nodeList[0]]);
                    if (this.internalProjection && this.externalProjection && geometry != null) {
                        geometry.transform(this.externalProjection, 
                                           this.internalProjection); 
                    }                       
                } else {
                    //throw new TypeError("Unsupported geometry type: " + type);
					console.error("Unsupported geometry type: " + type);
                }
                // stop looking for different geometry types
                break;
            }
        }

        // construct feature (optionally with attributes)
        var attributes;
        if(this.extractAttributes) {
            attributes = this.parseAttributes(node);
        }
        var feature = new OpenLayers.Feature.Vector(geometry, attributes);

        var fid = node.getAttribute("id") || node.getAttribute("name");
        if(fid != null) {
            feature.fid = fid;
        }
		feature.type = type;//rex
        return feature;
    },
    /**
     * Method: parseFeatures
     * Loop through all Placemark nodes and parse them.
     * Will create a list of features
     * 
     * Parameters: 
     * nodes    - {Array} of {DOMElement} data to read/parse.
     * options  - {Object} Hash of options
     * 
     */
    parseFeatures: function(nodes, options) {
        var features = [];
        for(var i=0, len=nodes.length; i<len; i++) {
            var featureNode = nodes[i];
            var feature = this.parseFeature.apply(this,[featureNode]) ;
            if(feature) {

                // Create reference to styleUrl 
                if (this.extractStyles && feature.attributes &&
                    feature.attributes.styleUrl) {
                    feature.style = this.getStyle(feature.attributes.styleUrl, options);
                    //rextseng{
                    if ((feature.type == "LineString" || feature.type == "MultiGeometry" || feature.type == "Polygon" || feature.type == "Point")
						) {
                        if (this.labelVisible != undefined && this.labelVisible == true) {
                            feature.style.fontSize = "13px";
                        } else {
                            feature.style.fontSize = "0px";
                        }
                        if (feature.attributes.name)
                            feature.style.label = feature.attributes.name;

                        feature.style.fontWeight = "bold";
                        feature.style.fontColor = "#3C89C5";
                        
                        feature.style.labelAlign = "cm";
                        feature.style.pointRadius = 0;
                        feature.style.labelXOffset = 0;
                        feature.style.labelYOffset = 0;
                        feature.style.labelSelect = true;
                        feature.style.labelOutlineColor = "#ffffff";
                        feature.style.labelOutlineWidth = 2;

                        if (this.iconVisible != undefined && this.iconVisible == false) {
                            feature.style.graphicOpacity = 0;
                            feature.style.graphicWidth = 0;
                        }
                        if (this.iconVisible != undefined && this.iconVisible == true) {
                            feature.style.graphicOpacity = 1;
                        }
                    }
                    //}
                }

                if (this.extractStyles) {
                    // Make sure that <Style> nodes within a placemark are 
                    // processed as well
                    var inlineStyleNode = this.getElementsByTagNameNS(featureNode,
                                                        "*",
                                                        "Style")[0];
                    if (inlineStyleNode) {
                        var inlineStyle= this.parseStyle(inlineStyleNode);
                        if (inlineStyle) {
                            feature.style = OpenLayers.Util.extend(
                                feature.style, inlineStyle
                            );
                        }
                    }
                }

                // check if gx:Track elements should be parsed
                if (this.extractTracks) {
                    var tracks = this.getElementsByTagNameNS(
                        featureNode, this.namespaces.gx, "Track"
                    );
                    if (tracks && tracks.length > 0) {
                        var track = tracks[0];
                        var container = {
                            features: [],
                            feature: feature
                        };
                        this.readNode(track, container);
                        if (container.features.length > 0) {
                            features.push.apply(features, container.features);
                        }
                    }
                } else {
                    // add feature to list of features
                    features.push(feature);                    
                }
            } else {
                //throw "Bad Placemark: " + i;
				console.error("Bad Placemark: " + i);
            }
        }

        // add new features to existing feature list
        this.features = this.features.concat(features);
    },
    /**
     * Property: parseGeometry
     * Properties of this object are the functions that parse geometries based
     *     on their type.
     */
    parseGeometry: {
        
        /**
         * Method: parseGeometry.point
         * Given a KML node representing a point geometry, create an OpenLayers
         *     point geometry.
         *
         * Parameters:
         * node - {DOMElement} A KML Point node.
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} A point geometry.
         */
        point: function(node) {

            var nodeList = this.getElementsByTagNameNS(node, this.internalns,
                                                       "coordinates");
            var coords = [];
            if(nodeList.length > 0) {
                var coordString = nodeList[0].firstChild.nodeValue;
                coordString = coordString.replace(this.regExes.removeSpace, "");
                coords = coordString.split(",");
            }

            var point = null;
            if(coords.length > 1) {
                // preserve third dimension
                if(coords.length == 2) {
                    coords[2] = null;
                }
                point = new OpenLayers.Geometry.Point(coords[0], coords[1],
                                                      coords[2]);
            } else {
                //throw "Bad coordinate string: " + coordString;
				console.error("Bad coordinate string: " + coordString);
            }
            return point;
        },
        
        /**
         * Method: parseGeometry.linestring
         * Given a KML node representing a linestring geometry, create an
         *     OpenLayers linestring geometry.
         *
         * Parameters:
         * node - {DOMElement} A KML LineString node.
         *
         * Returns:
         * {<OpenLayers.Geometry.LineString>} A linestring geometry.
         */
        linestring: function(node, ring) {
            var nodeList = this.getElementsByTagNameNS(node, this.internalns,
                                                       "coordinates");
            var line = null;
            if(nodeList.length > 0) {
                var coordString = this.getChildValue(nodeList[0]);

                coordString = coordString.replace(this.regExes.trimSpace,
                                                  "");
                coordString = coordString.replace(this.regExes.trimComma,
                                                  ",");

                //rex{{
                if (coordString.indexOf(",") == -1) {
                    console.error("Bad LineString point coordinates: " + coordString);
                    return line;
                }
                //}}

                var pointList = coordString.split(this.regExes.splitSpace);
                var numPoints = pointList.length;
                var points = new Array(numPoints);
                var coords, numCoords;

                for(var i=0; coordString && coordString.length >= 1 && i<numPoints; ++i) {
                    coords = pointList[i].split(",");
                    numCoords = coords.length;
                    if(numCoords > 1) {
                        if(coords.length == 2) {
                            coords[2] = null;
                        }
                        points[i] = new OpenLayers.Geometry.Point(coords[0],
                                                                  coords[1],
                                                                  coords[2]);
                    } else {
                       // throw "Bad LineString point coordinates: " +
                       //       pointList[i];
					   console.error("Bad LineString point coordinates: "+pointList[i]);
                    }
                }
                if(numPoints) {
                    if (ring) {

                        try {//rex:add try catch:in order to prevent coordinate without content
                            line = new OpenLayers.Geometry.LinearRing(points);
                        } catch (err) {
                            console.error("Bad LineString coordinates: " + coordString);
                        }
                    } else {
                        line = new OpenLayers.Geometry.LineString(points);
                    }
                } else {
                    //throw "Bad LineString coordinates: " + coordString;
					console.error("Bad LineString coordinates: " + coordString);
                }
            }

            return line;
        },
        
        /**
         * Method: parseGeometry.polygon
         * Given a KML node representing a polygon geometry, create an
         *     OpenLayers polygon geometry.
         *
         * Parameters:
         * node - {DOMElement} A KML Polygon node.
         *
         * Returns:
         * {<OpenLayers.Geometry.Polygon>} A polygon geometry.
         */
        polygon: function(node) {
            var nodeList = this.getElementsByTagNameNS(node, this.internalns,
                                                       "LinearRing");
            var numRings = nodeList.length;
            var components = new Array(numRings);
            if(numRings > 0) {
                // this assumes exterior ring first, inner rings after
                var ring;
                for(var i=0, len=nodeList.length; i<len; ++i) {
                    ring = this.parseGeometry.linestring.apply(this,
                                                        [nodeList[i], true]);
                    if(ring) {
                        components[i] = ring;
                    } else {
                        //throw "Bad LinearRing geometry: " + i;
						console.error("Bad LinearRing geometry: " + i);
                    }
                }
            }
            return new OpenLayers.Geometry.Polygon(components);
        },
        
        /**
         * Method: parseGeometry.multigeometry
         * Given a KML node representing a multigeometry, create an
         *     OpenLayers geometry collection.
         *
         * Parameters:
         * node - {DOMElement} A KML MultiGeometry node.
         *
         * Returns:
         * {<OpenLayers.Geometry.Collection>} A geometry collection.
         */
        multigeometry: function(node) {
            var child, parser;
            var parts = [];
            var children = node.childNodes;
            for(var i=0, len=children.length; i<len; ++i ) {
                child = children[i];
                if(child.nodeType == 1) {
                    var type = (child.prefix) ?
                            child.nodeName.split(":")[1] :
                            child.nodeName;
					//if(type.toLowerCase() == "point") continue;
					/*rex:在多重placemark下時，把point略過，ex:
																			<MultiGeometry>
																				<tessellate>1</tessellate>
																				<altitudeMode>relativeToGround</altitudeMode>
																				<Point>
																					<coordinates>121.010932,24.206722,9.999999999999998</coordinates>
																				</Point>
																				<Polygon>
																					<outerBoundaryIs>
																						<LinearRing>
																							<coordinates>
																								121.013737,24.210338,9.999999999999998 121.013616,24.2103,9.999999999999998 121.013338,24.210234,9.999999999999998 121.012817,24.210119,9.999999999999998 121.012674,24.210089,9.999999999999998 121.012531,24.21005600000001,9.999999999999998 121.01247,24.210026,9.999999999999998 121.012439,24.210013,9.999999999999998 121.012114,24.209849,9.999999999999998 121.011779,24.209672,9.999999999999998 121.011535,24.209196,9.999999999999998 121.01142,24.209165,9.999999999999998 121.011384,24.209117,9.999999999999998 121.011112,24.208745,9.999999999999998 121.010996,24.20872,9.999999999999998 121.01091,24.208508,9.999999999999998 121.010993,24.208406,9.999999999999998 121.010941,24.208219,9.999999999999998 121.010993,24.208092,9.999999999999998 121.010935,24.208084,9.999999999999998 121.010818,24.208069,9.999999999999998 121.010876,24.207917,9.999999999999998 121.011177,24.207416,9.999999999999998 121.011146,24.20736,9.999999999999998 121.011229,24.207237,9.999999999999998 121.011312,24.207114,9.999999999999998 121.011352,24.207056,9.999999999999998 121.011406,24.207085,9.999999999999998 121.011422,24.207065,9.999999999999998 121.011531,24.206925,9.999999999999998 121.011752,24.20671000000001,9.999999999999998 121.011976,24.20656,9.999999999999998 121.0124,24.206198,9.999999999999998 121.012425,24.20614000000001,9.999999999999998 121.012484,24.206073,9.999999999999998 121.012493,24.206061,9.999999999999998 121.012745,24.205911,9.999999999999998 121.012933,24.205696,9.999999999999998 121.012945,24.20568,9.999999999999998 121.012998,24.205592,9.999999999999998 121.01323,24.205179,9.999999999999998 121.013245,24.205178,9.999999999999998 121.013346,24.204932,9.999999999999998 121.013392,24.20482000000001,9.999999999999998 121.013429,24.204733,9.999999999999998 121.013328,24.20446000000001,9.999999999999998 121.013322,24.20445,9.999999999999998 121.013242,24.204261,9.999999999999998 121.013193,24.204165,9.999999999999998 121.013148,24.204056,9.999999999999998 121.013069,24.203949,9.999999999999998 121.013143,24.203925,9.999999999999998 121.013247,24.203921,9.999999999999998 121.013275,24.203912,9.999999999999998 121.013339,24.203914,9.999999999999998 121.013376,24.203978,9.999999999999998 121.013409,24.203978,9.999999999999998 121.013442,24.203998,9.999999999999998 121.013483,24.204049,9.999999999999998 121.013482,24.204242,9.999999999999998 121.013517,24.204381,9.999999999999998 121.013478,24.204614,9.999999999999998 121.013908,24.205013,9.999999999999998 121.013921,24.20498200000001,9.999999999999998 121.013891,24.204931,9.999999999999998 121.013861,24.204881,9.999999999999998 121.013846,24.204854,9.999999999999998 121.013835,24.204839,9.999999999999998 121.013825,24.204819,9.999999999999998 121.01382,24.204814,9.999999999999998 121.013816,24.204806,9.999999999999998 121.013797,24.204783,9.999999999999998 121.01376,24.204743,9.999999999999998 121.013736,24.204715,9.999999999999998 121.013661,24.204613,9.999999999999998 121.013642,24.204584,9.999999999999998 121.013625,24.204554,9.999999999999998 121.013621,24.204545,9.999999999999998 121.013617,24.204535,9.999999999999998 121.013613,24.20452600000001,9.999999999999998 121.013608,24.204517,9.999999999999998 121.013604,24.204508,9.999999999999998 121.0136,24.204498,9.999999999999998 121.013597,24.204489,9.999999999999998 121.013593,24.20448,9.999999999999998 121.013589,24.20447,9.999999999999998 121.013585,24.204461,9.999999999999998 121.013582,24.204451,9.999999999999998 121.013578,24.204442,9.999999999999998 121.013575,24.204432,9.999999999999998 121.013572,24.204423,9.999999999999998 121.013568,24.204413,9.999999999999998 121.013565,24.204404,9.999999999999998 121.013562,24.204394,9.999999999999998 121.01356,24.204384,9.999999999999998 121.013558,24.204375,9.999999999999998 121.013557,24.204365,9.999999999999998 121.013555,24.204356,9.999999999999998 121.013554,24.20434600000001,9.999999999999998 121.013552,24.204336,9.999999999999998 121.013551,24.204327,9.999999999999998 121.013549,24.204317,9.999999999999998 121.013548,24.204307,9.999999999999998 121.013546,24.20429800000001,9.999999999999998 121.013545,24.204288,9.999999999999998 121.013544,24.204278,9.999999999999998 121.013543,24.204269,9.999999999999998 121.013541,24.204259,9.999999999999998 121.01354,24.204249,9.999999999999998 121.013539,24.204239,9.999999999999998 121.013538,24.20423,9.999999999999998 121.013537,24.20422,9.999999999999998 121.013536,24.20421,9.999999999999998 121.013535,24.204201,9.999999999999998 121.013534,24.204191,9.999999999999998 121.013516,24.204091,9.999999999999998 121.013505,24.204044,9.999999999999998 121.013496,24.203997,9.999999999999998 121.013481,24.203967,9.999999999999998 121.013465,24.203936,9.999999999999998 121.013451,24.203903,9.999999999999998 121.013427,24.203866,9.999999999999998 121.013421,24.203859,9.999999999999998 121.01339,24.203808,9.999999999999998 121.013385,24.20379,9.999999999999998 121.013369,24.203772,9.999999999999998 121.013374,24.203772,9.999999999999998 121.013344,24.203718,9.999999999999998 121.013315,24.203674,9.999999999999998 121.013283,24.203632,9.999999999999998 121.013255,24.20360300000001,9.999999999999998 121.013225,24.203575,9.999999999999998 121.01318,24.203544,9.999999999999998 121.01315,24.203529,9.999999999999998 121.013093,24.203506,9.999999999999998 121.013035,24.203485,9.999999999999998 121.012907,24.203448,9.999999999999998 121.012822,24.203427,9.999999999999998 121.012738,24.203405,9.999999999999998 121.012654,24.203384,9.999999999999998 121.012569,24.203366,9.999999999999998 121.012518,24.203358,9.999999999999998 121.012414,24.203351,9.999999999999998 121.012381,24.203347,9.999999999999998 121.012349,24.203342,9.999999999999998 121.012282,24.203332,9.999999999999998 121.012215,24.203321,9.999999999999998 121.012155,24.203312,9.999999999999998 121.012112,24.203307,9.999999999999998 121.011985,24.203288,9.999999999999998 121.011859,24.203269,9.999999999999998 121.011841,24.203266,9.999999999999998 121.011702,24.203326,9.999999999999998 121.011414,24.203295,9.999999999999998 121.011041,24.203256,9.999999999999998 121.010667,24.203215,9.999999999999998 121.010148,24.203161,9.999999999999998 121.010121,24.203158,9.999999999999998 121.010084,24.203144,9.999999999999998 121.009924,24.203087,9.999999999999998 121.009923,24.203091,9.999999999999998 121.009544,24.203084,9.999999999999998 121.009482,24.203088,9.999999999999998 121.00946,24.203087,9.999999999999998 121.009248,24.203089,9.999999999999998 121.009166,24.20311,9.999999999999998 121.009094,24.203153,9.999999999999998 121.009042,24.203196,9.999999999999998 121.008988,24.20326100000001,9.999999999999998 121.008952,24.203341,9.999999999999998 121.008933,24.203328,9.999999999999998 121.008899,24.203377,9.999999999999998 121.008843,24.203553,9.999999999999998 121.008784,24.20372800000001,9.999999999999998 121.008803,24.20375,9.999999999999998 121.008795,24.203782,9.999999999999998 121.008805,24.203782,9.999999999999998 121.008789,24.203827,9.999999999999998 121.009023,24.203907,9.999999999999998 121.009404,24.204043,9.999999999999998 121.00949,24.204074,9.999999999999998 121.00952,24.20404,9.999999999999998 121.009562,24.203978,9.999999999999998 121.009605,24.20391,9.999999999999998 121.009638,24.203866,9.999999999999998 121.009668,24.203821,9.999999999999998 121.009706,24.20378,9.999999999999998 121.009725,24.203751,9.999999999999998 121.009911,24.203679,9.999999999999998 121.00994,24.203668,9.999999999999998 121.00999,24.203677,9.999999999999998 121.010004,24.203679,9.999999999999998 121.01013,24.203702,9.999999999999998 121.010214,24.203779,9.999999999999998 121.010233,24.203779,9.999999999999998 121.010239,24.203784,9.999999999999998 121.010246,24.203797,9.999999999999998 121.010251,24.203806,9.999999999999998 121.010258,24.20382,9.999999999999998 121.010267,24.203815,9.999999999999998 121.010347,24.203796,9.999999999999998 121.010439,24.203778,9.999999999999998 121.010465,24.203829,9.999999999999998 121.010636,24.203886,9.999999999999998 121.010752,24.203882,9.999999999999998 121.010868,24.20388,9.999999999999998 121.011003,24.203875,9.999999999999998 121.011063,24.203933,9.999999999999998 121.011088,24.203942,9.999999999999998 121.011123,24.203964,9.999999999999998 121.01113,24.203977,9.999999999999998 121.011083,24.203957,9.999999999999998 121.011125,24.204006,9.999999999999998 121.011213,24.204038,9.999999999999998 121.011565,24.204176,9.999999999999998 121.011722,24.204258,9.999999999999998 121.01187,24.204358,9.999999999999998 121.01194,24.204347,9.999999999999998 121.01201,24.204332,9.999999999999998 121.012059,24.204309,9.999999999999998 121.012101,24.204279,9.999999999999998 121.012127,24.204254,9.999999999999998 121.012166,24.204204,9.999999999999998 121.012202,24.204153,9.999999999999998 121.012276,24.204032,9.999999999999998 121.012292,24.204042,9.999999999999998 121.012302,24.204025,9.999999999999998 121.012525,24.204074,9.999999999999998 121.01277,24.204378,9.999999999999998 121.012826,24.204482,9.999999999999998 121.012872,24.204606,9.999999999999998 121.012911,24.204777,9.999999999999998 121.012881,24.205031,9.999999999999998 121.012837,24.205137,9.999999999999998 121.012788,24.205225,9.999999999999998 121.012726,24.20533500000001,9.999999999999998 121.012686,24.205367,9.999999999999998 121.012328,24.205711,9.999999999999998 121.012284,24.205739,9.999999999999998 121.012127,24.205817,9.999999999999998 121.011897,24.205965,9.999999999999998 121.01183,24.206075,9.999999999999998 121.011614,24.206245,9.999999999999998 121.011687,24.206325,9.999999999999998 121.011529,24.206442,9.999999999999998 121.01146,24.206365,9.999999999999998 121.011369,24.206434,9.999999999999998 121.011315,24.206476,9.999999999999998 121.011171,24.206588,9.999999999999998 121.011175,24.206591,9.999999999999998 121.011263,24.206637,9.999999999999998 121.011229,24.206679,9.999999999999998 121.011248,24.206715,9.999999999999998 121.011177,24.206787,9.999999999999998 121.011018,24.206891,9.999999999999998 121.010959,24.206806,9.999999999999998 121.010988,24.206793,9.999999999999998 121.010967,24.206785,9.999999999999998 121.010947,24.206829,9.999999999999998 121.010873,24.206878,9.999999999999998 121.010825,24.206927,9.999999999999998 121.010843,24.206955,9.999999999999998 121.010759,24.206978,9.999999999999998 121.01073,24.206988,9.999999999999998 121.010628,24.206999,9.999999999999998 121.010631,24.206993,9.999999999999998 121.010662,24.206925,9.999999999999998 121.010672,24.206859,9.999999999999998 121.010704,24.20685,9.999999999999998 121.010654,24.206808,9.999999999999998 121.010641,24.206815,9.999999999999998 121.010471,24.206732,9.999999999999998 121.010302,24.206646,9.999999999999998 121.010203,24.206599,9.999999999999998 121.010172,24.206581,9.999999999999998 121.009774,24.207815,9.999999999999998 121.009732,24.208044,9.999999999999998 121.009614,24.208659,9.999999999999998 121.009625,24.20867000000001,9.999999999999998 121.009694,24.20874,9.999999999999998 121.009927,24.208991,9.999999999999998 121.010118,24.209218,9.999999999999998 121.010232,24.209333,9.999999999999998 121.010272,24.209375,9.999999999999998 121.010311,24.209419,9.999999999999998 121.010361,24.209469,9.999999999999998 121.010738,24.209961,9.999999999999998 121.011125,24.210319,9.999999999999998 121.011204,24.210361,9.999999999999998 121.013737,24.210338,9.999999999999998 
																							</coordinates>
																						</LinearRing>
																					</outerBoundaryIs>
																				</Polygon>
																			</MultiGeometry>
																						*/

                    var parser = this.parseGeometry[type.toLowerCase()];
                    if(parser) {
                        parts.push(parser.apply(this, [child]));
                    }
                }
            }
            return new OpenLayers.Geometry.Collection(parts);
        }
        
    },
    CLASS_NAME: "MM.Format.KML" 
});

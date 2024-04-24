/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Strategy.js
 */

/**
 * Class: OpenLayers.Strategy.Cluster
 * Strategy for vector feature clustering.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy>
 */
EzMap.Strategy.Cluster = OpenLayers.Class(OpenLayers.Strategy, {
    
    /**
     * APIProperty: distance
     * {Integer} Pixel distance between features that should be considered a
     *     single cluster.  Default is 20 pixels.
     */
    distance: 20,
    
    /**
     * APIProperty: threshold
     * {Integer} Optional threshold below which original features will be
     *     added to the layer instead of clusters.  For example, a threshold
     *     of 3 would mean that any time there are 2 or fewer features in
     *     a cluster, those features will be added directly to the layer instead
     *     of a cluster representing those features.  Default is null (which is
     *     equivalent to 1 - meaning that clusters may contain just one feature).
     */
    threshold: null,
    
    /**
     * Property: features
     * {Array(<OpenLayers.Feature.Vector>)} Cached features.
     */
    features: null,
    
    /**
     * Property: clusters
     * {Array(<OpenLayers.Feature.Vector>)} Calculated clusters.
     */
    clusters: null,
    
    /**
     * Property: clustering
     * {Boolean} The strategy is currently clustering features.
     */
    clustering: false,
	isGroupTheSamePoint:true,
	markerLayerName:"",
	markers: null,
	map: null,
	mm: null,
	gmarker: null,	
    /**
     * Property: resolution
     * {Float} The resolution (map units per pixel) of the current cluster set.
     */
    resolution: null,

    /**
     * Constructor: OpenLayers.Strategy.Cluster
     * Create a new clustering strategy.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */
    
    /**
     * APIMethod: activate
     * Activate the strategy.  Register any listeners, do appropriate setup.
     * 
     * Returns:
     * {Boolean} The strategy was successfully activated.
     */
    activate: function() {
		
		if(!this.map){
			this.map = this.layer.map;
		}
		this.markerLayerName = "MM_STRATEGY_CLUSTER_MARKERS_"+this.map.layers.length;

        this.markers = new OpenLayers.Layer.Markers(this.markerLayerName);
        this.map.addLayer(this.markers);
			
        var activated = OpenLayers.Strategy.prototype.activate.call(this);
        if(activated) {
            this.layer.events.on({
                "beforefeaturesadded": this.cacheFeatures,
                "featuresremoved": this.clearCache,
                "moveend": this.cluster,
                scope: this
            });
        }
        return activated;
    },
    
    /**
     * APIMethod: deactivate
     * Deactivate the strategy.  Unregister any listeners, do appropriate
     *     tear-down.
     * 
     * Returns:
     * {Boolean} The strategy was successfully deactivated.
     */
    deactivate: function() {
		
		var layers = this.map.getLayersByName(this.markerLayerName);

		if(layers.length >= 1){
			var layer = this.map.getLayersByName(this.markerLayerName)[0];
			this.map.removeLayer(layer);
		}


        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if(deactivated) {
            this.clearCache();
            this.layer.events.un({
                "beforefeaturesadded": this.cacheFeatures,
                "featuresremoved": this.clearCache,
                "moveend": this.cluster,
                scope: this
            });
        }
        return deactivated;
    },
    
    /**
     * Method: cacheFeatures
     * Cache features before they are added to the layer.
     *
     * Parameters:
     * event - {Object} The event that this was listening for.  This will come
     *     with a batch of features to be clustered.
     *     
     * Returns:
     * {Boolean} False to stop features from being added to the layer.
     */
    cacheFeatures: function(event) {
        var propagate = true;
        if(!this.clustering) {
            this.clearCache();
            this.features = event.features;
            this.cluster();
            propagate = false;
        }
        return propagate;
    },
    
    /**
     * Method: clearCache
     * Clear out the cached features.
     */
    clearCache: function() {
        if(!this.clustering) {
            this.features = null;
        }
    },
    
    /**
     * Method: cluster
     * Cluster features based on some threshold distance.
     *
     * Parameters:
     * event - {Object} The event received when cluster is called as a
     *     result of a moveend event.
     */
    cluster: function(event) {
		if(this.gmarker.isCusterZoom){
			
			if(this.map.getZoom() >= this.gmarker.zoom){
				this.distance = -1;
				
			}else{
				this.distance = this.gmarker.distance;
			}
		}

		//只保留bbox内的cluster
		var extent = this.map.getExtent();
		var features = [];
		for(var i=0; i<this.features.length; ++i) {
			var feature = this.features[i];
			
			x = feature.geometry.x;
			y = feature.geometry.y;

			if(x < extent.left || x > extent.right) continue;
			if(y < extent.bottom || y > extent.top) continue;

			features.push(feature);
		}
		
        //if((!event || event.zoomChanged) && this.features) {
        if((!event || event.zoomChanged == true || event.zoomChanged == false) && this.features) {
            var resolution = this.layer.map.getResolution();
			
            //if(resolution != this.resolution || !this.clustersExist()) {
			if(resolution != this.resolution || 
			   resolution == this.resolution ||	!this.clustersExist()) {
                this.resolution = resolution;
                var clusters = [];
                var feature, clustered, cluster;
                for(var i=0; i<features.length; ++i) {
                    feature = features[i];
                    if(feature.geometry) {
                        clustered = false;
                        if (this.distance > -1){//if less setup zoom
                            for(var j=clusters.length-1; j>=0; --j) {
                                cluster = clusters[j];
                                if(this.shouldCluster(cluster, feature)) {
                                    this.addToCluster(cluster, feature);
                                    clustered = true;
                                    break;
                                }
                            }
                        }
                        if(!clustered) {
                            clusters.push(this.createCluster(features[i]));
                        }
                    }
                }
                this.clustering = true;
                this.layer.removeAllFeatures();

				for(var i=this.markers.markers.length-1;i>=0;i--){
					this.markers.removeMarker(this.markers.markers[i]);
				}

                this.clustering = false;
                if(clusters.length > 0) {
                    if(this.threshold > 1) {
                        var clone = clusters.slice();
                        clusters = [];
                        var candidate;
                        for(var i=0, len=clone.length; i<len; ++i) {
                            candidate = clone[i];
                            if(candidate.attributes.count < this.threshold) {
                                Array.prototype.push.apply(clusters, candidate.cluster);

                            } else {
                                clusters.push(candidate);
                            }
                        }
                    }
                    this.clustering = true;
                    // A legitimate feature addition could occur during this
                    // addFeatures call.  For clustering to behave well, features
                    // should be removed from a layer before requesting a new batch.
                    this.layer.addFeatures(clusters);
					
					var markerCount = 0;
					var onemarker = "<div><img src='"+this.mm.root+"imgs/icon03.png'/></div>";
					var icontag = "{0}";
					var texttag = "<div style='color:white;font-size:10px;font-weight:bold;position:absolute;left:-29px;top:-29px;z-index:1;'>{0}</div>";
					texttag = "<div class='GIS_CLUSTER_HTML_DIV' style='left:-29px;top:-29px;width:58px;height:58px;line-height:58px;text-align:center;margin-left:auto;margin-right:auto;padding-left:auto;padding-right:auto;color:white;font-size:10px;font-weight:bold;position:absolute;z-index:1;'>{0}</div>";
					var textHigh = texttag;
					var textMedium = texttag;
					var textLow = texttag;

					var high = 100;
					var medium = 20;
                    var picHigh = "<div style='position:absolute;left:-29px;top:-29px;'><img src='"+this.mm.root+"imgs/nuclear-y.png' width='58' height='58'/></div>";
                    var picMedium = "<div style='position:absolute;left:-29px;top:-29px;'><img src='" + this.mm.root +"imgs/nuclear-b.png' width='58' height='58'/></div>";
                    var picLow = "<div style='position:absolute;left:-29px;top:-29px;'><img src='" + this.mm.root +"imgs/nuclear-g.png' width='58' height='58'/></div>";
					var role = this.gmarker.role;
					
					if(role != null){
					    if (EzMap.Tools.isNumber(role.high)) {
							high = role.high;
						}
					    if (EzMap.Tools.isNumber(role.medium)) {
							medium = role.medium;
						}
						if(role.picHigh){
							picHigh = role.picHigh;
						}
						if(role.picMedium){
							picMedium = role.picMedium;
						}
						if(role.picLow){
							picLow = role.picLow;
						}
						if(role.texttagHigh){
							textHigh = role.texttagHigh;
						}
						if(role.texttagHigh){
							textMedium = role.texttagMedium;
						}
						if(role.texttagHigh){
							textLow = role.texttagLow;
						}
					}
                    //#region 同一個點位上
                    if (this.isGroupTheSamePoint == true) {
                        var singles = [];
                        for (var i = clusters.length-1; i >=0; i--) {
                            if (clusters[i].cluster == undefined) {//single 
                                singles.push(clusters[i]);
                                clusters.indexPop(i);
                            }
                        }
                        var single = null;
                        var singleClusters = [];
                        this.distance = 0.05;
                        for (var i = 0; i < singles.length; ++i) {
                            single = singles[i];

                            clustered = false;

                            for (var j = singleClusters.length - 1; j >= 0; --j) {
                                cluster = singleClusters[j];
                                if (this.shouldCluster(cluster, single)) {
                                    this.addToCluster(cluster, single);
                                    clustered = true;
                                    break;
                                }
                            }
                            if (!clustered) {
                                singleClusters.push(this.createCluster(singles[i]));
                                singleClusters[singleClusters.length - 1].isTheSamePoint = true;
                            }
                        }
                        Array.prototype.push.apply(clusters, singleClusters);

                        var clone = clusters.slice();
                        clusters = [];
                        var candidate;
                        for (var i = 0, len = clone.length; i < len; ++i) {
                            candidate = clone[i];
                            if (candidate.attributes.count < 2) {
                                Array.prototype.push.apply(clusters, candidate.cluster);
                            } else {
                                clusters.push(candidate);
                            }
                        }
                    }
                    //#endregion

					var icon = "";
					var html = "";
					var text = "";
					var x = 0;
					var y = 0;
					var extent = 0;
					var center = null;
					for(var i=0; i<clusters.length;i++){

						//#region 放marker到圖台 下列才開始把看的到的bbox部份做push
						if(!clusters[i].cluster || clusters[i].cluster.length<=1){
							
							if(clusters[i].dgmarker.iconObject == null){
								html = clusters[i].dgmarker.htmlstr;
							}else{
								html = "<img src='"+clusters[i].dgmarker.iconObject.image.src+"'/>";
							}
                        } else {

							markerCount = clusters[i].cluster.length;

							if(markerCount<=medium){
								icon = String.format(icontag,picLow,46);
								text = textLow;
							}else if(markerCount>medium && markerCount<=high){
								icon = String.format(icontag,picMedium,58);
								text = textMedium;
							}else{
                                icon = String.format(icontag,picHigh,62);
								text = textHigh;
                            }
                            //enable the same point group
                            if (clusters[i].isTheSamePoint != undefined && clusters[i].isTheSamePoint == true) {
                                icon = "<div style='position:absolute;left:-30px;top:-30px;'><img src='" + this.mm.root + "imgs/easymap.png' width='60' height='60'/></div>";
                                var animation = '<div style="position: absolute; left: -30px; top: -30px;" class="MM-Strategy-Cluster-Animation"></div>';
                                html = "<div>" + text + icon + animation+"</div>";
                                html = String.format(html, markerCount);
                            } else {
                                html = "<div>" + text + icon + "</div>";
                                html = String.format(html, markerCount);
                            }
                            
						}

						center = clusters[i].geometry.getBounds().getCenterLonLat();
						icon = new EzMap.HtmlStr(html, this.mm);
						icon.imageDiv.className = i;
						var marker = new OpenLayers.Marker(new OpenLayers.LonLat(center.lon,center.lat),icon);

                        if (clusters[i].isTheSamePoint != undefined && clusters[i].isTheSamePoint == true) {
                            var obj = {
                                This:this,
                                marker: marker,
                                cluster: clusters[i]
                            }
                            marker.events.on({
                                "click": this.theSamePointClick,
                                scope: obj
                            });
                            this.markers.addMarker(marker);
                            return;
                        }

						marker.events.on({
                            "click": function (e) {

								if(this.gmarker.click == null) return;
								var cluster = this.getCluster(e);
								var group = this.getGroup(e);
								this.gmarker.click(cluster,group);
							},
						"mouseover": function(e){
								if(this.gmarker.mouseover == null) return;
								var cluster = this.getCluster(e);
								var group = this.getGroup(e);
								this.gmarker.mouseover(cluster,group);
							},
						"mouseout": function(e){
								if(this.gmarker.mouseout == null) return;
								var cluster = this.getCluster(e);
								var group = this.getGroup(e);
								this.gmarker.mouseout(cluster,group);
							},
						"mousedown": function(e){
								if(this.gmarker.mousedown == null) return;
								var cluster = this.getCluster(e);
								var group = this.getGroup(e);
								this.gmarker.mousedown(cluster,group);
							},
						scope: this});
                        //#endregion
						this.markers.addMarker(marker);
					}
                    this.clustering = false;
                }
                this.clusters = clusters;
            }
        }
    },

    theSamePointClick: function (event) {

        //reset
        for (var i = this.This.markers.markers.length - 1; i >= 0; i--) {
            if (this.This.markers.markers[i].icon.imageDiv.className.indexOf('MM-Strategy-Cluster-SamePoint') >= 0) {
                this.This.markers.removeMarker(this.This.markers.markers[i]);
            }
        }

        //#region add marker
        var clusters = this.cluster.cluster;
        var imgs = [];
        for (var i = 0; i < clusters.length; i++) {

            if (clusters[i].dgmarker.iconObject == null) {
                html = clusters[i].dgmarker.htmlstr;
            } else {
                html = "<img src='" + clusters[i].dgmarker.iconObject.image.src + "'/>";
            }

            center = clusters[i].geometry.getBounds().getCenterLonLat();

            var icon = new EzMap.HtmlStr(html, this.This.mm);
            icon.imageDiv.className = i;
            var marker = new OpenLayers.Marker(new OpenLayers.LonLat(center.lon, center.lat), icon);

            marker.icon.imageDiv.className += ' MM-Strategy-Cluster-SamePoint';
            var cluster = clusters[i];

            this.This.markers.addMarker(marker);
            marker.icon.imageDiv.style.transitionDuration = '1s';
            marker.icon.imageDiv.style.transformOrigin = '0px 0px';

            
        }
        //#endregion
        //#region animation
        setTimeout(function () {
            var markers = document.getElementsByClassName('MM-Strategy-Cluster-SamePoint');
            for (var i = 0; i < markers.length; i++) {
                var marker = markers[i];
                var x = (50) * Math.cos(45 * i) ;
                var y = (50) * Math.sin(45 * i) ;
                marker.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            }
        }, 10);
        //#endregion
    },
    getGroup: function (e) {
        var i = e.element.className;
        var cluster = this.clusters[i];
        var lonlat = this.mm.toWGS84(cluster.geometry.x, cluster.geometry.y);
        var obj = {};
        obj.x = lonlat.lon;
        obj.y = lonlat.lat;

        return obj;
    },
    getCluster: function(e){
		var i = e.element.className;
		var cluster = this.clusters[i];
		var thisCluster = [];

        if (cluster != undefined && cluster.cluster){//多個

			for(var j=0;j<cluster.cluster.length;j++){
				thisCluster.push(cluster.cluster[j].dgmarker);
			}
		}else{//單一個
			thisCluster.push(cluster.dgmarker);
		}
		return thisCluster;
	},
    /**
     * Method: clustersExist
     * Determine whether calculated clusters are already on the layer.
     *
     * Returns:
     * {Boolean} The calculated clusters are already on the layer.
     */
    clustersExist: function() {
        var exist = false;
        if(this.clusters && this.clusters.length > 0 &&
           this.clusters.length == this.layer.features.length) {
            exist = true;
            for(var i=0; i<this.clusters.length; ++i) {
                if(this.clusters[i] != this.layer.features[i]) {
                    exist = false;
                    break;
                }
            }
        }
        return exist;
    },
    
    /**
     * Method: shouldCluster
     * Determine whether to include a feature in a given cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     *
     * Returns:
     * {Boolean} The feature should be included in the cluster.
     */
    shouldCluster: function(cluster, feature) {
        var cc = cluster.geometry.getBounds().getCenterLonLat();
        var fc = feature.geometry.getBounds().getCenterLonLat();
        var distance = (
            Math.sqrt(
                Math.pow((cc.lon - fc.lon), 2) + Math.pow((cc.lat - fc.lat), 2)
            ) / this.resolution
        );
        return (distance <= this.distance);
    },
    
    /**
     * Method: addToCluster
     * Add a feature to a cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     */
    addToCluster: function(cluster, feature) {
        cluster.cluster.push(feature);
        cluster.attributes.count += 1;
    },
    
    /**
     * Method: createCluster
     * Given a feature, create a cluster.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A cluster.
     */
    createCluster: function(feature) {
        var center = feature.geometry.getBounds().getCenterLonLat();
        var cluster = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(center.lon, center.lat),
            {count: 1}
        );
        cluster.cluster = [feature];
        return cluster;
    },

    CLASS_NAME: "MM.Strategy.Cluster" 
});

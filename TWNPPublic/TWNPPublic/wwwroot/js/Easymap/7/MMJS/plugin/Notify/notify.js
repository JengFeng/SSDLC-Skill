/* Notify.js - http://notifyjs.com/ Copyright (c) 2015 MIT */
(function (factory) {
	// UMD start
	// https://github.com/umdjs/umd/blob/master/jqueryPluginCommonjs.js
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function( root, jQuery ) {
			if ( jQuery === undefined ) {
				// require('jQuery') returns a factory that requires window to
				// build a jQuery instance, we normalize how we use modules
				// that require this pattern but the window provided is a noop
				// if it's defined (how jquery works)
				if ( typeof window !== 'undefined' ) {
					jQuery = require('jquery');
				}
				else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	//IE8 indexOf polyfill
	var indexOf = [].indexOf || function(item) {
		for (var i = 0, l = this.length; i < l; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	};

	var pluginName = "notify";
	var pluginClassName = pluginName + "js";
	var blankFieldName = pluginName + "!blank";

	var positions = {
		t: "top",
		m: "middle",
		b: "bottom",
		l: "left",
		c: "center",
		r: "right"
	};
	var hAligns = ["l", "c", "r"];
	var vAligns = ["t", "m", "b"];
	var mainPositions = ["t", "b", "l", "r"];
	var opposites = {
		t: "b",
		m: null,
		b: "t",
		l: "r",
		c: null,
		r: "l"
	};

	var parsePosition = function(str) {
		var pos;
		pos = [];
		$.each(str.split(/\W+/), function(i, word) {
			var w;
			w = word.toLowerCase().charAt(0);
			if (positions[w]) {
				return pos.push(w);
			}
		});
		return pos;
	};

	var styles = {};

	var coreStyle = {
		name: "core",
		html: "<div class=\"" + pluginClassName + "-wrapper\">\n	<div class=\"" + pluginClassName + "-arrow\"></div>\n	<div class=\"" + pluginClassName + "-container\"></div>\n</div>",
		css: "." + pluginClassName + "-corner {\n	position: fixed;\n	margin: 5px;\n	z-index: 1050;\n}\n\n." + pluginClassName + "-corner ." + pluginClassName + "-wrapper,\n." + pluginClassName + "-corner ." + pluginClassName + "-container {\n	position: relative;\n	display: block;\n	height: inherit;\n	width: inherit;\n	margin: 3px;\n}\n\n." + pluginClassName + "-wrapper {\n	z-index: 1;\n	position: absolute;\n	display: inline-block;\n	height: 0;\n	width: 0;\n}\n\n." + pluginClassName + "-container {\n	display: none;\n	z-index: 1;\n	position: absolute;\n}\n\n." + pluginClassName + "-hidable {\n	cursor: pointer;\n}\n\n[data-notify-text],[data-notify-html] {\n	position: relative;\n}\n\n." + pluginClassName + "-arrow {\n	position: absolute;\n	z-index: 2;\n	width: 0;\n	height: 0;\n}"
	};

	var stylePrefixes = {
		"border-radius": ["-webkit-", "-moz-"]
	};

	var getStyle = function(name) {
		return styles[name];
	};

	var addStyle = function(name, def) {
		if (!name) {
			throw "Missing Style name";
		}
		if (!def) {
			throw "Missing Style definition";
		}
		if (!def.html) {
			throw "Missing Style HTML";
		}
		//remove existing style
		var existing = styles[name];
		if (existing && existing.cssElem) {
			if (window.console) {
				console.warn(pluginName + ": overwriting style '" + name + "'");
			}
			styles[name].cssElem.remove();
		}
		def.name = name;
		styles[name] = def;
		var cssText = "";
		if (def.classes) {
			$.each(def.classes, function(className, props) {
				cssText += "." + pluginClassName + "-" + def.name + "-" + className + " {\n";
				$.each(props, function(name, val) {
					if (stylePrefixes[name]) {
						$.each(stylePrefixes[name], function(i, prefix) {
							return cssText += "	" + prefix + name + ": " + val + ";\n";
						});
					}
					return cssText += "	" + name + ": " + val + ";\n";
				});
				return cssText += "}\n";
			});
		}
		if (def.css) {
			cssText += "/* styles for " + def.name + " */\n" + def.css;
		}
		if (cssText) {
			def.cssElem = insertCSS(cssText);
			def.cssElem.attr("id", "notify-" + def.name);
		}
		var fields = {};
		var elem = $(def.html);
		findFields("html", elem, fields);
		findFields("text", elem, fields);
		def.fields = fields;
	};

	var insertCSS = function(cssText) {
		var e, elem, error;
		elem = createElem("style");
		elem.attr("type", 'text/css');
		$("head").append(elem);
		try {
			elem.html(cssText);
		} catch (_) {
			elem[0].styleSheet.cssText = cssText;
		}
		return elem;
	};

	var findFields = function(type, elem, fields) {
		var attr;
		if (type !== "html") {
			type = "text";
		}
		attr = "data-notify-" + type;
		return find(elem, "[" + attr + "]").each(function() {
			var name;
			name = $(this).attr(attr);
			if (!name) {
				name = blankFieldName;
			}
			fields[name] = type;
		});
	};

	var find = function(elem, selector) {
		if (elem.is(selector)) {
			return elem;
		} else {
			return elem.find(selector);
		}
	};

	var pluginOptions = {
		clickToHide: true,
		autoHide: true,
		autoHideDelay: 5000,
		arrowShow: true,
		arrowSize: 5,
		breakNewLines: true,
		elementPosition: "bottom",
		globalPosition: "top right",
		style: "bootstrap",
		className: "error",
		showAnimation: "slideDown",
		showDuration: 400,
		hideAnimation: "slideUp",
		hideDuration: 200,
		gap: 5
	};

	var inherit = function(a, b) {
		var F;
		F = function() {};
		F.prototype = a;
		return $.extend(true, new F(), b);
	};

	var defaults = function(opts) {
		return $.extend(pluginOptions, opts);
	};

	var createElem = function(tag) {
		return $("<" + tag + "></" + tag + ">");
	};

	var globalAnchors = {};

	var getAnchorElement = function(element) {
		var radios;
		if (element.is('[type=radio]')) {
			radios = element.parents('form:first').find('[type=radio]').filter(function(i, e) {
				return $(e).attr("name") === element.attr("name");
			});
			element = radios.first();
		}
		return element;
	};

	var incr = function(obj, pos, val) {
		var opp, temp;
		if (typeof val === "string") {
			val = parseInt(val, 10);
		} else if (typeof val !== "number") {
			return;
		}
		if (isNaN(val)) {
			return;
		}
		opp = positions[opposites[pos.charAt(0)]];
		temp = pos;
		if (obj[opp] !== undefined) {
			pos = positions[opp.charAt(0)];
			val = -val;
		}
		if (obj[pos] === undefined) {
			obj[pos] = val;
		} else {
			obj[pos] += val;
		}
		return null;
	};

	var realign = function(alignment, inner, outer) {
		if (alignment === "l" || alignment === "t") {
			return 0;
		} else if (alignment === "c" || alignment === "m") {
			return outer / 2 - inner / 2;
		} else if (alignment === "r" || alignment === "b") {
			return outer - inner;
		}
		throw "Invalid alignment";
	};

	var encode = function(text) {
		encode.e = encode.e || createElem("div");
		return encode.e.text(text).html();
	};

	function Notification(elem, data, options) {
		if (typeof options === "string") {
			options = {
				className: options
			};
		}
		this.options = inherit(pluginOptions, $.isPlainObject(options) ? options : {});
		this.loadHTML();
		this.wrapper = $(coreStyle.html);
		if (this.options.clickToHide) {
			this.wrapper.addClass(pluginClassName + "-hidable");
		}
		this.wrapper.data(pluginClassName, this);
		this.arrow = this.wrapper.find("." + pluginClassName + "-arrow");
		this.container = this.wrapper.find("." + pluginClassName + "-container");
		this.container.append(this.userContainer);
		if (elem && elem.length) {
			this.elementType = elem.attr("type");
			this.originalElement = elem;
			this.elem = getAnchorElement(elem);
			this.elem.data(pluginClassName, this);
			this.elem.before(this.wrapper);
		}
		this.container.hide();
		this.run(data);
	}

	Notification.prototype.loadHTML = function() {
		var style;
		style = this.getStyle();
		this.userContainer = $(style.html);
		this.userFields = style.fields;
	};

	Notification.prototype.show = function(show, userCallback) {
		var args, callback, elems, fn, hidden;
		callback = (function(_this) {
			return function() {
				if (!show && !_this.elem) {
					_this.destroy();
				}
				if (userCallback) {
					return userCallback();
				}
			};
		})(this);
		hidden = this.container.parent().parents(':hidden').length > 0;
		elems = this.container.add(this.arrow);
		args = [];
		if (hidden && show) {
			fn = "show";
		} else if (hidden && !show) {
			fn = "hide";
		} else if (!hidden && show) {
			fn = this.options.showAnimation;
			args.push(this.options.showDuration);
		} else if (!hidden && !show) {
			fn = this.options.hideAnimation;
			args.push(this.options.hideDuration);
		} else {
			return callback();
		}
		args.push(callback);
		return elems[fn].apply(elems, args);
	};

	Notification.prototype.setGlobalPosition = function() {
		var p = this.getPosition();
		var pMain = p[0];
		var pAlign = p[1];
		var main = positions[pMain];
		var align = positions[pAlign];
		var key = pMain + "|" + pAlign;
		var anchor = globalAnchors[key];
		if (!anchor) {
			anchor = globalAnchors[key] = createElem("div");
			var css = {};
			css[main] = 0;
			if (align === "middle") {
				css.top = '45%';
			} else if (align === "center") {
				css.left = '45%';
			} else {
				css[align] = 0;
			}
			anchor.css(css).addClass(pluginClassName + "-corner");
			$("body").append(anchor);
		}
		return anchor.prepend(this.wrapper);
	};

	Notification.prototype.setElementPosition = function() {
		var arrowColor, arrowCss, arrowSize, color, contH, contW, css, elemH, elemIH, elemIW, elemPos, elemW, gap, j, k, len, len1, mainFull, margin, opp, oppFull, pAlign, pArrow, pMain, pos, posFull, position, ref, wrapPos;
		position = this.getPosition();
		pMain = position[0];
		pAlign = position[1];
		pArrow = position[2];
		elemPos = this.elem.position();
		elemH = this.elem.outerHeight();
		elemW = this.elem.outerWidth();
		elemIH = this.elem.innerHeight();
		elemIW = this.elem.innerWidth();
		wrapPos = this.wrapper.position();
		contH = this.container.height();
		contW = this.container.width();
		mainFull = positions[pMain];
		opp = opposites[pMain];
		oppFull = positions[opp];
		css = {};
		css[oppFull] = pMain === "b" ? elemH : pMain === "r" ? elemW : 0;
		incr(css, "top", elemPos.top - wrapPos.top);
		incr(css, "left", elemPos.left - wrapPos.left);
		ref = ["top", "left"];
		for (j = 0, len = ref.length; j < len; j++) {
			pos = ref[j];
			margin = parseInt(this.elem.css("margin-" + pos), 10);
			if (margin) {
				incr(css, pos, margin);
			}
		}
		gap = Math.max(0, this.options.gap - (this.options.arrowShow ? arrowSize : 0));
		incr(css, oppFull, gap);
		if (!this.options.arrowShow) {
			this.arrow.hide();
		} else {
			arrowSize = this.options.arrowSize;
			arrowCss = $.extend({}, css);
			arrowColor = this.userContainer.css("border-color") || this.userContainer.css("border-top-color") || this.userContainer.css("background-color") || "white";
			for (k = 0, len1 = mainPositions.length; k < len1; k++) {
				pos = mainPositions[k];
				posFull = positions[pos];
				if (pos === opp) {
					continue;
				}
				color = posFull === mainFull ? arrowColor : "transparent";
				arrowCss["border-" + posFull] = arrowSize + "px solid " + color;
			}
			incr(css, positions[opp], arrowSize);
			if (indexOf.call(mainPositions, pAlign) >= 0) {
				incr(arrowCss, positions[pAlign], arrowSize * 2);
			}
		}
		if (indexOf.call(vAligns, pMain) >= 0) {
			incr(css, "left", realign(pAlign, contW, elemW));
			if (arrowCss) {
				incr(arrowCss, "left", realign(pAlign, arrowSize, elemIW));
			}
		} else if (indexOf.call(hAligns, pMain) >= 0) {
			incr(css, "top", realign(pAlign, contH, elemH));
			if (arrowCss) {
				incr(arrowCss, "top", realign(pAlign, arrowSize, elemIH));
			}
		}
		if (this.container.is(":visible")) {
			css.display = "block";
		}
		this.container.removeAttr("style").css(css);
		if (arrowCss) {
			return this.arrow.removeAttr("style").css(arrowCss);
		}
	};

	Notification.prototype.getPosition = function() {
		var pos, ref, ref1, ref2, ref3, ref4, ref5, text;
		text = this.options.position || (this.elem ? this.options.elementPosition : this.options.globalPosition);
		pos = parsePosition(text);
		if (pos.length === 0) {
			pos[0] = "b";
		}
		if (ref = pos[0], indexOf.call(mainPositions, ref) < 0) {
			throw "Must be one of [" + mainPositions + "]";
		}
		if (pos.length === 1 || ((ref1 = pos[0], indexOf.call(vAligns, ref1) >= 0) && (ref2 = pos[1], indexOf.call(hAligns, ref2) < 0)) || ((ref3 = pos[0], indexOf.call(hAligns, ref3) >= 0) && (ref4 = pos[1], indexOf.call(vAligns, ref4) < 0))) {
			pos[1] = (ref5 = pos[0], indexOf.call(hAligns, ref5) >= 0) ? "m" : "l";
		}
		if (pos.length === 2) {
			pos[2] = pos[1];
		}
		return pos;
	};

	Notification.prototype.getStyle = function(name) {
		var style;
		if (!name) {
			name = this.options.style;
		}
		if (!name) {
			name = "default";
		}
		style = styles[name];
		if (!style) {
			throw "Missing style: " + name;
		}
		return style;
	};

	Notification.prototype.updateClasses = function() {
		var classes, style;
		classes = ["base"];
		if ($.isArray(this.options.className)) {
			classes = classes.concat(this.options.className);
		} else if (this.options.className) {
			classes.push(this.options.className);
		}
		style = this.getStyle();
		classes = $.map(classes, function(n) {
			return pluginClassName + "-" + style.name + "-" + n;
		}).join(" ");
		return this.userContainer.attr("class", classes);
	};

	Notification.prototype.run = function(data, options) {
		var d, datas, name, type, value;
		if ($.isPlainObject(options)) {
			$.extend(this.options, options);
		} else if ($.type(options) === "string") {
			this.options.className = options;
		}
		if (this.container && !data) {
			this.show(false);
			return;
		} else if (!this.container && !data) {
			return;
		}
		datas = {};
		if ($.isPlainObject(data)) {
			datas = data;
		} else {
			datas[blankFieldName] = data;
		}
		for (name in datas) {
			d = datas[name];
			type = this.userFields[name];
			if (!type) {
				continue;
			}
			if (type === "text") {
				d = encode(d);
				if (this.options.breakNewLines) {
					d = d.replace(/\n/g, '<br/>');
				}
			}
			value = name === blankFieldName ? '' : '=' + name;
			find(this.userContainer, "[data-notify-" + type + value + "]").html(d);
		}
		this.updateClasses();
		if (this.elem) {
			this.setElementPosition();
		} else {
			this.setGlobalPosition();
		}
		this.show(true);
		if (this.options.autoHide) {
			clearTimeout(this.autohideTimer);
			this.autohideTimer = setTimeout(this.show.bind(this, false), this.options.autoHideDelay);
		}
	};

	Notification.prototype.destroy = function() {
		this.wrapper.data(pluginClassName, null);
		this.wrapper.remove();
	};

	$[pluginName] = function(elem, data, options) {
		if ((elem && elem.nodeName) || elem.jquery) {
			$(elem)[pluginName](data, options);
		} else {
			options = data;
			data = elem;
			new Notification(null, data, options);
		}
		return elem;
	};

	$.fn[pluginName] = function(data, options) {
		$(this).each(function() {
			var prev = getAnchorElement($(this)).data(pluginClassName);
			if (prev) {
				prev.destroy();
			}
			var curr = new Notification($(this), data, options);
		});
		return this;
	};

	$.extend($[pluginName], {
		defaults: defaults,
		addStyle: addStyle,
		pluginOptions: pluginOptions,
		getStyle: getStyle,
		insertCSS: insertCSS
	});

	//always include the default bootstrap style
	addStyle("bootstrap", {
		html: "<div>\n<span data-notify-text></span>\n</div>",
		classes: {
			base: {
				"font-weight": "bold",
				"padding": "8px 15px 8px 14px",
				"text-shadow": "0 1px 0 rgba(255, 255, 255, 0.5)",
				"background-color": "#fcf8e3",
				"border": "1px solid #000",
				"border-radius": "0px",
				"white-space": "nowrap",
				"padding-left": "36px",
				"background-repeat": "no-repeat",
                "background-position": "3px 2px",
                "box-shadow":"4px 4px 2px rgba(0, 0, 0, 0.1)"
			},
			error: {
				"color": "#B94A48",
				"background-color": "#F2DEDE",
				"border": "0px solid #EED3D7",
                "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAqdJREFUWIXFl79PE2EYx7/Pc0eQQu0iGzGxaXpNqZDYQcLYARN0coKpg38Acetkoi4QY8JsXImbTJA4tJsmJgw0kLvEHhAMi2ESLlSk9zwuPW0LpEftj+90ufe99/N57+695z1CyHxLJG77hvEEQE6IplkkDiBabz4R5gNWLStR0azVNpKuexJmXGrXwbEsS4gKABYYuBVmUAGqBHxQouVJx6l0JLCVzUZGPe+1EC0xYIQBXzaRmjKvjnnei7tHR9XQAnYqlSTVdRClOwK3egA7yvw0Y9tuWwE7lXqgwCcG7nQD3iBxrMxzGdvevlbATqWSCnzuNrxFYrbxTnBwsD01NUqq62Hhw/k8YqUSYqUShvP5UAIMjJPIx+8TEyOXBIbPz19165m3kbjvjY29bBKoL7WlXsODkMjz3XQ68VdAiAodL7VOwmwavl8AAN6Lx2MAFvoGD6K66FhW1Pw9NPQ47Beuq2GOCNE8A8j1HR7E93MsRNOD4jPRNNer2kAiRHHGv5La97BIjNt367EEgFAbh15EmH+yMB8MSoBV98mxrPcgejYIARF5x0pUHAQcAAygyGattiHAldulnkbkrGaam5x03RMCPtz0+k72A00hWsvYtscAoETLEKndfJQOI3Jh+P4KUC/Hk45TUebVvgkQvU267h7QsCfcymYjo6enX8Gc6SVbgfJItTpz7/DwV5MAAOym0wkS+cLAeE/oIj9YddaqVPaDU02f4oxtu8o8J8Bxj+CPGuGXBOoS28o8K8BOt9gKlOszL7e2XVmMMrbtRj3voQJv/mt1iFxAdXmkWp1pnXmQtj+nu+l0wvD9AlQXwRwJCT4D0Zrh+yvB235d2goEcSwrKszz8P0cE00LUZxFYkC9qqnui2rZAIo109zM2LYXZtw/76QU4/IT0FoAAAAASUVORK5CYII=)"
			},
			success: {
				"color": "#468847",
				"background-color": "#DFF0D8",
                "border": "0px solid #D6E9C6",
                "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABDFJREFUWIXll11MXEUUx/8z9+6FXUorkLYWUkpiCqlQINo+GJsafTL6VEyqCVI/HpoQw5eJD01MDPEJNU1FqKZGo2JK40dTMcbYaCqNiQ9tWUpbZAtaeLFdEmCJuyw7e+ccH9hd9nJ3YRFMTDxP9575z/z+M3N2di7wfw+x7h4MUTfcUQoblSypCAAEyTkpzYD/4bf//NcMVF9r22eQOM7MR4SUezJpiDEpBJ9nyA9vHjg5tikG6vwdZVrTOxLyuVzNgsAQOGuCXxs6eOruPzZQd6X9aWb0QYqinOHOmAGoceTAuz9kE8hsDfuvtL/AzAMbgANACUF+V3O1vTGbIOMKLM2cByBlVoPrCQK0wfzU9YOnLq5poM7fUaYV3ZKG3LYZ8GQw0yzb/ODNR7qD6XnXDMnGyc2GA4AQshge8y1XPv2l+lrbPoPl6EZhO81tCNrz7gZiliZVDT/UPZ5MOVZAxEXLRuEvFT+Bj8pfQY233N0ohaC4aHakUk8MISQ9u1F4U/Fh+KSFrtLnsT/ffV5pwY5fRMpA3XBHqZBG8UbhyfAKCyfub4BHGA6dIY0d9UMt210GdIzrNwsOAPPxCE7cOIM42S69iIpalwFS8ZpsgBrvblTn714XvNXfgz94BhDuo0aRTrFSBgTRfZkAtfkV6CptQldpk8tEJngoAb/jmYOxNT/zjIhSp+tyEWrEVurqvRXoKmuEV1iJwlo2kQ3e5u/BpCcEszALHAArSrHMlClbTRhwdtpr7UKe8KTekyYuR0bxZKGzZFJwcw7GKnAA0FG6nXxeLsK/7Ktsk0PYf+cnnJ741pHzSSsjvHUoAc+27Ilgm0DK9rsM7CqpmKAFpdLFZpEXZ4M/o3diIOuASfjUanueFnY4Fh2/UT7pMjD4eKetorFLDrUQsHZsQX9wED0T37jhKrwEt0I5wcEAxdRFdHamltr5Z7So36OIcnZKmDgXvOxYiZAKo9XfiylrDkZh3tpwABRREIvUm55zGBgfqfjeDkV+A3FGE/3BQbz/+0AaPLRmwSWDNUHNLwyPNXzyo2PolcK9Xx07bBZYg+b2QncjM9R0GFspD5EtnPPMASB+L8ysFh8da+j7NT1vrBTOfnF9qqShNp81HZI+y2lCCBgFFpRJMApyh9szEVA0/mbgmc/6VrZlvHIFdOR1iqhz9nQYnGE7pNfKCcyaEJ8OQ4djnwdG9nRm0mS9FT926Q3z3uxkNwzZ7CnyQfqs3L8ieKng7PkoSFP3bTvyKo5+qddlIBmV548dBaFb5pk7jYI8SJ8HwnTt3BLXJugFBQoraFvflYJbAkc+/Xq18XOaU9WFlwuZdbPQ4jgkHhCGWDIhE92JwXENJgaBxiXLM4b2fTB69HR4rbHX923IEFUXXqxhFocEuBJA8gIzC3BAsPHLWMPHtyDAqw3zn4q/ASpbzULSPOuTAAAAAElFTkSuQmCC)"
			},
			info: {
				"color": "#3A87AD",
				"background-color": "#D9EDF7",
                "border": "0px solid #BCE8F1",
                "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAA/FJREFUWIXll11oXEUUx/8z927uJrtpkq0m0RqiaU26a1EIGCJGQ0Ha+gHiSyz0wQepbYS8FAQFyyaKiIIIEU2or0WkUGkF0dSHEqyUQpsUtMnuJkg11NrYph/ZZHfvnTnHh2Q3u9mvu6URwfOyw5lzzv93586dOQv8301UnMEsukdjD9pCtktQAwAQ5E12VHRyIPjnhgF0jcRCGmK/EPQKIFsLsgGXBfE3bNCXFw5sj9wTgO6R6BaHxSdCilfdwoKIWcqvGM5bEwdDV+8aoHM0+qJkHIWQ9a7FszmAGyDsm3jz0bFiMbK4+OxrEvj2bsVXi28G6LsnR2L7isUUXIHOL2IvScknAVkUsBIjIg0pXpg42H6qLED3SHSLDZ6SwthUqmhvq4V3nqoDAHzw8238NJcqA8ELHo8ROrd/67Vsf94TOsCn5cQBgJSTGbN2SkSuCkkR0Fp/vN6fswJdI7EQCXGpbDUA7ZsUXt5mAQBOzKQws2iWTyJiQxgd5/q3zaRdOVmKaUAKw40+puaTmIz9AQDw1jfB8LoAkFJo0v0ADmVcmUlmAYg+V+oATK8fvuY2+JrbYHh9btPApHO+iMwr6DoSe4hIzJUr4PMIHOj0o8ZcYz8eXcb09fL7IG3Kw40XX2//G8hagZSjnnCTvOuRalSBELAYPS0WelosbLbYtTgAeBLO4+lxBkDaqR1uko9NXMHhk7/g2IW1xXLzFWSbVmtaazuHyNWJ5/E3wONvgFlTkWYuAHNDepxZAUWq9ElyD41JZ7QyAGynZv8tAJ2Ix/IAbHv5PGm14eKkHdiOnswDeADWrE4u2hsNoJaXEjM4czkPYHxop7KTd05vrDxD2UunMDREaU/O+cnK+Uwl47tNr79oid7WlfN/e92a77FGL8wVN8Z/L76XVSIOUsnPs32513E4LIPmM7/W3NcSFKJwK/DD3saiAgCw5+v5whOkEb8+dzFy+LlOCJE5ufL6gWB47FnDqh63As0QBfqVpb9+Kwnga24r6E/euMJKJZ6OhJ8/m+0v2BEFB8c+NL3+t6vq78+D0MmlkgCFLqbUrXmoZPy96cHd4fVzBe/Q6dDtd4NT/DDf1HutuiaIrM6skpsPpJG8NQ9lLx+N8NmhQiFFu+Le8GnzGuxhaRj9VbUBmNX+UuHrjKEScaQWF8CkhiOhO4fQ16crAkhbMPx9HwHDpmk1mTW1MCwfpOkpGEvagU4swUksgpVzlSQPRMN7jpeq7+qROj46USuXq/sZeEMIbBXSgDQ8mVfDRCBtr/wyzUiIIwLW6NTQzni52pX9N2QWHe//uEMS9QCiHUBgdWYBTFGGPBMZ3HUp+zP7z9s/dNx/VnnSTNoAAAAASUVORK5CYII=)"
			},
			warn: {
				"color": "#C09853",
				"background-color": "#FCF8E3",
                "border": "0px solid #FBEED5",
                "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAACPElEQVRYhe2UMWsTcRjGf/+7tMlZE9siHVRwilqNoBgRlyKIKOjSxUE3pQoKnbtkCToVGuPQD+AHEL9BERcll6hDxSKCFaEuySUV7JDkXoc09Hq5S++SFCnkmXLv8/6f57nnHw6GGOIgwyqQswrk/ot5pch9y0QsE6mY3OtVR/Vy6PdnxqJ11oDj26NfW3D6WJq/YbW0XgJE6yw4zAFOGLDQi1boBqwSJ8Xmq4KYi9oSODOZ5mcYvfAN2Cx6mAMYwGJYuVANWCVmsHnbbUcUM5OXeBdUM3ADImjY5PfaU0JeJLhu4MVaiYfAhfbzp7UEc9kUc9kUq98PO1cv1oo8GGiAiskREZ45Z7bA+obB+obRsS/wvPyexMACKMgAU86ZEW06ftvuI1MqQmYgATY/cAqYd8/HYjumMUeYNhTM1z6S7DtAU2cJGHHPjZijgVhHAwCjdpOlvgKUi9wCbntxztoPeTSwjTu1Ijd7CiArRHTxf4N2A0rB6IhnAy0dIScrRPx4X6Ia5ykw7cfrmnAtXUHTBNXlcyYwXY3zBHjpxXse3TQ52oRvwLifsG1DYbVFXz5XRev+b7L0JsnEFcpuwvOYDdlu5tAyzywnySwnMb90XQWYsHWyXkRHgIrJeYFHeylW//jenicEHlcKpNzzDhUFLwB9L8EbV8soBePxBumz1SAZdKXIA9ddfjuwiswivA6i1gdmJ9K8aT/sugIFd/fZvMNj1xU0IBuBH+Lx5RuQeb2heLUf2kMcXPwDFGidftU4MHEAAAAASUVORK5CYII=)"
			}
		}
	});

	$(function() {
		insertCSS(coreStyle.css).attr("id", "core-notify");
		$(document).on("click", "." + pluginClassName + "-hidable", function(e) {
			$(this).trigger("notify-hide");
		});
		$(document).on("notify-hide", "." + pluginClassName + "-wrapper", function(e) {
			var elem = $(this).data(pluginClassName);
			if(elem) {
				elem.show(false);
			}
		});
	});

}));

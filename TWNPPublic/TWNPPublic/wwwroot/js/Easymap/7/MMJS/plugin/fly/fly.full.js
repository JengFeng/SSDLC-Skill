/*!
 * @name fly
 * @version v0.0.19
 * @author Artur Burtsev <artjock@gmail.com>
 * @see https://github.com/artjock/fly
 */
;(function(root, factory) {
   if (typeof module === 'object' && typeof module.exports === 'object') {
       module.exports = factory(require('jquery'));
   } else {
       root.jQuery.fly = factory(root.jQuery);
   }
})(this, function($) {

/**
 * Wrapper
 */
var fly = {
    /**
     * Instances count
     * @private
     * @type Number
     */
    _count: 0,

    /**
     * Mixins collection
     * @private
     * @type Object
     */
    _mixin: {},

    /**
     * Instances
     * @private
     * @type Array
     */
    _instances: []
};



fly._base = {

    /**
     * Avaliable events
     * @enum
     */
    events: {
        hide: 'hide',
        show: 'show',
        rootready: 'rootready'
    },

    _cuid: fly._count++,

    /**
     * Shared constructor
     * @private
     * @type Function
     */
    _ctor: function fly_ctor() {},

    /**
     * DOM root
     * @type jQuery
     * @private
     */
    _$root: null,

    /**
     * Open/close trigger
     * @type jQuery
     * @private
     */
    _$handle: null,

    /**
     * Event emmiter
     * @type jQuery
     */
    _emitter: null,

    /**
     * Default class options
     * @param Object
     * @private
     * @static
     */
    defaults: {
        content: '',
        position: 'bottom center',
        baseClass: 'fly-popover',
        hideClass: 'fly-popover--hidden',
        extraClass: '',
        redrawOnShow: true,
        arrowOffset: 15,
        arrowSize: 10,
        theme:'default'//rex
    },

    /**
     * Events namespace
     * @type String
     */
    ens: '',

    /**
     * Options
     * @param Object
     */
    options: null,



    /**
     * Creates instance of fly
     * @param {jQuery} handle
     * @param {Object} options
     * @return fly
     */
    create: function(handle, options) {

        var inst = this.extend({
            ens: '.ns' + fly._count++,
            _$handle: $(handle),
            _emitter: $({})
        });

        inst.options = $.extend({}, inst.defaults, options);

        fly._instances.push(inst);

        return inst._init();
    },

    /**
     * Extends fly's class and returns new one
     * @param {Object} extra
     * @return fly
     */
    extend: function(extra) {
        this._ctor.prototype = this;

        if (extra && 'defaults' in extra) {
            extra.defaults =
                $.extend({}, this.defaults, extra.defaults);
        }

        var component = $.extend(new this._ctor(), extra);

        component._cuid = fly._count++;

        if (extra.register$) {
            fly.register$(extra.register$, component);
        }

        return component;
    },

    /**
     * Adds listeners for component's action list
     * @param {string} selector
     * @param {Object} options
     */
    delegate: function(selector, options) {
        var that = this;
        var expando = 'fly_delegated_' + that._cuid;

        $.each(that.actions, function(action) {
            $(document.body).delegate(selector, action, function() {
                if ($(this).data(expando)) { return; }

                var inst = that.create(this, options);
                inst.handle().data(expando, 1);
                inst._actionHandler(inst.actions[action]).apply(inst, arguments);
            });
        });
    },

    /**
     * Rootrady callback
     * @virtual
     */
    onrootready: function() {},

    /**
     * Lazy fly's getter
     * @return jQuery
     */
    root: function() {

        if (!this._$root) {
            var opt = this.options;

            this._$root = $('<div/>')
                .addClass(opt.baseClass)
                .addClass(opt.extraClass)
                .addClass(opt.hideClass)
                .appendTo('body');

            this.trigger(this.events.rootready);
        }

        return this._$root;
    },

    /**
     * Handle getter
     * @return jQuery
     */
    handle: function() {
        return this._$handle;
    },

    /**
     * Initializes fly
     * @private
     * @return fly
     */
    _init: function() {
        this._action(true);
        this.bind(this.events.rootready, $.proxy(this.onrootready, this));
        this.init();
        return this;
    },

    /**
     * Cleans up fly
     */
    _destroy: function() {
        this.destroy();

        if (this._$root) {
            this._$root.remove();
            this._$root = null;
        }
        this._action(false);

        for (var i = 0, ln = fly._instances.length; i < ln; i++) {
            if (fly._instances[i] === this) {
                fly._instances.splice(i, 1);
                break;
            }
        }
    },

    /**
     * Binds action to handle
     * @private
     * @param {Boolean} mode
     */
    _action: function(mode, actions, handle) {
        handle = handle || this.handle();
        actions = actions || this.actions;

        for (var type in actions) {

            if (mode) {
                handle.bind(type + this.ens, this._actionHandler( actions[type] ));
            } else {
                handle.unbind(type + this.ens);
            }

        }
    },

    _actionHandler: function(action) {
        return typeof action === 'string' ?
            $.proxy(this[action], this) : $.proxy(action, this);
    },

    /**
     * Calculates content and run callback *
     * @private
     * @param {Function} done
     */
    _content: function(done) {
        var content = this.options.content;

        if (typeof content === 'function') {
            if (content.length) {
                content.call(this, done);
            } else {
                done( content.call(this) );
            }
        } else {
            done( content );
        }
    },

    /**
     * Fills root element with content
     *
     * @param {String} content
     */
    _render: function(content) {
        this.root()
            .html(content || '');
        this._rendered = true;
    },

    /**
     * Generates CSS classes for current position options
     */
    _modCss: function() {
        var mod = this.options.position.split(' ');
        var base = this.options.baseClass;

        return [base + '_body_' + mod[0], base + '_arrow_' + mod[1]].join(' ');
    },

    /**
     * Calculates fly's position
     * @abstract
     * @private
     */
    _position: function() {},

    /**
     * Public init, should be overwritten
     * @abstract
     */
    init: function() {},

    /**
     * Public destroy, Should be overwritten
     * @abstract
     */
    destroy: function() {},

    /**
     * Shows fly
     *
     * If you will pass a content, it will force rendering
     *
     * @param {HTMLElement|String} content
     */
    show: function(content) {
        var redraw = this.options.redrawOnShow || !this._rendered;

        if (redraw && !arguments.length) {
            return this._content( $.proxy(this.show, this) );
        }

        if (arguments.length) {
            this._render(content);
        }

        this.trigger(this.events.show);

        this.root()
            .css( this._position() )
            .addClass( this._modCss() )
            .removeClass(this.options.hideClass);

        this.theme();//rex

    },
    //rex
    theme: function () {
        //rex add theme
        switch (this.options.theme) {
            case "black":
                this.root()
                    .css({ 'background': 'rgb(0, 0, 0)', 'color': '#fff', 'border': '1px solid rgb(0, 0, 0)', '-webkit-border-radius': '5px', 'border-radius': '4px' });
                break;
            case "red":
                this.root()
                    .css({ 'background': 'rgb(197, 46, 46)', 'color': '#fff', 'border': '0px solid rgb(68, 68, 68)', '-webkit-border-radius': '5px', 'border-radius': '4px' });
                break;
            case "blue":
                this.root()
                    .css({ 'background': 'rgb(37, 83, 132)', 'color': '#fff', 'border': '0px solid rgb(68, 68, 68)', '-webkit-border-radius': '5px', 'border-radius': '4px' });
                break;
            case "yellow":
                this.root()
                    .css({ 'background': 'rgb(241, 226, 24)', 'color': 'rgb(37, 37, 37)', 'border': '0px solid rgb(68, 68, 68)', '-webkit-border-radius': '5px', 'border-radius': '4px' });
                break;
            case "green":
                this.root()
                    .css({ 'background': 'rgb(73, 119, 76)', 'color': '#fff', 'border': '0px solid rgb(68, 68, 68)', '-webkit-border-radius': '5px', 'border-radius': '4px' });
                break;
            case "pink":
                this.root()
                    .css({ 'background': 'rgb(243, 48, 128)', 'color': '#fff', 'border': '0px solid rgb(68, 68, 68)', '-webkit-border-radius': '5px', 'border-radius': '4px' });
                break;
        }
    },
    /**
     * Hides fly
     */
    hide: function() {
        if (this.hidden()) { return; }

        this.trigger(this.events.hide);

        this.root()
            .addClass(this.options.hideClass);
    },

    /**
     * Force content rendering
     * @param {function} done
     */
    redraw: function(done) {
        var that = this;

        this._content(function(content) {
            that._render(content);
            if (typeof done === 'function') {
                done(content);
            }
        });
    },

    /**
     * Toggles visibility of the fly
     * @param {Boolean} mode
     */
    toggle: function(mode) {
        mode = arguments.length ? mode : this.hidden();
        this[mode ? 'show' : 'hide']();
    },

    /**
     * Returns true if element is hidden
     * @return Boolean
     */
    hidden: function() {
        return !this._$root || this.root().hasClass(this.options.hideClass);
    }
};


/**
* Adds jquery events support
*/
$.each(['bind', 'unbind', 'one', 'trigger'], function(i, type) {
    fly._base[type] = function() {
        this._emitter[type].apply(this._emitter, arguments);
        return this;
    };
});



/**
 * Calculates dimentions of DOM element
 *
 * @mixin
 *
 * @type Object
 * @property {Number} top
 * @property {Number} left
 * @property {Number} right
 * @property {Number} bottom
 * @property {Number} width
 * @property {Number} height
 */
fly._mixin.rect = function($el) {
    var rect = $el[0].getBoundingClientRect();

    // IE
    if ( !('width' in rect) ) {
        rect = $.extend({}, rect);
        rect.width = $el.outerWidth();
        rect.height = $el.outerHeight();
    }

    return rect;
};


/**
 * Calculates fly position depending on handle
 *
 * @requires mixin.rect
 * @mixin
 * @type Object
 * @property {Number} top
 * @property {Number} left
 */
fly._mixin.position = function() {
    var css = {};

    var $w = $(window);
    var pos = this.options.position.split(' ');
    var ars = this.options.arrowSize;
    var aro = this.options.arrowOffset;

    var body = pos.shift();
    var arrow = pos.shift();

    var a = {};
    var p = this._rect( this.root() );
    var h = this._rect( this.handle() );
    var f = this.root().css('position') === 'fixed';
    var s = f ? {top: 0, left: 0} : {top: $w.scrollTop(), left: $w.scrollLeft()};

    switch (arrow) {
        case 'top':     a.top = h.height / 2 - aro; break;
        case 'left':    a.left = h.width / 2 - aro; break;
        case 'right':   a.left = h.width / 2 - p.width + aro; break;
        case 'bottom':  a.top = h.height / 2 - p.height + aro; break;
        default /*center*/:
            a.top = (h.height - p.height) / 2;
            a.left = (h.width - p.width) / 2;
            break;
    }

    switch (body) {
        case 'left':
            css.top = s.top + h.top + a.top;
            css.left = s.left + h.left - p.width - ars;
            break;
        case 'right':
            css.top = s.top + h.top + a.top;
            css.left = s.left + h.left + h.width + ars;
            break;
        case 'top':
            css.top = s.top + h.top - p.height - ars;
            css.left = s.left + h.left + a.left;
            break;
        default /*bottom*/:
            css.top = s.top + h.top + h.height + ars;
            css.left = s.left + h.left + a.left;
    }

    return css;
};


/**
 * Tooltip
 *
 * @requires fly._base
 * @requires mixin.position
 *
 * @extends fly._base
 */
fly.flytooltip = fly._base.extend({

    actions: {
        'mouseenter': 'onmouseenter',
        'mouseleave': 'onmouseleave'
    },

    /**
     * Show delay timeout reference
     * @private
     */
    _showTimeout: null,

    /**
     * Hide delay timeout reference
     * @private
     */
    _hideTimeout: null,

    /**
     * Default mouseenter action for tooltip
     */
    onmouseenter: function() {
        var that = this;

        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = null;
        }

        if (this.hidden()) {
            this._showTimeout = setTimeout(function() {
                that.show();
            }, this.options.showDelay);
        }
    },

    /**
     * Default mouseleave action for tooltip
     */
    onmouseleave: function() {
        var that = this;

        if (this._showTimeout) {
            clearTimeout(this._showTimeout);
            this._showTimeout = null;
        }

        this._hideTimeout = setTimeout(function() {
            that.hide();
        }, this.options.hideDelay);
    },

    _action: function(mode) {
        fly._base._action.apply(this, arguments);

        if (this.options.keepOnContent) {
            this._keepOnContent(mode);
        }

    },

    _keepOnContent: function(mode) {
        var that = this;
        var rrevent = this.events.rootready + '._keepOnContent';

        if (mode) {
            this.bind(rrevent, function() {
                fly._base._action.call(that, mode, that.actions, that.root());
            });
        } else {
            this.unbind(rrevent);
            fly._base._action.call(this, mode, this.actions, this.root());
        }
    },

    /**
     * Deafult settings for tooltip
     * @type Object
     */
    defaults: {
        showDelay: 300,
        hideDelay: 300
    },

    _rect: fly._mixin.rect,
    _position: fly._mixin.position
});


/**
 * Dropdown
 *
 * @requires fly._base
 * @requires mixin.position
 *
 * @extends fly._base
 */
fly.dropdown = fly._base.extend({

    actions: {
        'click': 'onclick'
    },

    /**
     * Default click action for dropdown
     */
    onclick: function() {
        this.toggle();
    },

    /**
     * Default window.onresize handler for dropdown
     */
    onresize: function() {
        if ( this.hidden() ) { return; }

        this.root().css( this._position() );
    },

    /**
     * Base _action + window resize handler
     *
     * @private
     * @param {Boolean} mode
     */
    _action: function(mode) {

        fly._base._action.apply(this, arguments);
        fly._base._action.call(this,
            mode, {'resize': 'onresize'}, $(window));

        this._autohide(mode);
    },

    /**
     * Dropdown can be closed by clicking outside or pressing ESC
     * @private
     * @param {boolean} mode
     */
    _autohide: function(mode) {
        var that = this;
        var events = 'click' + that.ens + ' keydown' + that.ens + ' touchstart' + that.ens;

        if (!mode) { return; }

        this
            .bind(this.events.show, function() { setTimeout(onshow, 0); })
            .bind(this.events.hide, function() { $(document).unbind(events); });

        function onshow() {
            $(document).bind(events, function(evt) {
                var el = evt.target, root = that.root()[0], handle = that.handle()[0];
                if (
                    evt.type === 'keydown' && evt.which === 27 ||
                    (evt.type === 'click' || evt.type === 'touchstart' ) &&
                        el !== root && !$.contains(root, el) &&
                        el !== handle && !$.contains(handle, el)
                ) {
                    that.hide();
                }
            });
        }
    },

    /**
     * Deafult settings for dropdown
     * @type Object
     */
    defaults: {},

    _rect: fly._mixin.rect,
    _position: fly._mixin.position
});


//////////////////////////////////////////////
//rex
//////////////////////////////////////////////
fly.ajax = fly._base.extend({
    actions: {
        'click': 'onclick'
    },

    /**
     * Default click action for dropdown
     */
    onclick: function() {
        this.toggle();
    },
    /**
     * Toggles visibility of the fly
     * @param {Boolean} mode
     */
    toggle: function (mode) {
        mode = arguments.length ? mode : this.hidden();
        this[mode ? 'show' : 'hide']();
    },

    /**
     * Shows fly
     *
     * If you will pass a content, it will force rendering
     *
     * @param {HTMLElement|String} content
     */
    show: function (content) {
        
        content = "<img src='data:image/gif;base64,R0lGODlhIAAgAPMAAP///wAAAMbGxoSEhLa2tpqamjc3N1dXV9jY2OTk5Ly8vB8fHwUFBQAAAAAAAAAAACH5BAkKAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAIAAgAAAE5xDISWlhperN52JLhSSdRgwVo1ICQZRUsiwHpTJT4iowNS8vyW2icCF6k8HMMBkCEDskxTBDAZwuAkkqIfxIQyhBQBFvAQSDITM5VDW6XNE4KagNh6Bgwe60smQUB3d4Rz1ZBApnFASDd0hihh12BkE9kjAJVlycXIg7CQIFA6SlnJ87paqbSKiKoqusnbMdmDC2tXQlkUhziYtyWTxIfy6BE8WJt5YJvpJivxNaGmLHT0VnOgSYf0dZXS7APdpB309RnHOG5gDqXGLDaC457D1zZ/V/nmOM82XiHRLYKhKP1oZmADdEAAAh+QQJCgAAACwAAAAAIAAgAAAE6hDISWlZpOrNp1lGNRSdRpDUolIGw5RUYhhHukqFu8DsrEyqnWThGvAmhVlteBvojpTDDBUEIFwMFBRAmBkSgOrBFZogCASwBDEY/CZSg7GSE0gSCjQBMVG023xWBhklAnoEdhQEfyNqMIcKjhRsjEdnezB+A4k8gTwJhFuiW4dokXiloUepBAp5qaKpp6+Ho7aWW54wl7obvEe0kRuoplCGepwSx2jJvqHEmGt6whJpGpfJCHmOoNHKaHx61WiSR92E4lbFoq+B6QDtuetcaBPnW6+O7wDHpIiK9SaVK5GgV543tzjgGcghAgAh+QQJCgAAACwAAAAAIAAgAAAE7hDISSkxpOrN5zFHNWRdhSiVoVLHspRUMoyUakyEe8PTPCATW9A14E0UvuAKMNAZKYUZCiBMuBakSQKG8G2FzUWox2AUtAQFcBKlVQoLgQReZhQlCIJesQXI5B0CBnUMOxMCenoCfTCEWBsJColTMANldx15BGs8B5wlCZ9Po6OJkwmRpnqkqnuSrayqfKmqpLajoiW5HJq7FL1Gr2mMMcKUMIiJgIemy7xZtJsTmsM4xHiKv5KMCXqfyUCJEonXPN2rAOIAmsfB3uPoAK++G+w48edZPK+M6hLJpQg484enXIdQFSS1u6UhksENEQAAIfkECQoAAAAsAAAAACAAIAAABOcQyEmpGKLqzWcZRVUQnZYg1aBSh2GUVEIQ2aQOE+G+cD4ntpWkZQj1JIiZIogDFFyHI0UxQwFugMSOFIPJftfVAEoZLBbcLEFhlQiqGp1Vd140AUklUN3eCA51C1EWMzMCezCBBmkxVIVHBWd3HHl9JQOIJSdSnJ0TDKChCwUJjoWMPaGqDKannasMo6WnM562R5YluZRwur0wpgqZE7NKUm+FNRPIhjBJxKZteWuIBMN4zRMIVIhffcgojwCF117i4nlLnY5ztRLsnOk+aV+oJY7V7m76PdkS4trKcdg0Zc0tTcKkRAAAIfkECQoAAAAsAAAAACAAIAAABO4QyEkpKqjqzScpRaVkXZWQEximw1BSCUEIlDohrft6cpKCk5xid5MNJTaAIkekKGQkWyKHkvhKsR7ARmitkAYDYRIbUQRQjWBwJRzChi9CRlBcY1UN4g0/VNB0AlcvcAYHRyZPdEQFYV8ccwR5HWxEJ02YmRMLnJ1xCYp0Y5idpQuhopmmC2KgojKasUQDk5BNAwwMOh2RtRq5uQuPZKGIJQIGwAwGf6I0JXMpC8C7kXWDBINFMxS4DKMAWVWAGYsAdNqW5uaRxkSKJOZKaU3tPOBZ4DuK2LATgJhkPJMgTwKCdFjyPHEnKxFCDhEAACH5BAkKAAAALAAAAAAgACAAAATzEMhJaVKp6s2nIkolIJ2WkBShpkVRWqqQrhLSEu9MZJKK9y1ZrqYK9WiClmvoUaF8gIQSNeF1Er4MNFn4SRSDARWroAIETg1iVwuHjYB1kYc1mwruwXKC9gmsJXliGxc+XiUCby9ydh1sOSdMkpMTBpaXBzsfhoc5l58Gm5yToAaZhaOUqjkDgCWNHAULCwOLaTmzswadEqggQwgHuQsHIoZCHQMMQgQGubVEcxOPFAcMDAYUA85eWARmfSRQCdcMe0zeP1AAygwLlJtPNAAL19DARdPzBOWSm1brJBi45soRAWQAAkrQIykShQ9wVhHCwCQCACH5BAkKAAAALAAAAAAgACAAAATrEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiRMDjI0Fd30/iI2UA5GSS5UDj2l6NoqgOgN4gksEBgYFf0FDqKgHnyZ9OX8HrgYHdHpcHQULXAS2qKpENRg7eAMLC7kTBaixUYFkKAzWAAnLC7FLVxLWDBLKCwaKTULgEwbLA4hJtOkSBNqITT3xEgfLpBtzE/jiuL04RGEBgwWhShRgQExHBAAh+QQJCgAAACwAAAAAIAAgAAAE7xDISWlSqerNpyJKhWRdlSAVoVLCWk6JKlAqAavhO9UkUHsqlE6CwO1cRdCQ8iEIfzFVTzLdRAmZX3I2SfZiCqGk5dTESJeaOAlClzsJsqwiJwiqnFrb2nS9kmIcgEsjQydLiIlHehhpejaIjzh9eomSjZR+ipslWIRLAgMDOR2DOqKogTB9pCUJBagDBXR6XB0EBkIIsaRsGGMMAxoDBgYHTKJiUYEGDAzHC9EACcUGkIgFzgwZ0QsSBcXHiQvOwgDdEwfFs0sDzt4S6BK4xYjkDOzn0unFeBzOBijIm1Dgmg5YFQwsCMjp1oJ8LyIAACH5BAkKAAAALAAAAAAgACAAAATwEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiUd6GGl6NoiPOH16iZKNlH6KmyWFOggHhEEvAwwMA0N9GBsEC6amhnVcEwavDAazGwIDaH1ipaYLBUTCGgQDA8NdHz0FpqgTBwsLqAbWAAnIA4FWKdMLGdYGEgraigbT0OITBcg5QwPT4xLrROZL6AuQAPUS7bxLpoWidY0JtxLHKhwwMJBTHgPKdEQAACH5BAkKAAAALAAAAAAgACAAAATrEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiUd6GAULDJCRiXo1CpGXDJOUjY+Yip9DhToJA4RBLwMLCwVDfRgbBAaqqoZ1XBMHswsHtxtFaH1iqaoGNgAIxRpbFAgfPQSqpbgGBqUD1wBXeCYp1AYZ19JJOYgH1KwA4UBvQwXUBxPqVD9L3sbp2BNk2xvvFPJd+MFCN6HAAIKgNggY0KtEBAAh+QQJCgAAACwAAAAAIAAgAAAE6BDISWlSqerNpyJKhWRdlSAVoVLCWk6JKlAqAavhO9UkUHsqlE6CwO1cRdCQ8iEIfzFVTzLdRAmZX3I2SfYIDMaAFdTESJeaEDAIMxYFqrOUaNW4E4ObYcCXaiBVEgULe0NJaxxtYksjh2NLkZISgDgJhHthkpU4mW6blRiYmZOlh4JWkDqILwUGBnE6TYEbCgevr0N1gH4At7gHiRpFaLNrrq8HNgAJA70AWxQIH1+vsYMDAzZQPC9VCNkDWUhGkuE5PxJNwiUK4UfLzOlD4WvzAHaoG9nxPi5d+jYUqfAhhykOFwJWiAAAIfkECQoAAAAsAAAAACAAIAAABPAQyElpUqnqzaciSoVkXVUMFaFSwlpOCcMYlErAavhOMnNLNo8KsZsMZItJEIDIFSkLGQoQTNhIsFehRww2CQLKF0tYGKYSg+ygsZIuNqJksKgbfgIGepNo2cIUB3V1B3IvNiBYNQaDSTtfhhx0CwVPI0UJe0+bm4g5VgcGoqOcnjmjqDSdnhgEoamcsZuXO1aWQy8KAwOAuTYYGwi7w5h+Kr0SJ8MFihpNbx+4Erq7BYBuzsdiH1jCAzoSfl0rVirNbRXlBBlLX+BP0XJLAPGzTkAuAOqb0WT5AH7OcdCm5B8TgRwSRKIHQtaLCwg1RAAAOw=='/>";
        this._render(content);


        this.trigger(this.events.show);

        this.root()
            .css(this._position())
            .addClass(this._modCss())
            .removeClass(this.options.hideClass);

        this.theme();//rex

        //rex
        var self = this;
        setTimeout(function () {
            self.root()
                .css(self._position())
                .addClass(self._modCss())
                .removeClass(self.options.hideClass).load(self.options.url, function () {
                    self.root()
                        .css(self._position())
                        .addClass(self._modCss())
                        .removeClass(self.options.hideClass);
                });
        }, 500);

    },

    /**
     * Default window.onresize handler for dropdown
     */
    onresize: function () {
        if (this.hidden()) { return; }

        this.root().css(this._position());
    },

    /**
     * Base _action + window resize handler
     *
     * @private
     * @param {Boolean} mode
     */
    _action: function (mode) {

        fly._base._action.apply(this, arguments);
        fly._base._action.call(this,
            mode, { 'resize': 'onresize' }, $(window));

        this._autohide(mode);
    },
    /**
     * Dropdown can be closed by clicking outside or pressing ESC
     * @private
     * @param {boolean} mode
     */
    _autohide: function (mode) {
        var that = this;
        var events = 'click' + that.ens + ' keydown' + that.ens + ' touchstart' + that.ens;

        if (!mode) { return; }

        this
            .bind(this.events.show, function () { setTimeout(onshow, 0); })
            .bind(this.events.hide, function () { $(document).unbind(events); });

        function onshow() {
            $(document).bind(events, function (evt) {
                var el = evt.target, root = that.root()[0], handle = that.handle()[0];
                if (
                    evt.type === 'keydown' && evt.which === 27 ||
                    (evt.type === 'click' || evt.type === 'touchstart') &&
                        el !== root && !$.contains(root, el) &&
                        el !== handle && !$.contains(handle, el)
                ) {
                    that.hide();
                }
            });
        }
    },
    /**
     * Deafult settings for dropdown
     * @type Object
     */
    defaults: {},
    _rect: fly._mixin.rect,
    _position: fly._mixin.position
});
fly.ajaxHover = fly._base.extend({
    actions: {
        'mouseenter': 'onmouseenter',
        'mouseleave': 'onmouseleave'
    },
    /**
     * Default mouseenter action for tooltip
     */
    onmouseenter: function () {
        this.toggle();
    },

    /**
     * Default mouseleave action for tooltip
     */
    onmouseleave: function () {
        var that = this;

        if (this._showTimeout) {
            clearTimeout(this._showTimeout);
            this._showTimeout = null;
        }

        this._hideTimeout = setTimeout(function () {
            that.hide();
        }, this.options.hideDelay);
    },
    /**
     * Toggles visibility of the fly
     * @param {Boolean} mode
     */
    toggle: function (mode) {
        mode = arguments.length ? mode : this.hidden();
        this[mode ? 'show' : 'hide']();
    },

    /**
     * Shows fly
     *
     * If you will pass a content, it will force rendering
     *
     * @param {HTMLElement|String} content
     */
    show: function (content) {

        content = "<img src='data:image/gif;base64,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'/>";
        this._render(content);


        this.trigger(this.events.show);

        this.root()
            .css(this._position())
            .addClass(this._modCss())
            .removeClass(this.options.hideClass);

        this.theme();//rex

        //rex
        var self = this;
        setTimeout(function () {
            self.root()
                .css(self._position())
                .addClass(self._modCss())
                .removeClass(self.options.hideClass).load(self.options.url, function () {
                    self.root()
                        .css(self._position())
                        .addClass(self._modCss())
                        .removeClass(self.options.hideClass);
                });
        }, 200);

    },

    /**
     * Default window.onresize handler for dropdown
     */
    onresize: function () {
        if (this.hidden()) { return; }

        this.root().css(this._position());
    },

    /**
     * Base _action + window resize handler
     *
     * @private
     * @param {Boolean} mode
     */
    _action: function (mode) {

        fly._base._action.apply(this, arguments);
        fly._base._action.call(this,
            mode, { 'resize': 'onresize' }, $(window));

        this._autohide(mode);
    },
    /**
     * Dropdown can be closed by clicking outside or pressing ESC
     * @private
     * @param {boolean} mode
     */
    _autohide: function (mode) {
        var that = this;
        var events = 'click' + that.ens + ' keydown' + that.ens + ' touchstart' + that.ens;

        if (!mode) { return; }

        this
            .bind(this.events.show, function () { setTimeout(onshow, 0); })
            .bind(this.events.hide, function () { $(document).unbind(events); });

        function onshow() {
            $(document).bind(events, function (evt) {
                var el = evt.target, root = that.root()[0], handle = that.handle()[0];
                if (
                    evt.type === 'keydown' && evt.which === 27 ||
                    (evt.type === 'click' || evt.type === 'touchstart') &&
                        el !== root && !$.contains(root, el) &&
                        el !== handle && !$.contains(handle, el)
                ) {
                    that.hide();
                }
            });
        }
    },
    /**
     * Deafult settings for dropdown
     * @type Object
     */
    defaults: {},
    _rect: fly._mixin.rect,
    _position: fly._mixin.position
});


/**
 * Hide all fly instances
 */
fly.hideAll = function () {
    for (var i = 0, ln = fly._instances.length; i < ln; i++) {
        fly._instances[i].hide();
    }
};


/**
 * jQuery extension for dropdown
 *
 * @requires _base.js
 */

/**
 * Registers fly component, as jquery plugin
 * @static
 * @param {String} name
 * @param {Fly} component
 */
fly.register$ = function(type, component) {
    if ( component === fly._base || !(component instanceof fly._base._ctor) || $.fn[type] ) {
        return;
    }

    var expando = 'fly_' + type + '_' + (+new Date());

    $.fn[ type ] = function(options) {

        var retVal;

        this.each(function(i) {
            if (retVal) { return false; }

            var $el = $(this);
            var old = $el.data(expando);

            switch (options) {

                case 'instance': retVal = old; break;
                case 'destroy': destroy(old); break;
                default:
                    destroy(old);
                    $el.data(expando, component.create($el, options));
            }
        });

        return retVal || this;

        function destroy(component) {
            if (component) {
                component.handle().removeData(expando);
                component._destroy();
            }
        }
    };
};

$.each(fly, fly.register$);
   return fly;
});


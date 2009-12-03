var Simulate = function(el, type, options) {
	this.target = $(el);
	this.options = options;

	if (/^drag$/.test(type)) {
		this[type].apply(this, [this.target, options]);
	} else {
		this.simulateEvent(el, type, options);
	}
};

Object.extend(Simulate.prototype, {
	simulateEvent: function(el, type, options) {
		var evt = this.createEvent(type, options);
		this.dispatchEvent(el, type, evt, options);
		return evt;
	},
	createEvent: function(type, options) {
		if (/^mouse(over|out|down|up|move)|(dbl)?click$/.test(type)) {
			return this.mouseEvent(type, options);
		} else if (/^key(up|down|press)$/.test(type)) {
			return this.keyboardEvent(type, options);
		}
	},
	mouseEvent: function(type, options) {
		var evt;
		var e = Object.extend({
			bubbles: true, cancelable: (type != "mousemove"), view: window, detail: 0,
			screenX: 0, screenY: 0, clientX: 0, clientY: 0,
			ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
			button: 0, relatedTarget: undefined
		}, options);

		var relatedTarget = $(window);//FIXME: ?

		if (Object.isFunction(document.createEvent)) {
			evt = document.createEvent("MouseEvents");
			evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail,
				e.screenX, e.screenY, e.clientX, e.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				e.button, e.relatedTarget || document.body.parentNode);
		} else if (document.createEventObject) {
			evt = document.createEventObject();
			Object.extend(evt, e);
			evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
		}
		return evt;
	},
	keyboardEvent: function(type, options) {
		var evt;

		var e = Object.extend({ bubbles: true, cancelable: true, view: window,
			ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
			keyCode: 0, charCode: 0
		}, options);

		if (Object.isFunction(document.createEvent)) {
			try {
				evt = document.createEvent("KeyEvents");
				evt.initKeyEvent(type, e.bubbles, e.cancelable, e.view,
					e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
					e.keyCode, e.charCode);
			} catch(err) {
				evt = document.createEvent("Events");
				evt.initEvent(type, e.bubbles, e.cancelable);
				Object.extend(evt, { view: e.view,
					ctrlKey: e.ctrlKey, altKey: e.altKey, shiftKey: e.shiftKey, metaKey: e.metaKey,
					keyCode: e.keyCode, charCode: e.charCode
				});
			}
		} else if (document.createEventObject) {
			evt = document.createEventObject();
			Object.extend(evt, e);
		}
		if (Prototype.Browser.IE || Prototype.Browser.Opera) {
			evt.keyCode = (e.charCode > 0) ? e.charCode : e.keyCode;
			evt.charCode = undefined;
		}
		return evt;
	},

	dispatchEvent: function(el, type, evt) {
		if (el.dispatchEvent) {
			el.dispatchEvent(evt);
		} else if (el.fireEvent) {
			el.fireEvent('on' + type, evt);
		}
		return evt;
	},

	drag: function(el) {
		var self = this, center = this.findCenter(this.target),
			options = this.options,	x = Math.floor(center.x), y = Math.floor(center.y),
			dx = options.dx || 0, dy = options.dy || 0, target = this.target;
		var coord = { clientX: x, clientY: y };
		this.simulateEvent(target, "mousedown", coord);
		coord = { clientX: x + 1, clientY: y + 1 };
		this.simulateEvent(document, "mousemove", coord);
		coord = { clientX: (x + dx), clientY: (y + dy) };
		this.simulateEvent(document, "mousemove", coord);
		this.simulateEvent(document, "mousemove", coord);
		this.simulateEvent(target, "mouseup", coord);
		if (Object.isFunction(options.onComplete)) {
			options.onComplete(target);
		};
	},
	findCenter: function(el) {
		var el = $(this.target), o = el.cumulativeOffset();
		return {
			x: o.left + el.outerWidth() / 2,
			y: o.top + el.outerHeight() / 2
		};
	}
});


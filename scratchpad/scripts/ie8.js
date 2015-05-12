/*if (!window.Element.prototype.addEventListener) {
	window.Element.prototype.addEventListener = function (type,listener) {
		var elm = this;
		if (!this.listeners) {
			this.listeners = {};
		}
		if (!this.listeners[type]) {
			this.listeners[type] = [listener]
			this.attachEvent("on"+type,function () {
				event.currentTarget = elm;
				event.target = event.srcElement;
				event["type"] = type;
				elm.triggerListeners(type,event);
			})
		} else {
			this.listeners[type].push(listener)
		}
	}
	window.Element.prototype.removeEventListener = function (type,listener) {
		var listeners = this.listeners[type];
		if (listeners) {
			for (var i=0;i<listeners.length;i++) {
				if (listeners[i]==listener) {
					this.listeners.splice(i,1);
					return true;
				}
			}
		}
		return false;
	}
	window.Element.prototype.triggerListeners = function (type,event) {
		var listeners = this.listeners[type];
		if (listeners) {
			for (var i=0;i<listeners.length;i++) {
				if (typeof listeners[i] == "function") {
					listeners[i].call(this,event)
				} else {
					listeners[i].handleEvent(event)
				}
			}
		}
	}
}

Object.defineProperty(document.body, "description", {
    get : function () {
        return this.desc;
    },
    set : function (val) {
        this.desc = val;
    }
});*/
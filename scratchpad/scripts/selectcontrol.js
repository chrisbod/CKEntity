function DeselectEnabler() {

}
DeselectEnabler.getInstance = function () {
	if (!this.instance) {
		this.instance = new this()
	} 
	return this.instance;
}

DeselectEnabler.prototype = {
	watchSelect: function (element) {
		element.addEventListener("focus",this,true);
		element.addEventListener("blur",this,true);
		element.addEventListener("click",this,true);
		element.addEventListener("change",this,true)
	},
	handleEvent: function (event) {
		this[event.type+"Handler"](event)
	},
	focusHandler: function (event) {
		this.currentSelect = event.target;
		this.selectedOptions = []
		for (var i=0;i<event.target.options.length;i++) {
			if (event.target.options[i].selected) {
				event.target.options[i].className = "checked"
				this.selectedOptions[i] = event.target.options[i];
			} else {
				event.target.options[i].className = ""
			}
		}

	},
	changeHandler: function (event) {
		this.changed = true
		for (var i=0;i<event.target.options.length;i++) {
			if (event.target.options[i].selected) {
				event.target.options[i].className = "checked"
				this.selectedOptions[i] = event.target.options[i];
			} else {
				delete this.selectedOptions[i]
			}
		}
	},
	blurHandler: function (event) {
		this.currentSelect = null;
		this.selectedOptions = null;
		this.changed = false;
	},
	clickHandler: function (event) {
		if (this.changed == false && this.selectedOptions && this.selectedOptions[event.target.index]) {
			this.selectedOptions[event.target.index].selected = false;
			this.selectedOptions[event.target.index].className = "";
		}
		this.changed = false;
	}

}
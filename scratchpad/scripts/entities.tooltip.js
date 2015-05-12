/*

function EntityToolTip() {
	
	
}

(function (extend) {
	var proto = EntityToolTip.prototype = new PositionableContainer();
	for (var i in extend) {
		proto[i] = extend[i];
	}
})({
	className: "entity-tooltip",
	attachEvents: function () {
		this.element.addEventListener("click", this);
		this.element.addEventListener("mouseenter", this);
		this.element.addEventListener("mouseleave", this);
	},
	clickHandler: function () {
		console.log("click")
	},
	mouseenterHandler: function () {
		this.intent && this.intent.cancel();
	},
	mouseleaveHandler: function () {
		this.intent && this.intent.cancel();
		this.intent = new Intent()
		this.intent.request(this.hide.bind(this))
	},
	update: function (token) {
		var content = document.createElement("p")
		content.innerText = "Click to Edit"
		this.setContent(content);
	}


})*/

function EntityTooltip() {
	this.entitiesHelper = new EntitiesHelper();
	this.intent = new Intent(1000);
}
EntityTooltip.prototype = {
	bindingsApplied: false,
	init: function (editableElement,tooltipElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("mouseover", this);
		this.tooltipElement = tooltipElement;
		this.tooltipElement.addEventListener("mouseleave", this)
		this.tooltipElement.addEventListener("mouseenter", this)
		this.knockoutViewModel = new TokenTooltipViewModel(tooltipElement);
		ko.applyBindings(this.knockoutViewModel,tooltipElement)
	},
	handleEvent: function (event) {
		return this[event.type+'Handler'](event)
	},
	mouseoverHandler: function (event) {
		var over = event.toElement;
		if (over!=this.editableElement) {
			over = this.entitiesHelper.getEntityElement(event.toElement,event);
			if (over) {
				if (this.currentlyOver != over) {
					this.intent.request(this.activateTooltip.bind(this,over,event))
					this.currentlyOver = over;
					
					
				} 
			} 
		} else {
			this.currentlyOver = null;
			this.intent.request(this.deactivateTooltip.bind(this))
		}
	},
	mouseleaveHandler: function (event) {
		this.currentlyOver = null;
		this.intent.request(this.deactivateTooltip.bind(this))
	},
	mouseenterHandler: function (event) {
		this.intent.cancel()
	},
	activateTooltip: function (entity,event) {
		this.intent.request(this.deactivateTooltip.bind(this),4000)
		this.knockoutViewModel.updateFromElement(entity);
		var bounding = entity.getBoundingClientRect();
		this.tooltipElement.style.left = bounding.left+"px";
		this.tooltipElement.style.top = bounding.bottom+"px";

	},
	deactivateTooltip: function () {
		this.currentlyOver = null;
		this.tooltipElement.style.left = "";
	}
}
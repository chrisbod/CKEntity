function EntityTooltip() {
	this.entitiesHelper = new EntitiesHelper();
	//this.intent = new Intent(500);
}
EntityTooltip.getInstance = function () {
	if (!this.instance) {
		return this.instance = new this();
	} else {
		return this.instance
	}
}
EntityTooltip.prototype = {
	bindingsApplied: false,
	init: function (editableElement,tooltipElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("click", this);
		this.editableElement.addEventListener("keydown", this);
		this.editableDocument = this.editableElement.ownerDocument;
		this.tooltipElement = tooltipElement;
		//this.tooltipElement.addEventListener("mouseleave", this)
		//this.tooltipElement.addEventListener("mouseenter", this)
	},
	bind: function () {
		if (!this.knockoutViewModel) {
			this.knockoutViewModel = new TokenTooltipViewModel(this.tooltipElement);
			ko.applyBindings(this.knockoutViewModel,this.tooltipElement)
		}
	},
	handleEvent: function (event) {
		return this[event.type+'Handler'](event)
	},
	clickHandler: function (event) {
		var target = event.target;
		if (target!=this.editableElement) {
			target = this.entitiesHelper.getEntityElement(event.target,event);
			if (target) {

				//if (this.currentlyOver != target) {
					this.activateTooltip(target,event);
				//}
			} else {
				this.deactivateTooltip(this)
			}
		} else {
			this.deactivateTooltip(this)
		}
	},
	keydownHandler: function () {
		this.deactivateTooltip();
	},
	activateTooltip: function (entity,event) {
		this.bind();
		this.currentlyOver = entity;
		this.knockoutViewModel.updateFromElement(entity);
		var bounding = entity.getBoundingClientRect();
		var boundings = entity.getClientRects();
		var tooltipRect = this.tooltipElement.getBoundingClientRect()
		var viewWidth = window.innerWidth;
		var frameBounding = entity.ownerDocument.defaultView.frameElement.getBoundingClientRect();
		var left = frameBounding.left+boundings[0].left;
		if (left+tooltipRect.width > viewWidth) {
			left = viewWidth-tooltipRect.width
		}

		this.tooltipElement.style.left = left+"px";
		this.tooltipElement.style.top = (frameBounding.top+bounding.bottom)+"px";
		
		
		
		this.knockoutViewModel.active(true)

	},
	deactivateTooltip: function () {
		this.currentlyOver = null;
		
		if (this.knockoutViewModel) {
			this.knockoutViewModel.active(false);
		}

	}
}
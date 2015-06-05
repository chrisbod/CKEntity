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
		this.editableElement.addEventListener("drag")
		this.editableDocument = this.editableElement.ownerDocument;
		this.tooltipElement = tooltipElement;
		window.addEventListener("resize", this)
		this.editableDocument.addEventListener("scroll",this)
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
	resizeHandler: function () {
		if (this.currentlyOver) {
			try {
			this.positionTooltip(this.currentlyOver);
			} catch (e) {
				this.currentlyOver = null;
			}
		}
	},
	scrollHandler: function () {
		if (this.currentlyOver) {
			try {
			this.positionTooltip(this.currentlyOver);
			} catch (e) {
				this.currentlyOver = null;
			}
		}

	},
	dragHandler: function () {
		this.deactivateTooltip(this)
	},
	clickHandler: function (event) {
		var target = event.target;
		if (target!=this.editableElement) {
			target = this.entitiesHelper.getEntityElement(event.target,event);
			if (target && !target.hasAttribute("data-read-only")) {
				//if (this.currentlyOver != target) {
					this.activateTooltip(target,event);
					event.stopPropagation()
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
	positionTooltip: function (entityElement) {
		var tooltip = this.tooltipElement,
			entityBoundingBox = entityElement.getBoundingClientRect(),
			entityIndentPosition = entityElement.getClientRects()[0],
			tooltipRect = tooltip.getBoundingClientRect(),
			viewWidth = window.innerWidth,
			viewHeight = window.innerHeight,
			frameBounding = entityElement.ownerDocument.defaultView.frameElement.getBoundingClientRect(),
			leftPosition = frameBounding.left+entityIndentPosition.left,
			topPosition = frameBounding.top+entityBoundingBox.bottom;
		if (leftPosition+tooltipRect.width > viewWidth) {
			leftPosition = viewWidth-tooltipRect.width;
		}
		if (topPosition+tooltipRect.height>viewHeight) {
			topPosition = (frameBounding.top + entityBoundingBox.top) - tooltipRect.height
		}
		if (topPosition<frameBounding.top) {
			this.tooltipElement.style.left = "";
			this.tooltipElement.style.top = "";
		} else {
			this.tooltipElement.style.left = leftPosition+"px";
			this.tooltipElement.style.top = topPosition+"px";
		}

	},
	activateTooltip: function (entity,event) {
		this.bind();
		this.currentlyOver = entity;
		this.knockoutViewModel.active(true)
		this.knockoutViewModel.updateFromElement(entity);

		this.positionTooltip(entity)
		
		

	},
	deactivateTooltip: function () {
		this.currentlyOver = null;
		if (this.knockoutViewModel) {
			this.knockoutViewModel.active(false);
		}

	}
}
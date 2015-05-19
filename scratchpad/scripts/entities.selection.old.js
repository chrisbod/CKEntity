function EntitySelectionManager() {
	this.entitiesHelper = new EntitiesHelper();
}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement
		this.document = editableElement.ownerDocument;
		this.editableElement.addEventListener("keyup",this,true);
		this.editableElement.addEventListener("mouseup",this,true);
		this.editableElement.addEventListener("click",this,true);
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event)
	},
	keyupHandler: function (event) {
		if (event.details.selection.element.hasAttribute("data-entity-node")) {
			event.details.selection.currentEntityWrapper = event.details.selection.element;
			this.selectEntityFromEventSelection(event.details.selection)
		}
		
	},
	clickHandler: function (event) {
		var entityNode = this.entitiesHelper.getEntityElement(event.target);
		if (entityNode) {
			this.selectEntity(entityNode);
			event.preventDefault();
			event.stopPropagation()
		}


	},
	mouseupHandler: function (event) {
		var eventSelection = event.details.selection;
		if (eventSelection.currentEntity && !eventSelection.currentEntity.classList.contains("user")) {
			//this.selectEntityFromEventSelection(eventSelection)
		}
	},
	selectEntity: function (entity) {
		var wrapper = entity.parentNode
			selection = document.getSelection(),
			range = document.createRange();
		selection.removeAllRanges();
		range.setStartBefore(wrapper);
		range.setEndAfter(wrapper)
		selection.addRange(range);
		console.log(""+range)
	
	},
	selectEntityFromEventSelection: function (eventSelection) {
		var wrapper = eventSelection.currentEntityWrapper,
			selection = eventSelection.selection,
			range = eventSelection.range;
		selection.removeAllRanges();
		range.setStartBefore(wrapper);
		range.setEndBefore(wrapper)
		selection.addRange(range);
		range.setEndAfter(wrapper);
		selection.addRange(range);
	}
}
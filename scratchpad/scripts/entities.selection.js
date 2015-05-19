function EntitySelectionManager() {

}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement
		this.document = editableElement.ownerDocument;
		this.editableElement.addEventListener("keyup",this,true);
		this.editableElement.addEventListener("mouseup",this,true)
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
	mouseupHandler: function (event) {
		var eventSelection = event.details.selection;
		if (eventSelection.currentEntity && !eventSelection.currentEntity.classList.contains("user")) {
			this.selectEntityFromEventSelection(eventSelection)
		}
	},
	selectEntityFromEventSelection: function (eventSelection) {
		var wrapper = eventSelection.currentEntityWrapper,
			selection = eventSelection.selection,
			range = eventSelection.range;
		selection.removeAllRanges();
		range.setStartBefore(wrapper);
		range.setEndBefore(wrapper)
		selection.addRange(range);
		range.setEndAfter(wrapper)
		selection.addRange(range)
	}
}
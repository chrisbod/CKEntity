function EntitySelectionManager() {
	this.entities = new EntitiesHelper();
	this.collapser = ConditionalCollapser.getInstance();
}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableDocument = editableElement.ownerDocument;
		
		//this.editableElement.addEventListener("click", this, true);
		//this.editableElement.addEventListener("dblclick", this);
		//document.addEventListener("paste", this, true);

		//this.editableElement.addEventListener("contextmenu", this, true)
		//this.editableDocument.addEventListener("mouseup",this)
		//this.editableDocument.addEventListener("keyup", this,true)
		//this.editableDocument.addEventListener("keydown", this, true)
		//this.editableDocument.addEventListener("dragstart", this)
		function blockEditorDisappear(event) {
			var causeElement = event.relatedTarget;

			if (causeElement && causeElement.classList.contains("contents")) {
				event.stopPropagation()
			}
			
			
			
		}
		//window.addEventListener("blur", blockEditorDisappear,true)
		//window.addEventListener("focusout", blockEditorDisappear,true)
		//window.addEventListener("DOMFocusOut", blockEditorDisappear,true)

	},
	handleEvent: function(event) {
		return this[event.type+'Handler'](event)
	},
	dragstartHandler: function (event) {
		var entityNode = this.entities.getEntityElement(event.target);
		if (entityNode && !entityNode.classList.contains("user")) {
			event.dataTransfer.effectAllowed = "copy";
			event.preventDefault()
		}
	},
	selectionHandler: function (event) {
		
	},
	contextmenuHandler: function (event){
		
	},
	keyupHandler: function (event) {
		switch (event.keyCode) {
			case 37: return this.leftArrowUp(event);
			case 39: return this.rightArrowUp(event);
		}
		
		
	},
	keydownHandler: function (event) {
		switch (event.keyCode) {
			case 8: {
				return this.handleDelete(event);
			}
			case 37: return this.leftArrowDown(event);
			case 39: return this.rightArrowDown(event);
		}

	},
	leftArrowDown: function (event) {
		event.stopPropagation()
	},
	rightArrowDown: function (event) {
		
		event.stopPropagation()
	},
	leftArrowUp: function (event) {
		
		event.stopPropagation()
	},
	rightArrowUp: function (event) {
		
	},
	simpleSelect: function (selection,node) {
		selection.removeAllRanges();
		var range = this.editableDocument.createRange();
		range.selectNode(node);
		selection.addRange(range);
					
	},
	
	mouseupHandler: function (event) {
		
			},
	checkSelectionAndCursor: function (selection,event) {
		
	},
	
	pasteHandler: function () {
		
	},
	handleDelete: function (event) {
		
	},
	
	removeCurrentEntityIfAllowed: function () {
		
	},
	clickHandler: function (event) {
		
		
	},
	dblclickHandler: function (event) {
		
	},
	getCleanSelection: function () {
		var selection = this.editableDocument.getSelection();
		selection.collapse(true)
		selection.removeAllRanges();
		return selection
	}
}
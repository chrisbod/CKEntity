function EntitySelectionManager() {
	this.entities = new EntitiesHelper();
	this.collapser = ConditionalCollapser.getInstance();
}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableDocument = editableElement.ownerDocument;
		
		this.editableElement.addEventListener("click", this, true);
		this.editableElement.addEventListener("dblclick", this);
		//document.addEventListener("paste", this, true);

		//this.editableElement.addEventListener("contextmenu", this, true)
		//this.editableDocument.addEventListener("mouseup",this)
		this.editableDocument.addEventListener("keyup", this,true)
		this.editableDocument.addEventListener("keydown", this, true)
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
		
	},
	getNextImmediateEntityWrapperNode: function () {
		var selection = this.editableDocument.getSelection();
		var anchorNode = selection.anchorNode;
		if (anchorNode.nodeType!=3) {
			//console.log(selection.anchorOffset)
		}
		
		var next = anchorNode.nextSibling;
		if (next && next.hasAttribute && next.hasAttribute("data-cursor")) {
			next = next.nextSibling;
		}
		return next;
	},
	rightArrowDown: function (event) {
		
		
	},
	leftArrowUp: function (event) {
		var selection  = this.editableDocument.getSelection();
		this.selectedEntityNode = null;
		if (selection.baseNode.nodeType == 3) {
			if (selection.baseOffset != 0) {
				var entity = this.entities.getEntityElement(selection.baseNode)
				if (entity) {
					this.selectEntityNode(entity);
				}
			}
			
		}
	},
	rightArrowUp: function (event) {
		this.selectedEntityNode = null;
		var selection  = this.editableDocument.getSelection();
		if (selection.baseNode.nodeType == 3) {
			if (selection.baseOffset != selection.baseNode.data.length) {
				var entity = this.entities.getEntityElement(selection.baseNode)
				if (entity) {
					this.selectEntityNode(entity);
					return;
				}
			}
			
		}
	},
	selectEntityNode: function (entityNode) {
		delete this.cursorAfterEntity;
		delete this.cursorBeforeEntity;


		var selection = this.editableDocument.getSelection();
		var range = document.createRange()
		range.selectNode(entityNode)
		selection.removeAllRanges();
		selection.addRange(range);
		this.selectedEntityNode = entityNode;
	},
	setCursorBeforeEntityWrapper: function (wrapperNode) {
		delete this.cursorAfterEntity;
		var selection = this.editableDocument.getSelection();
		selection.removeAllRanges()
		var range = this.editableDocument.createRange();
		range.setStartBefore(wrapperNode)
		range.setEndBefore(wrapperNode)
		
		selection.addRange(range)
		this.selectedEntityWrapper = null;
	},
	setCursorAfterEntityWrapper: function (wrapperNode) {
		var selection = this.editableDocument.getSelection();
		var range = this.editableDocument.createRange();
		range.setStartAfter(wrapperNode)
		range.setEndAfter(wrapperNode)
		selection.removeAllRanges()
		selection.addRange(range)
		this.selectedEntityWrapper = null;
		this.cursorAfterEntity = wrapperNode;
	},
	
	mouseupHandler: function (event) {
		
			},
	checkSelectionAndCursor: function (selection,event) {
		
	},
	
	pasteHandler: function () {
		
	},
	handleDelete: function (event) {
		var node = this.selectedEntityNode
		if (node) {
			if (!this.entities.isDeletable(node)) {
				event.preventDefault()
				event.stopPropagation()
			}
		} else {
			var selection  = this.editableDocument.getSelection();
			var node = this.entities.getEntityElement(selection.baseNode)
			if (node && this.entities.isDeletable(node)) {
				this.selectEntityNode(node)
			} else {
				event.preventDefault()
			}

		}
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
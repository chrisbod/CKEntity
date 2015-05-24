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
		//var previous = this.getPreviousElement()
		var selection = this.editableDocument.getSelection();
		var anchorNode = selection.anchorNode;
		var previous = anchorNode.previousSibling;
		if (previous && previous.hasAttribute && previous.hasAttribute("data-cursor")) {
			previous = previous.previousSibling;
		}
		if (this.entities.isEntityElement(previous)) {
			this.elementToSelect = previous;
			event.stopPropagation()
		}
	},
	getNextImmediateEntityNode: function () {
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
		if (!this.selectedEntityNode) {

			var selection = this.editableDocument.getSelection();
			var baseNode = selection.baseNode
			if (baseNode) {
				if (baseNode.nodeType!=3 && selection.baseOffset == 0) {
					//at start of node;
					baseNode = baseNode.firstChild;
				}
				var next = baseNode.nextSibling;
				if (next && next.hasAttribute && next.hasAttribute("data-cursor")) {
					next = next.nextSibling;
				}
				if (this.entities.isEntityElement(next)) {
					this.beforeEntity = selection.getRangeAt(0);
				}
			}
		} else {
			
			this.beforeEntity = null;
		}
		
	},
	leftArrowUp: function (event) {

		if (this.elementToSelect) {
			this.selectEntityNode(this.elementToSelect)
			this.elementToSelect = null;
		} else if (this.selectedEntityNode) {
				this.setCursorBeforeEntity(this.selectedEntityNode);
				this.elementToSelect = null;	
				event.stopPropagation();
		}
		event.stopPropagation()
	},
	rightArrowUp: function (event) {
		if (this.beforeEntity) {
			var selection = this.editableDocument.getSelection();
			var anchorNode = selection.anchorNode;
			var previous = anchorNode.previousSibling;
			if (previous && previous.hasAttribute && previous.hasAttribute("data-cursor")) {
				previous = previous.previousSibling;
			}
			if (this.entities.isEntityElement(previous)) {
				this.selectEntityNode(previous)
				event.stopPropagation()
			}
		} else {
			if (this.selectedEntityNode) {
				this.setCursorAfterEntity(this.selectedEntityNode);
				event.stopPropagation()
			}
		}
	},
	selectEntityNode: function (node) {
		delete this.cursorAfterEntity;
		delete this.cursorBeforeEntity;
		var selection = this.editableDocument.getSelection();
		var range = document.createRange()
		range.setStartBefore(node.firstChild)
		range.setEndAfter(node.lastChild)
		selection.removeAllRanges();
		selection.addRange(range);
		this.selectedEntityNode = node;
	},
	setCursorBeforeEntity: function (entityNode) {
		delete this.cursorAfterEntity;
		var selection = this.editableDocument.getSelection();
		var range = this.editableDocument.createRange();
		range.setStartBefore(entityNode)
		range.setEndBefore(entityNode)
		selection.removeAllRanges()
		selection.addRange(range)
		this.selectedEntityNode = null;
	},
	setCursorAfterEntity: function (entityNode) {
		var selection = this.editableDocument.getSelection();
		var range = this.editableDocument.createRange();
		range.setStartAfter(entityNode)
		range.setEndAfter(entityNode)
		selection.removeAllRanges()
		selection.addRange(range)
		this.selectedEntityNode = null;
		this.cursorAfterEntity = entityNode;
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
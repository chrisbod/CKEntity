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
		document.addEventListener("paste", this, true);

		this.editableElement.addEventListener("contextmenu", this, true)
		this.editableDocument.addEventListener("mouseup",this)
		this.editableDocument.addEventListener("keyup", this,true)
		this.editableDocument.addEventListener("keydown", this, true)
		this.editableDocument.addEventListener("dragstart", this)
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
		//try {
		return this[event.type+'Handler'](event)
		//}
		//catch (e) {
		//	console.log(event.type)
		//}
	},
	dragstartHandler: function (event) {
		var entityNode = this.entities.getEntityElement(event.target);
		if (entityNode && !entityNode.classList.contains("user")) {
			event.dataTransfer.effectAllowed = "copy";
			event.preventDefault()
		}
	},
	selectionHandler: function (event) {
		console.log("here")
	},
	contextmenuHandler: function (event){
		var entityNode = this.entities.getEntityElement(event.target);
		if (entityNode && !entityNode.classList.contains("user")) {
			this.select(entityNode.parentNode);
		} else {
			this.selectedEntityNode = null;
		}
	},
	keyupHandler: function (event) {
		switch (event.keyCode) {
			case 37: return this.leftArrowUp(event);
			case 39: return this.rightArrowUp(event);
		}
		var selection = this.editableDocument.getSelection();
	
		this.previousEntity = null;
		event.stopPropagation()
		
	},
	keydownHandler: function (event) {
		switch (event.keyCode) {
			case 8: {
				this.nextEntity = null;
				return this.handleDelete(event);
			}
			case 37: return this.leftArrowDown(event);
			case 39: return this.rightArrowDown(event);
		}
		this.nextEntity = null;
		event.stopPropagation()
	},
	leftArrowDown: function (event) {
		if (event.details.selection.textNode && event.details.selection.selection.anchorOffset == 0 ) {
			if (event.details.selection.entityBefore) {
				this.select(event.details.selection.entityBefore)
				event.preventDefault();
				return;
			}
		}
		this.selectedEntityNode = null;
		event.stopPropagation()
	},
	rightArrowDown: function (event) {
		

		if (this.selectedEntityNode) {
			this.setCursorAfter(this.selectedEntityNode)
			this.selectedEntityNode = null;
			this.ignoreUp = true;
			event.preventDefault()
			return;
		}
		var range = event.details.selection.range;
		if (range.endContainer.nodeType == 3 && range.endContainer.endOffset == range.endContainer.data.length-1) {
			console.log("here")
		}
		event.stopPropagation()
	},
	leftArrowUp: function (event) {

		
	
		
		
		
		event.stopPropagation()
	},
	rightArrowUp: function (event) {
		if (this.ignoreUp) {
			this.ignoreUp = false;
			return
		}
		var range = event.details.selection.range;
		if (range.startContainer.nodeType!=3 && range.startOffset == 0) {
			var element = range.startContainer.firstChild
			if (element.hasAttribute && element.hasAttribute("data-entity-node")) {
				this.select(element)
				event.preventDefault()
			}
		} else {

			console.log(range.startContainer)


		}
		
		
		/*if (this.selectedEntityNode && this.selectedEntityNode == event.details.currentEntity) {
			this.setCursorAfter(this.selectedEntityNode)
			this.selectedEntityNode = null

		}*/
	},
	simpleSelect: function (selection,node) {
		selection.removeAllRanges();
		var range = this.editableDocument.createRange();
		range.selectNode(node);
		selection.addRange(range);
					
	},
	
	mouseupHandler: function (event) {
		//this.entityBefore = event.details.selection.entityBefore;
		//console.log(this.entityBefore)
		//this.checkSelectionAndCursor(this.editableDocument.getSelection(),event)
	},
	checkSelectionAndCursor: function (selection,event) {
		if (selection.isCollapsed) {//cursor
		} else {//selection
			console.log(event.type,selection.getRangeAt(0))
		}
	},
	
	pasteHandler: function () {
		if (this.selectedEntityNode) {
			this.selectedEntityNode.parentNode.removeChild(this.selectedEntityNode);
			this.selectedEntityNode = null;
		}
	},
	handleDelete: function (event) {
		if (this.selectedEntityNode && event.keyCode == 8) {
			this.removeCurrentEntityIfAllowed()
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	removeCurrentEntityIfAllowed: function () {
		//you cannot remove tokens or conditionals if they are part of a translation
		if (this.selectedEntityNode) {
			var currentNode = this.selectedEntityNode;
			if (currentNode.tagName == "CONDITIONAL" && !currentNode.classList.contains("user")) {
				this.collapser.collapse(currentNode);
			} else {
				
				var deleteAllowed = currentNode.nodeName == "TOKEN" ? true : false;
				if (currentNode.tagName == "TRANSLATION") {
					deleteAllowed = true;
				} else{
					while (currentNode && currentNode != this.editableElement) {

						if (currentNode.tagName == "CONDITIONAL" && !currentNode.classList.contains("user")) {
							deleteAllowed = false;
							break;
						}
					currentNode = currentNode.parentNode;
					}
				}	
				if (deleteAllowed) {
					this.selectedEntityNode.parentNode.removeChild(this.selectedEntityNode);
					this.selectedEntityNode = null;
				}
			}
			if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
				CKEDITOR.currentInstance.fire("saveSnapshot");
			}
		}
	},
	clickHandler: function (event) {
		var entityNode = this.entities.getEntityElement(event.target);
		if (entityNode && !entityNode.classList.contains("user")) {
			this.select(entityNode)
		} else {
			this.selectedEntityNode = null;
			if (event.target.tagName == "PAGEBREAK") {

					CKEDITOR.currentInstance.getSelection().selectElement( new CKEDITOR.dom.element(event.target))
					

				}
		}
		
	},
	dblclickHandler: function (event) {
		if (this.selectedEntityNode) {
			var currentNode = this.selectedEntityNode.parentNode;
			while (currentNode!=this.editableElement) {
				if (this.entities.isEntityElement(currentNode)) {
					return this.select(currentNode);
				}
				currentNode = currentNode.parentNode;
			}
		}
	},
	select: function (entityNode) {

		//this.removeImpureTextNodes(this.editableElement);
		var selection =  this.getCleanSelection(),
			range = this.editableDocument.createRange();
		this.selectedEntityNode = entityNode;
		range.setStartBefore(entityNode)
		range.setEndAfter(entityNode)
		
		selection.addRange(range);
		this.selectedEntityNode = entityNode;

	},
	setCursorAfter: function (node) {
		var selection = this.getCleanSelection();
		var range = document.createRange()
		range.setStartAfter(node)
		range.setEndAfter(node)
		this.selectedEntityNode = null;
		selection.addRange(range)
	},
	setCursorBefore: function (node) {
		var selection = this.getCleanSelection();
		var range = document.createRange()
		range.setStartBefore(node);
		range.setEndBefore(node);
		selection.addRange(range);
		this.selectedEntityNode = null;
	},
	getCleanSelection: function () {
		var selection = this.editableDocument.getSelection();
		selection.collapse(true)
		selection.removeAllRanges();
		return selection
	}
}
function EntitySelectionManager() {
	this.entities = new EntitiesHelper();
}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableDocument = editableElement.ownerDocument;
		
		this.editableElement.addEventListener("click", this, true);
		this.editableElement.addEventListener("dblclick", this);
		document.addEventListener("keydown", this, true);
		document.addEventListener("keyup", this, true);
		document.addEventListener("paste", this, true);

		this.editableElement.addEventListener("contextmenu", this, true)
		//this.editableElement.addEventListener("mouseup",this)
		this.editableElement.addEventListener("keyup", this)
		this.editableElement.addEventListener("keydown", this, true)
		this.editableElement.addEventListener("dragstart", this)
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
			this.select(entityNode.parentNode)
		} else {
			this.selectedEntityNode = null;
		}
	},
	keydownHandler: function (event) {
		switch (event.keyCode) {
			case 8: return this.handleDelete(event);
			//case 37: return this.leftArrowDown(event);
			//case 39: return this.rightArrowDown(event);
		}
	},
	simpleSelect: function (selection,node) {
		selection.removeAllRanges()
		var range = this.editableDocument.createRange()
		range.selectNode(node)

		//range.setStartBefore(node)
		//range.setEndAfter(node)
		selection.addRange(range)
					
	},
	keyupHandler: function (event) {
		var selection = this.editableDocument.getSelection();
		if (selection.baseNode.data == "\u200b") {
			selection.baseNode.data = "";
		}
	},
	mouseupHandler: function (event) {
		//this.checkSelectionAndCursor(this.editableDocument.getSelection(),event)
	},
	checkSelectionAndCursor: function (selection,event) {
		if (selection.isCollapsed) {//cursor
			//console.log("collapsed",selection)
		} else {//selection
			//console.log(selection)
			//console.log("not collapsed",selection)
			console.log(event.type,selection.getRangeAt(0))
		}
	},
	
	pasteHandler: function () {
		if (this.currentEntityNode) {
			this.currentEntityNode.parentNode.removeChild(this.currentEntityNode);
			this.currentEntityNode = null;
		}
	},
	handleDelete: function (event) {
		if (this.currentEntityNode && event.keyCode == 8) {
			this.removeCurrentEntityIfAllowed()
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	removeCurrentEntityIfAllowed: function () {
		//you cannot remove tokens or conditionals if they are part of a translation
		if (this.selectedEntityNode) {
		var currentNode = this.selectedEntityNode.parentNode;
		while (currentNode && currentNode != this.editableElement) {
			if (currentNode.tagName == "TRANSLATION") {
				return;
			}
			currentNode = currentNode.parentNode;
		}
		this.selectedEntityNode.parentNode.removeChild(this.selectedEntityNode);
		this.selectedEntityNode = null;
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
		this.currentEntityNode = entityNode
	},
	getCleanSelection: function () {
		var selection = this.editableDocument.getSelection();
		selection.collapse(true)
		selection.removeAllRanges();
		return selection
	}
}
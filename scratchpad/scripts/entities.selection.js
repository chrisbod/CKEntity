function EntitySelectionManager() {
	this.entities = new EntitiesHelper();
}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableDocument = editableElement.ownerDocument;
		
		this.editableElement.addEventListener("click", this);
		this.editableElement.addEventListener("dblclick", this);
		document.addEventListener("keydown", this, true);
		document.addEventListener("keyup", this, true);
		document.addEventListener("paste", this, true);

		this.editableElement.addEventListener("contextmenu", this, true)
		//this.editableElement.addEventListener("mouseup",this)
		this.editableElement.addEventListener("keyup", this)
		this.editableElement.addEventListener("keydown", this, true)
		//this.editableElement.addEventListener("mousedown", this)
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
		try {
		return this[event.type+'Handler'](event)
		}
		catch (e) {
			console.log(event.type)
		}
	},
	selectionHandler: function (event) {
		console.log("here")
	},
	contextmenuHandler: function (event){
		var entityNode = this.entities.getEntityElement(event.target);
		if (entityNode) {
			this.select(entityNode)
		} else {
			this.selectedEntityNode = null;
		}
	},
	skeydownHandler: function (event) {
		if (this.editableElement.contains(event.target)) {
			switch (event.keyCode) {
				case 8: return this.handleDelete(event);
				case 39: {
					return this.handleRightArrow(event);
				}
				case 40: return this.handleArrow(event);
			}
		}
	},
	keydownHandler: function (event) {
		switch (event.keyCode) {
			case 37: return this.leftArrowDown(event);
			case 39: return this.rightArrowDown(event);
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
	leftArrowDown: function (event) {
		var selection = this.editableDocument.getSelection();
		var baseNode = selection.baseNode;
		var previous;
		console.log(selection.baseNode)
		if (baseNode.nodeType!=3) {

			if (selection.baseOffset==0) {
				previous = baseNode.firstChild;
			} else {
				previous = baseNode.childNodes[selection.baseOffset-1].previousElementSibling;
			}
			switch (this.entities.getEntityType(previous)) {
				case "": return;
				case "token": {
					
					this.simpleSelect(selection,previous);
					console.log("token")
					event.preventDefault();
					return;
				}
				case "translation": {
					this.simpleSelect(selection,previous)
					event.preventDefault();
					return;
				}
				case "userconditional": {
						selection.selectAllChildren(previous.children[1])
						selection.collapseToEnd()
						event.preventDefault();
						return
					}
			}
		} else {

			if (selection.baseOffset==0) {
				previous = baseNode.previousSibling;

				if (previous == null) {
					previous = baseNode.parentNode.previousElementSibling
				}
				switch (this.entities.getEntityType(previous)) {
					case "": return;
					case "token": {
						console.log("token")
						this.simpleSelect(selection,previous)
						event.preventDefault();
						return;
					}
					case "translation": {
						this.simpleSelect(selection,previous)
						event.preventDefault();
						return;
					}
					case "userconditional": {
						selection.selectAllChildren(previous.children[1])
						selection.collapseToEnd()
						event.preventDefault();
						return;
					}
					case "startmarker": {
						this.simpleSelect(selection,previous.parentNode)
						selection.collapseToStart()
						event.preventDefault();
						return;
					}
				}
			}
			
		}
	},
	rightArrowDown: function (event) {
		var selection = this.editableDocument.getSelection();
		var baseNode = selection.baseNode;
		var next;
		if (baseNode.nodeType!=3) {
			if (selection.baseOffset==0) {
				next = baseNode
			} else {
				next = baseNode.childNodes[selection.baseOffset-1].nextElementSibling;
			}
			
			switch (this.entities.getEntityType(next)) {
				case "": return;
				case "token": {
					this.simpleSelect(selection,next)
					event.preventDefault();
					return;
				}
				case "translation": {
					this.simpleSelect(selection,next)
					event.preventDefault();
					return;

				}
				case "userconditional": {
					selection.selectAllChildren(next.children[1])
					selection.collapseToStart()
					event.preventDefault();
				}
			}
		} else {

			if (selection.baseOffset==baseNode.data.length) {		
				next = baseNode.nextElementSibling;
				if (next==null) {
					next = baseNode.parentNode.nextElementSibling;
				}
				
				switch (this.entities.getEntityType(next)) {
					case "": return;
					case "token": {

						if (selection.isCollapsed) {
							this.simpleSelect(selection,next)
						} else {
							this.simpleSelect(selection,next)
							selection.collapseToEnd()
						}
						event.preventDefault();
						event.stopPropagation();
						return;
					}
					case "translation": {
						
						if (selection.isCollapsed) {
							this.simpleSelect(selection,next);
							event.preventDefault();
						} else {
							//console.log("foo")
						}
						return
					}
					case "userconditional": {
						selection.selectAllChildren(next.children[1])
						selection.collapseToStart()
						event.preventDefault();
						return

					}
					case "endmarker": {
						this.simpleSelect(selection,next.parentNode)
						selection.collapseToEnd()
						event.preventDefault()
						return
					}
				}
			}
			
		}
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
	fixHorizontalSelectionLocation: function (event) {
		
	

	},
	fixVerticalSelectionLocation: function (event) {
		var selection = this.editableDocument.getSelection();
		var node = selection.anchorNode.parentNode,
			highestEntity = null;
		while (node!=this.editableElement) {
			if (this.entities.isEntityElement(node)) {
				highestEntity = node;
			}
			node = node.parentNode;
		}
		if (highestEntity) {
			if (highestEntity == this.currentEntityNode) {
				if (event.keyCode == 38) {
					this.handleLeftArrow(event)
				} else {
					this.handleRightArrow(event)
				}
			} else {
				this.select(highestEntity)
			}
			
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
	handleArrow: function () {
		if (this.editableElement.contains(event.target)) {
			switch (event.keyCode) {
				//case 37: return this.handleLeftArrow(event);
				case 38: return this.handleUpArrow(event);
				//case 39: return this.handleRightArrow(event);
				case 40: return this.handleDownArrow(event);
			}
		}
	},
	handleLeftArrow: function (event) {
		var selection = this.editableDocument.getSelection(),
			node = selection.anchorNode;
		if (node.data && selection.anchorOffset == node.data) {
				console.log(this.selectedEntityNode)
		}
		if (this.selectedEntityNode == node.nextSibling) {
			this.selectedEntityNode = null;
			return;

		}
		if (this.entities.isEntityElement(node.nextSibling)) {
			this.select(node.nextSibling);
			event.stopPropagation();
			event.preventDefault();
			return
		}
		this.selectedEntityNode = null;
		
	},
	handleUpArrow: function (event) {
		//this.lastKnownRange = document.getSelection().getRangeAt(0)

	},
	handleRightArrow: function (event) {
		var selection = this.editableDocument.getSelection(),
			node = selection.anchorNode;
		if (this.selectedEntityNode == node.nextSibling) {
			this.selectedEntityNode = null;
			return
		}

		if (this.entities.isEntityElement(node.nextSibling)) {
			if (node.data && node.data.length == selection.anchorOffset) {
					this.select(node.nextSibling);
					event.stopPropagation();
					event.preventDefault();
					return;
				}
			}
		
		
		this.selectedEntityNode = null;
	},
	handleDownArrow: function (event) {
		//this.lastKnownRange = this.editableDocument.getSelection().getRangeAt(0)
	},
	removeCurrentEntityIfAllowed: function () {
		//you cannot remove tokens or conditionals if they are part of a translation
		var currentNode = this.selectedEntityNode.parentNode;
		while (currentNode && currentNode != this.editableElement) {
			if (currentNode.tagName == "TRANSLATION") {
				return;
			}
			currentNode = currentNode.parentNode;
		}
		this.selectedEntityNode.parentNode.removeChild(this.selectedEntityNode);
		this.selectedEntityNode = null;
		
	},
	clickHandler: function (event) {
		var entityNode = this.entities.getEntityElement(event.target);
		if (entityNode) {
			this.select(entityNode)
		} else {
			this.selectedEntityNode = null;
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
	},
	setCursorAfter: function (node) {
		//this.removeImpureTextNodes(this.editableElement)
		var selection = this.getCleanSelection();
		var range = this.editableDocument.createRange()
		range.setStartAfter(node)
		selection.addRange(range);
		var noodle = this.editableDocument.createTextNode("\u200b");
		node.parentNode.insertBefore(noodle,node.nextSibling);
		this.selectedEntityNode = null;
	},
	setCursorBefore: function (node) {
		//this.removeImpureTextNodes(this.editableElement)
		var selection = this.getCleanSelection();
		var range = this.editableDocument.createRange();
		range.setStartBefore(node)
		range.setEndBefore(node)
		selection.addRange(range);
		var noodle = this.editableDocument.createTextNode("\u200b");
		node.parentNode.insertBefore(noodle,node.nextSibling);
		this.selectedEntityNode = null;
	},
	getCleanSelection: function () {
		var selection = this.editableDocument.getSelection();
		selection.collapse(true)
		selection.removeAllRanges();
		return selection
	},
	removeImpureTextNodes: function (element) {
		  for (element=element.firstChild;element;element=element.nextSibling){
		    if (element.nodeType==3) {
		    	if (element.data == "\u200b") {
		    		element.parentNode.removeChild(element)
		    	}
		    } else {
		    	this.removeImpureTextNodes(element);
		    }
		  }
	}
}
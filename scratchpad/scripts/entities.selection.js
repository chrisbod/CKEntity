function EntitySelectionManager() {
	this.entities = new EntitiesHelper();
}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		//this.editableElement.addEventListener("click", this);
		//this.editableElement.addEventListener("dblclick", this);
		//document.addEventListener("keydown", this, true);
		//document.addEventListener("keyup", this, true);
		//document.addEventListener("paste", this, true);
		//this.editableElement.addEventListener("contextmenu", this, true)
	},
	handleEvent: function(event) {
		return this[event.type+'Handler'](event)
	},
	contextmenuHandler: function (event){
		var entityNode = this.entities.getEntityElement(event.target);
		if (entityNode) {
			this.select(entityNode)
		} else {
			this.selectedEntityNode = null;
		}
	},
	keydownHandler: function (event) {
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
	keyupHandler: function (event) {
		if (this.editableElement.contains(event.target)) {
			switch (event.keyCode) {
				case 37: return this.handleLeftArrow(event);
				//case 39: return this.handleRightArrow(event);
				case 38:
				case 40: return this.fixVerticalSelectionLocation(event);
			}
		}
	},
	fixHorizontalSelectionLocation: function (event) {
		
	

	},
	fixVerticalSelectionLocation: function (event) {
		var selection = document.getSelection();
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
		var selection = document.getSelection(),
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
		var selection = document.getSelection(),
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
		//this.lastKnownRange = document.getSelection().getRangeAt(0)
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
		this.removeImpureTextNodes(this.editableElement);
		var selection =  this.getCleanSelection(),
			range = document.createRange();
		this.selectedEntityNode = entityNode;
		range.selectNode(entityNode)
		
		selection.addRange(range);
	},
	setCursorAfter: function (node) {
		this.removeImpureTextNodes(this.editableElement)
		var selection = this.getCleanSelection();
		var range = document.createRange()
		range.setStartAfter(node)
		selection.addRange(range);
		var noodle = document.createTextNode("\u200b");
		node.parentNode.insertBefore(noodle,node.nextSibling);
		this.selectedEntityNode = null;
	},
	setCursorBefore: function (node) {
		this.removeImpureTextNodes(this.editableElement)
		var selection = this.getCleanSelection();
		var range = document.createRange();
		range.setStartBefore(node)
		range.setEndBefore(node)
		selection.addRange(range);
		var noodle = document.createTextNode("\u200b");
		node.parentNode.insertBefore(noodle,node.nextSibling);
		this.selectedEntityNode = null;
	},
	getCleanSelection: function () {
		var selection = document.getSelection();
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
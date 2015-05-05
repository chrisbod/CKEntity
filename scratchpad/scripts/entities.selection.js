function EntitySelectionManager() {

}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("click", this);
		this.editableElement.addEventListener("dblclick", this);
		document.addEventListener("keydown", this, true);
		document.addEventListener("keyup", this, true);
		document.addEventListener("paste", this, true);

	},
	isEntityElement: function (element) {
		if (element) {
			return /TRANSLATION|TOKEN|CONDITIONAL/i.test(element.tagName);
		} 
		return false;
	},
	getEntityElement: function (startNode) {
		var currentNode = startNode,
			path = [];
		if (event.path) {
			path = event.path;
		} else {
			path = this.getPath(startNode);
		}
		for (var i=0;i!=path.length-3;i++) {
			if (this.isEntityElement(path[i])) {
				return path[i]
			}
		}
		return null;
	} ,
	getPath: function (startNode) {
		var currentNode = startNode,
			path = [];
		while (currentNode) {
			path[path.length] = currentNode;
			currentNode = currentNode.parentNode;
		}
		path[path.length] = window;
		return path;
	},
	handleEvent: function(event) {
		return this[event.type+'Handler'](event)
	},
	keydownHandler: function (event) {
		switch (event.keyCode) {
			case 8: return this.handleDelete(event);
			case 37:
			case 38:
			case 39:
			case 40: return this.handleArrow(event);
		}
	},
	keyupHandler: function () {
		if (this.editableElement.contains(event.target)) {
			switch (event.keyCode) {
				case 38:
				case 40: return this.fixVerticalSelectionLocation(event);
			}
		}
	},
	fixVerticalSelectionLocation: function (event) {
		var selection = document.getSelection();
		var node = selection.anchorNode.parentNode,
			highestEntity = null;
		while (node!=this.editableElement) {
			if (this.isEntityElement(node)) {
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
			event.stopPropagation()
			event.preventDefault();

		}
	},
	handleArrow: function () {
		if (this.editableElement.contains(event.target)) {
			switch (event.keyCode) {
				case 37: return this.handleLeftArrow(event);
				case 38: return this.handleUpArrow(event);
				case 39: return this.handleRightArrow(event);
				case 40: return this.handleDownArrow(event);
			}
		}
	},
	handleLeftArrow: function (event) {
		var selection = document.getSelection();
		if (this.currentEntityNode) {
			var range = document.createRange()
			range.setStartAfter(this.currentEntityNode.previousSibling);
			range.setEndAfter(this.currentEntityNode.previousSibling);
			selection.removeAllRanges();
			selection.addRange(range);
			this.currentEntityNode = null;
		} else {
			if (selection.anchorOffset == 0 && selection.isCollapsed) {
				if (this.isEntityElement(selection.anchorNode.previousSibling)) {
					this.select(selection.anchorNode.previousSibling);
				} else {
					//debugger;
				}
			} else {
				//this.currentEntityNode = null;
			}

		}
	},
	handleUpArrow: function (event) {
		//this.lastKnownRange = document.getSelection().getRangeAt(0)

	},
	handleRightArrow: function (event) {
		var selection = document.getSelection();
		if (this.currentEntityNode) {
			var range = document.createRange()
			range.setStartBefore(this.currentEntityNode.nextSibling)
			range.setEndAfter(this.currentEntityNode.nextSibling)
			selection.removeAllRanges();
			selection.addRange(range);
			this.currentEntityNode = null;
			selection.collapseToStart()
		} else {
			if (this.isEntityElement(selection.focusNode.nextSibling)) {
				this.select(selection.anchorNode.nextSibling);
			} else {
				//this.currentEntityNode = null;
			}
		}
	},
	handleDownArrow: function (event) {
		//this.lastKnownRange = document.getSelection().getRangeAt(0)
	},
	removeCurrentEntityIfAllowed: function () {
		//you cannot remove tokens or conditionals if they are part of a translation
		var currentNode = this.currentEntityNode.parentNode;
		while (currentNode && currentNode != this.editableElement) {
			if (currentNode.tagName == "TRANSLATION") {
				return;
			}
			currentNode = currentNode.parentNode;
		}
		this.currentEntityNode.parentNode.removeChild(this.currentEntityNode);
		this.currentEntityNode = null;
		
	},
	clickHandler: function (event) {
		var entityNode = this.getEntityElement(event.target);
		if (entityNode) {
			this.select(entityNode)
		} else {
			this.currentEntityNode = null;
		}
	},
	dblclickHandler: function (event) {
		if (this.currentEntityNode) {
			var currentNode = this.currentEntityNode.parentNode;
			while (currentNode!=this.editableElement) {
				if (this.isEntityElement(currentNode)) {
					return this.select(currentNode);
				}
				currentNode = currentNode.parentNode;
			}
		}
	},
	select: function (entityNode) {
		var selection = document.getSelection();
		this.currentEntityNode = entityNode;
		selection.selectAllChildren(entityNode)
	},
}
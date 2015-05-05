function EntitySelectionManager() {

}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("click", this);
		this.editableElement.addEventListener("dblclick", this);
		document.addEventListener("keydown", this, true);
	},
	isEntityElement: function (element) {
		return /TRANSLATION|TOKEN|CONDITIONAL/i.test(element.tagName);
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
			case 37: return this.handleLeftArrow(event);
			case 38: return this.handleUpArrow(event);
			case 39: return this.handleRightArrow(event);
			case 40: return this.handleDownArrow(event);
		}
	},
	handleDelete: function (event) {
		if (this.currentEntityNode && event.keyCode == 8) {
			this.removeCurrentEntityIfAllowed()
			event.stopPropagation()
			event.preventDefault();

		}
	},
	handleLeftArrow: function (event) {
		var selection = document.getSelection();
	},
	handleUpArrow: function (event) {
		var selection = document.getSelection();
	},
	handleRightArrow: function (event) {
		var selection = document.getSelection();
	},
	handleDownArrow: function (event) {
		var selection = document.getSelection();
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
			this.currentEntityNode = entityNode;
			this.select(entityNode)
		} else {
			this.currentEntityNode = null;
		}
	},
	dblclickHandler: function (event) {
		if (this.currentEntityNode) {
			alert("Editing:" + this.currentEntityNode.tagName)
		}
	},
	select: function (entityNode) {
		var selection = document.getSelection(),
			range = document.createRange();
		selection.collapseToEnd();
		selection.removeAllRanges();

		range.selectNodeContents(entityNode);
		selection.addRange(range);
	},
}
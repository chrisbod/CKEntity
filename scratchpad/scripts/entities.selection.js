function EntitySelectionManager() {

}
EntitySelectionManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("click", this);
		this.editableElement.addEventListener("dblclick", this);
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
	clickHandler: function (event) {
		var entityNode = this.getEntityElement(event.target);
		if (entityNode) {
			this.currentEntityNode = entityNode
			this.select(entityNode)
		} else {
			this.currentEntityNode = null;
		}
	},
	dblclickHandler: function (event) {
		alert("Editing:" + this.currentEntityNode)
	},
	select: function (entityNode) {
		var selection = document.getSelection(),
			range = document.createRange()
		selection.collapse(entityNode);
		range.selectNode(entityNode);
		selection.addRange(range);
	},
}
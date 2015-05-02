function EntityMarkupManager() {
	
}
EntityMarkupManager.prototype = function () {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("input",this);
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"];
	},
	inputHandler: function () {
		this.preventEntityEditing();
	},
	preventEntityEditing: function () {
		var tokens = this.editableElement.querySelectorAll("token:not([contenteditable]),translation:not([contenteditable]");
		for (var i=0;i<tokens.length;i++) {
			this.makeReadOnly(tokens[i])
		}
	},
	makeReadOnly: function (element) {
		element.setAttribute("contenteditable","false");
		var children = element.querySelectorAll("*:not([contenteditable])");
		for (var i=0;i<children.length;i++) {
			children[i].setAttribute("contenteditable","false");
		}
	}
}
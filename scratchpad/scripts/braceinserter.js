function BraceInserter () {
}
BraceInserter.prototype = {
	activate: function (editableElement) {
		this.editableElement = editableElement;
		editableElement.addEventListener("keydown",this)
	},
	handleEvent: function (event) {
		return this[event.type+'Handler'](event);
	},
	keydownHandler: function (event) {
		switch (event.ketCode) {
			case 219: return this.handleOpenBrace(event)
		}
		if (event.keyCode == 219) {
			

			
		} else {
			console.log(event.keyCode)
		}
	},
	handleOpenBrace: function (event) {
		var selection = document.getSelection();
		var range = selection.getRangeAt(0);
		var conditional = document.createElement("conditional");
		conditional.appendChild(document.createTextNode("\u200B"))
		range.insertNode(conditional);
		range.selectNodeContents(conditional)
		range.collapse()
		selection.removeAllRanges();
		selection.addRange(range);
		event.preventDefault();
	}
}
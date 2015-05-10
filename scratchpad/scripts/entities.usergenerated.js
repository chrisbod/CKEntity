function UserConditionalManager() {
	this.conditionalOpenRanges = [];
	this.conditionalCloseRanges = [];
}
UserConditionalManager.prototype = {
	active: false,
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("keyup", this)
		this.generateUserConditionalTemplateNode()
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event);
	},
	keyupHandler: function (event) {
		switch (event.keyCode) {
			case 219: return this.openSquareBrackets(event);
			case 8: return this.checkDelete(event);
		}
	},
	openSquareBrackets: function (event) {
		var selection = document.getSelection(),
			range = selection.getRangeAt(0),
			conditional = this.conditionalTemplateNode.cloneNode(true);
			
		if (range.collapsed == true) {
			var start = selection.baseNode,
				offset = selection.baseOffset-1;
				
			if (start.nodeType == 3) {
				//console.log(start.data)
				var sibling = start.splitText(offset);
				if (sibling.data.length>1) {
					sibling.splitText(1)
				}
				sibling.parentNode.replaceChild(conditional,sibling)
				conditional.parentNode.insertBefore(document.createTextNode("\u200b"),conditional.nextSibling)
				selection.removeAllRanges();
				selection.selectAllChildren(conditional.childNodes[1]);
				selection.collapseToEnd()
				event.preventDefault()
				event.stopPropagation()
			} else  {
				console.log(selection,range)
			}
		} else {
			//overwriting selection....
		}
	},
	checkDelete: function () {

	},
	generateUserConditionalTemplateNode: function () {
		var conditional = document.createElement("conditional");
		conditional.className = "user"
		conditional.setAttribute("data-args","type: 'user'");
		conditional.innerHTML = '<span class="args conditional" data-args="type:\'user\'" contenteditable="false">[</span><span class="contents">&#8203;</span><span class="conditional end" contenteditable="false">]</span>'
		this.conditionalTemplateNode = conditional;

	}
}
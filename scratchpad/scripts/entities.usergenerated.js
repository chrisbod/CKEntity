function UserConditionalManager() {
	this.conditionalOpenRanges = [];
	this.conditionalCloseRanges = [];
	this.entitiesHelper = new EntitiesHelper();
}
UserConditionalManager.prototype = {
	active: false,
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("keyup", this)
		//this.editableElement.addEventListener("keydown", this)
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
	keydownHandler: function (event) {
		switch (event.keyCode) {
			case 8: return this.checkDelete(event);
		}
	},
	inputHandler: function (event) {
		//console.log("here")
	}, 
	openSquareBrackets: function (event) {
		var selection = document.getSelection(),
			range = selection.getRangeAt(0),
			conditional = this.conditionalTemplateNode.cloneNode(true);
		conditional.addEventListener("input", this)
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
				selection.selectAllChildren(conditional);
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
	checkDelete: function (event) {
		var selection = document.getSelection();
		
		//var entity = this.entitiesHelper.getEntityElement(selection.anchorNode);
		//if (entity && entity.className == "user") {
			//console.log(entity.innerText == "\u200b")
		//}
	},
	generateUserConditionalTemplateNode: function () {
		var conditional = document.createElement("conditional");
		conditional.className = "user"
		conditional.setAttribute("data-args","type: 'user'");
		conditional.innerHTML = '<span class="args conditional">[</span><span class="contents conditional" data-args="type:\'user\'">&#8203;</span>'
		this.conditionalTemplateNode = conditional;

	}
}
function UserConditionalManager() {
	this.conditionalOpenRanges = [];
	this.conditionalCloseRanges = [];
	this.entitiesHelper = new EntitiesHelper();
}
UserConditionalManager.prototype = {
	active: false,
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("keyup", this,true)
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
			//case 8: return this.checkDelete(event);
		}
	},
	inputHandler: function (event) {
		console.log("here")
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
				conditional.parentNode.insertBefore(document.createTextNode(" "),conditional.nextSibling)
				selection.removeAllRanges();
				selection.selectAllChildren(conditional.querySelector(".contents.conditional"));
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
		//console.log(selection)
		//console.log(event.currentTarget)
		
		var entity = this.entitiesHelper.getEntityElement(selection.anchorNode);
		
		if (entity && entity.classList.contains("user")) {
			if (!this.isValidUserEntity(entity)) {
				var contentNode = entity.firstChild;
				var removed = false;
				while (contentNode) {
					if (contentNode.nodeType!=3) {
						if (contentNode.classList.contains("contents")) {
							contentNode.className = '';
							entity.parentNode.replaceChild(contentNode,entity);
							removed = true;
							break;
						}
					} 
					contentNode = contentNode.nextSibling;
				}
				if (!removed) {
					entity.parentNode.replaceChild(document.createTextNode(" "),entity)
				}
			}
		}
	},
	generateUserConditionalTemplateNode: function () {
		var conditional = document.createElement("conditional");
		conditional.className = "user"
		conditional.setAttribute("data-args","type: 'user'");
		conditional.innerHTML = '<span class="args conditional"  contenteditable="false">[</span><span class="contents conditional"></span><span class="conditional end" contenteditable="false">]</span>'
		this.conditionalTemplateNode = conditional;

	},
	isValidUserEntity: function (entity) {
		if (!entity.firstChild.classList || !entity.firstChild.classList.contains("args")) {
			return false
		}
		if (!entity.lastChild.classList || !entity.lastChild.classList.contains("end")) {
			return false
		}
		return true;
	}
}
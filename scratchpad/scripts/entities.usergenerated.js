function UserConditionalManager() {
	this.conditionalOpenRanges = [];
	this.conditionalCloseRanges = [];
	this.entitiesHelper = new EntitiesHelper();
}
UserConditionalManager.prototype = {
	active: false,
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.document = this.editableElement.ownerDocument;
		this.editableElement.addEventListener("keyup", this,true)
		this.document.addEventListener("keydown", this, true);
		
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
			case 13: return this.handleEnter(event)
			case 8: return this.checkDelete(event);
		}
	},
	handleEnter: function (event) {
		if (event.shiftKey) {
			return
		}
		var selectionTracker = SelectionTracker.getInstance(),
			wasMadeBlock = selectionTracker.makeEntityBlockLevel();
		if (wasMadeBlock) {
			event.preventDefault();
			event.stopPropagation();
		}
	},
	inputHandler: function (event) {
		console.log("here")
	}, 
	openSquareBrackets: function (event) {
		var selection = this.document.getSelection(),
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
				//conditional.parentNode.insertBefore(this.document.createTextNode("\u00A0"),conditional.nextSibling)
				selection.removeAllRanges();
				selection.selectAllChildren(conditional.querySelector(".contents.conditional *[contenteditable=true]"));
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
		var selection = this.document.getSelection();
		//console.log(selection)
		//console.log(event.currentTarget)
		
		var entity = this.getUserEntityElement(selection.anchorNode);
		if (entity) {
			if (entity.innerText == "[]") {
			}
		} else {
			//debugger;
		}
		
	},
	getUserEntityElement: function (node) {
		while (node && node != this.document.body) {
			if (node.hasAttribute && node.getAttribute("data-entity-node") == "user") {
				return node
			}
			node = node.parentNode
		}
		return null;
	},
	generateUserConditionalTemplateNode: function () {
		var conditional = this.document.createElement("conditional");
		conditional.className = "user conditional"
		conditional.contenteditable = false;
		conditional.setAttribute("data-args","type: 'user'");
		conditional.innerHTML = '<span class="args conditional" contenteditable="false" data-args>[</span><span class="contents conditional" contenteditable="false"><span contenteditable=true>  </span></span><span class="conditional end" contenteditable="false" data-args>]</span></span>'
		var editSpan = this.document.createElement("div");
		editSpan.className = "entity-wrapper";
		editSpan.appendChild(conditional)
		editSpan.setAttribute("data-entity-node","user")
		this.conditionalTemplateNode = editSpan;

	},
	isValidUserEntity: function (entity) {
		if (!entity.firstChild.classList || !entity.firstChild.classList.contains("conditional")) {
			return false
		}
		if (!entity.lastChild.classList || !entity.lastChild.classList.contains("end")) {
			return false
		}
		return true;
	}
}
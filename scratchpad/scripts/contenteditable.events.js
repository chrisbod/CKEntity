function ContentEditableEventGenerator() {
	this.currentDetails = {};
	this.entitiesHelper = new EntitiesHelper()
}
ContentEditableEventGenerator.prototype = {
	init: function (element) {
		this.element = element;
		this.document = element.ownerDocument
		this.bindEvents();
	},
	bindEvents: function () {
		var element = this.element;
		element.addEventListener("input",this,true);
		element.addEventListener("drop",this,true);
		element.addEventListener("mouseup",this,true);
		element.addEventListener("keyup",this,true);
		this.document.addEventListener("keydown",this,true);
		this.document.addEventListener("keyup",this,true);
		element.addEventListener("contextmenu",this,true);
		this.document.addEventListener("paste", this,true);

	},
	handleEvent: function (event) {
		this.extendEvent(event);
		return this[event.type+'Handler'](event);
	},
	extendEvent: function (event) {
		var selection = this.document.getSelection(),
			range = selection.rangeCount ? selection.getRangeAt(0) : null;
		var details = {};
		details.selection = selection;
		details.range = range;
		details.element = null
		details.entityBefore = null;
		details.entityAfter = null;
		
		details.contentSelected = range ? !selection.isCollapsed : false;
		if (event.target == this.document.body || event.target == this.document.documentElement) {
			details.textNode = selection.baseNode
			details.element = selection.baseNode.parentNode
			//mouseupdown etc occurred over whitespace in document
		} else {

			if (!selection.baseNode) {
				details.textNode = event.target.lastChild;
				details.element = event.target;
			} else {
				if (selection.baseNode.nodeType == 3) {
					details.textNode = selection.baseNode
					details.element = details.textNode.parentNode
				} else {
					details.textNode = null;
					details.element = selection.baseNode;
				}
			}

		}
		if (details.textNode) {
				this.setEntityStatus(details,details.textNode);
				(event.details = event.details || {}).selection = details
				return;
		}
		
		
		
		if (details.element  == this.document.body || details.element == this.document.documentElement) {//over a readonly itemtype)
			if (event.type == "keyup") {
				if (event.keyCode == 37) {
					if (details.entityBefore) {
						details.element = details.entityBefore.firstChild;
						details.currentEntityWrapper = details.entityBefore;
						details.currentEntity = details.entityBefore.firstChild;
					}
				}
				if (event.keyCode == 39) {
					if (details.entityAfter) {
						details.element = details.entityAfter.firstChild;
						details.currentEntityWrapper = details.entityAfter;
						details.currentEntity = details.entityAfter.firstChild;
					}
				}
			}
			
		}
		
		if (range) {
			details.atStartOfElement = false;
			details.atEndOfElement = false;
			details.atStartOfTextNode = false;
			details.atEndOfTextNode = false;

			
			if (selection.anchorNode.nodeType == 3) {
				if (selection.anchorOffset == 0) {
					details.atStartOfTextNode = true;
					if (!selection.anchorNode.previousSibling) {
						details.atStartOfElement = true;
					} else {
						details.atStartOfElement = false;
						this.setEntityStatus(details,selection.anchorNode)
					}
				} else if (selection.anchorOffset == selection.anchorNode.data.length) {
					details.atEndOfTextNode = true;
					if (!selection.anchorNode.nextSibling) {
						details.atEndOfElement = true;
					} else {
						details.atEndOfElement = false;
					}
				}
			} else {
				if (range.startContainer.nodeType != 3 && range.startOffset == 0) {
					var first = range.startContainer.firstChild
					if (first && first.nodeType != 3 && first.hasAttribute("data-entity-node")) {
						details.entityAfter = first
					}
					details.atStartOfElement = true;
				} else {
					details.atStartOfElement = true;
					details.atEndOfElement = true;
					this.setEntityStatus(details,selection.anchorNode)
				}
				
				
				
			}
		}

		details.currentEntity = this.entitiesHelper.getEntityElement(details.textNode);
		details.currentEntityWrapper = details.currentEntity ? details.currentEntity.parentNode : null;
		
		if (!event.details) {
			event.details = {};
		}
		event.details.selection = this.currentDetails;

		
	},
	setEntityStatus: function (details,currentNode) {

		if (currentNode.previousSibling && currentNode.previousSibling.nodeType != 3 && currentNode.previousSibling.hasAttribute("data-entity-node")) {
			details.entityBefore = currentNode.previousSibling
		} else {

			details.entityBefore = null;
		}
		if (currentNode.nextSibling && currentNode.nextSibling.nodeType != 3 && currentNode.nextSibling.hasAttribute("data-entity-node")) {
			details.entityAfter = currentNode.nextSibling
		} else {
			details.entityAfter = null;
		}
	},
	inputHandler: function () {},
	dropHandler: function () {},
	dragHandler: function () {},
	pasteHandler: function () {},
	clickHandler: function () {},
	dblclickHandler: function () {},
	keydownHandler: function () {},
	keyupHandler: function (event) {
		if (event.details.selection.possibleEmptyNode) {
			event.details.selection.emptyNode = true;
		} else {
			event.details.selection.emptyNode = false;
		}
	},
	keypressHandler: function () {},
	mousedownHandler: function (event) {

	},
	mouseupHandler: function (event) {
		if (event.details.selection.possibleEmptyNode) {
			event.details.selection.emptyNode = true;
		} else {
			event.details.selection.emptyNode = false;
		}
	},
	blurHandler: function () {},
	focusHandler: function () {},
	contextmenuHandler: function () {}


}
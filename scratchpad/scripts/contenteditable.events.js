function ContentEditableEventGenerator() {
	
}
ContentEditableEventGenerator.prototype = {
	init: function (element) {
		this.element = element;
		this.document = element.ownerDocument
		this.bindEvents();
	},
	bindEvents: function () {
		var element = this.element,
			document = this.document;
		element.addEventListener("input",this,true);
		element.addEventListener("drop",this,true);
		document.addEventListener("paste", this,true);
		element.addEventListener("click",this,true);
		element.addEventListener("dblclick",this,true);
		element.addEventListener("mouseover",this,true);

	},
	handleEvent: function (event) {
		this.extendEvent(event)
		return this[event.type+'Handler'](event);
	},
	extendEvent: function (event) {
		var selection = document.getSelection(),
			range = selection.rangeAt(0)
		event.selection = {
			selection: selection,
			range: range,
			atStartOfElement: selection.baseNode.nodeType != 3,
			contentSelected: !selection.isCollapsed
		}
		if ("pageX" in event) {
			details.cursorElement = event.target,
			details.caret = this.document.caretRangeFromPoint(event.pageX,event.pageY);
		} else {
			details.cursorElement = selection.baseNode;
			details.caret = range;
		}
	}
}
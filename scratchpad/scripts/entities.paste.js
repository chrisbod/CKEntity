function EntityPasteManager() {
	this.pasteCompleteHandlers = [];
}
EntityPasteManager.getInstance = function (element) {
	if (element._entityPasteManager) {
		return element._entityPasteManager
	} else {
		var pasteManager = element._entityPasteManager =  new EntityPasteManager()
		pasteManager.init(element)
		return pasteManager;
	}
}
EntityPasteManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;//weird have to add directly
		var pasteManager = this
		this.editableElement.onpaste = this.handleEvent.bind(this)
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event);
	},
	pasteHandler: function (event) {
		if (this.editableElement.contains(event.target)) {
			var selection = document.getSelection();
			var range = selection.getRangeAt(0);
			setTimeout(this.postPaste.bind(this,range,event))
		} else {
			console.log(event.target)
		}	
	},
	postPaste: function (pasteRange,pasteEvent) {

		var selection = document.getSelection(),
			range = selection.getRangeAt(0),
			newRange = document.createRange(),
			newText;

		newRange.setEnd(range.endContainer,range.endOffset)
		newRange.setStart(pasteRange.startContainer,pasteRange.startOffset)
		
		if (newRange.startContainer.nodeType == 3) {
			var newNode = newRange.startContainer.splitText(pasteRange.startOffset)
			newRange.setStartBefore(newNode)
		} 
		if (newRange.endContainer.nodeType == 3) {
			newRange.endContainer.splitText(range.endOffset)
			newRange.setEndAfter(newRange.endContainer)
		} 
		if (this.pasteComplete) {
			this.pasteComplete(range)
		}
	},
	pasteComplete: function (range) {
		this.pasteCompleteHandlers.forEach(function  (handler) {
			handler(range)
		});
	},
	addPasteComplete: function (handler) {
		if (this.pasteCompleteHandlers.indexOf(handler) == -1) {
			this.pasteCompleteHandlers.push(handler)
		}
	}

}
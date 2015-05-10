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

	
		newRange.setStart(pasteRange.startContainer,pasteRange.startOffset)
		newRange.setEnd(range.endContainer,range.endOffset);
		if (newRange.startContainer.nodeType == 3) {
			//newRange.startContainer.splitText(newRange.startContainer,range.startOffset)
			newRange.setStartBefore(newRange.startContainer.splitText(range.startOffset))
		}
		if (newRange.endContainer.nodeType == 3) {
			newRange.setEndAfter(newRange.endContainer.splitText(range.endOffset))
		}
		if (this.pasteComplete) {
			this.pasteComplete(range)
		}
		selection.removeAllRanges()
		selection.addRange(newRange)
		console.log(newRange.startContainer,newRange.endContainer)
		

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
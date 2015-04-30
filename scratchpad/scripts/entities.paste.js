function EntityPasteManager() {
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
			newRange,
			newText;

		if (pasteRange.commonAncestorContainer == range.commonAncestorContainer) {
			if (pasteRange.commonAncestorContainer.nodeType == 3) {
				newText = pasteRange.commonAncestorContainer.splitText(pasteRange.endOffset);
			} else {
				console.log("else")
			}
		} else {
			newRange = document.createRange();
			newRange.setStartAfter(pasteRange.startContainer,pasteRange.startOffset)
			newRange.setEnd(range.endContainer,range.endOffset)
			
		} 
		this.fixEntities(newRange||range);
	},
	fixEntities: function (range) {
		//var targetNode = range.commonAncestorContainer.nodeType == 3 ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer;
		
		this.fixTranslations(range);
		this.fixTokens(range)
		this.fixConditionals();
	},
	fixTranslations: function () {
		var orphans = this.editableElement.querySelectorAll("div > span.args.translation");
		for (var i=0,token;i!=orphans.length;i++) {
			var div = orphans[i].parentNode.cloneNode(true);
			this.removeStylesAndClean(div.querySelectorAll("*"));
			var token = document.createElement("translation");
			token.innerHTML = div.innerHTML;
			orphans[i].parentNode.parentNode.replaceChild(token,orphans[i].parentNode)
		}
	},
	fixTokens: function () {
		var orphans = this.editableElement.querySelectorAll("span.args.token[style]")
		for (var i=0;i<orphans.length; i++) {
			orphans[i].removeAttribute("style");
			var token = document.createElement("token"),
				nextSibling = orphans[i].nextSibling;
				token.contentEditable = false;
			nextSibling.removeAttribute("style")
			orphans[i].parentNode.replaceChild(token,orphans[i])
			token.appendChild(orphans[i])
			token.appendChild(nextSibling.firstChild)
			nextSibling.parentElement.removeChild(nextSibling);
		}
	},
	fixConditionals: function (element) {
		if (!element) {
			element = this.editableElement
		}
		var orphan = element.querySelector("span.args.conditional[style]"),
			endOrphan, currentOrphan,
			currentChild,
			conditionalId;
		if (orphan) {
			orphan.removeAttribute("style");
			conditionalId = orphan.getAttribute("data-conditional-name")
			endOrphan = orphan.parentNode.querySelector("span.args.conditional[data-conditional-name="+conditionalId+"][style]");
			endOrphan.removeAttribute("style")
			var range = document.createRange()
			range.setStartBefore(orphan)
			range.setEndAfter(endOrphan);
			var conditional = document.createElement("conditional")
			conditional.contentEditable = false;
			range.surroundContents(conditional)
		}



	},
	removeStylesAndClean: function (collection) {
		for (var i=0;i!=collection.length;i++) {
			collection[i].removeAttribute("style");
			if (!collection[i].className && collection[i].firstChild && collection[i].firstChild==collection[i].lastChild) {
				collection[i].parentNode.replaceChild(collection[i].firstChild,collection[i])
			}
		}
	}


}
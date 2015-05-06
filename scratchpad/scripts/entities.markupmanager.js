function EntityMarkupManager() {
	
}
EntityMarkupManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("input",this);
		//this.editableElement.onpaste = this.handleEvent.bind(this)
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"]();
	},
	inputHandler: function (event) {
		this.fixOrphanedElements();
		this.preventEntityEditing();
		this.fixRedundantMarkup();

	},
	pasteHandler: function (event) {
		this.inputHandler(event)
	},
	preventEntityEditing: function () {
		var tokens = this.editableElement.querySelectorAll("token:not([contenteditable]),translation:not([contenteditable]), conditional:not([contenteditable])");
		for (var i=0;i<tokens.length;i++) {
			this.makeReadOnlyAndStripStyles(tokens[i])
		}
	},
	makeReadOnlyAndStripStyles: function (element) {
		element.setAttribute("contenteditable","false");
		element.removeAttribute("style")
		var children = element.querySelectorAll("*:not([contenteditable])");
		for (var i=0;i<children.length;i++) {
			children[i].removeAttribute("style")
			children[i].setAttribute("contenteditable","false");
		}
	},
	fixRedundantMarkup: function (element) {
		return
		var extraneousLineBreaks = this.editableElement.querySelectorAll("div > translation > br:first-child:last-child, div > token > br:first-child:last-child, div > conditional > br:first-child:last-child")
		for (var i=0;i<extraneousLineBreaks.length;i++) {
			extraneousLineBreaks[i].parentNode.parentNode.parentNode.removeChild(extraneousLineBreaks[i].parentNode.parentNode)
		} 
		var translationsInDivs = this.editableElement.querySelectorAll("div > translation, div > token")
		for (var i=0;i<translationsInDivs.length;i++) {
			var div = translationsInDivs[i].parentNode;
			if (div != this.editableElement) {
				div.parentNode.replaceChild(translationsInDivs[i],div)
			}
			
		}
	},
	fixOrphanedElements: function () {
		//return
		this.fixOrphanedTranslations()
		this.fixOrphanedConditionals()
		this.fixOrphanedTokens();
		
	},
	fixOrphanedTranslations: function () {
		var orphans = this.editableElement.querySelectorAll("div > span.args.translation");
		for (var i=0;i<orphans.length;i++) {

			var currentNode = orphans[i]
			var key = currentNode.getAttribute("data-key-name");
			var node = document.createElement("translation");
			node.setAttribute("data-key-name",key);
			currentNode.parentNode.replaceChild(node,currentNode)
			node.appendChild(currentNode)
			currentNode = node.nextSibling;
			while (currentNode && currentNode.className != "translation end") {
				node.appendChild(currentNode)
				currentNode = node.nextSibling
			}
			node.appendChild(currentNode)
		}
	},
	fixOrphanedConditionals: function () {
		var orphans = this.editableElement.querySelectorAll("div > span.args.conditional");
		for (var i=0;i<orphans.length;i++) {

			var currentNode = orphans[i]
			var key = currentNode.getAttribute("data-conditional-name");
			var node = document.createElement("conditional");
			node.setAttribute("data-conditional-name",key);
			currentNode.parentNode.replaceChild(node,currentNode)
			node.appendChild(currentNode)
			currentNode = node.nextSibling;
			while (currentNode && currentNode.className != "conditional end") {
				currentNode.removeAttribute("style");
				currentNode.removeAttribute("data-key-name");//purge any translation keys
				node.appendChild(currentNode)
				currentNode = node.nextSibling
			}
			node.appendChild(currentNode)
		}
	},
	fixOrphanedTokens: function () {
		var orphans = this.editableElement.querySelectorAll("div > span.args.token");
		for (var i=0;i<orphans.length;i++) {

			var currentNode = orphans[i],
				nextNode = currentNode.nextSibling,
				nodeText = nextNode.firstChild;
			var key = currentNode.getAttribute("data-token-name");
			var node = document.createElement("token");
			node.setAttribute("data-token-name",key);
			node.appendChild(currentNode);
			node.appendChild(nodeText)
			nextNode.parentNode.insertBefore(node,nextNode)
			nextNode.removeAttribute("style")
			
		}
	}


}
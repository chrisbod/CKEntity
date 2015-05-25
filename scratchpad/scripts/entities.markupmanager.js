function EntityMarkupManager() {
	this.entitiesHelper = new EntitiesHelper()
}
EntityMarkupManager.getInstance = function (element) {
	if (!this._instance) {
		this._instance = new EntityMarkupManager()

	}
	return this._instance;
}
EntityMarkupManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("input",this);
		this.editableElement.addEventListener("drop",this,true)
		//this.editableElement.addEventListener("drag",this,true)
		this.editableDocument = editableElement.ownerDocument;
		this.editableDocument.addEventListener("paste", this,true)
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event);
	},
	inputHandler: function (event) {
		if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
			CKEDITOR.currentInstance.fire("saveSnapshot");
			//CKEDITOR.currentInstance.focusManager.focus()
		}
	},
	dropHandler: function (event) {
		var selection  = this.editableDocument.getSelection();
		if (selection.rangeCount) {
			this.internalDropHandler(event)
		} else {
			setTimeout(this.internalDropHandler.bind(this,event))
		}
	},
	internalDropHandler: function (event) {
		var dropTarget = this.editableDocument.elementFromPoint(event.pageX,event.pageY),
			caret = this.editableDocument.caretRangeFromPoint(event.pageX,event.pageY);	
		if (dropTarget) {
				var selection = dropTarget.ownerDocument.getSelection();
				var range = selection.getRangeAt(0);
				var startNode = caret.startContainer,
					nextTextNode,
					fragment;
				if (event.ctrlKey) {
					fragment = range.cloneContents();
				} else {
					fragment = range.extractContents();
					
				}
				fragment = this.cleanFragment(fragment);
				
				if (startNode.nodeType == 3) {
					newTextNode = startNode.splitText(caret.startOffset);
				} else {
					startNode = startNode.insertBefore(document.createTextNode(""),startNode.firstChild);

					newTextNode = startNode.parentNode.insertBefore(document.createTextNode(""),startNode.nextSibling);

				}
				newTextNode.parentNode.insertBefore(fragment,newTextNode);
				range.setStartAfter(startNode);
				range.setEndBefore(newTextNode);
				selection.removeAllRanges();
				selection.addRange(range);
				event.stopPropagation();
				event.preventDefault();
				if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
					//debugger;
						CKEDITOR.currentInstance.fire("saveSnapshot");
				}
		}
		
	},
	cleanFragment: function (fragment) {
		console.log(""+fragment.firstChild)
		return fragment
	},
	postPaste: function (event,range) {
		console.log(""+range)
	},
	pasteHandler: function (event) {
		var selection = event.target.ownerDocument.getSelection();
		var range = selection.getRangeAt(0);
		setTimeout(this.postPaste.bind(this,event,range))
		

	},
	preventEntityEditing: function () {
		var tokens = this.editableElement.querySelectorAll("token:not([contenteditable]),translation:not([contenteditable]), conditional:not([contenteditable]):not(.user)");
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
		//this.fixOrphanedTranslations()
		//this.fixOrphanedConditionals()
		//this.fixOrphanedTokens();
		//this.fixPartialConditionals()
		
	},
	fixOrphanedTranslations: function () {
		var orphans = this.editableElement.querySelectorAll("*:not(translation) > span.args.translation");
		for (var i=0;i<orphans.length;i++) {

			var currentNode = orphans[i]
			var key = currentNode.getAttribute("data-key-name");
			var node = this.editableDocument.createElement("translation");
			node.setAttribute("data-key-name",key);
			currentNode.parentNode.replaceChild(node,currentNode)
			node.appendChild(currentNode)
			currentNode = node.nextSibling;
			while (currentNode && currentNode.className != "translation end") {
				node.appendChild(currentNode)
				currentNode = node.nextSibling
			}
			node.appendChild(currentNode)
			node.parentNode.insertBefore(this.editableDocument.createTextNode(" "),node.nextSibling)
		}
		
	},
	fixOrphanedConditionals: function () {
		var orphans = this.editableElement.querySelectorAll("*:not(conditional) > span.args.conditional");
		for (var i=0;i<orphans.length;i++) {

			var currentNode = orphans[i]
			var key = currentNode.getAttribute("data-conditional-name");
			var node = this.editableDocument.createElement("conditional");
			node.setAttribute("data-conditional-name",key);
			currentNode.parentNode.replaceChild(node,currentNode)
			node.appendChild(currentNode)
			currentNode = node.nextSibling;
			while (currentNode && currentNode.className != "conditional end") {
				currentNode.removeAttribute("style");
				currentNode.removeAttribute("data-key-name");//purge any translation keys
				node.appendChild(currentNode);
				if (currentNode.className == "conditional end") {
					break;
				}
				currentNode = node.nextSibling
			}
			node.appendChild(currentNode);
			node.parentNode.insertBefore(this.editableDocument.createTextNode(" "),node.nextSibling)
		}
	},
	fixOrphanedTokens: function () {
		var orphans = this.editableElement.querySelectorAll("*:not(token) > span.args.token");
		for (var i=0;i<orphans.length;i++) {
			var currentNode = orphans[i]
			var key = currentNode.getAttribute("data-token-name");
			var node = this.editableDocument.createElement("token");
			node.setAttribute("data-token-name",key);
			currentNode.parentNode.replaceChild(node,currentNode)
			node.appendChild(currentNode)
			currentNode = node.nextSibling;
			while (currentNode && currentNode.className != "token end") {
				currentNode.removeAttribute("style");
				currentNode.removeAttribute("data-key-name");//purge any translation keys
				node.appendChild(currentNode);
				currentNode = node.nextSibling
			}
			node.appendChild(currentNode);
			node.parentNode.insertBefore(this.editableDocument.createTextNode(" "),node.nextSibling)
		}
	},
	fixPartialConditionals: function () {
		return
		var partials = this.editableElement.querySelectorAll("conditional.user > span.contents:first-child")
		for (var i=0;i<partials.length;i++) {
			var range = this.editableDocument.createRange()
			range.selectNodeContents(partials[i]);
			console.log(range.extractContents())
			
			//partials[i].parentNode.parentNode.replaceChild(partials[i],range.extractContents())
		}

	}


}
function SelectionManager(element) {
	this.element = element;
	//adds handler directly!!!!
	element.ondblclick = this.doubleClickHandler.bind(this);
}

SelectionManager.prototype = {
	isSelectableElement: function (element) {
		return /^(placeholder|segment|key)$/.test(element.className)
	},
	doubleClickHandler: function (ev) {
		ev = ev || event;
		var currentNode = ev.target;
		while (currentNode!=null && currentNode!=this.element) {
			if (this.isSelectableElement(currentNode)) {
				return this.selectNode(currentNode)
			}
			currentNode = currentNode.parentNode;
		}
		ev.preventDefault && ev.preventDefault();
		ev.returnValue = false;
	},
	selectNode: function (node) {
			var selection = window.getSelection();
			var range = document.createRange()
			selection.removeAllRanges();
			node.contentEditable = true;
			range.selectNode(node);
			selection.addRange(range)
			node.contentEditable = false;
	}
}




	

function PasteManager(element,keyNodeStore,placeholderStore) {
	this.element = element;
	this.keyNodeStore = keyNodeStore;
	this.placeholderStore = placeholderStore;
	document.onpaste = this.pasteHandler.bind(this);
}
PasteManager.prototype = {
	storeTextPosition: function () {
		var range = document.getSelection().getRangeAt(0);;
		if (range.endContainer.nodeType == 3) {
			this.textPosition = range;
			this.textNode = range.endContainer;
		}
		else {
			this.textPosition = this.textNode = this.dummy =  null
		}
	},
	restoreCaret: function () {
		console.log(this.storedCaretRange)
	},
	pasteHandler: function () {
		this.storeTextPosition();
		var elements = this.element.getElementsByTagName("*");
		for (var i=0;i<elements.length;i++) {
			elements[i].preexists = {};
		}
		setTimeout(this.postPasteHandler.bind(this))
	},
	postPasteHandler: function () {
		if (this.textNode) {

			this.textNode.splitText(this.textPosition.endOffset)
			
			var dummy = document.createElement("b");
			dummy.id = "nonsense"
			this.textNode.parentNode.replaceChild(dummy,this.textNode)
			dummy.appendChild(this.textNode)
			dummy.preexists = {};
			this.dummy = dummy;
		}
		var elements = this.element.querySelectorAll("*");
		for (var i=0;i<elements.length;i++) {
			if (!elements[i].preexists) {
				this.stripData(elements[i]);
			} else {
				elements[i].preexists = null;
			}
		}
		var childNodes = this.element.childNodes;
		for (var i=0;i<childNodes.length;i++) {
			if (childNodes[i].nodeType == 3) {
				this.parseRawText(childNodes[i])
			}
		}

	},
	parseRawText: function (textNode) {
		var trimmedText = textNode.data.trim();
			if (this.keyNodeStore.hasEntity(trimmedText)) {
				newNode = this.keyNodeStore.getEntityNode(trimmedText);
				textNode.parentNode.replaceChild(newNode,textNode);
			} else if (this.placeholderStore.hasEntity(trimmedText)) {
				newNode = this.placeholderStore.getEntityNode(trimmedText);
				textNode.parentNode.replaceChild(newNode,textNode);
			}
	},
	stripData: function (element) {
		var text = document.createTextNode(element.innerText),
		parentNode = element.parentNode;
		if (parentNode) {
			parentNode.replaceChild(text,element);
			parentNode.normalize();
			parentNode.innerHTML = parentNode.innerHTML.replace(/(&nbsp;)+/g," ");
		}
		this.convertRawTextToHtml(element);
	},
	convertRawTextToHtml: function (element) {
		var textNodes = this.getAllTextNodes(this.element),
			newNode;

		for (var i=0, trimmedText, textNode ;i<textNodes.length;i++) {
			this.parseRawText(textNodes[i]);
		}
		if (this.dummy) {
			var dummy = document.getElementById("nonsense");
			dummy.parentNode.replaceChild(dummy.childNodes[0],dummy);
			this.dummy = null;
		}
		if (newNode) {
			this.insertCaretAfter(newNode);
		}
	},
	insertCaretAfter: function (node) {
		var range = document.createRange();
		range.setStartAfter(node);
		var selection = document.getSelection();
		selection.removeAllRanges()
		selection.addRange(range);
	},
	getAllTextNodes: function (element) {
		 var allElements = [];
		  for (element=element.firstChild;element;element=element.nextSibling){
		    if (element.nodeType==3) allElements[allElements.length] = element;
		    else allElements = allElements.concat(this.getAllTextNodes(allElements));
		  }
		  return allElements;
	}


}
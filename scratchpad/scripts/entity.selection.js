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


function KeyNodeStore() {
	this.templatableNodes = {};
}
KeyNodeStore.prototype =  {
	addKey: function (key,id) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			this.templatableNodes[key] = this.createTemplatableNodeFromKey(key,id) 
		}
		return this.templatableNodes[key];
	},
	hasKey: function (key) {
		return key in this.templatableNodes;
	},
	createTemplatableNodeFromKey: function (key,id) {
		var keyName = "key"+id;
		var node = document.createElement("div");
		node.setAttribute("data-key-name",keyName);
		node.className ="key"
		node.contentEditable = false;
		node.innerHTML = this.parseTextMarkup(key);
		var spans = node.querySelectorAll("span.segment");
		for (var i=0;i<spans.length;i++) {
			spans[i].setAttribute("data-key-name",keyName);
			spans[i].setAttribute("data-segment-name",keyName+"-segment"+(i+1))
		}
		return node;
	},
	parseTextMarkup: function (string) {
		return string
			.replace(/</g,'\x02&lt;')
			.replace(/>/g,'&gt;\x03')
			.replace(/\[/g,'<span class="segment" contenteditable="false">[')
			.replace(/\]/g,']</span>')
			.replace(/\x02/g,'<span class="placeholder" contenteditable="false">')
			.replace(/\x03/g,"</span>");


	},
	getKeyNode: function (key) {
		var clonedNode = this.templatableNodes[key].cloneNode(true);
		return clonedNode;
	}

}
	

function PasteManager(element,keyNodeStore) {
	this.element = element;
	this.keyNodeStore = keyNodeStore;
	document.onpaste = this.pasteHandler.bind(this);
}
PasteManager.prototype = {
	pasteHandler: function () {
		var elements = this.element.getElementsByTagName("*");
		for (var i=0;i<elements.length;i++) {
			elements[i].preexists = {};
		}
		setTimeout(this.postPasteHandler.bind(this))
	},
	postPasteHandler: function () {
		var elements = this.element.querySelectorAll("*")
		for (var i=0;i<elements.length;i++) {
			if (!elements[i].preexists) {
				this.stripData(elements[i]);
			} else {
				elements[i].preexists = null;
			}
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
		var textNodes = this.getAllTextNodes(this.element);
		for (var i=0, trimmedText ;i<textNodes.length;i++) {
			trimmedText = textNodes[i].data.trim()
			if (this.keyNodeStore.hasKey(trimmedText)) {
				textNodes[i].parentNode.replaceChild(this.keyNodeStore.getKeyNode(trimmedText),textNodes[i]);
			} else {
				var html = parseSegments(textNodes[i].data);//garbage
				if (html!=textNodes[i].data) {
					var wrapper = document.createElement("span")
					wrapper.className = "wrapper";
					wrapper.contentEditable = true;
					wrapper.innerHTML = parseSegments(textNodes[i].data)
					textNodes[i].parentNode.replaceChild(wrapper,textNodes[i])
				}
			}
		}
	},
	getAllTextNodes: function (element) {
		 var allElements = [];
		  for (element=element.firstChild;element;element=element.nextSibling){
		    if (element.nodeType==3) allElements[allElements.length] = element;
		    else allElements = allElements.concat(this.getAllTextNodes(allElements));
		  }
		  return allElements;
	},
	reinsertCaret: function () {

	}


}
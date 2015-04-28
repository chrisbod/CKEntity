function SelectionManager(element) {
	this.element = element;
	//adds handler directly!!!!
	element.ondblclick = this.doubleClickHandler.bind(this);
}

SelectionManager.prototype = {
	isSelectableElement: function (element) {
		return /\b(placeholder|segment|key)\b/.test(element.className)
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
			var origState = node.contentEditable;
			node.contentEditable = true;
			range.selectNode(node)
			selection.addRange(range)
			node.contentEditable = origState;

	}
}


function EntityStore() {
	this.templatableNodes = {};
	this.keys = [];
}
EntityStore.prototype =  {
	addEntity: function (key,id) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			this.templatableNodes[key] = this.createTemplatableNodeFromEntity(key,id)
			this.keys.push({key:key,id:id})
			this.keys.sort(function(a, b){
    if(a.key < b.key) return -1;
    if(a.key > b.key) return 1;
    return 0;
})
		}
		return this.templatableNodes[key];
	},
	hasEntity: function (key) {
		return key in this.templatableNodes;
	},
	createTemplatableNodeFromEntity: function (key,id) {
		throw new Error("Not implemented")
	},
	parseTextMarkup: function (string) {
		return string
			.replace(/</g,'\x02&lt;')
			.replace(/>/g,'&gt;\x03')
			.replace(/\[/g,'<span class="segment" contenteditable="false" data-generated><span class="toggle" data-generated>-</span>[')
			.replace(/\]/g,']</span>')
			.replace(/\x02/g,'<span class="placeholder" contenteditable="false" data-generated>')
			.replace(/\x03/g,"</span>");


	},
	getEntityNode: function (key) {
		var clonedNode = this.templatableNodes[key].cloneNode(true);
		//clonedNode.onkeydown = this.keydownHandler;
		return clonedNode;
	},
	generateSelect: function () {
		var select = document.createElement("select");
		//select.add(new Option("choose placeholder"))
		select.contentEditable = false;
		for (var i=0;i<this.keys.length;i++) {
			var key = this.keys[i];
			select.add(new Option(key.key))
		}
		return select;
	}

}

function KeyNodeStore() {
	this.templatableNodes = {};
}
KeyNodeStore.prototype =  new EntityStore()
KeyNodeStore.prototype.templatableNodes = null;
KeyNodeStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var keyName = "key"+id;
	var node = document.createElement("div");
	node.setAttribute("data-key-name",keyName);
	node.className ="key"
	node.contentEditable = false;
	node.innerHTML = this.parseTextMarkup(key);
	var spans = node.querySelectorAll("span.segment, span.toggle");
	for (var i=0;i<spans.length;i++) {
		spans[i].setAttribute("data-key-name",keyName);
		spans[i].setAttribute("data-segment-name",keyName+"-segment"+(i+1))
	}
	return node;
}

function PlaceholderStore() {
	this.templatableNodes = {};
}
PlaceholderStore.prototype =  new EntityStore()
PlaceholderStore.prototype.templatableNodes = null;
PlaceholderStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var node = document.createElement("span")
	node.contentEditable = false;
	node.className ="placeholder"
	node.setAttribute("data-placeholder-id",id)
	node.innerText = key;
	return node;
}

	

function PasteManager(element,keyNodeStore,placeholderStore) {
	this.element = element;
	this.keyNodeStore = keyNodeStore;
	this.placeholderStore = placeholderStore;
	document.onpaste = this.pasteHandler.bind(this);
	this.caretManager = new CaretManager()
}
PasteManager.prototype = {
	elementIsPastable: function (element) {
		while (element && element != this.element) {
			if (element.getAttribute) {
				var att = element.getAttribute("contentEditable");
				if (att && att == "false") {
					return false;
				}
			}
			element = element.parentNode;
		}
		return true
	},
	storeTextPosition: function () {
		var range = document.getSelection().getRangeAt(0);
		if (range.endContainer.nodeType == 3) {
			this.textPosition = range;
			this.textNode = range.endContainer;
		}
		else {
			this.textPosition = this.textNode = this.dummy =  null;
		}
	},
	restoreCaret: function () {
		console.log(this.storedCaretRange)
	},
	walk: function (element) {
		  for (element=element.firstChild;element;element=element.nextSibling){
		   element.walked = {};
		   this.walk(element)
		  }
	},
	pasteHandler: function () {
		this.walk(this.element)
		setTimeout(this.postPaste.bind(this))
	},
	crawlNewNodes: function (element) {
		 var allElements = [];
		  for (element=element.firstChild;element;element=element.nextSibling){
		    if (!element.walked && element.nodeType!=3) {
		    	allElements[allElements.length] = element;
		    }
		    if (element.firstChild) {
		    	allElements = allElements.concat(this.crawlNewNodes(element))
		    }
		    element.walked = null;
		   }
		  return allElements;
	},
	postPaste: function () {
		var newNodes = this.crawlNewNodes(this.element);
		var keys = [], currentKey = {nodes:[]}
		for (var i=0,newNode,attribute;i!=newNodes.length;i++) {
			newNode = newNodes[i];
			if (newNode.parentNode) {
				if (newNode.hasAttribute("data-key-name")) {
					if (newNode.className=="key-start-character") {
					if (currentKey.nodes.length) {
						this.removeKeys(currentKey.nodes)
					}
					currentKey = {
						keyName: newNode.getAttribute("data-key-name"),
						start: newNode,
						nodes: [newNode]
					}
				}
				else if (newNode.className=="key-end-character") {
					 attribute = newNode.getAttribute("data-key-name");
					 if (attribute==currentKey.keyName) {
					 	currentKey.end = newNode;
					 	currentKey.nodes.push(newNode)
					 	this.fixKey(currentKey)
					 } else {
					 	this.removeKeys(currentKey.nodes)
					 }
				} else {

					currentKey.nodes.push(newNode)
				}
				} else {
					if (!newNode.getAttribute("data-generated")) {//imported crap
						var text = newNode.innerText;
						if (this.keyNodeStore.hasEntity(text)) {
							newNode.parentNode.replaceChild(this.keyNodeStore.getEntityNode(text),newNode)
						}
						

					}
				}
			}
		}
		var newTextNodes = this.get
	},
	removeKeys: function (elements) {
		for (var i=0,element;i<elements.length;i++) {
			element = elements[i];
			if (element.className=="key-end-character"||element.className=="key-start-character") {
				element.parentNode.replaceChild(element.firstChild,element)
			} else {
				if (element.className == "segment") {
					element.removeAttribute("contenteditable")
				}
				element.removeAttribute("data-key-name");
				element.removeAttribute("data-segment-name");
			}
		}

	},
	fixKey: function (keyDetails) {
		var range = document.createRange();
		range.setStartBefore(keyDetails.start)
		range.setEndAfter(keyDetails.end)
		var container = document.createElement("div");
		container.className = "key"
		container.contentEditable = false;
		container.setAttribute("data-key-name",keyDetails.keyName)
		range.surroundContents(container);
	},
	parseRawText: function (textNode) {
		var trimmedText = textNode.data.trim();
		var newNode;
			if (this.keyNodeStore.hasEntity(trimmedText)) {
				newNode = this.keyNodeStore.getEntityNode(trimmedText);
				textNode.parentNode.replaceChild(newNode,textNode);
			} else if (this.placeholderStore.hasEntity(trimmedText)) {
				newNode = this.placeholderStore.getEntityNode(trimmedText);
				textNode.parentNode.replaceChild(newNode,textNode);
			}
			this.caretManager.insertCaretAfter(newNode);
			if (this.dummy) {
				var dummy = document.getElementById("nonsense");
				dummy.parentNode.replaceChild(dummy.childNodes[0],dummy);
				this.dummy = this.textNode  = null;
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
			this.textNode = null;
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
		    else allElements = allElements.concat(this.getAllTextNodes(element));
		  }
		  return allElements;
	}
}


function CaretManager() {

}
CaretManager.prototype = {
	insertCaretAfter: function (node) {
		if (node) {
			var range = document.createRange();
			range.setEndAfter(node);
			range.setStartAfter(node);
			var selection = document.getSelection();
			selection.removeAllRanges()
			selection.addRange(range);
			node.parentNode.insertBefore(document.createTextNode(""),node.nextSibling)

		}
	}
}

function InputTracker(element,placeholderStore) {
	this.element = element;
	this.placeholderStore = placeholderStore;
	var currentSuggest = null;
	var caretManager = new CaretManager();
	this.element.onclick = function (ev) {
		ev = ev||event;
		if (ev.target.hasAttribute("data-collapsed")) {
			ev.target.removeAttribute("data-collapsed")
		} else {
			if (ev.target.className == "toggle") {
				ev.target.parentNode.setAttribute("data-collapsed","")
			}
		}
	}
	this.element.onkeydown = function (ev) {
		if (ev.keyCode == 8) {
			var baseNode = document.getSelection().baseNode;
			if (!EditorTools.elementIsEditable(baseNode)) {
				if (EditorTools.elementIsSelection(baseNode)) {
					 document.getSelection().getRangeAt(0).deleteContents()
				}
				ev.preventDefault()
				
			}
		}
	}
	this.element.onkeyup = function (ev) {
		if (ev.keyCode == 190) {
			var text = document.getSelection().baseNode;
			var indexOfOpener = text.data.lastIndexOf('<');
			if (indexOfOpener!=-1) {
				text.splitText(indexOfOpener)
				var entity = text.nextSibling.data;
				if (placeholderStore.hasEntity(entity)) {
					var entityNode = placeholderStore.getEntityNode(entity)
					text.parentNode.replaceChild(entityNode, text.nextSibling);
					caretManager.insertCaretAfter(entityNode)
				}
			}
		}
		if (ev.keyCode == 221) {
			var text = document.getSelection().baseNode;
			var indexOfOpener = text.data.lastIndexOf('[');
			if (indexOfOpener!=-1) {
				text.splitText(indexOfOpener)
				var entity = text.nextSibling.data;
				//if (placeholderStore.hasEntity(entity)) {
					var segmentNode = document.createElement("span");
					segmentNode.className = "segment";
					var containedText = text.nextSibling;
					text.parentNode.replaceChild(segmentNode, containedText);
					segmentNode.appendChild(containedText)
					//segmentNode.parent
					caretManager.insertCaretAfter(segmentNode);
				}
			}
		} 
}

var EditorTools = {
	elementIsEditable: function (element) {
		while (element && element != this.element) {
			if (element.getAttribute) {
				var att = element.getAttribute("contentEditable");
				if (att && att == "false") {
					return false;
				}
			}
			element = element.parentNode;
		}
		return true
	},
	elementIsSelection: function (element) {
		var range = document.createRange();
		range.selectNode(element)
		var selectionRange = document.getSelection().getRangeAt(0);
		if (range.compareBoundaryPoints(1,selectionRange) == 1) {
			return true;
		}
		return false;
	}


}


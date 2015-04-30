
function AutoSuggestContainer(id, tokenizer) {
	this.element = document.createElement("div")
	this.element.className = "autosuggest-container";
	this.element.id = id;
	this.element.addEventListener("click", this);
	this.element.addEventListener("mouseover", this);
	this.element.addEventListener("keydown",this);
	this.tokenizer = tokenizer;
}

AutoSuggestContainer.prototype = {
	visibleCount: 0,
	moveTo: function (x,y) {
		this.element.style.left = x+"px";
		this.element.style.top = y+"px";
		this.configureMetrics();
	},
	moveToElement: function (element) {
		if (this.inputElement) {
			this.inputElement.removeEventListener("keydown",this);
		}
		var rect =element.getBoundingClientRect();
		this.moveTo(rect.left,rect.top+rect.height);
		this.configureMetrics();
		this.inputElement = element;
		
	},
	setInputElement: function (inputElement) {
		if (this.inputElement) {
			this.inputElement.removeEventListener("input",this)
		}
		this.inputElement = inputElement;
		inputElement.addEventListener("focus",this)
		inputElement.addEventListener("input",this)
	},
	setEditableElement:function (editableElement) {
		if (this.editableElement) {
			this.editableElement.removeEventListener("onkeydown",this)
		}
		this.editableElement = editableElement;
		this.editableElement.addEventListener("keydown", this);
		this.editableElement.addEventListener("keyup", this);
	},
	moveToCursorBottomLeft: function (cursorContainer) {
		var selection = cursorContainer.document.getSelection().getRangeAt(0)
		var range = selection.cloneRange()
		range.collapse();
		var rect = range.getClientRects()
		rect = rect[rect.length-1]
		this.moveTo(rect.left,rect.bottom);
		this.configureMetrics();
	},
	moveToRange: function (range) {
		var rect = range.getClientRects();
		rect = rect[rect.length-1]
		this.moveTo(rect.left,rect.bottom);
	},
	hide: function () {
		this.firstOption = null;
		this.element.style.visibility = "";
		if (this.focussedElement) {
			this.focussedElement.className = "";
		}
		this.visible = false;
		if (this.inputElement) {
			this.inputElement.removeEventListener("keydown",this)
		}
	},
	show: function () {
		if (this.element.childNodes.length) {
			if (!this.focussedElement || !this.focussedElement.parentNode) {
				this.focusAnchor(this.element.firstChild)
			}
			this.element.style.visibility = "visible";
			this.visible = true;
			if (this.inputElement) {
				this.inputElement.addEventListener("keydown",this)
				this.inputElement.addEventListener("input",this)
			}
			
		} else {
			this.visible = false;
			if (this.inputElement) {
				this.inputElement.removeEventListener("keydown",this)
				this.inputElement.removeEventListener("input",this)
			}
		}
		this.configureMetrics()
	},
	build: function (store) {
		this.store = store;
		this.element.innerHTML = "";
		var data = store.allNodes;
		var html = {}
		for (var i=0;i<data.length;i++) {
			var a = document.createElement("a")
			a.href = "javascript:;"
			a.id = data[i].id;
			a.innerText = data[i].def;
			html[a.id] = a;
			this.tokenizer.tokenize(data[i])
		}
		this.nodes = html;
		document.body.appendChild(this.element);
		this.configureMetrics()
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event)
	},
	clickHandler: function (ev) {
		var p = (ev.target||event.srcElement);
		if (p!=this) {
			this.clicked(p.id,p.innerText,p);
			this.hide()
		}
	},
	focusHandler: function (event) {
		if (event.currentTarget == this.element) {

		} else if (event.currentTarget == this.inputElement) {
			this.moveToElement(this.inputElement);
			this.handleValue(this.inputElement.value)
		}
	},
	inputHandler: function () {
		this.handleValue(this.inputElement.value)
	},
	mouseoverHandler: function (event) {
		if (event.target!=this.element) {
			if (this.focussedElement) {
				this.focussedElement.className = "";
			}
			event.target.className = "focussed";
			this.focussedElement = event.target
		}
	},
	keydownHandler: function (event) {
		switch (event.keyCode) {
			case 40: return this.arrowDown(event);
			case 38: return this.arrowUp(event);
			case 27: return this.hide();
			case 13: return this.enter(event);
		}
	},
	keyupHandler: function (event) {
		switch (event.keyCode) {
			case 40: return;
			case 38: return;
		}
		if (!this.enterClicked) {
			var selection = document.getSelection(),
				range = selection.getRangeAt(0),
				node = range.endContainer,
				duplicateRange = range.cloneRange(),
				index;
			duplicateRange.selectNodeContents(node);
			var sentence = this.getLastSentenceFromRange(duplicateRange);
			
			if (sentence) {
				if (this.tokenizer.isTrigger(sentence)) {
					console.log('trigger')
					duplicateRange.endContainer.normalize();
					node = duplicateRange.endContainer.lastChild;
					if (node == null) {
						node = duplicateRange.endContainer;
					}
					if (node.data) {
						index = node.data.length-sentence.length
						duplicateRange.setStart(node,index);
						node.splitText(index)
					} else {
						return;
					}
					
					this.moveToRange(duplicateRange)
					var suggestions = this.tokenizer.getSuggestions(sentence);
					if (suggestions.length == 1) {
						if (suggestions[0].def.trim() == sentence.trim()) {
							suggestions = [];
						}
					}
					this.showByKeys(suggestions);
					if (suggestions.length) {
						event.stopPropagation()
					}


				} else {
					this.hide()
				}
			} else {
				this.hide()
			}
	}
		this.enterClicked = false;
	},
	getLastSentenceFromRange: function (range) {
		var text = ""+range;
		var sentences = text.split(/\.\s+(?=[A-Z])/)
		if (sentences) {
			var lastSentence = sentences[sentences.length-1];
			return lastSentence;
		}
		return "";
	},
	getCurrentNode: function (range) {
		
		var node = range.commonAncestorContainer;
		
		while (node && node.tagName != "DIV" && node.tagName != "P" && node.tagName != "TRANSLATION" && node.tagName != "TOKEN" && node.tagName != "CONDITIONAL") {
			node = node.parentNode;
		}
		return node;
	},
	focusAnchor: function (anchor) {
		if (this.focussedElement) {
			this.focussedElement.className = "";
		}
		if (anchor) {
			anchor.className = "focussed";
			anchor.scrollIntoView()
		}
		this.focussedElement = anchor;
	},
	focusNextAnchor: function (currentAnchor) {
		var nextSibling = currentAnchor.nextSibling;
		if (nextSibling) {
			this.focusAnchor(nextSibling)
			return true
		}
		return false;
	},
	focusPreviousAnchor: function (currentAnchor) {
		var previousSibling = currentAnchor.previousSibling;
		if (previousSibling) {
				this.focusAnchor(previousSibling)
				return true
			}
		return false
	},
	arrowDown: function (event) {
		if (this.visible) {
			var srcElement = this.inputElement||this.editableElement;
			event.stopPropagation();
			event.preventDefault();
			var anchor = this.focusNextAnchor(this.focussedElement)
			if (!anchor) {
				this.focusAnchor(this.firstOption)
			} 
		}
	},
	arrowUp: function () {
		if (this.visible) {
			var srcElement = this.inputElement||this.editableElement;
			event.stopPropagation();
			event.preventDefault();
			var anchor = this.focusPreviousAnchor(this.focussedElement)
			if (!anchor) {
				this.focusAnchor(this.element.lastChild)
			} 
		}
	},
	enter: function (event) {
		if (this.visible && this.focussedElement) {
			this.clicked(this.focussedElement.id,this.focussedElement.innerText,this.focussedElement);
			this.hide();
			event.stopPropagation();
			event.preventDefault();
			this.enterClicked = true;
		}
	},
	clicked: function (id,text,element) {
		var selection = document.getSelection()
			range = selection.getRangeAt(0),
			newNode = this.store.getEntityNode(text);//document.createTextNode(text);
		if (this.editableElement == range.commonAncestorContainer || this.editableElement.contains(range.commonAncestorContainer)) {
			range.insertNode(newNode);
			newNode.previousSibling.parentNode.removeChild(newNode.previousSibling);
			selection.removeAllRanges()
			selection.addRange(range);
			selection.collapseToEnd();
			newNode.parentNode.normalize();
			var cursor = document.createTextNode("\u00A0");
			newNode.parentNode.insertBefore(cursor,newNode.nextSibling)
			range.selectNode(newNode);
			selection.removeAllRanges();
			selection.addRange(range);
			selection.collapseToEnd()


		}
	},
	configureMetrics: function () {
		this.element.style.bottom = "";
		var viewRect = document.querySelector("html").getBoundingClientRect();
		var currentElementRect = this.element.getBoundingClientRect();
		var viewBottom = Math.max(viewRect.bottom,window.innerHeight);
		var elementBottom = currentElementRect.bottom;
		if (elementBottom>viewBottom) {
			this.element.style.bottom = "0px"
		}

	},
	showByIds: function (idsArray) {
		this.element.innerHTML = "";
		for (var i=0;i!=idsArray.length;i++) {
			this.element.appendChild(this.nodes[idsArray[i]])
		}
		this.firstOption = this.element.firstChild;
		if (this.focussedElement) {
			this.focussedElement.className = "";
		}
		this.focussedElement = null;
		if (this.firstOption == null) {
			this.hide();//force a hide?
		} else {
			this.show();
		}
	},
	showByKeys: function (keysArray) {
		var ids = []
		for (var i=0;i!=keysArray.length;i++) {
			ids[ids.length] = keysArray[i].id
		}
		this.showByIds(ids)
	},
	handleValue: function (value) {
		value = value.trim();
		if (!value) {
			this.hide();
		}
		var split = value.split(" ");
		if (split.length == 1) {
			this.hide();
		} else {
			var suggestions = this.tokenizer.getSuggestions(value);
			if (suggestions.length == 1 && suggestions[0].def == value) {
				suggestions = []
			}
			this.showByKeys(suggestions);
		}

	}
}


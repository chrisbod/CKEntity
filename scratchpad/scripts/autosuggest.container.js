
function AutoSuggestContainer(id, tokenizer) {
	this.element = document.createElement("div")
	this.element.className = "autosuggest-container";
	this.element.id = id;
	this.element.addEventListener("click", this, true);
	this.element.addEventListener("mouseover", this);
	this.element.addEventListener("keydown",this, true);
	this.tokenizer = tokenizer;
}

(function (extend) {
	var proto = AutoSuggestContainer.prototype = new PositionableContainer();
	for (var i in extend) {
		proto[i] = extend[i]
	}
})(
{
	visibleCount: 0,

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
		this.editableElement.addEventListener("keydown", this, true);
		this.editableElement.addEventListener("keyup", this, true);
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
			window.addEventListener("keydown",this,true);
			this.visible = true;
			if (this.inputElement) {
				this.inputElement.addEventListener("keydown",this)
				this.inputElement.addEventListener("input",this)
			}
			
		} else {
			window.removeEventListener("keydown",this,true)
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
			this.hide();
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
		this.rangeToReplace = null;
		switch (event.keyCode) {
			case 40: return;
			case 38: return;
			case 39: return;
			case 37: return;
		}
		if (!this.enterClicked) {
			var selection = document.getSelection(),
				range = selection.getRangeAt(0),
				node = range.endContainer,
				duplicateRange = range.cloneRange(),
				index;
			duplicateRange.selectNodeContents(node);
			var trigger = this.tokenizer.getTrigger(""+duplicateRange);

			if (trigger) {
				duplicateRange.endContainer.normalize();
				node = duplicateRange.endContainer.lastChild;
				if (node == null) {
					node = duplicateRange.endContainer;
				}
				if (node.data) {
					this.trigger = trigger;
					
				} else {
					return;
				}
				
				this.moveToRange(duplicateRange)
				var suggestions = this.tokenizer.getSuggestions(trigger);
				if (suggestions.length == 1) {
					if (suggestions[0].def.trim() == trigger.trim()) {
						this.clicked(suggestions[0].id,suggestions[0].def)
						event.stopPropagation()
						return
					}


				}
				this.showByKeys(suggestions);
				if (suggestions.length) {
					event.stopPropagation()
				}


			} else {
				this.hide();
				event.stopPropagation();
				event.preventDefault();
			}
		} else {
			//.stopPropagation();
			//event.preventDefault();
		}
		this.enterClicked = false;
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
	clicked: function (id,text) {
		var selection = document.getSelection()
			range = selection.getRangeAt(0),
			newNode = this.store.getEntityNode(text);//document.createTextNode(text);
		if (this.editableElement == range.commonAncestorContainer || this.editableElement.contains(range.commonAncestorContainer)) {
			range.insertNode(newNode);
			var endText = new RegExp(this.trigger+"\\s*$");
			newNode.previousSibling.data = newNode.previousSibling.data.replace(endText,'');
			var cursor = document.createTextNode(" ");
			newNode.parentNode.insertBefore(cursor,newNode.nextSibling)
			range.selectNode(cursor);
			selection.removeAllRanges();
			selection.addRange(range);
			selection.collapseToStart();
		}
	},
	cleanEndNodes: function (node) {
		while (node && node.nextSibling) {
			if (node.nextSibling.nodeType == 3) {
				if (node.nextSibling.data.indexOf("\u200b")!=-1) {
					node.nextSibling.data = node.nextSibling.data.replace(/\u200b/g,'');
					if (!node.previousSibling.data.length) {
						node.parentNode.removeChild(node.previousSibling)
					}
				}
			}
			node = node.nextSibling;
		}
	},
	cleanStartNodes: function (node) {
		while (node && node.previousSibling) {
			if (node.previousSibling.nodeType == 3) {
				if (node.previousSibling.data.indexOf("\u200b")!=-1) {
					node.previousSibling.data = node.previousSibling.data.replace(/\u200b/g,'');
					if (!node.previousSibling.data.length) {
						node.parentNode.removeChild(node.previousSibling)
					}
				}
			}
			node = node.previousSibling;
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
});



function AutoSuggestContainer(id, tokenizer) {
	this.element = document.createElement("div")
	this.element.className = "autosuggest-container";
	this.element.id = id;
	this.element.addEventListener("click", this, true);
	this.element.addEventListener("mouseover", this);
	this.element.addEventListener("keydown",this, true);
	this.selectionTracker = SelectionTracker.getInstance();

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
			this.editableElement.removeEventListener("keydown",this)
			this.editableElement.removeEventListener("keyup",this)
		}
		this.editableElement = editableElement;
		this.editableElement.addEventListener("keydown", this, true);
		this.editableElement.addEventListener("keyup", this, true);
		this.editableDocument = editableElement.ownerDocument;
		this.editableDocument.addEventListener("keydown",this,true);
		this.editableDocument.addEventListener("scroll",this,true)
		this.scrollTop = this.editableDocument.body.scrollTop
		this.scrollLeft = this.editableDocument.body.scrollLeft

	},
	
	hide: function () {
		//console.log(arguments.callee.caller)
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
			//this.editableDocument.defaultView.frameElement.removeEventListener("keydown",this,true)
			this.visible = false;
			if (this.inputElement) {
				this.inputElement.removeEventListener("keydown",this)
				this.inputElement.removeEventListener("input",this)
			}
		}
		this.configureMetrics()
	},
	build: function (store,tokenizer) {
		this.store = store;
		this.tokenizer = tokenizer;
		this.element.innerHTML = "";
		var data = store.allNodes;
		var html = {}
		for (var i=0;i<data.length;i++) {
			var a = document.createElement("a")
			a.href = "javascript:;"
			a.id = data[i].id;
			a.innerText = data[i].text||data[i].def;
			html[a.id] = a;
			tokenizer.tokenize(data[i])
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
			this.clicked(p);
			this.hide();
		}
	},
	scrollHandler: function (event) {
		//this.scrollBy(this.editableDocument.body.scrollTop,this.editableDocument.body.scrollLeft)
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
		if (event.target.ownerDocument == this.editableDocument) {
			if (event.keyCode == 13) {
				return this.enter(event);
			} 

		}
		
		
		switch (event.keyCode) {
			case 40: return this.arrowDown(event);
			case 38: return this.arrowUp(event);
			default: {
				return this.hide();
			}

			
		}
	},
	keyupHandler: function (event) {
		switch (event.keyCode) {
			case 16: case 40: case 38: case 39: case 37: return;//breakout for (some) irrelevant keys
		}
		if (this.enterClicked) {//bail out if we're inserting something
			this.enterClicked = false;
			return;
		}
		var selection = this.editableDocument.getSelection(),
			range = document.createRange(),
			triggers,
			node,
			suggestions,
			startingRange = this.startingRange,	
			latestRange = selection.getRangeAt(0);

		if (!startingRange) {

			startingRange = this.startingRange = selection.getRangeAt(0);
			var container = startingRange.startContainer,
				offset = startingRange.startOffset
		} 

		if (latestRange.endContainer!=startingRange.endContainer) {
			this.startingRange = null;
			return 
		}

		range.setStart(startingRange.startContainer,0);
		range.setEnd(latestRange.endContainer,latestRange.endOffset);
		triggers = this.tokenizer.getTriggers(""+range,event);
		if (triggers.length) {
			range.endContainer.normalize();
			node = range.endContainer.lastChild || range.endContainer;
			if (node.data) {
				this.triggers = triggers;
				this.currentRange = range
			} else {
				this.triggers = null;
				return;
			}
			range.setStart(node,Math.max(0,node.data.lastIndexOf(triggers[0].trim())))
			this.moveToRange(this.editableDocument,latestRange);
			var suggestions = [];
			for (var i=0;i<triggers.length;i++) {
				suggestions = suggestions.concat(this.tokenizer.getSuggestions(triggers[i]))
			}
			;
			this.showByKeys(suggestions);
			if (suggestions.length) {
				event.stopPropagation();
			}
		} else {
			this.hide();
			event.stopPropagation();
			event.preventDefault();
		}
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
	arrowUp: function (event) {
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
			this.clicked(this.focussedElement);
			this.hide();
			event.stopPropagation();
			event.preventDefault();
			this.enterClicked = true;
		}
	},
	clicked: function (element) {
		var selection = this.editableDocument.getSelection()
			range = selection.getRangeAt(0),
			startNode = range.startContainer
			newNode = this.store.getEntityNode(element.innerText),//document.createTextNode(text);
			offset = range.startOffset

		if (this.editableElement == range.commonAncestorContainer || this.editableElement.contains(range.commonAncestorContainer)) {
			var trigger = element.getAttribute("data-trigger"),
				startData = startNode.data.slice(0,offset);	
			
			var index = startData.lastIndexOf(trigger);
			var node = this.store.getEntityNode(element.innerText)
			this.selectionTracker.insertEntityWrapperAtCursor(node);
			var firstSlice = startData.slice(0,index);
			startNode.data = firstSlice
			this.startingRange = null;
			
		}
	},
	showByIds: function (idsArray) {
		this.element.innerHTML = "";
		var node
		for (var i=0;i!=idsArray.length;i++) {
			node = this.element.appendChild(this.nodes[idsArray[i].suggestion.id])
			node.setAttribute("data-trigger", idsArray[i].trigger)
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
			ids[ids.length] = keysArray[i]
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
			//this.hide();
		} else {
			var suggestions = this.tokenizer.getSuggestions(value);
			this.showByKeys(suggestions);
		}

	},
	configureMetrics: function () {
		var rect = this.element.getBoundingClientRect(),
			viewBottom = window.innerHeight;
		if (rect.bottom>viewBottom) {
			this.element.style.bottom = "0px"
		} else {
			this.element.style.bottom = ""
		}
	},
});


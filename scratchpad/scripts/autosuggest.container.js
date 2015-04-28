
window.AutoSuggestContainer = function AutoSuggestContainer() {
	this.element = document.createElement("div")
	this.element.className = "autosuggest-container";
	this.element.addEventListener("click", this);
	this.element.addEventListener("mouseover", this);
	this.element.addEventListener("keydown",this);
	this.tokenizer = new SuggestTokenizer();
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
	build: function (data) {
		this.element.innerHTML = "";
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
			case 8: return this.keyupDelete(event);
			case 40: return this.arrowDown(event);
			case 38: return this.arrowUp(event);
			case 27: return this.hide();
			case 13: return this.enter(event)
		}
	},
	keyupHandler: function (event) {
		var isDelete = false,
			isFullStop = false;
		switch (event.keyCode) {
			case 8: {
				isDelete = true;
				break;
			}
			case 13: {
				this.returnHit = true;
				return;
			}
			case 190: isFullStop = true; break;
		}

		if (!this.range) {
			var selection = document.getSelection()
			var range = document.getSelection().getRangeAt(0).cloneRange();
			var start =  range.startContainer;
			if (start.nodeType == 3) {
				if (this.returnHit) {
					node = start;
					this.returnHit = false;
				} else {
					node = start.splitText(range.startOffset-1);
				}
				range.selectNodeContents(node);
				this.range = range;
				this.textNode = node;
				this.checkRangeForAutoComplete()
			}
		} else {
			if (!isFullStop) {
				this.range.selectNodeContents(this.textNode);
				var str = this.range.toString();
				if (str.length == 0) {
					this.textNode = null;
					this.range = null
				} else {
					this.checkRangeForAutoComplete()
				}
			} else {
				var node = this.textNode.splitText(this.textNode.data.indexOf(".")+1)
				this.textNode = node;
				this.range.selectNodeContents(node)
				//console.log("["+this.range+"]")
			}
		}
	},
	keyupDelete: function () {
		if (!this.textNode || this.textNode.parentNode == null) {//deleted this typing range or no range to speak of
			this.createCaretRangeFromDelete();
		}
		this.checkRangeForAutoComplete()
	},
	checkRangeForAutoComplete: function () {
		if (this.range) {
			var string = this.range.toString().trim();
			if (this.range && this.lastString !== string) {
				this.lastString = string;
				//var split = string.split(/\s*\.\s+/);
				if (this.tokenizer.isTrigger(string)) {
					this.moveToRange(this.range)
					this.showByKeys(this.tokenizer.getSuggestions(string))
				} else {
					this.hide()
				}
				
			}
		}
	},
	createCaretRangeFromDelete: function () {
		var range = document.getSelection().getRangeAt(0).cloneRange();
		
		if (range.startContainer.nodeType == 3) {
				if (range.toString()=="") {
					range.selectNodeContents(range.startContainer)
					console.log("["+range+"]")
				}
				this.range = range;
				this.textNode = range.startContainer;
		} else {
			//element now empty

			this.range = null;
			this.textNode = null;
		}
	},
	moveCaretAfterNode: function (node) {
		
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
			event.stopPropagation()
			event.preventDefault()
		}
	},
	clicked: function (id,text,element) {
		if (this.inputElement) {
			this.inputElement.value = text;
		} else {
			var node = document.createTextNode(text);
			this.textNode.parentNode.insertBefore(node,this.textNode)
			this.textNode.data = '\u200B'
			this.textNode = node;
			this.range.collapse()
			this.range.selectNodeContents(node);
			
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


function SuggestTokenizer () {
	this.tokens = {};
	this.triggerLetterCodes = {};

}
SuggestTokenizer.prototype.isTrigger = function (text) {
	var split = text.split(" ")
	if (split.length > 1 && this.tokens[split[0]]) {
		return true;
	}
	return false;
}
SuggestTokenizer.prototype.tokenize = function (key) {
	var split = key.def.trim().split(/\W+/),
		currentToken = this.tokens
	for (var i=0,existingToken;i<split.length;i++) {
		existingNode = currentToken[split[i]]
		if (!existingNode) {
			existingNode = {};
		}
		if (currentToken == this.tokens) {
			this.triggerLetterCodes[split[i].charCodeAt(0)] = true;
		}
		currentToken = currentToken[split[i]] = existingNode;

	}
	currentToken._$ = key;
}
SuggestTokenizer.prototype.getSuggestions = function (string) {
	string = string.trim()
	if (string.indexOf(" ")==-1) {
		if (this.tokens[string] && this.tokens[string]._$) {
			return [this.tokens[string]._$];
		} else {
			return [];
		}
	}
	var split = string.trim().split(/\W+/),
		results = [];
	
	function crawl(object) {
		if (split.length) {
			var next = split.shift();
				if (next in object) {
					crawl(object[next])
				} else if (!split.length) {
					complete(object,next)
				}
		} else {
			iterate(object)
		}
	}
	function iterate(object) {
		for (var i in object) {
			if (i == "_$") {
				results.push(object._$)
			} else {
				iterate(object[i])
			}
		}
	}
	function complete(object,string) {
		for (var i in object) {
			if (i.indexOf(string)==0) {
				iterate(object[i])
			}
		}
	}
	crawl(this.tokens,split);
	results.sort(function (a,b) {
		if (a.def>b.def) {
			return -1
		}
		if (a.def<b.def) {
			return 1
		}
		return 0
	})
	return results;	

}
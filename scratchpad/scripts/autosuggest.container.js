
window.AutoSuggestContainer = function AutoSuggestContainer() {
	this.element = document.createElement("div")
	this.element.className = "autosuggest-container";
	this.element.addEventListener("click", this);
	//this.element.addEventListener("focus", this);
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
	moveToCursorTopRight: function (cursorContainer) {
		var selection = cursorContainer.document.getSelection().getRangeAt(0)
		var range = selection.cloneRange()
		range.collapse();
		var rect = range.getClientRects()
		rect = rect[rect.length-1]
		this.moveTo(rect.top,rect.right);
		this.configureMetrics();
	},
	hide: function () {
		this.element.style.visibility = "";
		this.inputElement.removeEventListener("keydown",this)
	},
	show: function () {
		if (this.visibleCount) {
			this.element.style.visibility = "visible";
			this.inputElement.addEventListener("keydown",this)
			this.inputElement.addEventListener("input",this)
		} else {
			this.inputElement.removeEventListener("keydown",this)
			this.inputElement.removeEventListener("input",this)
		}
		this.configureMetrics()
	},
	build: function (data) {
		this.element.innerHTML = "";
		var html = []
		for (var i=0;i<data.length;i++) {
			html[html.length] = '<a href="javascript:;" id="'+data[i].id+'">'+data[i].def.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</a>';
			this.tokenizer.tokenize(data[i])
		}
		this.element.innerHTML = html.join('');
		document.body.appendChild(this.element);
		this.configureMetrics()
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event)
	},
	clickHandler: function (ev) {
		var p = (ev.target||event.srcElement);
		if (p!=this) {
			this.clicked(p.id,p.innerText,p)
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
		console.log("here")
		this.handleValue(this.inputElement.value)
	},
	keydownHandler: function (event) {
		console.log(event.keyCode)
		switch (event.keyCode) {
			case 40: return this.arrowDown(event);
			case 38: return this.arrowUp(event);
			case 27: return this.hide();
		}
	},
	arrowDown: function (event) {
		if (event.currentTarget == this.inputElement) {
			this.firstOption.focus();
			} else {
				var nextSibling = event.target.nextSibling;
				while (nextSibling) {
					if (nextSibling.offsetHeight) {
						this.element.removeEventListener("focus",this);
						nextSibling.focus();
						this.element.addEventListener("focus",this)
						break;
					}
				}
				if (!nextSibling) {
					this.inputElement.focus()
				}
			}
			event.stopPropagation()
			event.preventDefault()
	},
	arrowUp: function () {
		if (event.currentTarget == this.inputElement) {
			} else {
				var previousSibling = event.target.previousSibling;
				while (previousSibling) {
					if (previousSibling.offsetHeight) {
						previousSibling.focus();
						break;
					}
					previousSibling = previousSibling.previousSibling;
				}
				if (!previousSibling) {
					this.inputElement.removeEventListener("focus", this)
					this.inputElement.focus()
					this.inputElement.addEventListener("focus", this)
					
				}
			}
			event.stopPropagation()
			event.preventDefault()
	},
	clicked: function (id,text,element) {
		console.log(text)
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
		var lookup = {},
			visibleCount = 0;
			options = this.element.querySelectorAll("a"),
			i=0,
			firstOption = null;
		for (i=0;i!=idsArray.length;i++) {
			lookup[idsArray[i]] = true;
		}
		this.firstChild = null;
		for (i=options.length-1;i!=-1;i--) {
			if (!(options[i].id in lookup)) {
				options[i].style.display = ''
			} else {
				options[i].style.display = "block";
				firstOption = options[i]
				visibleCount++;
			}
		}
		this.visibleCount = visibleCount;
		if (visibleCount == 0) {
			this.hide();//force a hide?
		} else {
			this.firstOption = firstOption;
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
			this.showByKeys(suggestions)
		}

	}
}


function SuggestTokenizer () {
	this.tokens = {};

}
SuggestTokenizer.prototype.tokenize = function (key) {
	var split = key.def.trim().split(" "),
		currentToken = this.tokens
	for (var i=0,existingToken;i<split.length;i++) {
		existingNode = currentToken[split[i]]
		if (!existingNode) {
			existingNode = {};
		}
		currentToken = currentToken[split[i]] = existingNode
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
	var split = string.trim().split(" "),
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
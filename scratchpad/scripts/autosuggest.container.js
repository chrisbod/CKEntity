window.AutoSuggestContainer = function AutoSuggestContainer() {
	this.element = document.createElement("div")
	this.element.className = "autosuggest-container";
	this.element.onclick = this.clickHandler.bind(this)
}

AutoSuggestContainer.prototype = {
	moveTo: function (x,y) {
		this.element.style.left = x+"px";
		this.element.style.top = y+"px";
		this.configureMetrics();

	},
	moveToElement: function (element) {
		var rect =element.getBoundingClientRect();
		this.moveTo(rect.left,rect.top+rect.height);
		this.configureMetrics();
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
	},
	show: function () {
		this.element.style.visibility = "visible";
	},
	build: function (data) {
		this.element.innerHTML = "";
		var html = []
		for (var i=0;i<data.length;i++) {
			html[html.length] = '<p id="'+data[i].id+'">'+data[i].def.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</p>'
		}
		this.element.innerHTML = html.join('');
		document.body.appendChild(this.element);
		this.configureMetrics()
	},
	clickHandler: function (ev) {
		var p = (ev.target||event.srcElement);
		if (p!=this) {
			this.clicked(p.id,p.innerText,p)
		}
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

	}
}


function SuggestTokenizer () {
	this.tokens = {};

}
SuggestTokenizer.prototype.tokenize = function (string) {
	var split = string.toLowerCase().trim().split(" "),
		currentToken = this.tokens
	for (var i=0,existingNode;i<split.length;i++) {
		existingNode = currentToken[split[i]]
		if (!existingNode) {
			existingNode = {}
		}
		currentToken = currentToken[split[i]] = existingNode
	}
	currentToken._$ = string;
}
SuggestTokenizer.prototype.getSuggestions = function (string) {
	string = string.trim().toLowerCase()
	if (string.indexOf(" ")==-1) {
		if (this.tokens[string] && this.tokens[string]._$) {
			return [this.tokens[string]._$];
		} else {
			return [];
		}
	}
	var split = string.toLowerCase().trim().split(" "),
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
	results.sort()
	return results;	

}
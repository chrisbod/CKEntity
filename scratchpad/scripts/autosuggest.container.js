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
		this.moveTo(rect.top,rect.right);
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
		this.element.style.visibility = "hidden";
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
		var viewRect = document.querySelector("html").getBoundingClientRect();
		var currentElementRect = this.element.getBoundingClientRect()
		

	}
}
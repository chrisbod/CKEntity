function PositionableContainer() {
	
}
PositionableContainer.prototype = {
	visible: false,
	moveTo: function (x,y) {
		if (x > window.innerWidth/2) {
			this.element.style.left = x/2+"px";
		} else {
			this.element.style.left = x+"px";
		}
		this.element.style.top = y+"px";
		this.configureMetrics();
	},
	moveToElement: function (element) {
		var rect = element.getBoundingClientRect();
		
		this.moveTo(rect.left,rect.top+rect.height);
		this.configureMetrics(element);
		this.inputElement = element;
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
	moveToRange: function (ownerDocument,range) {
		var rect = range.getClientRects(),
			frameRect = ownerDocument.defaultView.frameElement.getBoundingClientRect();
		if (rect[0]) {
			this.moveTo(frameRect.left+rect[0].left,frameRect.top+rect[rect.length-1].bottom);
		}
	},
	build: function () {
		this.element = document.createElement("div");
		this.element.className = this.className;
		this.hide();
		document.body.appendChild(this.element)
	},
	hide: function () {
		this.element.style.visibility = "";
		this.visible = false;
	},
	show: function () {
		this.element.style.visibility = "visible";
		this.visible = true;
		this.configureMetrics()
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event)
	},
	setContent: function (elementOrFragment) {
		this.element.innerHTML = "";
		this.element.appendChild(elementOrFragment);
		this.configureMetrics();
	}

}
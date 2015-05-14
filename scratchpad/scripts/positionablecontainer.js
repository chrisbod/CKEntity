function PositionableContainer() {
	
}
PositionableContainer.prototype = {
	visible: false,
	moveTo: function (x,y) {
		this.element.style.left = x+"px";
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
		rect = rect[rect.length-1]
		this.moveTo(frameRect.left+rect.left,frameRect.top+rect.bottom);
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
	configureMetrics: function (elementOrRange) {
		this.element.style.bottom = "";
		
		var viewRect = document.querySelector("html").getBoundingClientRect();
		var currentElementRect = this.element.getBoundingClientRect();
		var viewBottom = Math.min(viewRect.bottom,window.innerHeight);
		var elementBottom = currentElementRect.bottom;
		if (elementBottom>viewBottom) {
			//this.element.style.bottom = "0px"
		}
	},
	setContent: function (elementOrFragment) {
		this.element.innerHTML = "";
		this.element.appendChild(elementOrFragment);
		this.configureMetrics();
	}

}
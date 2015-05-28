function HeaderAndFooterHandler() {
	
}
HeaderAndFooterHandler.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.document = editableElement.ownerDocument;
		this.headerWrapper = this.document.getElementById("header-data");
		if (this.headerWrapper) {
		var headers = this.headerWrapper.getElementsByTagName("header")
		this.subsequentHeaderElement = headers[1];
		this.headerWrapper.addEventListener("click",this,true)
		this.document.addEventListener("click",this,true)
		}
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event);
		
	},
	clickHandler: function (event) {
		if (this.headerWrapper.contains(event.target)) {
			this.subsequentHeaderElement.style.visibility = "visible"
		} else {
			this.subsequentHeaderElement.style.visibility = ""
		}
		
	}
}
function ConditionalCollapser() {
	
}
ConditionalCollapser.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		this.editableElement.addEventListener("click", this, true)
		this.editableElement.addEventListener("dblclick", this, true)
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event)
	},
	clickHandler: function (event) {
		if (event.target.className == "args conditional" && event.target.parentNode.firstChild == event.target) {
			if (event.target.hasAttribute("data-collapsed")) {
				event.target.removeAttribute("data-collapsed")
				event.target.parentNode.removeAttribute("data-collapsed")
				
			} else {

				event.target.parentNode.setAttribute("data-collapsed", "true")
				event.target.setAttribute("data-collapsed", "true")
			}
			event.stopPropagation();
		}
	},
	dblclickHandler: function (event) {
		if (event.target.className == "args conditional" && event.target.parentNode.firstChild == event.target) {
			
			event.stopPropagation();
			event.preventDefault()
		}
	}


}
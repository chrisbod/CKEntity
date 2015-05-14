function ConditionalCollapser() {
	this.entitiesHelper =new EntitiesHelper()
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
			var args = this.entitiesHelper.getDataArguments(event.target.parentNode)
			if (args.hidden) {
				this.entitiesHelper.removeDataArgument(event.target.parentNode,"hidden")
			} else {
				this.entitiesHelper.setDataArgument(event.target.parentNode,"hidden",true)
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
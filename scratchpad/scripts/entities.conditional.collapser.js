function ConditionalCollapser() {
	this.entitiesHelper =new EntitiesHelper()
}
ConditionalCollapser.getInstance = function () {
	if (!this.instance) {
		this.instance = new this()
	}
	return this.instance
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
		if (event.target.className == "args conditional") {
			var args = this.entitiesHelper.getDataArguments(event.target.parentNode)
			if (args.hidden) {
				this.expand(event.target.parentNode.parentNode,"hidden")
			} else {
				this.collapse(event.target.parentNode.parentNode,"hidden")
			}
			event.stopPropagation();
		}
	},
	dblclickHandler: function (event) {
		if (event.target.className == "args conditional") {
			
			event.stopPropagation();
			event.preventDefault()
		}
	},
	collapse: function (entityElement) {
		entityElement.ownerDocument.getSelection().removeAllRanges()
		this.entitiesHelper.setDataArgument(entityElement,"hidden",true)
		
	},
	expand: function (entityElement) {
		entityElement.ownerDocument.getSelection().removeAllRanges()
		this.entitiesHelper.removeDataArgument(entityElement,"hidden")
	}


}
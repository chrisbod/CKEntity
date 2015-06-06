function EntityEvents () {}

EntityEvents.getInstance = function () {
	if (!this.instance) {
		this.instance = new this()
	}
	return this.instance
}


EntityEvents.prototype = {
	init: function (editable) {
		this.element = editable;
		this.document = editable.ownerDocument;
		this.document.addEventListener("keydown",this,true);
		
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event)
	},
	keydownHandler: function (event) {
		var eventType = this.EVENTSLOOKUP[event.keyIdentifier.toUpperCase()]
		if (eventType) {
			console.log(this.EVENTS[eventType+"_DOWN"])
		}

	}
}

EntityEvents.EVENTS = EntityEvents.prototype.EVENTS = {
	SELECT: "entities.select",
	DESELECT: "entities.deselect",
	CLICK: "entities.click",
	KEYDOWN: "entities.keydown",
	KEYUP: "entities.keyup",
	DELETE_DOWN: "entities.delete.down",
	BACKSPACE_DOWN: "entities.backspace.down",
	LEFT_DOWN: "entities.left.down",
	RIGHT_DOWN: "entities.right.down",
	UP_DOWN: "entities.up.down",
	DELETE_UP: "entities.delete.up",
	BACKSPACE_UP: "entities.backspace.up",
	ARROWLEFT_UP: "entities.left.up",
	ARROWRIGHT_UP: "entities.right.up",
	ARROWUP_UP: "entities.up",
	REMOVE: "entities.remove",
	MOUSEDOWN: "entities.mousedown",
	MOUSEUP: "entities.mouseup",
	COPY: "entities.copy",
	CUT: "entities.cut",
	DRAGSTART: "entities.dragstart",
	DRAG: "entities.drag",
	DROP: "entities.drop"

}
EntityEvents.EVENTSLOOKUP = EntityEvents.prototype.EVENTSLOOKUP = {
	"U+0008": "BACKSPACE",
	"U+007F": "DELETE",
	"UP" : "UP"
}

CustomEvent.prototype.blockFromCKEditor = function () {
	this.details.originalEvent.stopPropagation()
}
CustomEvent.prototype.preventOriginalDefault = function () {
	this.details.originalEvent.preventDefault()
	this.preventDefault()
}
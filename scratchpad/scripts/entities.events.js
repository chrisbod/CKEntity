function  EntityEvents () {}
EntityEvents.prototype = function () {
	createEntityEvent: function (type, details) {
		if (!/entities/.test(type)) {
			type = this[type.toUpperCase()]
		}

		return new CustomEvent(type,{bubbles:true,details:details})
	},
	createAndDispatchEvent: function (type, details, target) {
		target.dispatchEvent(this.createEntityEvent(type,properties))
	} 
}

EntityEvents.EVENTS = EntityEvents.prototype.EVENTS = {
	SELECT: "entities.select",
	DESELECT: "entities.deselect",
	CLICK: "entities.click",
	KEYDOWN: "entities.keydown",
	KEYUP: "entities.keyup",
	DELETE: "entities.delete",
	MOUSEDOWN: "entities.mousedown",
	MOUSEUP: "entities.mouseup"
}
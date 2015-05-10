

function EntityToolTip() {
	
	
}

(function (extend) {
	var proto = EntityToolTip.prototype = new PositionableContainer();
	for (var i in extend) {
		proto[i] = extend[i];
	}
})({
	className: "entity-tooltip",
	attachEvents: function () {
		this.element.addEventListener("click", this);
		this.element.addEventListener("mouseenter", this);
		this.element.addEventListener("mouseleave", this);
	},
	clickHandler: function () {
		console.log("click")
	},
	mouseenterHandler: function () {
		this.intent && this.intent.cancel();
	},
	mouseleaveHandler: function () {
		this.intent && this.intent.cancel();
		this.intent = new Intent()
		this.intent.request(this.hide.bind(this))
	},
	update: function (token) {
		var content = document.createElement("p")
		content.innerText = "Click to Edit"
		this.setContent(content);
	}


})
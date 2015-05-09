function EntityToolTip(id, tokenizer) {
	this.element = document.createElement("div")
	this.element.className = "tooltip-container";
	this.element.id = id;
	this.element.addEventListener("click", this);
	this.element.addEventListener("mouseover", this);
}

(function (extend) {
	var proto = EntityToolTip.prototype = new PositionableContainer();
	for (var i in extend) {
		proto[i] = extend[i];
	}
})({



})
function ContentEditableEventGenerator() {
	this.currentDetails = {};
	this.entitiesHelper = new EntitiesHelper()
}
ContentEditableEventGenerator.prototype = {
	init: function (element) {
		this.element = element;
		this.document = element.ownerDocument
		this.bindEvents();
	},
	bindEvents: function () {
		var element = this.element;
		//element.addEventListener("input",this,true);
		//element.addEventListener("drop",this,true);
		//element.addEventListener("mouseup",this,true);
		
		//this.document.addEventListener("keydown",this,true);
		//this.document.addEventListener("keyup",this,true);
		//element.addEventListener("contextmenu",this,true);
		//this.document.addEventListener("paste", this,true);

	},
	handleEvent: function (event) {
		//this.extendEvent(event);
		return this[event.type+'Handler'](event);
	},
	extendEvent: function (event) {
		
	},
	focusHandler: function () {
		console.log("focus")
	},
	blurHandler: function () {
		console.log("blur")
	},
	inputHandler: function () {},
	dropHandler: function () {},
	dragHandler: function () {},
	pasteHandler: function () {},
	clickHandler: function () {},
	dblclickHandler: function () {},
	keydownHandler: function () {},
	keyupHandler: function (event) {
	},
	keypressHandler: function () {},
	mousedownHandler: function (event) {
	},
	mouseupHandler: function (event) {
	},
	blurHandler: function () {},
	focusHandler: function () {},
	contextmenuHandler: function () {}


}
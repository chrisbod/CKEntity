function EntityEditManager() {

}

EntityEditManager.prototype = {
	init: function (editableElement) {
		this.editableElement = editableElement;
		//this.editableElement.addEventListener("click",this,true)
		this.editableElement.addEventListener("contextmenu",this,true)
	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event)
	},
	clickHandler: function (event) {
		/*if (this.isEditClick(event)) {
			var entity = this.getEntityElement(event.target,event)
			event.preventDefault()
			event.stopPropagation();
			return false;
		}*/
	},
	contextmenuHandler: function (event) {
		var entity = this.getEntityElement(event.target,event);
		if (entity) {
			event.preventDefault()
			event.stopPropagation();
			this.trigger(entity,event);
			return false;
		}
	},
	getEntityElement: function (startNode,event) {
		var currentNode = startNode,
			path = [];
		if (event && event.path) {
			path = event.path;
		} else {
			path = this.getPath(startNode);
		}
		for (var i=0;i!=path.length-3;i++) {
			if (this.isEntityElement(path[i])) {
				return path[i]
			}
		}
		return null;
	},
	trigger: function (entity,event) {
		switch (entity.tagName) {
			case "TOKEN":  return this.triggerTokenEdit(entity);
		}
	},
	triggerTokenEdit: function (tokenElement) {	
		if (!this.knockoutModel) {
			var dialog = document.getElementById("tokenDialog");
			this.knockoutModel = new TokenDialogViewModel(tokenElement,dialog);
			ko.applyBindings(this.knockoutModel,dialog)
		} else {

			this.knockoutModel.updateFromElement(tokenElement)
			this.knockoutModel.active(true)
		}
		
		
	},
	isEntityElement: function (element) {
		if (element) { 			
			return /TRANSLATION|TOKEN|CONDITIONAL/i.test(element.tagName);
  		}
	},
	isEditClick: function (e) {
		e = e || window.event;
		if ( !e.which && e.button !== undefined ) {
			e.which = ( e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ) );
		}
		
		if (e.which == 1) {
		  return true;
		}
		return false;
	}	
}
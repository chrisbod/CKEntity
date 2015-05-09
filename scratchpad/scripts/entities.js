function Entities() {
}
Entities.prototype = {
	isEntityElement: function (element) {
		if (element) { 			
			return /TRANSLATION|TOKEN|CONDITIONAL/i.test(element.tagName);
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
	getPath: function (startNode) {
		var currentNode = startNode,
			path = [];
		while (currentNode) {
			path[path.length] = currentNode;
			currentNode = currentNode.parentNode;
		}
		path[path.length] = window;
		return path;
	},
	getEntityPathAsText: function (startElement) {
		var path = this.getPath(startElement),
			filteredPath = [];
		for (var i=0;i<path.length;i++) {
			if (this.isEntityElement(path[i])) {
				filteredPath.push(path[i].tagName)
			}
		}
		return filteredPath;
	},
	getEditPermissions: function (entityElement) {
		var path = this.getEntityPathAsText(entityElement);
		if (path[0] == "TOKEN") {
			if (path.length == 1) {
				return {rules: true,properties:true}
			} else {
				return {properties:true}
			}
		}
		return {rules: true};

	},
	triggerTokenEdit: function (tokenElement) {	
		if (!this.tokenModel) {
			var dialog = document.getElementById("tokenDialog");
			this.tokenModel = new TokenDialogViewModel(tokenElement,dialog);
			ko.applyBindings(this.tokenModel,dialog)
		} else {

			this.tokenModel.updateFromElement(tokenElement)
			this.tokenModel.active(true)
		}
	},
	triggerTranslationEdit: function (tokenElement) {
		if (!this.translationModel) {
			var dialog = document.getElementById("logicDialog");
			this.translationModel = new LogicDialogViewModel(tokenElement,dialog);
			ko.applyBindings(this.translationModel,dialog)
		} else {

			this.translationModel.updateFromElement(tokenElement)
			this.translationModel.active(true)
		}
	},
	triggerConditionalEdit: function (tokenElement) {

	}

}
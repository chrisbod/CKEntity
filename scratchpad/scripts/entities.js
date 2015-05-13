function EntitiesHelper() {
}
EntitiesHelper.prototype = {
	currentLanguage: "en",
	languageStore: null,
	isEntityElement: function (element) {
		if (element) { 			
			return /TRANSLATION|TOKEN|CONDITIONAL/i.test(element.tagName);
  		}
	},
	isTokenElement: function (element) {
		if (element) { 			
			return /TOKEN/i.test(element.tagName);
  		}
	},
	getEntityType: function (element) {
		if (!element) {
			return "";
		}
		switch (element.tagName) {
			case "TOKEN": {
				return "token";
			}
			case "CONDITIONAL": {
				if (element.classList.contains("user")) {
					return "userconditional";
				} else {
					return "conditional";
				}
			}
			case "TRANSLATION": return "translation";
			case "SPAN": if (element.classList.contains("end")) {
				return "endmarker";
			} else if (element.classList.contains("args")) {
				return "startmarker"
			}
		}
		return "";
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

	},
	setDataArguments: function (element,values) {
		var args = [];
		for (var i in values) {
			args.push(i+":'"+values[i]+"'");
		}
		console.log(args)
		element.setAttribute("data-args",args);
		element.firstChild.setAttribute("data-args",args);
	},
	setDataArgument: function (element,key,value) {
		console.log(arguments)
		var values = this.getElementDataArguments(element);
		values[key] = value;
		this.updateElementDataArguments(element,values);
	},
	removeDataArgument: function (element,key) {
		var values = this.getElementDataArguments(element);
		delete values[key];
		this.updateElementDataArguments(values);
	},
	getDataArguments: function (tokenElement) {
		var args = tokenElement.getAttribute("data-args");
		var values = (new Function("return {"+(args||'')+"}"))();
		for (var i in values) {
			this[i] = values[i];
		}
		return values;
	},
	getTokenDefinitionByType: function (type) {
		var definitions = this.languageStore.getCurrentTokenDefinitions();
		for (var i=0;i<definitions.length;i++) {
			if (definitions[i].id == type) {
				return definitions[i]
			}
		}
	},
	getCurrentLogicDefinitions: function () {
		return this.languageStore.getCurrentLogicDefinitions();
	}
}



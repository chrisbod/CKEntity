function EntitiesHelper() {
}
EntitiesHelper.prototype = {
	currentLanguage: "en",
	languageStore: null,
	getBrokenEntities: function (element) {
		return element.querySelectorAll("token:not([contenteditable]),translation:not(contenteditable),conditional:not(.user):not([contenteditable]")
	},
	isEntityElement: function (element) {
		if (element) { 			
			return /TRANSLATION|TOKEN|CONDITIONAL/i.test(element.tagName);
  		}
	},
	isEntityWrapper: function (element) {
		return element.className.contains("entity-wrapper")
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
	getEditableEntityElement: function (startNode) {
		var currentNode = startNode;
		if (currentNode.nodeType == 3) {
			currentNode = currentNode.parentNode
		}
		while( currentNode.classList) {
			if (currentNode.classList.contains("contents")) {
				return currentNode
			}
			currentNode =currentNode.parentNode
		}
		return null
	},
	getEntityElement: function (startNode,event) {
		if (startNode) {
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
		}
		return null;
	},
	getPath: function (startNode) {
		if (!startNode) {
			return [];
		}
		var currentNode = startNode,
			path = [],
			doc = startNode.ownerDocument
		while (currentNode && currentNode != doc) {
			path[path.length] = currentNode;
			currentNode = currentNode.parentNode;
		}
		path[path.length] = doc
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
			//if (path.length == 1) {
				//return {rules: true,properties:true}
			//} else {
				return {properties:true}
			//}
		}
		if (path[0] == "TRANSLATION") {
			return {}
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
		if (element.hasAttribute("data-entity-node")) {
			element = element.firstElementChild
		}
		var args = [];
		for (var i in values) {
			args.push(i+":'"+values[i]+"'");
		}
		element.setAttribute("data-args",args);
		element.firstElementChild.setAttribute("data-args",args);
	},
	setDataArgument: function (element,key,value) {
		var values = this.getDataArguments(element);
		values[key] = value;
		this.setDataArguments(element,values);
	},
	removeDataArgument: function (element,key) {
		var values = this.getDataArguments(element);
		delete values[key];
		this.setDataArguments(element,values);
	},
	getDataArgument: function (element,key) {
		return this.getDataArguments(element).key;
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
			if (definitions[i].type == type) {
				return definitions[i]
			}
		}
	},
	getCurrentLogicDefinitions: function () {
		return this.languageStore.getCurrentLogicDefinitions();
	}
}



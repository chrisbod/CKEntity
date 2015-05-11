function EntitiesHelper() {
}
EntitiesHelper.defineTokens = function (tokenDefinitions) {
	this.prototype.tokenDefinitions = tokenDefinitions;
	this.buildTokenMap()
}
EntitiesHelper.defineLogic = function (logicDefinitions) {
	this.prototype.logicDefinitions = logicDefinitions;
}
EntitiesHelper.buildTokenMap = function () {
	var definitions = this.prototype.tokenDefinitions;
	var tokenMap = this.prototype.tokenMap = {}
	definitions.forEach(function (definition,index) {
		tokenMap[definition.id] = this.buildIdOrValueTextLookup(definition)
		definitions[definition.id] = definitions[index]
	},this)
}
EntitiesHelper.buildIdOrValueTextLookup =  function (definition) {
	var lookup = {
		text: definition.text,
		controls: {}
	}
	definition.groups.forEach(function (group) {
		var controlLookup =  {};

		group.controls.forEach(function (control) {
			if (control.options) {
				controlLookup.text = control.text || group.label
				control.options.forEach(function (option) {
					controlLookup[option.value] = option.text;
				})
				lookup.controls[control.id] = controlLookup
			} else {
				lookup.controls[control.id] = control.text;
			}
			
		})
	},this)
	return lookup;
}
EntitiesHelper.prototype = {
	tokenDefinitions: null,
	logicDefinitions: null,
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

	},
	setDataArguments: function (element,values) {
		var args = [];
		for (var i=0;i<values;i++) {
			args.push(values[i]+":'"+this[i]+"'");
		}
		element.setAttribute("data-args",args);
	},
	setDataArgument: function (element,key,value) {
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
	getSetValuesFromLookup: function (which,values) {
		if (which == "token") {
			return this.getTextAndValue(values,this[which+"Map"][values.type])
		}
	

	},
	getTextAndValue: function (values, map) {
		var definedControls = [];
		for (var i in values) {
			if (i in map.controls) {
				definedControls.push({
					text: map.controls[i].text,
					value: map.controls[i][values[i]]
				})
			}
		}
		return definedControls;
	},
	getTokenDefinitionByType: function (type) {
		var definitions = this.tokenDefinitions;
		for (var i=0;i<definitions.length;i++) {
			if (definitions[i].id == type) {
				return definitions[i]
			}
		}
	}

}


$(function () {
	$.ajax("xml/tokens.json", {
		mimeType: "application-x/json",
		success: function (tokenDefinitions) {
			EntitiesHelper.defineTokens(tokenDefinitions)
		}
	})
	$.ajax("xml/logic.json", {
		mimeType: "application-x/json",
		success: function (logicDefinitions) {
			EntitiesHelper.defineLogic(logicDefinitions)
		}
	})


});
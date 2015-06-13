function EntityViewModel() {
	this.entitiesHelper = new EntitiesHelper();
}

EntityViewModel.prototype = {
	cancel: function () {
		this.active(false);
	},
	update: function () {
		this.active(false);
		this.entitiesHelper.setDataArguments(this.element,this.values());
	}
}


function TokenDialogViewModel(element) {
	this.values = new ko.observable();
	this.tokenText =  ko.observable("");
	this.text = ko.observable("");
	this.active = ko.observable(false);
	this.groups = ko.observableArray([]);
}
TokenDialogViewModel.prototype = new EntityViewModel();

TokenDialogViewModel.prototype.updateFromElement = function (element) {
	this.element = element;
	this.values(this.entitiesHelper.getDataArguments(element));
	var tokenDefinition = this.entitiesHelper.getTokenDefinitionByType(this.values().name);
	this.text(tokenDefinition.text.replace(/\&lt\;|\&gt\;|\<|\>/g,''));
	this.tokenText(tokenDefinition.id);
	this.groups(tokenDefinition.groups);
}
TokenDialogViewModel.prototype.dialogName = "tokenDialog";
knockoutDialogFactory.addDialog("tokenDialog", "Token Properties", 300, 100)




function LogicDialogViewModel(element) {
	this.values = new ko.observable();
	this.text = ko.observable("");
	this.active = ko.observable(false);
	//this.active.subscribe(this.fitToScreen.bind(this),null,"change")
	this.options = ko.observableArray([]);
	this.logic = ko.observable();
	this.updateFromElement(element);
}
LogicDialogViewModel.prototype = new EntityViewModel();
LogicDialogViewModel.prototype.updateFromElement = function (element) {
	this.element = element;
	this.text(element.innerText||"If")
	this.values(this.entitiesHelper.getDataArguments(element));
	this.logic(this.entitiesHelper.getCurrentLogicDefinitions());
}

LogicDialogViewModel.prototype.dialogName = "logicDialog";
knockoutDialogFactory.addDialog("logicDialog", "Display Logic", 600, 400)

function TokenTooltipViewModel(element) {
	this.title = ko.observable("");
	this.groups = ko.observableArray([]);
	this.canEditRules = ko.observable(false);
	this.canEditProperties = ko.observable(false);
	this.active = ko.observable(false)
}
TokenTooltipViewModel.prototype = new EntityViewModel();
TokenTooltipViewModel.prototype.updateFromElement = function (element) {
	this.element = element;
	var values = this.entitiesHelper.getDataArguments(element);
	var permissions = this.entitiesHelper.getEditPermissions(element);
	this.title(element.innerText.replace(/[\<\>\[\]]/g,'')||"[...]");
	this.canEditRules(permissions.rules||false);
	this.canEditProperties(permissions.properties||false)
	if (!permissions.rules && !permissions.properties) {
		this.active(false)
	}
}
TokenTooltipViewModel.prototype.launchRulesDialog = function (model,event) {
		if (!this.rulesModel) {
			var dialog = document.getElementById("logicDialog");
			this.rulesModel = new LogicDialogViewModel(this.element);
			ko.applyBindings(this.rulesModel,dialog)
		}
		this.active(false)
		this.rulesModel.updateFromElement(this.element)
		this.rulesModel.active(true)
	}
TokenTooltipViewModel.prototype.launchPropertiesDialog = function () {

		if (!this.propertiesModel) {
			var dialog = document.getElementById("tokenDialog");
			this.propertiesModel = new TokenDialogViewModel(this.element);
			ko.applyBindings(this.propertiesModel,dialog)
		} 
		this.active(false)
		this.propertiesModel.updateFromElement(this.element)
		this.propertiesModel.active(true)
}

function DocumentPreviewViewModel() {
	this.logic = ko.observable(this.entitiesHelper.getCurrentLogicDefinitions());
	this.values = new ko.observable({});
	this.active = ko.observable(false);
}
DocumentPreviewViewModel.prototype = new EntityViewModel();
DocumentPreviewViewModel.prototype.update = function () {
	this.active(false);
	//console.log(this.values())
}



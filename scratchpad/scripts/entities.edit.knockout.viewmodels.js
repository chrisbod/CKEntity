
function EntityViewModel() {
	this.entitiesHelper = new EntitiesHelper();
}

EntityViewModel.prototype = {
	
	cancel: function () {
		this.active(false);
	},
	update: function () {
		this.active(false);
		console.log(this.values(),this.element)
		this.entitiesHelper.setDataArguments(this.element,this.values())
	}
}


function TokenDialogViewModel(element) {
	this.values = new ko.observable();
	this.tokenText =  ko.observable("");
	this.text = ko.observable("");
	this.active = ko.observable(true);
	this.groups = ko.observableArray([]);
}
TokenDialogViewModel.prototype = new EntityViewModel();			
TokenDialogViewModel.prototype.updateFromElement = function (element) {
	this.element = element;
	this.values(this.entitiesHelper.getDataArguments(element));
	var tokenDefinition = this.entitiesHelper.getTokenDefinitionByType(this.values().type);
	this.text(tokenDefinition.text);
	this.tokenText(tokenDefinition.id);
	this.groups(tokenDefinition.groups);
}


function LogicDialogViewModel(element) {
	this.values = new ko.observable();
	this.text = ko.observable("");
	this.active = ko.observable(false);
	this.headings = ko.observableArray([]);
	this.rows =  ko.observableArray([]);
	this.updateFromElement(element);
}
LogicDialogViewModel.prototype = new EntityViewModel();
LogicDialogViewModel.prototype.updateFromElement = function (element) {
	this.element = element;
	this.text(element.innerText)
	this.values(this.entitiesHelper.getDataArguments(element));
	var tableData = this.transpose(this.entitiesHelper.logicDefinitions);
	this.headings(tableData.headings);
	this.rows(tableData.rows);
}
LogicDialogViewModel.prototype.transpose = function (logic) {
	var columnCount = logic.length,
		rowCount = 0,
		headings = [],
		rows = [];
	for (var i=0;i<logic.length;i++) {
		headings.push(logic[i])
		rowCount = Math.max(logic[i].items.length,rowCount)
	}
	for (i=0;i<rowCount;i++) {
		rows[i] = [];
		for (var j=0;j<columnCount;j++) {
			rows[i][j] = logic[j].items[i]
		}
	}
	return {
		headings: headings,
		rows: rows
	}
}

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
	this.title(element.innerText);
	var permissions = this.entitiesHelper.getEditPermissions(element);
	this.canEditRules(permissions.rules||false);
	this.canEditProperties(permissions.properties||false)
}
TokenTooltipViewModel.prototype.launchRulesDialog = function () {
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
			this.tokenModel = new TokenDialogViewModel(this.element);
			ko.applyBindings(this.tokenModel,dialog)
		} 
		this.active(false)
		this.tokenModel.updateFromElement(this.element)
		this.tokenModel.active(true)
}


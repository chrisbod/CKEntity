
function EntityViewModel() {
	this.entitiesHelper = new EntitiesHelper();
}

EntityViewModel.prototype = {
	
	cancel: function () {
		this.active(false);
	},
	update: function () {
		this.active(false);
		this.entitiesHelper.setDataArguments(this.element,this.values())
	}
}


function TokenDialogViewModel(element,dialogElement) {
	this.values = new ko.observable();
	this.dialogElement = dialogElement;
	this.tokenText =  ko.observable("");
	this.text = ko.observable("");
	this.active = ko.observable(true);
	this.groups = ko.observableArray([]);
	this.updateFromElement(element);
}
TokenDialogViewModel.prototype = new EntityViewModel();			
TokenDialogViewModel.prototype.updateFromElement = function (element) {
	this.values(this.entitiesHelper.getValuesFromToken(element));
	var tokenDefinition = this.helper.getTokenDefinitionByType(this.values().type);
	this.text(tokenDefinition.text);
	this.tokenText(tokenDefinition.id);
	this.groups(tokenDefinition.groups);
}


function LogicDialogViewModel(element,dialogElement) {
	this.values = new ko.observable();
	this.dialogElement = dialogElement;
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
	this.values(this.entitiesHelper.getValuesFromElement(element));
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
	this.heading = ko.observable("");
	this.groups = ko.observableArray([]);
	this.canEditRules = ko.observable(false);
	this.canEditProperties = ko.observable(false);
	if (element) {
		this.updateFromElement(element);
	}
}
TokenTooltipViewModel.prototype = new EntityViewModel();
TokenTooltipViewModel.prototype.updateFromElement = function (element) {
	this.element = element;
	var values = this.entitiesHelper.getValuesFromElement(element);
	//this.heading();
	var permissions = this.entitiesHelper.getEditPermissions(this.entitiesHelper.getEntityElement());
	this.canEditRules(permissions.rules);
	this.canEditProperties(permissions.properties)
}

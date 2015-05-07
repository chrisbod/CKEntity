

		function TokenDialogViewModel(element,dialogElement) {
				this.values = new ko.observable();
				this.dialogElement = dialogElement;
				this.tokenText =  ko.observable("");
				this.text = ko.observable("");
				this.active = ko.observable(true);
				this.groups = ko.observableArray([]);
				this.updateFromElement(element);
			}
			TokenDialogViewModel.prototype.getValuesFromToken = function (element) {
				this.element = element;
				var args = element.getAttribute("data-args")
				var values = (new Function("return {"+(args||'')+"}"))();
				return values;
			}
			TokenDialogViewModel.prototype.getDefinitionByType = function (type) {
				var definitions = this.definitions;
					for (var i=0;i<definitions.length;i++) {
						if (definitions[i].id == type) {
							return definitions[i]
						}
					}
			}
			TokenDialogViewModel.prototype.updateFromElement = function (element) {
				this.values(this.getValuesFromToken(element));
				var tokenDefinition = this.getDefinitionByType(this.values().type);
				this.text(tokenDefinition.text);
				this.tokenText(tokenDefinition.id);
				this.groups(tokenDefinition.groups);
			}
			TokenDialogViewModel.prototype.cancel = function (model) {
				this.active(false);
			}
			TokenDialogViewModel.prototype.update = function (model) {
				this.active(false)
				var values = this.values(),
					args = []
				for (var i in values) {
					args.push(i+":'"+values[i]+"'")
				}
				this.element.setAttribute("data-args",args);
				this.element.firstChild.setAttribute("data-args",args);
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
			LogicDialogViewModel.prototype = {
				updateFromElement: function (element) {

					this.element = element;
					this.text(element.innerText)
					this.values(this.getValuesFromElement(element));
					var tableData = this.transpose(this.definitions);
					this.headings(tableData.headings);
					this.rows(tableData.rows);
				},
				getValuesFromElement: function (element) {
					this.element = element;
					var args = element.getAttribute("data-args")||'';
					var values = (new Function("return {"+(args||'')+"}"))();
					return values;
				},
				transpose: function (logic) {
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
			}
			LogicDialogViewModel.prototype.cancel = function (model) {
				this.active(false);
			}
			LogicDialogViewModel.prototype.update = function (model) {
				this.active(false)
				var values = this.values(),
					args = []
				for (var i in values) {
					args.push(i+":'"+values[i]+"'")
				}
				this.element.setAttribute("data-args",args);
				this.element.firstChild.setAttribute("data-args",args);
			}



	$(function () {
				$.ajax("xml/tokens.json", {
					mimeType: "application-x/json",
					success: function (tokenDefinitions) {
						TokenDialogViewModel.prototype.definitions = tokenDefinitions;
						
						//ko.applyBindings(new TokenDialogViewModel(tokenDefinitions[2]),document.getElementById("test"))
						//var token = document.getElementsByTagName("token")[0]
						//ko.applyBindings(new TokenDialogViewModel(token),document.getElementById("test"))
						//ko.applyBindings(new TokenDialogViewModel(token),document.getElementById("tooltip"))

					}
				})
				$.ajax("xml/logic.json", {
					mimeType: "application-x/json",
					success: function (logicDefinitions) {
						LogicDialogViewModel.prototype.definitions = logicDefinitions;
						//ko.applyBindings(new LogicDialogViewModel(logicDefinitions,{}),document.getElementById("rules"))

					}
				})


			})


		function TokenDialogViewModel(tokenElement,dialogElement) {
				this.values = new ko.observable();
				this.dialogElement = dialogElement;
				
				this.tokenText =  ko.observable("");
				this.text = ko.observable("");
				this.active = ko.observable(true);
				this.groups = ko.observableArray([]);
				this.updateFromElement(tokenElement);
			}
			TokenDialogViewModel.prototype.getValuesFromToken = function (tokenElement) {
				this.tokenElement = tokenElement;
				var args = tokenElement.getAttribute("data-args")
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
			TokenDialogViewModel.prototype.updateFromElement = function (tokenElement) {
				this.values(this.getValuesFromToken(tokenElement));
				var tokenDefinition = this.getDefinitionByType(this.values().type);
				this.text(tokenDefinition.text);
				this.tokenText(tokenDefinition.id);
				this.groups(tokenDefinition.groups);
			}
			TokenDialogViewModel.prototype.cancel = function (model) {
				this.active(false);
			}
			TokenDialogViewModel.prototype.updateToken = function (model) {
				this.active(false)
				var values = this.values(),
					args = []
				for (var i in values) {
					args.push(i+":'"+values[i]+"'")
				}
				this.tokenElement.setAttribute("data-args",args);
				this.tokenElement.firstChild.setAttribute("data-args",args);
			}






			function LogicDialogViewModel(element, values) {
				this.values = this.getValuesFromElement(element)
				var tableData = this.transpose(logicDefinition);
				this.headings = tableData.headings;
				this.rows = tableData.rows;
				
			}
			LogicDialogViewModel.prototype = {
				getValuesFromElement: function (element) {
					this.element = tokenElement;
					var args = tokenElement.getAttribute("data-args")
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
				},
				updateLogic: function () {

				}
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
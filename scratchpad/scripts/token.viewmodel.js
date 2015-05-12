function TokenViewModel(name,id) {
			this.name = name;
			this.id = id;
		}

		TokenViewModel.prototype.updateToken = function () {
			var args = []
			for (var i=0;i<this.values;i++) {
				args.push(values[i]+":'"+this[i]+"'")
				}
				this.tokenElement.setAttribute("data-args",args);

		}
		TokenVieModel.prototype.getValuesFromToken = function (tokenElement) {
			this.tokenElement = tokenElement;
			var args = tokenElement.getAttribute("data-args")
			var values = (new Function("return {"+(args||'')+"}"))();
			for (var i in values) {
				this[i] = values[i]
			}
			return values;
		}

		TokenViewModel.types = {};
		TokenViewModel.buildTypes = function (definitions) {
			for (var i =0, types = this.types,type, def ;i < definitions.length; i++) {
				type = i.type;
				types[type] = this.getTypeConstructor(defintion[i])
			}
		}
		TokenViewModel.getTypeConstructor = function (definition) {
			 var constructor = new Function(),
				proto = types[type].prototype = new this(definition.name,definition.id);
			proto.definition = definition
			

		}
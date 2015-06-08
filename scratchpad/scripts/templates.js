function TemplateService(path,username,password) {
			this.path = path;
			this.username = username;
			this.password = password;
		}
		TemplateService.getInstance = function (path,username,password) {
			if (!this.instance) {
				this.instance = new this(path,username,password)
			}
			return this.instance
		}
		TemplateService.prototype = {
			getTemplateList: function (callback) {
				$.ajax(this.path+"list.json",{
					password: this.password,
					username: this.username,
					success: callback
			})
			},
			loadTemplate: function (templateId,callback) {
				//https://www.firelex.com/priip/api/template/get/1004/content.json
				$.ajax(this.path+"get/"+templateId+"/content.json",{
					password: this.password,
					username: this.username,
					success: callback
			})
			},
			createNewTemplate: function (name,callback) {

				$.ajax(this.path+"insert/"+encodeURI(name)+".json",{
					method: "POST",
					password: this.password,
					username: this.username,
					success: callback
			})
			
			},
			saveTemplate: function (data, callback) {
				$.ajax(this.path+"update/"+templateId+"/"+encodeURI(data.templateName)+".json",{
					password: this.password,
					username: this.username,
					success: callback
			})
			},
			saveTemplateAs: function (templateName, data, callback) {
				data.templateName = templateName;
				this.createNewTemplate(templateName,this.saveTemplate.bind(this,data,callback))
			},
			deleteTemplate: function (templateId,callback) {
				$.ajax(this.path+"delete/"+templateId,{
					method: "POST",
					password: this.password,
					username: this.username,
					success: callback
			})
			}
		}

		

		function TemplateListViewModel(service,templates) {
			this.service = service;
			this.templates = ko.observableArray(templates);
			this.selected = ko.observable(templates[0]);
			this.selectedId = ko.observable(this.selected().templateId);
			this.active = ko.observable(false)
		}

		TemplateListViewModel.prototype = {
			defaultName: "New Document",
			select: function (template) {
				if (!template) {
					template = this.templates()[0]
				}
				if (template) {
					this.selectedId = template.templateId;
					this.selected(template)
				} else {
					this.selectedId = ""
					this.selected(null)
				}
			},
			loadTemplate: function () {
				this.service.loadTemplate(this.selected().templateId, this.templateLoaded.bind(this))
			},
			templateLoaded: function (templateData) {
				console.log(templateData)
			},
			createNewTemplate:function () {
				this.service.createNewTemplate(prompt("New Name"), this.templateCreated.bind(this))
			},
			templateCreated: function (newTemplate) {
				this.templates.push(newTemplate);
				this.select(newTemplate)
				//this.service.loadTemplate(this.selectedId(), this.templateLoaded.bind(this))
			},
			deleteTemplate: function () {
				this.service.deleteTemplate(this.selected().templateId, this.templateDeleted.bind(this))
			},
			templateDeleted: function () {
				this.templates.remove(this.selected())
				this.select()
			}
	}

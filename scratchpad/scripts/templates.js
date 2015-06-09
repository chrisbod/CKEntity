function TemplateService(path) {
	this.path = path;
}
TemplateService.getInstance = function (path) {
	if (!this.instance) {
		this.instance = new this(path||this.DEFAULT_PATH)
	}
	return this.instance
}
TemplateService.DEFAULT_PATH = "https://www.firelex.com/priip/api/template/";
TemplateService.prototype = {
	getDefaultTemplateBody: function (callback,failure) {
		if (this.defaultTemplateBody) {
			setTimeout(callback.bind(null,this.defaultTemplateBody));//make a sync
		} else {
			$.ajax("templates/basic.html", {
				success: this.defaultTemplateLoaded.bind(this,callback)
			})
		}
	},
	defaultTemplateLoaded: function (callback,html) {
		this.defaultTemplateBody = html;
		if (callback) {
			callback(html)
		}
	},
	getTemplateList: function (callback) {
		$.ajax(this.path+"list.json",{
			success: callback
	})
	},
	loadTemplate: function (callback,templateId) {
		//https://www.firelex.com/priip/api/template/get/1004/content.json
		$.ajax(this.path+"get/"+templateId+"/content.json",{
			success: callback
	})
	},
	createNewTemplate: function (callback,name,body) {
		if (!body) {
			this.getDefaultTemplateBody(this.createNewTemplate.bind(this,callback,name))
		} else {
			
			$.ajax(this.path+"insert/"+encodeURI(name)+".json",{
					method: "POST",
					success: callback,
					data:body,
					contentType: "application/json"
					
			})
		}
		
	
	},
	saveTemplate: function (callback,data) {
		$.ajax(this.path+"update/"+templateId+"/"+encodeURI(data.templateName)+".json",{
			success: callback
	})
	},
	saveTemplateAs: function (callback,templateName, data) {
		data.templateName = templateName;
		this.createNewTemplate(this.saveTemplate.bind(this,callback,data),templateName)
	},
	deleteTemplate: function (callback, templateId) {
		$.ajax(this.path+"delete/"+templateId,{
			method: "POST",
			success: callback
	})
	}
}

		

		function TemplateListViewModel(templates) {
			this.service = TemplateService.getInstance();
			
			this.templates = ko.observableArray();
			this.selected = ko.observable();
			this.selectedId = ko.observable();
			this.active = ko.observable(false)
			if (templates) {
				this.allTemplatesLoaded(templates)
			}
		}

		TemplateListViewModel.prototype = {
			defaultName: "New Document",
			loadTemplates: function () {
				this.service.getTemplateList(this.allTemplatesLoaded.bind(this))
			},
			allTemplatesLoaded: function (templates) {
				this.templates(templates)
				this.selected(this.templates()[0])
				this.selectedId(this.templates()[0].templateId)
			},
			select: function (template) {
				if (!template) {
					template = this.templates()[0]
				}
				if (template) {
					this.selectedId(template.templateId);
					this.selected(template)
				} else {
					this.selectedId("")
					this.selected(null)
				}
			},
			copyTemplate: function () {

			},
			loadTemplate: function () {
				this.service.loadTemplate(this.templateLoaded.bind(this),this.selected().templateId)
			},
			templateLoaded: function (templateData) {
				console.log(templateData)
			},
			createNewTemplate:function () {
				this.service.createNewTemplate(this.templateCreated.bind(this),prompt("New Name"))
			},
			templateCreated: function (newTemplate) {
				this.templates.push(newTemplate);
				this.select(newTemplate)
				
				//this.service.loadTemplate(this.selectedId(), this.templateLoaded.bind(this))
			},
			deleteTemplate: function () {
				this.service.deleteTemplate(this.templateDeleted.bind(this,this.selected()),this.selected().templateId)
			},
			templateDeleted: function (deletedTemplate) {
				this.templates.remove(deletedTemplate);
				
				this.select()
			},
			update: function () {//dummy method to handle the user clicking ok (update is the generic call made by the dialog)

			}
	}

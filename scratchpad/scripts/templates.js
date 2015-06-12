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
	username: "admin",
	password: "roadtospell",
	getDefaultTemplateBody: function (callback) {
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
	getTemplateList: function (details) {
		$.ajax(this.path+"list.json",{
			success: details.success,
			error: this.handleError.bind(this,details)
	})
	},
	handleError: function (details,jResponse) {
		var errorDetails = {}
		if (jResponse.statusText == "error") {
			errorDetails.message = "You may not be authenticated"
		}
		if (details.error) {
			details.error(errorDetails,jResponse)
		}
		
	},
	loadTemplate: function (callback,templateId) {
		//https://www.firelex.com/priip/api/template/get/1004/content.json
		$.ajax(this.path+"get/"+templateId+"/content.json",{
			success: this.setCurrentTemplate.bind(this,callback),
			error: this.handleError.bind(this,{templateId:templateId}),
			contentType: "application/json"
	})
	},
	setCurrentTemplate: function (callback, data) {
		this.currentTemplate = data;
		callback(data)
	},
	createNewTemplate: function (callback,name,body) {
		if (!body) {
			this.getDefaultTemplateBody(this.createNewTemplate.bind(this,callback,name))
		} else {
			
			$.ajax(this.path+"insert/"+encodeURI(name)+".json",{
					method: "POST",
					success: callback,
					error: this.handleError.bind(this,{templateName:name}),
					data:body,
					contentType: "application/json"
					
					
			})
		}
		
	
	},
	duplicateTemplate: function (callback,oldTemplateId,newTemplateName) {
		$.ajax(this.path+"get/"+oldTemplateId+"/content.json",{
			success: this.templateToDuplicateLoaded.bind(this,callback,newTemplateName),
			error: this.handleError.bind(this,{templateId:oldTemplateId}),
			contentType: "application/json"
	})
	},
	templateToDuplicateLoaded: function (callback,newTemplateName,templateData) {

		this.createNewTemplate(callback,newTemplateName,templateData.templateContent);
	},
	saveTemplate: function (callback,data) {
		$.ajax(this.path+"update/"+data.templateId+"/"+encodeURI(data.templateName)+".json",{
			success: callback,
			error: this.handleError.bind(this,this.currentTemplate),
			contentType: "application/json",
		});
	},
	saveCurrentTemplate: function (callback,html) {
		this.currentTemplate.templateContent = html;
		$.ajax(this.path+"update/"+this.currentTemplate.templateId+"/"+encodeURI(this.currentTemplate.templateName)+".json",{
			method: "POST",
			success: callback,
			error: this.handleError.bind(this,this.currentTemplate),
			data: this.currentTemplate.templateContent,
			contentType: "application/json"
	})
	},
	saveTemplateAs: function (callback,templateName, data) {
		data.templateName = templateName;
		this.createNewTemplate(this.saveTemplate.bind(this,callback,data),templateName)
	},
	deleteTemplate: function (callback, templateId) {
		$.ajax(this.path+"delete/"+templateId,{
			method: "POST",
			success: callback,
			error: this.handleError.bind(this,{templateId:templateId}),
			contentType: "application/json",
	})
	}
}

		

		function TemplateListViewModel(templates) {
			this.service = TemplateService.getInstance();
			
			this.templates = ko.observableArray();
			this.selected = ko.observable();
			this.selectedId = ko.observable();
			this.active = ko.observable(false);
			this.errorMessage = ko.observable("");
			this.errorDetails = ko.observable("")
			this.creating = ko.observable(false);
			this.duplicating = ko.observable(false);
			this.templateName = ko.observable("");
			if (templates) {
				this.allTemplatesLoaded(templates)
			}
		}

		TemplateListViewModel.prototype = {
			defaultName: "New Document",
			error: function (message,errorDetails) {
				this.errorMessage(message)
				if (errorDetails && errorDetails.message) {
					this.errorDetails(errorDetails.message)
				}
			},
			loadTemplates: function () {
				this.service.getTemplateList({
					success: this.allTemplatesLoaded.bind(this),
					error: this.error.bind(this,"Error retreiving template list")
				})
			},
			templateSorter: function (a,b) {
					return a.templateName.toLowerCase() > b.templateName.toLowerCase() ? 1 : -1
				},
			allTemplatesLoaded: function (templates) {
				templates.sort(this.templateSorter)
				this.templates(templates)
				this.select(templates[0])
			},
			select: function (template) {
				this.creating(false)
				if (!template) {
					template = this.templates()[0]
				}
				
					this.selectedId(template.templateId);
					this.selected(template)

			},
			deselect: function () {
				this.selectedId('')
				this.selected({})
			},
			cancelCreation: function () {
				this.creating(false)
				this.duplicating(false)
				return true
			},
			
			loadTemplate: function () {
				this.creating(false)
				this.duplicating(false)
				this.service.loadTemplate(this.templateLoaded.bind(this),this.selected().templateId)
			},
			templateLoaded: function (templateData) {
				this.active(false);
				CKEDITOR.instances.documentSource.setData(templateData.templateContent, function () {
					CKEDITOR.dialog.getCurrent().hide()
				})

				
			},
			copyTemplate: function () {
				if (this.selectedId()=='') {
					this.select()
				}
				this.creating(false)
				this.duplicating(true)
			},
			createNewTemplate: function () {
				this.deselect()
				this.creating(true);
				this.duplicating(false)
			},
			duplicateSelectedTemplate: function (callback) {
				if (this.selectedId()=='') {
					this.select()
				}
				this.duplicating(true);
			},
			createTemplate: function (callback) {
				var name = this.templateName(),
					validity = this.validateName(name)
				if (validity === true) {
					this.creating(false)
					this.service.createNewTemplate(callback,name)
						
					} else {
						this.error(validity)
					}
			},
			duplicateTemplate: function (callback) {
				var name = this.templateName(),
					validity = this.validateName(name)
				if (validity === true) {
					this.duplicating(false);
					this.service.duplicateTemplate(callback,this.selected().templateId,name)
						
					} else {
						this.error(validity)
					}
			},
			templateCreated: function (newTemplate) {
				this.creating(false);
				this.duplicating(false)
				this.templates.push(newTemplate);
				this.templates.sort(this.templateSorter)
				this.select(newTemplate)
				this.templateName('')
				
				//this.service.loadTemplate(this.selectedId(), this.templateLoaded.bind(this))
			},
			deleteTemplate: function () {
				this.creating(false);
				if (confirm("Are you sure you want to delete '"+this.selected().templateName+"'?")) {
					this.service.deleteTemplate(this.templateDeleted.bind(this,this.selected()),this.selected().templateId)
				}
			},
			templateDeleted: function (deletedTemplate) {
				this.templates.remove(deletedTemplate);
				
				this.select()
			},
			update: function () {//dummy method to handle the user clicking ok (update is the generic call made by the dialog)
				this.loadTemplate()
			},
			clearError: function () {
				this.errorMessage('')
				this.errorDetails('')
			},
			validateName: function (name) {
				var validity = true;
				if (name.trim()=="") {
					validity =  "Name cannot be empty"
				}
				var existingTemplates = this.templates();
				existingTemplates.forEach(function (template) {
					if (template.templateName == name ) {
						validity = "A template named '"+name+"' already exists"
					}
				})
				return validity;
			},
			nameInput: function (model,event) {
				if (event.keyCode == 13) {//enter hit{
					this.createTemplate(this.templateCreated.bind(this))			
				}
				return true
			},
			templateCreateButton: function () {
				this.createTemplate(this.templateCreated.bind(this))
			},
			templateDuplicateButton: function () {
				this.duplicateTemplate(this.templateCreated.bind(this))
			}
	}

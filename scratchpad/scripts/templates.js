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
			success: callback,
			error: this.handleError.bind(this,{templateId:templateId})
	})
	},
	createNewTemplate: function (callback,name,body) {
		if (!body) {
			this.getDefaultTemplateBody(this.createNewTemplate.bind(this,callback,name))
		} else {
			
			$.ajax(this.path+"insert/"+encodeURI(name)+".json",{
					method: "POST",
					success: callback,
					error: this.handleError.bind(this,{templateName:templateName}),
					data:body,
					contentType: "application/json"
					
			})
		}
		
	
	},
	saveTemplate: function (callback,data) {
		$.ajax(this.path+"update/"+templateId+"/"+encodeURI(data.templateName)+".json",{
			success: callback,
			error: this.handleError.bind(this,{templateName:data.templateName})
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
			error: this.handleError.bind(this,{templateId:data.templateId})
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
			this.templateName = ko.observable("");

			//this.editorButtonsToHide = ['ok','cancel']
			if (templates) {
				this.allTemplatesLoaded(templates)
			}
		}

		TemplateListViewModel.prototype = {
			defaultName: "New Document",
			error: function (message,errorDetails) {
				this.errorMessage(message)
				if (errorDetails.message) {
					this.errorDetails(errorDetails.message)
				}
			},
			loadTemplates: function () {
				this.service.getTemplateList({
					success: this.allTemplatesLoaded.bind(this),
					error: this.error.bind(this,"Error retreiving template list")
				})
			},
			allTemplatesLoaded: function (templates) {
				templates.sort(function (a,b) {
					return a.templateName.toLowerCase() > b.templateName.toLowerCase() ? 1 : -1
				})
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
			
			loadTemplate: function () {
				this.creating(false)
				this.service.loadTemplate(this.templateLoaded.bind(this),this.selected().templateId)
			},
			templateLoaded: function (templateData) {
				console.log(templateData)
			},
			copyTemplate: function () {
				this.creating(true);
			},
			createNewTemplate: function () {
				this.deselect()
				this.creating(true);

			},
			templateCreated: function (newTemplate) {
				this.creating(false)
				this.templates.push(newTemplate);
				this.select(newTemplate)
				
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
			newNameIsValid: function (name) {
				var valid = true;
				var existingTemplates = this.templates();
				existingTemplates.forEach(function (template) {
					if (template.templateName == name ) {
						valid = false;
					}
				})
				return valid;
			},
			nameInput: function (model,event) {
				if (event.keyCode == 13) {//enter hit
					if (this.newNameIsValid(event.target.value)) {
						this.creating(false)
						this.service.createNewTemplate(this.templateCreated.bind(this),event.target.value)
					} else {
						this.error("A template named '"+event.target.value+"' already exists")
					}

					
				}
				return true
			}
	}

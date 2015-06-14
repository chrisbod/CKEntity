( function() {
	// Register a plugin named "".
	var launchingEditor,
		templateListViewModel;
	CKEDITOR.plugins.add( 'wsdtoolbar', {
			onLoad: function() {

		},

		init: function( editor ) {
			if ( editor.blockless )
				return;
			/*editor.addCommand( 'wsdnew', {
				exec: function () {
				}		
			});*/
			editor.addCommand( 'wsdsave', {
				exec: function (editor,config) {
					TemplateService.getInstance().saveCurrentTemplate(config&&config.callback||function (data) {
						alert("Template '"+data.templateName+"' successfully saved")
					},editor.getData())
				}		
			});
			editor.addCommand( 'wsdopen', {
				exec: function (editor,dialogConfig) {
							if (!templateListViewModel) {
								templateListViewModel = new TemplateListViewModel();
								ko.applyBindings(templateListViewModel,document.getElementById("templateList"))
							}
							templateListViewModel.loadTemplates();

							
							templateListViewModel.active(true)
							
						}

					
					
					
				})		
			
			// Register the toolbar buttons.
			editor.ui.addButton && editor.ui.addButton( 'WsdOpen', {
				
				command: 'wsdopen',
				toolbar: 'document,70',
				icon: CKEDITOR.plugins.getPath('wsdtoolbar') + 'images/open.png',
				title: "Open"
			} );
			/*editor.ui.addButton && editor.ui.addButton( 'WsdNew', {
				
				command: 'wsdnew',
				toolbar: 'document,70',
				icon: "newpage",
				title: "New"
			} );*/
			
			editor.ui.addButton && editor.ui.addButton( 'WsdSave', {
				
				command: 'wsdsave',
				toolbar: 'document,70',
				icon: "save",
				title: "Save"
			} );

			editor.ui.addToolbarGroup('wallstreetdocs')


			editor.addCommand( 'openentities', {
				exec: function (editor) {
						tokenContainer.showAll()
				}
			});

			editor.ui.addButton('wsdEntity', {
				command: 'openentities',
				toolbar: 'wallstreetdocs',
				title: 'Entities',
				icon: CKEDITOR.plugins.getPath('wsdtoolbar') + 'images/entities.png'
			});

			editor.addCommand( 'opentranslations', {
				exec: function (editor) {
						translationContainer.showAll()
				}
			});

			editor.ui.addButton('wsdTranslation', {
				command: 'opentranslations',
				toolbar: 'wallstreetdocs',
				title: 'Translations',
				icon: CKEDITOR.plugins.getPath('wsdtoolbar') + 'images/translations.png'
			});
		/*	editor.ui.addButton && editor.ui.addButton( 'WsdSaveAs', {
				
				command: 'wsdsaveas',
				toolbar: 'document,70',
				icon: CKEDITOR.plugins.getPath('wsdtoolbar') + 'images/saveas.png',
				title: "SaveAs"
			} );*/
		}
	})
})()
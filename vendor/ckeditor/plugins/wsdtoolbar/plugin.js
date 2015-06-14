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
			var currentZoom = zoom.getCurrentPercentageZoom()
			var zoomLevels = {
				fitToPage: {
					label: "Fit to Window",
					role: 'menuitemcheckbox',
					group: 'zoom',
					order: 1,
					onClick: function () {
						currentZoom = "fitToPage";
						zoom.fitToWindow()
					}
				},
				"50%": {
					label: "50%",
					role: 'menuitemcheckbox',
					group: 'zoom',
					order: 2,
					onClick: function () {
						zoom.setPercentageZoom(currentZoom = "50%")
					}
				},
				"75%": {
					label: "75%",
					role: 'menuitemcheckbox',
					group: 'zoom',
					order: 3,
					onClick: function () {
						zoom.setPercentageZoom(currentZoom = "75%")
					}
				},
				"100%": {
					label: "100%",
					role: 'menuitemcheckbox',
					group: 'zoom',
					order: 4,
					onClick: function () {
						zoom.setPercentageZoom(currentZoom = "100%")
					}
				},
				"150%": {
					label: "150%",
					role: 'menuitemcheckbox',
					group: 'zoom',
					order: 5,
					onClick: function () {
						zoom.setPercentageZoom(currentZoom = "150%")
					}
				},
				"200%": {
					label: "200%",
					role: 'menuitemcheckbox',
					group: 'zoom',
					order: 6,
					onClick: function () {
						zoom.setPercentageZoom(currentZoom = "200%")
					}
				}
			}
			editor.addMenuGroup( 'zoom', 1 );
			editor.addMenuItems( zoomLevels );
			editor.ui.add( 'DocumentZoom', CKEDITOR.UI_MENUBUTTON, {
				label: "Zoom",
				//command: 'zoom',
				toolbar: 'wallstreetdocs',
				text: "Zoom",
				icon: CKEDITOR.plugins.getPath('wsdtoolbar') + 'images/zoom.png',
				init: function () {
					
				},
				onMenu: function() {
					var zoomZoom = zoom.getCurrentPercentageZoom()
					if (zoomZoom in zoomLevels) {
						currentZoom = zoomZoom
					} 
					var activeItems = {};
					
					for ( var prop in zoomLevels ) {
						
						activeItems[ prop ] = CKEDITOR.TRISTATE_OFF;
					}
					if (currentZoom) {
						activeItems[ currentZoom ] = CKEDITOR.TRISTATE_ON;
						

					}
					return activeItems;
				}
			} );
		}
	})
})()
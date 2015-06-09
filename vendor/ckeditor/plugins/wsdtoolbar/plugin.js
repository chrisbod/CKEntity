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
				exec: function () {
				}		
			});
			editor.addCommand( 'wsdopen', {
				exec: function () {
							if (!templateListViewModel) {
								templateListViewModel = new TemplateListViewModel();
								ko.applyBindings(templateListViewModel,document.getElementById("templateList"))
							}
							templateListViewModel.loadTemplates()		
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
			editor.ui.addButton && editor.ui.addButton( 'WsdSaveAs', {
				
				command: 'wsdsaveas',
				toolbar: 'document,70',
				icon: CKEDITOR.plugins.getPath('wsdtoolbar') + 'images/saveas.png',
				title: "SaveAs"
			} );
		}
	})
})()
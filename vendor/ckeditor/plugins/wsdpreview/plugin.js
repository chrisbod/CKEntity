( function() {
	// Register a plugin named "".
	var viewModel
	CKEDITOR.plugins.add( 'wsdpreview', {
			onLoad: function() {

		},

		init: function( editor ) {
			if ( editor.blockless )
				return;

			// Register the command.
			editor.addCommand( 'wsdpreviewlaunch', {
				exec: function () {
					if (!viewModel) {
						viewModel = new DocumentPreviewViewModel()
						ko.applyBindings(viewModel,document.getElementById("previewDialog"));
					}
					editor.execCommand("knockoutdialog")
                        	editor.getKnockoutDialogArguments = function () {//horrific
                        		//delete editor.getKnockoutDialogArguments;
                        		return {
                        			viewModel: viewModel,
                        			element: document.getElementById("previewDialog"),
                        			onOkay: function () {viewModel.update()},
                        			onCancel: function () {}

                        		}
                        	}
				}
			});

			// Register the toolbar button.
			editor.ui.addButton && editor.ui.addButton( 'WsdPreview', {
				
				command: 'wsdpreviewlaunch',
				toolbar: 'insert,70',
				icon: "preview"
			} );
		}
	})
})()

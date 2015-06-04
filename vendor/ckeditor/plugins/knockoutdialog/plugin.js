/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * Basic sample plugin inserting abbreviation elements into the CKEditor editing area.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */
		(function () {


			function onOkay (viewModel) {
				viewModel.active(false);
				viewModel.update();
			}
			function onCancel(viewModel) {
				viewModel.active(false);
			}

			function launchDialog(element,viewModel) {
				try {
					CKEDITOR.currentInstance.execCommand("launchKnockDialog", {
					"element": element,
					viewModel: viewModel,
					onOkay: onOkay.bind(null,viewModel),
					onCancel: onCancel.bind(null,viewModel)
				})
	 			} catch (e) {
					console.log(e)
				}
			}
			function launchIfNeeded(element,viewModel,isActive) {
				if (isActive) {
					launchDialog(element,viewModel)
				} 
			}
		ko.bindingHandlers.ckeditorDialog = {
			init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
				
			},
		update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

			
			valueAccessor().subscribe(launchIfNeeded.bind(null,element,viewModel),null,"change")
		}
}
	



})();
// Register the plugin within the editor.
CKEDITOR.plugins.add( 'knockoutdialog', {

	

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		
		// Define an editor command that opens our dialog window.
		var dialog = new CKEDITOR.dialogCommand( 'knockoutDialog' );
		
		
		editor.addCommand( 'knockoutdialog', dialog  );
		editor.addCommand('launchKnockDialog',{
                        exec : function(editor,data) {
                        	
                        	editor.execCommand("knockoutdialog")
                        	editor.getKnockoutDialogArguments = function () {//horrific
                        		//delete editor.getKnockoutDialogArguments;
                        		return data
                        	}
                        	

                        }
              
         })

		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'knockoutDialog', this.path + 'dialogs/knockout.js' );
	}
});

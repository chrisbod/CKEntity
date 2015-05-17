/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * Basic sample plugin inserting abbreviation elements into the CKEditor editing area.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'knockoutdialog', {

	// Register the icons.
	icons: 'abbr',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		
		// Define an editor command that opens our dialog window.
		var dialog = new CKEDITOR.dialogCommand( 'knockoutDialog' );
		
		
		editor.addCommand( 'knockoutdialog', dialog  );
		editor.addCommand('launchKnockDialog',{
                        exec : function(editor,data) {
                        	editor.execCommand("knockoutdialog")
                        	editor.getKnockoutDialogArguments = function () {
                        		return data
                        	}
                        	

                        }
              
         })


		// Create a toolbar button that executes the above command.
		editor.ui.addButton( 'Knockout', {

			// The text part of the button (if available) and the tooltip.
			label: 'Knockout',

			// The command to execute on click.
			command: 'launchKnockDialog',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'insert'
		});

		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'knockoutDialog', this.path + 'dialogs/knockout.js' );
	}
});

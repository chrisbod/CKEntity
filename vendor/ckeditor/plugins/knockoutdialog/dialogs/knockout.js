/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * The abbr plugin dialog window definition.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */

// Our dialog definition.
CKEDITOR.dialog.add( 'knockoutDialog', function( editor ) {
	//console.log(arguments)

	function EnterBlocker() {

	}
	EnterBlocker.prototype = {
		attach: function (element) {
			this.element = element
			element.addEventListener("keydown", this,true)

		},
		detach: function () {
			this.element.removeEventListener("keydown", this, true)
		},
		handleEvent: function (event) {
			if (event.keyCode == 13) {
					event.stopPropagation()
			}
		}
	}
	var enterBlocker = new EnterBlocker();

	return {

		// Basic properties of the dialog window: title, minimum size.
		title: 'Entity Properties',


		// Dialog window content definition.
		contents: [
			{
				 
            id: 'knockout',
            label: '',
            title: '',
            elements: [
                {
                    type: 'html',
                    html: '<section id="knockoutWrapper"></section>'
                }
            ]
        }],
		onShow: function () {
			var data = editor.getKnockoutDialogArguments(); //deeply horrific
			if (data) {
				var wrapper = document.getElementById("knockoutWrapper");
				enterBlocker.attach(wrapper)
				wrapper.appendChild(data.element)
				//this.layout()
			}
		},
		// This method is invoked once a user clicks the OK button, confirming the dialog.
		onOk: function() {
			delete editor.getKnockoutDialogArguments
		}
	};
});

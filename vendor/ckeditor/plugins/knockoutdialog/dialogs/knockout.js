

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
	var knockoutNode;
	var data;
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
			data = editor.getKnockoutDialogArguments(); //deeply horrific
			if (data) {
				var wrapper = document.getElementById("knockoutWrapper");
				enterBlocker.attach(wrapper)
				knockoutNode = data.element;
				wrapper.appendChild(data.element)
			}
		},
		// This method is invoked once a user clicks the OK button, confirming the dialog.
		onOk: function() {
			enterBlocker.detach();
			document.body.appendChild(knockoutNode);
			delete editor.getKnockoutDialogArguments
			data.onOkay()
			
		},
		onCancel: function () {
			enterBlocker.detach();
			document.body.appendChild(knockoutNode);
			delete editor.getKnockoutDialogArguments
			data.onCancel()
		}
	};
});

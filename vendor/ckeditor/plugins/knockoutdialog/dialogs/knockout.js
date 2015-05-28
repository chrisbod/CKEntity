

CKEDITOR.dialog.add( 'knockoutDialog', function( editor ) {

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


	function reflowDialog(dialogContentsElement,dialogContainer) {
		dialogContentsElement.style.maxWidth = "";
		var naturalFlowedContentsRect = dialogContentsElement.getBoundingClientRect();
		var newWidth = Math.min(naturalFlowedContentsRect.width,window.innerWidth)-40;
		//dialogContentsElement.style.maxWidth = newWidth+"px";
		dialogContentsElement.style.maxHeight = (dialogContentsElement.offsetHeight-40)+"px"
		dialogContentsElement.style.minWidth = ((dialogContentsElement.offsetWidth/2)-40)+"px"
		return parseInt(dialogContentsElement.style.minWidth);
	}
	var enterBlocker = new EnterBlocker();
	var knockoutNode;
	var data;
	return {

		// Basic properties of the dialog window: title, minimum size.
		title: 'Entity Properties',
		minWidth: 200,
		minHeight: 120,


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

				var minWidth = reflowDialog(data.element)

				wrapper.appendChild(data.element);
				

				if (data.title) {
					document.querySelector(".cke_dialog_title").innerHTML = data.title
				}
				

				
			}
			this.layout()
			//remove horizontal scrollbar
			for (var currentElement = wrapper; currentElement; currentElement=currentElement.parentNode) {
					if (currentElement.style.width == "200px") {
						
						currentElement.style.minWidth = (minWidth+10)+"px";
						console.log(currentElement)
						break;
					}
				}
		},
		// This method is invoked once a user clicks the OK button, confirming the dialog.
		onOk: function() {
			enterBlocker.detach();
			document.body.appendChild(knockoutNode);
			data.onOkay()
			
		},
		onCancel: function () {
			enterBlocker.detach();
			document.body.appendChild(knockoutNode);
			data.onCancel()
		}
	};
});

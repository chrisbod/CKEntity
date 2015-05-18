

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
		minWidth: 300,
		minHeight: 100,


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
				//console.log(data.element.getBoundingClientRect())
				wrapper.appendChild(data.element);
				


				var rect = this.parts.dialog.$.getBoundingClientRect();
				var overspill = rect.bottom-window.innerHeight,
					windowWidth = window.innerWidth,
					widthLeft = windowWidth - (rect.width+100)
				if (overspill>0) {
	
					var element = wrapper.parentNode;
					while (element) {
						if (element.style.width) {

							console.log(parseInt(element.style.width))
							element.style.width = 600+"px"
							break;
						} else {
							element = element.parentNode
						}
					}

					var rect = this.parts.dialog.$.getBoundingClientRect();
					var overspill = rect.bottom-window.innerHeight
					if (overspill>0) {

						wrapper.style.height = (wrapper.offsetHeight - overspill) + "px"
					}
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

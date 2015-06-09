

CKEDITOR.dialog.add( 'knockoutDialog', function( editor ) {

	function EnterBlocker() {

	}
	EnterBlocker.prototype = {
		attach: function (element) {
			this.element = element
			element.addEventListener("keydown", this,true)

		},
		detach: function () {
			//this.element.removeEventListener("keydown", this, true)
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
		dialogContentsElement.style.maxWidth = newWidth+"px";
		dialogContentsElement.style.maxHeight = (dialogContentsElement.offsetHeight-40)+"px"
		dialogContentsElement.style.minWidth = ((dialogContentsElement.offsetWidth/2)-40)+"px"
		return parseInt(dialogContentsElement.style.minWidth);
	}
	var enterBlocker = new EnterBlocker();
	var knockoutNode;
	var data;
	var dialogWrapper;
	return {

		// Basic properties of the dialog window: title, minimum size.
		title: 'Wall Street Docs',
		minWidth: 360,
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
				if (data.viewModel.editorButtonsToHide) {
					data.viewModel.editorButtonsToHide.forEach(function (buttonId) {
						document.getElementById(this.getButton(buttonId).domId).style.display='none';
					},this)

				}
				


				var rect = this.parts.dialog.$.getBoundingClientRect();
				var overspill = rect.bottom-window.innerHeight,
					windowWidth = window.innerWidth,
					widthLeft = windowWidth - (rect.width+100)
				if (overspill>0) {
	
					var element = wrapper.parentNode;
					while (element) {
						if (element.style.width) {

							//element.style.width = 600+"px"
							break;
						} else {
							element = element.parentNode
						}
					}

					var rect = this.parts.dialog.$.getBoundingClientRect();
					var overspill = (rect.bottom-window.innerHeight)
					if (overspill>0) {

						wrapper.style.height = (wrapper.offsetHeight - overspill) + "px"
					}
					var scrollElement = wrapper;
					while (scrollElement) {
						if (scrollElement.getAttribute("name") == "knockout") {
							scrollElement = scrollElement.parentNode;
							break;
						} 
						scrollElement = scrollElement.parentNode;
					}
					if (scrollElement.scrollHeight > scrollElement.offsetHeight) {
						var size = this.getSize(),
							newWidth = Math.max(window.innerWidth/2,size.width)-40
						this.resize(newWidth,size.height);
						this.move((window.innerWidth-newWidth)/2,(window.innerHeight-size.height)/2)
					} 

					
				}
			}
		},
		onHide: function () {
			document.getElementById("knockoutWrapper").style.height = ""
			this.resize(360,100)
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

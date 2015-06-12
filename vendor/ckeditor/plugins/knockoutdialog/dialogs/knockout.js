

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
	var storedConfig,
	restoreOpacity


	function configureDialog(dialog,config) {

		if (config.buttonsToHide) {
				config.buttonsToHide.forEach(function (buttonId) {
					document.getElementById(dialog.getButton(buttonId).domId).style.display='none';
				},dialog)
		}
		if (config.removeOpacity) {
			document.querySelector("div.cke_dialog_background_cover").style.opacity = "0"
			restoreOpacity = true
		}
		if (config.disableClose) {
			dialog.getElement().$.querySelector("a.cke_dialog_close_button").style.display = "none"
		}
		if (config.expandToFit) {
			var wrapper = document.getElementById("knockoutWrapper");
			while (wrapper) {
				wrapper.style.height = "100%";
				if (wrapper.getAttribute("name") == "knockout") {
					wrapper = null;
					break;
				}
				wrapper = wrapper.parentNode
			}
		}
		storedConfig = config;	
	}

	function removeDialogConfiguration(dialog) {
		var config = storedConfig;
		if (config) {
			if (config.buttonsToHide) {
				config.buttonsToHide.forEach(function (buttonId) {
					document.getElementById(dialog.getButton(buttonId).domId).style.display='';
				},dialog)
			}
			if (config.removeOpacity) {
				document.querySelector("div.cke_dialog_background_cover").style.opacity = "0.5"
				restoreOpacity = true
			}
			if (config.disableClose) {
				dialog.getElement().$.querySelector("a.cke_dialog_close_button").style.display = ""
			}
			if (config.expandToFit) {
			var wrapper = document.getElementById("knockoutWrapper");
			while (wrapper) {
				wrapper.style.height = "";
				if (wrapper.getAttribute("name") == "knockout") {
					wrapper = null;
					break;
				}
				wrapper = wrapper.parentNode
			}
		}
		}
		storedConfig = null;
	}

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
				if (data.dialogConfig||data.viewModel.dialogConfig) {

					configureDialog(this,data.dialogConfig||data.viewModel.dialogConfig())
				}
				

				var rect = this.parts.dialog.$.getBoundingClientRect();
				var overspill = rect.bottom-window.innerHeight,
					windowWidth = window.innerWidth,
					widthLeft = windowWidth - (rect.width+100),
					size = this.getSize(),
					width = size.width
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
					//wrapper.style.height = "100%"
					var scrollElement = wrapper;
					while (scrollElement) {
						if (scrollElement.className == "cke_dialog_contents_body") {
							scrollElement
							break;
						} 
						scrollElement = scrollElement.parentNode;
					}
					size = this.getSize(),
					width = size.width;
					if (scrollElement.scrollHeight > scrollElement.offsetHeight) {
						console.log(scrollElement.scrollHeight,scrollElement.offsetHeight)
						//width = Math.max(window.innerWidth/2,size.width)
						
					} 
					if (scrollElement.scrollWidth > scrollElement.clientWidth) {

						width = Math.max(window.innerWidth/1.5,scrollElement.scrollWidth)
						scrollElement.style.minWidth = width+"px"
					} 
					
					
				}
				this.resize(width,size.height);
				this.move((window.innerWidth-width)/2,(window.innerHeight-size.height)/2)
			}
		},
		onHide: function () {
			document.getElementById("knockoutWrapper").style.height = "";
			if (restoreOpacity) {
				document.querySelector("div.cke_dialog_background_cover").style.opacity = "0.5";
			}
			this.resize(360,100)
			document.body.appendChild(data.element)
			removeDialogConfiguration(this);

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

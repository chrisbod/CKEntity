var knockoutDialogFactory = {
	dialogs: [],
	registerDialogs: function (editor) {
		this.dialogs.forEach(function (name) {
			editor.addCommand(name, new CKEDITOR.dialogCommand(name));
		})
	},
	addDialog: function (dialogName,title,width,height) {
		this.dialogs.push(dialogName)
		CKEDITOR.dialog.add( dialogName , function (editor) {
				var data,
					restoreOpacity
			return {
				// Basic properties of the dialog window: title, minimum size.
				title: title,
				minWidth: width,
				minHeight: height,
				// Dialog window content definition.
				contents: [
					{
						 
		            id: dialogName,
		            label: '',
		            title: '',
		            elements: [
		                {
		                    type: 'html',
		                    html: '<section id="'+dialogName+'Wrapper"></section>'
		                }
		            ]
		        }],
				onShow: function () {
					data = editor.getKnockoutDialogArguments(); //deeply horrific
					if (data) {
						var wrapper = document.getElementById(dialogName+'Wrapper');
						wrapper.appendChild(data.element);
						var element = wrapper;
						while (element.className != "cke_dialog_contents_body") {
							element.style.height = "100%"
							element = element.parentNode;

						}
						element.style.display = "block";
						element.style.marginTop = 0;
					}
				},
				onHide: function () {
					if (restoreOpacity) {
						document.querySelector("div.cke_dialog_background_cover").style.opacity = "0.5";
					}
					document.getElementById("knockoutTemplates").appendChild(data.element)

				},
				// This method is invoked once a user clicks the OK button, confirming the dialog.
				onOk: function() {
					document.getElementById("knockoutTemplates").appendChild(data.element)
					data.onOkay()
					
				},
				onCancel: function () {
					document.getElementById("knockoutTemplates").appendChild(data.element)
					data.onCancel()
				}
			};
		})
	}
}




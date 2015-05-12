CKEDITOR.plugins.add( 'autosuggest', {
    init: function( editor ) {

    	editor.addCommand('autosuggest.open', {
    		exec: function (editor) {
    			console.log(document.getSelection())
    			var selection = editor.document.$.getSelection()
    			if (selection.rangeCount==0) {
    				console.log("DO NOTHING")
    			} else {
    				var rect = editor.document.$.getSelection().getRangeAt(0).getClientRects();
    				//editor.contextMenu.show(editor.document.getBody(), null,rect[0].right, rect[0].top );
    			}
    			/*
    			console.log(rect)*/
    			//editor.contextMenu.show(editor.document
//                                    .getBody(), null, 0,0 );
    		}

    	})


    	editor.on('key', function(evt) {
    		
                        if (evt.data.keyCode == 2228446) {
                            editor.execCommand('autosuggest.open');
                        }
                    });

    	editor.addCommand('autosuggest.close', {
    		exec: function (editor) {

    		}
    	})

        editor.addCommand( 'autosuggest.update', {
		    exec: function( editor ) {
		    }
		});
    }
});


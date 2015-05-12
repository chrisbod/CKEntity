/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	CKEDITOR.plugins.add( 'wordpaste', {
		init: function( editor ) {
			var editElement = editor.element.$;

			var pasteManager = EntityPasteManager.getInstance(editElement);
			pasteManager.addPasteComplete(function (newRange) {
				editor.execCommand("cleanword",newRange)
			})
			CKEDITOR.scriptLoader.load( CKEDITOR.getUrl( ( this.path.replace("wordpaste","pastefromword") + 'filter/default.js' ) ), null, true );
				// Flag indicate this command is actually been asked instead of a generic pasting.
				

			editor.addCommand('cleanword', {
				// Snapshots are done manually by editable.insertXXX methods.
				canUndo: false,

				exec: function( editor, range ) {
					
				}
			} );
		}

	} );


} )();



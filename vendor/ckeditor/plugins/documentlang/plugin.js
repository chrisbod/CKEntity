/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview [Language](http://ckeditor.com/addon/language) plugin.
 */


( function() {

	var allowedContent = 'span[!lang,!dir]',
		requiredContent = 'span[lang,dir]',
		changing = false;
	var currentEditorLanguageId = CKEDITOR.lang.detect().replace(/-\w+$/,'');

	CKEDITOR.plugins.add( 'documentlang', {
		requires: 'menubutton',
		icon: "",

		init: function( editor ) {
			var languagesConfigStrings = ( editor.config.language_list || [ 'ar:Arabic:rtl', 'fr:French', 'es:Spanish' ] ),
				plugin = this,
				lang = editor.lang.language,
				items = {},
				parts,
				curLanguageId, // 2-letter language identifier.
				
				languageButtonId, // Will store button namespaced identifier, like "language_en".
				i;


			function changeLanguage(editor,languageId) {
				
					  		currentEditorLanguageId = languageId
					  		build(editor,editor.editable().$,currentEditorLanguageId);//horrible


					 
			}
			editor.on( 'contentDom', function() {
					  var editable = editor.editable();
					  build(editor,editable.$,currentEditorLanguageId);//horrible
					   // entities.css
					  var doc = editable.$.ownerDocument;
					   var stylesheet = doc.createElement("link")
					  	stylesheet.setAttribute("rel","stylesheet")
					  	stylesheet.setAttribute("href","css/entities.css")
					  doc.querySelector("head").appendChild(stylesheet)
					    
					    
					})
			editor.on("contentDom", function () {
			var doc = editor.editable().$.ownerDocument;
						  var language = doc.querySelector("html[lang]");
					if (!changing) {
						  //entities.css
						  
						  if (language) {
						  	var documentLanguage = language.getAttribute("lang");
						  	if (documentLanguage!=currentEditorLanguageId) {
						  		
						  		changeLanguage(editor,documentLanguage)
						  	}
						  	
						  }
					} else {
						var language =language.setAttribute("lang",currentEditorLanguageId);
						changing = false
					}
				})

			// Registers command.
			editor.addCommand( 'documentlanguage', {
				exec: function( editor, languageId ) {
					if (currentEditorLanguageId!=languageId) {
						currentEditorLanguageId = languageId
						changing = true
						document.querySelector(".cke_button__documentlanguage_label").innerText = currentEditorLanguageId
						changeLanguage(editor,languageId)

					}
					
					
				},
				refresh: function( editor ) {
					
					//this.setState(currentEditorLanguageId ?
						//CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF );
				}
			} );

			// Parse languagesConfigStrings, and create items entry for each lang.
			for ( i = 0; i < languagesConfigStrings.length; i++ ) {
				parts = languagesConfigStrings[ i ].split( ':' );
				curLanguageId = parts[ 0 ];
				languageButtonId = 'documentlanguage_' + curLanguageId;

				items[ languageButtonId ] = {
					label: parts[ 1 ],
					langId: curLanguageId,
					group: 'documentlanguage',
					order: i,
					// Tells if this language is left-to-right oriented (default: true).
					ltr: ( '' + parts[ 2 ] ).toLowerCase() != 'rtl',
					onClick: function() {
						editor.execCommand( 'documentlanguage', this.langId );

					},
					role: 'menuitemcheckbox'
				};

			}

			

			// Initialize groups for menu.
			editor.addMenuGroup( 'documentlanguage', 1 );
			editor.addMenuItems( items );

			editor.ui.add( 'DocumentLanguage', CKEDITOR.UI_MENUBUTTON, {
				label: currentEditorLanguageId,
				command: 'documentlanguage',
				text: currentEditorLanguageId,
				init: function () {
					
				},
				onMenu: function() {
					var activeItems = {};
						//currentLanguagedElement = plugin.getCurrentLangElement( editor );
						
					for ( var prop in items ) {
						
						activeItems[ prop ] = CKEDITOR.TRISTATE_OFF;
					}
					if (currentEditorLanguageId) {
						activeItems[ 'documentlanguage_' + currentEditorLanguageId ] = CKEDITOR.TRISTATE_ON;
						

					}
					//console.log(editor)


					//activeItems.language_remove = currentLanguagedElement ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED;

					//if ( currentLanguagedElement )
						//activeItems[ 'language_' + currentLanguagedElement.getAttribute( 'lang' ) ] = CKEDITOR.TRISTATE_ON;

					return activeItems;
				}
			} );
		}
	} );
} )();


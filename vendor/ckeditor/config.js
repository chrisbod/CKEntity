/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	 //config.uiColor = '#AADC6E';
	 config.title=false;
	 config.disableNativeSpellChecker = false;
	 config.allowedContent = true;
	//config.extraAllowedContent = 'translation token conditional';
	config.extraPlugins = 'wallstreetdocs,wordpaste,menub,pagebreaktag,wsdpreview'
	config.removePlugins = 'magicline, pastetext, pastefromword, clipboard'
	config.contentsCss = 'css/kid.css';
};

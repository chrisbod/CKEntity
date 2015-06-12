function LanguageHandler() {
	this.currentEditorLanguage = this.getCurrentEditorLanguage();
	this.documentTranslator = new DocumentTranslator();
	this.autoSuggests = [];
}
LanguageHandler.getInstance = function () {
	if (!this.instance) {
		this.instance = new this();
	}
	return this.instance;
}
LanguageHandler.prototype = {
	currentEditorLanguage: "",
	wsdLanguageState: "",
	documentLanguageState: "",
	languageStore: null,
	setPaths: function (tokenPath,logicPath,translationPath,allTagsListPath) {
		this.languageStore = new LanguageStore(tokenPath,logicPath,translationPath,allTagsListPath);
		this.documentTranslator.languageStore = this.languageStore;
	},
	getCurrentEditorLanguage: function () {
		return CKEDITOR.lang.detect().replace(/-\w+$/,'');
	},
	setDocumentLanguage: function (editor,languageId) {
		var doc = editor.editable().$.ownerDocument;
		doc.querySelector("html").setAttribute("lang",languageId);
		this.documentLanguageState = languageId;
	},
	getDocumentLanguage: function (editor) {
		var doc = editor.editable().$.ownerDocument;
		var documentLanguage = doc.querySelector("html").getAttribute("lang")
		if (!documentLanguage) {
			this.setDocumentLanguage(editor,this.getCurrentEditorLanguage())
			documentLanguage = this.documentLanguageState;
		}
		return documentLanguage;
	},
	setCKEditorMenuButtonLanguageText: function (editor,languageId) {
		
	},
	setWSDLanguageState: function (editor,languageId) {
		this.wsdLanguageState = languageId;
		//editor.execCommand()
	},
	getWSDLanguageState: function () {
		return this.wsdLanguageState;
	},
	changeDropdownState: function () {

	},
	languageRequested: function (editor,languageId) {
		this.languageStore.installLanguage(languageId,this.languageRequestLoaded.bind(this,editor,languageId))
	},
	languageRequestLoaded: function (editor,languageId) {
		this.setWSDLanguageState(editor,languageId)
		this.translateDocument(editor,languageId);
		this.onTranslate(languageId);
	},
	documentLoaded: function (editor) {
		var documentLanguage = this.getDocumentLanguage(editor),
			editorLanguage = this.getCurrentEditorLanguage(),
			wsdDropdownLanguage = this.getWSDLanguageState();
		this.languageStore.installLanguage(documentLanguage,this.languageLoaded.bind(this,editor,documentLanguage))
	},
	languageLoaded: function (editor,language) {
		editor.execCommand("documentlanguage",language);
	},
	translateDocument: function (editor,languageId) {
		this.setDocumentLanguage(editor,languageId)
		this.documentTranslator.translate(editor.editable().$.ownerDocument.body,languageId);
		this.languageStore.setCurrentLanguage(languageId)
	}
}

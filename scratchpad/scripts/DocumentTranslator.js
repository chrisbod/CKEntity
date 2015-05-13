function DocumentTranslator(languageStore) {
	this.languageStore = languageStore;
	this.entitiesHelper = new EntitiesHelper();
}
DocumentTranslator.prototype = {
	translate: function (elementToTranslate,languageId) {
		this.translateTokens(elementToTranslate,languageId);
		this.translateKeys(elementToTranslate,languageId);
	},
	translateTokens: function (element,language) {
		var tokens = element.querySelectorAll("token"),
			store = this.languageStore.languages[language].tokenStore,
			helper = this.entitiesHelper;
		for (var i=0;i<tokens.length;i++) {
			var args = helper.getDataArguments(tokens[i]),
				newNode = store.getEntityNode(args.type);
			helper.setDataArguments(newNode,args)
			tokens[i].parentNode.replaceChild(newNode,tokens[i]);
			
		}
	},
	translateKeys: function () {

	}



}
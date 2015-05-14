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
			tokenStore = this.languageStore.getTokenStoreByLanguage(language),
			helper = this.entitiesHelper,
			args, newNode;
		for (var i=0;i<tokens.length;i++) {
			args = helper.getDataArguments(tokens[i]);
			newNode = tokenStore.getEntityNode(args.type);
			helper.setDataArguments(newNode,args)
			tokens[i].parentNode.replaceChild(newNode,tokens[i]);
			
		}
	},
	translateKeys: function (element,language) {
		var keys = element.querySelectorAll("translation"),
			translationStore = this.languageStore.getTranslationStoreByLanguage(language),
			helper = this.entitiesHelper,
			args, newNode;
		for (var i=0;i<keys.length;i++) {
			args = helper.getDataArguments(keys[i]);
			newNode = translationStore.getEntityNode(args.key);
			helper.setDataArguments(newNode,args);
			this.translateConditionals(newNode,language)
			keys[i].parentNode.replaceChild(newNode,keys[i])
		}
	},
	translateConditionals: function (element, language) {
		var conditionals = element.querySelectorAll("conditional"),
			translationStore = this.languageStore.getTranslationStoreByLanguage(language),
			helper = this.entitiesHelper,
			args, newNode;
		for (var i=0;i<conditionals.length;i++) {
			//args = helper.getDataArguments(keys[i]);
			//newNode = translationStore.getEntityNode(args.key);
			//helper.setDataArguments(newNode,args);
			//keys[i].parentNode.replaceChild(newNode,keys[i])
		}
	}



}
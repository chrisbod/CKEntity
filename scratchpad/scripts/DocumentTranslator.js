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
			this.synchronizeConditionals(newNode,element,language)
			keys[i].parentNode.replaceChild(newNode,keys[i])
		}
	},
	synchronizeConditionals: function (newElement, oldElement, language) {
		var originalConditionals = oldElement.querySelectorAll("conditional"),
			newConditionals = newElement.querySelectorAll("conditional"),
			lookup = {}
		for (var i = 0;i<newConditionals.length;i++) {
			lookup[this.entitiesHelper.getDataArgument(newConditionals[i],"conditional")] = newConditionals[i]; 
		}
		for (i=0;i<originalConditionals.length;i++) {
			lookup[this.entitiesHelper.getDataArgument(newConditionals[i],"conditional")].setAttribute("data-args",originalConditionals[i].getAttribute("data-args"))
		}

	}



}
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
			console.log(args)
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
			this.synchronizeConditionals(newNode,keys[i],language)
			keys[i].parentNode.replaceChild(newNode,keys[i])
		}
	},
	synchronizeConditionals: function (newElement, oldElement, language) {
		var originalConditionals = oldElement.querySelectorAll("conditional:not(.user)"),
			newConditionals = newElement.querySelectorAll("conditional:not(.user)"),
			lookup = {};
		if (originalConditionals.length!=newConditionals.length) {
			throw new Error("Non matching keys")
		}
		for (var i = 0;i<newConditionals.length;i++) {
			var args = this.entitiesHelper.getDataArguments(newConditionals[i])
			console.log("new",args)
			lookup[args.conditional] = 
				newConditionals[i]
			
		}
		for (i=0;i<originalConditionals.length;i++) {
			var args = this.entitiesHelper.getDataArguments(originalConditionals[i])
			console.log("orig",args,originalConditionals[i].getAttribute("data-args"));
			
			lookup[args.conditional].setAttribute("data-args",originalConditionals[i].getAttribute("data-args"))
		}

	}



}
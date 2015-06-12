function DocumentTranslator(languageStore) {
	this.entitiesHelper = new EntitiesHelper();
}
DocumentTranslator.getInstance = function (languageStore) {
	if (!this.instance) {
		this.instance = new this()
	}
	return this.instance;
}
DocumentTranslator.prototype = {
	languageStore: null,
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
			if (!args.key) {
				newNode = tokenStore.getEntityNode(args.name).firstElementChild;

				newNode.setAttribute("data-args",tokens[i].getAttribute("data-args")||'')
				newNode.setAttribute("data-json",tokens[i].getAttribute("data-json")||'')
				tokens[i].parentNode.replaceChild(newNode,tokens[i]);
			}
			
		}
	},
	translateKeys: function (element,language) {
		
		var keys = element.querySelectorAll("translation"),
			translationStore = this.languageStore.getTranslationStoreByLanguage(language),
			helper = this.entitiesHelper,
			args, newNode;
		for (var i=0;i<keys.length;i++) {
			args = helper.getDataArguments(keys[i]);
			newNode = translationStore.getEntityNode(args.id).firstElementChild;
			newNode.setAttribute("data-args",keys[i].getAttribute("data-args")||'')
			newNode.setAttribute("data-json",keys[i].getAttribute("data-json")||'')
			this.synchronizeConditionals(newNode,keys[i])
			this.synchronizeTokens(newNode,keys[i])
			keys[i].parentNode.replaceChild(newNode,keys[i]);

		}
	},
	synchronizeConditionals: function (newElement, oldElement) {
		
		var originalConditionals = oldElement.querySelectorAll("conditional"),
			newConditionals = newElement.querySelectorAll("conditional"),
			lookup = {};
		
		for (var i = 0;i<newConditionals.length;i++) {
			var args = this.entitiesHelper.getDataArguments(newConditionals[i])
			if (lookup[args.conditional]) {
				alert("Invalid translation provided for" + newConditionals[i].innerText);
				continue
			}
			lookup[args.conditional] = newConditionals[i]
			
		}
		for (i=0;i<originalConditionals.length;i++) {
			var args = this.entitiesHelper.getDataArguments(originalConditionals[i])
			var node = lookup[args.conditional]
			node.setAttribute("data-args",originalConditionals[i].getAttribute("data-args")||'')
			//node.firstElementChild.setAttribute("data-args",originalConditionals[i].getAttribute("data-args")||'')
		}

	},
	synchronizeTokens: function (newElement, oldElement) {
		var newTokens = newElement.querySelectorAll("token"),
			oldTokens = oldElement.querySelectorAll("token"),
			idLookup = {},
			id,
			args;
		for (var i=0;i<oldTokens.length;i++) {

			args = this.entitiesHelper.getDataArguments(oldTokens[i]);
			
			
			idLookup[args.id] = oldTokens[i].getAttribute("data-args");
		}

		for (var i=0;i<newTokens.length;i++) {
			args = this.entitiesHelper.getDataArguments(newTokens[i]);
			id = args.id;
			newTokens[i].setAttribute("data-args",idLookup[id]||'')
		}

	}



}
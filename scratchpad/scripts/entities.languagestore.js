function LanguageStore(tokenPath,logicPath,translationPath,allTagsListPath) {
	this.languages = {};
	this.tokenPath = tokenPath;
	this.logicPath = logicPath;
	this.translationPath = translationPath;
	this.allTagsListPath = allTagsListPath;
	this.crossRefs = {}
}
LanguageStore.prototype = {
	currentLanguage: "",
	setCurrentLanguage: function (language) {
		this.currentLanguage = language;
	},
	installLanguage: function (language,callback) {
		if (this.languages[language]) {//language has been requested already
			if (this.languages[language].complete) {//language is fully loaded
				this.languageCompleteCallback = null; // remove any pending callback as its stale
				callback(this.languages[language]);
				return;
			} else {//still loading so drop previous callbacks
				this.languageCompleteCallback = callback;
			}
		} else {
			this.languageCompleteCallback = callback;
			this.currentlyLoadingLanguage = language;
			this.addLanguage(language);
		}
	},
	getTokenDefinitionsByLanguage: function (language) {
		return this.languages[language].tokenDefinitions;
	},
	getLogicDefinitionsByLanguage: function (language) {
		return this.languages[language].logicDefinitions;
	},
	getTokenTokenizerByLanguage: function (language) {
		return this.languages[language].tokenTokenizer;
	},
	getSentenceTokenizeByLanguager: function (language) {
		return this.languages[language].sentenceTokenizer;
	},
	getTokenStoreByLanguage: function (language) {
		return this.languages[language].tokenStore;
	},
	getTranslationStoreByLanguage: function (language) {
		return this.languages[language].translationStore;
	},
	getSentenceTokenizerByLanguage: function (language) {
		return this.languages[language].sentenceTokenizer;
	},
	getCurrentLogicDefinitions: function () {
		return this.languages[this.currentLanguage].logicDefinitions;
	},
	getCurrentTokenDefinitions: function () {
		return this.languages[this.currentLanguage].tokenDefinitions;
	},
	addLanguage: function (id) {
		this.currentlyLoadingLanguage = id;
		var tokenStore =  new TokenStore();
		this.languages[id] = {
			id: id,
			tokenStore:tokenStore,
			translationStore: new TranslationStore(tokenStore),
			logicDefinitions: null,
			tokenDefinitions: null,
			translationDefinitions: null,
			sentenceTokenizer: new SentenceTokenizer(),
			tokenTokenizer:  new TokenTokenizer(),
			complete: false
		};
		this.loadCrossRefs(id)
		//;
	},
	loadLogic: function (languageId) {
		$.ajax(this.logicPath+languageId.toUpperCase()+".json", {
			mimeType: "application/json",
			success: this.logicLoaded.bind(this,languageId)
		})
	},
	logicLoaded: function (languageId,logic) {
		if (!this.logicLength) {
			this.logicLength = logic.length
		} else if (this.logicLength != logic.length) {
			throw new Error("Inconsistent token definition sizes")
		}
		this.languages[languageId].logicDefinitions = logic;
		logic.forEach(function (logicTag) {
			logicTag.id = this.crossRefs[logicTag.tagId]
		},this)
		logic.sort(function (a,b) {
		return a.text > b.text ? 1 : -1
		})
		this.loadTranslations(languageId)
	},
	loadCrossRefs: function (id,callback) {
		$.ajax(this.allTagsListPath+".json", {
			mimeType: "application/json",
			success: this.crossRefsLoaded.bind(this,id)
		})
	},
	crossRefsLoaded: function (id,crossRefs) {
		crossRefs.forEach(function (crossRef) {
			this.crossRefs[crossRef.tagId] = crossRef.tagName
		},this)
		this.loadTokens(id)
	},
	loadTokens: function (languageId) {
		$.ajax(this.tokenPath+languageId.toUpperCase()+".json", {
			mimeType: "application/json",
			success: this.tokensLoaded.bind(this,languageId)
		})
	},
	tokensLoaded: function (id,tokens) {
		if (!this.tokensLength) {
			this.tokensLength = tokens.length
		} else if (this.tokensLength != tokens.length) {
			throw new Error("Inconsistent token definition sizes")
		}
		var store = this.languages[id].tokenStore;
		this.languages[id].tokenDefinitions = tokens;
		tokens.forEach(function (token) {
			token.name = this.crossRefs[token.tagId]
			token.id = token.tagId;
			var readOnly = (!token.groups || !token.groups.length) && (!token.items || !token.items.length)
			this.languages[id].tokenStore.addEntity('<'+token.text+'>',this.crossRefs[token.tagId],readOnly)
		},this);
		this.loadLogic(id)
	},
	loadTranslations: function (languageId) {
		$.ajax(this.translationPath+languageId.toUpperCase()+".json", {
			mimeType: "application/json",
			success: this.translationsLoaded.bind(this,languageId)
		});
	},
	translationsLoaded: function (languageId,translations) {
		if (!this.translationsLength) {
			this.translationsLength = translations.length
		} else if (this.translationsLength != translations.length) {
			//throw new Error("Inconsistent translation sizes")
		}
		translations.forEach(function (translation) {
			this.languages[languageId].translationStore.addEntity(translation.text,translation.parentTranslationId || translation.translationId)
		},this)
		this.languages[languageId].translationDefinitions = translations;
		this.languages[languageId].complete = true;
		this.currentlyLoadingLanguage = null;
		if (this.currentlyLoadingLanguage == languageId) {
			if (this.languageCompleteCallback) {
				this.languageCompleteCallback(this.languages[languageId])
			}
		}
	}
}
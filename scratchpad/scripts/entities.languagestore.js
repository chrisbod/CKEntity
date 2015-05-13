function LanguageStore(tokenPath,logicPath,translationPath) {
	this.languages = {};
	this.tokenPath = tokenPath;
	this.logicPath = logicPath;
	this.translationPath = translationPath;
}
LanguageStore.prototype = {
	currentLanguage: "",
	installLanguage: function (language,callback) {
		if (!this.languages[language]) {
			this.addLanguage(language,callback)
		} else {
			callback(this.languages[language])
		}
	},
	getCurrentTokenDefinitions: function () {
	
		return this.languages[this.currentLanguage].tokenDefinitions;
	},
	getCurrentLogicDefinitions: function () {
		return this.languages[this.currentLanguage].logicDefinitions;
	},
	getCurrentTokenTokenizer: function () {
		return this.languages[this.currentLanguage].tokenTokenizer;
	},
	getCurrentSentenceTokenizer: function () {
		return this.languages[this.currentLanguage].sentenceTokenizer;
	},
	addLanguage: function (id,callback) {
		var tokenStore =  new TokenStore();
		this.languages[id] = {
			id: id,
			tokenStore:tokenStore,
			translationStore: new TranslationStore(tokenStore),
			logicDefinitions: null,
			tokenDefinitions: null,
			translationDefinitions: null,
			sentenceTokenizer: new SentenceTokenizer(),
			tokenTokenizer:  new TokenTokenizer()
		};
		this.loadTokens(id,callback);
	},
	loadLogic: function (languageId,callback) {
		$.ajax(this.logicPath+"."+languageId+".json", {
			mimeType: "application-x/json",
			success: this.logicLoaded.bind(this,languageId,callback)
		})
	},
	logicLoaded: function (languageId,callback,logic) {
		if (!this.logicLength) {
			this.logicLength = logic.length
		} else if (this.logicLength != logic.length) {
			throw new Error("Inconsistent token definition sizes")
		}
		this.languages[languageId].logicDefinitions = logic;
		this.loadTranslations(languageId,callback)
	},
	loadTokens: function (languageId,callback) {
		$.ajax(this.tokenPath+"."+languageId+".json", {
			mimeType: "application-x/json",
			success: this.tokensLoaded.bind(this,languageId,callback)
		})
	},
	tokensLoaded: function (id,callback,tokens) {
		if (!this.tokensLength) {
			this.tokensLength = tokens.length
		} else if (this.tokensLength != tokens.length) {
			throw new Error("Inconsistent token definition sizes")
		}
		var store = this.languages[id].tokenStore;
		this.languages[id].tokenDefinitions = tokens;
		tokens.forEach(function (token) {
			this.languages[id].tokenStore.addEntity('<'+token.text+'>',token.id)
		},this);
		this.loadLogic(id,callback)
	},
	loadTranslations: function (languageId, callback) {
		$.ajax(this.translationPath+"."+languageId+".json", {
			mimeType: "application-x/json",
			success: this.translationsLoaded.bind(this,languageId,callback)
		});
	},
	translationsLoaded: function (languageId,callback,translations) {
		if (!this.translationsLength) {
			this.translationsLength = translations.length
		} else if (this.translationsLength != translations.length) {
			throw new Error("Inconsistent translation sizes")
		}
		translations.forEach(function (translation) {
			this.languages[languageId].translationStore.addEntity(translation.def,translation.id)
		},this)
		this.languages[languageId].translationDefinitions = translations;
		if (callback) {
			callback(this.languages[languageId])
		}
	}
}
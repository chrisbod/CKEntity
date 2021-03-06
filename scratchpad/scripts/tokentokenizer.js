function TokenTokenizer() {
	this.tokens = {};
	this.tokenDefinitions = [];
}
TokenTokenizer.prototype = {
	tokenize: function (token) {
		var def = token.def.trim()
		this.tokens[def] = token;
		this.tokenDefinitions.push(def);
		this.tokenDefinitions.sort();
	},
	getTrigger: function (rangeOrText) {
		var text = ""+rangeOrText;
		text = text.replace(/\u200b/gm,'');
		text = text.trim().match(/<[^>]*>?$/mg);
		if (text) {
			return text[text.length-1];
		}
		return "";
	},
	getSuggestions: function (what) {
		var suggestions = [];
		what = what.trim();
		this.tokenDefinitions.forEach(function (def) {
			if (def.indexOf(what) == 0) {
				suggestions[suggestions.length] = this.tokens[def];
			} 
		},this)
		return suggestions;

	}
}
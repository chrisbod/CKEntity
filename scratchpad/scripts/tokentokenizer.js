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
	isTrigger: function (what) {
		if (what.charAt(0) == '<') {
			return true;
		}
		return false;
	},
	getSuggestions: function (what) {
		var suggestions = [];
		this.tokenDefinitions.forEach(function (def) {
			if (def.indexOf(what) == 0) {
				suggestions[suggestions.length] = this.tokens[def];
			}
		},this)
		return suggestions;

	}
}
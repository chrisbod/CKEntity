
//This has NOTHING to do with TOKENS in the documents
function SentenceTokenizer () {
	this.tokens = {};
}
SentenceTokenizer.prototype = {
	getLastSentenceFromRange: function (rangeOrText) {
		var text = ""+rangeOrText;
		var sentences = text.split(/\.\s+(?=[A-Z])/)
		if (sentences) {
			var lastSentence = sentences[sentences.length-1];
			return lastSentence;
		}
		return "";
	},
	getTrigger: function (rangeOrText) {
		text = this.getLastSentenceFromRange(rangeOrText);
		var split = text.trim().split(" ");
		if (split.length > 1 && this.tokens[split[0]]) {
			return text;
		}
		return "";
	},
	tokenize: function (key) {
		var split = key.def.trim().split(/\W+/),
			currentToken = this.tokens
		for (var i=0,existingToken;i<split.length;i++) {
			existingNode = currentToken[split[i]]
			if (!existingNode) {
				existingNode = {};
			}
			currentToken = currentToken[split[i]] = existingNode;
		}
		currentToken._$ = key;
	},
	getSuggestions: function (string) {
		string = string.trim()
		if (string.indexOf(" ")==-1) {
			if (this.tokens[string] && this.tokens[string]._$) {
				return [this.tokens[string]._$];
			} else {
				return [];
			}
		}
		var split = string.trim().split(/\s+/),
			results = [];
		function crawl(object) {
			if (split.length) {
				var next = split.shift();
					if (next in object) {
						crawl(object[next])
					} else if (!split.length) {
						complete(object,next)
					}
			} else {
				iterate(object)
			}
		}
		function iterate(object) {
			for (var i in object) {
				if (i == "_$") {
					results.push(object._$)
				} else {
					iterate(object[i])
				}
			}
		}
		function complete(object,string) {
			for (var i in object) {
				if (i.indexOf(string)==0) {
					iterate(object[i])
				}
			}
		}
		crawl(this.tokens,split);
		results.sort(function (a,b) {
			/*if (a.def.length > b.def.length) {
				return 1
			}*/
			if (a.def>b.def) {
				return -1
			}
			if (a.def<b.def) {
				return 1
			}
			return 0
		})
		return results;	

	}
}
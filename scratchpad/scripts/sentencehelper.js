function SentenceHelper() {
	
}
SentenceHelper.prototype = {
	getLastSentenceFromRange: function (range) {
		var text = ""+range;
		var sentences = text.split(/\.\s+(?=[A-Z])/)
		if (sentences) {
			var lastSentence = sentences[sentences.length-1];
			return lastSentence;
		}
		return "";
	} 
}
function EntityStore() {
	this.templatableNodes = {};
}
EntityStore.prototype =  {
	addEntity: function (key,id) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			this.templatableNodes[key] = {
				node: this.createTemplatableNodeFromEntity(key,id),
				key: key,
				id: id
			}
		}
		return this.templatableNodes[key];
	},
	hasEntity: function (key) {
		return key in this.templatableNodes;
	},
	createTemplatableNodeFromEntity: function (key,id) {
		throw new Error("Not implemented")
	},
	parseTextMarkup: function (string) {
		return string
			.replace(/</g,'\x02&lt;')
			.replace(/>/g,'&gt;\x03')
			.replace(/\[/g,'<span class="segment" contenteditable="false">[')
			.replace(/\]/g,']</span>')
			.replace(/\x02/g,'<span class="placeholder" contenteditable="false">')
			.replace(/\x03/g,"</span>");


	},
	getEntityNode: function (key) {
		var clonedNode = this.templatableNodes[key].node.cloneNode(true);
		return clonedNode;
	}

}

function TranslationStore() {
	this.templatableNodes = {};
}
TranslationStore.prototype =  new EntityStore()
TranslationStore.prototype.templatableNodes = null;
TranslationStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var keyName = "key"+id;
	var node = document.createElement("div");
	node.setAttribute("data-key-name",keyName);
	node.className ="key"
	node.contentEditable = false;
	node.innerHTML = this.parseTextMarkup(key);
	var spans = node.querySelectorAll("span.segment");
	for (var i=0;i<spans.length;i++) {
		spans[i].setAttribute("data-key-name",keyName);
		spans[i].setAttribute("data-segment-name",keyName+"-segment"+(i+1))
	}
	return node;
}

function TokenStore() {
	this.templatableNodes = {};
}
TokenStore.prototype =  new EntityStore()
TokenStore.prototype.templatableNodes = null;
TokenStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var node = document.createElement("span")
	node.contentEditable = false;
	node.className ="placeholder"
	node.setAttribute("data-placeholder-id",id)
	node.innerText = key;
	return node;
}
function EntityStore() {
	this.templatableNodes = {};
	this.allNodes = [];
}
EntityStore.prototype =  {
	addEntity: function (key,id) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			
			this.allNodes.push(this.templatableNodes[key] = {
				node: this.createTemplatableNodeFromEntity(key,id),
				def: key,
				id: id
			})
		}
		return this.templatableNodes[key];
	},
	hasEntity: function (key) {
		return key in this.templatableNodes;
	},
	createTemplatableNodeFromEntity: function (key,id) {
		throw new Error("Not implemented")
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
	var node = document.createElement("translation");
	node.setAttribute("data-key-name",keyName);
	node.className ="key"
	node.contentEditable = false;
	node.innerHTML = this.parseTextMarkup(key)+" ";
	var spans = node.querySelectorAll("sconditional");
	for (var i=0;i<spans.length;i++) {
		spans[i].setAttribute("data-key-name",keyName);
		spans[i].setAttribute("data-segment-name",keyName+"-segment"+(i+1))
	}
	return node;
}
TranslationStore.prototype.parseTextMarkup = function (string) {
	return string
		.replace(/</g,'\x02&lt;')
		.replace(/>/g,'&gt;\x03')
		.replace(/\[/g,'<conditional contenteditable="false">[')
		.replace(/\]/g,']</conditional>')
		.replace(/\x02/g,'<token contenteditable="false">')
		.replace(/\x03/g,"</token>");
}

function TokenStore() {
	this.templatableNodes = {};
}
TokenStore.prototype =  new EntityStore()
TokenStore.prototype.templatableNodes = null;
TokenStore.prototype.parseTextMarkup = function () {
	return string
		.replace(/</g,'&lt;')
		.replace(/>/g,'&gt;')
}
TokenStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var node = document.createElement("token")
	node.contentEditable = false;
	node.setAttribute("data-conditional-id",id)
	node.innerText = key;
	return node;
}
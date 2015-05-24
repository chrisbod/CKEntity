function EntityStore() {
}
EntityStore.prototype =  {
	addEntity: function (key,id,preview) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			var text = key.replace(/(\[|\<)[^\:]+\:/g,"$1");
			var text = key.replace(/\[[^:]+\:\s*\]/g,'')
			this.allNodes.push(this.templatableNodes[id] = this.templatableNodes[key] = this.templatableNodes[text] ={
				node: this.createTemplatableNodeFromEntity(key,id,preview),
				def: key,
				id: id,
				text: text
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

function TokenStore() {
	this.templatableNodes = {};
	this.allNodes = [];
}
TokenStore.prototype =  new EntityStore()
TokenStore.prototype.templatableNodes = null;
TokenStore.prototype.parseTextMarkup = function () {
	return string
		.replace(/</g,'&lt;')
		.replace(/>/g,'&gt;')
}
TokenStore.prototype.createTemplatableNodeFromEntity = function (key,id,previewHTML) {
	var tokenNode = document.createElement("token")
	tokenNode.setAttribute("data-args","type: '"+id+"'")
	tokenNode.setAttribute("class",id);
	var contents = document.createElement("span")
	contents.className = "contents"
	contents.innerText = key;
	tokenNode.appendChild(contents)
	return tokenNode;
}



function TranslationStore(tokenStore) {
	this.tokenStore = tokenStore;
	this.templatableNodes = {};
	this.allNodes = [];
}
TranslationStore.prototype =  new EntityStore()
TranslationStore.prototype.templatableNodes = null;
TranslationStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var translation = document.createElement("translation");
	translation.setAttribute("data-args","");
	translation.setAttribute("data-key-id",id);
	translation.innerHTML = this.parseTextMarkup(key);
	var subEntities = translation.querySelectorAll("token,conditional");
	for (var i=0;i<subEntities.length;i++) {
		subEntities[i].setAttribute("data-key-id",id)
	}
	return translation;
}
TranslationStore.prototype.parseTextMarkup = function (string) {
	return '<span class="contents">'+string
		.replace(/</g,'\x02')
		.replace(/>/g,'\x03')
		.replace(/\[([^:]+):/g,'<conditional data-conditional-ref="$1" data-args=""><span class="contents">')
		.replace(/\]/g,'</conditional>')
		.replace(/\x02([^:]+):(\w+)/g,'<token data-ref="$1" data-id="$2" data-args="">$2')
		.replace(/\x03/g,'"</token>') + '</span>';
}

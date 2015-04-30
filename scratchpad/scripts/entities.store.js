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
	node.contentEditable = false;
	node.innerHTML = this.parseTextMarkup(key)+" ";
	var conditionals = node.querySelectorAll("conditional");
	for (var i=0;i<conditionals.length;i++) {
		var conditional = conditionals[i];
		conditional.setAttribute("data-conditional-name","conditional-"+i)
		conditional.firstChild.setAttribute("data-conditional-name","conditional-"+i)
		conditional.lastElementChild.setAttribute("data-conditional-name","conditional-"+i)
	}
	var spans = node.querySelectorAll("conditional,token,span.args");
	for (var i=0;i<spans.length;i++) {
		spans[i].setAttribute("data-key-name",keyName);
	}
	return node;
}
TranslationStore.prototype.parseTextMarkup = function (string) {
	return '<span class="args translation">&#8203;</span>'+string
		.replace(/</g,'\x02')
		.replace(/>/g,'&gt;\x03')
		.replace(/\[/g,'<conditional contenteditable="false"><span class="args conditional" contenteditable="false">[</span>')
		.replace(/\]/g,'<span class="args conditional" contenteditable="false">]</span></conditional>')
		.replace(/\x02/g,'<token contenteditable="false"><span class="args token" contenteditable="false">&lt;</span>')
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
	node.innerText = key.replace(/^</,'');
	var rules = document.createElement("span")
	rules.className = "args token";
	rules.innerText = "<";
	rules.contentEditable = false;
	node.insertBefore(rules,node.firstChild)
	return node;
}
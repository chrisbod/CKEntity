function EntityStore() {
	this.templatableNodes = {};

	this.allNodes = [];
}
EntityStore.prototype =  {
	addEntity: function (key,id,preview) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			
			this.allNodes.push(this.templatableNodes[id] = this.templatableNodes[key] = {
				node: this.createTemplatableNodeFromEntity(key,id,preview),
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
TokenStore.prototype.createTemplatableNodeFromEntity = function (key,id,previewHTML) {
	var node = document.createElement("token")
	node.setAttribute("contenteditable", false);
	node.setAttribute("data-args","type: '"+id+"'")
	node.setAttribute("class",id)
	node.innerHTML = '<span>'+key.replace(/(^<)|(>$)/g,'')+'<span>';
	var rules = document.createElement("span")
	rules.className = "args token";
	rules.innerText = "<";
	rules.setAttribute("contenteditable", false);
	rules.setAttribute("data-args","type: '"+id+"'")
	var end = document.createElement("span")
	end.innerText = ">";
	node.appendChild(end)
	if (previewHTML) {
		var preview = document.createElement("preview")
		preview.innerHTML = previewHTML;
		node.appendChild(preview)
	}
	
	node.insertBefore(rules,node.firstChild)
	return node;
}



function TranslationStore(tokenStore) {
	this.tokenStore = tokenStore;
	this.templatableNodes = {};
}
TranslationStore.prototype =  new EntityStore()
TranslationStore.prototype.templatableNodes = null;
TranslationStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var keyName = "key"+id;
	var node = document.createElement("translation");
	node.setAttribute("contenteditable", false);
	node.setAttribute("data-key-name",keyName);
	node.innerHTML = this.parseTextMarkup(key)+" ";
	var conditionals = node.querySelectorAll("conditional");
	for (var i=0;i<conditionals.length;i++) {
		var conditional = conditionals[i];
		conditional.setAttribute("data-conditional-name","conditional-"+i)
		conditional.firstChild.setAttribute("data-conditional-name","conditional-"+i)
		conditional.lastElementChild.setAttribute("data-conditional-name","conditional-"+i)
	}
	var tokens = node.querySelectorAll("token");
	for (var i=0;i<tokens.length;i++) {
		tokens[i].parentNode.replaceChild(this.tokenStore.getEntityNode(tokens[i].getAttribute("data-id")), tokens[i]);
	}
	var spans = node.querySelectorAll("conditional,token,span.args");
	for (var i=0;i<spans.length;i++) {
		spans[i].setAttribute("data-key-name",keyName);
	}

	return node;
}
TranslationStore.prototype.parseTextMarkup = function (string) {
	return '<span class="args translation" contenteditable="false">&#8203;</span>'+string
		.replace(/</g,'\x02')
		.replace(/>/g,'\x03')
		.replace(/\[/g,'<conditional contenteditable="false"><span class="args conditional" contenteditable="false">[</span><span class="contents" contenteditable="false">')
		.replace(/\]/g,'</span><span class="conditional end" contenteditable="false">]</span></conditional>')
		.replace(/\x02/g,'<token data-id="')
		.replace(/\x03/g,'"/>') + '<span class="translation end" contenteditable="false">&#8203;</span>';
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
TokenStore.prototype.createTemplatableNodeFromEntity = function (key,id,previewHTML) {
	var node = document.createElement("token")
	node.setAttribute("contenteditable", false);
	node.setAttribute("data-args","type: '"+id+"'")
	node.setAttribute("class",id)
	node.innerHTML = '<span>'+key.replace(/(\<)|(\>)/gm,'')+'<span>';
	var rules = document.createElement("span")
	rules.className = "args token";
	rules.innerText = "<";
	rules.setAttribute("contenteditable", false);
	rules.setAttribute("data-args","type: '"+id+"'")
	var end = document.createElement("span")
	end.innerText = ">";
	node.appendChild(end)
	if (previewHTML) {
		var preview = document.createElement("preview")
		preview.innerHTML = previewHTML;
		node.appendChild(preview)
	}
	
	node.insertBefore(rules,node.firstChild)
	return node;
}
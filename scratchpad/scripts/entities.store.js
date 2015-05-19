function EntityStore() {
}
EntityStore.prototype =  {
	addEntity: function (key,id,preview) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			var text = key.replace(/(\[|\<)[^\:]+\:/g,"$1")
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
	var node = document.createElement("token")
	node.setAttribute("data-entity-node","")
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
	
	node.insertBefore(rules,node.firstChild)
	var editSpan = document.createElement("span")
	editSpan.className = "entity-wrapper"
	editSpan.appendChild(node)
	return node;
}



function TranslationStore(tokenStore) {
	this.tokenStore = tokenStore;
	this.templatableNodes = {};
	this.allNodes = [];
}
TranslationStore.prototype =  new EntityStore()
TranslationStore.prototype.templatableNodes = null;
TranslationStore.prototype.createTemplatableNodeFromEntity = function (key,id) {
	var node = document.createElement("translation");
	node.setAttribute("contenteditable", false);
	node.setAttribute("data-args","key:'"+id+"'")
	node.innerHTML = this.parseTextMarkup(key);
	var conditionals = node.querySelectorAll("conditional")
	for (var i=0;i<conditionals.length;i++) {
		var conditional = conditionals[i];
		var args = "key:'"+id+"',conditional:'"+conditional.getAttribute("data-conditional-ref")+"'"

		conditional.setAttribute("data-args",args);
		conditional.firstChild.setAttribute("data-args",args);
		conditional.lastElementChild.setAttribute("data-args",args);
	}
	var tokens = node.querySelectorAll("token"),
		token;
	for (var i=0;i<tokens.length;i++) {
		token = this.tokenStore.getEntityNode(tokens[i].getAttribute("data-id"))
		var ref = tokens[i].getAttribute("data-ref")
		if (tokens[i].parentNode.className == "contents") {
			token.setAttribute(
				"data-args",
				token.getAttribute("data-args")+",key:'"+id+"',conditional:'"+tokens[i].parentNode.parentNode.getAttribute("data-conditional-ref")+"',token:'"+ref+"'"
			);
		} else {
			token.setAttribute("data-args",token.getAttribute("data-args")+",key:'"+id+"',token:'"+ref+"'")
		}
		tokens[i].parentNode.replaceChild(token, tokens[i]);
	}
	var editSpan = document.createElement("span")
	editSpan.setAttribute("data-entity-node","")
	editSpan.className = "entity-wrapper"
	editSpan.appendChild(node)
	return editSpan;
}
TranslationStore.prototype.parseTextMarkup = function (string) {
	return '<span class="args translation" contenteditable="false">{</span><span class="contents">'+string
		.replace(/</g,'\x02')
		.replace(/>/g,'\x03')
		.replace(/\[([^:]+):/g,'<conditional contenteditable="false" data-conditional-ref="$1"><span class="args conditional" contenteditable="false">[</span><span class="contents" contenteditable="false">')
		.replace(/\]/g,'</span><span class="conditional end" contenteditable="false">]</span></conditional>')
		.replace(/\x02([^:]+):(\w+)/g,'<token data-ref="$1" data-id="$2">$2')
		.replace(/\x03/g,'"</token>') + '</span><span class="translation end" contenteditable="false">}</span>';
}

function TokenStore() {
	this.templatableNodes = {};
	this.allNodes = []
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
	node.setAttribute("contenteditable", "false");//this seems to trigger a strange drag and drop bug

	node.setAttribute("data-args","type: '"+id+"'")
	node.setAttribute("class",id)
	node.innerHTML = '<span contenteditable="false">'+key.replace(/(\<)|(\>)/gm,'')+'<span>';
	var rules = document.createElement("span")
	rules.className = "args token";
	rules.innerText = "<";
	rules.setAttribute("contenteditable", false);
	rules.setAttribute("data-args","type: '"+id+"'")
	var end = document.createElement("span");
	end.setAttribute("contenteditable", false);
	end.className = "token end"
	end.innerText = ">";
	node.appendChild(end);
	node.insertBefore(rules,node.firstChild)
	var editSpan = document.createElement("span")
	editSpan.setAttribute("data-entity-node","")
	editSpan.className = "entity-wrapper"
	editSpan.appendChild(node)
	return editSpan;
}
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
	node.setAttribute("data-key-name",id);
	node.setAttribute("data-args","key:'"+id+"'")
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
		spans[i].setAttribute("data-key-name",id);
	}

	return node;
}
TranslationStore.prototype.parseTextMarkup = function (string) {
	return '<span class="args translation" contenteditable="false">{</span>'+string
		.replace(/</g,'\x02')
		.replace(/>/g,'\x03')
		.replace(/\[([^:]+):/g,'<conditional contenteditable="false" data-conditional-ref="$1"><span class="args conditional" contenteditable="false">[</span><span class="contents" contenteditable="false">')
		.replace(/\]/g,'</span><span class="conditional end" contenteditable="false">]</span></conditional>')
		.replace(/\x02([^:]+):(\w+)/g,'<token data-ref="$1" data-id="$2">$2')
		.replace(/\x03/g,'"</token>') + '<span class="translation end" contenteditable="false">}</span>';
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
	return node;
}
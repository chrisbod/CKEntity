function EntityStore() {
}
EntityStore.prototype =  {
	addEntity: function (key,id,readOnly) {
		var preexists = this.templatableNodes[key];
		if (!preexists) {
			var text = key.replace(/(\[|\<)[^\:]+\:/g,"$1");
			
			
			this.allNodes.push(this.templatableNodes[id] = this.templatableNodes[key] = this.templatableNodes[text] ={
				node: this.createTemplatableNodeFromEntity(key,id,readOnly),
				def: key,
				id: id,
				text: text,
				readOnly: readOnly
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
TokenStore.prototype.createTemplatableNodeFromEntity = function (key,id,readOnly) {
	var node = document.createElement("token")
	node.setAttribute("data-entity-node","token")
	node.setAttribute("contenteditable", false);
	node.setAttribute("data-args","name: '"+id+"'")
	if (readOnly) {
		node.setAttribute("data-read-only","true")
	}
	node.setAttribute("class",id)
	node.innerHTML = '<span>'+key.replace(/(^<)|(>$)/g,'')+'<span>';
	var rules = document.createElement("span")
	rules.className = "args token";
	rules.innerText = "<";
	rules.setAttribute("contenteditable", false);
	var end = document.createElement("span")
	end.innerText = ">";
	node.appendChild(end)
	
	node.insertBefore(rules,node.firstChild)
	var editSpan = document.createElement("span")
	editSpan.className = "entity-wrapper"

	editSpan.appendChild(node);
	editSpan.setAttribute("data-entity-node","token")
	editSpan.setAttribute("contenteditable","false")
	if (readOnly) {
		editSpan.setAttribute("data-read-only","true")
	}
	editSpan.tabIndex=-1
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
	node.setAttribute("data-args","id:'"+id+"'");
	node.setAttribute("data-json",encodeURI('{"id":"'+id+'"}'));
	node.innerHTML = this.parseTextMarkup(key);
	var conditionals = node.querySelectorAll("conditional")
	for (var i=0;i<conditionals.length;i++) {
		var conditional = conditionals[i];
		var args = "key:'"+id+"',conditional:'"+conditional.getAttribute("data-conditional-ref")+"'"
		conditional.setAttribute("data-args",args);
		conditional.firstChild.setAttribute("data-args",args);
		conditional.lastElementChild.setAttribute("data-args",args);
		if (!conditional.innerText || conditional.innerText == "[]") {
			conditional.setAttribute("data-not-present","true")
		}
	}
	var tokens = node.querySelectorAll("token"),
		token;
	for (var i=0;i<tokens.length;i++) {
		token = this.tokenStore.getEntityNode(tokens[i].getAttribute("data-id")).firstElementChild;
		token.removeAttribute("data-json")
		var key = tokens[i].getAttribute("data-ref");
		if (tokens[i].parentNode.parentNode.className == "contents") {//inside conditional
			token.setAttribute(
				"data-args",
				"key:'"+id+"',conditional:'"+tokens[i].parentNode.parentNode.getAttribute("data-conditional-ref")+"',name:'"+id+"'"
			);
		} else {
			token.setAttribute("data-args",token.getAttribute("data-args")+",key:'"+id+"',id:'"+key+"'")
		}
		tokens[i].parentNode.replaceChild(token, tokens[i]);
	}
	var editSpan = document.createElement("span")
	editSpan.setAttribute("data-entity-node","translation")
	editSpan.className = "entity-wrapper"
	editSpan.setAttribute("contenteditable","false")
	editSpan.appendChild(document.createTextNode("\u200d"))
	editSpan.appendChild(node)
	editSpan.appendChild(document.createTextNode("\u200d"))
	editSpan.tabIndex = -1;
	return editSpan;
}
TranslationStore.prototype.parseTextMarkup = function (string) {
	return '<span class="args translation">{</span><span class="contents">'+string
		.replace(/</g,'\x02')
		.replace(/>/g,'\x03')
		.replace(/\[([^:]+):/g,'<span class="entity-wrapper" data-entity-node="conditional" tabIndex="-1">&zwj;<conditional data-conditional-ref="$1"><span class="args conditional" contenteditable="false">[</span><span class="contents">')
		.replace(/\]/g,'</span><span class="conditional end">]</span></conditional>&zwj;</span>')
		.replace(/\x02([^:]+):(\w+)/g,'&zwj;<token data-ref="$1" data-id="$2">$2')
		.replace(/\x03/g,'"</token>') + '</span><span class="translation end">}</span>';
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
TokenStore.prototype.createTemplatableNodeFromEntity = function (key,id,readOnly) {
	var node = document.createElement("token")
	//node.setAttribute("contenteditable", "false");//this seems to trigger a strange drag and drop bug
	
	node.setAttribute("data-args","name: '"+id+"'")
	node.setAttribute("data-json",encodeURI('{"name":"'+id+'"}'));
	node.setAttribute("class",id)
	if (readOnly) {
		node.setAttribute("data-read-only","true")
	}
	node.innerHTML = '<span>'+key.replace(/(\<)|(\>)/gm,'')+'<span>';
	var rules = document.createElement("span")
	rules.className = "args token";
	rules.innerText = "<";
	
	
	var end = document.createElement("span");
	end.className = "token end"
	end.innerText = ">";
	node.appendChild(end);
	
	node.insertBefore(rules,node.firstChild)
	
	var editSpan = document.createElement("span")
	editSpan.appendChild(document.createTextNode("\u200d"))
	editSpan.setAttribute("data-entity-node","token")
	editSpan.className = "entity-wrapper"
	editSpan.appendChild(node);
	editSpan.setAttribute("contenteditable","false")
	editSpan.appendChild(document.createTextNode("\u200d"))
	if (readOnly) {
		editSpan.setAttribute("data-read-only","true")
	}
	editSpan.tabIndex = -1;
	return editSpan;
}
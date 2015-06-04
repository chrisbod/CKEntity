function UserConditionalManager() {
	this.conditionalOpenRanges = [];
	this.conditionalCloseRanges = [];
	this.entitiesHelper = new EntitiesHelper();
	this.selectionTracker = SelectionTracker.getInstance()
}
UserConditionalManager.count = 0;
UserConditionalManager.prototype = {
	ifTemplate: null,
	endifTemplate: null,
	init: function (editableElement) {
		this.element = editableElement;
		this.document = editableElement.ownerDocument;
		this.ifTemplate = this.generateIfTemplate();
		this.endifTemplate = this.generateEndifTemplate();
		this.document.addEventListener("keyup", this, true);
		this.document.addEventListener("keydown", this, true);
		this.document.addEventListener("mousedown", this, true);
		this.document.addEventListener("drag", this, true);
		this.document.addEventListener("drop", this, true);
		this.calculateCount()
	},
	calculateCount: function () {
		var ifs = this.document.querySelectorAll("if");
		for (var i=0;i<ifs.length;i++) {
			UserConditionalManager.count = Math.max(parseInt(ifs[i].id.replace(/uc/g,'')),UserConditionalManager.count)
		}

	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event);
	},
	keyupHandler: function (event) {
		//var character =  String.fromCharCode(event.charCode)
		console.log(event.keyCode)
		switch (event.keyCode) {
			case 219: return this.insertBoth(event);
			case 46:
			case 8: return this.checkDelete(event);
		}
	},
	keydownHandler: function (event) {
		if (!event.shiftKey && event.keyCode == 219) {
			event.preventDefault();
		}
		
	},
	mousedownHandler: function (event) {
		if (event.target.parentNode.tagName == "IF" || event.target.parentNode.tagName == "ENDIF") {
			this.selectionTracker.selectNode(event.target.parentNode.parentNode);
			this.activateNodes(event.target.parentNode.parentNode.getAttribute("data-conditional-id"))
		} else {
			this.deactivateNodes()
		}
	},
	dragHandler: function (event) {
			if (!this.dragNode && /^(if|endif)$/i.test(event.target.parentNode.tagName)) {
				this.dragNode = event.target.parentNode.parentNode;
				event.stopPropagation()
			}
		},
		postDropHandler: function (dragNode,details) {
					    if (details.textNode.nodeType == 3) {
					        var replacement = details.textNode.splitText(details.offset);
					        details.textNode.parentNode.insertBefore(dragNode, replacement);
					        this.validateNodePositions()
					    }	
		},
		dropHandler: function (event) {
			if (this.dragNode) {
				//var selection = this.document.getSelection();
						//console.log( this.document.caretPositionFromPoint(event.pageX, event.pageY))
						var details = {
							range: null,
							textNode: null,
							offset: null
						};

					    if (document.caretPositionFromPoint) {
					        details.range = this.document.caretPositionFromPoint(event.clientX, event.clientY);
					        details.textNode = details.range.offsetNode;
					        details.offset = range.offset;
					        
					    } else if (document.caretRangeFromPoint) {
					        details.range = this.document.caretRangeFromPoint(event.clientX, event.clientY);
					        details.textNode = details.range.startContainer;
					        details.offset = details.range.startOffset;
					    }

					   
					


            
				setTimeout(this.postDropHandler.bind(this,this.dragNode,details))
				

				
				this.dragNode = null;
				event.preventDefault()
				event.stopPropagation()

			} else {
		var selection  = this.document.getSelection();
		var foo = {}
		for (var i in selection) {
			foo[i] = selection[i]
		}
		var range = selection.getRangeAt(0)
		console.log(foo,range)
		if (selection.rangeCount) {
			this.internalDropHandler(event);
		} else {
			setTimeout(this.internalDropHandler.bind(this,event));
		}
			}

		
		this.dragNode = null
		
	},
	deactivateNodes: function () {
		if (this.activeNodes) {
			this.activeNodes[0].firstElementChild.className = "";
			this.activeNodes[1].firstElementChild.className = "";
		}
		this.activeNodes = null;
	},
	activateNodes: function (conditionalId) {
		if (this.activeNodes) {
			this.deactivateNodes()
		}
		var nodes = this.document.querySelectorAll("span.entity-wrapper[data-conditional-id="+conditionalId+"]");
		if (nodes.length && nodes.length != 2) {
			throw "Illegal node situation!"
		} else {
			nodes[0].firstElementChild.className = "active";
			nodes[1].firstElementChild.className = "active";
			this.activeNodes = nodes;
		}
	},
	validateNodePositions: function () {
		var nodes = this.activeNodes;
		if (nodes[0].compareDocumentPosition(nodes[1]) != 4) {
			var placeholder = document.createElement("span")
			nodes[0].parentNode.replaceChild(placeholder,nodes[0])
			nodes[1].parentNode.replaceChild(nodes[0],nodes[1])
			placeholder.parentNode.replaceChild(nodes[1],placeholder)

		}
		
	},
	handleEnter: function (event) {

	},
	insertBoth: function (event) {
		if (!event.shiftKey) {
			var id = "uc"+UserConditionalManager.count++
			var ifNode = this.ifTemplate.cloneNode(true)
			ifNode.setAttribute("data-conditional-id",id)
			this.selectionTracker.insertEntityWrapperAtCursor(ifNode);
			var spacer = document.createTextNode('\u00a0 ')
			this.selectionTracker.insertEntityWrapperAtCursor(spacer);
			var endifNode = this.endifTemplate.cloneNode(true)
			endifNode.setAttribute("data-conditional-id",id)
			this.selectionTracker.insertEntityWrapperAtCursor(endifNode);
			var range = document.createRange()
			range.setStartAfter(ifNode)
			range.setEndBefore(endifNode)
			range.collapse(true)
			var selection = this.document.getSelection()
			selection.removeAllRanges()
			selection.addRange(range)
			event.preventDefault()
		}
	},
	insertIf: function (event) {
		if (!event.shiftKey) {
			
		}
	}, 

	checkDelete: function (event) {
		if (this.activeNodes) {

			for (var i=0;i<this.activeNodes.length;i++) {
				if (this.activeNodes[i].parentNode == null) {
					if (i==1) {
						this.activeNodes[0].parentNode.removeChild(this.activeNodes[0])
					} else {
						this.activeNodes[1].parentNode.removeChild(this.activeNodes[1])
					}
					this.activeNodes = null
				}
			}
		}
		
	},
	generateIfTemplate: function () {
		var span = this.document.createElement("span");
		span.className = "entity-wrapper";
		span.contentEditable = false;
		var ifElement = document.createElement("if");
		ifElement.contentEditable = false;
		span.appendChild(ifElement)
		var img = document.createElement("img")
		ifElement.appendChild(img)
		return span

	},
	generateEndifTemplate: function () {
		var span = this.document.createElement("span");
		span.className = "entity-wrapper";
		span.contentEditable = false;
		var ifElement = document.createElement("endif");
		ifElement.contentEditable = false;
		span.appendChild(ifElement)
		var img = document.createElement("img")
		ifElement.appendChild(img)
		return span
	}
}
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
		UserConditionalManager.count = ifs.length
		for (var i=0;i<ifs.length;i++) {
			UserConditionalManager.count = Math.max(parseInt(ifs[i].parentNode.getAttribute("data-conditional-id").replace(/uc/g,'')),UserConditionalManager.count)
		}
		//console.log(UserConditionalManager.count)

	},
	handleEvent: function (event) {
		return this[event.type+"Handler"](event);
	},
	keyupHandler: function (event) {
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
		var parentNode = event.target.parentNode
		if (/^(IF|ENDIF)$/.test(parentNode.tagName)) {
			this.selectionTracker.selectNode(parentNode.parentNode);
			this.activateNodes(parentNode.parentNode.getAttribute("data-conditional-id"))
		} else {
			this.deactivateNodes()
		}
	},
	dragHandler: function (event) {
			if (!this.dragNode && /^(IF|ENDIF)$/.test(event.target.parentNode.tagName)) {
				this.dragNode = event.target.parentNode.parentNode;
				event.stopPropagation()
			}
		},
		postDropHandler: function (dragNode,details) {
					    if (details.textNode.nodeType == 3) {
					        var replacement = details.textNode.splitText(details.offset);
					       // console.log(dragNode)
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
				if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
					//debugger;
						CKEDITOR.currentInstance.fire("saveSnapshot");
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
			this.deactivateNodes();
		}
		var nodes = this.document.querySelectorAll("span.entity-wrapper[data-conditional-id="+conditionalId+"]");
		if (nodes.length && nodes.length != 2) {
			throw "Illegal node situation!"
		} else {
			nodes[0].firstElementChild.className = "active";
			nodes[1].firstElementChild.className = "active";

			this.activeNodes = nodes;
			this.createPath()
		}
	},
	createPath: function () {
		var activeNodes = this.activeNodes;
		var range = this.document.createRange();
		range.setStartAfter(activeNodes[0]);
		range.setEndBefore(activeNodes[1]);
		var rects = range.getClientRects()
		//var rect = this.document.body.getBoundingClientRect();
		var left = rects[0].left, right = 0;
		for (var i=0;i<rects.length;i++) {
			left = Math.min(left,rects[i].left);
			right = Math.max(right, rects[i].right)
		}
		var startRect = rects[0]
		var endRect = rects[rects.length-1];
		var top = this.document.body.scrollTop;
		var pathPositions = "m "+startRect.left+" 0"+" l "+startRect.width+" 0"+" l "+startRect.width+" "+endRect.top+" l "+endRect.right+" "+endRect.top+" m "+endRect.right+" "+endRect.bottom+" l "+endRect.left+" "+endRect.bottom+" l "+endRect.left+" "+startRect.bottom+" l "+startRect.left+" "+startRect.bottom+" z"

		var svg = this.document.createElementNS("http://www.w3.org/2000/svg","svg")
		svg.setAttribute("xmlns","http://www.w3.org/2000/svg")
		svg.setAttribute("version","1.1")
		svg.setAttribute("viewBox","0 0 "+(right-left)+" "+(endRect.bottom-startRect.top))
		svg.style.position = "absolute";
		svg.style.width = (right-left)+"px";
		svg.style.top  =  top + startRect.top+"px";
		svg.style.height = (endRect.bottom-startRect.top)+"px"
		svg.style.left = left+"px";
		svg.style.border = "1px solid red"
		svg.style.pointerEvents = "none";
		svg.setAttribute("width",(right-left)+"px")
		svg.setAttribute("height",(endRect.bottom-startRect.top)+"px")
		var path = this.document.createElementNS("http://www.w3.org/2000/svg","path")
		path.setAttribute("stroke-width","1")
		path.setAttribute("stroke", "red");
path.setAttribute("d", pathPositions)
svg.appendChild(path)
this.document.body.appendChild(svg)
/*

<svg width="4cm" height="4cm" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" version="1.1" style="
    position: absolute;
    width: 400px;
    height: 400px;
">  <path d="M 100 100 L 300 100 L 200 300 z" fill="none" stroke="blue" stroke-width="3"></path> </svg>
	var svg = this.document.createElementNS("http://www.w3.org/2000/svg","svg")
		svg.setAttribute("version","1.1")
		svg.setAttribute("viewBox","0 0 "+400+" "+400);
		svg.setAttribute("width","4cm")
		svg.setAttribute("height","4cm")
		//svg.style.position = "absolute";
		//svg.style.top  =  top + startRect.top+"px";
		//svg.style.left = left+"px";
		//svg.style.border = "1px solid red"
		//svg.style.pointerEvents = "none";
		var path = this.document.createElementNS("http://www.w3.org/2000/svg","path")
		path.setAttribute("stroke-width","3")
		path.setAttribute("stroke", "blue");

		path.setAttribute("fill","red")
		path.setAttribute("d","M 100 100 L 300 100 L 200 300 z")
		svg.appendChild(path)
		var div = document.createElement("div")
		div.appendChild(svg)
		this.document.body.insertBefore(div,this.document.body.firstChild)

		
	<svg width="4cm" height="4cm" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <path d="M 100 100 L 300 100 L 200 300 z" fill="red" stroke="blue" stroke-width="3"></path>
</svg><
		*/

	},
	validateNodePositions: function () {
		var nodes = this.activeNodes,
			selectionTracker = this.selectionTracker,
			placeholder;
		if (nodes[0].compareDocumentPosition(nodes[1]) != 4) {
			placeholder = this.document.createElement("span")
			selectionTracker.replaceEntity(nodes[0],placeholder);//.parentNode.replaceChild(placeholder,nodes[0])
			selectionTracker.replaceEntity(nodes[1],nodes[0]);
			selectionTracker.replaceEntity(placeholder,nodes[1])
		}
		console.log(this.document.querySelectorAll("if,endif"))
		
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
						this.selectionTracker.replaceEntity(this.activeNodes[0])
					} else {
						this.selectionTracker.replaceEntity(this.activeNodes[1])
					}
					this.activeNodes = null
					break;
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
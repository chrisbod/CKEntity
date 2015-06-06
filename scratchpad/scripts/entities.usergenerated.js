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
			UserConditionalManager.count = Math.max(parseInt(ifs[i].parentNode.getAttribute("data-user-conditional-id").replace(/uc/g,'')),UserConditionalManager.count)
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
		var parentNode = event.target.parentNode;
		if (/^(IF|ENDIF)$/.test(parentNode.tagName)) {
			this.selectionTracker.selectNode(parentNode.parentNode);
			
			this.activateNodes(parentNode.parentNode.getAttribute("data-user-conditional-id"))
		} else {
			this.deactivateNodes()
		}
	},
	dragHandler: function (event) {
			if (!this.dragNode && /^(IF|ENDIF)$/.test(event.target.parentNode.tagName)) {
				this.dragNode = event.target.parentNode.parentNode;
				this.dragBefore = this.dragNode.previousSibling;
				this.dragAfter = this.dragNode.nextSibling;
				//this.updatePath()
				event.stopPropagation()
			}
		},
		postDropHandler: function (dragNode,details) {
					    if (details.textNode.nodeType == 3) {
					        var replacement = details.textNode.splitText(details.offset);
					       // console.log(dragNode)
					        details.textNode.parentNode.insertBefore(dragNode, replacement);
					        if (this.dragBefore) {
					        	console.log(escape(this.dragBefore.data))
					        }
					        if (this.dragAfter) {
					        	console.log(escape(this.dragAfter.data))
					        }
					        this.validateNodePositions();
					        this.updatePath()
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
		this.updatePath()
	},
	activateNodes: function (conditionalId) {
		if (this.activeNodes) {
			this.deactivateNodes();
		}
		var nodes = this.document.querySelectorAll("span.entity-wrapper[data-user-conditional-id="+conditionalId+"]");
		if (nodes.length && nodes.length != 2) {
			throw "Illegal node situation!"
		} else {
			nodes[0].firstElementChild.className = "active";
			nodes[1].firstElementChild.className = "active";

			this.activeNodes = [nodes[0],nodes[1]];
			this.updatePath()
		}
	},
	updatePath: function () {
		if (!this.pathElement) {
			this.createPath()
		}
		if (!this.activeNodes) {
			this.pathElement.style.visibility = "hidden";
		} else {
			var activeNodes = this.activeNodes;
			var range = this.document.createRange();
			range.setStartAfter(activeNodes[0]);
			range.setEndBefore(activeNodes[1]);
			var rects = range.getClientRects()
			var svg = this.pathElement
			var left = rects[0].left, right = 0;
			for (var i=0;i<rects.length;i++) {
				left = Math.min(left,rects[i].left);
				right = Math.max(right, rects[i].right)
			}

			var startRect = rects[0]
			var endRect = rects[rects.length-1];
			var top = this.document.body.scrollTop;
			var fullWidth = right-left,
				fullHeight = (endRect.bottom-startRect.top),
				firstRectHeight = startRect.height,
				firstRectLeft = (rects[0].left-left)-this.activeNodes[0].offsetWidth,
				firstRectWidth = fullWidth-firstRectLeft,
				lastRectWidth =  (endRect.right-left)-1+this.activeNodes[1].offsetWidth,
				lastRectHeight = endRect.height;

			

			svg.style.width = fullWidth+"px";
			svg.style.top  =  top + startRect.top+"px";
			svg.style.height = fullHeight+"px"
			svg.style.left = left+"px";
			svg.setAttribute("width",fullWidth+"px")
			svg.setAttribute("height",fullHeight+"px")
	
     var pathPositions = "m "+firstRectLeft+",0 "+firstRectWidth+",0 0,"+(fullHeight-lastRectHeight)+" -"+(Math.max(0,fullWidth-lastRectWidth))+",0 0,"+lastRectHeight+" -"+lastRectWidth+",0 0,-"+(fullHeight-firstRectHeight)+" "+firstRectLeft+",0 0,-"+firstRectHeight
    		console.log(pathPositions)
			svg.firstChild.setAttribute("d",pathPositions)
			this.pathElement.style.visibility = ""
		}


	},
	createPath: function () {
		/*

<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 744.09448819 1052.3622047" version="1.1" style="visibility: hidden;">

    <path style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 229.28571,401.64792 304.28572,1.42857 4.28571,267.85714 -196.42857,0.71429 1.42857,30 -239.28571,0.71428 0.71428,-277.85714 L 230,425.21935 Z" id="path3336"></path>
  
</svg>

		*/
		var svg = this.document.createElementNS("http://www.w3.org/2000/svg","svg")
		svg.setAttribute("xmlns","http://www.w3.org/2000/svg")
		//svg.setAttribute("width","210mm")
		//svg.setAttribute("height","297mm")
		svg.setAttribute("version","1.1")
		//svg.setAttribute("viewBox","0 0 1000 2000")
		svg.style.position = "absolute";
		//svg.style.border = "1px solid red"
		svg.style.pointerEvents = "none";
		var path = this.document.createElementNS("http://www.w3.org/2000/svg","path")
		path.setAttribute("style","fill:none;fill-rule:evenodd;stroke:red;stroke-dasharray:1,1;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1")
		svg.appendChild(path)
		this.document.body.appendChild(svg)
		this.pathElement = svg;
	},
	validateNodePositions: function () {
		var nodes = this.activeNodes,
			selectionTracker = this.selectionTracker,
			placeholder;
		if (nodes[0].compareDocumentPosition(nodes[1]) != 4) {
			placeholder = this.document.createElement("span")
			selectionTracker.replaceEntity(nodes[0],placeholder);//.parentNode.replaceChild(placeholder,nodes[0])
			selectionTracker.replaceEntity(nodes[1],nodes[0]);
			selectionTracker.replaceEntity(placeholder,nodes[1]);

		}
		var ifsAndEndIfs = this.document.querySelectorAll("span[data-user-conditional-id]");
		var currentIfs = [], currentEndIfs = [];
		for (var i=0;i<ifsAndEndIfs.length;i++) {
			if (ifsAndEndIfs[i].firstChild.tagName == "IF") {
				currentIfs.push(ifsAndEndIfs[i]);
			} else {
				currentEndIfs.push(ifsAndEndIfs[i]);
				
			}
			
		}
		currentEndIfs.reverse();
		if (currentIfs.length != currentEndIfs.length) {
			this.deleteUnmatchedNodes(currentIfs,currentEndIfs);
		}
		var activeId = this.activeNodes[0].getAttribute("data-user-conditional-id"),
			activeIf = null;

		currentIfs.forEach(function (ifElement,index) {
			var ifId = ifElement.getAttribute("data-user-conditional-id"),
				endIfId = currentEndIfs[index].getAttribute("data-user-conditional-id");
			if (ifId == activeId) {
				activeIf = ifElement
			}
			if (ifId != endIfId) {
				if (ifId == activeId) {
					this.activeNodes[1].firstElementChild.className = ""
					
					currentEndIfs[index].firstElementChild.className = "active";
					console.log("changing second active",currentEndIfs[index])
					this.activeNodes[1] = currentEndIfs[index]
				}

				currentEndIfs[index].setAttribute("data-user-conditional-id",ifId)
			}
		},this);
		console.log(this.activeNodes.concat())
		this.updatePath()
		
		
	},
	handleEnter: function (event) {

	},
	insertBoth: function (event) {
		if (!event.shiftKey) {
			var id = "uc"+UserConditionalManager.count++
			var ifNode = this.ifTemplate.cloneNode(true)
			ifNode.setAttribute("data-user-conditional-id",id)
			this.selectionTracker.insertEntityWrapperAtCursor(ifNode);
			var spacer = document.createTextNode('\u00a0 ')
			this.selectionTracker.insertEntityWrapperAtCursor(spacer);
			var endifNode = this.endifTemplate.cloneNode(true)
			endifNode.setAttribute("data-user-conditional-id",id)
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
					this.activeNodes = null;
					this.pathElement.style.visibility = "hidden"
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
function SelectionTracker() {
		this.helper = new EntitiesHelper();
		this.zeroWidthSpaces = [];
	}
	SelectionTracker.prototype = {
		init: function (element) {
			this.element = element;
			this.document = element.ownerDocument;
			this.document.addEventListener("click",this,true);
			this.document.addEventListener("mousedown",this,true);
			this.document.addEventListener("keyup",this,true);
			this.document.addEventListener("keydown",this,true);
			this.document.addEventListener("paste",this,true)
			this.document.addEventListener("cut",this,true)
		},
		handleEvent: function (event) {
			return this[event.type+"Handler"](event)
		},
		mousedownHandler: function (event) {
			var cursorDetails = this.getCursorDetails(event)
			if (cursorDetails.withoutTextEnd) {
				cursorDetails.withoutTextEnd.appendChild(this.getZeroWidthSpace())

			}
			//event.stopPropagation();
		},
		clickHandler: function (event) {
			
			
			var cursorDetails = this.getCursorDetails(event);
			var baseNode = cursorDetails.baseNode;
			if (baseNode) {
					var entity = this.getEntityElement(baseNode.parentNode);
					if (entity) {

							this.selectNode(entity)
							event.stopPropagation()
						
						
						
					} 
			}
		},
		keydownHandler: function (event) {
			var baseNode = this.document.getSelection().baseNode
			if (baseNode.data == "\u200b") {
				if (baseNode.nextSibling) {
					baseNode.data = ""
				} 
			}
			switch (event.keyCode) {
				case 13: return this.keyEnterDownHandler(event);
				case 8 : return this.deleteHandler(event);
				case 37: return this.keyLeftDownHandler(event);	
				case 39: return this.keyRightDownHandler(event);
				case 46: return this.backspaceHandler(event);
			}
		},
		deleteHandler: function (event) {
			var cursorDetails = this.getCursorDetails(event)
			if (cursorDetails.atStartOfElement) {
				if (cursorDetails.textNode && cursorDetails.textNode.parentNode.hasAttribute("data-deletable")) {
					event.preventDefault();
				} else if (cursorDetails.baseNode && cursorDetails.baseNode.hasAttribute && cursorDetails.baseNode.hasAttribute("data-deletable")) {
					event.preventDefault()
				}
			}


			
			
		},
		backspaceHandler: function (event) {
			var cursorDetails = this.getCursorDetails(event);
			if (!cursorDetails.textNode && !cursorDetails.beforeElement) {
				
				if (cursorDetails.baseNode.parentNode.hasAttribute("data-deletable")) {
					event.preventDefault()
					return
				}
				event.preventDefault()
			}
			if (cursorDetails.atEndOfElement) {
				console.log("EE")
				var node = cursorDetails.baseNode;
				if (node.parentNode.hasAttribute("data-deletable")) {
					event.preventDefault()
					return
				}
				while (node && !node.nextSibling) {
					node = node.parentNode;
				}
				if (node) {
					while (node.nextSibling && node.nextSibling.nodeType == 3 && !node.nextSibling.data.replace(/\s/gm,'').length) {
						
						node = node.nextSibling;
					}
					if (node && node.nextSibling && node.nextSibling.hasAttribute("data-deletable") ) {
						event.preventDefault()
					}
					
				}
				
			}
		},
		keyRightDownHandler: function (event) {
			
			if (this.selectedNode) {
				//var selection = this.document.getSelection();
				//selection.collapseToEnd();
				//var range = document.createRange()
				//range.selectNode(this.selectedNode.nextSibling);
				//range.collapse()
				//selection.removeAllRanges()
				//selection.addRange(range)
				
				
			}
			event.stopPropagation()
		},
		keyLeftDownHandler: function (event) {

			var cursorDetails = this.getCursorDetails(event)
			if (cursorDetails.baseNode && cursorDetails.baseNode.data == "\u200b") {
				if (cursorDetails.baseNode.previousSibling) {
					this.selectNode(cursorDetails.baseNode.previousSibling);
					
					event.preventDefault();
					event.stopPropagation();
					return
				}
			}
			this.getSurroundingNodes(cursorDetails);

			if (cursorDetails.nodeToLeft) {
				this.selectNode(cursorDetails.nodeToLeft);

				event.preventDefault();
				event.stopPropagation();
				return
				
			} else {
				if (this.selectedNode && cursorDetails.entityNode) {
					this.insertCursorBefore(cursorDetails.entityNode)
					event.preventDefault()
					
				}
				else if (cursorDetails.beforeElementWithNoWhiteSpace) {

					cursorDetails.beforeElementWithNoWhiteSpace.appendChild(this.getZeroWidthSpace())

				}
				
				this.selectedNode = false;
			}
			event.stopPropagation()
			
		},
		keyupHandler: function (event) {

			
			
			switch (event.keyCode) {
				case 37: return this.keyLeftUpHandler(event);	
				case 13 : return this.keyEnterUpHandler(event)
				case 39 : return this.keyRightUpHandler(event);
			}

			
		},
		keyLeftUpHandler: function (event) {

			event.stopPropagation()
		},
		keyEnterDownHandler: function () {
			var cursorDetails = this.getCursorDetails()
			if (cursorDetails.baseNode.parentNode.hasAttribute("data-deletable")) {
				this.readOnlyEnter = true;
			} 
		},
		keyEnterUpHandler: function (event) {
			if (this.readOnlyEnter) {
				var cursorDetails = this.getCursorDetails();

				if (cursorDetails.baseNode.removeAttribute) {
					cursorDetails.baseNode.removeAttribute("data-deletable")
				} else if (cursorDetails.baseNode.nodeType == 3) {
					cursorDetails.baseNode.parentNode.removeAttribute("data-deletable")
				}
				this.readOnlyEnter = false;
			}
			
			
		},
		keyRightUpHandler: function (event) {
			var cursorDetails = this.getCursorDetails(event)
			this.getSurroundingNodes(cursorDetails)
			
			if (!this.selectedNode) {
				if (cursorDetails.nodeToLeft) {
					this.selectNode(cursorDetails.nodeToLeft);
					event.preventDefault()
					event.stopPropagation();
				} else {
					if (cursorDetails.atEndOfElement && cursorDetails.nodeToRight) {
						this.selectNode(cursorDetails.nodeToRight);
						event.preventDefault();
						event.stopPropagation();
					}
				}
			} else {
				this.moveCursorAfter(this.selectedNode)
				event.preventDefault()
				this.selectedNode = false;
			}
			event.stopPropagation()
		},
		pasteHandler: function (event) {
			
			event.stopPropagation()
			var selection = this.document.getSelection(),
				nodeBefore;
			
			if (selection.baseNode.nodeType==3) {
				nodeBefore = selection.baseNode;

				//nodeAfter = selection.baseNode.splitText(selection.baseOffset)
			}
			var range = selection.getRangeAt(0);
			this.markNodes(this.element)
			setTimeout(this.postpaste.bind(this,range,nodeBefore,selection.baseOffset))
		},
		getEntityElement: function (element) {//slightly different to entities helper method
			if (element) {
				while (element && element!=this.element) {
					if (element.hasAttribute && element.hasAttribute("data-entity-node")) return element;
					element = element.parentNode;
				}
			}
			return false 
		},
		postpaste: function (originalRange,nodeBefore,offset,nodeAfter) {
			
			var selection = this.document.getSelection();
			
			if (!selection.rangeCount) {
				
				return;
			}
			var newCursorContainer = (selection.getRangeAt(0).commonAncestorContainer)
			
			var brokenEntities = this.helper.getBrokenEntities(this.document);
			for (var i=0,enitity;i<brokenEntities.length;i++) {
				entity = brokenEntities[i]
				if (entity.firstChild.tagName == "BR") {
					var parent = entity.parentNode,
						grandParent = parent.parentNode

					parent.parentNode.replaceChild(document.createTextNode(" "),parent);

					selection.selectAllChildren(grandParent)
					selection.collapseToEnd();
					continue
				}
				if (entity.parentNode == this.element) {
					if (originalRange.commonAncestorContainer.nodeType == 3) {
						var newNode = nodeBefore.splitText(offset);
						newNode.parentNode.insertBefore(entity,newNode);
						newNode.parentNode.insertBefore(document.createTextNode("\u00a0"),newNode)
					}
				} else if (entity.parentNode.parentNode == this.element && !entity.nextSibling && !entity.previousSibling) {
					entity.parentNode.insertBefore(document.createTextNode("\u00a0"),newNode)
				}
				entity.contentEditable = "false";
			}
		},
		cutHandler: function () {
			console.log(document.getSelection().getRangeAt(0).createContextualFragment())
		},
		markNodes: function (main) {
			var marker = {}
		    var loop = function(main) {
		        do {
		            main.marker = marker;
		            if(main.hasChildNodes()) {
		            	loop(main.firstChild);
		            }
		                
		        }
		        while (main = main.nextSibling);
		    }
		    loop(main);
		},
		getNewNodes: function (main) {
			if (!main) {
				debugger;
			}
			var newNodes = [];
		    var loop = function(main) {
		        do {
		            if (!main.marker) {
		            	newNodes.push(main)
		            }
		        }
		        while (main = main.nextSibling);
		        
		    }
		    return newNodes;
		},
		getSurroundingNodes: function (cursorDetails) {
			var baseNode = cursorDetails.baseNode;
			var currentSelected = this.selectedNode;
			if (baseNode) {
				cursorDetails.entityNode = this.getEntityElement(baseNode)
				if (cursorDetails.atStartOfTextNode && baseNode.previousSibling && this.getEntityElement(baseNode.previousSibling)) {
					cursorDetails.nodeToLeft = baseNode.previousSibling
				}
				if (cursorDetails.atEndOfTextNode && baseNode.nextSibling && this.getEntityElement(baseNode.nextSibling)) {
					
					if (currentSelected!=baseNode.nextSibling) {
						cursorDetails.nodeToRight = baseNode.nextSibling;
					}
				}

				if (cursorDetails.atEndOfElement ) {
					if (baseNode.lastChild && baseNode.lastChild.nodeType == 3) {
						if (!baseNode.lastChild.data.trim().length) {

							var previous = baseNode.lastChild.previousSibling;
							if (this.getEntityElement(previous)) {//weird end of node behaviour
								cursorDetails.nodeToRight = cursorDetails.nodeToLeft = previous;
							}
						}
						
					}
					if (currentSelected!=baseNode.lastChild) {
						
					}
					return
				}

				if (cursorDetails.atEndOfTextNode && baseNode.nextSibling && this.getEntityElement(baseNode.nextSibling)) {
					//console.log(cursorDetails)
					if (currentSelected!=baseNode.nextSibling) {
						cursorDetails.nodeToRight = baseNode.nextSibling
						//this.selectNode(baseNode.nextSibling);
					}
				}
			}
		},
		getCursorDetails: function (event) {
			var currentSelected = this.selectedNode;
			var selection = this.document.getSelection();
			var cursorDetails = {
				baseNode: selection.baseNode,
				isCaret: selection.isCollapsed
				
			}

			
			if (selection.baseNode === null && /mouse/.test(event.type)) {
					cursorDetails.entityNode = this.getEntityElement(event.target)
				if (event.target.lastChild.nodeType !== 3) {
					cursorDetails.withoutTextEnd = event.target;
				}

			}

			var baseNode = selection.baseNode;
			if (baseNode && baseNode.nodeType==3) {
				if (selection.baseOffset==0) {

					cursorDetails.atStartOfTextNode = true;
					if (!baseNode.previousSibling) {
						
						cursorDetails.atStartOfElement = true;
					}
				} else if (selection.baseOffset == selection.baseNode.data.length){

					cursorDetails.atEndOfTextNode = true;
					if (!baseNode.nextSibling) {
						cursorDetails.atEndOfElement = true;
					}
				} else {
					cursorDetails.inTextNode = true;
				}
				cursorDetails.textNode = baseNode
			} else if (baseNode) {
				
				if (baseNode.childNodes[selection.baseOffset-1]) {
					cursorDetails.atEndOfElement = true;
				} else {

					if (!baseNode.firstChild || !baseNode.innerText.trim() || baseNode.firstChild.tagName == "BR" ) {
					cursorDetails.atEndofElement = true;
					cursorDetails.atStartOfElement = true;
					cursorDetails.atStartOfTextNode = true;
					cursorDetails.atEndOfTextNode = true;
					cursorDetails.inEmptyElement = true;
				} else {
					cursorDetails.beforeElement = true;
					cursorDetails.nextElement = baseNode.childNodes[selection.baseOffset]
				}
				}
			}
			if (cursorDetails.atStartOfElement) {
			var currentNode = baseNode;
			while (currentNode && !currentNode.previousSibling) {
				currentNode = currentNode.parentNode
			}
			if (currentNode.previousSibling && currentNode.previousSibling.nodeType!=3 && currentNode.previousSibling.lastChild) {
				if (currentNode.previousSibling.lastChild.nodeType!=3) {
					cursorDetails.beforeElementWithNoWhiteSpace = currentNode.previousSibling;
				}
			}


			}
			if (baseNode && baseNode.nodeType==3 && baseNode.data === "\u00a0" && !baseNode.nextSibling) {
			   cursorDetails.atFinalNbsp = true;
			}
			
			return cursorDetails
		},
		selectNode: function (node) {
			var selection = this.document.getSelection();
			selection.removeAllRanges();
			var range = this.document.createRange();

			if (!node.nextSibling) {
				node.parentNode.appendChild(this.getZeroWidthSpace())
			}
			if (!node.previousSibling) {
				node.parentNode.insertBefore(this.getZeroWidthSpace(),node)
			}
			
			
			range.selectNode(node);
			range.setStartBefore(node.previousSibling)
			range.setEndAfter(node.nextSibling)

			
			selection.removeAllRanges()
			selection.addRange(range);
			this.selectedNode = node;
			//this.cleanZeroWidthSpaces()

		},
		insertCursorBefore: function (node) {
			var range = this.document.createRange(),
				selection = this.document.getSelection();
				cursor = this.getZeroWidthSpace()
			node.parentNode.insertBefore(cursor,node)
			range.selectNode(cursor);
			selection.removeAllRanges();
			selection.addRange(range);
			selection.collapseToEnd();
		},
		moveCursorAfter: function (node) {
		},
		getZeroWidthSpace: function () {
			var space = this.document.createTextNode("\u200b")
			this.zeroWidthSpaces.push(space)
			return space;
		},
		cleanZeroWidthSpaces: function () {
			this.zeroWidthSpaces.forEach(function (space) {
				if (space.parentNode) {
					space.parentNode.removeChild(space)
				}
			})
			this.zeroWidthSpaces = [];
		}
	}
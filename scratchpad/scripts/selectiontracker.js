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
							event.preventDefault()
							
						
						
						
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
		keyLeftDownHandler: function (event) {//before selection

			var cursorDetails = this.getCursorDetails(event),
			baseNode = cursorDetails.baseNode;
			if (baseNode && baseNode.nodeType == 3) {
				var whitespace = this.isWhitespace(cursorDetails.baseNode.data),
					length = baseNode.data.length,
					offset = cursorDetails.textOffset,
					previousSibling = baseNode.previousSibling,
					startOfElementIncludingWhitespace;
				if (!previousSibling) {//start of element
					if (whitespace) {//remove any halfwidth space 
						if (cursorDetails.baseNode.data.indexOf("\u200b") == 1) {
							cursorDetails.baseNode.data = " "
						}
					} else {
						console.log(133)
					}
				} else {
					startOfElementIncludingWhitespace = !previousSibling.previousSibling,
					endOfElement = !baseNode.nextSibling,
					entityNode = this.getEntityElement(previousSibling)
					if (startOfElementIncludingWhitespace && entityNode) {
						
						this.selectNode(entityNode);
						event.preventDefault()
						return
					}
					if (whitespace && endOfElement && entityNode) {
						this.selectNode(entityNode);
						event.preventDefault()
						return
						
					} else {
						if (entityNode && offset == 0) {
							this.selectNode(entityNode);
							event.preventDefault()
							return
						}
					}
				}
			}
			
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
		
		
		keyRightDownHandler: function (event) {
			var cursorDetails = this.getCursorDetails();
			if (cursorDetails.atEndOfElement) {
				event.stopPropagation();
			} else {
				var baseNode = cursorDetails.baseNode;
				if (baseNode.nodeType != 3 && cursorDetails.baseOffset == 0 && baseNode.firstChild) {//at beginning of element
					
					var entity = this.getEntityElement(baseNode.firstChild)
					if (entity) {
						console.log(1)
						this.selectNode(entity);
						this.selectedNodeOnDown = true;
						event.stopPropagation();
						event.preventDefault();
						return
					} else {
						//textNode as firstChild
						if (this.isWhitespace(baseNode.firstChild)) {
							if (!this.selectedNode) {
								var entity = this.getEntityElement(baseNode.firstChild.nextSibling)
								if (entity) {
									console.log(3)
									this.selectNode(entity);
									event.stopPropagation();
									event.preventDefault();
									return
								} else {
									console.log(baseNode)
								}
							}
						} else {
							console.log(5)
						}

						
					}
				} else {
					if (baseNode.nodeType == 3) {
						console.log(6)
						if (this.isWhitespace(baseNode)) {
							console.log(7)
							if (cursorDetails.baseOffset == baseNode.data.length) {
								var entity = this.getEntityElement(baseNode.nextSibling)
							if (entity) {
								console.log(8)
								//this.selectNode(entity);
								//this.selectedNodeOnDown = true;
								//event.stopPropagation();
								//event.preventDefault();
								return
							} else {
								console.log(9)
							}
							}
							
						}
						this.selectedNode = null
					} else {
						console.log(231)
					}
				}

				

			}
			
		},
		keyRightUpHandler: function (event) {
			var cursorDetails = this.getCursorDetails(event);
			if (this.selectedNodeOnDown) {
				this.selectedNodeOnDown = false;
				//this.moveCursorAfter(this.selectedNode)
				event.preventDefault()
				event.stopPropagation()
				return
			} else if (!this.selectedNode) {

				if (cursorDetails.baseNode.nodeType!=3)	{
				 if (cursorDetails.baseOffset == 0) {//at start of node
				 	console.log("194");
					return
				} else {
					console.log(197)
					var entity  = cursorDetails.baseNode.childNodes[cursorDetails.baseOffset-1]
					if (entity) {
						this.selectNode(entity);
						event.stopPropagation()
						return
					} else {
						console.log(213)
					}
				}
				
				} else {
					var entity = this.getEntityElement(cursorDetails.baseNode.nextSibling)
					if (entity && this.isWhitespace(cursorDetails.baseNode)) {
						
						if (cursorDetails.baseNode.data.charAt(cursorDetails.baseOffset-1)=="\u200b") {
							this.selectNode(entity)
						}
						
						
					}
				}
			}	
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
				baseOffset: selection.baseOffset,
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
				cursorDetails.textOffset = selection.baseOffset
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
			if (baseNode && baseNode.nodeType==3 && /^\s*\u00a0\s*$/.test(baseNode.data) && !baseNode.nextSibling) {
			   cursorDetails.atFinalNbsp = true;
			}
			
			return cursorDetails
		},
		selectNode: function (node) {
			var selection = this.document.getSelection();
			selection.removeAllRanges();
			var range = this.document.createRange();

			if (!node.nextSibling || !node.nextSibling.data) {
				node.parentNode.insertBefore(this.getZeroWidthSpace(true),node.nextSibling);
			}
			if (!node.previousSibling || !node.previousSibling.data) {
				node.parentNode.insertBefore(this.getZeroWidthSpace(true),node);
			}
			
			
			range.selectNode(node);
			selection.removeAllRanges()
			selection.addRange(range);
			this.selectedNode = node;
			this.cleanZeroWidthSpaces()

		},
		insertCursorBefore: function (node) {
			return
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
			var selection = this.document.getSelection()
			var range = document.createRange()
			selection.removeAllRanges()
			var range = document.createRange();
			range.selectNode(node.nextSibling)
			
			
			selection.addRange(range)
			selection.collapseToStart()
			
		},
		getZeroWidthSpace: function (addSpaces) {
			var spaces = addSpaces? " \u200b" : "\u200b";
			var space = this.document.createTextNode(spaces)
			this.zeroWidthSpaces.push(space)
			return space;
		},
		cleanZeroWidthSpaces: function () {
			
			var baseNode = document.getSelection().baseNode
			this.zeroWidthSpaces.forEach(function (space) {
				if (baseNode != space && space.parentNode && space.previousSibling && space.nextSibling) {
					space.data = " "
				}
			})
			this.zeroWidthSpaces = [];
		},
		isWhitespace: function (nodeOrString) {
			var string = typeof nodeOrString == "string" ? nodeOrString : nodeOrString.data;
			return /^(\r|\n|\s|\u200b|\u00a0)*$/mg.test(string)
		}
	}
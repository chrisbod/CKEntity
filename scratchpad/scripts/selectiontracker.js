function SelectionTracker() {
		this.helper = new EntitiesHelper();
		this.zeroWidthSpaces = [];
		this.collapser = ConditionalCollapser.getInstance()
	}

SelectionTracker.getInstance = function () {
	if (!this.instance) {
		this.instance = new this()
	}
	return this.instance
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
			this.document.addEventListener("drop",this,true)
			this.document.addEventListener("copy",this,true);
		},
		handleEvent: function (event) {
			return this[event.type+"Handler"](event)
		},
		copyHandler: function (event) {
			var selection  = this.document.getSelection();
			var range = selection.getRangeAt(0).cloneContents()
			this.copyRange = range;
		},
		dropHandler: function (event) {
		var selection  = this.document.getSelection();
		if (selection.rangeCount) {
			this.internalDropHandler(event)
		} else {
			setTimeout(this.internalDropHandler.bind(this,event))
		}
		
	},
	pasteHandler: function (event) {
		var selection = this.document.getSelection();
		if (selection.rangeCount && this.copyRange) {//internal copy so all good...
			var range = selection.getRangeAt(0);
			var copiedFragment= range.cloneContents();
			event.stopPropagation();
			event.preventDefault();
 			setTimeout(this.postpasteHandler.bind(this,event,range,copiedFragment,this.copyRange))
 			//this.copyRange = null;
		}
		
	},
	postpasteHandler: function (event,range,copiedFragment,copyRange) {
		if (!this.copyRange) {
			return this.attemptToGetPastedInfo(event,range,copiedFragment)
		}
		var startNode = range.startContainer;
		var newTextNode;
			if (startNode.nodeType == 3) {
				newTextNode = startNode.splitText(range.startOffset);
			} else {
				startNode = startNode.insertBefore(document.createTextNode(" "),startNode.firstChild);

				newTextNode = startNode.parentNode.insertBefore(document.createTextNode(" "),startNode.nextSibling);
			}
			newTextNode.parentNode.insertBefore(copyRange,newTextNode);
		if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
			CKEDITOR.currentInstance.fire("saveSnapshot");
		}
	},
	attemptToGetPastedInfo: function () {
		if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
			CKEDITOR.currentInstance.fire("saveSnapshot");
		}
	},
	internalDropHandler: function (event) {

		var dropTarget = this.document.elementFromPoint(event.pageX,event.pageY),
			caret = this.document.caretRangeFromPoint(event.pageX,event.pageY);	
		if (dropTarget) {
				var selection = dropTarget.ownerDocument.getSelection();
				var range = selection.getRangeAt(0);
				var startNode = caret.startContainer,
					nextTextNode,
					fragment;
				if (event.ctrlKey) {
					fragment = range.cloneContents();
				} else {
					fragment = range.extractContents();
					
				}
				fragment = this.cleanFragment(fragment);
				
				if (startNode.nodeType == 3) {
					newTextNode = startNode.splitText(caret.startOffset);
				} else {
					startNode = startNode.insertBefore(document.createTextNode(""),startNode.firstChild);

					newTextNode = startNode.parentNode.insertBefore(document.createTextNode(""),startNode.nextSibling);

				}
				try {
					newTextNode.parentNode.insertBefore(fragment,newTextNode);
				} 
				catch (e) {
					//console.log(e) 
				}
				
				range.setStartAfter(startNode);
				range.setEndBefore(newTextNode);
				selection.removeAllRanges();
				selection.addRange(range);
				event.stopPropagation();
				event.preventDefault();
				if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
					//debugger;
						CKEDITOR.currentInstance.fire("saveSnapshot");
				}
		}
		
	},
	getBlockLevelElement: function (element) {
		//going to do this via tag detection but maybe should use computedStyle?
		var blocks = /^(p|address|article|aside|blockquote|main|div|section|footer|header|li|ul|ol|h1|h2|h3|h4|h5|h6|body)$/i
		var currentElement = element.parentNode
		while (currentElement && currentElement!=element.ownerDocument.body) {
			if (blocks.test(currentElement.tagName)) {
				return currentElement
			}
			currentElement = currentElement.parentNode;
		}
		return null;
	},
	makeEntityBlockLevel: function (element) {
		
		if (!element) {
			element = this.getEntityElement(this.document.getSelection().baseNode)
			if (!element) return false;
		}
		if (element.getAttribute("data-block-level") != "true") {
			var block = this.getBlockLevelElement(element);
			if (block) {
				var beforeRange = this.document.createRange()
				beforeRange.selectNode(block)
				beforeRange.setEndBefore(element);
				var afterRange = this.document.createRange()
				afterRange.selectNode(block)
				afterRange.setStartAfter(element);
				element.parentNode.insertBefore(beforeRange.extractContents(),element)
				element.parentNode.insertBefore(afterRange.extractContents(),element.nextSibling)
				element.setAttribute("data-block-level","true")
				return true;
			} else {
				return false;
			}
			
		}
		return false;

	},
	cleanFragment: function (fragment) {
		return fragment
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
					if (entity && entity.getAttribute("data-entity-node")!="user") {

							this.selectNode(entity)
							event.preventDefault()
							return
							
						
						
						
					} 
			}
			this.selectedNode = null;
		},
		keydownHandler: function (event) {
			
			switch (event.keyCode) {
				//case 13: return this.keyEnterDownHandler(event);
				//case 8 : return this.deleteHandler(event);
				case 37: return this.keyLeftDownHandler(event);	
				case 39: return this.keyRightDownHandler(event);
				//case 46: return this.backspaceHandler(event);
			}
		},
		deleteHandler: function (event) {
			if (this.selectedNode && event.keyCode == 8) {
				this.removeCurrentEntityIfAllowed()
				event.stopPropagation();
				event.preventDefault();
			}
		},
	
	removeCurrentEntityIfAllowed: function () {
		//you cannot remove tokens or conditionals if they are part of a translation
		if (this.selectedNode) {
			var entityType = this.selectedNode.getAttribute("data-entity-node"),
				deleteAllowed = false;
			if (entityType) {
				if (entityType == "conditional") {
					this.collapser.collapse(this.selectedNode);

				} else 
					if (entityType == "translation") {
						deleteAllowed = true;
					} else {
						if (entityType == "token") {
							deleteAllowed = true;
						}
						var currentNode = this.selectedNode;
						while (currentNode && currentNode!=this.element) {
							if (currentNode.getAttribute("data-entity-node") == "translation") {
								deleteAllowed = false;
								break;
							}
							currentNode = currentNode.parentNode;
						}
					}
					if (deleteAllowed) {
						this.selectedNode.parentNode.removeChild(this.selectedNode);
						this.selectedNode = null;
					}

			}
			if (typeof CKEDITOR != "undefined" && CKEDITOR.currentInstance) {
				CKEDITOR.currentInstance.fire("saveSnapshot");
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
			//console.log(this.getCursorDetails())
			event.stopPropagation()
			
		},
		keyupHandler: function (event) {

			
			
			switch (event.keyCode) {
				case 37: return this.keyLeftUpHandler(event);	
				//case 13 : return this.keyEnterUpHandler(event)
				case 39 : return this.keyRightUpHandler(event);
			}

			
		},
		keyLeftUpHandler: function (event) {
			var cursorDetails = this.getCursorDetails()
			try {
			if (cursorDetails.textNode.nextSibling.tagName == "SPAN") {
				if (!this.selectedNode) this.selectNode(cursorDetails.textNode.nextSibling)
			}
			}
			catch (e) {
			
			}
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
			var cursorDetails = this.getCursorDetails()
			console.log(cursorDetails.nextSibling)
			event.stopPropagation()

				

			
			
		},
		keyRightUpHandler: function (event) {
			var details = this.getCursorDetails()
			console.log(details.baseNode, details.textOffset)
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
		cutHandler: function () {
			//console.log(document.getSelection().getRangeAt(0).createContextualFragment())
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
					////console.log(cursorDetails)
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
				//node.parentNode.insertBefore(this.getZeroWidthSpace(true),node.nextSibling);
			}
			if (!node.previousSibling || !node.previousSibling.data) {
				//node.parentNode.insertBefore(this.getZeroWidthSpace(true),node);
			}
			
			
			range.selectNode(node);
			selection.removeAllRanges()
			selection.addRange(range);
			this.selectedNode = node;
			//this.cleanZeroWidthSpaces()

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
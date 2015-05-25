function SelectionTracker() {
		this.helper = new EntitiesHelper();
	}
	SelectionTracker.prototype = {
		init: function (element) {
			this.element = element;
			this.document = element.ownerDocument;
			this.document.addEventListener("mouseup",this,true);
			this.document.addEventListener("mousedown",this,true);
			this.document.addEventListener("keyup",this,true);
			this.document.addEventListener("keydown",this,true);
			this.document.addEventListener("paste",this,true)
		},
		handleEvent: function (event) {
			return this[event.type+"Handler"](event)
		},
		mousedownHandler: function () {
			//var cursorDetails = this.getCursorDetails()
			//console.log(cursorDetails)
		},
		mouseupHandler: function (event) {
			var cursorDetails = this.getCursorDetails(event);
			var baseNode = cursorDetails.baseNode;
			if (baseNode && cursorDetails.inTextNode && this.helper.isEntityElement(baseNode.parentNode)) {
				this.selectNode(baseNode.parentNode);
			}
		},
		keydownHandler: function (event) {

			switch (event.keyCode) {
				case 13: return this.keyEnterDownHandler(event);
				case 8 : return this.deleteHandler(event);
				case 37: return this.keyLeftDownHandler(event);	

			}
		},
		deleteHandler: function (event) {
			var cursorDetails = this.getCursorDetails(event)
			if (cursorDetails.atStartOfElement) {
				if (cursorDetails.textNode && cursorDetails.textNode.parentNode.hasAttribute("data-deletable")) {
					event.preventDefault()
				} else if (cursorDetails.baseNode && cursorDetails.baseNode.hasAttribute && cursorDetails.baseNode.hasAttribute("data-deletable")) {
					event.preventDefault()
				}
			}

			
			
		},
		keyLeftDownHandler: function (cursorDetails) {
			var cursorDetails = this.getCursorDetails(event)
			this.getSurroundingNodes(cursorDetails)
			if (cursorDetails.nodeToLeft) {
				this.selectNode(cursorDetails.nodeToLeft);
				event.preventDefault()
			} else {
				this.selectedNode = false;
			}
		},
		keyupHandler: function (event) {
			switch (event.keyCode) {
				case 13 : return this.keyEnterUpHandler(event)
				case 39 : return this.keyRightUpHandler(event);
			}
			
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
				} else {
					if (cursorDetails.atEndOfElement && cursorDetails.nodeToRight) {
						this.selectNode(cursorDetails.nodeToRight);
						event.preventDefault()
					}
				}
			} else {
				this.selectedNode = false;
			}
		},
		pasteHandler: function () {
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
		postpaste: function (originalRange,nodeBefore,offset,nodeAfter) {
			
			var selection = this.document.getSelection();
			
			if (!selection.rangeCount) {
				
				return;
			}
			var newCursorContainer = (selection.getRangeAt(0).commonAncestorContainer)
			if (!newCursorContainer.childNodes.length) {
				console.log("here")
			}
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
				
				if (cursorDetails.atStartOfTextNode && baseNode.previousSibling && this.helper.isEntityElement(baseNode.previousSibling)) {
					cursorDetails.nodeToLeft = baseNode.previousSibling
				}
				if (cursorDetails.atEndOfTextNode && baseNode.nextSibling && this.helper.isEntityElement(baseNode.nextSibling)) {
					
					if (currentSelected!=baseNode.nextSibling) {
						cursorDetails.nodeToRight = baseNode.nextSibling;
					}
				}

				if (cursorDetails.atEndOfElement ) {
					if (baseNode.lastChild && baseNode.lastChild.nodeType == 3) {
						if (!baseNode.lastChild.data.trim().length) {

							var previous = baseNode.lastChild.previousSibling;
							if (this.helper.isEntityElement(previous)) {//weird end of node behaviour
								cursorDetails.nodeToRight = cursorDetails.nodeToLeft = previous;
							}
						}
						
					}
					if (currentSelected!=baseNode.lastChild) {
						
					}
					return
				}

				if (cursorDetails.atEndOfTextNode && baseNode.nextSibling && this.helper.isEntityElement(baseNode.nextSibling)) {
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
			var selection = document.getSelection();
			var cursorDetails = {
				baseNode: selection.baseNode
				
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
				}
				}
			}
			
			return cursorDetails
		},
		selectNode: function (node) {

			var selection = document.getSelection();
			selection.removeAllRanges();
			var range = document.createRange();
			
			range.selectNode(node);
			
			selection.removeAllRanges()
			selection.addRange(range);
			this.selectedNode = node;
		}
	}
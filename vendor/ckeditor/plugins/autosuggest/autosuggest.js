CKEDITOR.plugins.add('autosuggest',
            {
                init : function(editor) {
                		editor.addCommand("autosuggest.update", 


                		{
                			exec: function () {]




                		})
                     var autocompleteCommand = editor.addCommand('autosuggest', {
                        exec : function(editor) {}
                    })
                }
             }

                                var firstExecution = true;
                    var dataElement = {};

                     editor.addCommand('reloadSuggetionBox', {
                            exec : function(editor) {
                                if (editor.contextMenu) {
                                    dataElement = {};
                                    editor.addMenuGroup('suggestionBoxGroup');

                            $.each(Suggestions,function(i, suggestion)
                            {
                                    var suggestionBoxItem = "suggestionBoxItem"+ i; 
                                    dataElement[suggestionBoxItem] = CKEDITOR.TRISTATE_OFF;
                                    editor.addMenuItem(suggestionBoxItem,
                                                                        {
                                        id : suggestion.id,
                                        label : suggestion.label,
                                        group : 'suggestionBoxGroup',
                                        icon  : null,
                                        onClick : function() {
                                            var data = editor.getData();
                                            var selection = editor.getSelection();
                                            var element = selection.getStartElement();
                                            var ranges = selection.getRanges();
                                            ranges[0].setStart(element.getFirst(), 0);
                                            ranges[0].setEnd(element.getFirst(),0);
                                            editor.insertHtml(this.id + '&nbsp;');
                                            },
                                            });
                                    });

                                    if(firstExecution == true)
                                        {
                                            editor.contextMenu.addListener(function(element) {
                                                return dataElement;
                                            });
                                        firstExecution = false;
                                        }
                                }
                            }
                     });

                    delete editor._.menuItems.paste;
                },
            });
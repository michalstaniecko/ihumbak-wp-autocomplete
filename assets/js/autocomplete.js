(function($) {
    'use strict';
    
    var IHumbakAutocomplete = {
        currentSuggestion: '',
        isLoading: false,
        suggestionElement: null,
        typingTimer: null,
        typingDelay: 1500, // Wait 1.5 seconds after user stops typing
        
        init: function() {
            console.log('IHumbak Autocomplete: Initializing plugin...');
            this.createSuggestionElement();
            this.bindEvents();
        },
        
        createSuggestionElement: function() {
            this.suggestionElement = $('<span class="ihumbak-suggestion"></span>');
            this.suggestionElement.hide();
        },
        
        bindEvents: function() {
            var self = this;
            
            // Wait for editor to be ready
            $(document).ready(function() {
                setTimeout(function() {
                    self.initializeEditor();
                }, 1000);
            });
        },
        
        initializeEditor: function() {
            var self = this;
            
            console.log('IHumbak Autocomplete: Detecting editor type...');
            
            // Check if classic editor is active
            if (typeof tinymce !== 'undefined') {
                console.log('IHumbak Autocomplete: TinyMCE detected');
                tinymce.on('AddEditor', function(e) {
                    var editor = e.editor;
                    editor.on('init', function() {
                        console.log('IHumbak Autocomplete: Binding to classic editor');
                        self.bindClassicEditor(editor);
                    });
                });
                
                // Bind to existing editors
                tinymce.editors.forEach(function(editor) {
                    console.log('IHumbak Autocomplete: Binding to existing editor');
                    self.bindClassicEditor(editor);
                });
            }
            
            // Check if block editor (Gutenberg) is active
            if (typeof wp !== 'undefined' && wp.data && wp.data.select('core/editor')) {
                console.log('IHumbak Autocomplete: Block editor (Gutenberg) detected');
                self.bindBlockEditor();
            }
            
            if (typeof tinymce === 'undefined' && (typeof wp === 'undefined' || !wp.data || !wp.data.select('core/editor'))) {
                console.warn('IHumbak Autocomplete: No editor detected. Waiting for editor to load...');
            }
        },
        
        bindClassicEditor: function(editor) {
            var self = this;
            var editorBody = $(editor.getBody());
            
            // Append suggestion element to editor
            editorBody.append(this.suggestionElement);
            
            editor.on('keydown', function(e) {
                self.handleKeyDown(e, editor);
            });
            
            editor.on('keyup', function(e) {
                self.handleKeyUp(e, editor);
            });
        },
        
        bindBlockEditor: function() {
            var self = this;
            
            // Monitor changes in the block editor
            var unsubscribe = wp.data.subscribe(function() {
                var editor = document.querySelector('.block-editor-writing-flow');
                if (editor && !editor.dataset.ihumbakBound) {
                    editor.dataset.ihumbakBound = 'true';
                    self.bindBlockEditorEvents(editor);
                }
            });
        },
        
        bindBlockEditorEvents: function(editor) {
            var self = this;
            
            editor.addEventListener('keydown', function(e) {
                self.handleKeyDownBlock(e);
            });
            
            editor.addEventListener('keyup', function(e) {
                self.handleKeyUpBlock(e);
            });
        },
        
        handleKeyDown: function(e, editor) {
            // ESC key - cancel suggestion
            if (e.keyCode === 27 && this.currentSuggestion) {
                e.preventDefault();
                this.hideSuggestion();
                return false;
            }
            
            // Right arrow key - accept suggestion
            if (e.keyCode === 39 && this.currentSuggestion) {
                var selection = editor.selection;
                var range = selection.getRng();
                
                // Only accept if cursor is at the end of text
                if (range.collapsed) {
                    var node = range.startContainer;
                    var offset = range.startOffset;
                    
                    if (node.nodeType === 3) { // Text node
                        if (offset === node.length) {
                            e.preventDefault();
                            this.acceptSuggestion(editor);
                            return false;
                        }
                    }
                }
            }
        },
        
        handleKeyUp: function(e, editor) {
            var self = this;
            
            // Ignore special keys
            if (e.keyCode === 27 || e.keyCode === 39 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 40) {
                return;
            }
            
            clearTimeout(this.typingTimer);
            this.hideSuggestion();
            
            // Set a timer to get suggestion after user stops typing
            this.typingTimer = setTimeout(function() {
                self.requestSuggestion(editor);
            }, this.typingDelay);
        },
        
        handleKeyDownBlock: function(e) {
            // ESC key - cancel suggestion
            if (e.keyCode === 27 && this.currentSuggestion) {
                e.preventDefault();
                this.hideSuggestion();
                return false;
            }
            
            // Right arrow key - accept suggestion
            if (e.keyCode === 39 && this.currentSuggestion) {
                var selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    var range = selection.getRangeAt(0);
                    if (range.collapsed) {
                        var node = range.startContainer;
                        var offset = range.startOffset;
                        
                        if (node.nodeType === 3 && offset === node.length) {
                            e.preventDefault();
                            this.acceptSuggestionBlock();
                            return false;
                        }
                    }
                }
            }
        },
        
        handleKeyUpBlock: function(e) {
            var self = this;
            
            // Ignore special keys
            if (e.keyCode === 27 || e.keyCode === 39 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 40) {
                return;
            }
            
            clearTimeout(this.typingTimer);
            this.hideSuggestion();
            
            // Set a timer to get suggestion after user stops typing
            this.typingTimer = setTimeout(function() {
                self.requestSuggestionBlock();
            }, this.typingDelay);
        },
        
        requestSuggestion: function(editor) {
            if (this.isLoading) {
                return;
            }
            
            var content = editor.getContent({format: 'text'});
            if (!content || content.trim().length < 10) {
                return;
            }
            
            // Get the last 500 characters for context
            var textContext = content.substring(Math.max(0, content.length - 500));
            
            this.getSuggestion(textContext, editor);
        },
        
        requestSuggestionBlock: function() {
            if (this.isLoading) {
                return;
            }
            
            if (typeof wp === 'undefined' || !wp.data || !wp.data.select('core/editor')) {
                return;
            }
            
            var content = wp.data.select('core/editor').getEditedPostContent();
            
            // Get plain text from blocks
            var textContent = this.stripHtmlTags(content);
            
            if (!textContent || textContent.trim().length < 10) {
                return;
            }
            
            // Get the last 500 characters for context
            var textContext = textContent.substring(Math.max(0, textContent.length - 500));
            
            this.getSuggestion(textContext, null);
        },
        
        getSuggestion: function(text, editor) {
            var self = this;
            this.isLoading = true;
            
            // Get AI prompt from meta box
            var prompt = $('#ihumbak_ai_prompt').val() || '';
            
            console.log('IHumbak Autocomplete: Requesting suggestion...', {
                textLength: text.length,
                promptLength: prompt.length
            });
            
            $.ajax({
                url: ihumbakAutocomplete.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'ihumbak_get_completion',
                    nonce: ihumbakAutocomplete.nonce,
                    text: text,
                    prompt: prompt
                },
                success: function(response) {
                    self.isLoading = false;
                    console.log('IHumbak Autocomplete: Response received', response);
                    if (response.success && response.data.suggestion) {
                        console.log('IHumbak Autocomplete: Showing suggestion:', response.data.suggestion);
                        self.showSuggestion(response.data.suggestion, editor);
                    } else if (!response.success) {
                        console.error('IHumbak Autocomplete: Error from server:', response.data);
                    }
                },
                error: function(xhr, status, error) {
                    self.isLoading = false;
                    console.error('IHumbak Autocomplete: AJAX error:', {
                        status: status,
                        error: error,
                        response: xhr.responseText
                    });
                }
            });
        },
        
        showSuggestion: function(suggestion, editor) {
            this.currentSuggestion = suggestion;
            
            if (editor) {
                // Classic editor
                this.suggestionElement.text(suggestion);
                this.suggestionElement.show();
                
                // Position at cursor
                var selection = editor.selection;
                var node = selection.getNode();
                $(node).append(this.suggestionElement);
            } else {
                // Block editor - show in a tooltip-like element
                this.showSuggestionBlock(suggestion);
            }
        },
        
        showSuggestionBlock: function(suggestion) {
            var selection = window.getSelection();
            if (selection.rangeCount === 0) {
                return;
            }
            
            var range = selection.getRangeAt(0);
            var rect = range.getBoundingClientRect();
            
            // Create or update suggestion overlay
            var overlay = document.getElementById('ihumbak-suggestion-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'ihumbak-suggestion-overlay';
                overlay.className = 'ihumbak-suggestion-block';
                document.body.appendChild(overlay);
            }
            
            overlay.textContent = suggestion;
            overlay.style.display = 'block';
            overlay.style.left = rect.left + 'px';
            overlay.style.top = (rect.bottom + window.scrollY) + 'px';
        },
        
        hideSuggestion: function() {
            this.currentSuggestion = '';
            this.suggestionElement.hide();
            
            var overlay = document.getElementById('ihumbak-suggestion-overlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        },
        
        acceptSuggestion: function(editor) {
            if (!this.currentSuggestion) {
                return;
            }
            
            // Insert suggestion at cursor position
            editor.execCommand('mceInsertContent', false, ' ' + this.currentSuggestion);
            this.hideSuggestion();
        },
        
        acceptSuggestionBlock: function() {
            if (!this.currentSuggestion) {
                return;
            }
            
            if (typeof wp === 'undefined' || !wp.data || !wp.data.select('core/block-editor')) {
                return;
            }
            
            var selectedBlock = wp.data.select('core/block-editor').getSelectedBlock();
            if (!selectedBlock) {
                return;
            }
            
            // Get current content
            var currentContent = selectedBlock.attributes.content || '';
            
            // Append suggestion
            var newContent = currentContent + ' ' + this.currentSuggestion;
            
            // Update block
            wp.data.dispatch('core/block-editor').updateBlockAttributes(
                selectedBlock.clientId,
                {content: newContent}
            );
            
            this.hideSuggestion();
        },
        
        stripHtmlTags: function(html) {
            var tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        }
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        IHumbakAutocomplete.init();
    });
    
})(jQuery);

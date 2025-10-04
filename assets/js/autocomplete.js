wp.domReady(() => {
    'use strict';
    
    const IHumbakAutocomplete = {
        currentSuggestion: '',
        isLoading: false,
        suggestionElement: null,
        typingTimer: null,
        typingDelay: 1500, // Wait 1.5 seconds after user stops typing
        
        init() {
            console.log('IHumbak Autocomplete: Initializing plugin...');
            this.createSuggestionElement();
            this.bindEvents();
        },
        
        createSuggestionElement() {
            this.suggestionElement = document.createElement('span');
            this.suggestionElement.className = 'ihumbak-suggestion';
            this.suggestionElement.style.display = 'none';
        },
        
        bindEvents() {
            // Wait for editor to be ready
            setTimeout(() => {
                this.initializeEditor();
            }, 1000);
        },
        
        initializeEditor() {
            console.log('IHumbak Autocomplete: Detecting editor type...');
            
            // Check if classic editor is active
            if (typeof tinymce !== 'undefined') {
                console.log('IHumbak Autocomplete: TinyMCE detected');
                tinymce.on('AddEditor', (e) => {
                    const editor = e.editor;
                    editor.on('init', () => {
                        console.log('IHumbak Autocomplete: Binding to classic editor');
                        this.bindClassicEditor(editor);
                    });
                });
                
                // Bind to existing editors
                tinymce.editors.forEach((editor) => {
                    console.log('IHumbak Autocomplete: Binding to existing editor');
                    this.bindClassicEditor(editor);
                });
            }
            
            // Check if block editor (Gutenberg) is active
            if (typeof wp !== 'undefined' && wp.data && wp.data.select('core/editor')) {
                console.log('IHumbak Autocomplete: Block editor (Gutenberg) detected');
                this.bindBlockEditor();
            }
            
            if (typeof tinymce === 'undefined' && (typeof wp === 'undefined' || !wp.data || !wp.data.select('core/editor'))) {
                console.warn('IHumbak Autocomplete: No editor detected. Waiting for editor to load...');
            }
        },
        
        bindClassicEditor(editor) {
            const editorBody = editor.getBody();
            
            // Append suggestion element to editor
            editorBody.appendChild(this.suggestionElement);
            
            editor.on('keydown', (e) => {
                this.handleKeyDown(e, editor);
            });
            
            editor.on('keyup', (e) => {
                this.handleKeyUp(e, editor);
            });
        },
        
        bindBlockEditor() {
            let hasLoggedAttempt = false;
            
            // Monitor changes in the block editor
            const unsubscribe = wp.data.subscribe(() => {
                // Try multiple selectors for different Gutenberg versions
                const editor = document.querySelector('.editor-styles-wrapper') || 
                             document.querySelector('.block-editor-block-list__layout') ||
                             document.querySelector('.edit-post-visual-editor');
                
                if (editor && !editor.dataset.ihumbakBound) {
                    editor.dataset.ihumbakBound = 'true';
                    console.log('IHumbak Autocomplete: Block editor element found and bound');
                    this.bindBlockEditorEvents(editor);
                } else if (!editor && !hasLoggedAttempt) {
                    hasLoggedAttempt = true;
                    console.log('IHumbak Autocomplete: Waiting for block editor element to load...');
                }
            });
        },
        
        bindBlockEditorEvents(editor) {
            editor.addEventListener('keydown', (e) => {
                this.handleKeyDownBlock(e);
            });
            
            editor.addEventListener('keyup', (e) => {
                this.handleKeyUpBlock(e);
            });
        },
        
        handleKeyDown(e, editor) {
            // ESC key - cancel suggestion
            if (e.keyCode === 27 && this.currentSuggestion) {
                e.preventDefault();
                this.hideSuggestion();
                return false;
            }
            
            // Right arrow key - accept suggestion
            if (e.keyCode === 39 && this.currentSuggestion) {
                const selection = editor.selection;
                const range = selection.getRng();
                
                // Only accept if cursor is at the end of text
                if (range.collapsed) {
                    const node = range.startContainer;
                    const offset = range.startOffset;
                    
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
        
        handleKeyUp(e, editor) {
            // Ignore special keys
            if (e.keyCode === 27 || e.keyCode === 39 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 40) {
                return;
            }
            
            clearTimeout(this.typingTimer);
            this.hideSuggestion();
            
            // Set a timer to get suggestion after user stops typing
            this.typingTimer = setTimeout(() => {
                this.requestSuggestion(editor);
            }, this.typingDelay);
        },
        
        handleKeyDownBlock(e) {
            // ESC key - cancel suggestion
            if (e.keyCode === 27 && this.currentSuggestion) {
                e.preventDefault();
                this.hideSuggestion();
                return false;
            }
            
            // Right arrow key - accept suggestion
            if (e.keyCode === 39 && this.currentSuggestion) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (range.collapsed) {
                        const node = range.startContainer;
                        const offset = range.startOffset;
                        
                        if (node.nodeType === 3 && offset === node.length) {
                            e.preventDefault();
                            this.acceptSuggestionBlock();
                            return false;
                        }
                    }
                }
            }
        },
        
        handleKeyUpBlock(e) {
            // Ignore special keys
            if (e.keyCode === 27 || e.keyCode === 39 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 40) {
                return;
            }
            
            clearTimeout(this.typingTimer);
            this.hideSuggestion();
            
            // Set a timer to get suggestion after user stops typing
            this.typingTimer = setTimeout(() => {
                this.requestSuggestionBlock();
            }, this.typingDelay);
        },
        
        requestSuggestion(editor) {
            if (this.isLoading) {
                return;
            }
            
            const content = editor.getContent({format: 'text'});
            if (!content || content.trim().length < 10) {
                return;
            }
            
            // Get the last 500 characters for context
            const textContext = content.substring(Math.max(0, content.length - 500));
            
            this.getSuggestion(textContext, editor);
        },
        
        requestSuggestionBlock() {
            if (this.isLoading) {
                return;
            }
            
            if (typeof wp === 'undefined' || !wp.data || !wp.data.select('core/editor')) {
                return;
            }
            
            const content = wp.data.select('core/editor').getEditedPostContent();
            
            // Get plain text from blocks
            const textContent = this.stripHtmlTags(content);
            
            if (!textContent || textContent.trim().length < 10) {
                return;
            }
            
            // Get the last 500 characters for context
            const textContext = textContent.substring(Math.max(0, textContent.length - 500));
            
            this.getSuggestion(textContext, null);
        },
        
        getSuggestion(text, editor) {
            this.isLoading = true;
            
            // Get AI prompt from meta box
            const promptElement = document.getElementById('ihumbak_ai_prompt');
            const prompt = promptElement ? promptElement.value : '';
            
            console.log('IHumbak Autocomplete: Requesting suggestion...', {
                textLength: text.length,
                promptLength: prompt.length
            });
            
            const formData = new FormData();
            formData.append('action', 'ihumbak_get_completion');
            formData.append('nonce', ihumbakAutocomplete.nonce);
            formData.append('text', text);
            formData.append('prompt', prompt);
            
            fetch(ihumbakAutocomplete.ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(response => {
                this.isLoading = false;
                console.log('IHumbak Autocomplete: Response received', response);
                if (response.success && response.data.suggestion) {
                    console.log('IHumbak Autocomplete: Showing suggestion:', response.data.suggestion);
                    this.showSuggestion(response.data.suggestion, editor);
                } else if (!response.success) {
                    console.error('IHumbak Autocomplete: Error from server:', response.data);
                }
            })
            .catch(error => {
                this.isLoading = false;
                console.error('IHumbak Autocomplete: Fetch error:', error);
            });
        },
        
        showSuggestion(suggestion, editor) {
            this.currentSuggestion = suggestion;
            
            if (editor) {
                // Classic editor
                this.suggestionElement.textContent = suggestion;
                this.suggestionElement.style.display = 'inline';
                
                // Position at cursor
                const selection = editor.selection;
                const node = selection.getNode();
                node.appendChild(this.suggestionElement);
            } else {
                // Block editor - show in a tooltip-like element
                this.showSuggestionBlock(suggestion);
            }
        },
        
        showSuggestionBlock(suggestion) {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) {
                return;
            }
            
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Create or update suggestion overlay
            let overlay = document.getElementById('ihumbak-suggestion-overlay');
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
        
        hideSuggestion() {
            this.currentSuggestion = '';
            this.suggestionElement.style.display = 'none';
            
            const overlay = document.getElementById('ihumbak-suggestion-overlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        },
        
        acceptSuggestion(editor) {
            if (!this.currentSuggestion) {
                return;
            }
            
            // Insert suggestion at cursor position
            editor.execCommand('mceInsertContent', false, ' ' + this.currentSuggestion);
            this.hideSuggestion();
        },
        
        acceptSuggestionBlock() {
            if (!this.currentSuggestion) {
                return;
            }
            
            if (typeof wp === 'undefined' || !wp.data || !wp.data.select('core/block-editor')) {
                return;
            }
            
            const selectedBlock = wp.data.select('core/block-editor').getSelectedBlock();
            if (!selectedBlock) {
                return;
            }
            
            // Get current content
            const currentContent = selectedBlock.attributes.content || '';
            
            // Append suggestion
            const newContent = currentContent + ' ' + this.currentSuggestion;
            
            // Update block
            wp.data.dispatch('core/block-editor').updateBlockAttributes(
                selectedBlock.clientId,
                {content: newContent}
            );
            
            this.hideSuggestion();
        },
        
        stripHtmlTags(html) {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        }
    };
    
    // Initialize the autocomplete
    IHumbakAutocomplete.init();
});

// EditorSource.js - Component for single-file code editor
import { basicSetup } from 'codemirror'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js'

class EditorSource extends BaseComponent {
  constructor(parentId, containerId) {
    // Initialize the base component with component name
    super('EditorSource', parentId, containerId);    
    
    // Tab management properties
    this.tabs = []; // Array to store tab data: {id, name, path, content, state, mode, unsaved}
    this.activeTabIndex = -1; // Index of the currently active tab
    this.tabsContainer = null; // DOM element for the tabs bar
    this.editorContainer = null; // DOM element containing the editor
    
    // Single editor instance that will be reused for all tabs
    this.editorInstance = null; // Mode-specific editor instance
    this.editorView = null; // CodeMirror editor view
    this.modeConfig = null; // Current mode configuration
    
    // Set up message handlers
    this.messageMap[MESSAGES.MODE_CHANGE] = this.handleModeChange;
    this.messageMap[MESSAGES.NEW_FILE] = this.handleNewFile;
    this.messageMap[MESSAGES.OPEN_FILE] = this.handleOpenFile;
    this.messageMap[MESSAGES.SAVE_FILE] = this.handleSaveFile;
    this.messageMap[MESSAGES.RUN_PROGRAM] = this.handleRunProgram;
    this.messageMap[MESSAGES.DEBUG_PROGRAM] = this.handleDebugProgram;
  }
  
  async init(options) {
    super.init(options);
    this.currentMode = options?.mode || 'javascript';
  }

  async destroy() {
    // Clean up the editor instance if it exists
    if (this.editorView) {
      this.editorView.destroy();
    }
    super.destroy();
  }

  async render(containerId) {
    this.container = await super.render(containerId);
    this.container.innerHTML = '';
    
    // Create the main container with a simple flex column layout
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.height = '100%';
    this.container.style.width = '100%';
    
    // Create tabs container - simple row at the top
    this.tabsContainer = document.createElement('div');
    this.tabsContainer.className = 'editor-tabs';
    this.tabsContainer.style.display = 'flex';
    this.tabsContainer.style.flexDirection = 'row';
    this.tabsContainer.style.overflowX = 'auto';
    this.tabsContainer.style.backgroundColor = '#1e1e1e';
    this.tabsContainer.style.borderBottom = '1px solid #333';
    this.tabsContainer.style.minHeight = '30px';
    this.container.appendChild(this.tabsContainer);
    
    // Create a single editor container that fills available space
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'editor-content';
    this.editorContainer.style.flex = '1';
    this.editorContainer.style.display = 'flex';
    this.editorContainer.style.minHeight = '300px';
    this.editorContainer.style.width = '100%';
    this.editorContainer.style.minWidth = '0'; // Prevent flex item from overflowing
    this.editorContainer.style.backgroundColor = '#1e1e1e';
    this.container.appendChild(this.editorContainer);
    
    // Check if the current mode supports multi-file editing
    const isMultiMode = this.modeConfig?.multi === true;
    
    // Show or hide tabs based on the mode
    this.tabsContainer.style.display = isMultiMode ? 'flex' : 'none';
        
    // If we have no tabs, create a default one
    if (this.tabs.length === 0) {
      // Create a default tab with appropriate content for the current mode
      await this.addNewTab({
        name: 'Untitled',
        mode: this.currentMode,
        setActive: true
      });
    } else {
      // Render all tabs and show the active one
      this.renderTabs();
      this.showActiveTab();
    }
    
    return this.container;
  }
  
  async loadModeSpecificConfig(mode) {
    try {     
      // Dynamically import the editor module for the current mode
      let ConfigModule;
      
      switch (mode) {
        case 'phaser':
          ConfigModule = await import('./modes/phaser/editor.js');
          break;
        case 'stos':
          ConfigModule = await import('./modes/stos/editor.js');
          break;
        case 'amos1_3':
          ConfigModule = await import('./modes/amos1_3/editor.js');
          break;
        case 'amosPro':
          ConfigModule = await import('./modes/amosPro/editor.js');
          break;
        case 'c64':
          ConfigModule = await import('./modes/c64/editor.js');
          break;
        case 'javascript':
        default:
          ConfigModule = await import('./modes/javascript/editor.js');
          break;
      }
      
      // Always use the single editor container
      const targetContainer = this.editorContainer;
      
      // Create the mode-specific configuration
      const editorInstance = new ConfigModule.default(targetContainer);
      
      // Get configuration from the mode-specific instance  
      const modeConfig = editorInstance.getConfig ? 
                        editorInstance.getConfig() : 
                        { extensions: [], initialDoc: '', multi: true };
      
      // Ensure multi property exists (default to true if not specified)
      if (modeConfig.multi === undefined) {
        modeConfig.multi = true; // Default to multi-file mode for backward compatibility
      }
      
      // If we've changed from multi to single or vice versa, we may need to update the UI
      if (this.container && this.tabsContainer && this.modeConfig?.multi !== modeConfig.multi) {
        this.tabsContainer.style.display = modeConfig.multi ? 'flex' : 'none';
      }
                        
      return { editorInstance, modeConfig };
    } catch (error) {
      console.error(`Error loading configuration for mode ${mode}:`, error);
      if (this.editorContainer) {
        this.editorContainer.innerHTML = `<div class="error-message">Failed to load editor for ${mode} mode</div>`;
      }
      return { editorInstance: null, modeConfig: { multi: true } }; // Default to multi-file mode on error
    }
  }
  
  /**
   * Creates or updates the editor instance with the specified content and mode
   * @param {string} initialContent - Initial content for the editor
   * @param {string} mode - Editor mode to use
   * @returns {EditorView} The editor view instance
   */
  async createEditor(initialContent = '', mode = null) {
    try {     
      // If we already have an editor view and the mode hasn't changed, just update content
      if (this.editorView && this.currentMode === mode) {
        return this.updateEditorContent(initialContent);
      }
      
      // Clear the container first
      this.editorContainer.innerHTML = '';
      this.editorContainer.style.display = 'flex';
      
      // Load mode-specific configuration
      const configResult = await this.loadModeSpecificConfig(mode || this.currentMode);
      this.editorInstance = configResult.editorInstance;
      this.modeConfig = configResult.modeConfig;
      this.multi = configResult.modeConfig.multi;
      this.currentMode = mode || this.currentMode;
      
      // Prepare container if mode requires it
      this.editorInstance.prepareContainer();
      
      // Ensure all nested containers have proper width
      if (this.editorContainer) {
        // Apply styles to all direct children of the editor container
        Array.from(this.editorContainer.children).forEach(child => {
        child.style.width = '100%';
        child.style.height = '100%';
        child.style.display = 'flex';
        child.style.flexDirection = 'column';
        
        // Also apply to any children of those elements
        Array.from(child.children).forEach(grandchild => {
            grandchild.style.width = '100%';
            grandchild.style.height = '100%';
            grandchild.style.flex = '1';
        });
        });
      } 

      // Get the parent element for the editor
      const parent = this.editorInstance.getEditorParent ? 
                     this.editorInstance.getEditorParent() : 
                     this.editorContainer;
      
      // Make sure the parent has proper styling
      parent.style.flex = '1';
      parent.style.width = '100%';
      parent.style.height = '100%';
      
      // Create base extensions that all editors need
      const baseExtensions = [
        basicSetup,
        keymap.of(defaultKeymap),
        EditorView.lineWrapping
      ];
      
      // Combine base extensions with mode-specific extensions
      const allExtensions = [...baseExtensions, ...(this.modeConfig.extensions || [])];
      
      // Make sure we have content to display
      let docContent = initialContent || this.modeConfig.initialDoc || '';
      
      // Ensure we have some default content if empty
      if (!docContent || docContent.trim() === '') {
        docContent = `//
// STAM Editor
//
// Start coding here...
//`;
      }
      
      // If we already have an editor view, destroy it first
      if (this.editorView) {
        this.editorView.destroy();
        this.editorView = null;
      }
      
      // Create editor state with a cursor at the beginning
      const startState = EditorState.create({
        doc: docContent,
        extensions: allExtensions,
        selection: {anchor: 0, head: 0} // Set initial cursor position
      });
      
      // Create editor view
      this.editorView = new EditorView({
        state: startState,
        parent: parent
      });
      
      // Let the mode-specific instance know about the editor view
      this.editorInstance.setEditorView(this.editorView);
      
      // Focus the editor immediately
      this.editorView.focus();
      
      return this.editorView;
    } catch (error) {
      console.error('Error creating CodeMirror editor:', error);
      this.editorContainer.innerHTML = `<div class="error-message">Failed to create editor: ${error.message}</div>`;
      return null;
    }
  }
  
  /**
   * Saves the current state of the editor to the specified tab
   * @param {number} tabIndex - Index of the tab to save state for
   */
  saveTabState(tabIndex) {
    if (tabIndex < 0 || tabIndex >= this.tabs.length || !this.editorView) {
      return;
    }
    
    const tab = this.tabs[tabIndex];
    
    // Save the current content
    tab.content = this.editorView.state.doc.toString();
    
    // Save essential state information instead of the state object itself
    // This prevents issues with state object references
    tab.stateData = {
      selection: this.editorView.state.selection,
      scrollTop: this.editorView.scrollDOM.scrollTop,
      scrollLeft: this.editorView.scrollDOM.scrollLeft
    };
    
  }
  
  /**
   * Updates the content of the existing editor without recreating it
   * @param {string} content - The new content to display
   * @returns {EditorView} The updated editor view
   */
  updateEditorContent(content) {
    if (!this.editorView) {
      return null;
    }

    try {
      // Create a transaction to replace the entire document
      const transaction = this.editorView.state.update({
        changes: {
          from: 0,
          to: this.editorView.state.doc.length,
          insert: content || ''
        }
      });

      // Apply the transaction to update the editor
      this.editorView.dispatch(transaction);
      
      // Focus the editor
      this.editorView.focus();
      
      return this.editorView;
    } catch (error) {
      console.error('Error updating editor content:', error);
      return null;
    }
  }
  
  // Tab management methods
  
  /**
   * Creates a new tab with an empty editor
   * @param {Object} options - Options for the new tab
   * @param {string} options.name - Display name for the tab
   * @param {string} options.path - File path (if any)
   * @param {string} options.content - Initial content
   * @param {string} options.mode - Editor mode to use
   * @returns {Object} The newly created tab object
   */
  async addNewTab(options = {}) {
    // Generate a unique ID for this tab
    const id = `tab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const name = options.name || 'Untitled';
    const path = options.path || null;
    const mode = options.mode || this.currentMode;
    const content = options.content || '';
    
    
    // Create the tab object with initial state
    const tabObj = {
      id,
      name,
      path,
      mode,
      content,
      unsaved: false,
      // Store editor state when switching away from this tab
      state: null
    };
    
    // Add to tabs array
    this.tabs.push(tabObj);
    
    // Set as active tab if it's the first one or if requested
    if (this.activeTabIndex === -1 || options.setActive) {
      // If we're switching tabs, save the current tab's state first
      if (this.activeTabIndex !== -1 && this.editorView) {
        this.saveTabState(this.activeTabIndex);
      }
      
      this.activeTabIndex = this.tabs.length - 1;
      
      // If this is the first tab, create the editor
      if (this.tabs.length === 1) {
        await this.createEditor(content, mode);
      } else if (options.setActive) {
        // If we're setting this as active and we already have an editor,
        // update the editor content
        this.updateEditorContent(content);
      }
    }
    
    // Update the tabs UI
    this.renderTabs();
    
    // Show this tab if it's the active one
    if (this.activeTabIndex === this.tabs.length - 1) {
      this.showActiveTab();
      
      // Focus the editor after a short delay to ensure it's rendered
      setTimeout(() => {
        if (this.editorView) {
          try {
            // Focus the editor
            this.editorView.focus();
            
            // Place cursor at the beginning
            const transaction = this.editorView.state.update({
              selection: {anchor: 0, head: 0}
            });
            this.editorView.dispatch(transaction);
          } catch (error) {
            console.error('Error focusing editor:', error);
          }
        }
      }, 100);
    }
    
    return tabObj;
  }
  
  /**
   * Removes a tab
   * @param {number} index - Index of the tab to remove
   */
  async removeTab(index) {
    if (index < 0 || index >= this.tabs.length) return;
    
    // Remove from the tabs array
    this.tabs.splice(index, 1);
    
    // Update active tab index if needed
    if (this.tabs.length === 0) {
      // If we removed the last tab, clear the editor
      this.activeTabIndex = -1;
      if (this.editorView) {
        // Clear the editor content
        this.updateEditorContent('');
      }
    } else if (index === this.activeTabIndex) {
      // If we removed the active tab, activate the next one or the last one
      this.activeTabIndex = Math.min(index, this.tabs.length - 1);
      // Show the new active tab
      await this.showActiveTab();
    } else if (index < this.activeTabIndex) {
      // If we removed a tab before the active one, adjust the index
      this.activeTabIndex--;
    }
    
    // Update the tabs UI
    this.renderTabs();
  }
  
  /**
   * Switches to a specific tab
   * @param {number} index - Index of the tab to switch to
   */
  async switchToTab(index) {
    if (index < 0 || index >= this.tabs.length || index === this.activeTabIndex) return;
    
    // Save the state of the current tab before switching
    if (this.activeTabIndex >= 0 && this.editorView) {
      this.saveTabState(this.activeTabIndex);
    }
    
    // Update the active tab index
    this.activeTabIndex = index;
    
    // Update the tabs UI
    this.renderTabs();
    
    // Show the newly active tab
    await this.showActiveTab();
  }
  
  /**
   * Shows the currently active tab by updating the editor content and state
   */
  async showActiveTab() {   
    // Check if we have a valid active tab
    if (this.activeTabIndex < 0 || this.activeTabIndex >= this.tabs.length) {
      return;
    }
    
    const activeTab = this.tabs[this.activeTabIndex];
    
    // If we don't have an editor instance yet, or if the mode has changed, create one
    if (!this.editorView || this.currentMode !== activeTab.mode) {
      await this.createEditor(activeTab.content, activeTab.mode);
    } else {
      // Otherwise, just update the content of the existing editor
      if (activeTab.stateData) {
        // If we have saved state data for this tab, restore it
        
        // First update the content
        this.updateEditorContent(activeTab.content);
        
        // Then restore selection if available
        if (activeTab.stateData.selection) {
          const transaction = this.editorView.state.update({
            selection: activeTab.stateData.selection
          });
          this.editorView.dispatch(transaction);
        }
        
        // Restore scroll position after a short delay to ensure content is rendered
        setTimeout(() => {
          if (activeTab.stateData.scrollTop !== undefined) {
            this.editorView.scrollDOM.scrollTop = activeTab.stateData.scrollTop;
          }
          if (activeTab.stateData.scrollLeft !== undefined) {
            this.editorView.scrollDOM.scrollLeft = activeTab.stateData.scrollLeft;
          }
        }, 10);
      } else {
        // Otherwise just update the content
        this.updateEditorContent(activeTab.content);
      }
    }
    
    // Update the current mode
    this.currentMode = activeTab.mode;
    
    // Focus the editor after a short delay to ensure it's rendered
    setTimeout(() => {
      if (this.editorView) {
        try {
          // Focus the editor
          this.editorView.focus();
        } catch (error) {
          console.error('Error focusing editor:', error);
        }
      }
    }, 50);
  }
  
  /**
   * Renders the tab bar with all open tabs
   */
  renderTabs() {
    if (!this.tabsContainer) return;
    
    // Clear existing tabs
    this.tabsContainer.innerHTML = '';
    
    // Create tabs for each open tab
    this.tabs.forEach((tab, index) => {
      const tabElement = document.createElement('div');
      tabElement.className = 'editor-tab';
      tabElement.dataset.index = index;
      tabElement.style.padding = '8px 12px';
      tabElement.style.cursor = 'pointer';
      tabElement.style.borderRight = '1px solid #333';
      tabElement.style.display = 'flex';
      tabElement.style.alignItems = 'center';
      tabElement.style.gap = '8px';
      
      // Highlight active tab
      if (index === this.activeTabIndex) {
        tabElement.style.backgroundColor = '#2d2d2d';
        tabElement.style.borderBottom = '2px solid #0078d4';
      }
      
      // Tab name
      const name = document.createElement('span');
      name.textContent = tab.name + (tab.unsaved ? ' *' : '');
      tabElement.appendChild(name);
      
      // Close button
      const closeBtn = document.createElement('span');
      closeBtn.textContent = '×';
      closeBtn.style.fontSize = '14px';
      closeBtn.style.width = '16px';
      closeBtn.style.height = '16px';
      closeBtn.style.lineHeight = '16px';
      closeBtn.style.textAlign = 'center';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      closeBtn.style.display = 'inline-block';
      tabElement.appendChild(closeBtn);
      
      // Event listeners
      tabElement.addEventListener('click', (e) => {
        // If the click was on the close button, remove the tab
        if (e.target === closeBtn) {
          this.removeTab(index);
        } else {
          // Otherwise switch to this tab
          this.switchToTab(index);
        }
      });
      
      this.tabsContainer.appendChild(tabElement);
    });
    
    // Add a "new tab" button
    const newTabBtn = document.createElement('div');
    newTabBtn.className = 'editor-new-tab';
    newTabBtn.textContent = '+';
    newTabBtn.style.padding = '8px 12px';
    newTabBtn.style.cursor = 'pointer';
    newTabBtn.style.borderRight = '1px solid #333';
    newTabBtn.addEventListener('click', () => this.addNewTab({ setActive: true }));
    this.tabsContainer.appendChild(newTabBtn);
  }
  
  /**
   * Gets the currently active file object
   * @returns {Object|null} The active file object or null if none
   */
  getActiveFile() {
    if (this.activeTabIndex >= 0 && this.activeTabIndex < this.tabs.length) {
      return this.tabs[this.activeTabIndex];
    }
    return null;
  }
  
  // Core editor methods that all modes can use
  
  getContent() {
    const activeFile = this.getActiveFile();
    if (activeFile) {
      if (activeFile.editorInstance && activeFile.editorInstance.getContent) {
        return activeFile.editorInstance.getContent();
      }
      
      if (activeFile.editorView) {
        return activeFile.editorView.state.doc.toString();
      }
    }
    return '';
  }
  
  setContent(content) {
    const activeFile = this.getActiveFile();
    if (activeFile) {
      if (activeFile.editorInstance && activeFile.editorInstance.setContent) {
        activeFile.editorInstance.setContent(content);
        return;
      }
      
      if (activeFile.editorView) {
        const transaction = activeFile.editorView.state.update({
          changes: {
            from: 0,
            to: activeFile.editorView.state.doc.length,
            insert: content
          }
        });
        activeFile.editorView.dispatch(transaction);
        return;
      }
    }
  }
  
  // Message handlers
  
  /**
   * Handle mode change by preserving tab state per mode and switching between them
   * @param {Object} data - Mode change data
   * @param {string} data.mode - The new mode to switch to
   * @param {Object} sender - The sender of the message
   * @returns {boolean} True if the mode was changed, false otherwise
   */
  async handleModeChange(data, sender) {
    if (!data.mode) return false;
    
    const newMode = data.mode;
    if (this.currentMode === newMode) return true; // Already in this mode
    
    // Store the current mode's state before switching
    if (!this.modeStates) {
      this.modeStates = {};
    }
    
    // Save current mode state including all tabs and their content
    this.modeStates[this.currentMode] = {
      tabs: this.tabs.map(tab => {
        // For the active tab, get the latest content from the editor
        let content = tab.content;
        if (this.activeTabIndex !== -1 && this.tabs[this.activeTabIndex] === tab && this.editorView) {
          content = this.editorView.state.doc.toString();
          // Update the tab's content to ensure it's saved correctly
          tab.content = content;
        }
        
        // Create a deep copy of the tab object
        return { ...tab };
      }),
      activeTabIndex: this.activeTabIndex
    };
    
    // Destroy current interface
    if (this.editorView) {
      this.editorView.destroy();
      this.editorView = null;
    }
    
    // Clear the editor container
    if (this.editorContainer) {
      this.editorContainer.innerHTML = '';
    }
    
    // Update the current mode
    this.currentMode = newMode;
    
    // Load the mode-specific editor configuration
    const { editorInstance, modeConfig } = await this.loadModeSpecificConfig(newMode);
    this.editorInstance = editorInstance;
    this.modeConfig = modeConfig;
    
    // Show or hide tabs based on the mode's multi property
    if (this.tabsContainer) {
      this.tabsContainer.style.display = modeConfig?.multi ? 'flex' : 'none';
    }
    
    // Check if we have previously saved state for this mode
    if (this.modeStates[newMode]) {
      // Restore the saved state
      const savedState = this.modeStates[newMode];
      this.tabs = savedState.tabs.map(tab => ({ ...tab })); // Deep copy
      this.activeTabIndex = savedState.activeTabIndex;
      
      // Render the tabs
      this.renderTabs();
      
      // Show the active tab
      this.showActiveTab();
    } else {
      // Create a new display with one tab for this mode
      this.tabs = [];
      this.activeTabIndex = -1;
      
      await this.addNewTab({
        name: 'Untitled',
        mode: newMode,
        setActive: true
      });
    }
    
    return true;
  }
  
  async handleNewFile(data, sender) {
    // Check if the current mode supports multi-file editing
    const isMultiMode = this.modeConfig?.multi !== false;
    
    if (isMultiMode) {
      // Create a new file tab in multi-file mode
      await this.addNewTab({
        name: 'Untitled',
        mode: this.currentMode,
        setActive: true
      });
    } else {
      // In single-file mode, replace the content of the current tab
      const activeFile = this.getActiveFile();
      if (activeFile) {
        // Get new content from the mode-specific editor if available
        let newContent = '';
        if (this.editorInstance && typeof this.editorInstance.newFile === 'function') {
          newContent = this.editorInstance.newFile() || '';
        }
        
        // Update the editor content
        this.updateEditorContent(newContent);
        
        // Update the tab name
        activeFile.name = 'Untitled';
        activeFile.path = null;
        activeFile.unsaved = false;
        
        // Render the tabs (even though they might be hidden)
        this.renderTabs();
      }
    }
    return true;
  }
  
  async handleOpenFile(data, sender) {
    if (data && data.content) {
      // Check if the current mode supports multi-file editing
      const isMultiMode = this.modeConfig?.multi !== false;
      
      if (isMultiMode) {
        // Create a new tab with the file content in multi-file mode
        await this.addNewTab({
          name: data.name || 'Untitled',
          path: data.path || null,
          content: data.content,
          mode: data.mode || this.currentMode,
          setActive: true
        });
      } else {
        // In single-file mode, replace the content of the current tab
        const activeFile = this.getActiveFile();
        if (activeFile) {
          // Update the editor content
          this.updateEditorContent(data.content);
          
          // Update the tab info
          activeFile.name = data.name || 'Untitled';
          activeFile.path = data.path || null;
          activeFile.mode = data.mode || this.currentMode;
          activeFile.unsaved = false;
          
          // Render the tabs (even though they might be hidden)
          this.renderTabs();
        }
      }
      return true;
    }
    return false;
  }
  
  async handleSaveFile(data, sender) {
    // Get the current content from the editor
    const content = this.getContent();
    
    // Get the active file info
    const activeFile = this.getActiveFile();
    if (activeFile) {
      // Mark the file as saved
      activeFile.unsaved = false;
      this.renderTabs();
      
      // Send a message to the parent component with the content to save
      this.sendMessage(MESSAGES.SAVE_FILE_CONTENT, { 
        content,
        name: activeFile.name,
        path: activeFile.path,
        mode: activeFile.mode
      });
      return true;
    }
    
    // Fallback if no active file
    this.sendMessage(MESSAGES.SAVE_FILE_CONTENT, { content });
    return true;
  }
  
  async handleRunProgram(data, sender) {
    // Get the current content from the editor
    const content = this.getContent();
    
    // Get the active file info
    const activeFile = this.getActiveFile();
    if (activeFile) {
      // Send a message to the parent component with the content to run
      this.sendMessage(MESSAGES.RUN_PROGRAM_CONTENT, { 
        content,
        name: activeFile.name,
        path: activeFile.path,
        mode: activeFile.mode
      });
      return true;
    }
    
    // Fallback if no active file
    this.sendMessage(MESSAGES.RUN_PROGRAM_CONTENT, { content });
    return true;
  }
  
  async handleDebugProgram(data, sender) {
    // Get the current content from the editor
    const content = this.getContent();
    
    // Get the active file info
    const activeFile = this.getActiveFile();
    if (activeFile) {
      // Send a message to the parent component with the content to debug
      this.sendMessage(MESSAGES.DEBUG_PROGRAM_CONTENT, { 
        content,
        name: activeFile.name,
        path: activeFile.path,
        mode: activeFile.mode
      });
      return true;
    }
    
    // Fallback if no active file
    this.sendMessage(MESSAGES.DEBUG_PROGRAM_CONTENT, { content });
    return true;
  }

  /**
   * Apply layout information to restore the Editor state
   * @param {Object} layoutInfo - Layout information for this Editor
   */
  async applyLayout(layoutInfo) {
    await super.applyLayout(layoutInfo);

    // Clear any existing tabs
    this.tabs = [];
    this.activeTabIndex = -1;
    
    // Restore tabs from layout info
    if (layoutInfo.tabs && Array.isArray(layoutInfo.tabs) && layoutInfo.tabs.length > 0) {
      // Create tabs for each saved tab
      for (let i = 0; i < layoutInfo.tabs.length; i++) {
        const tabInfo = layoutInfo.tabs[i];
        await this.addNewTab({
          name: tabInfo.name || 'Untitled',
          path: tabInfo.path || null,
          content: tabInfo.content || '',
          mode: tabInfo.mode || this.currentMode,
          setActive: false // Don't set active yet
        });
      }
      
      // Set the active tab
      const activeIndex = typeof layoutInfo.activeTabIndex === 'number' ? 
        Math.min(layoutInfo.activeTabIndex, this.tabs.length - 1) : 0;
      
      if (activeIndex >= 0 && activeIndex < this.tabs.length) {
        this.switchToTab(activeIndex);
      }
    } else if (layoutInfo.content) {
      // Fallback to single content
      await this.addNewTab({
        content: layoutInfo.content,
        mode: layoutInfo.currentMode || this.currentMode,
        setActive: true
      });
    }
    
    // Render the tabs
    this.renderTabs();
  }
  
  /**
   * Override getLayoutInfo to include Editor-specific information
   * @returns {Object} Layout information for this Editor
   */
  async getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = await super.getLayoutInfo();
    
    // Add Editor-specific information
    layoutInfo.currentMode = this.currentMode;
    
    // Save information about all tabs
    layoutInfo.tabs = this.tabs.map(tab => {
      // Get the current content for the active tab from the editor
      let content = tab.content;
      if (this.activeTabIndex !== -1 && this.tabs[this.activeTabIndex] === tab && this.editorView) {
        content = this.editorView.state.doc.toString();
      }
      
      return {
        name: tab.name,
        path: tab.path,
        mode: tab.mode,
        content: content.length < 10000 ? content : '', // Only save if not too large
        unsaved: tab.unsaved || false
      };
    });
    
    // Save current tab index
    layoutInfo.activeTabIndex = this.activeTabIndex;
    
    // Get dimensions if available
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      layoutInfo.dimensions = {
        width: rect.width,
        height: rect.height
      };
    }
    
    return layoutInfo;
  }
  
  /**
   * Marks the active file as having unsaved changes
   */
  markContentChanged() {
    const activeFile = this.getActiveFile();
    if (activeFile) {
      activeFile.unsaved = true;
      this.renderTabs();
    }
  }
}

export default EditorSource;

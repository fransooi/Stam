// Editor.js - Component for the code editor area
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js'

class Editor extends BaseComponent {
  constructor(parentId, containerId) {
    // Initialize the base component with component name
    super('Editor', parentId, containerId);    
    this.editorInstance = null;
    this.editorView = null;
    this.modeConfig = null;
  }

  async render() {
    // Clear the container
    this.container=document.getElementById(this.containerId);
    this.container.innerHTML = '';
    
    // Load mode-specific configuration
    await this.loadModeSpecificConfig();
    
    // Create the CodeMirror editor with mode-specific configuration
    this.createEditor();
    
  }
  
  async loadModeSpecificConfig() {
    try {
      console.log(`Loading configuration for ${this.currentMode} mode`);
      
      // Dynamically import the editor module for the current mode
      let ConfigModule;
      
      switch (this.currentMode) {
        case 'modern':
          ConfigModule = await import('./modern/editor.js');
          break;
        case 'stos':
          ConfigModule = await import('./stos/editor.js');
          break;
        case 'amos1_3':
          ConfigModule = await import('./amos1_3/editor.js');
          break;
        case 'amosPro':
          ConfigModule = await import('./amosPro/editor.js');
          break;
        case 'c64':
          ConfigModule = await import('./c64/editor.js');
          break;
        default:
          ConfigModule = await import('./modern/editor.js');
      }
      
      // Create the mode-specific configuration
      this.editorInstance = new ConfigModule.default(this.container);
      
      // Get configuration from the mode-specific instance
      this.modeConfig = this.editorInstance.getConfig ? 
                        this.editorInstance.getConfig() : 
                        { extensions: [], initialDoc: '' };
      
      console.log(`Configuration for ${this.currentMode} mode loaded successfully`);
      
    } catch (error) {
      console.error(`Error loading configuration for mode ${this.currentMode}:`, error);
      this.container.innerHTML = `<div class="error-message">Failed to load editor for ${this.currentMode} mode</div>`;
    }
  }
  
  createEditor() {
    try {
      console.log('Creating CodeMirror editor with mode-specific configuration');
      
      // Prepare container if mode requires it
      if (this.editorInstance.prepareContainer) {
        this.editorInstance.prepareContainer();
      }
      
      // Get the parent element for the editor
      const parent = this.editorInstance.getEditorParent ? 
                     this.editorInstance.getEditorParent() : 
                     this.container;
      
      // Create base extensions that all editors need
      const baseExtensions = [
        basicSetup,
        keymap.of(defaultKeymap),
        EditorView.lineWrapping
      ];
      
      // Combine base extensions with mode-specific extensions
      const allExtensions = [...baseExtensions, ...(this.modeConfig.extensions || [])];
      
      // Create editor state
      const startState = EditorState.create({
        doc: this.modeConfig.initialDoc || '',
        extensions: allExtensions
      });
      
      // Create editor view
      this.editorView = new EditorView({
        state: startState,
        parent: parent
      });
      
      // Let the mode-specific instance know about the editor view
      if (this.editorInstance.setEditorView) {
        this.editorInstance.setEditorView(this.editorView);
      }      
      console.log('CodeMirror editor created successfully');
      
    } catch (error) {
      console.error('Error creating CodeMirror editor:', error);
      this.container.innerHTML = `<div class="error-message">Failed to create editor: ${error.message}</div>`;
    }
  }
  
  
  // Core editor methods that all modes can use
  
  getContent() {
    if (this.editorInstance && this.editorInstance.getContent) {
      return this.editorInstance.getContent();
    }
    
    // For CodeMirror-based editors
    if (this.editorView) {
      return this.editorView.state.doc.toString();
    }
    
    return '';
  }
  
  setContent(content) {
    if (this.editorInstance && this.editorInstance.setContent) {
      this.editorInstance.setContent(content);
      return;
    }
    
    // For CodeMirror-based editors
    if (this.editorView) {
      const transaction = this.editorView.state.update({
        changes: {
          from: 0,
          to: this.editorView.state.doc.length,
          insert: content
        }
      });
      this.editorView.dispatch(transaction);
    }
  }
  
  // Common editor operations
  
  newFile() {
    console.log('Creating new file');
    // Mode-specific new file operation
    if (this.editorInstance && this.editorInstance.newFile) {
      this.editorInstance.newFile();
      return;
    }
    
    // Default implementation
    this.setContent('');
  }
  
  openFile() {
    console.log('Opening file');
    // Mode-specific open file operation
    if (this.editorInstance && this.editorInstance.openFile) {
      this.editorInstance.openFile();
      return;
    }
    
    // Default implementation
    alert('Open file not implemented for this mode');
  }
  
  saveFile() {
    console.log('Saving file');
    // Mode-specific save file operation
    if (this.editorInstance && this.editorInstance.saveFile) {
      this.editorInstance.saveFile();
      return;
    }
    
    // Default implementation
    alert('Save file not implemented for this mode');
  }
  
  runProgram() {
    console.log('Running program');
    // Mode-specific run operation
    if (this.editorInstance && this.editorInstance.runProgram) {
      this.editorInstance.runProgram();
      return;
    }
    
    // Default implementation
    alert('Run program not implemented for this mode');
  }
  
  debugProgram() {
    console.log('Debugging program');
    // Mode-specific debug operation
    if (this.editorInstance && this.editorInstance.debugProgram) {
      this.editorInstance.debugProgram();
      return;
    }
    
    // Default implementation
    alert('Debug program not implemented for this mode');
  }
  
  showHelp() {
    console.log('Showing help');
    // Mode-specific help operation
    if (this.editorInstance && this.editorInstance.showHelp) {
      this.editorInstance.showHelp();
      return;
    }
    
    // Default implementation
    alert('Help not implemented for this mode');
  }
   
  /**
   * Handle message
   * @param {string} messageType - Type of message
   * @param {Object} messageData - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`Editor received message: ${messageType}`, messageData);
    
    switch (messageType) {
      case MESSAGES.MODE_CHANGE:
        if (messageData.data && messageData.data.mode) {
          this.setMode(messageData.data.mode);
          return true;
        }
        break;
        
      case MESSAGES.NEW_FILE:
        this.newFile();
        return true;
        
      case MESSAGES.OPEN_FILE:
        this.openFile();
        return true;
        
      case MESSAGES.SAVE_FILE:
        this.saveFile();
        return true;
        
      case MESSAGES.RUN_PROGRAM:
        this.runProgram();
        return true;
        
      case MESSAGES.DEBUG_PROGRAM:
        this.debugProgram();
        return true;
        
      case MESSAGES.LOAD_LAYOUT:
        // Check if this layout is for us
        if (messageData.data && 
            messageData.data.componentName === 'Editor') {
          this.applyLayout(messageData.data.layoutInfo);
          return true;
        }
        break;
    }    
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Apply layout information to restore the Editor state
   * @param {Object} layoutInfo - Layout information for this Editor
   */
  applyLayout(layoutInfo) {
    console.log('Editor applying layout:', layoutInfo);
    
    // Set mode if specified
    if (layoutInfo.currentMode) {
      this.setMode(layoutInfo.currentMode);
    }
    
    // Set content if specified
    if (layoutInfo.content) {
      this.setContent(layoutInfo.content);
    }
    
    // Apply dimensions if specified
    if (layoutInfo.dimensions && this.container) {
      // Only apply height, not width to allow horizontal resizing
      if (layoutInfo.dimensions.height) {
        this.container.style.height = `${layoutInfo.dimensions.height}px`;
      }
    }
  }
  
  /**
   * Override getLayoutInfo to include Editor-specific information
   * @returns {Object} Layout information for this Editor
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add Editor-specific information
    layoutInfo.currentMode = this.currentMode;
    
    // Add editor content if it's not too large
    const content = this.getContent();
    if (content && content.length < 10000) { // Only save if content is not too large
      layoutInfo.content = content;
    }
    
    // Get dimensions if available
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      layoutInfo.dimensions = {
        width: rect.width,
        height: rect.height
      };
    }
    
    // Add mode-specific layout information if available
    if (this.editorInstance && typeof this.editorInstance.getLayoutInfo === 'function') {
      layoutInfo.modeSpecific = this.editorInstance.getLayoutInfo();
    }
    
    return layoutInfo;
  }
  
  setMode(mode) {
    console.log(`Changing editor mode from ${this.currentMode} to ${mode}`);
    this.currentMode = mode;
    this.loadModeSpecificConfig();
    this.render();  
  }
}

export default Editor;

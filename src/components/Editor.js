// Editor.js - Component for the code editor area
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import BaseComponent from '../utils/BaseComponent.js'

class Editor extends BaseComponent {
  constructor(containerId, currentMode = 'modern') {
    // Initialize the base component with component name
    super('Editor');
    
    this.container = document.getElementById(containerId);
    this.currentMode = currentMode;
    this.editorInstance = null;
    this.editorView = null;
    this.modeConfig = null;
  }

  async render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Load mode-specific configuration
    await this.loadModeSpecificConfig();
    
    // If this is the C64 mode, delegate to the C64 editor
    if (this.currentMode === 'c64') {
      await this.loadC64Editor();
      return;
    }
    
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
  
  async loadC64Editor() {
    try {
      console.log('Loading C64 editor');
      
      // For C64, we delegate completely to the C64Editor
      if (this.editorInstance && typeof this.editorInstance.render === 'function') {
        this.editorInstance.render();
        
        // Connect to icon bar
        this.connectToIconBar();
      } else {
        console.error('C64 editor instance not properly initialized');
        this.container.innerHTML = `<div class="error-message">Failed to load C64 editor: Editor instance not properly initialized</div>`;
      }
      
    } catch (error) {
      console.error('Error loading C64 editor:', error);
      this.container.innerHTML = `<div class="error-message">Failed to load C64 editor: ${error.message || 'Unknown error'}</div>`;
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
    // For C64, delegate to the C64 editor
    if (this.currentMode === 'c64' && this.editorInstance) {
      return this.editorInstance.getContent();
    }
    
    // For CodeMirror-based editors
    if (this.editorView) {
      return this.editorView.state.doc.toString();
    }
    
    return '';
  }
  
  setContent(content) {
    // For C64, delegate to the C64 editor
    if (this.currentMode === 'c64' && this.editorInstance) {
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
    
    // Default implementation - could add file picker in the future
    alert('Open file functionality not implemented for this mode');
  }
  
  saveFile() {
    console.log('Saving file');
    // Mode-specific save file operation
    if (this.editorInstance && this.editorInstance.saveFile) {
      this.editorInstance.saveFile();
      return;
    }
    
    // Default implementation - could add file save in the future
    alert('Save file functionality not implemented for this mode');
  }
  
  runProgram() {
    console.log('Running program');
    // Mode-specific run operation
    if (this.editorInstance && this.editorInstance.runProgram) {
      this.editorInstance.runProgram();
      return;
    }
    
    // Default implementation
    alert('Run functionality not implemented for this mode');
  }
  
  debugProgram() {
    console.log('Debugging program');
    // Mode-specific debug operation
    if (this.editorInstance && this.editorInstance.debugProgram) {
      this.editorInstance.debugProgram();
      return;
    }
    
    // Default implementation
    alert('Debug functionality not implemented for this mode');
  }
  
  shareCode() {
    console.log('Sharing code');
    // Mode-specific share operation
    if (this.editorInstance && this.editorInstance.shareCode) {
      this.editorInstance.shareCode();
      return;
    }
    
    // Default implementation
    alert('Share functionality not implemented for this mode');
  }
  
  showHelp() {
    console.log('Showing help');
    // Mode-specific help operation
    if (this.editorInstance && this.editorInstance.showHelp) {
      this.editorInstance.showHelp();
      return;
    }
    
    // Default implementation
    alert('Help functionality not implemented for this mode');
  }
  
  setMode(mode) {
    console.log(`Changing editor mode from ${this.currentMode} to ${mode}`);
    this.currentMode = mode;
    this.loadModeSpecificConfig();
    this.render();  
  }
  
  // Override the handleMessage method from BaseComponent
  handleMessage(messageType, messageData, sender) {
    console.log(`Editor received message: ${messageType}`, messageData);
    
    switch (messageType) {
      case 'MODE_CHANGE':
        if (messageData.data && messageData.data.mode) {
          this.setMode(messageData.data.mode);
          return true;
        }
        break;
        
      case 'NEW_FILE':
        this.newFile();
        return true;
        
      case 'OPEN_FILE':
        this.openFile();
        return true;
        
      case 'SAVE_FILE':
        this.saveFile();
        return true;
        
      case 'RUN_PROGRAM':
        this.runProgram();
        return true;
        
      case 'DEBUG_PROGRAM':
        this.debugProgram();
        return true;
    }
    
    return super.handleMessage(messageType, messageData, sender);
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
}

export default Editor;

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
    this.messageMap[MESSAGES.MODE_CHANGE] = this.handleModeChange;
    this.messageMap[MESSAGES.NEW_FILE] = this.handleNewFile;
    this.messageMap[MESSAGES.OPEN_FILE] = this.handleOpenFile;
    this.messageMap[MESSAGES.SAVE_FILE] = this.handleSaveFile;
    this.messageMap[MESSAGES.RUN_PROGRAM] = this.handleRunProgram;
    this.messageMap[MESSAGES.DEBUG_PROGRAM] = this.handleDebugProgram;
  }
  
  async init(options) {
    super.init(options);
  }

  async destroy() {
    super.destroy();
  }

  async render(containerId) {
    this.container=await super.render(containerId);
    this.container.innerHTML = '';

    // Load mode-specific configuration
    await this.loadModeSpecificConfig(this.currentMode);
    
    // Create the CodeMirror editor with mode-specific configuration
    this.createEditor();
    
    return this.container;
  }
  
  async loadModeSpecificConfig(mode) {
    try {     
      // Dynamically import the editor module for the current mode
      let ConfigModule;
      
      switch (mode) {
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
      return this.modeConfig;
    } catch (error) {
      console.error(`Error loading configuration for mode ${mode}:`, error);
      this.container.innerHTML = `<div class="error-message">Failed to load editor for ${mode} mode</div>`;
    }
  }
  
  createEditor() {
    try {
      // Prepare container if mode requires it
      this.editorInstance.prepareContainer();
      
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
      this.editorInstance.setEditorView(this.editorView);
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
  
  async handleModeChange(data, sender) {
    if (data.mode) {
      this.setMode(data.mode);
      return true;
    }
    return false;
  }
  async handleNewFile(data, sender) {
    if (this.editorInstance && this.editorInstance.newFile) {
      this.editorInstance.newFile();
      return;
    }
    return true;
  }
  async handleOpenFile(data, sender) {
    if (this.editorInstance && this.editorInstance.openFile) {
      this.editorInstance.openFile();
      return;
    }
    return true;
  }
  async handleSaveFile(data, sender) {
    if (this.editorInstance && this.editorInstance.saveFile) {
      this.editorInstance.saveFile();
      return;
    }
    return true;
  }
  async handleRunProgram(data, sender) {
    if (this.editorInstance && this.editorInstance.runProgram) {
      this.editorInstance.runProgram();
      return;
    }
    return true;
  }
  async handleDebugProgram(data, sender) {
    if (this.editorInstance && this.editorInstance.debugProgram) {
      this.editorInstance.debugProgram();
      return;
    }
    return true;
  }

  /**
   * Apply layout information to restore the Editor state
   * @param {Object} layoutInfo - Layout information for this Editor
   */
  async applyLayout(layoutInfo) {
    await super.applyLayout(layoutInfo);

    // Set content if specified
    if (layoutInfo.content) {
      this.setContent(layoutInfo.content);
    }
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
    this.currentMode = mode;
    this.loadModeSpecificConfig();
    this.render();  
  }
}

export default Editor;

// Editor.js - Container component that manages the source code editor
import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js'
import EditorSource from './EditorSource.js'

class Editor extends BaseComponent {
  constructor(parentId, containerId) {
    // Initialize the base component with component name
    super('Editor', parentId, containerId);
    
    // Editor instance
    this.editor = null;
    
    // Forward all relevant messages to the editor
    this.messageMap[MESSAGES.MODE_CHANGE] = this.handleModeChange;
    this.messageMap[MESSAGES.NEW_FILE] = this.handleNewFile;
    this.messageMap[MESSAGES.OPEN_FILE] = this.handleOpenFile;
    this.messageMap[MESSAGES.SAVE_FILE] = this.handleSaveFile;
    this.messageMap[MESSAGES.RUN_PROGRAM] = this.handleRunProgram;
    this.messageMap[MESSAGES.DEBUG_PROGRAM] = this.handleDebugProgram;
    
    // Also listen for responses from the editor
    this.messageMap[MESSAGES.SAVE_FILE_CONTENT] = this.handleSaveFileContent;
    this.messageMap[MESSAGES.RUN_PROGRAM_CONTENT] = this.handleRunProgramContent;
    this.messageMap[MESSAGES.DEBUG_PROGRAM_CONTENT] = this.handleDebugProgramContent;
  }
  
  async init(options) {
    super.init(options);
    this.currentMode = options?.mode || 'javascript';
    
    // Create the editor instance but don't render it yet
    this.editor = new EditorSource(this.id, this.id + '-editor');
    await this.editor.init({ mode: this.currentMode });
  }

  async destroy() {
    // Destroy the editor instance
    if (this.editor) {
      await this.editor.destroy();
    }
    
    super.destroy();
  }

  async render(containerId) {
    this.container = await super.render(containerId);
    this.container.innerHTML = '';
    
    // Create a container for the editor
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    editorContainer.className = 'editor-container';
    editorContainer.style.width = '100%';
    editorContainer.style.height = '100%';
    editorContainer.style.minWidth = '0'; // Prevent flex item from overflowing
    editorContainer.style.flex = '1'; // Take up all available space
    editorContainer.style.display = 'flex'; // Use flexbox layout
    this.container.appendChild(editorContainer);
    
    // Render the editor in the container
    await this.editor.render(editorContainer.id || 'editor-container');
    
    return this.container;
  }
  

  
  
  // Core editor methods that all modes can use
  
  getContent() {
    if (this.editor) {
      return this.editor.getContent();
    }
    return '';
  }
  
  setContent(content) {
    if (this.editor) {
      this.editor.setContent(content);
    }
  }
  
  // Message handlers - forward to editor
  
  async handleModeChange(data, sender) {
    if (data.mode) {
      this.currentMode = data.mode;
      
      // Update the editor mode
      if (this.editor) {
        await this.editor.handleModeChange(data, this.id);
      }
      
      return true;
    }
    return false;
  }
  
  async handleNewFile(data, sender) {
    if (this.editor) {
      return await this.editor.handleNewFile(data, this.id);
    }
    return false;
  }
  
  async handleOpenFile(data, sender) {
    if (this.editor) {
      return await this.editor.handleOpenFile(data, this.id);
    }
    return false;
  }
  
  async handleSaveFile(data, sender) {
    if (this.editor) {
      return await this.editor.handleSaveFile(data, this.id);
    }
    return false;
  }
  
  async handleRunProgram(data, sender) {
    if (this.editor) {
      return await this.editor.handleRunProgram(data, this.id);
    }
    return false;
  }
  
  async handleDebugProgram(data, sender) {
    if (this.editor) {
      return await this.editor.handleDebugProgram(data, this.id);
    }
    return false;
  }
  
  // Handle responses from the active editor and forward to parent
  
  async handleSaveFileContent(data, sender) {
    // Forward to parent
    this.sendMessage(MESSAGES.SAVE_FILE_CONTENT, data);
    return true;
  }
  
  async handleRunProgramContent(data, sender) {
    // Forward to parent
    this.sendMessage(MESSAGES.RUN_PROGRAM_CONTENT, data);
    return true;
  }
  
  async handleDebugProgramContent(data, sender) {
    // Forward to parent
    this.sendMessage(MESSAGES.DEBUG_PROGRAM_CONTENT, data);
    return true;
  }

  /**
   * Apply layout information to restore the Editor state
   * @param {Object} layoutInfo - Layout information for this Editor
   */
  async applyLayout(layoutInfo) {
    await super.applyLayout(layoutInfo);
    
    // Set the mode first
    if (layoutInfo.currentMode) {
      this.currentMode = layoutInfo.currentMode;
    }
    
    // Apply layout to the editor
    if (this.editor) {
      await this.editor.applyLayout(layoutInfo);
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
    
    // Get layout info from the editor
    if (this.editor) {
      const editorLayout = await this.editor.getLayoutInfo();
      
      // Merge the editor layout with our layout
      Object.assign(layoutInfo, {
        content: editorLayout.content,
        tabs: editorLayout.tabs,
        activeTabIndex: editorLayout.activeTabIndex,
        modeSpecific: editorLayout.modeSpecific
      });
    }
    
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
   * Sets the editor mode
   * @param {string} mode - The mode to set
   */
  async setMode(mode) {
    if (mode === this.currentMode) return;
    
    this.currentMode = mode;
    if (this.editor) {
      await this.editor.handleModeChange({ mode }, this.id);
    }
  }
}

export default Editor;

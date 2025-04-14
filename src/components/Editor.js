// Editor.js - Container component that manages the source code editor
import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js'
import EditorSource from './EditorSource.js'
import { PROJECTMESSAGES } from './ProjectManager.js'
import { MENUCOMMANDS } from './MenuBar.js'

class Editor extends BaseComponent {
  constructor(parentId, containerId) {
    // Initialize the base component with component name
    super('Editor', parentId, containerId);
    
    // Editor instance
    this.editor = null;
    
    // Forward all relevant messages to the editor
    this.messageMap[MESSAGES.MODE_CHANGE] = this.handleModeChange;
    this.messageMap[PROJECTMESSAGES.LOAD_FILE] = this.handleLoadFile;
    this.messageMap[PROJECTMESSAGES.CLOSE_FILE] = this.handleCloseFile;
    this.messageMap[MENUCOMMANDS.SAVE_FILE] = this.handleSaveFile;
  }
  
  async init(options) {
    super.init(options);
    this.currentMode = options?.mode || 'javascript';
    
    // Create the editor instance but don't render it yet
    this.editor = new EditorSource(this.componentId);
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
    //await this.editor.render(editorContainer.id || 'editor-container');
    
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
    this.currentMode = data.mode;
    if (this.editor) 
      return await this.editor.handleModeChange(data, sender);
    return false;
  }
  async handleLoadFile(data, sender) {
    if (this.editor) {
      return await this.editor.handleLoadFile(data, sender);
    }
    return false;
  }
  async handleSaveFile(data, sender) {
    if (this.editor) {
      return await this.editor.handleSaveFile(data, sender);
    }
    return false;
  }
  async handleCloseFile(data, sender) {
    if (this.editor) {
      return await this.editor.handleCloseFile(data, sender);
    }
    return false;
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

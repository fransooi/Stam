// Editor.js - Component for the code editor area

class Editor {
  constructor(containerId, currentMode = 'modern') {
    this.container = document.getElementById(containerId);
    this.currentMode = currentMode;
    this.editorInstance = null;
  }

  async render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Load and render mode-specific editor
    await this.loadModeSpecificEditor();
  }
  
  async loadModeSpecificEditor() {
    try {
      console.log(`Loading editor for ${this.currentMode} mode`);
      
      // Dynamically import the editor module for the current mode
      let EditorModule;
      
      switch (this.currentMode) {
        case 'modern':
          EditorModule = await import('./modern/editor.js');
          break;
        case 'stos':
          EditorModule = await import('./stos/editor.js');
          break;
        case 'amos1_3':
          EditorModule = await import('./amos1_3/editor.js');
          break;
        case 'amosPro':
          EditorModule = await import('./amosPro/editor.js');
          break;
        case 'c64':
          EditorModule = await import('./c64/editor.js');
          break;
        default:
          EditorModule = await import('./modern/editor.js');
      }
      
      // Create and render the mode-specific editor
      this.editorInstance = new EditorModule.default(this.container);
      this.editorInstance.render();
      
      console.log(`Editor for ${this.currentMode} mode loaded successfully`);
      
      // If we're in C64 mode, get the icon bar and connect it to the editor
      if (this.currentMode === 'c64') {
        // Find the icon bar instance
        const iconBar = document.getElementById('icon-area');
        if (iconBar && iconBar._iconBarInstance) {
          console.log('Found icon bar instance, connecting to editor');
          // Connect the icon bar to the editor
          iconBar._iconBarInstance.setEditorInstance(this.editorInstance);
        } else {
          console.warn('Icon bar instance not found, cannot connect to editor');
        }
      }
      
    } catch (error) {
      console.error(`Error loading editor for mode ${this.currentMode}:`, error);
      this.container.innerHTML = `<div class="error-message">Failed to load editor for ${this.currentMode} mode</div>`;
    }
  }
  
  getContent() {
    if (this.editorInstance && typeof this.editorInstance.getContent === 'function') {
      return this.editorInstance.getContent();
    }
    return '';
  }
  
  setContent(content) {
    if (this.editorInstance && typeof this.editorInstance.setContent === 'function') {
      this.editorInstance.setContent(content);
    }
  }
  
  setMode(mode) {
    console.log(`Changing editor mode from ${this.currentMode} to ${mode}`);
    this.currentMode = mode;
  }
}

export default Editor;

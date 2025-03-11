// Commodore 64 Icon Bar component

class C64Icons {
  constructor(container, onActionCallback) {
    this.container = container;
    this.onActionCallback = onActionCallback;
    this.editorInstance = null;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create C64 mode buttons
    this.addButton('Run', 'run-button');
    this.addButton('Stop', 'stop-button');
    this.addButton('Reset', 'reset-button');
    this.addButton('Load', 'load-button');
    this.addButton('Save', 'save-button');
    
    // Add custom styles for C64 buttons
    const style = document.createElement('style');
    style.textContent = `
      .c64-button {
        background-color: #7B68EE;
        color: white;
        border: 2px solid #9370DB;
        padding: 4px 8px;
        margin: 0 4px;
        cursor: pointer;
        font-family: 'C64', 'Courier New', monospace;
      }
      .c64-button:hover {
        background-color: #9370DB;
      }
      .run-button {
        background-color: #4CAF50;
        border-color: #388E3C;
      }
      .run-button:hover {
        background-color: #388E3C;
      }
      .stop-button {
        background-color: #F44336;
        border-color: #D32F2F;
      }
      .stop-button:hover {
        background-color: #D32F2F;
      }
      .reset-button {
        background-color: #FF9800;
        border-color: #F57C00;
      }
      .reset-button:hover {
        background-color: #F57C00;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Set the editor instance to communicate with
  setEditorInstance(editorInstance) {
    this.editorInstance = editorInstance;
  }
  
  addButton(text, className) {
    const button = document.createElement('button');
    button.className = `icon-button c64-button ${className}`;
    button.textContent = text;
    button.addEventListener('click', () => this.handleButtonClick(text));
    this.container.appendChild(button);
  }
  
  handleButtonClick(action) {
    console.log(`C64 Button clicked: ${action}`);
    
    switch (action.toLowerCase()) {
      case 'run':
        this.handleRunClick();
        break;
      case 'stop':
        this.handleStopClick();
        break;
      case 'reset':
        this.handleResetClick();
        break;
      case 'load':
        this.handleLoadClick();
        break;
      case 'save':
        this.handleSaveClick();
        break;
      default:
        console.log(`Action not implemented: ${action}`);
    }
    
    // Call the callback if provided
    if (this.onActionCallback) {
      this.onActionCallback(action.toLowerCase());
    }
  }
  
  handleRunClick() {
    console.log('C64 Run button clicked');
    if (this.editorInstance && typeof this.editorInstance.runProgram === 'function') {
      this.editorInstance.runProgram();
    }
  }
  
  handleStopClick() {
    console.log('C64 Stop button clicked');
    if (this.editorInstance && typeof this.editorInstance.stopProgram === 'function') {
      this.editorInstance.stopProgram();
    }
  }
  
  handleResetClick() {
    console.log('C64 Reset button clicked');
    if (this.editorInstance && typeof this.editorInstance.resetEmulator === 'function') {
      this.editorInstance.resetEmulator();
    }
  }
  
  handleLoadClick() {
    console.log('C64 Load button clicked');
    if (this.editorInstance && typeof this.editorInstance.loadProgram === 'function') {
      // For now, we'll just pass null as the program
      // In a real implementation, we might open a file dialog or similar
      this.editorInstance.loadProgram(null);
    }
  }
  
  handleSaveClick() {
    console.log('C64 Save button clicked');
    if (this.editorInstance && typeof this.editorInstance.saveProgram === 'function') {
      this.editorInstance.saveProgram();
    }
  }
}

export default C64Icons;

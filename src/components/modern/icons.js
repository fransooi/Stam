// Modern Icon Bar component with Font Awesome icons

class ModernIcons {
  constructor(container, onActionCallback) {
    this.container = container;
    this.onActionCallback = onActionCallback;
    this.editorInstance = null;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    console.log('Rendering modern icon bar with Font Awesome icons');
    
    // Create modern mode buttons with Font Awesome icons
    this.addButton('New', 'new-button', 'fa-file');
    this.addButton('Open', 'open-button', 'fa-folder-open');
    this.addButton('Save', 'save-button', 'fa-save');
    this.addButton('Run', 'run-button', 'fa-play');
    this.addButton('Debug', 'debug-button', 'fa-bug');
    this.addButton('Share', 'share-button', 'fa-share-alt');
    this.addButton('Help', 'help-button', 'fa-question-circle');
    
    // Add custom styles for modern buttons
    this.addStyles();
  }
  
  // Add styles for the modern icon bar
  addStyles() {
    // Check if styles are already added
    if (document.getElementById('modern-icons-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'modern-icons-styles';
    style.textContent = `
      .modern-icon-button {
        background-color: transparent;
        color: #e0e0e0;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 10px;
        margin: 0 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        width: 45px;
        height: 45px;
      }
      
      .modern-icon-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: #888;
      }
      
      .modern-icon-button:active {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .modern-icon-button i {
        font-size: 24px; /* Double size icons */
      }
      
      /* Button-specific colors */
      .new-button {
        color: #90CAF9;
      }
      
      .open-button {
        color: #FFE082;
      }
      
      .save-button {
        color: #A5D6A7;
      }
      
      .run-button {
        color: #81C784;
      }
      
      .debug-button {
        color: #FFB74D;
      }
      
      .share-button {
        color: #9FA8DA;
      }
      
      .help-button {
        color: #CE93D8;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Set the editor instance to communicate with
  setEditorInstance(editorInstance) {
    console.log('ModernIcons: Setting editor instance');
    this.editorInstance = editorInstance;
  }
  
  addButton(text, className, iconClass) {
    const button = document.createElement('button');
    button.className = `icon-button modern-icon-button ${className}`;
    button.title = text; // Keep the title for tooltip on hover
    
    // Create icon element
    const icon = document.createElement('i');
    icon.className = `fas ${iconClass}`;
    button.appendChild(icon);
    
    // No text span anymore, just the icon
    
    button.addEventListener('click', () => this.handleButtonClick(text));
    this.container.appendChild(button);
  }
  
  handleButtonClick(action) {
    console.log(`Modern button clicked: ${action}`);
    
    switch (action.toLowerCase()) {
      case 'new':
        this.handleNewClick();
        break;
      case 'open':
        this.handleOpenClick();
        break;
      case 'save':
        this.handleSaveClick();
        break;
      case 'run':
        this.handleRunClick();
        break;
      case 'debug':
        this.handleDebugClick();
        break;
      case 'share':
        this.handleShareClick();
        break;
      case 'help':
        this.handleHelpClick();
        break;
      default:
        console.log(`Action not implemented: ${action}`);
    }
    
    // Call the callback if provided
    if (this.onActionCallback) {
      this.onActionCallback(action.toLowerCase());
    }
  }
  
  handleNewClick() {
    console.log('New button clicked');
    if (this.editorInstance && typeof this.editorInstance.newFile === 'function') {
      this.editorInstance.newFile();
    }
  }
  
  handleOpenClick() {
    console.log('Open button clicked');
    if (this.editorInstance && typeof this.editorInstance.openFile === 'function') {
      this.editorInstance.openFile();
    }
  }
  
  handleSaveClick() {
    console.log('Save button clicked');
    if (this.editorInstance && typeof this.editorInstance.saveFile === 'function') {
      this.editorInstance.saveFile();
    }
  }
  
  handleRunClick() {
    console.log('Run button clicked');
    if (this.editorInstance && typeof this.editorInstance.runProgram === 'function') {
      this.editorInstance.runProgram();
    }
  }
  
  handleDebugClick() {
    console.log('Debug button clicked');
    if (this.editorInstance && typeof this.editorInstance.debugProgram === 'function') {
      this.editorInstance.debugProgram();
    }
  }
  
  handleShareClick() {
    console.log('Share button clicked');
    if (this.editorInstance && typeof this.editorInstance.shareCode === 'function') {
      this.editorInstance.shareCode();
    }
  }
  
  handleHelpClick() {
    console.log('Help button clicked');
    if (this.editorInstance && typeof this.editorInstance.showHelp === 'function') {
      this.editorInstance.showHelp();
    }
  }
}

export default ModernIcons;

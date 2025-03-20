// Commodore 64 Icon Bar component
import messageBus from '../../utils/MessageBus.mjs';
import BaseComponent from '../../utils/BaseComponent.js';

class C64Icons extends BaseComponent  {
  constructor(parentId,containerId) {
    super('C64Icons', parentId, containerId);
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
  
  addButton(text, className) {
    const button = document.createElement('button');
    button.className = `icon-button c64-button ${className}`;
    button.textContent = text;
    button.addEventListener('click', () => this.handleButtonClick(text));
    this.container.appendChild(button);
  }
  
  handleButtonClick(action) {
    console.log(`C64 Button clicked: ${action}`);
    
    // Call the callback if provided
    if (typeof this.onIconClickCallback === 'function') {
      this.onIconClickCallback(action.toLowerCase());
    }
    
    // Handle the action based on button type
    switch (action.toLowerCase()) {
      case 'run':
        this.sendCommandToEmulator('RUN');
        break;
      case 'stop':
        this.sendCommandToEmulator('STOP');
        break;
      case 'reset':
        this.sendCommandToEmulator('RESET');
        break;
      case 'load':
        this.handleLoadAction();
        break;
      case 'save':
        this.handleSaveAction();
        break;
      default:
        console.warn(`Unknown C64 action: ${action}`);
    }
  }
  
  /**
   * Send a command to the C64 emulator via MessageBus
   * @param {string} command - The command to send
   * @param {Object} params - Additional parameters for the command
   */
  sendCommandToEmulator(command, params = {}) {
    // Use the forward method to send the message to all C64OutputSideWindow instances
    messageBus.forward(command, 'C64OutputSideWindow', params);
  }
  
  /**
   * Handle the Load button action
   */
  handleLoadAction() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.prg,.d64,.t64,.s64';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle file selection
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          this.sendCommandToEmulator('LOAD_PRG', {
            data: data,
            fileName: file.name,
            autoStart: false
          });
        };
        reader.readAsArrayBuffer(file);
      }
      
      // Remove the file input element
      document.body.removeChild(fileInput);
    });
    
    // Trigger the file selection dialog
    fileInput.click();
  }
  
  /**
   * Handle the Save button action
   */
  handleSaveAction() {
    // For now, just log that this feature is not implemented
    console.log('C64 Save functionality not implemented yet');
    
    // In a future implementation, this could request a snapshot from the emulator
    // and then offer it as a download to the user
  }
  
  /**
   * Get information about the C64 icon bar for layout saving
   * @returns {Object} Icon information
   */
  getIconInfo() {
    return {
      mode: 'c64'
    };
  }
}

export default C64Icons;

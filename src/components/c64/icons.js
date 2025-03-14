// Commodore 64 Icon Bar component

class C64Icons {
  constructor(container) {
    this.container = container;
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
  }  
}

export default C64Icons;

// Commodore 64 Icon Bar component

class C64Icons {
  constructor(container, onActionCallback) {
    this.container = container;
    this.onActionCallback = onActionCallback;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create C64 mode buttons
    this.addButton('Run', 'run-button');
    this.addButton('Stop', 'stop-button');
    this.addButton('Reset', 'icon-button');
    this.addButton('Load', 'icon-button');
    this.addButton('Save', 'icon-button');
    
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
      }
      .c64-button:hover {
        background-color: #9370DB;
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
    // Implement run functionality
  }
  
  handleStopClick() {
    console.log('C64 Stop button clicked');
    // Implement stop functionality
  }
  
  handleResetClick() {
    console.log('C64 Reset button clicked');
    // Implement reset functionality
  }
  
  handleLoadClick() {
    console.log('C64 Load button clicked');
    // Implement load functionality
  }
  
  handleSaveClick() {
    console.log('C64 Save button clicked');
    // Implement save functionality
  }
}

export default C64Icons;

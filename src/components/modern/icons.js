// Modern Icon Bar component

class ModernIcons {
  constructor(container, onActionCallback) {
    this.container = container;
    this.onActionCallback = onActionCallback;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create modern mode buttons
    this.addButton('Run', 'run-button');
    this.addButton('Debug', 'debug-button');
    this.addButton('Stop', 'stop-button');
  }
  
  addButton(text, className) {
    const button = document.createElement('button');
    button.className = `icon-button ${className}`;
    button.textContent = text;
    button.addEventListener('click', () => this.handleButtonClick(text));
    this.container.appendChild(button);
  }
  
  handleButtonClick(action) {
    console.log(`Button clicked: ${action}`);
    
    switch (action.toLowerCase()) {
      case 'run':
        this.handleRunClick();
        break;
      case 'debug':
        this.handleDebugClick();
        break;
      case 'stop':
        this.handleStopClick();
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
    console.log('Run button clicked');
    // Implement run functionality
  }
  
  handleDebugClick() {
    console.log('Debug button clicked');
    // Implement debug functionality
  }
  
  handleStopClick() {
    console.log('Stop button clicked');
    // Implement stop functionality
  }
}

export default ModernIcons;

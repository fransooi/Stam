// StatusBar.js - Component for the application status bar

// Import the interface implementation
import InterfaceStatusBar from './interface/StatusBar.js';

class StatusBar {
  constructor(containerId) {
    // Create an instance of the interface implementation
    this.interfaceImpl = new InterfaceStatusBar(containerId);
  }

  render() {
    // Delegate to the interface implementation
    this.interfaceImpl.render();
  }
  
  setStatus(text) {
    // Delegate to the interface implementation
    this.interfaceImpl.setStatus(text);
  }
  
  getStatus() {
    // Delegate to the interface implementation
    return this.interfaceImpl.getStatus();
  }
  
  showTemporaryStatus(text, duration = 3000) {
    // Delegate to the interface implementation
    this.interfaceImpl.showTemporaryStatus(text, duration);
  }
}

export default StatusBar;

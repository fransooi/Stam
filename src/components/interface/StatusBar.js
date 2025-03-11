// StatusBar.js - Default component for the application status bar

class StatusBar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.status = 'Ready';
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create status text element
    const statusText = document.createElement('div');
    statusText.className = 'status-text';
    statusText.textContent = this.status;
    
    // Append to container
    this.container.appendChild(statusText);
  }
  
  setStatus(text) {
    this.status = text;
    const statusText = this.container.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = text;
    }
  }
  
  getStatus() {
    return this.status;
  }
  
  showTemporaryStatus(text, duration = 3000) {
    const previousStatus = this.status;
    this.setStatus(text);
    
    setTimeout(() => {
      this.setStatus(previousStatus);
    }, duration);
  }
}

export default StatusBar;

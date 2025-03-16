// StatusBar.js - Default component for the application status bar

import BaseComponent, { PREFERENCE_MESSAGES } from '../utils/BaseComponent.js';

class StatusBar extends BaseComponent {
  constructor(containerId) {
    // Initialize the base component with component name
    super('StatusBar');
    
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
  
  /**
   * Handle message
   * @param {string} messageType - Type of message
   * @param {Object} messageData - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`StatusBar received message: ${messageType}`, messageData);
    
    switch (messageType) {
      case 'UPDATE_STATUS':
        if (messageData.data && messageData.data.text) {
          this.setStatus(messageData.data.text);
          return true;
        }
        break;
        
      case 'SHOW_TEMPORARY_STATUS':
        if (messageData.data && messageData.data.text) {
          const duration = messageData.data.duration || 3000;
          this.showTemporaryStatus(messageData.data.text, duration);
          return true;
        }
        break;
        
      case PREFERENCE_MESSAGES.LOAD_LAYOUT:
        // Check if this layout is for us
        if (messageData.data && 
            (messageData.data.componentName === 'StatusBar' || 
             messageData.data.componentName === this.componentName)) {
          this.applyLayout(messageData.data.layoutInfo);
          return true;
        }
        break;
    }
    
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Apply layout information to restore the StatusBar state
   * @param {Object} layoutInfo - Layout information for this StatusBar
   */
  applyLayout(layoutInfo) {
    console.log('StatusBar applying layout:', layoutInfo);
    
    // Set status if specified
    if (layoutInfo.status) {
      this.setStatus(layoutInfo.status);
    }
    
    // Apply height if specified
    if (layoutInfo.height && this.container) {
      this.container.style.height = `${layoutInfo.height}px`;
    }
  }
  
  /**
   * Override getLayoutInfo to include StatusBar-specific information
   * @returns {Object} Layout information for this StatusBar
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add StatusBar-specific information
    layoutInfo.status = this.status;
    
    // Get height information if available
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      layoutInfo.height = rect.height;
    }
    
    return layoutInfo;
  }
}

export default StatusBar;

// StatusBar.js - Default component for the application status bar

import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js';

class StatusBar extends BaseComponent {
  constructor(parentId, containerId) {
    // Initialize the base component with component name
    super('StatusBar', parentId, containerId);    
    this.status = 'Ready';
    this.messageMap[MESSAGES.UPDATE_STATUS] = this.handleUpdateStatus;
    this.messageMap[MESSAGES.SHOW_TEMPORARY_STATUS] = this.handleShowTemporaryStatus; 
  }

  async init() {
    await super.init();
  }
  async destroy() {
    if (this.statusText)
      this.statusText.remove();
    await super.destroy();
  }
  async render(containerId) {
    this.parentContainer=await super.render(containerId);
    this.parentContainer.innerHTML = '';
   
    // Create status text element
    this.statusText = document.createElement('div');
    this.statusText.className = 'status-text';
    this.statusText.textContent = this.status;
    
    // Append to parent container
    this.parentContainer.appendChild(this.statusText);

    // Returns the current container
    return this.parentContainer;
  }
  
  setStatus(text) {
    this.status = text;
    if (this.statusText) {
      this.statusText.textContent = text;
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
   * Handle update status message
   * @param {Object} data - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  handleUpdateStatus(data, sender) {
    if (data.text) {
      this.setStatus(data.text);
      return true;
    }
    return false;
  }
  
  /**
   * Handle show temporary status message
   * @param {Object} data - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  async handleShowTemporaryStatus(data, sender) {
    if (data.text) {
      const duration = data.duration || 3000;
      this.showTemporaryStatus(data.text, duration);
      return true;
    }
    return false;
  }
  
  
  /**
   * Apply layout information to restore the StatusBar state
   * @param {Object} layoutInfo - Layout information for this StatusBar
   */
  async applyLayout(layoutInfo) {
    // Set status if specified
    if (layoutInfo.status) {
      this.setStatus(layoutInfo.status);
    }
  }
  
  /**
   * Override getLayoutInfo to include StatusBar-specific information
   * @returns {Object} Layout information for this StatusBar
   */
  async getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = await super.getLayoutInfo();
    
    // Add StatusBar-specific information
    layoutInfo.status = this.status;
    
    // Get height information if available
    if (this.parentContainer) {
      const rect = this.parentContainer.getBoundingClientRect();
      layoutInfo.height = rect.height;
    }
    
    return layoutInfo;
  }
}

export default StatusBar;

// OutputSideWindow.js - Output console side window implementation
import SideWindow from './SideWindow.js';

class OutputSideWindow extends SideWindow {
  constructor(initialHeight = 200) {
    super('output', 'Output', initialHeight);
    this.outputContent = '';
    this.outputContainer = null;
  }
  
  /**
   * Override render to set up content and event listeners
   * @param {HTMLElement} parentContainer - The parent container
   * @returns {HTMLElement} - The rendered window element
   */
  render(parentContainer) {
    // Call parent render method
    const container = super.render(parentContainer);
    
    // Create the output UI
    this.createOutputUI();
    
    // Add event listener for content height changes
    this.content.addEventListener('contentHeightChanged', (event) => {
      this.handleContentHeightChanged(event.detail.height);
    });
    
    // Initial content height update
    this.updateContentHeight();
    
    return container;
  }
  
  /**
   * Handle content height changes
   * @param {number} height - New content height
   */
  handleContentHeightChanged(height) {
    // Update the output container height
    if (this.outputContainer) {
      this.outputContainer.style.height = `${height}px`;
      this.outputContainer.style.maxHeight = `${height}px`;
    }
  }
  
  /**
   * Create the output UI
   */
  createOutputUI() {
    // Clear existing content
    this.content.innerHTML = '';
    
    // Create output container
    this.outputContainer = document.createElement('div');
    this.outputContainer.id = 'output-window';
    this.outputContainer.className = 'output-window';
    
    // Add some basic styling
    this.addStyles();
    
    // Add to content
    this.content.appendChild(this.outputContainer);
    
    // Display any existing content
    if (this.outputContent) {
      this.outputContainer.innerHTML = this.outputContent;
      this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
    }
  }
  
  /**
   * Add styles for the output window
   */
  addStyles() {
    // Add styles if not already present
    if (!document.getElementById('output-side-window-styles')) {
      const style = document.createElement('style');
      style.id = 'output-side-window-styles';
      style.textContent = `
        .output-window {
          font-family: monospace;
          padding: 5px;
          overflow-y: auto;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Append content to the output window
   * @param {string} content - The content to append
   */
  appendContent(content) {
    this.outputContent += content;
    if (this.outputContainer) {
      this.outputContainer.innerHTML = this.outputContent;
      this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
    }
  }
  
  /**
   * Clear the output window
   */
  clearContent() {
    this.outputContent = '';
    if (this.outputContainer) {
      this.outputContainer.innerHTML = '';
    }
  }
  
  /**
   * Update the output window with new data
   * @param {Object} data - The data to update with
   * @param {string} data.content - The content to append
   * @param {boolean} data.clear - Whether to clear the output first
   */
  update(data) {
    if (data.clear) {
      this.clearContent();
    }
    
    if (data.content) {
      this.appendContent(data.content);
    }
  }
  
  /**
   * Handle incoming messages
   * 
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    // First, let the parent class try to handle the message
    if (super.handleMessage(messageType, messageData, sender)) {
      return true;
    }
    
    // Handle output-specific messages
    switch (messageType) {
      case 'OUTPUT_APPEND':
        if (messageData.content) {
          this.appendContent(messageData.content);
          return true;
        }
        break;
        
      case 'OUTPUT_CLEAR':
        this.clearContent();
        return true;
        
      case 'OUTPUT_UPDATE':
        this.update(messageData);
        return true;
    }
    
    return false;
  }
}

export default OutputSideWindow;

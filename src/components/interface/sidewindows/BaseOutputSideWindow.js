// BaseOutputSideWindow.js - Base class for output console side windows
import SideWindow from './SideWindow.js';

class BaseOutputSideWindow extends SideWindow {
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
    console.log('BaseOutputSideWindow.createOutputUI called');
    
    // Create the output container if it doesn't exist
    if (!this.outputContainer) {
      this.outputContainer = document.createElement('div');
      this.outputContainer.className = 'output-container';
      this.outputContainer.id = 'output-window';
      this.outputContainer.style.width = '90%'; 
      this.outputContainer.style.height = '100%';
      this.outputContainer.style.overflow = 'hidden'; 
      this.outputContainer.style.boxSizing = 'border-box';
      this.outputContainer.style.margin = '0 auto'; 
      
      // Add basic styling
      this.addStyles();
    }
    
    // Make sure the content element is clear
    if (this.content) {
      // Clear existing content
      this.content.innerHTML = '';
      
      // Set the content to fill available space without scrollbars
      this.content.style.overflow = 'hidden';
      this.content.style.boxSizing = 'border-box';
      this.content.style.height = '100%';
      this.content.style.display = 'flex';
      this.content.style.flexDirection = 'column';
      this.content.style.justifyContent = 'center'; 
      this.content.style.alignItems = 'center'; 
      
      // Add the output container to the content
      this.content.appendChild(this.outputContainer);
      
      // Add any existing content to the output container
      if (this.outputContent) {
        this.outputContainer.innerHTML = this.outputContent;
      }
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
        
        /* Style for forcing redraw */
        .mode-changed {
          opacity: 0.99;
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
  
  /**
   * Override getLayoutInfo to include output-specific information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
    // Add output-specific layout information
    return {
      ...baseInfo,
      outputContent: this.outputContent
    };
  }
  
  /**
   * Apply layout information to this window
   * @param {Object} layoutInfo - The layout information to apply
   */
  applyLayout(layoutInfo) {
    // Apply base layout information
    super.applyLayout(layoutInfo);
    
    // Apply output-specific layout information
    if (layoutInfo.outputContent) {
      this.outputContent = layoutInfo.outputContent;
      if (this.outputContainer) {
        this.outputContainer.innerHTML = this.outputContent;
        this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
      }
    }
  }
}

export default BaseOutputSideWindow;

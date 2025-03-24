// BaseOutputSideWindow.js - Base class for output console side windows
import BaseComponent from '../../../utils/BaseComponent.js';
import { MESSAGES } from '../../../utils/BaseComponent.js';

class BaseOutput extends BaseComponent {
  constructor(componentName,parentId,initialHeight = 200) {
    super(componentName,parentId, initialHeight);
    this.outputContent = '';
    this.outputContainer = null;
    this.messageMap[MESSAGES.CONTENT_HEIGHT_CHANGED] = this.handleContentHeightChanged;
  }
  
  /**
   * Initialize the component
   * @param {Object} options - Initialization options
   */
  async init(options = {}) {
    super.init(options);
  }
  
  /**
   * Destroy the component
   */
  async destroy() {
    super.destroy();
  }

  /**
   * Override render to set up content and event listeners
   * @param {HTMLElement} parentContainer - The parent container
   * @returns {HTMLElement} - The rendered window element
   */
  async render(containerId) {       
    var container = await super.render(containerId);
    this.header = container.querySelector('.side-window-header');
    this.container = container.querySelector('.side-window-content');

    // Add basic styling
    this.addStyles();
  
    // Clear existing content if content exists
    if (this.container) {
      this.container.innerHTML = '';
    } else {
      console.error('Content element not found');
    }
    
    // Set the content to fill available space without scrollbars
    if (this.container) {
      this.container.style.overflow = 'hidden';
      this.container.style.boxSizing = 'border-box';
      this.container.style.height = '100%';
      this.container.style.display = 'flex';
      this.container.style.flexDirection = 'column';
      
      // Add bottom padding to prevent content from being cut off by resize handle
      this.container.style.paddingBottom = '32px';
    }
    
    return this.container;
  }
  
  /**
   * Handle content height changes
   * @param {Object} data - Message data containing the new height
   * @param {string} senderId - ID of the sender component
   */
  handleContentHeightChanged(data, senderId) {
    const height = data.height;
    // Update the output container height
    if (this.container) {
      this.container.style.height = `${height}px`;
      this.container.style.maxHeight = `${height}px`;
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
   * Override getLayoutInfo to include output-specific information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
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
  async applyLayout(layoutInfo) {
    // Apply base layout information
    await super.applyLayout(layoutInfo);
    
    // Apply output-specific layout information
    if (layoutInfo.outputContent) {
      this.outputContent = layoutInfo.outputContent;
      if (this.container) {
        this.container.innerHTML = this.outputContent;
        this.container.scrollTop = this.container.scrollHeight;
      }
    }
  }
}

export default BaseOutput;

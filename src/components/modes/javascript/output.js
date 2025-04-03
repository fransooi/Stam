// Javascript mode output window implementation
import BaseOutput from '../../sidewindows/BaseOutput.js';

class JavascriptOutput extends BaseOutput {
  constructor(parentId,containerId,initialHeight = 200) {
    super('JavascriptOutput',parentId,containerId,initialHeight);
    this.modeName = 'javascript';
  }
  
  /**
   * Create the output UI specific to STOS mode
   * @param {string} containerId - The ID of the container element
   * @returns {Promise<HTMLDivElement>} The rendered output container
   */
  async render(containerId) {
    this.container = await super.render(containerId);
    
    // Add Javascript-specific UI elements and styling
    this.addJavascriptSpecificStyles();
    
    // Apply direct styling to ensure it overrides any default styles
    this.container.style.fontFamily = 'Consolas, monospace';
    this.container.style.backgroundColor = '#f8f8f8';
    this.container.style.color = '#333';
    this.container.style.border = '3px solid #ddd';
    this.container.style.borderRadius = '4px';
    this.container.style.padding = '8px';
    
    // Always set the content to ensure Javascript-specific display
    this.container.innerHTML = `
      <div style="padding: 10px; text-align: center; font-family: 'Consolas', monospace; color: #333;">
        <strong>Javascript OUTPUT WINDOW</strong><br>
        <span style="color: #0066cc;">JavaScript Console Ready</span><br>
        <span style="color: #009900;">Type commands to execute</span>
      </div>
    `;
    return this.container;
  }
  
  /**
   * Add Javascript-specific styles for the output window
   */
  addJavascriptSpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('javascript-output-styles')) {
      const style = document.createElement('style');
      style.id = 'javascript-output-styles';
      style.textContent = `
        /* Direct styling for the output window in Javascript mode */
        .javascript-mode #output-window,
        .javascript-mode .output-window {
          font-family: 'Consolas', monospace !important;
          background-color: #f8f8f8 !important;
          color: #333 !important;
          border: 3px solid #ddd !important;
          border-radius: 4px !important;
          padding: 8px !important;
        }
        
        .javascript-mode .output-window .error {
          color: #e74c3c !important;
          font-weight: bold !important;
        }
        
        .javascript-mode .output-window .warning {
          color: #f39c12 !important;
        }
        
        .javascript-mode .output-window .success {
          color: #2ecc71 !important;
        }
        
        .javascript-mode .output-window .info {
          color: #3498db !important;
        }
        
        /* Javascript console-style log formatting */
        .javascript-mode .output-window .log-entry {
          margin-bottom: 4px;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
        }
        
        .javascript-mode .output-window .log-time {
          color: #999;
          font-size: 0.8em;
          margin-right: 5px;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Override getLayoutInfo to include Javascript-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
    // Add Javascript-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

export default JavascriptOutput;

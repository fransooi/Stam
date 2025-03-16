// Modern mode output window implementation
import BaseOutputSideWindow from '../interface/sidewindows/BaseOutputSideWindow.js';

class ModernOutputSideWindow extends BaseOutputSideWindow {
  constructor(initialHeight = 200) {
    super(initialHeight);
    this.modeName = 'modern';
    // Default content for Modern mode
    this.outputContent = `
      <div style="padding: 10px; text-align: center; font-family: 'Consolas', monospace; color: #333;">
        <strong>Modern OUTPUT WINDOW</strong><br>
        <span style="color: #0066cc;">JavaScript Console Ready</span><br>
        <span style="color: #009900;">Type commands to execute</span>
      </div>
    `;
  }
  
  /**
   * Create the output UI specific to Modern mode
   */
  createOutputUI() {
    // Call the base implementation first to set up the container
    super.createOutputUI();
    
    // Add Modern-specific UI elements and styling
    this.addModernSpecificStyles();
    
    // Apply Modern-specific styling directly to the container
    if (this.outputContainer) {
      // Apply direct styling to ensure it overrides any default styles
      this.outputContainer.style.fontFamily = 'Consolas, monospace';
      this.outputContainer.style.backgroundColor = '#f8f8f8';
      this.outputContainer.style.color = '#333';
      this.outputContainer.style.border = '3px solid #ddd';
      this.outputContainer.style.borderRadius = '4px';
      this.outputContainer.style.padding = '8px';
      
      // Always set the content to ensure Modern-specific display
      this.outputContainer.innerHTML = this.outputContent;
    }
  }
  
  /**
   * Add Modern-specific styles for the output window
   */
  addModernSpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('modern-output-styles')) {
      const style = document.createElement('style');
      style.id = 'modern-output-styles';
      style.textContent = `
        /* Direct styling for the output window in Modern mode */
        .modern-mode #output-window,
        .modern-mode .output-window {
          font-family: 'Consolas', monospace !important;
          background-color: #f8f8f8 !important;
          color: #333 !important;
          border: 3px solid #ddd !important;
          border-radius: 4px !important;
          padding: 8px !important;
        }
        
        .modern-mode .output-window .error {
          color: #e74c3c !important;
          font-weight: bold !important;
        }
        
        .modern-mode .output-window .warning {
          color: #f39c12 !important;
        }
        
        .modern-mode .output-window .success {
          color: #2ecc71 !important;
        }
        
        .modern-mode .output-window .info {
          color: #3498db !important;
        }
        
        /* Modern console-style log formatting */
        .modern-mode .output-window .log-entry {
          margin-bottom: 4px;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
        }
        
        .modern-mode .output-window .log-time {
          color: #999;
          font-size: 0.8em;
          margin-right: 5px;
        }
      `;
      document.head.appendChild(style);
      console.log('Modern output styles added to document head');
    }
  }
  
  /**
   * Format content specifically for Modern mode
   * @param {string} content - The content to format
   * @returns {string} - The formatted content
   */
  formatContent(content) {
    // Apply Modern-specific formatting to the content
    
    // Add timestamp to log entries
    const timestamp = new Date().toLocaleTimeString();
    
    // Format console.log style output
    if (content.includes('console.log')) {
      content = `<div class="log-entry"><span class="log-time">${timestamp}</span> ${content.replace('console.log', '')}</div>`;
    }
    
    // Format errors
    if (content.includes('Error:') || content.includes('Exception:')) {
      content = `<div class="log-entry error"><span class="log-time">${timestamp}</span> ${content}</div>`;
    }
    
    return content;
  }
  
  /**
   * Override appendContent to apply Modern-specific formatting
   * @param {string} content - The content to append
   */
  appendContent(content) {
    const formattedContent = this.formatContent(content);
    super.appendContent(formattedContent);
  }
  
  /**
   * Override getLayoutInfo to include Modern-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
    // Add Modern-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default ModernOutputSideWindow;

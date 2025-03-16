// AMOS Pro mode output window implementation
import BaseOutputSideWindow from '../interface/sidewindows/BaseOutputSideWindow.js';

class AMOSProOutputSideWindow extends BaseOutputSideWindow {
  constructor(initialHeight = 200) {
    super(initialHeight);
    this.modeName = 'amosPro';
    // Default content for AMOS Pro mode
    this.outputContent = `
      <div style="padding: 10px; text-align: center; font-family: 'Courier New', monospace; color: #ffffff;">
        <strong>AMOS Pro OUTPUT WINDOW</strong><br>
        <span style="color: #ffff80;">AMOS Professional V2.00</span><br>
        <span style="color: #80ff80;">Interpreter ready - 1024K free</span>
      </div>
    `;
  }
  
  /**
   * Create the output UI specific to AMOS Pro mode
   */
  createOutputUI() {
    // Call the base implementation first to set up the container
    super.createOutputUI();
    
    // Add AMOS Pro-specific UI elements and styling
    this.addAMOSProSpecificStyles();
    
    // Apply AMOS Pro-specific styling directly to the container
    if (this.outputContainer) {
      // Apply direct styling to ensure it overrides any default styles
      this.outputContainer.style.fontFamily = 'Courier New, monospace';
      this.outputContainer.style.backgroundColor = '#000060'; // Darker blue for AMOS Pro
      this.outputContainer.style.color = '#ffffff';
      this.outputContainer.style.border = '3px solid #4040c0';
      this.outputContainer.style.padding = '8px';
      
      // Always set the content to ensure AMOS Pro-specific display
      this.outputContainer.innerHTML = this.outputContent;
    }
  }
  
  /**
   * Add AMOS Pro-specific styles for the output window
   */
  addAMOSProSpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('amosPro-output-styles')) {
      const style = document.createElement('style');
      style.id = 'amosPro-output-styles';
      style.textContent = `
        /* Direct styling for the output window in AMOS Pro mode */
        .amosPro-mode #output-window,
        .amosPro-mode .output-window {
          font-family: 'Courier New', monospace !important;
          background-color: #000060 !important; /* Darker AMOS Pro blue background */
          color: #ffffff !important; /* White text */
          border: 3px solid #4040c0 !important;
          padding: 8px !important;
        }
        
        .amosPro-mode .output-window .error {
          color: #ff4040 !important;
          font-weight: bold !important;
        }
        
        .amosPro-mode .output-window .warning {
          color: #ffff40 !important;
        }
        
        .amosPro-mode .output-window .success {
          color: #40ff40 !important;
        }
        
        .amosPro-mode .output-window .info {
          color: #40ffff !important;
        }
      `;
      document.head.appendChild(style);
      console.log('AMOS Pro output styles added to document head');
    }
  }
  
  /**
   * Format content specifically for AMOS Pro mode
   * @param {string} content - The content to format
   * @returns {string} - The formatted content
   */
  formatContent(content) {
    // Apply any AMOS Pro-specific formatting to the content
    // This could include AMOS Pro-specific syntax highlighting or error formatting
    
    // Example: Convert AMOS Pro error codes to more descriptive messages
    content = content.replace(/Error (\d+)/g, (match, errorCode) => {
      const errorMessages = {
        '1': 'Error 1: Out of memory',
        '2': 'Error 2: Syntax error',
        '3': 'Error 3: RETURN without GOSUB',
        // Add more AMOS Pro-specific error codes as needed
      };
      
      return errorMessages[errorCode] || match;
    });
    
    return content;
  }
  
  /**
   * Override appendContent to apply AMOS Pro-specific formatting
   * @param {string} content - The content to append
   */
  appendContent(content) {
    const formattedContent = this.formatContent(content);
    super.appendContent(formattedContent);
  }
  
  /**
   * Override getLayoutInfo to include AMOS Pro-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
    // Add AMOS Pro-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default AMOSProOutputSideWindow;

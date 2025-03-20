// AMOS 1.3 mode output window implementation
import BaseOutput from '../interface/sidewindows/BaseOutput.js';

class AMOS1_3Output extends BaseOutput {
  constructor(parentId,containerId,initialHeight = 200) {
    super('AMOS1_3Output', parentId, containerId, initialHeight);
    this.modeName = 'amos1_3';
    // Default content for AMOS 1.3 mode
    this.outputContent = `
      <div style="padding: 10px; text-align: center; font-family: 'Courier New', monospace; color: #ffffff;">
        <strong>AMOS 1.3 OUTPUT WINDOW</strong><br>
        <span style="color: #ffff80;">AMOS Basic 1.3 Ready</span><br>
        <span style="color: #80ff80;">512K System Memory Available</span>
      </div>
    `;
  }
  
  /**
   * Create the output UI specific to AMOS 1.3 mode
   */
  createOutputUI() {
    // Call the base implementation first to set up the container
    super.createOutputUI();
    
    // Add AMOS 1.3-specific UI elements and styling
    this.addAMOS1_3SpecificStyles();
    
    // Apply AMOS 1.3-specific styling directly to the container
    if (this.outputContainer) {
      // Apply direct styling to ensure it overrides any default styles
      this.outputContainer.style.fontFamily = 'Courier New, monospace';
      this.outputContainer.style.backgroundColor = '#000080'; // Deep blue for AMOS 1.3
      this.outputContainer.style.color = '#ffffff';
      this.outputContainer.style.border = '3px solid #4040a0';
      this.outputContainer.style.padding = '8px';
      
      // Always set the content to ensure AMOS 1.3-specific display
      this.outputContainer.innerHTML = this.outputContent;
    }
  }
  
  /**
   * Add AMOS 1.3-specific styles for the output window
   */
  addAMOS1_3SpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('amos1_3-output-styles')) {
      const style = document.createElement('style');
      style.id = 'amos1_3-output-styles';
      style.textContent = `
        /* Direct styling for the output window in AMOS 1.3 mode */
        .amos1_3-mode #output-window,
        .amos1_3-mode .output-window {
          font-family: 'Courier New', monospace !important;
          background-color: #000080 !important; /* Deep blue for AMOS 1.3 */
          color: #ffffff !important; /* White text */
          border: 3px solid #4040a0 !important;
          padding: 8px !important;
        }
        
        .amos1_3-mode .output-window .error {
          color: #ff6060 !important;
          font-weight: bold !important;
        }
        
        .amos1_3-mode .output-window .warning {
          color: #ffff80 !important;
        }
        
        .amos1_3-mode .output-window .success {
          color: #80ff80 !important;
        }
      `;
      document.head.appendChild(style);
      console.log('AMOS 1.3 output styles added to document head');
    }
  }
  
  /**
   * Format content specifically for AMOS 1.3 mode
   * @param {string} content - The content to format
   * @returns {string} - The formatted content
   */
  formatContent(content) {
    // Apply any AMOS 1.3-specific formatting to the content
    // This could include AMOS 1.3-specific syntax highlighting or error formatting
    
    // Example: Convert AMOS 1.3 error codes to more descriptive messages
    content = content.replace(/Error (\d+)/g, (match, errorCode) => {
      const errorMessages = {
        '1': 'Error 1: Out of memory',
        '2': 'Error 2: Syntax error',
        '3': 'Error 3: RETURN without GOSUB',
        // Add more AMOS 1.3-specific error codes as needed
      };
      
      return errorMessages[errorCode] || match;
    });
    
    return content;
  }
  
  /**
   * Override appendContent to apply AMOS 1.3-specific formatting
   * @param {string} content - The content to append
   */
  appendContent(content) {
    const formattedContent = this.formatContent(content);
    super.appendContent(formattedContent);
  }
  
  /**
   * Override getLayoutInfo to include AMOS 1.3-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
    // Add AMOS 1.3-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default AMOS1_3Output;

// STOS mode output window implementation
import BaseOutput from '../interface/sidewindows/BaseOutput.js';

class STOSOutput extends BaseOutput {
  constructor(parentId,containerId,initialHeight = 200) {
    super('STOSOutput',parentId,containerId,initialHeight);
    this.modeName = 'stos';
    // Default content for STOS mode - using flexbox to ensure content fits without scrollbars
    this.outputContent = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        text-align: center;
        font-family: 'Courier New', monospace;
        color: #ffffff;
        padding: 0;
        margin: 0;
      ">
        <strong>STOS OUTPUT WINDOW</strong>
        <span style="color: #ffff60;">Ready for STOS Basic commands</span>
        <span style="color: #60ff60;">STOS BASIC 2.6</span>
      </div>
    `;
  }
  
  /**
   * Create the output UI specific to STOS mode
   */
  createOutputUI() {
    // Call the base implementation first to set up the container
    super.createOutputUI();
    
    // Add STOS-specific UI elements and styling
    this.addSTOSSpecificStyles();
    
    // Apply STOS-specific styling directly to the container
    if (this.outputContainer) {
      // Apply direct styling to ensure it overrides any default styles
      this.outputContainer.style.fontFamily = 'Courier New, monospace';
      this.outputContainer.style.backgroundColor = '#404040';
      this.outputContainer.style.color = '#ffffff';
      this.outputContainer.style.border = '3px solid #808080';
      this.outputContainer.style.padding = '8px';
      this.outputContainer.style.boxSizing = 'border-box';
      this.outputContainer.style.overflow = 'hidden'; // Prevent scrollbars
      this.outputContainer.style.display = 'flex';
      this.outputContainer.style.flexDirection = 'column';
      
      // Always set the content to ensure STOS-specific display
      this.outputContainer.innerHTML = this.outputContent;
    }
  }
  
  /**
   * Add STOS-specific styles for the output window
   */
  addSTOSSpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('stos-output-styles')) {
      const style = document.createElement('style');
      style.id = 'stos-output-styles';
      style.textContent = `
        /* Direct styling for the output window in STOS mode */
        .stos-mode #output-window,
        .stos-mode .output-window {
          font-family: 'Courier New', monospace !important;
          background-color: #404040 !important; /* Dark gray background for STOS */
          color: #ffffff !important; /* White text */
          border: 3px solid #808080 !important;
          padding: 8px !important;
        }
        
        .stos-mode .output-window .error {
          color: #ff6060 !important;
          font-weight: bold !important;
        }
        
        .stos-mode .output-window .warning {
          color: #ffff60 !important;
        }
        
        .stos-mode .output-window .success {
          color: #60ff60 !important;
        }
      `;
      document.head.appendChild(style);
      console.log('STOS output styles added to document head');
    }
  }
  
  /**
   * Format content specifically for STOS mode
   * @param {string} content - The content to format
   * @returns {string} - The formatted content
   */
  formatContent(content) {
    // Apply any STOS-specific formatting to the content
    // This could include STOS-specific syntax highlighting or error formatting
    
    // Example: Convert STOS error codes to more descriptive messages
    content = content.replace(/Error (\d+)/g, (match, errorCode) => {
      const errorMessages = {
        '1': 'Error 1: Out of memory',
        '2': 'Error 2: Syntax error',
        '3': 'Error 3: RETURN without GOSUB',
        // Add more STOS-specific error codes as needed
      };
      
      return errorMessages[errorCode] || match;
    });
    
    return content;
  }
  
  /**
   * Override appendContent to apply STOS-specific formatting
   * @param {string} content - The content to append
   */
  appendContent(content) {
    const formattedContent = this.formatContent(content);
    super.appendContent(formattedContent);
  }
  
  /**
   * Override getLayoutInfo to include STOS-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
    // Add STOS-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default STOSOutput;

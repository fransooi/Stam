// AMOS 1.3 mode output window implementation
import BaseOutput from '../interface/sidewindows/BaseOutput.js';

class AMOS1_3Output extends BaseOutput {
  constructor(parentId,containerId,initialHeight = 200) {
    super('AMOS1_3Output', parentId, containerId, initialHeight);
    this.modeName = 'amos1_3';
  }
  
  /**
   * Create the output UI specific to STOS mode
   * @param {string} containerId - The ID of the container element
   * @returns {Promise<HTMLDivElement>} The rendered output container
   */
  async render(containerId) {
    // Call the base implementation first to set up the container
    this.container = await super.render(containerId);
    
    // Add AMOS 1.3-specific UI elements and styling
    this.addAMOS1_3SpecificStyles();
    
    // Apply direct styling to ensure it overrides any default styles
    this.container.style.fontFamily = 'Courier New, monospace';
    this.container.style.backgroundColor = '#000080'; // Deep blue for AMOS 1.3
    this.container.style.color = '#ffffff';
    this.container.style.border = '3px solid #4040a0';
    this.container.style.padding = '8px';
    
    // Always set the content to ensure AMOS 1.3-specific display
    this.container.innerHTML = `
    <div style="padding: 10px; text-align: center; font-family: 'Courier New', monospace; color: #ffffff;">
      <strong>AMOS 1.3 OUTPUT WINDOW</strong><br>
      <span style="color: #ffff80;">AMOS Basic 1.3 Ready</span><br>
      <span style="color: #80ff80;">512K System Memory Available</span>
    </div>
  `;
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
    }
  }
  
  /**
   * Override getLayoutInfo to include AMOS 1.3-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
    // Add AMOS 1.3-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default AMOS1_3Output;

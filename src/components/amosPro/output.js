// AMOS Pro mode output window implementation
import BaseOutput from '../interface/sidewindows/BaseOutput.js';

class AMOSProOutput extends BaseOutput {
  constructor(parentId,containerId,initialHeight = 200) {
    super('AMOSProOutput', parentId, containerId, initialHeight);
    this.modeName = 'amosPro';    
  }
  
  /**
   * Create the output UI specific to STOS mode
   * @param {string} containerId - The ID of the container element
   * @returns {Promise<HTMLDivElement>} The rendered output container
   */
  async render(containerId) {
    // Call the base implementation first to set up the container
    this.container = await super.render(containerId);
    
    // Add AMOS Pro-specific UI elements and styling
    this.addAMOSProSpecificStyles();
    
    // Apply AMOS Pro-specific styling directly to the container
    this.container.style.fontFamily = 'Courier New, monospace';
    this.container.style.backgroundColor = '#000060'; // Darker blue for AMOS Pro
    this.container.style.color = '#ffffff';
    this.container.style.border = '4px solid #4040c0';
    
    // Always set the content to ensure AMOS Pro-specific display
    this.container.innerHTML = `
    <div style="text-align: center; font-family: 'Courier New', monospace; color: #ffffff;">
      <strong>AMOS Pro OUTPUT WINDOW</strong><br>
      <span style="color: #ffff80;">AMOS Professional V2.00</span><br>
      <span style="color: #80ff80;">Interpreter ready - 1024K free</span>
    </div>
  `;
    return this.container;
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
    }
  }
  
  /**
   * Override getLayoutInfo to include AMOS Pro-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
    // Add AMOS Pro-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default AMOSProOutput;

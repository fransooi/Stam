// STOS mode output window implementation
import BaseOutput from '../../sidewindows/BaseOutput.js';

class STOSOutput extends BaseOutput {
  constructor(parentId,containerId,initialHeight = 200) {
    super('STOSOutput',parentId,containerId,initialHeight);
    this.modeName = 'stos';
  }
  
  /**
   * Create the output UI specific to STOS mode
   * @param {string} containerId - The ID of the container element
   * @returns {Promise<HTMLDivElement>} The rendered output container
   */
  async render(containerId) {
    this.container = await super.render(containerId);
    
    // Add STOS-specific UI elements and styling
    this.addSTOSSpecificStyles();
    
    // Apply STOS-specific styling directly to the container
    this.container.style.fontFamily = 'Courier New, monospace';
    this.container.style.backgroundColor = '#404040';
    this.container.style.color = '#ffffff';
    this.container.style.border = '16px solid #808080';
    this.container.style.padding = '8px';
    this.container.style.boxSizing = 'border-box';
    this.container.style.overflow = 'hidden'; // Prevent scrollbars
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    
    // Always set the content to ensure STOS-specific display
    this.container.innerHTML = `
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
    return this.container;
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
    }
  }
  
  /**
   * Override getLayoutInfo to include STOS-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
    // Add STOS-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default STOSOutput;

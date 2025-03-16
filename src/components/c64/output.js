// C64 mode output window implementation
import BaseOutputSideWindow from '../interface/sidewindows/BaseOutputSideWindow.js';

class C64OutputSideWindow extends BaseOutputSideWindow {
  constructor(initialHeight = 200) {
    super(initialHeight);
    this.modeName = 'c64';
    this.c64Font = "'C64 Pro Mono', 'C64 Pro', 'Courier New', monospace";
    
    // Default content for C64 mode with authentic C64 startup message
    this.outputContent = `
      <div style="padding: 10px; text-align: center; font-family: ${this.c64Font}; color: #a0a0ff;">
        <span style="color: #8080ff;">**** COMMODORE 64 BASIC V2 ****</span><br>
        <span style="color: #8080ff;">64K RAM SYSTEM  38911 BASIC BYTES FREE</span><br><br>
        <span style="color: #a0a0ff;">READY.</span>
      </div>
    `;
  }
  
  /**
   * Create the output UI specific to C64 mode
   */
  createOutputUI() {
    // Call the base implementation first to set up the container
    super.createOutputUI();
    
    // Add C64-specific UI elements and styling
    this.addC64SpecificStyles();
    
    // Apply C64-specific styling directly to the container
    if (this.outputContainer) {
      // Apply direct styling to ensure it overrides any default styles
      this.outputContainer.style.fontFamily = this.c64Font;
      this.outputContainer.style.backgroundColor = '#4040e0'; // C64 blue background
      this.outputContainer.style.color = '#a0a0ff'; // Light blue text
      this.outputContainer.style.border = '3px solid #8080ff';
      this.outputContainer.style.padding = '8px';
      this.outputContainer.classList.add('c64-output');
      
      // Always set the content to ensure C64-specific display
      this.outputContainer.innerHTML = this.outputContent;
    }
  }
  
  /**
   * Add C64-specific styles for the output window
   */
  addC64SpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('c64-output-styles')) {
      const style = document.createElement('style');
      style.id = 'c64-output-styles';
      style.textContent = `
        /* Direct styling for the output window in C64 mode */
        .c64-mode #output-window,
        .c64-mode .output-window,
        .c64-output {
          font-family: ${this.c64Font} !important;
          background-color: #4040e0 !important; /* C64 blue background */
          color: #a0a0ff !important; /* Light blue text */
          border: 3px solid #8080ff !important;
          padding: 8px !important;
        }
        
        .c64-mode .output-window .error {
          color: #ff6060 !important;
          font-weight: bold !important;
        }
        
        .c64-mode .output-window .warning {
          color: #ffff80 !important;
        }
        
        .c64-mode .output-window .success {
          color: #80ff80 !important;
        }
        
        /* C64 cursor blinking effect */
        @keyframes c64-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        .c64-cursor {
          display: inline-block;
          width: 0.6em;
          height: 1em;
          background-color: #a0a0ff;
          animation: c64-cursor-blink 1s infinite;
          vertical-align: middle;
          margin-left: 2px;
        }
      `;
      document.head.appendChild(style);
      console.log('C64 output styles added to document head');
    }
  }
  
  /**
   * Format content specifically for C64 mode
   * @param {string} content - The content to format
   * @returns {string} - The formatted content
   */
  formatContent(content) {
    // Apply any C64-specific formatting to the content
    
    // Example: Convert C64 error codes to more descriptive messages
    content = content.replace(/\?SYNTAX  ERROR/g, '<span class="error">?SYNTAX ERROR</span>');
    content = content.replace(/\?TYPE MISMATCH/g, '<span class="error">?TYPE MISMATCH</span>');
    content = content.replace(/\?DIVISION BY ZERO/g, '<span class="error">?DIVISION BY ZERO</span>');
    
    return content;
  }
  
  /**
   * Override appendContent to apply C64-specific formatting
   * @param {string} content - The content to append
   */
  appendContent(content) {
    const formattedContent = this.formatContent(content);
    super.appendContent(formattedContent);
    
    // Add the blinking cursor at the end of the content
    if (this.outputContainer) {
      const cursor = document.createElement('span');
      cursor.className = 'c64-cursor';
      this.outputContainer.appendChild(cursor);
    }
  }
  
  /**
   * Override getLayoutInfo to include C64-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
    // Add C64-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
}

// Make sure to export the class
export default C64OutputSideWindow;

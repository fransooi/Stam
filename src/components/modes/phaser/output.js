// Phaser mode output window implementation
import BaseOutput from '../../sidewindows/BaseOutput.js';
import { PROJECTMESSAGES } from '../../ProjectManager.js'

class PhaserOutput extends BaseOutput {
  constructor(parentId,containerId,initialHeight = 200) {
    super('PhaserOutput',parentId,containerId,initialHeight);
    this.modeName = 'phaser';
    this.messageMap[PROJECTMESSAGES.SET_PROJECT] = this.handleSetProject;
    this.projectUrl = null;
  }
  
  /**
   * Create the output UI specific to STOS mode
   * @param {string} containerId - The ID of the container element
   * @returns {Promise<HTMLDivElement>} The rendered output container
   */
  async render(containerId) {
    this.container = await super.render(containerId);
    
    // Add Phaser-specific UI elements and styling
    this.addPhaserSpecificStyles();
    
    // Apply direct styling to ensure it overrides any default styles
    this.container.style.fontFamily = 'Consolas, monospace';
    this.container.style.backgroundColor = '#f8f8f8';
    this.container.style.color = '#333';
    this.container.style.border = '3px solid #ddd';
    this.container.style.borderRadius = '4px';
    this.container.style.padding = '8px';
    
    // Create a container for the iframe/project URL display
    this.projectDisplay = document.createElement('div');
    this.projectDisplay.id = 'phaser-project-display';
    this.projectDisplay.style.width = '100%';
    this.projectDisplay.style.height = '100%';
    this.projectDisplay.style.border = 'none';
    this.projectDisplay.style.overflow = 'hidden';
    
    // Append the project display container
    this.container.appendChild(this.projectDisplay);
    
    // If we already have a project URL, display it
    if (this.projectUrl) {
      this.displayProjectUrl(this.projectUrl);
    }
    
    return this.container;
  }
  
  /**
   * Add Phaser-specific styles for the output window
   */
  addPhaserSpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('phaser-output-styles')) {
      const style = document.createElement('style');
      style.id = 'phaser-output-styles';
      style.textContent = `
        /* Direct styling for the output window in Phaser mode */
        .phaser-mode #output-window,
        .phaser-mode .output-window {
          font-family: 'Consolas', monospace !important;
          background-color: #f8f8f8 !important;
          color: #333 !important;
          border: 3px solid #ddd !important;
          border-radius: 4px !important;
          padding: 8px !important;
        }
        
        .phaser-mode .output-window .error {
          color: #e74c3c !important;
          font-weight: bold !important;
        }
        
        .phaser-mode .output-window .warning {
          color: #f39c12 !important;
        }
        
        .phaser-mode .output-window .success {
          color: #2ecc71 !important;
        }
        
        .phaser-mode .output-window .info {
          color: #3498db !important;
        }
        
        /* Phaser console-style log formatting */
        .phaser-mode .output-window .log-entry {
          margin-bottom: 4px;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
        }
        
        .phaser-mode .output-window .log-time {
          color: #999;
          font-size: 0.8em;
          margin-right: 5px;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Override getLayoutInfo to include Phaser-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
    // Add Phaser-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName,
      projectUrl: this.projectUrl
    };
  }
  
  /**
   * Handle the SET_PROJECT message from ProjectManager
   * @param {Object} project - The project object containing URL and other properties
   * @param {string} senderId - ID of the component that sent the message
   */
  handleSetProject(project, senderId) {
    if (project && project.url) {
      this.projectUrl = project.url;
      if (this.projectDisplay) {
        this.displayProjectUrl(this.projectUrl);
      }
      console.log('Phaser output: Project URL set to', this.projectUrl);
    }
  }
  
  /**
   * Display the project URL in an iframe
   * @param {string} url - The URL to display
   */
  displayProjectUrl(url) {
    if (!url) return;
    
    // Clear any existing content
    this.projectDisplay.innerHTML = '';
    
    // Create an iframe to display the project
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    
    // Prevent full-screen capability
    iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'false');
    iframe.setAttribute('webkitallowfullscreen', 'false');
    iframe.setAttribute('mozallowfullscreen', 'false');
    
    // Add the iframe to the display container
    this.projectDisplay.appendChild(iframe);
  }
}

export default PhaserOutput;

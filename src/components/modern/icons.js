// Modern Icon Bar component with Font Awesome icons
import BaseComponent, { MESSAGES } from '../../utils/BaseComponent.js';

class ModernIcons extends BaseComponent {
  constructor(parentId,containerId) {
    super('ModernIcons', parentId, containerId);
    this.buttons = [];
  }

  async init(options) {
    super.init(options);
  }
  async destroy() {
    // Remove any existing styles to prevent duplication
    const existingStyle = document.getElementById('modern-icons-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    super.destroy();
    if (this.parentContainer) {
      this.buttons.forEach(button => {
        this.parentContainer.removeChild(button);
      });
      this.buttons = [];
    } 
  }
  async render(containerId) {
    this.parentContainer=await super.render(containerId);
    this.parentContainer.innerHTML = '';
    this.layoutContainer=this.parentContainer;
    
    // Apply styles directly to the parent container
    this.parentContainer.style.display = 'flex';
    this.parentContainer.style.flexDirection = 'row';
    this.parentContainer.style.alignItems = 'center';
    this.parentContainer.style.padding = '5px';
    this.parentContainer.style.backgroundColor = '#2d2d2d';
    this.parentContainer.style.width = '100%';
    this.parentContainer.style.boxSizing = 'border-box';
    this.parentContainer.style.overflowX = 'auto';
    this.parentContainer.style.minHeight = '60px';
    
    // Create modern mode buttons with Font Awesome icons
    this.addButton('New', ICONACTIONS.NEW_FILE, 'new-button', 'fa-file');
    this.addButton('Open', ICONACTIONS.OPEN_FILE, 'open-button', 'fa-folder-open');
    this.addButton('Save', ICONACTIONS.SAVE_FILE, 'save-button', 'fa-save');
    this.addButton('Run', ICONACTIONS.RUN_PROGRAM, 'run-button', 'fa-play');
    this.addButton('Debug', ICONACTIONS.DEBUG_PROGRAM, 'debug-button', 'fa-bug');
    this.addButton('Share', ICONACTIONS.SHARE_PROGRAM, 'share-button', 'fa-share-alt');
    this.addButton('Help', ICONACTIONS.HELP, 'help-button', 'fa-question-circle');
    
    return this.parentContainer;
  }
  
  addButton(text, action,className, iconClass) {
    const button = document.createElement('button');
    button.className = `icon-button modern-icon-button ${className}`;
    button.title = text; // Keep the title for tooltip on hover
    
    // Apply styles directly to the button
    button.style.backgroundColor = 'transparent';
    button.style.color = '#e0e0e0';
    button.style.border = '1px solid #555';
    button.style.borderRadius = '4px';
    button.style.padding = '10px';
    button.style.margin = '0 4px';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'all 0.2s ease';
    button.style.width = '45px';
    button.style.height = '45px';
    button.style.flexShrink = '0';
    
    // Apply button-specific colors
    switch (className) {
      case 'new-button':
        button.style.color = '#90CAF9';
        break;
      case 'open-button':
        button.style.color = '#FFE082';
        break;
      case 'save-button':
        button.style.color = '#A5D6A7';
        break;
      case 'run-button':
        button.style.color = '#81C784';
        break;
      case 'debug-button':
        button.style.color = '#FFB74D';
        break;
      case 'share-button':
        button.style.color = '#9FA8DA';
        break;
      case 'help-button':
        button.style.color = '#CE93D8';
        break;
    }
    button.action=action;

    // Create icon element
    const icon = document.createElement('i');
    icon.className = `fas ${iconClass}`;
    icon.style.fontSize = '24px'; // Double size icons
    button.appendChild(icon);
    
    // Add hover and active effects with event listeners
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      button.style.borderColor = '#888';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = 'transparent';
      button.style.borderColor = '#555';
    });
    
    button.addEventListener('mousedown', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    button.addEventListener('mouseup', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    // No text span anymore, just the icon    
    button.addEventListener('click', () => this.handleButtonClick(action));
    this.parentContainer.appendChild(button);
    this.buttons.push(button);
  }

  handleButtonClick(action) {
    console.log(`Modern button clicked: ${action}`);
    
    this.sendMessageDown(MESSAGES.ICON_ACTION, {
      action: action
    });    
  }
  
  /**
   * Get information about the Modern icon bar for layout saving
   * @returns {Object} Icon information
   */
  getIconInfo() {
    return {
      mode: 'modern'
    };
  }
}

export default ModernIcons;

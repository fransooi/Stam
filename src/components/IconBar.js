import BaseComponent, { PREFERENCE_MESSAGES } from '../utils/BaseComponent.js';

// IconBar.js - Component for the icon area with buttons
class IconBar extends BaseComponent {
  constructor(containerId, onModeChangeCallback, currentMode = 'modern') {
    // Hello this is Francois
    // Initialize the base component with component name
    super('IconBar');
    
    this.container = document.getElementById(containerId);
    this.onModeChangeCallback = onModeChangeCallback;
    this.currentMode = currentMode;
    this.modeSpecificIcons = null;
    
    // Store this instance on the container element for external access
    if (this.container) {
      this.container._iconBarInstance = this;
    }
  }

  async render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    iconContainer.id = 'mode-specific-icons';
    this.container.appendChild(iconContainer);
    
    // Load and render mode-specific icons
    await this.loadModeSpecificIcons();
  }
  
  async loadModeSpecificIcons() {
    const iconContainer = document.getElementById('mode-specific-icons');
    if (!iconContainer) return;
    
    try {
      // Dynamically import the icons module for the current mode
      let IconsModule;
      
      switch (this.currentMode) {
        case 'modern':
          IconsModule = await import('./modern/icons.js');
          break;
        case 'stos':
          IconsModule = await import('./stos/icons.js');
          break;
        case 'amos1_3':
          IconsModule = await import('./amos1_3/icons.js');
          break;
        case 'amosPro':
          IconsModule = await import('./amosPro/icons.js');
          break;
        case 'c64':
          IconsModule = await import('./c64/icons.js');
          break;
        default:
          IconsModule = await import('./modern/icons.js');
      }
      
      // Create and render the mode-specific icons
      this.modeSpecificIcons = new IconsModule.default(iconContainer, this.handleIconClick.bind(this));
      this.modeSpecificIcons.render();
      
      // Store the icon bar instance on the container element for external access
      this.container._iconBarInstance = this.modeSpecificIcons;
      
      console.log(`Loaded icons for ${this.currentMode} mode`);
      
    } catch (error) {
      console.error(`Error loading icons for mode ${this.currentMode}:`, error);
      iconContainer.innerHTML = `<div class="error-message">Failed to load icons for ${this.currentMode} mode</div>`;
    }
  }
  
  handleIconClick(action) {
    console.log(`Icon action: ${action} in ${this.currentMode} mode`);
    
    // Send the action message down toward the root
    this.sendMessageDown('ICON_ACTION', {
      action: action,
      mode: this.currentMode
    });    
  }
  
  setMode(mode) {
    this.currentMode = mode;
    this.loadModeSpecificIcons();
  }
  
  /**
   * Handle message
   * @param {string} messageType - Type of message
   * @param {Object} messageData - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`IconBar received message: ${messageType}`, messageData);
    
    switch (messageType) {
      case 'MODE_CHANGE':
        // Extract mode from messageData - handle both formats
        // Format 1: { mode: 'modeName' }
        // Format 2: { data: { mode: 'modeName' } }
        const mode = messageData.mode || (messageData.data && messageData.data.mode);
        
        if (mode) {
          console.log(`IconBar: Changing mode to ${mode}`);
          this.setMode(mode);
          return true;
        } else {
          console.error('IconBar: MODE_CHANGE message received but no mode found in data:', messageData);
        }
        break;
        
      case 'SET_MODE':
        const setMode = messageData.mode || (messageData.data && messageData.data.mode);
        if (setMode) {
          this.setMode(setMode);
          return true;
        }
        break;
        
      case PREFERENCE_MESSAGES.LOAD_LAYOUT:
        console.log('IconBar received LOAD_LAYOUT message:', messageData);
        
        // Check if this layout is for this component - handle both formats
        if ((messageData.componentName === this.getComponentID()) || 
            (messageData.data && messageData.data.componentName === this.getComponentID())) {
          
          const layoutInfo = messageData.layoutInfo || (messageData.data && messageData.data.layoutInfo);
          
          if (layoutInfo) {
            console.log(`IconBar: Layout info is for this component, applying layout`);
            this.applyLayout(layoutInfo);
            return true;
          }
        }
        break;
    }
    
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Apply layout information to restore the IconBar state
   * @param {Object} layoutInfo - Layout information for this IconBar
   */
  applyLayout(layoutInfo) {
    console.log('IconBar applying layout:', layoutInfo);
    
    // Set mode if specified
    if (layoutInfo.currentMode) {
      console.log(`IconBar: Setting mode to ${layoutInfo.currentMode} from layout`);
      
      // Update the current mode
      this.currentMode = layoutInfo.currentMode;
      
      // Update body class for mode-specific styling (in case this hasn't been done yet)
      document.body.classList.remove('modern-mode', 'stos-mode', 'amos1_3-mode', 'amosPro-mode', 'c64-mode');
      document.body.classList.add(`${this.currentMode}-mode`);
      
      // Load the mode-specific icons
      this.loadModeSpecificIcons();
    }
    
    // We don't need to apply height as it's defined by the mode-specific IconBars
  }
  
  /**
   * Override getLayoutInfo to include IconBar-specific information
   * @returns {Object} Layout information for this IconBar
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add IconBar-specific information
    layoutInfo.currentMode = this.currentMode;
    
    // We don't need to save height as it's defined by the mode-specific IconBars
    
    // Add mode-specific icon information if available
    if (this.modeSpecificIcons && typeof this.modeSpecificIcons.getIconInfo === 'function') {
      layoutInfo.icons = this.modeSpecificIcons.getIconInfo();
    } else {
      // If no getIconInfo method is available, just store the mode
      layoutInfo.icons = { mode: this.currentMode };
    }
    
    return layoutInfo;
  }
}

export default IconBar;

import BaseComponent, { PREFERENCE_MESSAGES } from '../utils/BaseComponent.js';
import PopupMenu from './PopupMenu.js';

class MenuBar extends BaseComponent {
  constructor(containerId, onModeChangeCallback, currentMode = 'modern') {
    // Initialize the base component with component name
    super('MenuBar');
    
    this.container = document.getElementById(containerId);
    this.activeMenu = null;
    this.menuStructure = this.getDefaultMenuStructure();
    this.onModeChangeCallback = onModeChangeCallback; // Keep for backward compatibility
    this.currentMode = currentMode;
    this.menuItems = {}; // Store references to menu title elements
    this.activePopupMenu = null; // Reference to the active popup menu
    
    // Add event listener to close menus when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create menu items container (left side)
    const menuItemsContainer = document.createElement('div');
    menuItemsContainer.className = 'menu-items-container';
    
    // Create menu items
    Object.keys(this.menuStructure).forEach(menuName => {
      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';
      
      const menuTitle = document.createElement('div');
      menuTitle.className = 'menu-title';
      menuTitle.textContent = menuName;
      menuTitle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu(menuName, menuItem);
      });
      
      menuItem.appendChild(menuTitle);
      menuItemsContainer.appendChild(menuItem);
      
      // Store reference to the menu title element
      this.menuItems[menuName] = menuItem;
    });
    
    // Add menu items container to the main container
    this.container.appendChild(menuItemsContainer);
    
    // Create mode selector container (right side)
    const modeSelectorContainer = document.createElement('div');
    modeSelectorContainer.className = 'mode-selector-container';
    
    // Create and add mode selector
    this.createModeSelector(modeSelectorContainer);
    
    // Add mode selector container to the main container
    this.container.appendChild(modeSelectorContainer);
  }
  
  createModeSelector(container) {
    const modeSelector = document.createElement('select');
    modeSelector.id = 'mode-selector';
    modeSelector.className = 'mode-selector';
    
    const modes = [
      { value: 'modern', text: 'Modern' },
      { value: 'stos', text: 'STOS Basic' },
      { value: 'amos1_3', text: 'AMOS 1.3' },
      { value: 'amosPro', text: 'AMOS Pro' },
      { value: 'c64', text: 'Commodore 64' }
    ];
    
    modes.forEach(mode => {
      const option = document.createElement('option');
      option.value = mode.value;
      option.textContent = mode.text;
      if (mode.value === this.currentMode) {
        option.selected = true;
      }
      modeSelector.appendChild(option);
    });
    
    modeSelector.addEventListener('change', (e) => {
      const newMode = e.target.value;
      
      // Send mode change message DOWN toward the root (PCOSApp)
      this.sendMessageDown('MODE_CHANGE', {
        mode: newMode
      });
      
      // Keep the callback for backward compatibility
      if (this.onModeChangeCallback) {
        this.onModeChangeCallback(newMode);
      }
    });
    
    container.appendChild(modeSelector);
  }
  
  getDefaultMenuStructure() {
    return {
      'File': ['New', 'Open', 'Save', 'Save As', 'Exit'],
      'Edit': ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Find', 'Replace', 'Preferences'],
      'View': ['Zoom In', 'Zoom Out', 'Reset Zoom', 'Toggle Output'],
      'Run': ['Run', 'Debug', 'Stop', 'Build'],
      'Help': ['Documentation', 'About', 'Debug1', 'Debug2']
    };
  }
  
  toggleMenu(menuName, menuItem) {
    // Close the active popup menu if it exists
    if (this.activePopupMenu) {
      this.activePopupMenu.hide();
      this.activePopupMenu = null;
      
      // If this was the active menu, it's now closed, so we're done
      if (this.activeMenu === menuName) {
        this.activeMenu = null;
        return;
      }
    }
    
    // Set this as the active menu
    this.activeMenu = menuName;
    
    // Get the menu items
    const menuItems = this.menuStructure[menuName];
    
    // Get the position for the popup menu
    const rect = menuItem.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.bottom
    };
    
    // Create and show the popup menu
    this.activePopupMenu = new PopupMenu({
      items: menuItems,
      position: position,
      menuContext: menuName,
      parentId: this.getComponentID()
    });
    
    this.activePopupMenu.show();
  }
  
  closeAllMenus() {
    if (this.activePopupMenu) {
      this.activePopupMenu.hide();
      this.activePopupMenu = null;
    }
    this.activeMenu = null;
  }
  
  handleDocumentClick() {
    this.closeAllMenus();
  }
  
  handleMenuAction(menuName, option) {
    console.log(`Menu action: ${menuName} > ${option}`);
    
    // Create the action string (e.g., "File:New")
    const action = `${menuName}:${option}`;
    
    // Send the menu action message
    this.sendMessageDown('MENU_ACTION', {
      action: option.toLowerCase().replace(/\s+/g, ''),
      menuName: menuName,
      option: option
    });
    
    return true;
  }
  
  setMenuStructure(structure) {
    this.menuStructure = structure;
    this.render();
  }
  
  addMenuItem(menuName, option) {
    if (!this.menuStructure[menuName]) {
      this.menuStructure[menuName] = [];
    }
    
    if (!this.menuStructure[menuName].includes(option)) {
      this.menuStructure[menuName].push(option);
      this.render();
    }
  }
  
  removeMenuItem(menuName, option) {
    if (this.menuStructure[menuName]) {
      const index = this.menuStructure[menuName].indexOf(option);
      if (index !== -1) {
        this.menuStructure[menuName].splice(index, 1);
        this.render();
      }
    }
  }
  
  setMode(mode) {
    this.currentMode = mode;
    const modeSelector = document.getElementById('mode-selector');
    if (modeSelector) {
      modeSelector.value = mode;
    }
  }
  
  /**
   * Handle message
   * @param {string} messageType - Type of message
   * @param {Object} messageData - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`MenuBar received message: ${messageType}`, messageData);
    
    switch (messageType) {
      case 'SET_MODE':
        this.setMode(messageData.data.mode);
        return true;
        
      case 'LOAD_LAYOUT':
        // Check if this layout is for us
        if (messageData.data && 
            (messageData.data.componentName === 'MenuBar' || 
             messageData.data.componentName === this.componentName)) {
          this.applyLayout(messageData.data.layoutInfo);
          return true;
        }
        break;
        
      case 'MODE_CHANGE':
        if (messageData.data && messageData.data.mode) {
          this.setMode(messageData.data.mode);
          return true;
        }
        break;
        
      case 'UPDATE_MENU_STRUCTURE':
        if (messageData.data && messageData.data.structure) {
          this.setMenuStructure(messageData.data.structure);
          return true;
        }
        break;
        
      case 'ADD_MENU_ITEM':
        if (messageData.data && messageData.data.menuName && messageData.data.option) {
          this.addMenuItem(messageData.data.menuName, messageData.data.option);
          return true;
        }
        break;
        
      case 'REMOVE_MENU_ITEM':
        if (messageData.data && messageData.data.menuName && messageData.data.option) {
          this.removeMenuItem(messageData.data.menuName, messageData.data.option);
          return true;
        }
        break;
    }
    
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Apply layout information to restore the MenuBar state
   * @param {Object} layoutInfo - Layout information for this MenuBar
   */
  applyLayout(layoutInfo) {
    console.log('MenuBar applying layout:', layoutInfo);
    
    // Set mode if specified
    if (layoutInfo.currentMode) {
      this.setMode(layoutInfo.currentMode);
    }
    
    // Set menu structure if specified
    if (layoutInfo.menuStructure) {
      this.menuStructure = layoutInfo.menuStructure;
      this.render();
    }
  }
  
  /**
   * Override getLayoutInfo to include MenuBar-specific information
   * @returns {Object} Layout information for this MenuBar
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add MenuBar-specific information
    layoutInfo.currentMode = this.currentMode;
    layoutInfo.menuStructure = this.menuStructure;
    
    // Get height information if available
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      layoutInfo.height = rect.height;
    }
    
    return layoutInfo;
  }
}

export default MenuBar;

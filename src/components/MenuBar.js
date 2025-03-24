import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js';
import PopupMenu from './PopupMenu.js';

class MenuBar extends BaseComponent {
  constructor(parentId, containerId) {
    // Initialize the base component with component name
    super('MenuBar', parentId, containerId);
    
    this.activeMenu = null;
    this.menuStructure = this.getDefaultMenuStructure();
    this.menuItems = {}; // Store references to menu title elements
    this.activePopupMenu = null; // Reference to the active popup menu
    this.messageMap[MESSAGES.MODE_CHANGE] = this.handleModeChange;
  }

  async init(options={}) {
    super.init(options);   
    if(options.mode) {
      this.setMode(options.mode);
    }
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  async destroy() {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
    if (this.menuItemsContainer) {
      this.parentContainer.removeChild(this.menuItemsContainer);
      this.menuItemsContainer=null;
    }
    if (this.modeSelectorContainer) {
      this.parentContainer.removeChild(this.modeSelectorContainer);
      this.modeSelectorContainer=null;
    }
    super.destroy();
  }

  async render(containerId) {
    this.parentContainer=await super.render(containerId);
    this.parentContainer.innerHTML = '';
  
    // Create menu items container (left side)
    this.menuItemsContainer = document.createElement('div');
    this.menuItemsContainer.className = 'menu-items-container';
    
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
      this.menuItemsContainer.appendChild(menuItem);
      
      // Store reference to the menu title element
      this.menuItems[menuName] = menuItem;
    });
    
    // Add menu items container to the main container
    this.parentContainer.appendChild(this.menuItemsContainer);

    // Create mode selector container (right side)
    this.modeSelectorContainer = document.createElement('div');
    this.modeSelectorContainer.className = 'mode-selector-container';
    
    // Create and add mode selector
    this.createModeSelector(this.modeSelectorContainer);
    
    // Add mode selector container to the main container
    this.parentContainer.appendChild(this.modeSelectorContainer);

    return this.parentContainer;
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
      this.sendMessageDown('MODE_CHANGED', {
        mode: newMode
      });
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
    this.activePopupMenu = new PopupMenu(this.getComponentID(),{
      items: menuItems,
      position: position,
      menuContext: menuName
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
    this.sendMessageDown(MESSAGES.MENU_ACTION, {
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
   * Handle mode change message
   * @param {Object} data - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  async handleModeChange(data, sender) {
    if (data.mode) {
      this.setMode(data.mode);
      return true;
    }
    return false;
  }
  
  /**
   * Apply layout information to restore the MenuBar state
   * @param {Object} layoutInfo - Layout information for this MenuBar
   */
  async applyLayout(layoutInfo) {
    await super.applyLayout(layoutInfo);
  }
  
  /**
   * Override getLayoutInfo to include MenuBar-specific information
   * @returns {Object} Layout information for this MenuBar
   */
  async getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = await super.getLayoutInfo();
    
    // Add MenuBar-specific information
    layoutInfo.currentMode = this.currentMode;
    layoutInfo.menuStructure = this.menuStructure;
    
    // Get height information if available
    if (this.parentContainer) {
      const rect = this.parentContainer.getBoundingClientRect();
      layoutInfo.height = rect.height;
    }
    
    return layoutInfo;
  }
}

export default MenuBar;

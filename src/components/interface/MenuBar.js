// MenuBar.js - Default component for the application menu bar

class MenuBar {
  constructor(containerId, onModeChangeCallback, currentMode = 'modern') {
    this.container = document.getElementById(containerId);
    this.activeMenu = null;
    this.menuStructure = this.getDefaultMenuStructure();
    this.onModeChangeCallback = onModeChangeCallback;
    this.currentMode = currentMode;
    
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
      
      const menuDropdown = document.createElement('div');
      menuDropdown.className = 'menu-dropdown';
      menuDropdown.style.display = 'none';
      
      // Add menu options
      this.menuStructure[menuName].forEach(option => {
        const menuOption = document.createElement('div');
        menuOption.className = 'menu-option';
        menuOption.textContent = option;
        menuOption.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleMenuAction(menuName, option);
          this.closeAllMenus();
        });
        
        menuDropdown.appendChild(menuOption);
      });
      
      menuItem.appendChild(menuTitle);
      menuItem.appendChild(menuDropdown);
      menuItemsContainer.appendChild(menuItem);
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
      if (this.onModeChangeCallback) {
        this.onModeChangeCallback(newMode);
      }
    });
    
    container.appendChild(modeSelector);
  }
  
  getDefaultMenuStructure() {
    return {
      'File': ['New', 'Open', 'Save', 'Save As', 'Exit'],
      'Edit': ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Find', 'Replace'],
      'View': ['Zoom In', 'Zoom Out', 'Reset Zoom', 'Toggle Output'],
      'Run': ['Run', 'Debug', 'Stop', 'Build'],
      'Help': ['Documentation', 'About']
    };
  }
  
  toggleMenu(menuName, menuItem) {
    const dropdown = menuItem.querySelector('.menu-dropdown');
    
    // Close all other menus
    this.closeAllMenus();
    
    // If this was the active menu, it's now closed, so we're done
    if (this.activeMenu === menuName) {
      this.activeMenu = null;
      return;
    }
    
    // Otherwise, open this menu
    if (dropdown) {
      dropdown.style.display = 'block';
      this.activeMenu = menuName;
    }
  }
  
  closeAllMenus() {
    const dropdowns = this.container.querySelectorAll('.menu-dropdown');
    dropdowns.forEach(dropdown => {
      dropdown.style.display = 'none';
    });
    this.activeMenu = null;
  }
  
  handleDocumentClick() {
    this.closeAllMenus();
  }
  
  handleMenuAction(menuName, option) {
    console.log(`Menu action: ${menuName} > ${option}`);
    
    // Handle menu actions
    switch (`${menuName}:${option}`) {
      case 'File:New':
        // Handle new file
        break;
      case 'File:Open':
        // Handle open file
        break;
      case 'File:Save':
        // Handle save file
        break;
      case 'Run:Run':
        // Handle run code
        break;
      case 'Run:Debug':
        // Handle debug code
        break;
      case 'Run:Stop':
        // Handle stop execution
        break;
      default:
        console.log(`Action not implemented: ${menuName} > ${option}`);
    }
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
}

export default MenuBar;

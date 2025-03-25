// STOS Basic Icon Bar component - Inspired by the original STOS Basic from 1987
import BaseComponent from '../../utils/BaseComponent.js';

class STOSIcons extends BaseComponent{
  constructor(parentId,containerId) {
    super('STOSIcons', parentId, containerId);
    this.shiftPressed = false;
    
    // Define function keys for both states
    this.functionKeys = {
      normal: [
        { key: 'F1', action: 'Last Key' },
        { key: 'F2', action: 'List' },
        { key: 'F3', action: 'Listbank' },
        { key: 'F4', action: 'Load' },
        { key: 'F5', action: 'Save' },
        { key: 'F6', action: 'Run' },
        { key: 'F7', action: 'Dir' },
        { key: 'F8', action: 'Dir$=Dir$+"\\\"' },
        { key: 'F9', action: 'Previous' },
        { key: 'F10', action: 'Help' }
      ],
      shift: [
        { key: 'F10', action: 'Off' },
        { key: 'F11', action: 'Full' },
        { key: 'F12', action: 'Multi2' },
        { key: 'F13', action: 'Multi3' },
        { key: 'F14', action: 'Multi4' },
        { key: 'F15', action: 'Mode 0' },
        { key: 'F16', action: 'Mode 1' },
        { key: 'F17', action: 'Default' },
        { key: 'F18', action: 'Env' },
        { key: 'F19', action: 'Key List' }
      ]
    };    
  }
  async init(options) {
    super.init(options);
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  async destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Remove any styles that were added
    const existingStyle = document.getElementById('stos-icons-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    super.destroy();
  }
  
  /**
   * Add a function key button to the specified container
   * @param {string} key - The key label (e.g., 'F1')
   * @param {string} action - The action label (e.g., 'Help')
   * @param {HTMLElement} container - The container to add the button to
   */
  addFunctionKey(key, action, container) {
    const button = document.createElement('button');
    button.className = 'stos-function-key';
    button.setAttribute('data-key', key);
    button.textContent = `${key}: ${action}`;
    
    // Apply styles directly to the button
    button.style.flex = '1';
    button.style.height = '30px';
    button.style.backgroundColor = '#0000aa';
    button.style.color = '#ffffff';
    button.style.border = '1px solid #ffffff';
    button.style.fontFamily = 'monospace';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.cursor = 'pointer';
    button.style.padding = '0 5px';
    button.style.margin = '2px';
    button.style.boxSizing = 'border-box';
    button.style.textAlign = 'center';
    button.style.whiteSpace = 'nowrap';
    button.style.overflow = 'hidden';
    button.style.textOverflow = 'ellipsis';
    
    // Special styling for Run button (F6)
    if (key === 'F6') {
      button.style.backgroundColor = '#00aa00';
    }
    
    button.addEventListener('click', () => this.handleFunctionKeyClick(key, action));
    container.appendChild(button);
  }
  
  /**
   * Handle function key button clicks
   * @param {string} key - The key that was clicked
   * @param {string} action - The action associated with the key
   */
  handleFunctionKeyClick(key, action) {
    console.log(`STOS Function Key clicked: ${key} - ${action}`);
    
    // Call the callback if provided
    if (typeof this.onIconClickCallback === 'function') {
      this.onIconClickCallback(action.toLowerCase());
    }
  }
  
  async render(containerId) {
    this.parentContainer = await super.render(containerId);
    this.parentContainer.innerHTML = '';
    this.layoutContainer = this.parentContainer;

    // Create main container for STOS function keys
    this.stosIconsContainer = document.createElement('div');
    this.stosIconsContainer.className = 'stos-icons-container';
    
    // Apply styles directly to the container
    this.stosIconsContainer.style.display = 'flex';
    this.stosIconsContainer.style.flexDirection = 'column';
    this.stosIconsContainer.style.width = '100%';
    this.stosIconsContainer.style.backgroundColor = '#0000aa';
    this.stosIconsContainer.style.color = '#ffffff';
    this.stosIconsContainer.style.fontFamily = 'monospace';
    this.stosIconsContainer.style.padding = '5px';
    this.stosIconsContainer.style.boxSizing = 'border-box';
    
    // Create first row of function keys (F1-F5 or F10-F14)
    const firstRow = document.createElement('div');
    firstRow.className = 'stos-function-row';
    
    // Apply styles directly to the first row
    firstRow.style.display = 'flex';
    firstRow.style.width = '100%';
    firstRow.style.marginBottom = '4px';
    
    // Create second row of function keys (F6-F10 or F15-F19)
    const secondRow = document.createElement('div');
    secondRow.className = 'stos-function-row';
    
    // Apply styles directly to the second row
    secondRow.style.display = 'flex';
    secondRow.style.width = '100%';
    
    // Get the current set of keys based on shift state
    const currentKeys = this.shiftPressed ? this.functionKeys.shift : this.functionKeys.normal;
    
    // Add first row (first 5 keys)
    for (let i = 0; i < 5; i++) {
      this.addFunctionKey(currentKeys[i].key, currentKeys[i].action, firstRow);
    }
    
    // Add second row (next 5 keys)
    for (let i = 5; i < 10; i++) {
      this.addFunctionKey(currentKeys[i].key, currentKeys[i].action, secondRow);
    }
    
    // Add rows to container
    this.stosIconsContainer.appendChild(firstRow);
    this.stosIconsContainer.appendChild(secondRow);
    
    // Add container to main container
    this.parentContainer.appendChild(this.stosIconsContainer);
    
    return this.stosIconsContainer;
  }
  
  /**
   * Update the function keys when shift state changes
   */
  updateFunctionKeys() {
    // Clear existing function keys
    this.parentContainer.innerHTML = '';
    
    // Re-render the icon bar
    this.render(this.containerId);
  }
  
  handleKeyDown(event) {
    if (event.key === 'Shift' && !this.shiftPressed) {
      this.shiftPressed = true;
      this.updateFunctionKeys();
    }
  }
  
  handleKeyUp(event) {
    if (event.key === 'Shift' && this.shiftPressed) {
      this.shiftPressed = false;
      this.updateFunctionKeys();
    }
  }
  
  /**
   * Get information about the STOS icon bar for layout saving
   * @returns {Object} Icon information
   */
  getIconInfo() {
    return {
      mode: 'stos',
      shiftPressed: this.shiftPressed
    };
  }
}

export default STOSIcons;

/**
 * PopupMenu.js - Reusable popup menu component for menus and context menus
 * 
 * This component extends BaseComponent to integrate with the messaging system.
 * It creates a floating menu that can be positioned anywhere on the screen and
 * supports nested submenus.
 */

import BaseComponent from '../utils/BaseComponent.js';

// Track active menus
const activeMenus = {
  main: null,
  sub: []
};

export default class PopupMenu extends BaseComponent {
  /**
   * Create a new popup menu
   * 
   * @param {Object} options - Configuration options
   * @param {Array} options.items - Menu items to display
   * @param {HTMLElement} options.parent - Parent element (for positioning)
   * @param {Object} options.position - Position coordinates {x, y} (optional)
   * @param {string} options.className - Additional CSS class name (optional)
   * @param {string} options.level - Menu level ('main' or 'sub') (optional)
   * @param {string} options.menuContext - Context identifier for the menu (e.g., 'File', 'Edit') (optional)
   * @param {string} options.parentId - Parent component ID (optional)
   */
  constructor(options = {}) {
    // Initialize the base component with component name and parent ID
    super('PopupMenu', options.parentId || null);
    
    this.items = options.items || [];
    this.parent = options.parent || document.body;
    this.position = options.position || { x: 0, y: 0 };
    this.className = options.className || '';
    this.element = null;
    this.isVisible = false;
    this.level = options.level || 'main'; // 'main' or 'sub'
    this.menuContext = options.menuContext || null;
    this.submenus = [];
    
    // Bind methods
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    
    // Create the menu element
    this.create();
    
    // Add global event listener to close menu when clicking outside
    document.addEventListener('click', this.handleDocumentClick);
    
    console.log(`PopupMenu created with ID: ${this.getComponentID()}, context: ${this.menuContext}`);
  }
  
  /**
   * Create the menu element
   */
  create() {
    // Create menu container
    this.element = document.createElement('div');
    this.element.className = `popup-menu ${this.className}`;
    this.element.style.position = 'absolute';
    this.element.style.display = 'none';
    this.element.style.zIndex = this.level === 'main' ? '1000' : '1001';
    this.element.dataset.componentId = this.getComponentID();
    
    // Add menu items
    this.renderItems();
    
    // Add to DOM
    document.body.appendChild(this.element);
    
    // Add default styles if not already present
    this.addStyles();
  }
  
  /**
   * Add default styles for popup menus
   */
  addStyles() {
    if (document.getElementById('popup-menu-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'popup-menu-styles';
    style.textContent = `
      .popup-menu {
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        min-width: 150px;
        overflow: hidden;
        padding: 4px 0;
      }
      
      .popup-menu-item {
        color: #e0e0e0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        transition: background-color 0.2s;
        user-select: none;
      }
      
      .popup-menu-item:hover {
        background-color: #3a3a3a;
      }
      
      .popup-menu-separator {
        background-color: #444;
        height: 1px;
        margin: 4px 0;
      }
      
      .popup-menu-submenu-indicator {
        color: #888;
        margin-left: 8px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Render menu items
   */
  renderItems() {
    // Clear existing items
    this.element.innerHTML = '';
    
    // Add items
    this.items.forEach((item, index) => {
      if (item === '-') {
        // Separator
        const separator = document.createElement('div');
        separator.className = 'popup-menu-separator';
        this.element.appendChild(separator);
      } else if (typeof item === 'object' && item.submenu) {
        // Menu item with submenu
        const menuItem = document.createElement('div');
        menuItem.className = 'popup-menu-item';
        
        const itemText = document.createElement('span');
        itemText.textContent = item.label;
        menuItem.appendChild(itemText);
        
        // Add submenu indicator
        const submenuIndicator = document.createElement('span');
        submenuIndicator.className = 'popup-menu-submenu-indicator';
        submenuIndicator.innerHTML = '&#9654;'; // Right-pointing triangle
        menuItem.appendChild(submenuIndicator);
        
        // Handle submenu
        menuItem.addEventListener('mouseenter', (e) => {
          this.showSubmenu(item.submenu, menuItem, item.label);
        });
        
        // Add to menu
        this.element.appendChild(menuItem);
      } else {
        // Simple menu item
        const menuItem = document.createElement('div');
        menuItem.className = 'popup-menu-item';
        menuItem.textContent = typeof item === 'object' ? item.label : item;
        
        // Add click handler
        menuItem.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleItemClick(item, index);
        });
        
        // Add to menu
        this.element.appendChild(menuItem);
      }
    });
  }
  
  /**
   * Show a submenu
   * 
   * @param {Array} submenuItems - Items for the submenu
   * @param {HTMLElement} parentItem - Parent menu item element
   * @param {string} submenuContext - Context identifier for the submenu
   */
  showSubmenu(submenuItems, parentItem, submenuContext) {
    // Close any existing submenus
    this.closeSubmenus();
    
    // Create full context path
    const fullContext = this.menuContext 
      ? `${this.menuContext}:${submenuContext}` 
      : submenuContext;
    
    // Create submenu
    const submenu = new PopupMenu({
      items: submenuItems,
      className: 'popup-submenu',
      level: 'sub',
      menuContext: fullContext,
      parentId: this.getComponentID()
    });
    
    // Store as active submenu
    this.submenus.push(submenu);
    activeMenus.sub.push(submenu);
    
    // Position submenu next to parent item
    const parentRect = parentItem.getBoundingClientRect();
    submenu.show({
      x: parentRect.right,
      y: parentRect.top
    });
  }
  
  /**
   * Close all submenus
   */
  closeSubmenus() {
    // Close all submenus
    this.submenus.forEach(submenu => {
      submenu.hide();
    });
    
    // Clear submenu arrays
    this.submenus = [];
    activeMenus.sub = [];
  }
  
  /**
   * Handle menu item click
   * 
   * @param {string|Object} item - The menu item that was clicked
   * @param {number} index - Index of the item in the items array
   */
  handleItemClick(item, index) {
    // Extract the item value
    const itemValue = typeof item === 'object' ? item.value || item.label : item;
    
    // Create action path from context and item
    let action = itemValue;
    if (this.menuContext) {
      action = `${this.menuContext}:${itemValue}`;
    }
    
    console.log(`Menu item clicked: ${action}`);
    
    // Send the menu action message DOWN toward the root (PCOSApp)
    this.sendMessageDown('MENU_ACTION', {
      menuName: this.menuContext,
      option: itemValue,
      action: action
    });
    
    // Hide the menu
    this.hide();
  }
  
  /**
   * Show the menu at the specified position
   * 
   * @param {Object} position - Position coordinates {x, y}
   */
  show(position = null) {
    // Close any existing menu of the same level
    if (this.level === 'main' && activeMenus.main && activeMenus.main !== this) {
      activeMenus.main.hide();
    }
    
    // Store as active menu
    if (this.level === 'main') {
      activeMenus.main = this;
    }
    
    if (position) {
      this.position = position;
    }
    
    // Set position
    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
    
    // Show menu
    this.element.style.display = 'block';
    this.isVisible = true;
    
    // Ensure menu is fully visible in viewport
    this.adjustPosition();
  }
  
  /**
   * Adjust the menu position to ensure it's fully visible in the viewport
   */
  adjustPosition() {
    const menuRect = this.element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position if menu extends beyond right edge
    if (menuRect.right > viewportWidth) {
      const overflowX = menuRect.right - viewportWidth;
      this.element.style.left = `${this.position.x - overflowX - 10}px`;
    }
    
    // Adjust vertical position if menu extends beyond bottom edge
    if (menuRect.bottom > viewportHeight) {
      const overflowY = menuRect.bottom - viewportHeight;
      this.element.style.top = `${this.position.y - overflowY - 10}px`;
    }
  }
  
  /**
   * Hide the menu
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
    this.isVisible = false;
    
    // Remove from active menus
    if (this.level === 'main' && activeMenus.main === this) {
      activeMenus.main = null;
    }
    
    // Close any submenus
    this.closeSubmenus();
    
    // If this is a submenu, don't destroy it immediately
    // to prevent issues with rapid mouse movements
    if (this.level === 'sub') {
      setTimeout(() => {
        if (!this.isVisible) {
          this.destroy();
        }
      }, 100);
    }
  }
  
  /**
   * Handle document click (to close menu when clicking outside)
   * 
   * @param {Event} event - Click event
   */
  handleDocumentClick(event) {
    if (this.isVisible && this.element && !this.element.contains(event.target)) {
      this.hide();
      
      // If this is a main menu, destroy it
      if (this.level === 'main') {
        this.destroy();
      }
    }
  }
  
  /**
   * Update menu items
   * 
   * @param {Array} items - New menu items
   */
  updateItems(items) {
    this.items = items;
    this.renderItems();
  }
  
  /**
   * Override the handleMessage method from BaseComponent
   * 
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`PopupMenu received message: ${messageType}`, messageData);
    
    switch (messageType) {
      case 'HIDE':
        this.hide();
        return true;
        
      case 'SHOW':
        if (messageData.data && messageData.data.position) {
          this.show(messageData.data.position);
        } else {
          this.show();
        }
        return true;
        
      case 'UPDATE_ITEMS':
        if (messageData.data && Array.isArray(messageData.data.items)) {
          this.updateItems(messageData.data.items);
        }
        return true;
    }
    
    return false; // Message not handled
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listener
    document.removeEventListener('click', this.handleDocumentClick);
    
    // Close any submenus
    this.closeSubmenus();
    
    // Remove element from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Unregister from component tree (using BaseComponent's method)
    this.unregister();
    
    console.log(`PopupMenu destroyed: ${this.getComponentID()}`);
  }
}

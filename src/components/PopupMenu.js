/**
 * PopupMenu.js - Reusable popup menu component for menus and context menus
 * 
 * This component extends BaseComponent to integrate with the messaging system.
 * It creates a floating menu that can be positioned anywhere on the screen and
 * supports nested submenus.
 */

import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js';

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
   */
  constructor(parentId,options = {}) {
    // Initialize the base component with component name and parent ID
    super('PopupMenu', parentId);
    
    this.items = options.items || [];
    this.position = options.position || { x: 0, y: 0 };
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
    
    // Add items using recursive approach
    this.items.forEach((item, index) => {
      this.element.appendChild(this.createMenuItem(item, index));
    });
  }
  
  /**
   * Create a menu item element recursively
   * 
   * @param {Object|string} item - Menu item to create
   * @param {number} index - Index of the item in the items array
   * @returns {HTMLElement} - Created menu item element
   */
  createMenuItem(item, index) {
    // Handle separator
    if (item === '-') {
      const separator = document.createElement('div');
      separator.className = 'popup-menu-separator';
      return separator;
    }
    
    // Handle menu item with submenu (new recursive structure)
    if (typeof item === 'object' && item.items && item.items.length > 0) {
      return this.createSubmenuItem(item, item.items, item.name);
    }
    
    // Handle legacy format for menu item with submenu
    if (typeof item === 'object' && item.submenu) {
      return this.createSubmenuItem(item, item.submenu, item.label);
    }
    
    // Handle simple menu item
    const menuItem = document.createElement('div');
    menuItem.className = 'popup-menu-item';
    
    // Support both old and new menu item formats
    const itemText = typeof item === 'object' 
      ? (item.name || item.label || 'Unnamed Item')
      : item;
    
    menuItem.textContent = itemText;
    
    // Add click handler
    menuItem.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleItemClick(item, index);
    });
    
    return menuItem;
  }
  
  /**
   * Create a submenu item element
   * 
   * @param {Object} item - Menu item with submenu
   * @param {Array} submenuItems - Items for the submenu
   * @param {string} label - Label for the menu item
   * @returns {HTMLElement} - Created submenu item element
   */
  createSubmenuItem(item, submenuItems, label) {
    const menuItem = document.createElement('div');
    menuItem.className = 'popup-menu-item';
    
    const itemText = document.createElement('span');
    itemText.textContent = label;
    menuItem.appendChild(itemText);
    
    // Add submenu indicator
    const submenuIndicator = document.createElement('span');
    submenuIndicator.className = 'popup-menu-submenu-indicator';
    submenuIndicator.innerHTML = '&#9654;'; // Right-pointing triangle
    menuItem.appendChild(submenuIndicator);
    
    // Handle submenu
    menuItem.addEventListener('mouseenter', (e) => {
      this.showSubmenu(submenuItems, menuItem, label);
    });
    
    return menuItem;
  }
  
  /**
   * Show a submenu
   * 
   * @param {Array} submenuItems - Items for the submenu
   * @param {HTMLElement} parentItem - Parent menu item element
   * @param {string} submenuContext - Context identifier for the submenu
   */
  showSubmenu(submenuItems, parentItem, submenuContext) {
    // Don't close all submenus - only close direct children of this menu item
    // This allows parent menus to stay open when showing nested submenus
    if (this.submenus.length > 0) {
      this.submenus.forEach(submenu => submenu.hide());
      this.submenus = [];
    }
    
    // Create full context path
    const fullContext = this.menuContext 
      ? `${this.menuContext}:${submenuContext}` 
      : submenuContext;
    
    // Create submenu
    const submenu = new PopupMenu(this.getComponentID(),{
      items: submenuItems,
      level: 'sub',
      menuContext: fullContext
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
    // Check if this is a submenu item (has items property)
    if (typeof item === 'object' && item.items && item.items.length > 0) {
      // This is a submenu item, don't handle click
      return;
    }
    
    // Extract the item value and command
    var command = item.command;
    var name = item.name || '';
    this.broadcast(command, {
      menuName: this.menuContext,
      action: command,
      name: name
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
    // Check if click is outside this menu and all its submenus
    let isClickInsideSubmenu = false;
    
    // Check if click is inside any of the submenus
    for (const submenu of this.submenus) {
      if (submenu.element && submenu.element.contains(event.target)) {
        isClickInsideSubmenu = true;
        break;
      }
    }
    
    // Only hide if click is outside this menu AND outside all its submenus
    if (this.isVisible && this.element && 
        !this.element.contains(event.target) && 
        !isClickInsideSubmenu) {
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
  async handleMessage(messageType, messageData, sender) {
    console.log(`PopupMenu received message: ${messageType}`, messageData);
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    super.destroy();
    
    // Remove event listener
    document.removeEventListener('click', this.handleDocumentClick);
    
    // Close any submenus
    this.closeSubmenus();
    
    // Remove element from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    console.log(`PopupMenu destroyed: ${this.getComponentID()}`);
  }
}

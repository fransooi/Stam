// SideBar.js - Component for the left sidebar that manages multiple SideWindow instances
import ProjectSideWindow from './interface/sidewindows/ProjectSideWindow.js';
import OutputSideWindow from './interface/sidewindows/OutputSideWindow.js';
import TVSideWindow from './interface/sidewindows/TVSideWindow.js';
import SocketSideWindow from './interface/sidewindows/SocketSideWindow.js';
import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js';
import messageBus from '../utils/MessageBus.mjs';

class SideBar extends BaseComponent {
  constructor(parentId,containerId) {
    // Initialize the base component with component name
    super('SideBar',parentId,containerId);
    
    this.windows = [];
    this.separators = [];
    this.isDragging = false;
    this.activeSeparatorIndex = -1;
    this.windowRegistry = new Map(); // Registry to look up window objects by DOM element
    
    // Set up global event listeners for resize functionality
    this.setupGlobalEvents();
    
    // Listen for window close events
    document.addEventListener('sideWindowClosed', (event) => {
      this.handleWindowClosed(event.detail.id);
    });
    
    // Register command handler for layout changes
    this.registerCommandHandler('SIDEBAR_LAYOUT_CHANGED', this.handleLayoutChanged.bind(this));
  }

  /**
   * Render the sidebar with default windows
   */
  render() {
    // Clear the container
    this.container=document.getElementById(this.containerId);
    this.container.innerHTML = '';
    
    // Add default windows if none exist
    if (this.windows.length === 0) {
      // Order: TV, Socket, Output, Project (from top to bottom)
      this.addWindow(new ProjectSideWindow(this.componentId,this.containerId, 300));
      this.addWindow(new OutputSideWindow(this.componentId,this.containerId, 300));
      this.addWindow(new TVSideWindow(this.componentId,this.containerId, 300,'https://www.youtube.com/embed/BxGPwYwlAfM'));
      this.addWindow(new SocketSideWindow(this.componentId,this.containerId, 300));
    }

    // Render all windows and separators
    this.renderWindows();
  }
  
  /**
   * Render all windows and separators
   */
  renderWindows() {
    // Clear the container
    this.container.innerHTML = '';
    this.separators = [];
    this.windowRegistry.clear();
    
    // Create a wrapper for all windows
    const windowsContainer = document.createElement('div');
    windowsContainer.className = 'side-windows-container';
    windowsContainer.style.display = 'flex';
    windowsContainer.style.flexDirection = 'column';
    windowsContainer.style.height = '100%';
    windowsContainer.style.overflow = 'hidden';
    this.container.appendChild(windowsContainer);
    
    // Render each window
    this.windows.forEach((window, index) => {
      // Create a window wrapper
      const windowWrapper = document.createElement('div');
      windowWrapper.className = 'side-window-wrapper';
      windowWrapper.style.position = 'relative';
      windowWrapper.style.width = '100%';
      
      // Set flex properties based on minimized state
      if (window.isMinimized && window.isMinimized()) {
        windowWrapper.style.height = `${window.headerHeight}px`;
        windowWrapper.style.minHeight = `${window.headerHeight}px`;
        windowWrapper.style.flex = '0 0 auto';
      } else {
        windowWrapper.style.height = `${window.height}px`;
        windowWrapper.style.minHeight = `${window.headerHeight}px`;
        windowWrapper.style.flex = '1 1 auto';
      }
      
      // Add the container to the parent
      windowWrapper.appendChild(window.render());    
      
      // Register the window element for lookup
      this.windowRegistry.set(windowWrapper.querySelector('.side-window'), window);
      
      // Add a resize separator after each window except the last one
      if (index < this.windows.length - 1) {
        const separator = this.createSeparator(index);
        windowWrapper.appendChild(separator);
        this.separators.push(separator);
      }
      
      // Add the window wrapper to the container
      windowsContainer.appendChild(windowWrapper);
    });
    
    // Patch the SideWindow.getWindowObjectFromElement method to use our registry
    this.patchSideWindowGetWindowObjectMethod();
  }
  
  /**
   * Patch the SideWindow.getWindowObjectFromElement method to use our registry
   */
  patchSideWindowGetWindowObjectMethod() {
    // Find a SideWindow instance to patch
    if (this.windows.length > 0) {
      const sideWindow = this.windows[0];
      
      // Override the getWindowObjectFromElement method
      sideWindow.constructor.prototype.getWindowObjectFromElement = (element) => {
        return this.windowRegistry.get(element) || null;
      };
    }
  }
  
  /**
   * Handle layout changed event
   * @param {Object} data - Event data
   */
  handleLayoutChanged(data) {
    // Re-render the windows to update their positions
    this.renderWindows();
  }

  /**
   * Override getLayoutInfo to include SideBar-specific information
   * @returns {Object} Layout information for this SideBar
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add SideBar-specific information
    layoutInfo.windows = this.windows.map(window => {
      // Get the window's own layout info
      const windowLayoutInfo = window.getLayoutInfo ? window.getLayoutInfo() : {};
      
      // Ensure we have the basic window properties
      return {
        id: window.id,
        type: window.constructor.name,
        height: window.height,
        minimized: window.minimized,
        ...windowLayoutInfo // Include all window-specific properties
      };
    });
    
    // Add information about the active window
    const activeWindow = this.windows.find(window => window.element && 
      window.element.classList.contains('active'));
    
    if (activeWindow) {
      layoutInfo.activeWindow = activeWindow.id;
    }
    
    return layoutInfo;
  }
  
  /**
   * Apply layout information to restore the sidebar state
   * @param {Object} layoutInfo - Layout information for this SideBar
   */
  applyLayout(layoutInfo) {
    console.log('SideBar applying layout:', layoutInfo);
    
    // Check if we have window configuration
    if (layoutInfo.windows && Array.isArray(layoutInfo.windows)) {
      // Store current windows temporarily
      const existingWindows = [...this.windows];
      
      // Clear the windows array
      this.windows = [];
      
      // Process each window in the layout
      layoutInfo.windows.forEach(windowInfo => {
        // Find matching window from existing windows
        const existingWindow = existingWindows.find(w => w.id === windowInfo.id);
        
        if (existingWindow) {
          // Update existing window properties
          existingWindow.height = windowInfo.height || existingWindow.height;
          
          // Set minimized state if specified
          if (windowInfo.minimized !== undefined) {
            existingWindow.minimized = windowInfo.minimized;
          }
          
          // Add the window to the windows array
          this.windows.push(existingWindow);
        } else {
          // Create a new window based on type
          let newWindow;
          
          switch (windowInfo.type) {
            case 'ProjectSideWindow':
              newWindow = new ProjectSideWindow(windowInfo.height || 250,this);
              break;
            case 'OutputSideWindow':
              newWindow = new OutputSideWindow(windowInfo.height || 180,this);
              break;
            case 'TVSideWindow':
              newWindow = new TVSideWindow(windowInfo.height || 200,this);
              break;
            case 'SocketSideWindow':
              newWindow = new SocketSideWindow(windowInfo.height || 200,this);
              break;
            default:
              console.warn(`Unknown window type: ${windowInfo.type}`);
              return;
          }
          
          // Set window ID
          newWindow.id = windowInfo.id;
          
          // Set minimized state if specified
          if (windowInfo.minimized !== undefined) {
            newWindow.minimized = windowInfo.minimized;
          }
          
          // Add the new window to the windows array
          this.windows.push(newWindow);
        }
      });
      
      // Re-render the windows
      this.renderWindows();
      
      // Apply minimized state to rendered windows
      this.windows.forEach(window => {
        if (window.minimized && window.container) {
          // Ensure the window is minimized in the DOM
          window.container.classList.add('minimized');
          if (window.content) {
            window.content.style.display = 'none';
          }
          
          // Find the wrapper element
          const wrapper = window.container.closest('.side-window-wrapper');
          if (wrapper) {
            wrapper.style.height = `${window.headerHeight || 34}px`;
            wrapper.style.minHeight = `${window.headerHeight || 34}px`;
            wrapper.style.flex = '0 0 auto';
          }
          
          // Update toggle button
          const toggleButton = window.container.querySelector('.side-window-toggle');
          if (toggleButton) {
            toggleButton.innerHTML = '▼';
            toggleButton.title = 'Maximize';
          }
        }
      });
      
      // Set active window if specified
      if (layoutInfo.activeWindow) {
        const activeWindow = this.windows.find(w => w.id === layoutInfo.activeWindow);
        if (activeWindow && activeWindow.element) {
          activeWindow.element.classList.add('active');
        }
      }
    }
  }
  
  /**
   * Override handleMessage to handle layout-related messages
   * @param {string} messageType - Type of message
   * @param {Object} messageData - Message data
   * @param {string} sender - Sender ID
   * @returns {boolean} - Whether the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`SideBar received message: ${messageType}`, messageData);
    
    switch (messageType) {
//      case MESSAGES.MODE_CHANGE:
//        this.handleLayoutChanged(messageData.data);
//        return true;
      
      case MESSAGES.LOAD_LAYOUT:
        // Check if this layout is for us
        if (messageData.data && 
            (messageData.data.componentName === 'SideBar' || 
             messageData.data.componentName === this.componentName)) {
          this.applyLayout(messageData.data.layoutInfo);
          return true;
        }
        break;
    }
    
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Create a separator element for resizing windows
   * @param {number} index - Index of the separator
   * @returns {HTMLElement} - The created separator element
   */
  createSeparator(index) {
    const separator = document.createElement('div');
    separator.className = 'resize-separator';
    separator.dataset.index = index;
    
    // Set up the resize functionality
    separator.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.activeSeparatorIndex = index;
      this.startY = e.clientY;
      
      // Store the starting heights of the windows above and below this separator
      this.startHeightAbove = this.windows[index].height;
      this.startHeightBelow = this.windows[index + 1].height;
      
      separator.classList.add('active');
      
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      
      // Prevent default to avoid text selection
      e.preventDefault();
    });
    
    return separator;
  }
  
  /**
   * Add a window to the sidebar
   * @param {SideWindow} window - The window to add
   */
  addWindow(window) {
    // Add the window to the windows array
    this.windows.push(window);
    
    // Establish parent-child relationship in the component tree
    // This ensures that messages will propagate correctly
    if (window.componentId) {
      console.log(`SideBar: Adding window ${window.id} (${window.componentId}) as child`);      
    } else {
      console.warn(`SideBar: Window ${window.id} has no componentId, cannot establish parent-child relationship`);
    }
  }
  
  /**
   * Remove a window from the sidebar
   * @param {string} windowId - ID of the window to remove
   */
  removeWindow(windowId) {
    const index = this.windows.findIndex(w => w.id === windowId);
    if (index !== -1) {
      this.windows.splice(index, 1);
      this.renderWindows();
    }
  }
  
  /**
   * Get a window by its ID
   * @param {string} windowId - ID of the window to get
   * @returns {SideWindow|null} - The window object or null if not found
   */
  getWindow(windowId) {
    return this.windows.find(w => w.id === windowId) || null;
  }
  
  /**
   * Handle window closed event
   * @param {string} windowId - ID of the closed window
   */
  handleWindowClosed(windowId) {
    this.removeWindow(windowId);
  }
  
  /**
   * Set up global event listeners for resize functionality
   */
  setupGlobalEvents() {
    // Add global event listeners for mouse move and mouse up
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  /**
   * Ensure the bottom window connects to the status line
   */
  connectBottomWindowToStatusLine() {
    // Implementation depends on the status line positioning
  }
  
  /**
   * Handle mouse down event on a separator
   * @param {number} index - Index of the separator
   * @param {MouseEvent} event - The mouse event
   */
  handleSeparatorMouseDown(index, event) {
    this.isDragging = true;
    this.activeSeparatorIndex = index;
    this.startY = event.clientY;
    
    // Store the starting heights of the windows above and below this separator
    this.startHeightAbove = this.windows[index].height;
    this.startHeightBelow = this.windows[index + 1].height;
    
    const separator = this.separators[index];
    separator.classList.add('active');
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    
    // Prevent default to avoid text selection
    event.preventDefault();
  }
  
  /**
   * Handle mouse move event during separator drag
   * @param {MouseEvent} event - The mouse event
   */
  handleMouseMove(event) {
    if (!this.isDragging || this.activeSeparatorIndex === -1) return;
    
    // Calculate the delta Y from the start position
    const deltaY = event.clientY - this.startY;
    
    // Get the windows above and below the separator
    const windowAbove = this.windows[this.activeSeparatorIndex];
    const windowBelow = this.windows[this.activeSeparatorIndex + 1];
    
    if (!windowAbove || !windowBelow) return;
    
    // Calculate new heights ensuring minimum heights
    const minHeight = 80;
    const newHeightAbove = Math.max(minHeight, this.startHeightAbove + deltaY);
    const newHeightBelow = Math.max(minHeight, this.startHeightBelow - deltaY);
    
    // Update the heights
    windowAbove.height = newHeightAbove;
    windowBelow.height = newHeightBelow;
    
    // Update the window wrapper heights
    const wrapperAbove = windowAbove.container.closest('.side-window-wrapper');
    const wrapperBelow = windowBelow.container.closest('.side-window-wrapper');
    
    if (wrapperAbove) {
      wrapperAbove.style.height = `${newHeightAbove}px`;
    }
    
    if (wrapperBelow) {
      wrapperBelow.style.height = `${newHeightBelow}px`;
    }
    
    // Prevent default to avoid text selection
    event.preventDefault();
  }
  
  /**
   * Handle mouse up event after separator drag
   */
  handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.activeSeparatorIndex = -1;
      
      // Remove active class from all separators
      this.separators.forEach(separator => {
        separator.classList.remove('active');
      });
      
      document.body.style.userSelect = '';
    }
  }  
}

export default SideBar;

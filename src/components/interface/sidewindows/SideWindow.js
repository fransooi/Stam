// SideWindow.js - Base class for all side windows in the sidebar
import BaseComponent from '../../../utils/BaseComponent.js';

class SideWindow extends BaseComponent {
  constructor(id, title, initialHeight = 200) {
    // Initialize BaseComponent with component name and parent ID
    // We'll use 'sidewindow-' + id as the component name
    super('sidewindow-' + id, 'sidebar');
    
    this.id = id;
    this.title = title;
    this.height = initialHeight;
    this.container = null;
    this.content = null;
    this.header = null;
    this.isVisible = true;
    this.minimized = false;
    this.originalHeight = initialHeight;
    this.headerHeight = 30; // Approximate height of the header
  }

  /**
   * Handle incoming messages
   * 
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`SideWindow ${this.id} received message: ${messageType}`, messageData);
    
    // Handle common SideWindow messages
    switch (messageType) {
      case 'WINDOW_TOGGLE':
        if (messageData.windowId === this.id) {
          this.toggle();
          return true;
        }
        break;
        
      case 'WINDOW_CLOSE':
        if (messageData.windowId === this.id) {
          this.close();
          return true;
        }
        break;
        
      case 'WINDOW_RESIZE':
        if (messageData.windowId === this.id && messageData.height) {
          this.resize(messageData.height);
          return true;
        }
        break;
    }
    
    // Not handled by SideWindow base class
    return false;
  }

  /**
   * Create the DOM structure for this side window
   * @param {HTMLElement} parentContainer - The parent container to append this window to
   * @returns {HTMLElement} The created window element
   */
  render(parentContainer) {
    // Create the container element
    this.container = document.createElement('div');
    this.container.id = `side-window-${this.id}`;
    this.container.className = 'side-window';
    
    // Create the header
    this.header = document.createElement('div');
    this.header.className = 'side-window-header';
    
    // Create the title
    const title = document.createElement('div');
    title.className = 'side-window-title';
    title.textContent = this.title;
    
    // Create the buttons container
    const buttons = document.createElement('div');
    buttons.className = 'side-window-buttons';
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'side-window-toggle';
    toggleButton.innerHTML = this.minimized ? '▼' : '▲';
    toggleButton.title = this.minimized ? 'Maximize' : 'Minimize';
    toggleButton.addEventListener('click', () => this.toggle());
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'side-window-close';
    closeButton.innerHTML = '×';
    closeButton.title = 'Close';
    closeButton.addEventListener('click', () => this.close());
    
    // Add buttons to the buttons container
    buttons.appendChild(toggleButton);
    buttons.appendChild(closeButton);
    
    // Add title and buttons to the header
    this.header.appendChild(title);
    this.header.appendChild(buttons);
    
    // Create the content area
    this.content = document.createElement('div');
    this.content.className = 'side-window-content';
    
    // Add header and content to the container
    this.container.appendChild(this.header);
    this.container.appendChild(this.content);
    
    // Add the container to the parent
    parentContainer.appendChild(this.container);
    
    // Set initial height
    if (this.minimized) {
      this.container.classList.add('minimized');
      this.content.style.display = 'none';
    } else {
      this.updateContentHeight();
    }
    
    return this.container;
  }

  /**
   * Toggle the window between minimized and normal state
   */
  toggle() {
    if (!this.container) return;
    
    // Get the sidebar element
    const sidebarContainer = this.container.closest('.side-windows-container');
    if (!sidebarContainer) return;
    
    // Get all side windows in the sidebar
    const sideWindowWrappers = Array.from(sidebarContainer.querySelectorAll('.side-window-wrapper'));
    
    // Find this window's wrapper
    const thisWrapper = this.container.closest('.side-window-wrapper');
    if (!thisWrapper) return;
    
    // Find the index of this window wrapper
    const index = sideWindowWrappers.indexOf(thisWrapper);
    
    // Check if this is the only visible window
    const visibleWrappers = sideWindowWrappers.filter(wrapper => {
      const sideWindow = wrapper.querySelector('.side-window');
      return sideWindow && !sideWindow.classList.contains('minimized') && sideWindow !== this.container;
    });
    
    // If this is the only window or the only visible window, don't allow minimizing
    if ((sideWindowWrappers.length === 1 || visibleWrappers.length === 0) && !this.minimized) {
      console.log('Cannot minimize the only visible window');
      return;
    }
    
    // Toggle minimized state
    this.minimized = !this.minimized;
    
    if (this.minimized) {
      // Save original height before minimizing
      this.originalHeight = this.height;
      
      // Minimize: collapse to just show the header
      this.container.classList.add('minimized');
      this.content.style.display = 'none';
      
      // Update the wrapper's flex properties
      thisWrapper.style.height = `${this.headerHeight}px`;
      thisWrapper.style.minHeight = `${this.headerHeight}px`;
      thisWrapper.style.flex = '0 0 auto';
      
      // Update toggle button
      const toggleButton = this.container.querySelector('.side-window-toggle');
      if (toggleButton) {
        toggleButton.innerHTML = '▼';
        toggleButton.title = 'Maximize';
      }
    } else {
      // Maximize: restore to original height
      this.container.classList.remove('minimized');
      this.content.style.display = 'block';
      
      // Update the wrapper's flex properties
      thisWrapper.style.height = `${this.originalHeight}px`;
      thisWrapper.style.minHeight = `${this.headerHeight}px`;
      thisWrapper.style.flex = '1 1 auto';
      
      // Update toggle button
      const toggleButton = this.container.querySelector('.side-window-toggle');
      if (toggleButton) {
        toggleButton.innerHTML = '▲';
        toggleButton.title = 'Minimize';
      }
      
      // Update content height to match new container size
      this.updateContentHeight();
    }
    
    // Notify that window state has changed
    this.sendMessageTo('sidebar', 'SIDEBAR_LAYOUT_CHANGED', {
      windowId: this.id,
      minimized: this.minimized
    });
  }
  
  /**
   * Close the window
   */
  close() {
    if (!this.container) return;
    
    // Remove the window from the DOM
    const wrapper = this.container.closest('.side-window-wrapper');
    if (wrapper) {
      wrapper.remove();
    } else {
      this.container.remove();
    }
    
    // Dispatch an event to notify that the window has been closed
    const event = new CustomEvent('sideWindowClosed', {
      detail: { id: this.id }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Set the height of the window
   * @param {number} height - New height in pixels
   */
  setHeight(height) {
    if (!this.container) return;
    
    this.height = height;
    
    // Update the wrapper's height
    const wrapper = this.container.closest('.side-window-wrapper');
    if (wrapper && !this.minimized) {
      this.originalHeight = height;
      wrapper.style.height = `${height}px`;
      
      // Update content height to match new container size
      this.updateContentHeight();
    }
  }
  
  /**
   * Get the current height of the window
   * @returns {number} - Current height in pixels
   */
  getHeight() {
    return this.minimized ? this.headerHeight : this.height;
  }
  
  /**
   * Check if the window is minimized
   * @returns {boolean} - True if minimized
   */
  isMinimized() {
    return this.minimized;
  }

  /**
   * Update the window with new data
   * @param {Object} data - Data to update the window with
   */
  update(data) {
    // Default implementation - to be overridden by subclasses
    console.log(`Updating ${this.title} with data:`, data);
  }
  
  /**
   * Resize the window to a new height
   * @param {number} height - The new height in pixels
   */
  resize(height) {
    this.setHeight(height);
  }
  
  /**
   * Update the content area height to match the available space
   */
  updateContentHeight() {
    if (!this.container || !this.content || !this.header || this.minimized) return;
    
    // Calculate available height (container height minus header height)
    const containerHeight = this.container.offsetHeight;
    const headerHeight = this.header.offsetHeight;
    const availableHeight = containerHeight - headerHeight;
    
    // Set content height
    if (availableHeight > 0) {
      this.content.style.height = `${availableHeight}px`;
      
      // Trigger a custom event that subclasses can listen for
      const event = new CustomEvent('contentHeightChanged', {
        detail: { height: availableHeight }
      });
      this.content.dispatchEvent(event);
    }
  }
  
  /**
   * Get the SideWindow object associated with a DOM element
   * @param {HTMLElement} element - The DOM element
   * @returns {SideWindow|null} - The SideWindow object or null if not found
   */
  getWindowObjectFromElement(element) {
    const windowId = element.id.replace('side-window-', '');
    // This is a simplified approach - in a real implementation, you might
    // want to use a registry or other mechanism to look up window objects
    return null; // Placeholder - will be implemented by SideBar
  }
}

export default SideWindow;

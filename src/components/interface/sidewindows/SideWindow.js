// SideWindow.js - Base class for all side windows in the sidebar
import BaseComponent from '../../../utils/BaseComponent.js';
import { MESSAGES } from '../../../utils/BaseComponent.js';

class SideWindow extends BaseComponent {
  constructor(id, title, parentId, containerId, initialHeight = 200) {
    // Initialize BaseComponent with component name and parent ID
    // We'll use 'sidewindow-' + id as the component name
    super('SideWindow-' + id, parentId,containerId);
    
    this.id = id;
    this.title = title;
    this.height = initialHeight;
    this.container = null;
    this.content = null;
    this.header = null;
    this.isVisible = true;
    this.minimized = false;
    this.enlarged = false;
    this.enlargedDialog = null;
    this.originalHeight = initialHeight;
    this.headerHeight = 34; // Approximate height of the header
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
    //console.log(`SideWindow received message: ${messageType}`, messageData);
    
    // Handle common SideWindow messages
    switch (messageType) {
      case MESSAGES.WINDOW_TOGGLE:
        if (messageData.windowId === this.id) {
          this.toggle();
          return true;
        }
        break;
        
      case MESSAGES.WINDOW_CLOSE:
        if (messageData.windowId === this.id) {
          this.close();
          return true;
        }
        break;
        
      case MESSAGES.WINDOW_RESIZE:
        if (messageData.windowId === this.id && messageData.height) {
          this.resize(messageData.height);
          return true;
        }
        break;

      case MESSAGES.WINDOW_ENLARGE:
        if (messageData.windowId === this.id) {
          this.toggleEnlarge();
          return true;
        }
        break;
    }
    
    // Not handled by SideWindow base class
    return super.handleMessage(messageType, messageData, sender);
  }

  /**
   * Create the DOM structure for this side window
   * @param {HTMLElement} parentContainer - The parent container to append this window to
   * @returns {HTMLElement} The created window element
   */
  render() {
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
    buttons.className = 'side-window-controls';
    
    // Create enlarge button
    const enlargeButton = document.createElement('button');
    enlargeButton.className = 'side-window-enlarge';
    enlargeButton.innerHTML = '⤢';
    enlargeButton.title = 'Enlarge';
    enlargeButton.addEventListener('click', () => this.toggleEnlarge());
    
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
    buttons.appendChild(enlargeButton);
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
   * Toggle the window between enlarged and normal state
   */
  toggleEnlarge() {
    if (!this.container) return;
    
    // Toggle enlarged state
    this.enlarged = !this.enlarged;
    
    if (this.enlarged) {
      // Create enlarged dialog if it doesn't exist
      this.createEnlargedDialog();
    } else {
      // Close the enlarged dialog
      this.closeEnlargedDialog();
    }
  }

  /**
   * Create the enlarged dialog
   */
  createEnlargedDialog() {
    // Create the dialog overlay
    this.enlargedDialog = document.createElement('div');
    this.enlargedDialog.className = 'side-window-enlarged-overlay';
    this.enlargedDialog.id = `enlarged-${this.id}`;
    
    // Create the dialog container
    const dialogContainer = document.createElement('div');
    dialogContainer.className = 'side-window-enlarged-container';
    
    // Create the dialog header
    const dialogHeader = document.createElement('div');
    dialogHeader.className = 'side-window-enlarged-header';
    
    // Create the dialog title
    const dialogTitle = document.createElement('div');
    dialogTitle.className = 'side-window-enlarged-title';
    dialogTitle.textContent = this.title;
    
    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.className = 'side-window-enlarged-close';
    closeButton.innerHTML = '×';
    closeButton.title = 'Close';
    closeButton.addEventListener('click', () => this.toggleEnlarge());
    
    // Add title and close button to header
    dialogHeader.appendChild(dialogTitle);
    dialogHeader.appendChild(closeButton);
    
    // Create the dialog content
    const dialogContent = document.createElement('div');
    dialogContent.className = 'side-window-enlarged-content';
    
    // Store references to the original content and its parent
    this.originalContentParent = this.content.parentNode;
    this.originalContentRect = this.content.getBoundingClientRect();
    
    // Instead of moving the content directly, we'll create a placeholder in the dialog
    // and use the placeholder in the original location
    this.contentPlaceholder = document.createElement('div');
    this.contentPlaceholder.className = 'side-window-content side-window-content-placeholder';
    this.contentPlaceholder.innerHTML = '<div class="placeholder-message">Content is currently enlarged. Close the enlarged view to restore.</div>';
    
    // Replace the original content with the placeholder
    this.originalContentParent.replaceChild(this.contentPlaceholder, this.content);
    
    // Add the original content to the dialog
    dialogContent.appendChild(this.content);
    
    // Add header and content to the dialog container
    dialogContainer.appendChild(dialogHeader);
    dialogContainer.appendChild(dialogContent);
    
    // Add the dialog container to the overlay
    this.enlargedDialog.appendChild(dialogContainer);
    
    // Add the overlay to the document body
    document.body.appendChild(this.enlargedDialog);
    
    // Update the enlarge button
    const enlargeButton = this.container.querySelector('.side-window-enlarge');
    if (enlargeButton) {
      enlargeButton.innerHTML = '⤓';
      enlargeButton.title = 'Restore';
    }
  }

  /**
   * Close the enlarged dialog
   */
  closeEnlargedDialog() {
    if (!this.enlargedDialog) return;
    
    // Replace the placeholder with the original content
    if (this.contentPlaceholder && this.contentPlaceholder.parentNode) {
      this.originalContentParent.replaceChild(this.content, this.contentPlaceholder);
    }
    
    // Remove the dialog from the DOM
    this.enlargedDialog.remove();
    this.enlargedDialog = null;
    
    // Update the enlarge button
    const enlargeButton = this.container.querySelector('.side-window-enlarge');
    if (enlargeButton) {
      enlargeButton.innerHTML = '⤢';
      enlargeButton.title = 'Enlarge';
    }
    
    // Update content height to match container size
    this.updateContentHeight();
  }
  
  /**
   * Close the window
   */
  close() {
    if (!this.container) return;
    
    // If the window is enlarged, close the enlarged dialog first
    if (this.enlarged) {
      this.closeEnlargedDialog();
    }
    
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
   * Check if the window is enlarged
   * @returns {boolean} - True if enlarged
   */
  isEnlarged() {
    return this.enlarged;
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
  
  /**
   * Add a custom button to the title bar
   * @param {HTMLElement} buttonElement - The button element to add
   * @param {boolean} beforeControls - If true, add before standard controls; if false, add after any custom buttons but before standard controls
   */
  addCustomTitleBarButton(buttonElement, beforeControls = false) {
    if (!this.header) return;
    
    // Get the buttons container
    const buttonsContainer = this.header.querySelector('.side-window-controls');
    if (!buttonsContainer) return;
    
    if (beforeControls) {
      // Insert at the beginning of the controls container
      buttonsContainer.insertBefore(buttonElement, buttonsContainer.firstChild);
    } else {
      // Insert before the standard controls (enlarge, toggle, close)
      const enlargeButton = buttonsContainer.querySelector('.side-window-enlarge');
      if (enlargeButton) {
        buttonsContainer.insertBefore(buttonElement, enlargeButton);
      } else {
        const toggleButton = buttonsContainer.querySelector('.side-window-toggle');
        if (toggleButton) {
          buttonsContainer.insertBefore(buttonElement, toggleButton);
        } else {
          buttonsContainer.appendChild(buttonElement);
        }
      }
    }
  }
  
  /**
   * Override getLayoutInfo to include SideWindow-specific information
   * @returns {Object} Layout information for this SideWindow
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add SideWindow-specific information
    layoutInfo.minimized = this.minimized;
    layoutInfo.height = this.height;
    layoutInfo.windowId = this.id;
    
    return layoutInfo;
  }
}

export default SideWindow;

// SideBar.js - Component for the left sidebar that manages multiple SideWindow instances
import ProjectSideWindow from './interface/sidewindows/ProjectSideWindow.js';
import OutputSideWindow from './interface/sidewindows/OutputSideWindow.js';
import TVSideWindow from './interface/sidewindows/TVSideWindow.js';
import BaseComponent from '../utils/BaseComponent.js';

class SideBar extends BaseComponent {
  constructor(containerId) {
    // Initialize the base component with component name
    super('SideBar');
    
    this.container = document.getElementById(containerId);
    this.windows = [];
    this.separators = [];
    this.isDragging = false;
    this.activeSeparatorIndex = -1;
    
    // Set up global event listeners for resize functionality
    this.setupGlobalEvents();
    
    // Listen for window close events
    document.addEventListener('sideWindowClosed', (event) => {
      this.handleWindowClosed(event.detail.id);
    });
  }

  /**
   * Render the sidebar with default windows
   */
  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Add default windows if none exist
    if (this.windows.length === 0) {
      this.addWindow(new ProjectSideWindow(300));
      this.addWindow(new OutputSideWindow(180));
      this.addWindow(new TVSideWindow(300, 'https://www.youtube.com/embed/dQw4w9WgXcQ'));
    }
    
    // Render all windows and separators
    this.renderWindows();
    
    // Ensure the bottom window connects to the status line
    this.connectBottomWindowToStatusLine();
  }
  
  /**
   * Render all windows and separators
   */
  renderWindows() {
    // Clear the container
    this.container.innerHTML = '';
    this.separators = [];
    
    // Create a wrapper for all windows
    const windowsContainer = document.createElement('div');
    windowsContainer.className = 'side-windows-container';
    this.container.appendChild(windowsContainer);
    
    // Calculate total available height
    const totalHeight = this.container.offsetHeight;
    let usedHeight = 0;
    
    // Render each window
    this.windows.forEach((window, index) => {
      // Create a window wrapper
      const windowWrapper = document.createElement('div');
      windowWrapper.className = 'side-window-wrapper';
      
      // Set the window height
      if (index === this.windows.length - 1 && window.id === 'output') {
        // Fixed height for output window
        windowWrapper.style.height = '180px';
        window.height = 180;
      } else if (index === this.windows.length - 1) {
        // Last window takes remaining space
        const remainingHeight = Math.max(80, totalHeight - usedHeight);
        windowWrapper.style.height = `${remainingHeight}px`;
        window.height = remainingHeight;
      } else {
        // Regular window with its set height
        windowWrapper.style.height = `${window.height}px`;
        usedHeight += window.height;
      }
      
      // Render the window into its wrapper
      window.render(windowWrapper);
      
      // Add a resize separator after each window except the last one
      if (index < this.windows.length - 1) {
        const separator = this.createSeparator(index);
        windowWrapper.appendChild(separator);
        this.separators.push(separator);
      }
      
      // Add the window wrapper to the container
      windowsContainer.appendChild(windowWrapper);
    });
  }
  
  /**
   * Ensure the bottom window connects to the status line
   */
  connectBottomWindowToStatusLine() {
    if (this.windows.length === 0) return;
    
    // Get the last window (bottom window)
    const lastWindowIndex = this.windows.length - 1;
    const bottomWindow = this.windows[lastWindowIndex];
    
    if (bottomWindow && bottomWindow.container) {
      // Make sure the bottom window has a specific class for styling
      bottomWindow.container.classList.add('bottom-side-window');
      
      // If this is the Output window, apply specific styling
      if (bottomWindow.id === 'output') {
        // Add a class to indicate it's fixed to the bottom
        bottomWindow.container.classList.add('fixed-bottom');
        
        // Make sure the content area has proper styling
        const contentArea = bottomWindow.content;
        if (contentArea) {
          contentArea.classList.add('output-content');
        }
      }
    }
  }
  
  /**
   * Create a resize separator
   * @param {number} index - The index of the separator
   * @returns {HTMLElement} The created separator element
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
   * Set up global event listeners for resize functionality
   */
  setupGlobalEvents() {
    // Add global event listeners for mouse move and mouse up
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  /**
   * Handle mouse move event for resizing windows
   * @param {MouseEvent} e - The mouse move event
   */
  handleMouseMove(e) {
    if (!this.isDragging || this.activeSeparatorIndex === -1) return;
    
    // Calculate the delta Y from the start position
    const deltaY = e.clientY - this.startY;
    
    // Get the windows above and below the separator
    const windowAbove = this.windows[this.activeSeparatorIndex];
    const windowBelow = this.windows[this.activeSeparatorIndex + 1];
    
    if (!windowAbove || !windowBelow) return;
    
    // If we're resizing the window above the bottom window and the bottom window is the output window,
    // we need to ensure the output window maintains its fixed height
    const isLastSeparator = this.activeSeparatorIndex === this.windows.length - 2;
    const isBottomWindowOutput = windowBelow.id === 'output';
    
    if (isLastSeparator && isBottomWindowOutput) {
      // Only resize the window above, keeping the output window fixed
      const newHeightAbove = Math.max(80, this.startHeightAbove + deltaY);
      windowAbove.setHeight(newHeightAbove);
      
      // Update the window wrapper height
      const windowWrapper = windowAbove.container.closest('.side-window-wrapper');
      if (windowWrapper) {
        windowWrapper.style.height = `${newHeightAbove}px`;
      }
    } else {
      // Calculate new heights ensuring minimum heights
      const minHeight = 80;
      const newHeightAbove = Math.max(minHeight, this.startHeightAbove + deltaY);
      const newHeightBelow = Math.max(minHeight, this.startHeightBelow - deltaY);
      
      // Update the heights
      windowAbove.setHeight(newHeightAbove);
      windowBelow.setHeight(newHeightBelow);
      
      // Update the window wrapper heights
      const wrapperAbove = windowAbove.container.closest('.side-window-wrapper');
      const wrapperBelow = windowBelow.container.closest('.side-window-wrapper');
      
      if (wrapperAbove) {
        wrapperAbove.style.height = `${newHeightAbove}px`;
      }
      
      if (wrapperBelow) {
        wrapperBelow.style.height = `${newHeightBelow}px`;
      }
    }
    
    // Prevent default to avoid text selection
    e.preventDefault();
  }
  
  /**
   * Handle mouse up event to end resizing
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
  
  /**
   * Add a new window to the sidebar
   * @param {SideWindow} window - The window to add
   */
  addWindow(window) {
    this.windows.push(window);
    
    // If the sidebar is already rendered, re-render it
    if (this.container.children.length > 0) {
      this.renderWindows();
      this.connectBottomWindowToStatusLine();
    }
    
    return window;
  }
  
  /**
   * Remove a window from the sidebar
   * @param {string} id - The ID of the window to remove
   */
  removeWindow(id) {
    const index = this.windows.findIndex(w => w.id === id);
    if (index !== -1) {
      this.windows.splice(index, 1);
      this.renderWindows();
      this.connectBottomWindowToStatusLine();
    }
  }
  
  /**
   * Handle window closed event
   * @param {string} id - The ID of the closed window
   */
  handleWindowClosed(id) {
    this.removeWindow(id);
  }
  
  /**
   * Get a window by its ID
   * @param {string} id - The ID of the window to get
   * @returns {SideWindow|null} The window or null if not found
   */
  getWindow(id) {
    return this.windows.find(w => w.id === id) || null;
  }
  
  /**
   * Reorder windows by moving a window to a new position
   * @param {string} id - The ID of the window to move
   * @param {number} newIndex - The new index for the window
   */
  reorderWindows(id, newIndex) {
    const currentIndex = this.windows.findIndex(w => w.id === id);
    if (currentIndex === -1 || newIndex < 0 || newIndex >= this.windows.length) {
      return false;
    }
    
    // Move the window to the new position
    const [window] = this.windows.splice(currentIndex, 1);
    this.windows.splice(newIndex, 0, window);
    
    // Re-render the windows
    this.renderWindows();
    this.connectBottomWindowToStatusLine();
    
    return true;
  }
  
  /**
   * Update a specific window with new data
   * @param {string} id - The ID of the window to update
   * @param {any} data - The data to update the window with
   */
  updateWindow(id, data) {
    const window = this.getWindow(id);
    if (window) {
      window.update(data);
    }
  }
  
  /**
   * Add a project window to the sidebar
   * @param {number} initialHeight - The initial height of the window
   * @returns {ProjectSideWindow} The created project window
   */
  addProjectWindow(initialHeight = 300) {
    return this.addWindow(new ProjectSideWindow(initialHeight));
  }
  
  /**
   * Add an output window to the sidebar
   * @param {number} initialHeight - The initial height of the window
   * @returns {OutputSideWindow} The created output window
   */
  addOutputWindow(initialHeight = 180) {
    return this.addWindow(new OutputSideWindow(initialHeight));
  }
  
  /**
   * Add a TV window to the sidebar
   * @param {number} initialHeight - Initial height of the window
   * @param {string} initialUrl - Initial URL to load in the TV
   * @returns {TVSideWindow} - The created TV window
   */
  addTVWindow(initialHeight = 300, initialUrl = '') {
    const tvWindow = new TVSideWindow(initialHeight, initialUrl);
    this.addWindow(tvWindow);
    return tvWindow;
  }
  
  /**
   * Update the project tree
   * @param {Array} tree - The new project tree data
   */
  setProjectTree(tree) {
    this.updateWindow('project', tree);
  }
  
  /**
   * Append content to the output window
   * @param {string} content - The content to append
   */
  appendToOutput(content) {
    this.updateWindow('output', { content });
  }
  
  /**
   * Clear the output window
   */
  clearOutput() {
    this.updateWindow('output', { clear: true });
  }
  
  // Override the handleMessage method from BaseComponent
  handleMessage(messageType, messageData, sender) {
    console.log(`SideBar received message: ${messageType}`, messageData);
    
    switch (messageType) {
      case 'APPEND_OUTPUT':
        if (messageData.data && messageData.data.content) {
          this.appendToOutput(messageData.data.content);
          return true;
        }
        break;
        
      case 'CLEAR_OUTPUT':
        this.clearOutput();
        return true;
        
      case 'SET_PROJECT_TREE':
        if (messageData.data && messageData.data.tree) {
          this.setProjectTree(messageData.data.tree);
          return true;
        }
        break;
        
      case 'ADD_WINDOW':
        if (messageData.data && messageData.data.type) {
          const { type, height, url } = messageData.data;
          
          switch (type) {
            case 'project':
              this.addProjectWindow(height);
              return true;
              
            case 'output':
              this.addOutputWindow(height);
              return true;
              
            case 'tv':
              this.addTVWindow(height, url);
              return true;
          }
        }
        break;
        
      case 'REMOVE_WINDOW':
        if (messageData.data && messageData.data.id) {
          this.removeWindow(messageData.data.id);
          return true;
        }
        break;
    }
    
    return false; // Message not handled
  }
}

export default SideBar;

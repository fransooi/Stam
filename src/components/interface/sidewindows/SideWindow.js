// SideWindow.js - Base class for all side windows in the sidebar

class SideWindow {
  constructor(id, title, initialHeight = 200) {
    this.id = id;
    this.title = title;
    this.height = initialHeight;
    this.container = null;
    this.content = null;
    this.header = null;
    this.isVisible = true;
  }

  /**
   * Create the DOM structure for this side window
   * @param {HTMLElement} parentContainer - The parent container to append this window to
   * @returns {HTMLElement} The created window element
   */
  render(parentContainer) {
    // Create the main container for this window
    this.container = document.createElement('div');
    this.container.className = 'side-window';
    this.container.id = `side-window-${this.id}`;
    this.container.style.height = `${this.height}px`;
    
    // Create the header
    this.header = document.createElement('div');
    this.header.className = 'side-window-header';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'side-window-title';
    titleElement.textContent = this.title;
    
    const controlsElement = document.createElement('div');
    controlsElement.className = 'side-window-controls';
    
    // Add minimize/maximize button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'side-window-toggle';
    toggleButton.innerHTML = '▲';
    toggleButton.title = 'Minimize';
    toggleButton.addEventListener('click', () => this.toggle());
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'side-window-close';
    closeButton.innerHTML = '×';
    closeButton.title = 'Close';
    closeButton.addEventListener('click', () => this.close());
    
    controlsElement.appendChild(toggleButton);
    controlsElement.appendChild(closeButton);
    
    this.header.appendChild(titleElement);
    this.header.appendChild(controlsElement);
    
    // Create content area
    this.content = document.createElement('div');
    this.content.className = 'side-window-content';
    
    // Append elements to the container
    this.container.appendChild(this.header);
    this.container.appendChild(this.content);
    
    // Add to parent
    if (parentContainer) {
      parentContainer.appendChild(this.container);
    }
    
    // Initialize content
    this.initContent();
    
    return this.container;
  }
  
  /**
   * Initialize the content of this window - to be overridden by subclasses
   */
  initContent() {
    // Default implementation - to be overridden by subclasses
    this.content.innerHTML = `<div class="side-window-placeholder">Content for ${this.title}</div>`;
  }
  
  /**
   * Set the height of this window
   * @param {number} height - The new height in pixels
   */
  setHeight(height) {
    this.height = height;
    if (this.container) {
      this.container.style.height = `${height}px`;
    }
  }
  
  /**
   * Toggle the visibility of the window content (minimize/maximize)
   */
  toggle() {
    if (this.content.style.display === 'none') {
      // Maximize
      this.content.style.display = '';
      this.container.style.height = `${this.height}px`;
      this.header.querySelector('.side-window-toggle').innerHTML = '▲';
      this.header.querySelector('.side-window-toggle').title = 'Minimize';
    } else {
      // Minimize
      this.content.style.display = 'none';
      this.container.style.height = 'auto';
      this.header.querySelector('.side-window-toggle').innerHTML = '▼';
      this.header.querySelector('.side-window-toggle').title = 'Maximize';
    }
  }
  
  /**
   * Close this window
   */
  close() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.isVisible = false;
      
      // Dispatch a custom event to notify the sidebar that this window was closed
      const event = new CustomEvent('sideWindowClosed', {
        detail: { id: this.id }
      });
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Update the window with new data
   * @param {any} data - The data to update the window with
   */
  update(data) {
    // Default implementation - to be overridden by subclasses
    console.log(`Updating ${this.title} with data:`, data);
  }
}

export default SideWindow;

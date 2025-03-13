// ClipSideWindow.js - Base class for all clip windows
import SideWindow from '../SideWindow.js';

class ClipSideWindow {
  constructor(id, title, initialUrl = '') {
    this.id = id;
    this.title = title;
    this.url = initialUrl || 'about:blank';
    this.iframe = null;
    this.modalContainer = null;
    this.iframeContainer = null;
  }
  
  /**
   * Initialize the content of the clip window
   * @param {HTMLElement} contentElement - The content element to initialize
   */
  initContent(contentElement) {
    this.content = contentElement;
    
    this.initIframeContainer(contentElement);
    
    // Create the modal dialog (hidden by default)
    this.createUrlModal();
  }
  
  /**
   * Initialize the iframe container
   * @param {HTMLElement} parentElement - The parent element to append the iframe to
   */
  initIframeContainer(parentElement) {
    // Create iframe container
    this.iframeContainer = document.createElement('div');
    this.iframeContainer.className = 'clip-iframe-container';
    
    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.className = 'clip-iframe';
    this.iframe.frameBorder = '0';
    this.iframe.allowFullscreen = true;
    this.iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    this.iframe.referrerPolicy = 'no-referrer-when-downgrade';
    this.iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-presentation';
    
    // Set the URL
    this.setUrl(this.url);
    
    // Append iframe to container
    this.iframeContainer.appendChild(this.iframe);
    
    // Append container to parent
    parentElement.appendChild(this.iframeContainer);
  }
  
  /**
   * Create the URL edit modal dialog
   */
  createUrlModal() {
    // Create modal container
    this.modalContainer = document.createElement('div');
    this.modalContainer.className = 'url-modal';
    this.modalContainer.style.display = 'none';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'url-modal-content';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'url-modal-header';
    modalHeader.textContent = `Enter ${this.title} URL`;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'url-modal-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => this.hideUrlModal());
    
    modalHeader.appendChild(closeButton);
    
    // Create form
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const urlInput = form.querySelector('#url-input');
      if (urlInput && urlInput.value) {
        this.setUrl(urlInput.value);
        this.hideUrlModal();
      }
    });
    
    // Create URL input
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.id = 'url-input';
    urlInput.placeholder = this.getUrlPlaceholder();
    urlInput.value = this.url !== 'about:blank' ? this.url : '';
    urlInput.required = true;
    
    // Create URL help text
    const helpText = document.createElement('div');
    helpText.className = 'url-help-text';
    helpText.innerHTML = this.getUrlHelpText();
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Load';
    
    // Assemble form
    form.appendChild(urlInput);
    form.appendChild(helpText);
    form.appendChild(submitButton);
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(form);
    this.modalContainer.appendChild(modalContent);
    
    // Add modal to the document body
    document.body.appendChild(this.modalContainer);
    
    // Add click event to close modal when clicking outside
    this.modalContainer.addEventListener('click', (e) => {
      if (e.target === this.modalContainer) {
        this.hideUrlModal();
      }
    });
  }
  
  /**
   * Show the URL edit modal
   */
  showUrlModal() {
    if (this.modalContainer) {
      this.modalContainer.style.display = 'flex';
      
      // Focus the input
      const urlInput = this.modalContainer.querySelector('#url-input');
      if (urlInput) {
        urlInput.focus();
        urlInput.select();
      }
    }
  }
  
  /**
   * Hide the URL edit modal
   */
  hideUrlModal() {
    if (this.modalContainer) {
      this.modalContainer.style.display = 'none';
    }
  }
  
  /**
   * Set a new URL for the iframe
   * @param {string} url - The new URL to load
   */
  setUrl(url) {
    this.url = url;
    
    if (this.iframe) {
      this.iframe.src = this.processUrl(url);
    }
  }
  
  /**
   * Process the URL before setting it to the iframe
   * @param {string} url - The URL to process
   * @returns {string} - The processed URL
   */
  processUrl(url) {
    // Base implementation just returns the URL as is
    // Override in subclasses for specific URL processing
    return url;
  }
  
  /**
   * Get the placeholder text for the URL input
   * @returns {string} - The placeholder text
   */
  getUrlPlaceholder() {
    return 'https://example.com';
  }
  
  /**
   * Get the help text for the URL input
   * @returns {string} - The help text HTML
   */
  getUrlHelpText() {
    return 'Enter a valid URL';
  }
  
  /**
   * Update the clip window with new data
   * @param {Object} data - The data to update with
   * @param {string} data.url - The new URL to load
   */
  update(data) {
    if (data && data.url) {
      this.setUrl(data.url);
    }
  }
  
  /**
   * Clean up resources when the window is closed
   */
  cleanup() {
    // Remove the modal from the document
    if (this.modalContainer && this.modalContainer.parentNode) {
      this.modalContainer.parentNode.removeChild(this.modalContainer);
    }
  }
}

export default ClipSideWindow;

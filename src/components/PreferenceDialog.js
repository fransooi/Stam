/**
 * PreferenceDialog.js
 * 
 * This component manages application preferences and layout persistence.
 * It creates a dialog box for managing preferences and handles layout saving/loading.
 */

import BaseComponent, { PREFERENCE_MESSAGES } from '../utils/BaseComponent.js';

class PreferenceDialog extends BaseComponent {
  /**
   * Constructor
   * @param {string} parentId - ID of the parent component
   */
  constructor(parentId = null) {
    super('PreferenceDialog', parentId);
    
    // Storage for layout information from components
    this.layoutInfo = {};
    
    // Create the dialog element
    this.element = document.createElement('div');
    this.element.className = 'preference-dialog';
    this.element.style.display = 'none';
    this.element.style.position = 'fixed';
    this.element.style.top = '50%';
    this.element.style.left = '50%';
    this.element.style.transform = 'translate(-50%, -50%)';
    this.element.style.backgroundColor = '#2a2a2a';
    this.element.style.border = '1px solid #444';
    this.element.style.borderRadius = '4px';
    this.element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    this.element.style.padding = '20px';
    this.element.style.minWidth = '400px';
    this.element.style.zIndex = '1000';
    
    // Create the dialog content
    this.createDialogContent();
    
    // Add the dialog to the document body
    document.body.appendChild(this.element);
  }
  
  /**
   * Create the dialog content
   */
  createDialogContent() {
    // Create dialog header
    const header = document.createElement('div');
    header.className = 'preference-dialog-header';
    header.style.marginBottom = '20px';
    header.style.borderBottom = '1px solid #444';
    header.style.paddingBottom = '10px';
    
    const title = document.createElement('h2');
    title.textContent = 'Preferences';
    title.style.margin = '0';
    title.style.color = '#eee';
    title.style.fontSize = '18px';
    
    header.appendChild(title);
    this.element.appendChild(header);
    
    // Create dialog content area
    const content = document.createElement('div');
    content.className = 'preference-dialog-content';
    content.style.marginBottom = '20px';
    
    const message = document.createElement('p');
    message.textContent = 'Preferences dialog box';
    message.style.color = '#ddd';
    
    content.appendChild(message);
    this.element.appendChild(content);
    
    // Create dialog footer with buttons
    const footer = document.createElement('div');
    footer.className = 'preference-dialog-footer';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '10px';
    
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.padding = '8px 16px';
    okButton.style.backgroundColor = '#4a4a4a';
    okButton.style.color = '#fff';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '4px';
    okButton.style.cursor = 'pointer';
    okButton.onclick = () => this.handleOkClick();
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#3a3a3a';
    cancelButton.style.color = '#ddd';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.onclick = () => this.handleCancelClick();
    
    footer.appendChild(cancelButton);
    footer.appendChild(okButton);
    this.element.appendChild(footer);
  }
  
  /**
   * Handle OK button click
   */
  handleOkClick() {
    // Save preferences
    this.saveLayout()
      .then(layoutJson => {
        console.log('Layout saved:', layoutJson);
        // Store in localStorage
        localStorage.setItem('pcos-layout', layoutJson);
        this.hide();
      })
      .catch(error => {
        console.error('Error saving layout:', error);
      });
  }
  
  /**
   * Handle Cancel button click
   */
  handleCancelClick() {
    this.hide();
  }
  
  /**
   * Show the preferences dialog
   */
  show() {
    this.element.style.display = 'block';
  }
  
  /**
   * Hide the preferences dialog
   */
  hide() {
    this.element.style.display = 'none';
  }
  
  /**
   * Handle incoming messages
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`PreferenceDialog received message: ${messageType}`, messageData);
    
    // Handle layout information messages
    if (messageType === PREFERENCE_MESSAGES.LAYOUT_INFO) {
      // Store the layout information from this component
      if (sender) {
        this.layoutInfo[sender] = messageData.data || messageData;
        console.log(`Received layout info from ${sender.componentId}`);
      }
      return true;
    }
    
    // Handle show preferences message
    if (messageType === PREFERENCE_MESSAGES.SHOW_PREFERENCES) {
      this.show();
      return true;
    }
    
    // Handle hide preferences message
    if (messageType === PREFERENCE_MESSAGES.HIDE_PREFERENCES) {
      this.hide();
      return true;
    }
    
    // Pass to parent handler if not handled here
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Save the current layout
   * @returns {Promise<string>} - Promise that resolves with the layout JSON
   */
  saveLayout() {
    // Clear any existing layout information
    this.layoutInfo = {};
    
    // Request layout information from all components
    this.broadcast(PREFERENCE_MESSAGES.GET_LAYOUT_INFO);
    
    // Return a promise that resolves with the layout JSON
    return new Promise((resolve) => {
      // Wait for components to respond with their layout information
      setTimeout(() => {
        // Create the final layout object
        const layout = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          components: this.layoutInfo
        };
        
        // Convert layout information to JSON
        const layoutJson = JSON.stringify(layout, null, 2);
        resolve(layoutJson);
      }, 2500); // Wait 500ms for components to respond
    });
  }
  
  /**
   * Load a saved layout
   * @param {string} layoutJson - The layout JSON to load
   */
  loadLayout(layoutJson) {
    try {
      const layout = JSON.parse(layoutJson);
      this.broadcast(PREFERENCE_MESSAGES.LOAD_LAYOUT, layout);
      return true;
    } catch (error) {
      console.error('Error loading layout:', error);
      return false;
    }
  }
}

export default PreferenceDialog;

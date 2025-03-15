/**
 * Preferences.js
 * 
 * This class manages application preferences and layout persistence.
 * It extends MessageBus to integrate with the messaging system.
 */

import MessageBus from './MessageBus.mjs';

// Message types for preferences
export const PREFERENCES_MESSAGES = {
  GET_LAYOUT_INFO: 'GET_LAYOUT_INFO',
  LAYOUT_INFO: 'LAYOUT_INFO',
  SAVE_LAYOUT: 'SAVE_LAYOUT',
  LOAD_LAYOUT: 'LOAD_LAYOUT'
};

class Preferences extends MessageBus {
  /**
   * Constructor
   */
  constructor() {
    super('preferences');
    
    // Storage for layout information from components
    this.layoutInfo = {};
    
    // Register message handlers
    this.registerMessageHandler(PREFERENCES_MESSAGES.LAYOUT_INFO, this.handleLayoutInfo.bind(this));
  }
  
  /**
   * Initialize the preferences system
   */
  initialize() {
    console.log('Preferences system initialized');
  }
  
  /**
   * Handle layout information received from components
   * @param {Object} message - The message containing layout information
   */
  handleLayoutInfo(message) {
    if (!message || !message.source || !message.data) return;
    
    // Store the layout information from this component
    this.layoutInfo[message.source] = message.data;
    
    console.log(`Received layout info from ${message.source}`);
  }
  
  /**
   * Save the layout of all components
   * @returns {string} - JSON string of the layout information
   */
  saveLayout() {
    // Clear previous layout information
    this.layoutInfo = {};
    
    // Request layout information from all components
    this.sendMessage({
      type: PREFERENCES_MESSAGES.GET_LAYOUT_INFO,
      source: this.id,
      broadcast: true
    });
    
    // Give components time to respond
    return new Promise(resolve => {
      setTimeout(() => {
        // Create the final layout object
        const layout = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          components: this.layoutInfo
        };
        
        // Convert to JSON string
        const layoutJson = JSON.stringify(layout, null, 2);
        console.log('Layout saved:', layoutJson);
        
        resolve(layoutJson);
      }, 500); // Wait 500ms for all components to respond
    });
  }
}

export default Preferences;

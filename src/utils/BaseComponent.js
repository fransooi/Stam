/**
 * BaseComponent.js - Base class for components with messaging capabilities
 * 
 * This class provides a foundation for components to participate in the messaging system.
 * It handles component registration, message handling, and provides methods for sending
 * messages in different directions through the component tree.
 */

import { generateComponentID, registerComponentInstance, unregisterComponent } from './ComponentID.js';
import messageBus from './MessageBus.js';

export default class BaseComponent {
  /**
   * Create a new BaseComponent
   * 
   * @param {string} componentName - Name of the component (used for ID generation)
   * @param {string|null} parentId - ID of the parent component, or null if root component
   */
  constructor(componentName, parentId = null) {
    // Generate a unique ID for this component
    this.componentId = generateComponentID(componentName);
    this.componentName = componentName;
    this.parentId = parentId;
    
    // Register this component with the ComponentID registry
    registerComponentInstance(this.componentId, this);
    
    // Register with the message bus
    messageBus.registerComponentInTree(this.componentId, parentId);
    
    // Set up message handling
    this.messageHandler = this.handleMessage.bind(this);
    this.unsubscribeFromMessages = messageBus.registerAddressedHandler(
      this.componentId, 
      this.messageHandler,
      this
    );
    
    console.log(`Component ${componentName} created with ID: ${this.componentId}`);
  }
  
  /**
   * Get the component's unique ID
   * 
   * @returns {string} - The component's ID
   */
  getComponentID() {
    return this.componentId;
  }
  
  /**
   * Get the component's parent ID
   * 
   * @returns {string|null} - The parent component's ID or null if root
   */
  getParentID() {
    return this.parentId;
  }
  
  /**
   * Register a component in the message tree
   * 
   * @param {string} componentId - The component's unique ID
   * @param {string|null} parentId - The parent component's ID, or null if root
   */
  registerComponentInTree(componentId, parentId = null) {
    messageBus.registerComponentInTree(componentId, parentId);
  }
  
  /**
   * Handle incoming messages (to be overridden by subclasses)
   * 
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`${this.componentId} received message: ${messageType}`, messageData);
    // Subclasses should override this method
    return false; // Not handled by default
  }
  
  /**
   * Send message down toward the root
   * 
   * @param {string} messageType - Type of message to send
   * @param {Object} messageData - Data to send with the message
   * @returns {boolean} - True if the message was delivered
   */
  sendMessageDown(messageType, messageData = {}) {
    return messageBus.sendDown(this.componentId, {
      type: messageType,
      data: messageData
    });
  }
  
  /**
   * Send message up toward specific branches
   * 
   * @param {string|Array} targetComponentIds - Target component ID(s)
   * @param {string} messageType - Type of message to send
   * @param {Object} messageData - Data to send with the message
   * @returns {boolean} - True if the message was delivered to at least one target
   */
  sendMessageUp(targetComponentIds, messageType, messageData = {}) {
    return messageBus.sendUp(this.componentId, targetComponentIds, {
      type: messageType,
      data: messageData
    });
  }
  
  /**
   * Broadcast message up to all branches
   * 
   * @param {string} messageType - Type of message to send
   * @param {Object} messageData - Data to send with the message
   * @returns {number} - Number of components that received the message
   */
  broadcastMessageUp(messageType, messageData = {}) {
    return messageBus.broadcastUp(this.componentId, {
      type: messageType,
      data: messageData
    });
  }
  
  /**
   * Find route to another component
   * 
   * @param {string} targetComponentId - ID of the target component
   * @returns {string|null} - The route as a colon-separated string, or null if no route exists
   */
  findRouteTo(targetComponentId) {
    return messageBus.findRoute(this.componentId, targetComponentId);
  }
  
  /**
   * Send message via a specific route
   * 
   * @param {string} route - The route as a colon-separated string of component IDs
   * @param {string} messageType - Type of message to send
   * @param {Object} messageData - Data to send with the message
   * @returns {boolean} - True if the message was delivered
   */
  sendMessageViaRoute(route, messageType, messageData = {}) {
    return messageBus.sendViaRoute(this.componentId, route, {
      type: messageType,
      data: messageData
    });
  }
  
  /**
   * Send message directly to a target component
   * 
   * @param {string} targetComponentId - ID of the target component
   * @param {string} messageType - Type of message to send
   * @param {Object} messageData - Data to send with the message
   * @returns {boolean} - True if the message was delivered
   */
  sendMessageTo(targetComponentId, messageType, messageData = {}) {
    const route = this.findRouteTo(targetComponentId);
    if (route !== null) {
      return this.sendMessageViaRoute(route, messageType, messageData);
    } else {
      console.warn(`No route found from ${this.componentId} to ${targetComponentId}`);
      return false;
    }
  }
  
  /**
   * Register a command handler
   * 
   * @param {string} command - The command to handle
   * @param {Function} handler - The handler function
   * @returns {Function} - Function to unregister the handler
   */
  registerCommandHandler(command, handler) {
    return messageBus.registerHandler(command, handler, this);
  }
  
  /**
   * Send a command through the message bus
   * 
   * @param {string} command - The command to send
   * @param {Object} data - Data to send with the command
   * @returns {boolean} - True if the command was handled
   */
  sendCommand(command, data = {}) {
    return messageBus.sendCommand(command, data, this);
  }
  
  /**
   * Clean up resources when component is destroyed
   */
  destroy() {
    console.log(`Destroying component: ${this.componentId}`);
    
    // Unregister from message bus
    if (this.unsubscribeFromMessages) {
      this.unsubscribeFromMessages();
    }
    
    // Unregister from component tree
    messageBus.unregisterComponent(this.componentId);
    
    // Unregister from ComponentID registry
    unregisterComponent(this.componentId);
  }
}

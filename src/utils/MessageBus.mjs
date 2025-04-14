/**
 * MessageBus.js - A bidirectional messaging system for command handling
 * 
 * This class provides a centralized way to send and handle commands throughout the application.
 * Commands can flow up from child components to parent components (bubbling),
 * or down from parent components to specific child components (targeting).
 * 
 * The natural tree metaphor is used: "up" means from root toward branches,
 * and "down" means from branches toward root.
 */

class MessageBus {
  constructor() {
    this.handlers = {};
    this.globalHandlers = [];
    this.addressedHandlers = new Map(); // Map of componentId to handler functions
    this.componentRegistry = {}; // Registry of component relationships (parent-child)
  }

  /**
   * Register a handler for a specific command
   * 
   * @param {string} command - The command to handle
   * @param {Function} handler - The handler function (returns true if command was handled)
   * @param {Object} context - The context in which to call the handler
   * @returns {Function} - A function to unregister the handler
   */
  registerHandler(command, handler, context) {
    if (!this.handlers[command]) {
      this.handlers[command] = [];
    }
    
    const handlerInfo = { handler, context };
    this.handlers[command].push(handlerInfo);
    
    // Return a function to unregister this handler
    return () => {
      if (this.handlers[command]) {
        const index = this.handlers[command].findIndex(h => 
          h.handler === handler && h.context === context);
        
        if (index !== -1) {
          this.handlers[command].splice(index, 1);
        }
        
        if (this.handlers[command].length === 0) {
          delete this.handlers[command];
        }
      }
    };
  }
  
  /**
   * Register a global handler that will receive all commands
   * 
   * @param {Function} handler - The handler function (returns true if command was handled)
   * @param {Object} context - The context in which to call the handler
   * @returns {Function} - A function to unregister the handler
   */
  registerGlobalHandler(handler, context) {
    const handlerInfo = { handler, context };
    this.globalHandlers.push(handlerInfo);
    
    // Return a function to unregister this handler
    return () => {
      const index = this.globalHandlers.findIndex(h => 
        h.handler === handler && h.context === context);
      
      if (index !== -1) {
        this.globalHandlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Register a component to receive addressed messages
   * 
   * @param {string} componentId - The unique ID of the component
   * @param {Function} handler - The handler function for addressed messages
   * @param {Object} context - The context in which to call the handler
   * @returns {Function} - A function to unregister the handler
   */
  registerAddressedHandler(componentId, handler, context) {
    if (!componentId) {
      throw new Error('Component ID is required for addressed message handling');
    }
    
    const handlerInfo = { handler, context };
    this.addressedHandlers.set(componentId, handlerInfo);
    
    // Return a function to unregister this handler
    return () => {
      if (this.addressedHandlers.has(componentId)) {
        this.addressedHandlers.delete(componentId);
      }
    };
  }
  
  /**
   * Register a component in the component tree for message routing
   * 
   * @param {string} componentId - The component's unique ID
   * @param {string|null} parentId - The parent component's ID, or null if root
   * @returns {string} - The registered component ID
   */
  registerComponentInTree(componentId, parentId = null) {
    this.componentRegistry[componentId] = {
      parentId,
      children: []
    };
    
    // If this component has a parent, add it to the parent's children
    if (parentId && this.componentRegistry[parentId]) {
      this.componentRegistry[parentId].children.push(componentId);
    }
    return componentId;
  }
  
  /**
   * Unregister a component from the component tree
   * 
   * @param {string} componentId - The component's unique ID
   */
  unregisterComponent(componentId) {
    const component = this.componentRegistry[componentId];
    if (!component) return;
    
    // Remove this component from its parent's children list
    if (component.parentId && this.componentRegistry[component.parentId]) {
      const parentChildren = this.componentRegistry[component.parentId].children;
      const index = parentChildren.indexOf(componentId);
      if (index !== -1) {
        parentChildren.splice(index, 1);
      }
    }
    
    // Remove this component from the registry
    delete this.componentRegistry[componentId];
  }
  
  /**
   * Check target ID and return the appropriate component ID
   * 
   * @param {string} targetId - The target component ID
   * @returns {string|Array} - The component ID or array of component IDs
   */
  checkTargetId(targetId) {
    if (targetId){
      if ( targetId.substring(0, 6)=='class:') {
        return this.getComponentsByClassName(targetId.substring(6));
      }else if ( targetId.substring(0, 3)=='id:') {
        return this.getComponentById(targetId.substring(3));
      }else if ( targetId=='root') {
        return this.root.componentId;
      }
    }
    return targetId;
  }
    
  
  
  /**
   * Send a message to a specific component by ID (downward flow)
   * 
   * @param {string} targetID - The ID of the target component
   * @param {string} message - The message to send
   * @param {Object} data - Additional data to send with the message
   * @param {string} senderId - The ID of the component that sent the message
   * @returns {boolean} - True if the message was delivered to the target
   */
  async sendMessage(targetID, message, data = {}, senderId = null) {
    targetID = this.checkTargetId(targetID);
    if ( targetID){
      if (Array.isArray(targetID)) {
        if (targetID.length > 1) {
          for (const id of targetID) {
            if (this.addressedHandlers.has(id)) {
              const { handler, context } = this.addressedHandlers.get(id);
              await handler.call(context, message, data, senderId);
            }
          }
          return true;
        }
        targetID = targetID[0];
      }
    }
    if (targetID && this.addressedHandlers.has(targetID)) {
      const { handler, context } = this.addressedHandlers.get(targetID);      
      return await handler.call(context, message, data, senderId);
    }    
    return false;
  }

  /**
   * Send a request to a specific component by ID (downward flow)
   * 
   * @param {string} targetID - The ID of the target component
   * @param {string} message - The message to send
   * @param {Object} data - Additional data to send with the message
   * @param {string} senderId - The ID of the component that sent the message
   * @returns {Promise} - A promise that resolves to the response from the target component
   */
  async sendRequest(targetID, message, data = {}, senderId = null) {
    targetID = this.checkTargetId(targetID);

    if ( targetID){
      if (Array.isArray(targetID)) {
        if (targetID.length > 1) {
          var answer = [];
          for (const id of targetID) {
            if (this.addressedHandlers.has(id)) {
              const { handler, context } = this.addressedHandlers.get(id);
              answer.push(await handler.call(context, message, data, senderId));
            }
          }
          return answer;
        }
        targetID = targetID[0];
      }
    }
    if (this.addressedHandlers.has(targetID)) {
      const { handler, context } = this.addressedHandlers.get(targetID);
      var answer = await handler.call(context, message, data, senderId);
      return answer;
    }    
    return { error: 'Target not found.' };
  }
  
  /**
   * Broadcast a message to all registered handlers without traversing the component tree
   * 
   * @param {string} message - The message to broadcast
   * @param {Object} data - Additional data to send with the message
   * @param {string} senderId - The ID of the component that sent the message
   * @param {Array} excludeIDs - Array of component IDs to exclude from the broadcast
   * @returns {number} - Number of components that received the message
   */
  async broadcastToHandlers(message, data = {}, senderId = null, excludeIDs = []) {
    let deliveryCount = 0;
    
    // Convert excludeIDs to a Set for faster lookups
    const excludeSet = new Set(excludeIDs);
    
    // Send to all registered addressed handlers
    for (const [componentId, handlerInfo] of this.addressedHandlers.entries()) {
      // Skip excluded components
      if (excludeSet.has(componentId)) {
        continue;
      }
      
      const { handler, context } = handlerInfo;
      
      // Call the handler with the message
      await handler.call(context, message, data, senderId);
      deliveryCount++;
    }
    
    return deliveryCount;
  };
  
  
  /**
   * Broadcast a message to all components in the component tree starting from the root, 
   * excluding the sender
   */
  async broadcast(fromComponentId,message) {
    return await this.broadcastUp(null,message,function(id)
    {
      return id !== fromComponentId;
    });
  }

  /**
   * Send message up to all branches (from a node to all its children)
   * 
   * @param {string} fromComponentId - The source component ID
   * @param {Object} message - The message to send
   * @param {Function} includeCallback - Callback to determine if a component should be included
   * @returns {Promise<number>} - Number of components that received the message
   */
  async broadcastUp(fromComponentId,message,includeCallback=null) {       
    // Find the root component (StamApp)
    if (!fromComponentId) 
      fromComponentId=this.root.componentId;    

    // Send to all components starting from the root, excluding the sender
    const self = this;
    const sendToAllExceptSender = async function(componentId)
    {      
      let count = 0;
      
      // Send to this component
      var toSend;
      if(includeCallback)
        toSend=includeCallback(componentId);
      else
        toSend=(componentId !== fromComponentId);
      if (toSend) 
      {
        const delivered = await self.sendMessage(componentId, message.type || 'MESSAGE', {
          ...message,
          from: fromComponentId
        }, fromComponentId);
        
        if (delivered) {
          count++;
        }
      }
      
      // Send to all children recursively
      const component = self.componentRegistry[componentId];
      if (component && component.children.length) {
        for(var child=0; child<component.children.length; child++)
        {
          count += await sendToAllExceptSender(component.children[child]);
        }
      }
      return count;
    };    

    return await sendToAllExceptSender(fromComponentId);
  };
  
  /**
   * Find a route from source to target component
   * 
   * @param {string} sourceId - The source component ID
   * @param {string} targetId - The target component ID
   * @returns {string|null} - The route as a colon-separated string of component IDs, or null if no route exists
   */
  findRoute(sourceId, targetId) {
    // If source and target are the same, return empty route
    if (sourceId === targetId) {
      return '';
    }
    
    // Try to find route going up the tree (toward branches)
    const upRoute = this._findRouteUp(sourceId, targetId);
    if (upRoute) {
      return upRoute;
    }
    
    // Try to find route going down the tree (toward root)
    const downRoute = this._findRouteDown(sourceId, targetId);
    if (downRoute) {
      return downRoute;
    }
    
    // Try to find a common ancestor and build a route through it
    return this._findRouteViaCommonAncestor(sourceId, targetId);
  };
  
  /**
   * Find route going up from source to target (source is closer to root than target)
   * 
   * @param {string} sourceId - The source component ID
   * @param {string} targetId - The target component ID
   * @param {Set} visited - Set of visited component IDs to prevent cycles
   * @param {string} currentPath - Current path being built
   * @returns {string|null} - The route or null if no route exists
   * @private
   */
  _findRouteUp(sourceId, targetId, visited = new Set(), currentPath = '') {
    // Prevent infinite loops
    if (visited.has(sourceId)) {
      return null;
    }
    visited.add(sourceId);
    
    const component = this.componentRegistry[sourceId];
    if (!component) {
      return null;
    }
    
    // Check if any child is the target
    for (const childId of component.children) {
      if (childId === targetId) {
        return currentPath ? `${currentPath}:${childId}` : childId;
      }
      
      // Recursively check this child's children
      const childPath = currentPath ? `${currentPath}:${childId}` : childId;
      const route = this._findRouteUp(childId, targetId, visited, childPath);
      if (route) {
        return route;
      }
    }
    
    return null;
  };
  
  /**
   * Find route going down from source to target (source is further from root than target)
   * 
   * @param {string} sourceId - The source component ID
   * @param {string} targetId - The target component ID
   * @returns {string|null} - The route or null if no route exists
   * @private
   */
  _findRouteDown(sourceId, targetId) {
    const component = this.componentRegistry[sourceId];
    if (!component || !component.parentId) {
      return null;
    }
    
    // Check if parent is the target
    if (component.parentId === targetId) {
      return targetId;
    }
    
    // Recursively check the parent
    const route = this._findRouteDown(component.parentId, targetId);
    if (route) {
      return route;
    }
    
    return null;
  };
  
  /**
   * Find route via common ancestor when direct up/down routes don't exist
   * 
   * @param {string} sourceId - The source component ID
   * @param {string} targetId - The target component ID
   * @returns {string|null} - The route or null if no route exists
   * @private
   */
  _findRouteViaCommonAncestor(sourceId, targetId) {
    // Get path from source to root
    const sourceToRoot = this._getPathToRoot(sourceId);
    
    // Get path from target to root
    const targetToRoot = this._getPathToRoot(targetId);
    
    // Find common ancestor
    let commonAncestor = null;
    for (const sourceAncestor of sourceToRoot) {
      if (targetToRoot.includes(sourceAncestor)) {
        commonAncestor = sourceAncestor;
        break;
      }
    }
    
    if (!commonAncestor) {
      return null; // No common ancestor found
    }
    
    // Build route: down from source to common ancestor, then up to target
    const downRoute = this._buildDownRoute(sourceId, commonAncestor);
    if (!downRoute) {
      return null;
    }
    
    // Get the path from common ancestor to target
    const upPath = [];
    let current = targetId;
    
    while (current !== commonAncestor) {
      upPath.unshift(current);
      current = this.componentRegistry[current]?.parentId;
      if (!current) break;
    }
    
    // Combine the routes
    if (upPath.length === 0) {
      return downRoute; // Target is the common ancestor
    }
    
    return `${downRoute}:${upPath.join(':')}`;
  };
  
  /**
   * Get path from component to root
   * 
   * @param {string} componentId - The component ID
   * @returns {Array} - Array of component IDs from the component to the root
   * @private
   */
  _getPathToRoot(componentId) {
    const path = [];
    let current = componentId;
    
    while (current) {
      path.push(current);
      current = this.componentRegistry[current]?.parentId;
    }
    
    return path;
  };
  
  /**
   * Build route going down from source to ancestor
   * 
   * @param {string} sourceId - The source component ID
   * @param {string} ancestorId - The ancestor component ID
   * @returns {string|null} - The route or null if no route exists
   * @private
   */
  _buildDownRoute(sourceId, ancestorId) {
    if (sourceId === ancestorId) {
      return sourceId;
    }
    
    const path = [];
    let current = sourceId;
    
    while (current !== ancestorId) {
      path.push(current);
      current = this.componentRegistry[current]?.parentId;
      if (!current) return null; // Ancestor not found in path
    }
    
    path.push(ancestorId);
    return path.join(':');
  };
  
  /**
   * Send message down toward the root (from branches to root)
   * 
   * @param {string} fromComponentId - The source component ID
   * @param {Object} message - The message to send
   * @returns {boolean} - True if the message was delivered
   */
  sendDown(fromComponentId, message) {
    const component = this.componentRegistry[fromComponentId];
    if (!component || !component.parentId) return false;
    
    // Deliver to parent
    const delivered = this.sendMessage(component.parentId, message.type || 'MESSAGE', {
      ...message,
      from: fromComponentId,
      direction: 'down'
    }, fromComponentId);
    
    // Continue down the tree toward the root
    if (delivered) {
      this.sendDown(component.parentId, message);
    }
    
    return delivered;
  };
  
  /**
   * Send message up toward specific branches (from root/parent to specific children)
   * 
   * @param {string} fromComponentId - The source component ID
   * @param {string|Array} targetComponentIds - The target component ID(s)
   * @param {Object} message - The message to send
   * @returns {boolean} - True if the message was delivered to at least one target
   */
  sendUp(fromComponentId, targetComponentIds, message) {
    if (typeof targetComponentIds === 'string') {
      // Handle case where targetComponentIds is a single string
      targetComponentIds = targetComponentIds.split(':');
    }
    
    let anyDelivered = false;
    
    targetComponentIds.forEach(targetId => {
      const delivered = this.sendMessage(targetId, message.type || 'MESSAGE', {
        ...message,
        from: fromComponentId,
        direction: 'up'
      }, fromComponentId);
      
      if (delivered) {
        anyDelivered = true;
      }
    });
    
    return anyDelivered;
  };
  
  /**
   * Send message via a specific route
   * 
   * @param {string} fromComponentId - The source component ID
   * @param {string} route - The route as a colon-separated string of component IDs
   * @param {Object} message - The message to send
   * @returns {boolean} - True if the message was delivered
   */
  sendViaRoute(fromComponentId, route, message) {
    if (!route) return false;
    
    const routeParts = route.split(':');
    const targetId = routeParts[routeParts.length - 1];
    
    return this.sendMessage(targetId, message.type || 'MESSAGE', {
      ...message,
      from: fromComponentId,
      route: route,
      direction: routeParts.length > 1 ? 'route' : 'direct'
    }, fromComponentId);
  };
  
  /**
   * Get all component IDs that are instances of a specific class
   * 
   * @param {string} className - The class name to find instances of
   * @returns {Array} - Array of component IDs that are instances of the specified class
   */
  getComponentsByClassName(className) {
    const matchingComponents = [];
    
    // Iterate through all registered components
    for (const [componentId, component] of this.addressedHandlers.entries()) {
      // Get the actual component instance from the registry
      const componentInstance = component.context;
      
      // Check if the component is an instance of the specified class
      // This checks both the constructor name and any parent class names in the prototype chain
      if (componentInstance && 
          (componentInstance.constructor.name === className || 
           componentInstance.componentName === className)) {
        matchingComponents.push(componentId);
      }
    }
    
    return matchingComponents;
  }
  
  /**
   * Forward a message to all components of a specific class type
   * 
   * @param {string} action - The action/message type to send
   * @param {string} className - The class name to forward the message to
   * @param {Object} messageData - The message data to send
   * @param {string} senderId - The ID of the component that sent the message
   * @returns {number} - Number of components that received the message
   */
  forward(action, className, messageData = {}, senderId = null) {
    // Get all components of the specified class
    const targetComponents = this.getComponentsByClassName(className);
    let deliveryCount = 0;
    
    // Send the message to each matching component
    for (const componentId of targetComponents) {
      const delivered = this.sendMessage(componentId, action, {
        ...messageData,
        forwarded: true,
        originalSender: senderId
      }, senderId);
      
      if (delivered) {
        deliveryCount++;
      }
    }
    
    return deliveryCount;
  }
  
  /**
   * Clear all handlers
   */
  clear() {
    this.handlers = {};
    this.globalHandlers = [];
    this.addressedHandlers.clear();
    this.componentRegistry = {};
  };

  setRoot(component) {
    this.root = component;
  } 
  
  getRoot() {
    return this.root;
  }
}

// Create a singleton instance
var messageBus = new MessageBus();

export default messageBus;

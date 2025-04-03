/**
 * ComponentID.js - Utility for generating unique component identifiers
 * 
 * This utility provides functions for generating and managing unique identifiers
 * for components in the STAM application. These IDs are used for message routing
 * and component identification.
 */

// Store all generated IDs to ensure uniqueness
const generatedIDs = new Set();

// Store component references by ID for lookup
const componentRegistry = new Map();

/**
 * Generate a random string of specified length
 * 
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  
  return result;
}

/**
 * Generate a unique component ID based on component name
 * 
 * @param {string} componentName - Name of the component
 * @returns {string} - Unique component ID
 */
function generateComponentID(componentName) {
  // Ensure component name is valid
  if (!componentName || typeof componentName !== 'string') {
    throw new Error('Component name must be a non-empty string');
  }
  
  // Generate a unique ID
  let uniqueID;
  do {
    const randomPart = generateRandomString(8);
    uniqueID = `${componentName}_${randomPart}`;
  } while (generatedIDs.has(uniqueID));
  
  // Store the ID to ensure future uniqueness
  generatedIDs.add(uniqueID);
  
  return uniqueID;
}

/**
 * Register a component instance with its ID in the component registry
 * 
 * @param {string} componentId - The component's unique ID
 * @param {Object} component - The component instance
 */
function registerComponentInstance(componentId, component) {
  if (!componentId || !component) {
    throw new Error('Both componentId and component must be provided');
  }
  
  componentRegistry.set(componentId, component);
}

/**
 * Unregister a component
 * 
 * @param {string} componentId - The component's unique ID
 */
function unregisterComponent(componentId) {
  if (componentRegistry.has(componentId)) {
    componentRegistry.delete(componentId);
  }
}

/**
 * Get a component by its ID
 * 
 * @param {string} componentId - The component's unique ID
 * @returns {Object|null} - The component instance or null if not found
 */
function getComponentByID(componentId) {
  return componentRegistry.get(componentId) || null;
}

/**
 * Get all registered components
 * 
 * @returns {Map} - Map of all registered components
 */
function getAllComponents() {
  return new Map(componentRegistry);
}

export {
  generateComponentID,
  registerComponentInstance,
  unregisterComponent,
  getComponentByID,
  getAllComponents
};

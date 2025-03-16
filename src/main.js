import './style.css'
import './components/interface/sidewindows/sidewindows.css'

// Import components
import MenuBar from './components/MenuBar.js';
import StatusBar from './components/StatusBar.js';
import Editor from './components/Editor.js';
import IconBar from './components/IconBar.js';
import SideBar from './components/SideBar.js';
import BaseComponent from './utils/BaseComponent.js';
import { PREFERENCE_MESSAGES } from './utils/BaseComponent.js';
import PreferenceDialog from './components/PreferenceDialog.js';

// Main application class
class PCOSApp extends BaseComponent {
  constructor() {
    // Initialize the base component with component name
    super('PCOSApp');
    
    // Storage for layout information from components
    this.layoutInfo = {};

    // Initialize mode
    this.currentMode = 'modern'; // Default mode: 'modern', 'stos', 'amos1_3', 'amosPro', 'c64'
    
    // Initialize components
    this.menuBar = null;
    this.statusBar = null;
    this.editor = null;
    this.iconBar = null;
    this.sideBar = null;
    this.preferenceDialog = null;
    
    // Initialize the application
    this.init();
  }
  
  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initComponents());
    } else {
      this.initComponents();
    }
  }
  
  initComponents() {
    // Initialize all components
    this.menuBar = new MenuBar('menu-bar', (mode) => this.handleModeChange(mode), this.currentMode);
    this.statusBar = new StatusBar('status-line');
    this.editor = new Editor('editor-area', this.currentMode);
    this.iconBar = new IconBar('icon-area', null, this.currentMode);
    this.sideBar = new SideBar('info-area');
    
    // Initialize preference dialog
    this.preferenceDialog = new PreferenceDialog(this.getComponentID());
    
    // Register components in the component tree
    this.registerComponentInTree(this.menuBar.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.statusBar.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.editor.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.iconBar.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.sideBar.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.preferenceDialog.getComponentID(), this.getComponentID());
    
    // Set up mode selector
    const modeSelector = document.getElementById('mode-selector');
    if (modeSelector) {
      modeSelector.value = this.currentMode;
      modeSelector.addEventListener('change', (event) => {
        this.handleModeChange(event.target.value);
      });
    }
    
    // Load any saved layout
    this.loadLayout();
    
    // Render all components
    this.menuBar.render();
    this.statusBar.render();
    this.iconBar.render();
    this.sideBar.render();
    this.editor.render();
    
    // Set initial status
    this.statusBar.setStatus(`Mode: ${this.currentMode}`);
    
    // Log initialization
    console.log('PCOS Application initialized in ' + this.currentMode + ' mode');
  }
  
  // Handle the MODE_CHANGE command
  handleModeChange(mode) {
    
    // Update current mode
    this.currentMode = mode;
    
    // Update body class for mode-specific styling
    document.body.classList.remove('modern-mode', 'stos-mode', 'amos1_3-mode', 'amosPro-mode', 'c64-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // Broadcast mode change messages to components
    this.broadcast('MODE_CHANGE', { mode });
    
    return true; // Command handled
  }
  
  /**
   * Handle incoming messages
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`PCOSApp received message: ${messageType}`, messageData, sender);
    
    // Handle specific message types
    switch (messageType) {
      case 'COMMAND':
        // Handle commands
        if (messageData && messageData.command) {
          return this.handleCommand(messageData.command, messageData.params);
        }
        return false;
        
      case 'MODE_CHANGE':
        this.handleModeChange(messageData.data.mode);
        return true;
        
      case PREFERENCE_MESSAGES.SAVE_LAYOUT:
        this.saveLayout();
        return true;
        
      case 'MENU_ACTION':
        return this.handleMenuAction(messageData, sender);
        
      case 'ICON_ACTION':
        return this.handleIconAction(messageData, sender);
        
      case PREFERENCE_MESSAGES.LAYOUT_INFO:
        // Store the layout information from this component
        if (sender) {
          this.layoutInfo[sender] = messageData.data || messageData;
          console.log(`Received layout info from ${sender}`);
        }
      return true;
    }
    
    // If we get here, the message wasn't handled
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Handle menu actions from MenuBar
   * @param {Object} action - Action data
   * @param {Object} sender - Component that sent the action
   * @returns {boolean} - True if the action was handled
   */
  handleMenuAction(action, sender) {
    console.log('Menu action:', action);
    
    // Handle specific menu actions
    switch (action.data.option.toLowerCase()) {
      case 'new':
        // Handle new file action
        console.log('New file action');
        return true;
        
      case 'open':
        // Handle open file action
        console.log('Open file action');
        return true;
        
      case 'save':
        // Handle save file action
        console.log('Save file action');
        return true;
        
      case 'preferences':
        // Show preferences dialog
        this.showPreferences();
        return true;
        
      case 'debug1':
        // Call saveLayout function
        this.debug1();
        return true;
        
      case 'debug2':
        // Call loadLayout function
        this.debug2();
        return true;
        
      // Add more menu actions as needed
    }
    
    console.log(`Unhandled menu action: ${action.action}`);
    return false;
  }
  
  /**
   * Debug2 function - Load the saved layout
   */
  loadLayout() {
    console.log('Loading interface layout...');
    this.loadStorage('pcos-layout')
      .then(data => {
        if (data) {
          this.recreateInterface(data);
        }
      })
      .catch(error => {
        console.error('Debug2: Error loading layout:', error);
      });
  }
  
  /**
   * Save the current layout
   */
  saveLayout() {
    console.log('Saving interface layout...');
    this.getLayout()
      .then(layoutJson => {
        if (layoutJson) {
          this.saveStorage('pcos-layout', layoutJson);
        } 
      })
      .catch(error => {
        console.error('Error saving layout:', error);
      });
  }

  /**
   * Debug1 function - Save the current layout
   */
  debug1() {
    this.saveLayout();
  }

  /**
   * Debug2 function - Load the saved layout
   */
  debug2() {
    console.log('Debug2');
  }
  
  /**
   * Show the preferences dialog
   */
  showPreferences() {
    if (this.preferenceDialog) {
      this.sendMessageTo(this.preferenceDialog.getComponentID(), PREFERENCE_MESSAGES.SHOW_PREFERENCES);
    }
  }
  
  /**
   * Returns the current layout JSON string
   * @returns {Promise<string>} - Promise that resolves with the layout JSON
   */
  getLayout() {
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
      }, 250); // Wait 500ms for components to respond
    });
  }
  
  /**
   * Save data to localStorage
   * @param {string} name - Name of the data
   * @param {string} data - Data to save
   * @returns {Promise<boolean>} - Promise that resolves with success status
   */
  saveStorage(name, data) {
    
    try {
        localStorage.setItem(name, data);
        return Promise.resolve(true);
      }
    catch(error) {
        console.error('Error saving :' + name, error);
        return Promise.resolve(false);
      };
  }
  
  /**
   * Load a saved layout
   * @returns {Promise<boolean>} - Promise that resolves with success status
   */
  loadStorage(name) {
    try {
      const data = localStorage.getItem(name);
      if (!data) return Promise.resolve(false);
      return Promise.resolve(data);
    } catch (error) {
      console.error('Error loading ' + name + ':', error);
      return Promise.resolve(false);
    }
  }
  
  /**
   * Recreate the interface from a saved layout
   * This function loads the layout from localStorage and recreates the interface
   * @returns {Promise<boolean>} - Promise that resolves with success status
   */
  recreateInterface(layoutJson) {
    console.log('Recreating interface from saved layout...');
    
    try {
      // Parse the layout JSON
      const layout = JSON.parse(layoutJson);
      console.log('Loaded layout:', layout);
      
      // Validate the layout
      if (!layout || !layout.components) {
        console.error('Invalid layout format');
        return Promise.resolve(false);
      }
      
      // Process each component in the layout
      Object.values(layout.components).forEach(componentInfo => {
        if (!componentInfo || !componentInfo.componentName) {
          console.error('Invalid component info:', componentInfo);
          return;
        }
        
        console.log(`Broadcasting layout to ${componentInfo.componentName}`);
        
        // Broadcast the layout info to all components
        // Each component will check if the layout is for them and apply it
        this.broadcast(PREFERENCE_MESSAGES.LOAD_LAYOUT, {
          componentName: componentInfo.componentName,
          layoutInfo: componentInfo
        });
      });
      
      console.log('Interface recreated successfully');
      return Promise.resolve(true);
    } catch (error) {
      console.error('Error recreating interface:', error);
      return Promise.resolve(false);
    }
  }
  
  /**
   * Handle icon actions from IconBar
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the action was handled
   */
  handleIconAction(messageData, sender) {
    if (!messageData.data || !messageData.data.action) return false;
    
    var action = messageData.data.action;
    console.log(`PCOSApp handling icon action: ${action}`);
    
    // Handle different icon actions
    switch (action) {
      case 'run':
        return true;
        
      case 'debug':
        return true;
        
      case 'stop':
        return true;
        
      // Add more icon actions as needed
    }
    
    // If we get here, the action wasn't handled
    console.log(`Unhandled icon action: ${action}`);
    return false;
  }
}

// Create and initialize the application
const pcosApp = new PCOSApp();

// Export the app instance for global access
window.pcosApp = pcosApp;

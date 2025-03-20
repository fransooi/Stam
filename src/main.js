import './style.css'
import './components/interface/sidewindows/sidewindows.css'

// Import components
import MenuBar from './components/MenuBar.js';
import StatusBar from './components/StatusBar.js';
import Editor from './components/Editor.js';
import IconBar from './components/IconBar.js';
import SideBar from './components/SideBar.js';  
import BaseComponent from './utils/BaseComponent.js';
import { MESSAGES } from './utils/BaseComponent.js';
import PreferenceDialog from './components/PreferenceDialog.js';
import messageBus from './utils/MessageBus.mjs';

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

    // Set as root
    messageBus.setRoot(this);
    
    // Initialize the application
    this.init();
  }
  
  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initApplication());
    } else {
      this.initApplication();
    }
  }
  
  /**
   * Initialize the application, checking for saved layout first
   */
  async initApplication() {
    console.log('Initializing PCOS application...');
    
    // Check for saved layout first to determine the initial mode
    try {
      const layoutData = await this.loadStorage('pcos-layout');
      
      if (layoutData) {
        console.log('Found saved layout, extracting mode before initialization');
        
        try {
          // Parse the layout JSON
          const layout = JSON.parse(layoutData);
          
          // Validate the layout
          if (layout && layout.components) {
            // First, check if the IconBar component has a saved mode
            const iconBarInfo = Object.values(layout.components).find(
              component => component.componentName === 'IconBar'
            );
            
            // If we found the IconBar info and it has a currentMode, set it first
            if (iconBarInfo && iconBarInfo.currentMode) {
              console.log(`Setting initial application mode to ${iconBarInfo.currentMode} from saved layout`);
              this.currentMode = iconBarInfo.currentMode;
            }
          }
        } catch (error) {
          console.error('Error parsing saved layout:', error);
          // Continue with default mode if there's an error
        }
      }
    } catch (error) {
      console.error('Error checking for saved layout:', error);
      // Continue with default mode if there's an error
    }
    
    // Now initialize components with the correct mode
    this.initComponents();
  }
  
  initComponents() {
    // Initialize all components with the correct mode from the start
    console.log(`Initializing components in ${this.currentMode} mode`);
    
    this.menuBar = new MenuBar(this.getComponentID(),'menu-bar');
    this.statusBar = new StatusBar(this.getComponentID(),'status-line');
    this.editor = new Editor(this.getComponentID(),'editor-area');
    this.iconBar = new IconBar(this.getComponentID(),'icon-area');
    this.sideBar = new SideBar(this.getComponentID(),'info-area');
    
    // Initialize preference dialog
    this.preferenceDialog = new PreferenceDialog(this.getComponentID());
    
    // Render all components
    this.menuBar.render();
    this.statusBar.render();
    this.iconBar.render();
    this.sideBar.render();
    this.editor.render();
    
    // Apply saved layout if it exists (after components are initialized)
    this.loadLayout();    
    
    // Log initialization
    console.log('PCOS Application initialized in ' + this.currentMode + ' mode');
  }
  
  // Handle the MODE_CHANGED command 
  handleModeChange(mode) {
    // Don't do anything if the mode hasn't changed
    if (this.currentMode === mode) {
      console.log(`Mode ${mode} is already active, no change needed`);
      return true;
    }
    
    // Send MODE_EXIT message with the old mode
    console.log(`Broadcasting MODE_EXIT message for ${this.currentMode} mode`);
    this.broadcast(MESSAGES.MODE_EXIT, { oldMode: this.currentMode, newMode: mode });
    
    // Update current mode
    const oldMode = this.currentMode;
    this.currentMode = mode;
    
    // Update body class for mode-specific styling
    document.body.classList.remove('modern-mode', 'stos-mode', 'amos1_3-mode', 'amosPro-mode', 'c64-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // Broadcast mode change messages to components
    this.broadcast(MESSAGES.MODE_CHANGE, { mode });

    // Send MODE_ENTER message with the new mode
    console.log(`Broadcasting MODE_ENTER message for ${mode} mode`);
    this.broadcast(MESSAGES.MODE_ENTER, { oldMode, newMode: mode });
    
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
      case MESSAGES.MODE_CHANGED:
        this.handleModeChange(messageData.data.mode);
        // Wait for mode change to be fully applied before notifying components
        setTimeout(() => {
          console.log('Broadcasting LAYOUT_READY message after mode change');
          this.broadcast(MESSAGES.LAYOUT_READY, { mode: this.currentMode });
        }, 1000);    
        return true;
        
      case MESSAGES.SAVE_LAYOUT:
        this.saveLayout();
        return true;
        
      case MESSAGES.MENU_ACTION:
        return this.handleMenuAction(messageData, sender);
        
      case MESSAGES.ICON_ACTION:
        return this.handleIconAction(messageData, sender);
        
      case MESSAGES.LAYOUT_INFO:
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
   * Load layout from storage and applies
   */
  loadLayout() {
    console.log('Loading interface layout...');
    this.loadStorage('pcos-layout')
      .then(data => {
        if (data) {
          this.recreateInterface(data);
          setTimeout(() => {
            console.log('Broadcasting LAYOUT_READY message after mode change');
            this.broadcast('LAYOUT_READY', { mode: this.currentMode });
          }, 1000);    
        }
      })
      .catch(error => {
        console.error('Error loading layout:', error);
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
      this.sendMessageTo(this.preferenceDialog.getComponentID(), MESSAGES.SHOW_PREFERENCES);
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
    this.broadcast(MESSAGES.GET_LAYOUT_INFO);
    
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
      
      // First, check if the IconBar component has a saved mode
      const iconBarInfo = Object.values(layout.components).find(
        component => component.componentName === 'IconBar'
      );
      
      // If we found the IconBar info and it has a currentMode, set it first
      if (iconBarInfo && iconBarInfo.currentMode) {
        console.log(`Setting application mode to ${iconBarInfo.currentMode} from saved layout`);
        this.handleModeChange(iconBarInfo.currentMode);
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
        this.broadcast(MESSAGES.LOAD_LAYOUT, {
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

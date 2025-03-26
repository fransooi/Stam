import './style.css'
import './components/interface/sidewindows/sidewindows.css'

// Import components
import MenuBar from './components/MenuBar.js';
import StatusBar from './components/StatusBar.js';
import Editor from './components/Editor.js';
import IconBar, { ICONACTIONS } from './components/IconBar.js';
import SideBar from './components/SideBar.js';  
import BaseComponent from './utils/BaseComponent.js';
import { MESSAGES } from './utils/BaseComponent.js';
import PreferenceDialog from './components/PreferenceDialog.js';
import messageBus from './utils/MessageBus.mjs';
import Utilities from './utils/Utilities.js';

// Main application class
class PCOSApp extends BaseComponent {
  constructor() {
    // Initialize the base component with component name
    super('PCOSApp');
    
    // Storage for layout information from components
    this.layoutInfo = {};

    // Initialize mode
    this.currentMode = 'modern'; // Default mode: 'modern', 'stos', 'amos1_3', 'amosPro', 'c64'
    this.possibleModes = [ 'modern', 'stos', 'amos1_3', 'amosPro', 'c64' ];

    // Initialize utilities
    this.utilities = new Utilities();
    
    // Set as root
    messageBus.setRoot(this);    

    // Initialize all components with the correct mode from the start
    this.sideBar = new SideBar(this.componentId,'info-area');
    this.menuBar = new MenuBar(this.componentId,'menu-bar');
    this.statusBar = new StatusBar(this.componentId,'status-line');
    this.iconBar = new IconBar(this.componentId,'icon-area');
    this.editor = new Editor(this.componentId,'editor-area');
    
    // Initialize preference dialog
    this.preferenceDialog = new PreferenceDialog(this.componentId);

    this.messageMap[MESSAGES.MENU_ACTION] = this.handleMenuAction;
    this.messageMap[MESSAGES.ICON_ACTION] = this.handleIconAction;
    this.messageMap[MESSAGES.LAYOUT_INFO] = this.handleLayoutInfo;
    this.messageMap[MESSAGES.MODE_CHANGED] = this.handleModeChanged;
  }
  
  async init(options = {}) {
    super.init(options);

    const layoutData=this.utilities.loadStorage('pcos-layout');  
    let layout;    
    if (layoutData) {
      // Parse the layout JSON
      layout = JSON.parse(layoutData);
      this.currentMode = layout.mode;        
    }
    else if (options.mode) {
      this.currentMode = options.mode;
    }
    else{
      this.currentMode='modern';
    }
    options.mode=this.currentMode;

    // Send INIT messages to components-> they create the rest of the tree
    if (layout) {
      layout.componentTypes = {};
      Object.values(layout.components).forEach(
        component => {
          layout.componentTypes[component.componentName] = component;
        }
      );
      options.layout=layout;
    }
    await this.broadcastUp(MESSAGES.INIT, options);

    // If no layout, create default side windows
    if (!layout){
      await this.sendMessageTo(this.sideBar.componentId,MESSAGES.ADD_SIDE_WINDOW, { type: 'ProjectSideWindow', height: 200, width:300 });
      await this.sendMessageTo(this.sideBar.componentId,MESSAGES.ADD_SIDE_WINDOW, { type: 'OutputSideWindow', height: 200 });
      await this.sendMessageTo(this.sideBar.componentId,MESSAGES.ADD_SIDE_WINDOW, { type: 'TVSideWindow', height: 200 });
      await this.sendMessageTo(this.sideBar.componentId,MESSAGES.ADD_SIDE_WINDOW, { type: 'SocketSideWindow', height: 100 });
    }

    // Send RENDER messages to components-> they display themselves
    await this.broadcastUp(MESSAGES.RENDER, options);
    if ( layout ){
      await this.broadcastUp(MESSAGES.LOAD_LAYOUT, layout);
    }
    await this.utilities.sleep(1000);
    await this.broadcastUp(MESSAGES.LAYOUT_READY);


    // Log initialization
    console.log('PCOS Application initialized in ' + this.currentMode + ' mode');
  }
    
  // Handle the MODE_CHANGED command 
  async changeMode(mode) {
    // Don't do anything if the mode hasn't changed
    if (this.currentMode === mode) {
      return true;
    }
    
    // Send MODE_EXIT message with the old mode
    await this.broadcastUp(MESSAGES.MODE_EXIT, { oldMode: this.currentMode, newMode: mode });
    
    // Update current mode
    const oldMode = this.currentMode;
    this.currentMode = mode;
    
    // Update body class for mode-specific styling
    document.body.classList.remove('modern-mode', 'stos-mode', 'amos1_3-mode', 'amosPro-mode', 'c64-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // Broadcast mode change messages to components
    await this.broadcastUp(MESSAGES.MODE_CHANGE, { mode: mode });

    // Send MODE_ENTER message with the new mode
    await this.broadcastUp(MESSAGES.MODE_ENTER, { oldMode: oldMode, newMode: mode });

    // Send LAYOUT_READY message with the new mode
    await this.utilities.sleep(1000);
    await this.broadcastUp(MESSAGES.LAYOUT_READY, { mode: this.currentMode });
    
    return true; // Command handled
  }
  
  async handleLayoutInfo(data, sender) {
    if (sender) {
      this.layoutInfo[sender] = data;
      console.log(`Received layout info from ${sender}`);
    }
    return true;  
  }
  async handleModeChanged(data, sender) {
    await this.changeMode(data.mode);
    return true;
  }
  async handleMenuAction(data, sender) {
    return this.handleMenuAction(data, sender);
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
    switch (action.option.toLowerCase()) {
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
  async loadLayout() {
    console.log('Loading interface layout...');
    var data = this.utilities.loadStorage('pcos-layout');
    if (data) {
      await this.recreateInterface(data);
      setTimeout(() => {
        console.log('Broadcasting LAYOUT_READY message after mode change');
        this.broadcastUp('LAYOUT_READY', { mode: this.currentMode });
      }, 1000);    
      return true;
    }
    return false;
  }
  
  /**
   * Save the current layout
   */
  async saveLayout() {
    console.log('Saving interface layout...');
    var layoutJson = await this.getLayout();
    if (layoutJson) {
      this.utilities.saveStorage('pcos-layout', layoutJson);
    }
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
  async getLayout() {
    // Clear any existing layout information
    this.layoutInfo = {};
    
    // Request layout information from all components
    await this.broadcastUp(MESSAGES.GET_LAYOUT_INFO);
    
    // Return a promise that resolves with the layout JSON
    return new Promise((resolve) => {
      // Wait for components to respond with their layout information
      setTimeout(() => {
        // Create the final layout object
        const layout = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          components: this.layoutInfo,
          mode: this.currentMode
        };
        
        // Convert layout information to JSON
        const layoutJson = JSON.stringify(layout, null, 2);
        resolve(layoutJson);
      }, 250); // Wait 500ms for components to respond
    });
  }
  
  /**
   * Recreate the interface from a saved layout
   * This function loads the layout from localStorage and recreates the interface
   * @returns {Promise<boolean>} - Promise that resolves with success status
   */
  async recreateInterface(layoutJson) {
    console.log('Recreating interface from saved layout...');
    
    try {
      // Parse the layout JSON
      const layout = JSON.parse(layoutJson);
      console.log('Loaded layout:', layout);
      
      // Validate the layout
      if (!layout || !layout.components) {
        console.error('Invalid layout format');
        return false;
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
      
      // Converts the layout to type oriented components.
      layout.componentTypes = {};
      Object.values(layout.components).forEach(
        component => {
          layout.componentTypes[component.componentName] = component;
        }
      );
      // Broadcast the layout info to all components
      this.broadcastUp(MESSAGES.LOAD_LAYOUT, layout);

      console.log('Interface recreated successfully');
      return true;
    } catch (error) {
      console.error('Error recreating interface:', error);
      return false;
    }
  }
  
  /**
   * Handle icon actions from IconBar
   * @param {Object} data - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the action was handled
   */
  handleIconAction(data, sender) {
    if (!data.action) return false;    
    var action = data.action;
    
    // Handle different icon actions
    switch (action.toLowerCase()) {
      case ICONACTIONS.NEW_FILE:
        return true;
      case ICONACTIONS.OPEN_FILE:
        return true;
      case ICONACTIONS.SAVE_FILE:
        return true;        
      case ICONACTIONS.RUN_PROGRAM:
        return true;
      case ICONACTIONS.DEBUG_PROGRAM:
        return true;
      case ICONACTIONS.SHARE_PROGRAM:
        return true;
      case ICONACTIONS.HELP:
        return true;
        
      // Add more icon actions as needed
    }
    
    // If we get here, the action wasn't handled
    console.log(`Unhandled icon action: ${action}`);
    return false;
  }
}

function loadApplication() {
  // Create and initialize the application
  const pcosApp = new PCOSApp();
  window.pcosApp = pcosApp;
  pcosApp.init({mode:'modern'});
}
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadApplication());
}else {
  loadApplication();
}

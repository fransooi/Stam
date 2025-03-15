import './style.css'
import './components/interface/sidewindows/sidewindows.css'

// Import components
import MenuBar from './components/MenuBar.js';
import StatusBar from './components/StatusBar.js';
import Editor from './components/Editor.js';
import IconBar from './components/IconBar.js';
import SideBar from './components/SideBar.js';
import BaseComponent, { PREFERENCE_MESSAGES } from './utils/BaseComponent.js';
import PreferenceDialog from './components/PreferenceDialog.js';

// Main application class
class PCOSApp extends BaseComponent {
  constructor() {
    // Initialize the base component with component name
    super('PCOSApp');
    
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
        
      // Add more message types as needed
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
        
      // Add more menu actions as needed
    }
    
    console.log(`Unhandled menu action: ${action.action}`);
    return false;
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
   * Save the current layout
   * @returns {Promise<string>} - Promise that resolves with the layout JSON
   */
  saveLayout() {
    if (!this.preferenceDialog) return Promise.resolve('{}');
    
    return this.preferenceDialog.saveLayout()
      .then(layoutJson => {
        console.log('Layout saved:', layoutJson);
        // Here you would typically save the layout to localStorage or a file
        localStorage.setItem('pcos-layout', layoutJson);
        return layoutJson;
      })
      .catch(error => {
        console.error('Error saving layout:', error);
        return '{}';
      });
  }
  
  /**
   * Load a saved layout
   * @returns {Promise<boolean>} - Promise that resolves with success status
   */
  loadLayout() {
    if (!this.preferenceDialog) return Promise.resolve(false);
    
    try {
      const layoutJson = localStorage.getItem('pcos-layout');
      if (!layoutJson) return Promise.resolve(false);
      
      return Promise.resolve(this.preferenceDialog.loadLayout(layoutJson));
    } catch (error) {
      console.error('Error loading layout:', error);
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

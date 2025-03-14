import './style.css'
import './components/interface/sidewindows/sidewindows.css'

// Import components
import MenuBar from './components/MenuBar.js';
import StatusBar from './components/StatusBar.js';
import Editor from './components/Editor.js';
import IconBar from './components/IconBar.js';
import SideBar from './components/SideBar.js';
import BaseComponent from './utils/BaseComponent.js';
import messageBus from './utils/MessageBus.js';

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
    this.menuBar = new MenuBar('menu-bar', this.currentMode);
    this.statusBar = new StatusBar('status-line');
    this.editor = new Editor('editor-area', this.currentMode);
    this.iconBar = new IconBar('icon-area', null, this.currentMode);
    this.sideBar = new SideBar('info-area');
    
    // Register components in the component tree
    this.registerComponentInTree(this.menuBar.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.statusBar.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.editor.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.iconBar.getComponentID(), this.getComponentID());
    this.registerComponentInTree(this.sideBar.getComponentID(), this.getComponentID());
    
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
    this.broadcastMessageUp('MODE_CHANGE', { mode });
    
    return true; // Command handled
  }
  
  // Override the handleMessage method from BaseComponent
  handleMessage(messageType, messageData, sender) {
    console.log(`PCOSApp received message: ${messageType}`, messageData, sender);
    
    switch (messageType) {
      case 'MENU_ACTION':
        return this.handleMenuAction(messageData, sender);
        
      case 'ICON_ACTION':
        return this.handleIconAction(messageData, sender);
        
      case 'MODE_CHANGE_REQUEST':
        if (messageData.data && messageData.data.mode) {
          this.handleModeChange(messageData.data.mode);
          return true;
        }
        return false;
        
      // Add more message types as needed
    }
    
    return false; // Message not handled
  }
  
  // Handle menu actions from MenuBar
  handleMenuAction(messageData, sender) {
    if (!messageData.data) return false;
    
    const { menuName, option, action } = messageData.data;
    console.log(`PCOSApp handling menu action: ${action}`);
    
    // Map menu actions to component messages
    switch (action) {
      // File menu
      case 'File:New':
        return true;
        
      case 'File:Open':
        return true;
        
      case 'File:Save':
        return true;
        
      case 'File:Save As':
        return true;
        
      case 'File:Exit':
        return true;
        
      // Edit menu
      case 'Edit:Undo':
        return true;
        
      case 'Edit:Redo':
        return true;
        
      case 'Edit:Cut':
        return true;
        
      case 'Edit:Copy':
        return true;
        
      case 'Edit:Paste':
        return true;
        
      case 'Edit:Find':
        return true;
        
      case 'Edit:Replace':
        return true;
        
      // View menu
      case 'View:Zoom In':
        return true;
        
      case 'View:Zoom Out':
        return true;
        
      case 'View:Reset Zoom':
        return true;
        
      case 'View:Toggle Output':
        return true;
        
      // Run menu
      case 'Run:Run':
        return true;
        
      case 'Run:Debug':
        return true;
        
      case 'Run:Stop':
        return true;
        
      case 'Run:Build':
        return true;
        
      // Help menu
      case 'Help:Documentation':
        return true;
        
      case 'Help:About':
        return true;
    }
    
    // If we get here, the action wasn't handled
    console.log(`Unhandled menu action: ${action}`);
    return false;
  }
  
  // Handle icon actions from IconBar
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

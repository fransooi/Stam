import './style.css'
import './components/interface/sidewindows/sidewindows.css'

// Import components
import MenuBar from './components/MenuBar.js';
import StatusBar from './components/StatusBar.js';
import Editor from './components/Editor.js';
import IconBar from './components/IconBar.js';
import SideBar from './components/SideBar.js';

// Main application class
class PCOSApp {
  constructor() {
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
    this.menuBar = new MenuBar('menu-bar', this.handleModeChange.bind(this), this.currentMode);
    this.statusBar = new StatusBar('status-line');
    this.editor = new Editor('editor-area', this.currentMode);
    this.iconBar = new IconBar('icon-area', null, this.currentMode);
    this.sideBar = new SideBar('info-area');
    
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
  
  handleModeChange(mode) {
    console.log(`Switching to ${mode} mode`);
    
    // Update current mode
    this.currentMode = mode;
    
    // Update body class for mode-specific styling
    document.body.classList.remove('modern-mode', 'stos-mode', 'amos1_3-mode', 'amosPro-mode', 'c64-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // Re-render components that depend on the mode
    this.editor.setMode(mode);
    this.editor.render();
    this.iconBar.setMode(mode);
    this.iconBar.render();
    this.menuBar.setMode(mode);
    
    // Update status
    this.statusBar.setStatus(`Mode: ${mode}`);
  }
}

// Create and initialize the application
const pcosApp = new PCOSApp();

// Export the app instance for global access
window.pcosApp = pcosApp;

// C64 mode output window implementation with the new C64 emulator
import BaseOutput from '../interface/sidewindows/BaseOutput.js';
import {MESSAGES} from '../../utils/BaseComponent.js';

/**
 * C64OutputSideWindow - Implements the C64 emulator output window
 * This component handles the initialization and interaction with the C64 emulator
 */
class C64Output extends BaseOutput {
  /**
   * Constructor for the C64OutputSideWindow
   * @param {number} initialHeight - Initial height for the window
   */
  constructor(parentId,containerId,initialHeight = 200) {
    super('C64Output', parentId, containerId, initialHeight);
    
    // Flag to track if the emulator is initialized
    this.emulatorContainer = null;
    this.emulatorInitialized = false;
    
    // Store a reference to the emulator container for detach/reattach
    this.storedEmulatorContainer = null;
    
    // Initialize properties
    this.canvas = null;
    this.resizeObserver = null;
    this.statusElement = null;
    this.progressElement = null;
    
    this.messageMap[MESSAGES.MODE_EXIT] = this.handleModeExit;
    this.messageMap[MESSAGES.MODE_ENTER] = this.handleModeEnter;
    this.messageMap[MESSAGES.LAYOUT_READY] = this.handleLayoutReady;
  }
  
  /**
   * Create the output UI specific to STOS mode
   * @param {string} containerId - The ID of the container element
   * @returns {Promise<HTMLDivElement>} The rendered output container
   */
  async render(containerId) {
    this.container = await super.render(containerId);
    if (!this.storedEmulatorContainer){
      // Add C64-specific UI elements and styling
      this.addC64SpecificStyles();
      
      // Create and add the C64 emulator
      this.createC64Emulator();
    }
    return this.container;
  }
  
  /**
   * Create and add the C64 emulator to the output window
   */
  createC64Emulator() {
    try {
      console.log('Creating C64 emulator in output window');
      
      if (!this.container) {
        console.error('Output container not found');
        return;
      }
      
      // Clear the container
      this.container.innerHTML = '';
      
      // Set container styles to eliminate any borders or spacing
      this.container.style.padding = '0';
      this.container.style.margin = '0';
      this.container.style.overflow = 'hidden';
      this.container.style.backgroundColor = '#4040e0'; // C64 blue background
      this.container.style.width = '100%';
      this.container.style.position = 'relative'; // For absolute positioning of children
      
      // Calculate the appropriate height based on the 4:3 aspect ratio
      const containerWidth = this.container.clientWidth;
      const aspectRatioHeight = Math.floor((containerWidth * 3) / 4);
      this.container.style.height = `${aspectRatioHeight}px`;
      
      // Create a container for the C64 emulator
      this.emulatorContainer = document.createElement('div');
      this.emulatorContainer.className = 'c64-emulator';
      
      // Create the canvas for the C64 emulator
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'canvas';
      this.canvas.className = 'c64-canvas';
      this.canvas.tabIndex = 1; // Make it focusable
      
      // Create the status element
      this.statusElement = document.createElement('div');
      this.statusElement.id = 'status';
      this.statusElement.className = 'c64-status';
      
      // Create the progress element
      this.progressElement = document.createElement('div');
      this.progressElement.id = 'progress';
      this.progressElement.className = 'c64-progress';

      // Create disc box combo
      this.diskBoxCombo = document.createElement('div');
      this.diskBoxCombo.id = 'diskbox_combo';
      this.diskBoxCombo.className = 'c64-diskbox-combo';
      
      // Add elements to the emulator container
      this.emulatorContainer.appendChild(this.canvas);
      this.emulatorContainer.appendChild(this.statusElement);
      this.emulatorContainer.appendChild(this.progressElement);
      this.emulatorContainer.appendChild(this.diskBoxCombo);

      // Add a resize observer to maintain aspect ratio when window is resized
      this.setupResizeObserver();
      this.container.appendChild(this.emulatorContainer);
      
      console.log('C64 emulator UI created, waiting for LAYOUT_READY message to initialize');
    } catch (error) {
      console.error('Error creating C64 emulator in output window:', error);
      if (this.container) {
        this.container.innerHTML = `<div class="error-message">Failed to create C64 emulator: ${error.message || 'Unknown error'}</div>`;
      }
    }
  }
  
  /**
   * Initialize the C64 emulator
   */
  initializeC64Emulator() {
    // Don't initialize more than once
    if (this.emulatorInitialized) {
      console.log('C64 emulator already initialized, skipping initialization');
      return;
    }
    this.loadEmulatorScript()
    .then(() => {
      this.startEmulator();
      //this.reattachEmulatorContainer(this.emulatorContainer);
    })
    .catch(error => {
      console.error('Error loading C64 emulator script:', error);
    });
  }
  
  /**
   * Load the C64 emulator JavaScript files
   */
  loadEmulatorScript() {
    console.log('C64 emulator script loading started');

    var done = 0;    
    return new Promise((resolve) => {
      // Load the main script first
      const mainScript = document.createElement('script');
      mainScript.src = '/c64/c64_main.js';
      mainScript.async = true;
      mainScript.onload = () => {
        done++;
        if (done === 2) {
          resolve(true);
        }
      };
      document.body.appendChild(mainScript);

      // Load the emulator script
      const mainScript2 = document.createElement('script');
      mainScript2.src = '/c64/c64_tiny.js';
      mainScript2.async = true;
      mainScript2.onload = () => {
        done++;
        if (done === 2) {
          resolve(true);
        }
      };
      document.body.appendChild(mainScript2);
    });
  }
  
  /**
   * Start the C64 emulator after initialization  
   */
  startEmulator() {
    try {
      if ( window.Module === undefined  || window.Module._js_reset === undefined) {
        console.error('C64 emulator not initialized');
        return;
      }
      console.log('Starting C64 emulator');
      
      // Make sure js_reset is available before calling it
      setTimeout(() => {
        if (typeof window.Module._js_reset === 'function') {
          // Skip loading the joystick test snapshot
          // Instead, just reset to get a clean BASIC screen
          window.Module.ccall('js_reset', 'number', ['number'], [0]);
          console.log('C64 emulator started up in BASIC mode');
        } else {
          console.warn('js_reset function not available yet');
        }
        console.log('C64 emulator started successfully');
      }, 1000);
      this.emulatorInitialized = true;
    } catch (error) {
      console.error('Error starting C64 emulator:', error);
      if (this.statusElement) {
        this.statusElement.textContent = 'Error starting emulator: ' + error.message;
      }
    }
  }
  
  
  /**
   * Remove the resize observer
   */
  removeResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * Set up resize observer to maintain aspect ratio
   */
  setupResizeObserver() {
    // Clean up any existing observer
    this.removeResizeObserver();
    
    // Create a new observer
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === this.outputContainer) {
          const containerWidth = entry.contentRect.width;
          const aspectRatioHeight = Math.floor((containerWidth * 3) / 4);
          this.outputContainer.style.height = `${aspectRatioHeight}px`;
        }
      }
    });
    
    // Start observing
    if (this.outputContainer) {
      this.resizeObserver.observe(this.outputContainer);
    }
  }
  
  /**
   * Add C64-specific styles for the output window
   */
  addC64SpecificStyles() {
    // Add styles if not already present
    if (!document.getElementById('c64-output-styles')) {
      const style = document.createElement('style');
      style.id = 'c64-output-styles';
      style.textContent = `
        /* C64 emulator styles */
        .c64-emulator {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background-color: #4040e0; /* C64 blue background */
          overflow: hidden;
          border: none;
          padding: 0;
          margin: 0;
          position: absolute;
          top: 0;
          left: 0;
        }
        
        .c64-canvas {
          display: block;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #4040e0; /* C64 blue background */
          border: none;
          box-sizing: border-box;
          image-rendering: pixelated;
        }
        
        .c64-status {
          color: #FFFFFF;
          font-size: 8px;
          padding: 0;
          text-align: center;
          background-color: transparent;
          height: auto;
          min-height: 8px;
          position: absolute;
          bottom: 0;
          width: 100%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .c64-status.active {
          opacity: 0.5;
        }
        
        .c64-progress {
          width: 100%;
          height: 1px;
          margin: 0;
          position: absolute;
          bottom: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .c64-progress.active {
          opacity: 0.5;
        }
        
        .error-message {
          color: #FF0000;
          padding: 20px;
          font-weight: bold;
          background-color: #000000;
        }
        
        .c64-loading-message {
          color: #FFFFFF;
          padding: 20px;
          text-align: center;
          background-color: #4040e0; /* C64 blue background */
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Handle layout ready message
   * @param {object} data - The message data
   * @param {string} senderId - The ID of the sender
   */
  async handleLayoutReady(data,senderId) {
    // Only initialize if we're in C64 mode
    if (!this.emulatorContainer ||this.emulatorInitialized) {
      return true;
    }
    this.initializeC64Emulator();
    return true;
  }
  
  /**
   * Handle mode exit message
   * @param {object} data - The message data
   * @param {string} senderId - The ID of the sender
   */
  async handleModeExit(data,senderId) {
    // If we're leaving C64 mode, detach the emulator container
    if (data.newMode !== 'c64' && data.oldMode === 'c64') {
      this.detachEmulatorContainer();
    }
    return true;
  }
  
  /**
   * Handle mode enter message
   * @param {object} data - The message data
   * @param {string} senderId - The ID of the sender
   */
  async handleModeEnter(data,senderId) {
    // If we're entering C64 mode, reattach the emulator container
    if (data && data.newMode === 'c64') {
      this.reattachEmulatorContainer(); 
    }
    return true;
  } 
  
  /**
   * Detach the emulator container from the DOM
   */
  detachEmulatorContainer() {
    try {
      if (!this.storedEmulatorContainer && this.emulatorContainer) {
        console.log('Detaching C64 emulator container from DOM');
        this.storedEmulatorContainer = this.emulatorContainer;
        this.storedEmulatorContainer.remove(); // This doesn't destroy it, just detaches it
        this.emulatorContainer=null;
      }
    } catch (error) {
      console.error('Error detaching C64 emulator container:', error);
    }
  }
  
  /**
   * Reattach the emulator container to the DOM
   */
  reattachEmulatorContainer(force = null) {
    try {
      if (force || (!this.emulatorContainer && this.storedEmulatorContainer)) {
        console.log('Reattaching C64 emulator container to DOM');
        
        // Reattach the stored emulator container
        if (!force)
          force=this.storedEmulatorContainer;
        this.container.appendChild(force);
        this.emulatorContainer = force;
        this.storedEmulatorContainer = null;
      }
      console.log('C64 emulator container reattached successfully');
    } catch (error) {
      console.error('Error reattaching C64 emulator container:', error);
    }
  }
  
  /**
   * Clean up the C64 emulator when leaving C64 mode
   */
  cleanupEmulator() {
    try {
      console.log('Cleaning up C64 emulator resources');
      
      // Reset emulator state
      this.emulatorInitialized = false;
      
      // Remove global references
      delete window.c64Canvas;
      delete window.c64StatusElement;
      delete window.c64ProgressElement;
      delete window.c64DiskBoxCombo;

      // Clear references to DOM elements
      this.canvas = null;
      this.statusElement = null;
      this.progressElement = null;
      this.diskBoxCombo = null;
      
      // Clear the Module object
      if (window.Module) {
        window.Module = undefined;
      }
      
      console.log('C64 emulator cleanup completed');
    } catch (error) {
      console.error('Error during C64 emulator cleanup:', error);
    }
  }
  
  /**
   * Clean up resources when the component is destroyed
   */
  destroy() {
    // Clean up the emulator
    this.cleanupEmulator();
    
    // Call the parent class's destroy method if it exists
    if (super.destroy) {
      super.destroy();
    }
  }
  
  /**
   * Override getLayoutInfo to include C64-specific output information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
    // Add C64-specific layout information
    return {
      ...baseInfo,
      modeName: this.modeName
    };
  }
  
  /**
   * Set the layout from saved information
   * @param {Object} layoutInfo - The layout information to apply
   */
  setLayout(layoutInfo) {
    console.log('C64OutputSideWindow.setLayout called with:', layoutInfo);
    
    // Call the parent class's setLayout method if it exists
    if (super.setLayout) {
      super.setLayout(layoutInfo);
    }
  }
}

// Export the class
export default C64Output;

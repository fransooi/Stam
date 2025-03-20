// C64 mode output window implementation with the new C64 emulator
import BaseOutput from '../interface/sidewindows/BaseOutput.js';

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
    
    // We'll bind the event handlers later when they're actually used
  }
  
  /**
   * Create the output UI specific to C64 mode
   */
  createOutputUI() {
    // Call the base implementation first to set up the container
    super.createOutputUI();
    
    // Add C64-specific UI elements and styling
    this.addC64SpecificStyles();
    
    // Create and add the C64 emulator
    this.createC64Emulator();
  }
  
  /**
   * Create and add the C64 emulator to the output window
   */
  createC64Emulator() {
    try {
      console.log('Creating C64 emulator in output window');
      
      if (!this.outputContainer) {
        console.error('Output container not found');
        return;
      }
      
      // Clear the container
      this.outputContainer.innerHTML = '';
      
      // Set container styles to eliminate any borders or spacing
      this.outputContainer.style.padding = '0';
      this.outputContainer.style.margin = '0';
      this.outputContainer.style.overflow = 'hidden';
      this.outputContainer.style.backgroundColor = '#4040e0'; // C64 blue background
      this.outputContainer.style.width = '100%';
      this.outputContainer.style.position = 'relative'; // For absolute positioning of children
      
      // Calculate the appropriate height based on the 4:3 aspect ratio
      const containerWidth = this.outputContainer.clientWidth;
      const aspectRatioHeight = Math.floor((containerWidth * 3) / 4);
      this.outputContainer.style.height = `${aspectRatioHeight}px`;
      
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
      this.outputContainer.appendChild(this.emulatorContainer);
      
      console.log('C64 emulator UI created, waiting for LAYOUT_READY message to initialize');
    } catch (error) {
      console.error('Error creating C64 emulator in output window:', error);
      if (this.outputContainer) {
        this.outputContainer.innerHTML = `<div class="error-message">Failed to create C64 emulator: ${error.message || 'Unknown error'}</div>`;
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
      console.log('C64 output styles added to document head');
    }
  }
  
  /**
   * Reset the C64 emulator
   * @param {number} type - Reset type (0 for soft reset, 1 for hard reset)
   * @returns {boolean} - Success status
   */
  reset(type = 0) {
    if (!this.emulatorInitialized || !window.Module) {
      console.warn('Cannot reset C64 emulator - not initialized');
      return false;
    }
    
    try {
      // Check if the js_reset function is available
      if (typeof window.Module._js_reset === 'function') {
        window.Module.ccall('js_reset', 'number', ['number'], [type]);
        console.log(`C64 emulator ${type === 0 ? 'soft' : 'hard'} reset performed`);
        return true;
      } else {
        console.warn('js_reset function not available');
        return false;
      }
    } catch (error) {
      console.error('Error resetting C64 emulator:', error);
      return false;
    }
  }
  
  /**
   * Load a PRG file into the C64 emulator
   * @param {Uint8Array} data - The PRG file data as a byte array
   * @param {string} fileName - The name of the file
   * @param {boolean} autoStart - Whether to automatically run the program after loading
   * @returns {boolean} - Success status
   */
  loadPRG(data, fileName, autoStart = true) {
    if (this.emulatorInitialized && window.Module) {
      try {
        window.Module.ccall('js_LoadFile', 'number', 
          ['string', 'array', 'number', 'number'], 
          [fileName, data, data.byteLength, autoStart ? 1 : 0]
        );
        console.log(`C64 PRG file loaded: ${fileName}, autoStart: ${autoStart}`);
        return true;
      } catch (error) {
        console.error('Error loading PRG file into C64 emulator:', error);
        return false;
      }
    } else {
      console.warn('Cannot load PRG - C64 emulator not initialized');
      return false;
    }
  }
  
  /**
   * Send a command to the C64 emulator
   * @param {string} command - The command to send
   * @param {Object} params - Additional parameters for the command
   * @returns {boolean} - Success status
   */
  sendCommand(command, params = {}) {
    if (!this.emulatorInitialized) {
      console.warn('Cannot send command - C64 emulator not initialized');
      return false;
    }
    
    switch (command) {
      case 'RESET':
        return this.reset(params.type || 0);
      case 'RUN':
        // For now, just reset the emulator
        return this.reset(0);
      case 'STOP':
        // For now, just reset the emulator
        return this.reset(0);
      case 'LOAD_PRG':
        return this.loadPRG(params.data, params.fileName, params.autoStart);
      case 'SET_KEY':
        if (window.Module) {
          window.Module.ccall('js_setKey', 'number', ['number', 'number'], [params.key, params.down ? 1 : 0]);
          return true;
        }
        return false;
      case 'SET_JOYSTICK':
        if (window.Module) {
          window.Module.ccall('js_setJoystick', 'number', ['number', 'number'], [params.key, params.down ? 1 : 0]);
          return true;
        }
        return false;
      default:
        console.warn(`Unknown C64 emulator command: ${command}`);
        return false;
    }
  }
  
  /**
   * Handle messages sent to this component
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {string} senderId - ID of the component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, senderId) {
    console.log(`C64Output received message: ${messageType}`, messageData);
    switch(messageType) {
      case 'LAYOUT_READY':
        // Only initialize if we're in C64 mode
        if (messageData && messageData.data && messageData.data.mode === 'c64') {
          this.initializeC64Emulator();
        }
        return true; 
        
      case 'MODE_EXIT':
        // If we're leaving C64 mode, detach the emulator container
        if (messageData && messageData.data && messageData.data.newMode !== 'c64' && messageData.data.oldMode === 'c64') {
          this.detachEmulatorContainer();
        }
        return true;
        
      case 'MODE_ENTER':
        // If we're entering C64 mode, reattach the emulator container
        if (messageData && messageData.data && messageData.data.newMode === 'c64') {
          this.reattachEmulatorContainer();
        }
        return true;
        
      case 'RESET':
      case 'RUN':
      case 'STOP':
        return this.sendCommand(messageType, messageData);
      
      default:
        break;
    }
    
    return super.handleMessage(messageType, messageData, senderId);
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
        this.outputContainer.appendChild(force);
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
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
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

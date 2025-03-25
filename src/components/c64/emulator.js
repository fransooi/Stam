
/**
 * Emulator - Implements the C64 emulator output window using VICE.js
 * This component handles the initialization and interaction with the C64 emulator
 */
class Emulator {
  constructor() {
    this.emulatorInitialized = false;
    this.hasFocus = false;
    this.keydownInterceptor = null;
    this.keyupInterceptor = null;
  }
  
  // Called once to create the emulator
  // Should insert a container into the parent container
  // And return it.
  async render(parentContainer) {
    this.container = parentContainer;
    this.container.innerHTML = '';
    
    // Add styles
    await this.addStyles();
    
    // Set container styles
    this.container.style.padding = '0';
    this.container.style.margin = '0';
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#4040e0'; // C64 blue background
    this.container.style.width = '100%';
    this.container.style.position = 'relative';
    
    // Calculate the appropriate height based on the 4:3 aspect ratio
    const containerWidth = this.container.clientWidth;
    const aspectRatioHeight = Math.floor((containerWidth * 3) / 4);
    this.container.style.height = `${aspectRatioHeight}px`;
    
    // Create a container for the C64 emulator
    this.emulatorContainer = document.createElement('div');
    this.emulatorContainer.className = 'c64-emulator';
    
    // Create the canvas for the C64 emulator
    // VICE.js requires a canvas with ID 'canvas'
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';
    this.canvas.className = 'c64-canvas';
    this.canvas.tabIndex = 1; // Make it focusable
    this.canvas.style.border = '0px none'; // VICE.js requires no border or padding
    
    // Create status element for emulator messages
    this.statusElement = document.createElement('div');
    this.statusElement.id = 'status';
    this.statusElement.className = 'c64-status';
    
    // Add elements to the emulator container
    this.emulatorContainer.appendChild(this.canvas);
    this.emulatorContainer.appendChild(this.statusElement);
    
    // Add the emulator container to the parent container
    this.container.appendChild(this.emulatorContainer);
    
    // Set up keyboard interceptors
    this.setupKeyboardInterceptors();
    
    // Setup focus handling
    this.setupFocusHandling();
    
    return this.emulatorContainer;
  }
  
  // Set up keyboard interceptors to control when keyboard events reach the emulator
  setupKeyboardInterceptors() {
    // Store a reference to this for use in event handlers
    const self = this;
    
    // Create keyboard interceptors that will prevent events from propagating
    // to the C64 emulator when it doesn't have focus
    this.keydownInterceptor = function(e) {
      if (!self.hasFocus) {
        return;
      }
      
      // Prevent default browser behavior for special keys when the emulator has focus
      switch(e.keyCode) {
        case 37: case 39: case 38: case 40: // Arrow keys
        case 32: case 17: // Space, Ctrl
        case 112: case 114: case 116: case 118: // F1, F3, F5, F7
          e.preventDefault();
          break;
        default:
          break;
      }
      
      // Forward the key press to the emulator if it has focus
      if (window.Module && typeof window.Module.ccall === 'function') {
        try {
          window.Module.ccall('keyboard_key_pressed', 'undefined', ['number'], [e.keyCode]);
        } catch (error) {
          console.warn('Error sending key press to emulator:', error);
        }
      }
    };
    
    this.keyupInterceptor = function(e) {
      if (!self.hasFocus) {
        return;
      }
      
      // Forward the key release to the emulator if it has focus
      if (window.Module && typeof window.Module.ccall === 'function') {
        try {
          window.Module.ccall('keyboard_key_released', 'undefined', ['number'], [e.keyCode]);
        } catch (error) {
          console.warn('Error sending key release to emulator:', error);
        }
      }
    };
    
    // Add the interceptors to the document
    document.addEventListener('keydown', this.keydownInterceptor, false);
    document.addEventListener('keyup', this.keyupInterceptor, false);
  }
  
  // Set up focus handling for the canvas
  setupFocusHandling() {
    if (this.canvas) {
      // Add a focus indicator
      this.canvas.addEventListener('focus', () => {
        this.hasFocus = false;
        this.canvas.style.outline = '2px solid #ffffff';
        console.log('C64 emulator has focus');
      });
      
      this.canvas.addEventListener('blur', () => {
        this.hasFocus = false;
        this.canvas.style.outline = 'none';
        console.log('C64 emulator lost focus');
      });
      
      // Add click handler to focus the canvas
      this.canvas.addEventListener('click', () => {
        this.canvas.focus();
      });
    }
  }
  
  // Load the source code of the emulator
  // and return a promise, true= loaded, false= failed
  async load() {
    return new Promise((resolve, reject) => {
      try {
        // Create the Module object before loading the script
        this.createModuleObject();
        
        // Load the VICE.js script
        const script = document.createElement('script');
        script.src = '/vice/x64.js';
        script.async = true;
        script.onload = () => {
          console.log('VICE.js loaded successfully');
          resolve(true);
        };
        script.onerror = (error) => {
          console.error('Failed to load VICE.js:', error);
          reject(false);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading VICE.js:', error);
        reject(false);
      }
    });
  }
  
  // Create the Module object required by VICE.js
  createModuleObject() {
    // Store a reference to this for use in callbacks
    const self = this;
    
    // Create the Module object with configuration for VICE.js
    window.Module = {
      arguments: ['+sound'], // Enable sound
      canvas: this.canvas,
      setStatus: function(text) {
        if (self.statusElement) {
          self.statusElement.innerHTML = text;
        }
      },
      monitorRunDependencies: function(left) {
        if (self.statusElement) {
          self.statusElement.innerHTML = left ? 
            'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 
            'All downloads complete.';
        }
      },
      totalDependencies: 0,
      // Override the default keyboard handlers
      keyboardListeningElement: document.createElement('div'), // Dummy element to prevent default keyboard handling
    };
    
    // Set initial status
    if (this.statusElement) {
      this.statusElement.innerHTML = 'Downloading...';
    }
  }

  // Initialize the emulator. This function is only called
  // after the emulator has been loaded.
  // Returns a promise, true= initialized, false= failed
  async initialize() {
    return new Promise((resolve) => {
      // Check if Module is available
      if (window.Module) {
        // VICE.js initializes automatically when loaded
        this.emulatorInitialized = true;
        resolve(true);
      } else {
        console.error('VICE.js Module not available');
        resolve(false);
      }
    });
  }
  
  // Called after the emulator has been initialized
  start() {
    // VICE.js starts automatically when loaded
    // Focus the canvas to start receiving keyboard input
    if (this.canvas) {
      this.canvas.focus();
    }
  }
  
  // Stops and cleanup the emulator. Remove it from the container.
  cleanup() {
    // Remove keyboard event listeners
    if (this.keydownInterceptor) {
      document.removeEventListener('keydown', this.keydownInterceptor, false);
      this.keydownInterceptor = null;
    }
    
    if (this.keyupInterceptor) {
      document.removeEventListener('keyup', this.keyupInterceptor, false);
      this.keyupInterceptor = null;
    }
    
    // Clear the Module object
    if (window.Module) {
      // Try to call any cleanup functions if available
      if (typeof window.Module.ccall === 'function') {
        try {
          // Some emulators have a shutdown function
          if (typeof window.Module._emu_exit === 'function') {
            window.Module.ccall('emu_exit', 'undefined', [], []);
          }
        } catch (error) {
          console.warn('Error shutting down emulator:', error);
        }
      }
      
      // Delete the Module object
      window.Module = undefined;
    }
    
    // Reset state
    this.emulatorInitialized = false;
    this.hasFocus = false;
    
    // Clear references to DOM elements
    this.canvas = null;
    this.statusElement = null;
    this.emulatorContainer = null;
  }

  // Check if the emulator is initialized
  isInitialized() {
    return this.emulatorInitialized;
  }
  
  // Add styles for the emulator
  async addStyles() {
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
          font-size: 12px;
          padding: 5px;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.5);
          position: absolute;
          bottom: 0;
          width: 100%;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        
        .c64-status:hover {
          opacity: 1;
        }
        
        /* Focus indicator for the canvas */
        .c64-canvas:focus {
          outline: 2px solid #ffffff;
          outline-offset: -2px;
        }
      `;
      document.head.appendChild(style);
    }
    return Promise.resolve();
  }
}

export default Emulator;

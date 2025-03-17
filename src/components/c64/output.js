// C64 mode output window implementation with the new C64 emulator
import BaseOutputSideWindow from '../interface/sidewindows/BaseOutputSideWindow.js';

class C64OutputSideWindow extends BaseOutputSideWindow {
  constructor(initialHeight = 200) {
    super(initialHeight);
    this.modeName = 'c64';
    this.canvas = null;
    this.emulatorInitialized = false;
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
      
      if (this.outputContainer) {
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
        // This will adjust the output window height to match the C64's aspect ratio
        const containerWidth = this.outputContainer.clientWidth;
        const aspectRatioHeight = Math.floor((containerWidth * 3) / 4);
        this.outputContainer.style.height = `${aspectRatioHeight}px`;
        
        // Create a container for the C64 emulator
        const emulatorContainer = document.createElement('div');
        emulatorContainer.className = 'c64-emulator';
        
        // Create the canvas for the C64 emulator
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        this.canvas.className = 'c64-canvas';
        this.canvas.setAttribute('oncontextmenu', 'event.preventDefault()');
        
        // Create the status and progress elements (positioned at bottom via CSS)
        const statusElement = document.createElement('div');
        statusElement.id = 'status';
        statusElement.className = 'c64-status';
        statusElement.textContent = 'Initializing...';
        
        const progressElement = document.createElement('progress');
        progressElement.id = 'progress';
        progressElement.className = 'c64-progress';
        progressElement.value = 0;
        progressElement.max = 100;
        
        // Add elements to the container
        emulatorContainer.appendChild(this.canvas);
        emulatorContainer.appendChild(statusElement);
        emulatorContainer.appendChild(progressElement);
        this.outputContainer.appendChild(emulatorContainer);
        
        // Add a resize observer to maintain aspect ratio when window is resized
        const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            const containerWidth = entry.contentRect.width;
            const aspectRatioHeight = Math.floor((containerWidth * 3) / 4);
            this.outputContainer.style.height = `${aspectRatioHeight}px`;
          }
        });
        
        resizeObserver.observe(this.outputContainer);
        
        // Wait longer before initializing the emulator
        // This gives the DOM time to render and stabilize
        setTimeout(() => {
          this.initializeC64Emulator();
        }, 1000); // Increased from 500ms to 1000ms
      }
    } catch (error) {
      console.error('Error creating C64 emulator in output window:', error);
      if (this.outputContainer) {
        this.outputContainer.innerHTML = `<div class="error-message">Failed to create C64 emulator: ${error.message || 'Unknown error'}</div>`;
      }
    }
  }
  
  /**
   * Initialize the C64 emulator with custom settings
   */
  initializeC64Emulator() {
    try {
      console.log('Initializing C64 emulator');
      
      // Reset the emulator initialized flag
      this.emulatorInitialized = false;
      
      // Define the Module object with custom settings
      window.Module = {
        canvas: document.getElementById('canvas'),
        statusElement: document.getElementById('status'),
        progressElement: document.getElementById('progress'),
        startSequence: 0, // Track initialization sequence
        setStatus: function(text) {
          if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
          if (text === Module.setStatus.last.text) return;
          
          // Get references to the elements
          const statusElement = Module.statusElement;
          const progressElement = Module.progressElement;
          
          // Check if elements exist before trying to use them
          if (!statusElement || !progressElement) {
            console.warn('Status or progress element not found in setStatus');
            return;
          }
          
          // Show status elements when there's a status update
          if (text) {
            statusElement.classList.add('active');
            progressElement.classList.add('active');
          } else {
            // Hide status elements when status is cleared
            statusElement.classList.remove('active');
            progressElement.classList.remove('active');
          }
          
          const m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
          const now = Date.now();
          
          if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
          
          if (m) {
            text = m[1];
            try {
              progressElement.value = parseInt(m[2])*100;
              progressElement.max = parseInt(m[4])*100;
            } catch (e) {
              console.warn('Error setting progress element values:', e);
            }
          } else {
            try {
              progressElement.value = null;
              progressElement.max = null;
            } catch (e) {
              console.warn('Error clearing progress element values:', e);
            }
          }
          
          try {
            statusElement.innerHTML = text;
          } catch (e) {
            console.warn('Error setting status element text:', e);
          }
          
          Module.setStatus.last.text = text;
          Module.setStatus.last.time = now;
          
          // Hide status after loading is complete
          if (text === '') {
            setTimeout(() => {
              if (statusElement && progressElement) {
                statusElement.classList.remove('active');
                progressElement.classList.remove('active');
              }
            }, 1000);
          }
        },
        monitorRunDependencies: function(left) {
          try {
            // This function is called by the emulator to update the loading progress
            // Make sure we have valid elements before trying to update them
            if (!Module.statusElement || !Module.progressElement) {
              // Try to get the elements again - they might have been created since initialization
              Module.statusElement = document.getElementById('status');
              Module.progressElement = document.getElementById('progress');
              
              // If still not found, just log and return
              if (!Module.statusElement || !Module.progressElement) {
                console.warn('Status or progress element not found in monitorRunDependencies');
                return;
              }
            }
            
            // Call the original function if it exists
            if (Module._originalMonitorRunDependencies) {
              Module._originalMonitorRunDependencies(left);
            } else {
              // Otherwise, update the status directly
              Module.setStatus(left ? 'Preparing... (' + left + ')' : 'All downloads complete.');
            }
          } catch (e) {
            console.error('Error in monitorRunDependencies:', e);
          }
        },
        preRun: [],
        postRun: [],
        c64startup: function() {
          // Start with a clean BASIC screen instead of loading the joystick test
          try {
            console.log('C64 emulator starting up...');
            
            // Make sure js_reset is available before calling it
            if (typeof Module._js_reset === 'function') {
              // Skip loading the joystick test snapshot
              // Instead, just reset to get a clean BASIC screen
              Module.ccall('js_reset', 'number', ['number'], [0]);
              console.log('C64 emulator started up in BASIC mode');
            } else {
              console.warn('js_reset function not available yet');
            }
            
            // Hide status elements after startup is complete
            setTimeout(() => {
              const statusElement = document.getElementById('status');
              const progressElement = document.getElementById('progress');
              if (statusElement) statusElement.classList.remove('active');
              if (progressElement) progressElement.classList.remove('active');
            }, 1500);
          } catch(e) {
            console.error('Error in c64startup:', e);
          }
        }
      };
      
      // Add the preRun and postRun functions after Module is defined
      window.Module.preRun.push(function() { 
        try {
          // Patch the emscripten touch event registration to prevent errors with empty selectors
          if (window.Module && !window.touchEventsPatched) {
            const originalRegisterFunction = window.Module.cwrap;
            if (originalRegisterFunction) {
              window.Module.cwrap = function(ident, returnType, argTypes, opts) {
                // If this is the touch event registration function, return a no-op function
                if (ident === 'emscripten_set_touchstart_callback_on_thread' ||
                    ident === 'emscripten_set_touchend_callback_on_thread' ||
                    ident === 'emscripten_set_touchmove_callback_on_thread' ||
                    ident === 'emscripten_set_touchcancel_callback_on_thread') {
                  console.log(`Patching touch event registration for ${ident}`);
                  return function() { return 0; }; // Return success without actually registering
                }
                // Otherwise, call the original function
                return originalRegisterFunction(ident, returnType, argTypes, opts);
              };
              window.touchEventsPatched = true;
              console.log('Touch event registration patched');
            }
          }
          
          // Save the original monitorRunDependencies function if it exists
          if (window.Module && window.Module.monitorRunDependencies && !window.Module._originalMonitorRunDependencies) {
            window.Module._originalMonitorRunDependencies = window.Module.monitorRunDependencies;
            console.log('Original monitorRunDependencies function saved');
          }
          
          FS.mkdir('/data');
          FS.mount(IDBFS, {}, '/data');
          FS.syncfs(true, function(err) {
            if (err) {
              console.error('Error syncing filesystem:', err);
            }
            window.Module.startSequence |= 2;
            if (window.Module.startSequence == 3) {
              console.log('Starting C64 emulator from preRun');
              window.Module.c64startup();
            }
          });
        } catch(e) {
          console.error('Error in preRun:', e);
        }
      });
      
      window.Module.postRun.push(function() { 
        try {
          window.Module.startSequence |= 1;
          if (window.Module.startSequence == 3) {
            console.log('Starting C64 emulator from postRun');
            window.Module.c64startup();
          }
        } catch(e) {
          console.error('Error in postRun:', e);
        }
      });
      
      // Set initial status
      window.Module.setStatus('Downloading...');
      
      // Load the emulator scripts with a delay between them
      this.loadEmulatorScripts();
      
      // Setup keyboard event handling
      this.setupKeyboardHandling();
    } catch (error) {
      console.error('Error initializing C64 emulator:', error);
    }
  }
  
  /**
   * Load the C64 emulator JavaScript files
   */
  loadEmulatorScripts() {
    // Load the main script first
    const mainScript = document.createElement('script');
    mainScript.src = '/c64/c64_main.js';
    mainScript.type = 'text/javascript';
    
    mainScript.onerror = (error) => {
      console.error('Error loading C64 main script:', error);
      if (this.outputContainer) {
        this.outputContainer.innerHTML = `<div class="error-message">Failed to load C64 emulator script</div>`;
      }
    };
    
    // Wait for the main script to load before loading the emulator script
    mainScript.onload = () => {
      console.log('C64 main script loaded successfully');
      
      // Wait longer before loading the next script
      setTimeout(() => {
        const emulatorScript = document.createElement('script');
        emulatorScript.src = '/c64/c64_tiny.js';
        emulatorScript.type = 'text/javascript';
        
        emulatorScript.onerror = (error) => {
          console.error('Error loading C64 emulator script:', error);
          if (this.outputContainer) {
            this.outputContainer.innerHTML = `<div class="error-message">Failed to load C64 emulator script</div>`;
          }
        };
        
        emulatorScript.onload = () => {
          console.log('C64 emulator scripts loaded successfully');
          
          // Wait significantly longer after loading to ensure initialization is complete
          setTimeout(() => {
            this.emulatorInitialized = true;
            console.log('C64 emulator fully initialized');
            
            // Only try to reset if js_reset is available
            if (window.Module && typeof window.Module._js_reset === 'function') {
              // Force a reset to get a clean BASIC screen
              this.reset(1); // Use hard reset (1) instead of soft reset (0)
              console.log('C64 emulator reset to BASIC mode');
            } else {
              console.log('Waiting for js_reset to become available...');
              // Try again after a delay
              setTimeout(() => {
                if (window.Module && typeof window.Module._js_reset === 'function') {
                  this.reset(1);
                  console.log('C64 emulator reset to BASIC mode (delayed)');
                } else {
                  console.warn('js_reset function still not available after delay');
                }
              }, 2000);
            }
          }, 3000); // Increased from 2000ms to 3000ms
        };
        
        document.body.appendChild(emulatorScript);
      }, 1500); // Increased from 1000ms to 1500ms
    };
    
    document.body.appendChild(mainScript);
  }
  
  /**
   * Setup keyboard event handling for the emulator
   */
  setupKeyboardHandling() {
    const arrowKeysHandler = function(e) {
      switch(e.keyCode) {
        case 37: case 39: case 38: case 40: // Arrow keys
        case 32: case 17: case 112: case 114: case 116: case 118: // Space, Ctrl, F1, F3, F5, F7
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    
    // Add event listeners to prevent browser default actions for emulator keys
    window.addEventListener('keydown', arrowKeysHandler, false);
    window.addEventListener('keyup', arrowKeysHandler, false);
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
   */
  sendCommand(command, params = {}) {
    if (!this.emulatorInitialized) {
      console.warn('Cannot send command - C64 emulator not initialized');
      return false;
    }
    
    switch (command) {
      case 'RESET':
        return this.reset(params.type || 0);
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
    switch(messageType)
    {
      case 'RESET':
      case 'RUN':
      case 'STOP':
        return this.sendCommand(messageType, messageData);
      default:
        break;
    }
    
    // Pass to parent class for handling of standard messages
    return super.handleMessage(messageType, messageData, senderId);
  }
  
  /**
   * Override appendContent to handle C64-specific content
   * @param {string} content - The content to append
   */
  appendContent(content) {
    // For C64 mode, we might want to send this to the emulator
    console.log('C64 output received content:', content);
    // We could implement sending this to the emulator later
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
    
    // If we're restoring from a layout, we need to be more careful with initialization
    // The DOM might not be fully ready yet, so we'll add an extra delay
    if (this.outputContainer && !this.emulatorInitialized) {
      console.log('Initializing C64 emulator from layout restoration with extra delay');
      
      // Clear any existing content
      this.outputContainer.innerHTML = '';
      
      // Add a loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.className = 'c64-loading-message';
      loadingMessage.textContent = 'Initializing C64 emulator...';
      loadingMessage.style.color = 'white';
      loadingMessage.style.textAlign = 'center';
      loadingMessage.style.padding = '20px';
      loadingMessage.style.backgroundColor = '#4040e0'; // C64 blue background
      this.outputContainer.appendChild(loadingMessage);
      
      // Use a longer delay when initializing from a layout restoration
      setTimeout(() => {
        // Create the emulator with the DOM fully ready
        this.createC64Emulator();
      }, 2000); // Use a longer delay for layout restoration
    }
  }
}

// Make sure to export the class
export default C64OutputSideWindow;


/**
 * Emulator - Implements the C64 emulator output window
 * This component handles the initialization and interaction with the C64 emulator
 */
class Emulator {
  constructor() {
    this.emulatorInitialized = false;
  }
  
  async render(container) {
    this.container = container;
    this.container.innerHTML = '';

    await this.addStyles();
    
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

    this.container.appendChild(this.emulatorContainer);
    return this.emulatorContainer;
  }
  
  initialize() {
    // Don't initialize more than once
    if (this.emulatorInitialized) {
      return;
    }
    this.load()
    .then(() => {
      this.start();
    })
    .catch(error => {
      console.error('Error loading C64 emulator script:', error);
    });
  }

  isInitialized() {
    return this.emulatorInitialized;
  }
  load() {
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
  
  start() {
    try {
      if ( window.Module === undefined  || window.Module._js_reset === undefined) {
        console.error('C64 emulator not initialized');
        return;
      }
      
      // Make sure js_reset is available before calling it
      setTimeout(() => {
        if (typeof window.Module._js_reset === 'function') {
          // Skip loading the joystick test snapshot
          // Instead, just reset to get a clean BASIC screen
          window.Module.ccall('js_reset', 'number', ['number'], [0]);
        } else {
          console.warn('js_reset function not available yet');
        }
      }, 1000);
      this.emulatorInitialized = true;
    } catch (error) {
      console.error('Error starting C64 emulator:', error);
      if (this.statusElement) {
        this.statusElement.textContent = 'Error starting emulator: ' + error.message;
      }
    }
  }
  cleanup() {
    if( this.emulatorInitialized) {
      // Reset emulator state
      this.emulatorInitialized = false;
      
      // Clear references to DOM elements
      this.canvas = null;
      this.statusElement = null;
      this.progressElement = null;
      this.diskBoxCombo = null;
      
      // Clear the Module object
      if (window.Module) {
        window.Module = undefined;
      }      
    }
  }

  addStyles() {
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
}

export default Emulator;

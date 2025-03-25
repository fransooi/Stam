// C64 mode output window implementation with the new C64 emulator
import BaseOutput from '../interface/sidewindows/BaseOutput.js';
import {MESSAGES} from '../../utils/BaseComponent.js';
import Emulator from './emulator.js';

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
    this.emulator = new Emulator();
    
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
      this.emulatorContainer = await this.emulator.render(this.container);
      this.setupResizeObserver();
    }
    return this.container;
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
        if (entry.target === this.container) {
          const containerWidth = entry.contentRect.width;
          const aspectRatioHeight = Math.floor((containerWidth * 3) / 4);
          this.container.style.height = `${aspectRatioHeight}px`;
        }
      }
    });
    
    // Start observing
    if (this.container) {
      this.resizeObserver.observe(this.container);
    }
  }
  
  
  /**
   * Handle layout ready message
   * @param {object} data - The message data
   * @param {string} senderId - The ID of the sender
   */
  async handleLayoutReady(data,senderId) {
    // Only initialize if we're in C64 mode
    if (this.emulator.isInitialized()) {
      return true;
    }
    if (!this.emulatorContainer) {
      await this.render();
    }
    await this.emulator.load();
    await this.emulator.initialize();
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
        // Reattach the stored emulator container
        if (!force)
          force=this.storedEmulatorContainer;
        this.container.appendChild(force);
        this.emulatorContainer = force;
        this.storedEmulatorContainer = null;
      }
    } catch (error) {
      console.error('Error reattaching C64 emulator container:', error);
    }
  }
  
  /**
   * Clean up the C64 emulator when leaving C64 mode
   */
  cleanupEmulator() {
    this.emulator.cleanup();
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
    // Call the parent class's setLayout method if it exists
    if (super.setLayout) {
      super.setLayout(layoutInfo);
    }
  }
}

// Export the class
export default C64Output;

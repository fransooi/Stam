// OutputSideWindow.js - Factory for mode-specific output console windows
import SideWindow from './SideWindow.js';
import BaseOutput from './BaseOutput.js';
import { MESSAGES } from '../../../utils/BaseComponent.js';

class OutputSideWindow extends SideWindow {
  constructor(parentId, containerId, initialHeight = 200) {
    super('Output', 'Application', parentId, containerId, initialHeight);
    
    // Current mode and mode-specific implementation
    this.modeImplementations = {};
    
    // Cache for mode implementations to maintain references
    this.modeImplementationsCache = {};   
    this.messageMap[MESSAGES.CONTENT_HEIGHT_CHANGED] = this.handleContentHeightChanged; 
    this.messageMap[MESSAGES.MODE_CHANGE] = this.handleModeChange;
  }
  
  /**
   * Initialize the component
   * 
   * @param {Object} options - Optional configuration options
   */ 
  async init(options = {}) {
   super.init(options);
    try {
        var mode = options.mode;
        if (!mode) 
          mode = this.root.currentMode;
        await this.loadModeSpecificImplementation(mode);
    } catch (error) {
      console.error(`Error initializing output for mode ${this.currentMode}:`, error);
      this.modeImplementation = new BaseOutput(this.height);
    }
  }

  /**
   * Destroy the component
   */
  async destroy() {
    super.destroy();
    this.modeImplementation = null;
  }
  
  /**
   * Load the mode-specific implementation
   * @param {string} mode - The mode to load
   */
  async loadModeSpecificImplementation(mode) {
    try {
      // Check if we already have this implementation in the cache
      if (this.modeImplementationsCache[mode]) {
        this.modeImplementation = this.modeImplementationsCache[mode];
        return;
      }
      
      // Dynamically import the output module for the specified mode
      let OutputImplementation;
      
      switch (mode) {
        case 'stos':
          const stosModule = await import('../../stos/output.js');
          OutputImplementation = stosModule.default;
          console.log('Loaded STOS output implementation');
          break;
        case 'amos1_3':
          const amos13Module = await import('../../amos1_3/output.js');
          OutputImplementation = amos13Module.default;
          console.log('Loaded AMOS 1.3 output implementation');
          break;
        case 'amosPro':
          const amosProModule = await import('../../amosPro/output.js');
          OutputImplementation = amosProModule.default;
          console.log('Loaded AMOS Pro output implementation');
          break;
        case 'c64':
          const c64Module = await import('../../c64/output.js');
          OutputImplementation = c64Module.default;
          console.log('Loaded C64 output implementation');
          break;
        case 'modern':
          const modernModule = await import('../../modern/output.js');
          OutputImplementation = modernModule.default;
          console.log('Loaded Modern output implementation');
          break;
        default:
          console.warn(`No specific output implementation for mode ${mode}, using base implementation`);
          OutputImplementation = BaseOutput;
      }
      
      // Create a new instance of the mode-specific implementation
      this.modeImplementation = new OutputImplementation(this.componentId,this.containerId,this.height);
      await this.modeImplementation.init({mode:mode});

      // Cache the implementation for future use
      this.modeImplementationsCache[mode] = this.modeImplementation;
      
      return this.modeImplementation;
      
    } catch (error) {
      console.error(`Error loading output implementation for mode ${mode}:`, error);
      // Fallback to base implementation
      var modeImplementation = new BaseOutput(this.componentId,this.containerId,this.height);
      this.modeImplementationsCache[mode] = modeImplementation;
      return modeImplementation;
    }
  }
  
  /**
   * Override render to delegate to the mode-specific implementation
   * @param {HTMLElement} parentContainer - The parent container
   * @returns {HTMLElement} - The rendered window element
   */
  async render(containerId) {
    // First, let the parent class handle the basic window rendering
    await super.render(containerId);
   
    return this.container;
  }
  
  /**
   * Handle content height changes
   * @param {number} height - New content height
   */
  handleContentHeightChanged(height) {
    if (this.modeImplementation) {
      this.modeImplementation.handleContentHeightChanged(height);
    }
  }
  
  /**
   * Update the output window with new data
   * @param {Object} data - The data to update with
   */
  update(data) {
    if (this.modeImplementation) {
      this.modeImplementation.update(data);
    }
  }

  /**
   * Handle mode change message
   * @param {Object} data - The data associated with the message
   * @param {Object} sender - Component that sent the message
   */
  async handleModeChange(data, sender) {
    const mode = data.mode;
    
    // Don't do anything if the mode hasn't changed
    if (this.currentMode === mode) {
      return;
    }
    
    // Update the current mode
    this.currentMode = mode;
    
    // Load the new mode implementation
    await this.loadModeSpecificImplementation(mode);    
    await this.sendMessageTo(this.modeImplementation.componentId, MESSAGES.RENDER, {});
    return true;
  }
  
  /**
   * Override getLayoutInfo to include output-specific information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  async getLayoutInfo() {
    const baseInfo = await super.getLayoutInfo();
    
    // Add mode-specific layout information if available
    if (this.modeImplementation) {
      const modeInfo = await this.modeImplementation.getLayoutInfo();
      return {
        ...baseInfo,
        ...modeInfo,
        currentMode: this.currentMode
      };
    }
    
    return {
      ...baseInfo,
      currentMode: this.currentMode
    };
  }
  
  /**
   * Set the layout from saved information
   * @param {Object} layoutInfo - The layout information to apply
   */
  setLayout(layoutInfo) {
    console.log('OutputSideWindow.setLayout called with:', layoutInfo);
    
    // Store the mode from layout info
    if (layoutInfo && layoutInfo.currentMode) {
      console.log(`OutputSideWindow: Restoring mode ${layoutInfo.currentMode} from saved layout`);
      this.currentMode = layoutInfo.currentMode;
      
      // Load the mode-specific implementation
      this.loadModeSpecificImplementation(this.currentMode)
        .then(() => {
          // If we have a content element and mode implementation, re-render the content
          if (this.content && this.modeImplementation) {
            // First, clear the content
            this.content.innerHTML = '';
            
            // Set the content element for the mode implementation
            this.modeImplementation.content = this.content;
            
            // Create the mode-specific output UI
            console.log(`Re-creating output UI for ${this.currentMode} mode`);
            this.modeImplementation.createOutputUI();
            
            // If the mode implementation has a setLayout method, call it
            if (this.modeImplementation.setLayout) {
              this.modeImplementation.setLayout(layoutInfo);
            }
          }
        })
        .catch(error => {
          console.error(`Error loading mode implementation for ${this.currentMode}:`, error);
        });
    }
    
    return true;
  }
}

export default OutputSideWindow;

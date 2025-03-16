// OutputSideWindow.js - Factory for mode-specific output console windows
import SideWindow from './SideWindow.js';
import BaseOutputSideWindow from './BaseOutputSideWindow.js';

class OutputSideWindow extends SideWindow {
  constructor(initialHeight = 200) {
    super('output', 'Output', initialHeight);
    
    // Current mode and mode-specific implementation
    this.currentMode = 'modern'; // Default mode
    this.modeImplementation = null;
    this.initializationPromise = null;
    
    // Initialize with the default mode, but don't wait for it
    // The render method will handle the case where initialization is not complete
    this.initializationPromise = this.initModeImplementation();
    
    console.log('OutputSideWindow constructor completed, initialization started');
  }
  
  /**
   * Initialize the mode-specific implementation
   */
  async initModeImplementation() {
    try {
      // Get the current mode from the document body class
      const bodyClasses = document.body.classList;
      console.log('Body classes:', Array.from(bodyClasses));
      
      for (const cls of bodyClasses) {
        if (cls.endsWith('-mode')) {
          this.currentMode = cls.replace('-mode', '');
          console.log(`Mode found in body class: ${cls}`);
          console.log(`Mode extracted from class: ${this.currentMode}`);
          break;
        }
      }
      
      // If no mode was found in body classes, use the default
      if (!this.currentMode) {
        this.currentMode = 'modern';
        console.log('No mode found in body classes, using default: modern');
      }
      
      // Dynamically import the output module for the current mode
      await this.loadModeSpecificImplementation(this.currentMode);
      
      // Add debug logging
      console.log(`OutputSideWindow initialized with mode: ${this.currentMode}`);
      console.log(`Mode implementation:`, this.modeImplementation);
      
    } catch (error) {
      console.error(`Error initializing output for mode ${this.currentMode}:`, error);
      console.error(`Error details:`, error.message);
      console.error(`Error stack:`, error.stack);
      // Fallback to base implementation
      this.modeImplementation = new BaseOutputSideWindow(this.height);
    }
  }
  
  /**
   * Load the mode-specific implementation
   * @param {string} mode - The mode to load
   */
  async loadModeSpecificImplementation(mode) {
    console.log(`Loading mode-specific implementation for ${mode}`);
    
    try {
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
          OutputImplementation = BaseOutputSideWindow;
      }
      
      // Create a new instance of the mode-specific implementation
      this.modeImplementation = new OutputImplementation(this.height);
      
      // Set the content element if we have one
      if (this.content) {
        this.modeImplementation.content = this.content;
      }
      
      console.log(`Successfully loaded implementation for ${mode} mode:`, this.modeImplementation);
      
    } catch (error) {
      console.error(`Error loading output implementation for mode ${mode}:`, error);
      // Fallback to base implementation
      this.modeImplementation = new BaseOutputSideWindow(this.height);
    }
  }
  
  /**
   * Override render to delegate to the mode-specific implementation
   * @param {HTMLElement} parentContainer - The parent container
   * @returns {HTMLElement} - The rendered window element
   */
  render(parentContainer) {
    console.log('OutputSideWindow.render called');
    
    // First, let the parent class handle the basic window rendering
    const windowElement = super.render(parentContainer);
    
    // Check if we have a mode implementation
    if (!this.modeImplementation) {
      console.log('OutputSideWindow.render: No mode implementation available yet, initializing...');
      
      // Create a temporary implementation while we wait for the async initialization
      const tempImplementation = new BaseOutputSideWindow(this.height);
      tempImplementation.content = this.content;
      tempImplementation.createOutputUI();
      
      // Set up a promise to update the UI once the mode implementation is ready
      this.initializationPromise.then(() => {
        console.log('OutputSideWindow.render: Mode implementation now available, updating UI');
        if (this.modeImplementation && this.content) {
          // Clear the content
          this.content.innerHTML = '';
          
          // Set the content element for the mode implementation
          this.modeImplementation.content = this.content;
          
          // Create the mode-specific output UI
          this.modeImplementation.createOutputUI();
          
          console.log('OutputSideWindow.render: UI updated with mode-specific implementation');
        }
      }).catch(error => {
        console.error('Error initializing mode implementation:', error);
      });
    } else {
      // We already have a mode implementation, let it create its UI
      console.log('OutputSideWindow.render: Using existing mode implementation');
      this.modeImplementation.content = this.content;
      this.modeImplementation.createOutputUI();
    }
    
    return windowElement;
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
   * Append content to the output window
   * @param {string} content - The content to append
   */
  appendContent(content) {
    if (this.modeImplementation) {
      this.modeImplementation.appendContent(content);
    }
  }
  
  /**
   * Clear the output window
   */
  clearContent() {
    if (this.modeImplementation) {
      this.modeImplementation.clearContent();
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
   * Handle incoming messages
   * 
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    // First, let the parent class try to handle the message
    if (super.handleMessage(messageType, messageData, sender)) {
      return true;
    }
    
    // Handle mode change message
    if (messageType === 'MODE_CHANGE') {
      console.log('OutputSideWindow received MODE_CHANGE message:', messageData);
      
      // Extract mode from messageData - handle both formats
      // Format 1: { mode: 'modeName' }
      // Format 2: { data: { mode: 'modeName' } }
      const mode = messageData.mode || (messageData.data && messageData.data.mode);
      
      if (mode) {
        console.log(`OutputSideWindow: Extracted mode ${mode} from message`);
        this.handleModeChange(mode);
        return true;
      } else {
        console.error('OutputSideWindow: MODE_CHANGE message received but no mode found in data:', messageData);
      }
    }
    
    // Delegate to mode implementation for output-specific messages
    if (this.modeImplementation) {
      switch (messageType) {
        case 'OUTPUT_APPEND':
          if (messageData.content) {
            this.appendContent(messageData.content);
            return true;
          }
          break;
        case 'OUTPUT_CLEAR':
          this.clearContent();
          return true;
        case 'OUTPUT_UPDATE':
          if (messageData.data) {
            this.update(messageData.data);
            return true;
          }
          break;
      }
    }
    
    return false;
  }
  
  /**
   * Handle mode change
   * @param {string} mode - The new mode
   */
  async handleModeChange(mode) {
    console.log(`OutputSideWindow: Changing mode to ${mode}`);
    
    // Don't do anything if the mode hasn't changed
    if (this.currentMode === mode) {
      console.log(`OutputSideWindow: Mode ${mode} is already active, no change needed`);
      return;
    }
    
    // Update the current mode
    this.currentMode = mode;
    
    // Load the new mode implementation
    await this.loadModeSpecificImplementation(mode);
    
    // If we have a content element and mode implementation, re-render the content
    if (this.content && this.modeImplementation) {
      // First, clear the content
      this.content.innerHTML = '';
      
      // Set the content element for the mode implementation
      this.modeImplementation.content = this.content;
      
      // Create the mode-specific output UI
      console.log(`Re-creating output UI for ${mode} mode`);
      this.modeImplementation.createOutputUI();
      
      // Force a redraw by adding and removing a class
      this.container.classList.add('mode-changed');
      setTimeout(() => {
        this.container.classList.remove('mode-changed');
      }, 10);
      
      console.log(`Mode change complete. New implementation:`, this.modeImplementation);
    } else {
      console.error('Failed to update UI after mode change - missing content or implementation');
    }
  }
  
  /**
   * Override getLayoutInfo to include output-specific information
   * @returns {Object} Layout information for this OutputSideWindow
   */
  getLayoutInfo() {
    const baseInfo = super.getLayoutInfo();
    
    // Add mode-specific layout information if available
    if (this.modeImplementation) {
      const modeInfo = this.modeImplementation.getLayoutInfo();
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
   * Apply layout information to this window
   * @param {Object} layoutInfo - The layout information to apply
   */
  applyLayout(layoutInfo) {
    // Apply base layout information
    super.applyLayout(layoutInfo);
    
    // Store the mode from layout info for later use
    if (layoutInfo.currentMode) {
      this.currentMode = layoutInfo.currentMode;
    }
    
    // Mode-specific layout will be applied after the mode implementation is loaded
    // This happens in render() which is called after applyLayout
    
    // If we already have a mode implementation, apply the layout to it
    if (this.modeImplementation && layoutInfo) {
      this.modeImplementation.applyLayout(layoutInfo);
    }
  }
}

export default OutputSideWindow;

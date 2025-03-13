// OutputSideWindow.js - Output console side window implementation
import SideWindow from './SideWindow.js';

class OutputSideWindow extends SideWindow {
  constructor(initialHeight = 200) {
    super('output', 'Output', initialHeight);
    this.outputContent = '';
  }
  
  /**
   * Initialize the content of the output window
   */
  initContent() {
    // Create output container
    const outputContainer = document.createElement('div');
    outputContainer.id = 'output-window';
    outputContainer.className = 'output-window';
    
    this.content.appendChild(outputContainer);
  }
  
  /**
   * Append content to the output window
   * @param {string} content - The content to append
   */
  appendContent(content) {
    this.outputContent += content;
    const outputWindow = this.content.querySelector('#output-window');
    if (outputWindow) {
      outputWindow.innerHTML = this.outputContent;
      outputWindow.scrollTop = outputWindow.scrollHeight;
    }
  }
  
  /**
   * Clear the output window
   */
  clearContent() {
    this.outputContent = '';
    const outputWindow = this.content.querySelector('#output-window');
    if (outputWindow) {
      outputWindow.innerHTML = '';
    }
  }
  
  /**
   * Update the output window with new data
   * @param {Object} data - The data to update with
   * @param {string} data.content - The content to append
   * @param {boolean} data.clear - Whether to clear the output first
   */
  update(data) {
    if (data) {
      if (data.clear) {
        this.clearContent();
      }
      
      if (data.content) {
        this.appendContent(data.content);
      }
    }
  }
}

export default OutputSideWindow;

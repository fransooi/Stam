// BrowserClipWindow.js - Generic browser clip window implementation
import ClipSideWindow from './ClipSideWindow.js';

class BrowserClipWindow extends ClipSideWindow {
  constructor(initialUrl = '') {
    super('browser', 'Browser', initialUrl || 'about:blank');
  }
  
  /**
   * Process the URL before setting it to the iframe
   * @param {string} url - The URL to process
   * @returns {string} - The processed URL
   */
  processUrl(url) {
    // For a generic browser, we just return the URL as is
    return url;
  }
  
  /**
   * Get the placeholder text for the URL input
   * @returns {string} - The placeholder text
   */
  getUrlPlaceholder() {
    return 'https://example.com';
  }
  
  /**
   * Get the help text for the URL input
   * @returns {string} - The help text HTML
   */
  getUrlHelpText() {
    return 'Enter any web URL';
  }
}

export default BrowserClipWindow;

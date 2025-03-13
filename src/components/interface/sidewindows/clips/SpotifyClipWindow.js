// SpotifyClipWindow.js - Spotify clip window implementation
import ClipSideWindow from './ClipSideWindow.js';

class SpotifyClipWindow extends ClipSideWindow {
  constructor(initialUrl = '') {
    super('spotify', 'Spotify', initialUrl || 'https://open.spotify.com');
    this.spotifyController = null;
  }
  
  /**
   * Initialize the iframe container with Spotify's embedded player
   * @param {HTMLElement} parentElement - The parent element to append the iframe to
   */
  initIframeContainer(parentElement) {
    // Create iframe container
    this.iframeContainer = document.createElement('div');
    this.iframeContainer.className = 'clip-iframe-container';
    
    // Create a container for the Spotify embed
    this.spotifyContainer = document.createElement('div');
    this.spotifyContainer.id = `spotify-embed-${Date.now()}`;
    this.spotifyContainer.className = 'spotify-embed-container';
    
    // Append container to parent
    this.iframeContainer.appendChild(this.spotifyContainer);
    parentElement.appendChild(this.iframeContainer);
    
    // Load the Spotify iframe API
    this.loadSpotifyIframeApi();
  }
  
  /**
   * Load the Spotify iframe API
   */
  loadSpotifyIframeApi() {
    // Check if the API script is already loaded
    if (document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')) {
      this.initSpotifyEmbed();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    
    // Set up the callback
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      this.spotifyIframeApi = IFrameAPI;
      this.initSpotifyEmbed();
    };
    
    // Add script to document
    document.body.appendChild(script);
  }
  
  /**
   * Initialize the Spotify embedded player
   */
  initSpotifyEmbed() {
    if (!this.spotifyIframeApi || !this.spotifyContainer) return;
    
    // Create the controller
    const options = {
      width: '100%',
      height: '100%',
      uri: this.getSpotifyUri(this.url)
    };
    
    this.spotifyIframeApi.createController(this.spotifyContainer, options, (controller) => {
      this.spotifyController = controller;
    });
  }
  
  /**
   * Process the URL before setting it to the iframe
   * @param {string} url - The URL to process
   * @returns {string} - The processed URL
   */
  processUrl(url) {
    // We're using the Spotify iframe API directly, so we don't need to return a URL
    // for the iframe src attribute
    return 'about:blank';
  }
  
  /**
   * Set a new URL for the Spotify player
   * @param {string} url - The new URL to load
   */
  setUrl(url) {
    this.url = url;
    
    if (this.spotifyController) {
      // Load the URI in the existing controller
      this.spotifyController.loadUri(this.getSpotifyUri(url));
    } else if (this.spotifyContainer && this.spotifyIframeApi) {
      // Re-initialize the embed with the new URL
      this.initSpotifyEmbed();
    }
  }
  
  /**
   * Convert a Spotify URL to a Spotify URI
   * @param {string} url - The Spotify URL
   * @returns {string} - The Spotify URI
   */
  getSpotifyUri(url) {
    // Default URI if we can't parse the URL
    let defaultUri = 'spotify:album:1DFixLWuPkv3KT3TnV35m3';
    
    if (!url || url === 'about:blank' || url === 'https://open.spotify.com') {
      return defaultUri;
    }
    
    try {
      // Handle URLs like https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3
      if (url.includes('open.spotify.com')) {
        // Remove any query parameters
        const cleanUrl = url.split('?')[0];
        // Get the path parts
        const parts = cleanUrl.replace('https://open.spotify.com/', '').split('/');
        
        if (parts.length >= 2) {
          const type = parts[0]; // album, track, playlist, etc.
          const id = parts[1];   // The Spotify ID
          return `spotify:${type}:${id}`;
        }
      }
      
      // Handle Spotify URIs directly (spotify:album:1DFixLWuPkv3KT3TnV35m3)
      if (url.startsWith('spotify:')) {
        return url;
      }
    } catch (e) {
      console.error('Error parsing Spotify URL:', e);
    }
    
    return defaultUri;
  }
  
  /**
   * Clean up resources when the clip window is removed
   */
  cleanup() {
    this.spotifyController = null;
  }
  
  /**
   * Get the placeholder text for the URL input
   * @returns {string} - The placeholder text
   */
  getUrlPlaceholder() {
    return 'https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3';
  }
  
  /**
   * Get the help text for the URL input
   * @returns {string} - The help text HTML
   */
  getUrlHelpText() {
    return 'Enter a Spotify URL (album, track, playlist, etc.) or Spotify URI';
  }
}

export default SpotifyClipWindow;

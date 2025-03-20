// YoutubeClipWindow.js - YouTube clip window implementation
import ClipWindow from './ClipWindow.js';

class YoutubeClipWindow extends ClipWindow {
  constructor(initialUrl = '') {
    super('youtube', 'YouTube', initialUrl);
  }
  
  /**
   * Process the URL before setting it to the iframe
   * @param {string} url - The URL to process
   * @returns {string} - The processed URL
   */
  processUrl(url) {
    // Check if it's a YouTube URL and not already in embed format
    if (url.includes('youtube.com') && !url.includes('/embed/')) {
      // Try to extract video ID from various YouTube URL formats
      let videoId = '';
      
      // Format: youtube.com/watch?v=VIDEO_ID
      const watchMatch = url.match(/[?&]v=([^&]+)/);
      if (watchMatch) {
        videoId = watchMatch[1];
      } 
      // Format: youtu.be/VIDEO_ID
      else if (url.includes('youtu.be/')) {
        const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
        if (shortMatch) {
          videoId = shortMatch[1];
        }
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
      }
    }
    
    // If it's already an embed URL, make sure it has the right parameters
    if (url.includes('youtube.com/embed/')) {
      if (!url.includes('enablejsapi=1')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}enablejsapi=1&rel=0`;
      }
    }
    
    // For all other URLs, use as is
    return url;
  }
  
  /**
   * Get the YouTube video ID from a URL
   * @param {string} url - The URL to extract the video ID from
   * @returns {string} - The video ID
   */
  getYoutubeVideoId(url) {
    // Try to extract video ID from various YouTube URL formats
    let videoId = '';
    
    // Format: youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    } 
    // Format: youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
      }
    }
    // Format: youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
      const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
    }
    
    return videoId;
  }
  
  /**
   * Set a new URL for the YouTube clip
   * @param {string} url - The new URL to load
   */
  setUrl(url) {
    if (!url) {
      return;
    }
    
    // Store the original URL
    this.originalUrl = url;
    
    // Process the URL to get the video ID
    const videoId = this.getYoutubeVideoId(url);
    
    if (videoId) {
      // Create the embed URL
      this.url = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
      
      // Update the iframe if it exists
      if (this.iframe) {
        this.iframe.src = this.url;
      }
    } else {
      // Not a valid YouTube URL, use as is
      this.url = url;
      
      // Update the iframe if it exists
      if (this.iframe) {
        this.iframe.src = this.url;
      }
    }
  }
  
  /**
   * Get the placeholder text for the URL input
   * @returns {string} - The placeholder text
   */
  getUrlPlaceholder() {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
  
  /**
   * Get the help text for the URL input
   * @returns {string} - The help text HTML
   */
  getUrlHelpText() {
    return 'Enter any YouTube URL (watch, embed, or short links)';
  }
}

export default YoutubeClipWindow;

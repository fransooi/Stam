// Playlist.js - Class representing a playlist of clips
class Playlist {
  /**
   * Create a new playlist
   * @param {string} name - Name of the playlist
   */
  constructor(name) {
    this.id = `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.items = [];
    this.currentIndex = 0;
  }
  
  /**
   * Add a clip to the playlist
   * @param {string} clipType - Type of clip (youtube, spotify, browser)
   * @param {string} url - URL of the clip
   * @param {Object} metadata - Additional metadata for the clip
   */
  addClip(clipType, url, metadata = {}) {
    this.items.push({
      clipType,
      url,
      metadata
    });
  }
  
  /**
   * Remove a clip from the playlist
   * @param {number} index - Index of the clip to remove
   * @returns {boolean} - True if the clip was removed, false otherwise
   */
  removeClip(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      
      // Adjust current index if needed
      if (this.currentIndex >= this.items.length) {
        this.currentIndex = Math.max(0, this.items.length - 1);
      }
      
      return true;
    }
    return false;
  }
  
  /**
   * Move to the next clip in the playlist
   * @returns {Object|null} - The next clip or null if at the end
   */
  nextClip() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      return this.getCurrentClip();
    }
    return null;
  }
  
  /**
   * Move to the previous clip in the playlist
   * @returns {Object|null} - The previous clip or null if at the beginning
   */
  previousClip() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.getCurrentClip();
    }
    return null;
  }
  
  /**
   * Get the current clip
   * @returns {Object|null} - The current clip or null if the playlist is empty
   */
  getCurrentClip() {
    if (this.items.length === 0) {
      return null;
    }
    return this.items[this.currentIndex];
  }
  
  /**
   * Set the current index
   * @param {number} index - The new index
   * @returns {boolean} - True if the index was set, false if out of bounds
   */
  setCurrentIndex(index) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      return true;
    }
    return false;
  }
  
  /**
   * Convert the playlist to a JSON object for storage
   * @returns {Object} - JSON representation of the playlist
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      items: this.items,
      currentIndex: this.currentIndex
    };
  }
  
  /**
   * Create a playlist from a JSON object
   * @param {Object} json - JSON representation of a playlist
   * @returns {Playlist} - The created playlist
   */
  static fromJSON(json) {
    const playlist = new Playlist(json.name);
    playlist.id = json.id;
    playlist.items = json.items;
    playlist.currentIndex = json.currentIndex || 0;
    return playlist;
  }
}

export default Playlist;

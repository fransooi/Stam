// PlaylistManager.js - Manages playlists for the TV window
import Playlist from './Playlist.js';

class PlaylistManager {
  constructor() {
    this.playlists = [];
    this.loadPlaylists();
  }
  
  /**
   * Load playlists from local storage
   */
  loadPlaylists() {
    try {
      const savedPlaylists = localStorage.getItem('tv-playlists');
      if (savedPlaylists) {
        const parsedPlaylists = JSON.parse(savedPlaylists);
        this.playlists = parsedPlaylists.map(playlistData => 
          Playlist.fromJSON(playlistData)
        );
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
      this.playlists = [];
    }
  }
  
  /**
   * Save playlists to local storage
   */
  savePlaylists() {
    try {
      const playlistsData = this.playlists.map(playlist => playlist.toJSON());
      localStorage.setItem('tv-playlists', JSON.stringify(playlistsData));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }
  
  /**
   * Get all playlists
   * @returns {Array} - Array of Playlist objects
   */
  getPlaylists() {
    return this.playlists;
  }
  
  /**
   * Get a playlist by ID
   * @param {string} id - ID of the playlist to get
   * @returns {Playlist|null} - The playlist or null if not found
   */
  getPlaylistById(id) {
    return this.playlists.find(playlist => playlist.id === id) || null;
  }
  
  /**
   * Create a new playlist
   * @param {string} name - Name of the playlist
   * @returns {Playlist} - The created playlist
   */
  createPlaylist(name) {
    const playlist = new Playlist(name);
    this.playlists.push(playlist);
    this.savePlaylists();
    return playlist;
  }
  
  /**
   * Update an existing playlist
   * @param {Playlist} updatedPlaylist - The updated playlist
   * @returns {boolean} - True if the playlist was updated, false otherwise
   */
  updatePlaylist(updatedPlaylist) {
    const index = this.playlists.findIndex(p => p.id === updatedPlaylist.id);
    if (index !== -1) {
      this.playlists[index] = updatedPlaylist;
      this.savePlaylists();
      return true;
    }
    return false;
  }
  
  /**
   * Delete a playlist
   * @param {string} playlistId - ID of the playlist to delete
   * @returns {boolean} - True if the playlist was deleted, false otherwise
   */
  deletePlaylist(playlistId) {
    const index = this.playlists.findIndex(p => p.id === playlistId);
    if (index !== -1) {
      this.playlists.splice(index, 1);
      this.savePlaylists();
      return true;
    }
    return false;
  }
  
  /**
   * Add a clip to a playlist
   * @param {string} playlistId - ID of the playlist
   * @param {string} clipType - Type of clip
   * @param {string} url - URL of the clip
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} - True if added, false if playlist not found
   */
  addClipToPlaylist(playlistId, clipType, url, metadata = {}) {
    const playlist = this.getPlaylistById(playlistId);
    if (playlist) {
      playlist.addClip(clipType, url, metadata);
      this.savePlaylists();
      return true;
    }
    return false;
  }
  
  /**
   * Remove a clip from a playlist
   * @param {string} playlistId - ID of the playlist
   * @param {string} clipId - ID of the clip
   * @returns {boolean} - True if removed, false if playlist or clip not found
   */
  removeClipFromPlaylist(playlistId, clipId) {
    const playlist = this.getPlaylistById(playlistId);
    if (playlist) {
      playlist.removeClip(clipId);
      this.savePlaylists();
      return true;
    }
    return false;
  }
}

export default PlaylistManager;

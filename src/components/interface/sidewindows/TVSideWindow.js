// TVSideWindow.js - TV side window implementation
import SideWindow from './SideWindow.js';
import YoutubeClipWindow from './clips/YoutubeClipWindow.js';
import SpotifyClipWindow from './clips/SpotifyClipWindow.js';
import BrowserClipWindow from './clips/BrowserClipWindow.js';
import PlaylistManager from './playlists/PlaylistManager.js';
import PlaylistEditorDialog from './playlists/PlaylistEditorDialog.js';

class TVSideWindow extends SideWindow {
  constructor(parentId, containerId, initialHeight = 300, initialUrl = '') {
    super('TV', 'TV', parentId, containerId, initialHeight);
    
    // Available clip types
    this.clipTypes = [
      { id: 'youtube', name: 'YouTube', class: YoutubeClipWindow },
      { id: 'spotify', name: 'Spotify', class: SpotifyClipWindow },
      { id: 'browser', name: 'Browser', class: BrowserClipWindow }
    ];
    
    // Default to YouTube clip
    this.currentClipType = 'youtube';
    this.clips = {};
    
    // Initialize clips for each type
    this.clipTypes.forEach(type => {
      this.clips[type.id] = new type.class(type.id === this.currentClipType ? initialUrl : '');
    });
    
    // Initialize playlist manager
    this.playlistManager = new PlaylistManager();
    this.currentPlaylist = null;
    this.isPlayingPlaylist = false;
    
    this.clipSelector = null;
    this.playlistControls = null;
  }
  
  /**
   * Override render to add custom buttons and set up content resize listener
   * @param {HTMLElement} parentContainer - The parent container
   * @returns {HTMLElement} - The rendered window element
   */
  render() {
    // Call parent render method
    const container = super.render();
    
    // Add clip selector button to the header
    this.addClipSelectorButton();
    
    // Add edit button to the header
    this.addEditButton();
    
    // Initialize the current clip
    this.clips[this.currentClipType].render(this.content);
    
    // Add event listener for content height changes
    this.content.addEventListener('contentHeightChanged', (event) => {
      this.handleContentHeightChanged(event.detail.height);
    });
    
    // Initial content height update
    this.updateContentHeight();
    
    // Force an immediate resize after a short delay to ensure proper rendering
    setTimeout(() => {
      // Get the current container height and recalculate
      if (this.container && this.header && !this.minimized) {
        const containerHeight = this.container.offsetHeight;
        const headerHeight = this.header.offsetHeight;
        const availableHeight = containerHeight - headerHeight;
        
        if (availableHeight > 0) {
          this.handleContentHeightChanged(availableHeight);
        }
      }
    }, 100);
    
    return container;
  }
  
  /**
   * Handle content height changes
   * @param {number} height - New content height
   */
  handleContentHeightChanged(height) {
    // Update the current clip's iframe or content size
    const currentClip = this.clips[this.currentClipType];
    if (currentClip && typeof currentClip.resize === 'function') {
      currentClip.resize(height);
    } else {
      // Fallback: find and resize iframe directly
      const iframe = this.content.querySelector('iframe');
      if (iframe) {
        iframe.style.height = `${height}px`;
        iframe.style.width = '100%';
      }
    }
  }
  
  /**
   * Add clip selector button to the header
   */
  addClipSelectorButton() {
    // Get the controls element
    const controlsElement = this.header.querySelector('.side-window-controls');
    
    if (controlsElement) {
      // Create clip selector container
      const selectorContainer = document.createElement('div');
      selectorContainer.className = 'clip-selector-container';
      
      // Create clip selector button
      const selectorButton = document.createElement('button');
      selectorButton.className = 'clip-selector-button';
      selectorButton.textContent = this.isPlayingPlaylist && this.currentPlaylist 
        ? this.currentPlaylist.name 
        : this.getClipTypeById(this.currentClipType).name;
      selectorButton.title = 'Change clip type or select playlist';
      
      // Create dropdown
      const dropdown = document.createElement('div');
      dropdown.className = 'clip-selector-dropdown';
      dropdown.style.display = 'none';
      
      // Add clip types to dropdown
      this.clipTypes.forEach(type => {
        const option = document.createElement('div');
        option.className = 'clip-selector-option';
        option.textContent = type.name;
        option.dataset.clipType = type.id;
        option.addEventListener('click', () => {
          this.stopPlaylist();
          this.changeClipType(type.id);
          dropdown.style.display = 'none';
        });
        dropdown.appendChild(option);
      });
      
      // Add separator if there are playlists
      const playlists = this.playlistManager.getPlaylists();
      if (playlists.length > 0) {
        const separator = document.createElement('div');
        separator.className = 'clip-selector-separator';
        dropdown.appendChild(separator);
        
        // Add playlists to dropdown
        playlists.forEach(playlist => {
          const option = document.createElement('div');
          option.className = 'clip-selector-option';
          option.textContent = playlist.name;
          option.dataset.playlistId = playlist.id;
          option.addEventListener('click', () => {
            this.startPlaylist(playlist.id);
            dropdown.style.display = 'none';
          });
          dropdown.appendChild(option);
        });
      }
      
      // Add separator for playlist management
      const managementSeparator = document.createElement('div');
      managementSeparator.className = 'clip-selector-separator';
      dropdown.appendChild(managementSeparator);
      
      // Add "Edit Playlists" option
      const editPlaylistsOption = document.createElement('div');
      editPlaylistsOption.className = 'clip-selector-option';
      editPlaylistsOption.textContent = 'Edit Playlists';
      editPlaylistsOption.addEventListener('click', () => {
        this.showPlaylistEditorDialog();
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(editPlaylistsOption);
      
      // Toggle dropdown on button click
      selectorButton.addEventListener('click', (e) => {
        e.stopPropagation();
        // Refresh dropdown content (to show updated playlists)
        this.refreshDropdownContent(dropdown);
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        dropdown.style.display = 'none';
      });
      
      // Assemble selector
      selectorContainer.appendChild(selectorButton);
      selectorContainer.appendChild(dropdown);
      
      // Store reference to selector
      this.clipSelector = {
        container: selectorContainer,
        button: selectorButton,
        dropdown: dropdown
      };
      
      // Insert the selector before the first child
      controlsElement.insertBefore(selectorContainer, controlsElement.firstChild);
    }
  }
  
  /**
   * Refresh the dropdown content to show updated playlists
   * @param {HTMLElement} dropdown - The dropdown element to refresh
   */
  refreshDropdownContent(dropdown) {
    // Clear existing content
    dropdown.innerHTML = '';
    
    // Add clip types to dropdown
    this.clipTypes.forEach(type => {
      const option = document.createElement('div');
      option.className = 'clip-selector-option';
      option.textContent = type.name;
      option.dataset.clipType = type.id;
      option.addEventListener('click', () => {
        this.stopPlaylist();
        this.changeClipType(type.id);
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(option);
    });
    
    // Add separator if there are playlists
    const playlists = this.playlistManager.getPlaylists();
    if (playlists.length > 0) {
      const separator = document.createElement('div');
      separator.className = 'clip-selector-separator';
      dropdown.appendChild(separator);
      
      // Add playlists to dropdown
      playlists.forEach(playlist => {
        const option = document.createElement('div');
        option.className = 'clip-selector-option';
        option.textContent = playlist.name;
        option.dataset.playlistId = playlist.id;
        option.addEventListener('click', () => {
          this.startPlaylist(playlist.id);
          dropdown.style.display = 'none';
        });
        dropdown.appendChild(option);
      });
    }
    
    // Add separator for playlist management
    const managementSeparator = document.createElement('div');
    managementSeparator.className = 'clip-selector-separator';
    dropdown.appendChild(managementSeparator);
    
    // Add "Edit Playlists" option
    const editPlaylistsOption = document.createElement('div');
    editPlaylistsOption.className = 'clip-selector-option';
    editPlaylistsOption.textContent = 'Edit Playlists';
    editPlaylistsOption.addEventListener('click', () => {
      this.showPlaylistEditorDialog();
      dropdown.style.display = 'none';
    });
    dropdown.appendChild(editPlaylistsOption);
  }
  
  /**
   * Add edit button to the header
   */
  addEditButton() {
    // Get the controls element
    const controlsElement = this.header.querySelector('.side-window-controls');
    
    if (controlsElement) {
      // Create edit button
      const editButton = document.createElement('button');
      editButton.className = 'side-window-edit';
      editButton.innerHTML = '✏️';
      editButton.title = 'Edit URL';
      editButton.addEventListener('click', () => this.showUrlModal());
      
      // Insert the edit button after the clip selector
      if (this.clipSelector) {
        controlsElement.insertBefore(editButton, this.clipSelector.container.nextSibling);
      } else {
        controlsElement.insertBefore(editButton, controlsElement.firstChild);
      }
    }
  }
  
  /**
   * Add playlist controls to the content area
   */
  addPlaylistControls() {
    // Remove existing controls if any
    this.removePlaylistControls();
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'playlist-controls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.bottom = '0';
    controlsContainer.style.width = '100%';
    
    // Create previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'playlist-control-button';
    prevButton.innerHTML = '⏮';
    prevButton.title = 'Previous clip';
    prevButton.addEventListener('click', () => this.playPreviousClip());
    
    // Create play/pause button
    const playPauseButton = document.createElement('button');
    playPauseButton.className = 'playlist-control-button';
    playPauseButton.innerHTML = '⏸';
    playPauseButton.title = 'Pause playlist';
    // Implement play/pause functionality later
    
    // Create next button
    const nextButton = document.createElement('button');
    nextButton.className = 'playlist-control-button';
    nextButton.innerHTML = '⏭';
    nextButton.title = 'Next clip';
    nextButton.addEventListener('click', () => this.playNextClip());
    
    // Create info text
    const infoText = document.createElement('div');
    infoText.className = 'playlist-info';
    
    if (this.currentPlaylist) {
      const currentClip = this.currentPlaylist.getCurrentClip();
      if (currentClip) {
        const currentIndex = this.currentPlaylist.currentIndex + 1;
        const totalClips = this.currentPlaylist.items.length;
        infoText.textContent = `${currentIndex}/${totalClips}`;
      }
    }
    
    // Assemble controls
    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(playPauseButton);
    controlsContainer.appendChild(nextButton);
    controlsContainer.appendChild(infoText);
    
    // Add to content
    this.content.appendChild(controlsContainer);
    
    // Store reference
    this.playlistControls = {
      container: controlsContainer,
      prevButton: prevButton,
      playPauseButton: playPauseButton,
      nextButton: nextButton,
      infoText: infoText
    };
  }
  
  /**
   * Remove playlist controls
   */
  removePlaylistControls() {
    if (this.playlistControls && this.playlistControls.container) {
      if (this.playlistControls.container.parentNode) {
        this.playlistControls.container.parentNode.removeChild(this.playlistControls.container);
      }
      this.playlistControls = null;
    }
  }
  
  /**
   * Get clip type by ID
   * @param {string} id - The clip type ID
   * @returns {Object} - The clip type object
   */
  getClipTypeById(id) {
    return this.clipTypes.find(type => type.id === id) || this.clipTypes[0];
  }
  
  /**
   * Change the current clip type
   * @param {string} clipTypeId - The ID of the clip type to change to
   */
  changeClipType(clipTypeId) {
    if (this.currentClipType === clipTypeId) {
      return; // Already the current type
    }
    
    // Clean up current clip
    this.clips[this.currentClipType].cleanup();
    
    // Update current clip type
    this.currentClipType = clipTypeId;
    
    // Update selector button text
    if (this.clipSelector) {
      this.clipSelector.button.textContent = this.getClipTypeById(clipTypeId).name;
    }
    
    // Clear content
    this.content.innerHTML = '';
    
    // Initialize new clip
    this.clips[clipTypeId].render(this.content);
  }
  
  /**
   * Start playing a playlist
   * @param {string} playlistId - ID of the playlist to play
   */
  startPlaylist(playlistId) {
    const playlist = this.playlistManager.getPlaylistById(playlistId);
    if (!playlist) {
      console.error('Playlist not found:', playlistId);
      return;
    }
    
    // Set as current playlist
    this.currentPlaylist = playlist;
    this.isPlayingPlaylist = true;
    
    // Update selector button text
    if (this.clipSelector) {
      this.clipSelector.button.textContent = playlist.name;
    }
    
    // Play the current clip in the playlist
    this.playCurrentClip();
  }
  
  /**
   * Stop the current playlist
   */
  stopPlaylist() {
    if (this.isPlayingPlaylist) {
      this.isPlayingPlaylist = false;
      this.currentPlaylist = null;
      
      // Update selector button text
      if (this.clipSelector) {
        this.clipSelector.button.textContent = this.getClipTypeById(this.currentClipType).name;
      }
      
      // Remove playlist controls
      this.removePlaylistControls();
    }
  }
  
  /**
   * Play the current clip in the playlist
   */
  playCurrentClip() {
    if (!this.currentPlaylist) {
      return;
    }
    
    const currentClip = this.currentPlaylist.getCurrentClip();
    if (currentClip) {
      // Change to the clip type of the current clip
      if (this.currentClipType !== currentClip.clipType) {
        // Just update the current clip type without cleaning up yet
        this.currentClipType = currentClip.clipType;
      }
      
      // Clear content
      this.content.innerHTML = '';
      
      // Initialize the clip content
      this.clips[this.currentClipType].render(this.content);
      
      // Set the URL after the content is initialized
      this.setUrl(currentClip.url);
      
      // Add playlist controls
      this.addPlaylistControls();
      
      // Update playlist info if controls exist
      if (this.playlistControls) {
        const currentIndex = this.currentPlaylist.currentIndex + 1;
        const totalClips = this.currentPlaylist.items.length;
        this.playlistControls.infoText.textContent = `${currentIndex}/${totalClips}`;
      }
    }
  }
  
  /**
   * Play the next clip in the playlist
   */
  playNextClip() {
    if (this.currentPlaylist) {
      this.currentPlaylist.nextClip();
      this.playCurrentClip();
    }
  }
  
  /**
   * Play the previous clip in the playlist
   */
  playPreviousClip() {
    if (this.currentPlaylist) {
      this.currentPlaylist.previousClip();
      this.playCurrentClip();
    }
  }
  
  /**
   * Show the playlist editor dialog
   */
  showPlaylistEditorDialog() {
    const dialog = new PlaylistEditorDialog(this.playlistManager.playlists, (updatedPlaylists) => {
      // Save the updated playlists
      this.playlistManager.savePlaylists();
      
      // Refresh the dropdown content
      if (this.clipSelector && this.clipSelector.dropdown) {
        this.refreshDropdownContent(this.clipSelector.dropdown);
      }
      
      // If the current playlist was deleted, stop playing it
      if (this.currentPlaylist && !updatedPlaylists.find(p => p.id === this.currentPlaylist.id)) {
        this.stopPlaylist();
      }
    });
    
    dialog.show();
  }
  
  /**
   * Show the URL edit modal
   */
  showUrlModal() {
    // Delegate to current clip
    this.clips[this.currentClipType].showUrlModal();
  }
  
  /**
   * Set a new URL for the current clip
   * @param {string} url - The new URL to load
   */
  setUrl(url) {
    if (url) {
      this.clips[this.currentClipType].setUrl(url);
      
      // If playing a playlist, add this URL to the current clip
      if (this.isPlayingPlaylist && this.currentPlaylist) {
        const currentClip = this.currentPlaylist.getCurrentClip();
        if (currentClip) {
          currentClip.url = url;
          this.playlistManager.savePlaylists();
        }
      }
    }
  }
  
  /**
   * Get the current URL from the active clip
   * @returns {string} - The current URL
   */
  getUrl() {
    return this.clips[this.currentClipType].url;
  }
  
  /**
   * Update the TV window with new data
   * @param {Object} data - The data to update with
   * @param {string} data.url - The new URL to load
   * @param {string} data.clipType - The clip type to change to
   * @param {string} data.playlistId - The playlist to start
   */
  update(data) {
    if (data) {
      if (data.playlistId) {
        this.startPlaylist(data.playlistId);
      } else {
        if (data.clipType && data.clipType !== this.currentClipType) {
          this.changeClipType(data.clipType);
        }
        
        if (data.url) {
          this.setUrl(data.url);
        }
      }
    }
  }
  
  /**
   * Override getLayoutInfo to include TVSideWindow-specific information
   * @returns {Object} Layout information for this TVSideWindow
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add TVSideWindow-specific information
    layoutInfo.currentClipType = this.currentClipType;
    
    // Save current URL for the active clip
    layoutInfo.currentUrl = this.getUrl();
    
    // Save all clip URLs
    layoutInfo.clipUrls = {};
    Object.keys(this.clips).forEach(clipType => {
      layoutInfo.clipUrls[clipType] = this.clips[clipType].url;
    });
    
    // Add playlist information if playing a playlist
    if (this.isPlayingPlaylist && this.currentPlaylist) {
      layoutInfo.playlist = {
        id: this.currentPlaylist.id,
        name: this.currentPlaylist.name,
        currentIndex: this.currentPlaylist.currentIndex,
        itemCount: this.currentPlaylist.items.length
      };
      
      // Add the current clip from the playlist
      const currentClip = this.currentPlaylist.getCurrentClip();
      if (currentClip) {
        layoutInfo.currentPlaylistClip = {
          clipType: currentClip.clipType,
          url: currentClip.url,
          metadata: currentClip.metadata || {}
        };
      }
      
      layoutInfo.isPlayingPlaylist = true;
    } else {
      layoutInfo.isPlayingPlaylist = false;
    }
    
    // Add all available playlists (just IDs and names)
    layoutInfo.availablePlaylists = this.playlistManager.getPlaylists().map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      itemCount: playlist.items.length
    }));
    
    return layoutInfo;
  }
  
  /**
   * Clean up resources when the window is closed
   */
  close() {
    // Clean up all clips
    Object.values(this.clips).forEach(clip => clip.cleanup());
    
    // Call the parent close method
    super.close();
  }
  
  /**
   * Apply layout information to restore the TVSideWindow state
   * @param {Object} layoutInfo - Layout information for this TVSideWindow
   */
  applyLayout(layoutInfo) {
    console.log('TVSideWindow applying layout:', layoutInfo);
    
    // Call parent applyLayout if it exists
    if (super.applyLayout) {
      super.applyLayout(layoutInfo);
    }
    
    // Set current clip type if specified
    if (layoutInfo.currentClipType && this.clips[layoutInfo.currentClipType]) {
      this.currentClipType = layoutInfo.currentClipType;
    }
    
    // Set URLs for all clips if specified
    if (layoutInfo.clipUrls) {
      Object.keys(layoutInfo.clipUrls).forEach(clipType => {
        if (this.clips[clipType]) {
          this.clips[clipType].setUrl(layoutInfo.clipUrls[clipType]);
        }
      });
    }
    
    // Set current URL if specified
    if (layoutInfo.currentUrl && this.clips[this.currentClipType]) {
      this.clips[this.currentClipType].setUrl(layoutInfo.currentUrl);
    }
    
    // Restore playlist if specified
    if (layoutInfo.isPlayingPlaylist && layoutInfo.playlist) {
      // Find the playlist by ID
      const playlist = this.playlistManager.getPlaylistById(layoutInfo.playlist.id);
      if (playlist) {
        this.currentPlaylist = playlist;
        this.isPlayingPlaylist = true;
        
        // Set current index if specified
        if (layoutInfo.playlist.currentIndex !== undefined) {
          this.currentPlaylist.currentIndex = layoutInfo.playlist.currentIndex;
        }
        
        // Load the current clip from the playlist
        this.loadCurrentPlaylistClip();
      }
    }
    
    // Render the current clip
    this.renderCurrentClip();
  }
  
  /**
   * Update the content height
   */
  updateContentHeight() {
    const contentHeight = this.content.offsetHeight;
    this.handleContentHeightChanged(contentHeight);
  }
  
  /**
   * Load the current clip from the playlist
   */
  loadCurrentPlaylistClip() {
    const currentClip = this.currentPlaylist.getCurrentClip();
    if (currentClip) {
      // Change to the clip type of the current clip
      if (this.currentClipType !== currentClip.clipType) {
        this.changeClipType(currentClip.clipType);
      }
      
      // Clear content
      this.content.innerHTML = '';
      
      // Initialize the clip content
      this.clips[this.currentClipType].render(this.content);
      
      // Set the URL after the content is initialized
      this.setUrl(currentClip.url);
    }
  }
  
  /**
   * Render the current clip
   */
  renderCurrentClip() {
    // Clear content
    this.content.innerHTML = '';
    
    // Initialize the clip content
    this.clips[this.currentClipType].render(this.content);
  }
}

export default TVSideWindow;

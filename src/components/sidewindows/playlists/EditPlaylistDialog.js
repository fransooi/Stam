// EditPlaylistDialog.js - Dialog for editing a single playlist
import Playlist from './Playlist.js';

class EditPlaylistDialog {
  constructor(playlist, onSave) {
    this.playlist = playlist;
    this.onSave = onSave;
    this.dialogContainer = null;
    this.clipItems = [];
    
    // If editing an existing playlist, copy its items
    if (playlist) {
      this.clipItems = JSON.parse(JSON.stringify(playlist.items));
    }
  }
  
  /**
   * Show the edit playlist dialog
   */
  show() {
    // Create dialog container
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.className = 'playlist-dialog';
    
    // Create dialog content
    const dialogContent = document.createElement('div');
    dialogContent.className = 'playlist-dialog-content playlist-edit-content';
    
    // Create dialog header
    const dialogHeader = document.createElement('div');
    dialogHeader.className = 'playlist-dialog-header';
    dialogHeader.textContent = this.playlist ? `Edit Playlist: ${this.playlist.name}` : 'Create New Playlist';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'playlist-dialog-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => this.close());
    
    dialogHeader.appendChild(closeButton);
    
    // Create form
    const form = document.createElement('div');
    
    // Create name input
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Playlist Name:';
    nameLabel.htmlFor = 'playlist-edit-name';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'playlist-edit-name';
    nameInput.placeholder = 'My Playlist';
    nameInput.value = this.playlist ? this.playlist.name : '';
    
    // Create clips section
    const clipsSection = document.createElement('div');
    clipsSection.className = 'playlist-clips-section';
    
    const clipsLabel = document.createElement('div');
    clipsLabel.className = 'playlist-clips-label';
    clipsLabel.textContent = 'Clips:';
    
    // Create clips container
    const clipsContainer = document.createElement('div');
    clipsContainer.className = 'playlist-clips-container';
    
    // Add clips to the container
    this.renderClipItems(clipsContainer);
    
    // Create add clip button
    const addClipButton = document.createElement('button');
    addClipButton.type = 'button';
    addClipButton.className = 'playlist-add-clip-button';
    addClipButton.innerHTML = '<i class="fas fa-plus"></i> Add Clip';
    addClipButton.addEventListener('click', () => this.addClipItem(clipsContainer));
    
    clipsSection.appendChild(clipsLabel);
    clipsSection.appendChild(clipsContainer);
    clipsSection.appendChild(addClipButton);
    
    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'playlist-dialog-buttons';
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => this.close());
    
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = this.playlist ? 'Save' : 'Create';
    saveButton.addEventListener('click', () => this.savePlaylist());
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    
    // Assemble form
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(clipsSection);
    form.appendChild(buttonContainer);
    
    // Assemble dialog
    dialogContent.appendChild(dialogHeader);
    dialogContent.appendChild(form);
    this.dialogContainer.appendChild(dialogContent);
    
    // Add to document
    document.body.appendChild(this.dialogContainer);
    
    // Focus the name input
    nameInput.focus();
    
    // Add click event to close when clicking outside
    this.dialogContainer.addEventListener('click', (e) => {
      if (e.target === this.dialogContainer) {
        this.close();
      }
    });
  }
  
  /**
   * Render clip items in the container
   * @param {HTMLElement} container - The container to render clips in
   */
  renderClipItems(container) {
    // Clear container
    container.innerHTML = '';
    
    // If no clips, show a message
    if (this.clipItems.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'playlist-empty-message';
      emptyMessage.textContent = 'No clips in this playlist. Click "Add Clip" to add one.';
      container.appendChild(emptyMessage);
      return;
    }
    
    // Add clips to the container
    this.clipItems.forEach((clip, index) => {
      const clipItem = document.createElement('div');
      clipItem.className = 'playlist-clip-item';
      
      // Create clip type selector
      const typeSelect = document.createElement('select');
      typeSelect.className = 'playlist-clip-type';
      
      const youtubeOption = document.createElement('option');
      youtubeOption.value = 'youtube';
      youtubeOption.textContent = 'YouTube';
      
      const spotifyOption = document.createElement('option');
      spotifyOption.value = 'spotify';
      spotifyOption.textContent = 'Spotify';
      
      const browserOption = document.createElement('option');
      browserOption.value = 'browser';
      browserOption.textContent = 'Browser';
      
      typeSelect.appendChild(youtubeOption);
      typeSelect.appendChild(spotifyOption);
      typeSelect.appendChild(browserOption);
      
      // Set selected option
      typeSelect.value = clip.clipType;
      
      // Add change event
      typeSelect.addEventListener('change', () => {
        this.clipItems[index].clipType = typeSelect.value;
      });
      
      // Create URL input
      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.className = 'playlist-clip-url';
      urlInput.placeholder = 'Enter URL';
      urlInput.value = clip.url || '';
      
      // Add input event
      urlInput.addEventListener('input', () => {
        this.clipItems[index].url = urlInput.value;
      });
      
      // Create move up button
      const moveUpButton = document.createElement('button');
      moveUpButton.type = 'button';
      moveUpButton.className = 'playlist-clip-move';
      moveUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
      moveUpButton.title = 'Move Up';
      moveUpButton.disabled = index === 0;
      moveUpButton.addEventListener('click', () => {
        if (index > 0) {
          // Swap with previous item
          const temp = this.clipItems[index];
          this.clipItems[index] = this.clipItems[index - 1];
          this.clipItems[index - 1] = temp;
          
          // Re-render clips
          this.renderClipItems(container);
        }
      });
      
      // Create move down button
      const moveDownButton = document.createElement('button');
      moveDownButton.type = 'button';
      moveDownButton.className = 'playlist-clip-move';
      moveDownButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
      moveDownButton.title = 'Move Down';
      moveDownButton.disabled = index === this.clipItems.length - 1;
      moveDownButton.addEventListener('click', () => {
        if (index < this.clipItems.length - 1) {
          // Swap with next item
          const temp = this.clipItems[index];
          this.clipItems[index] = this.clipItems[index + 1];
          this.clipItems[index + 1] = temp;
          
          // Re-render clips
          this.renderClipItems(container);
        }
      });
      
      // Create remove button
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'playlist-clip-remove';
      removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
      removeButton.title = 'Remove Clip';
      removeButton.addEventListener('click', () => {
        // Remove clip from items
        this.clipItems.splice(index, 1);
        
        // Re-render clips
        this.renderClipItems(container);
      });
      
      // Assemble clip item
      clipItem.appendChild(typeSelect);
      clipItem.appendChild(urlInput);
      clipItem.appendChild(moveUpButton);
      clipItem.appendChild(moveDownButton);
      clipItem.appendChild(removeButton);
      
      container.appendChild(clipItem);
    });
  }
  
  /**
   * Add a new clip item
   * @param {HTMLElement} container - The container to add the clip to
   */
  addClipItem(container) {
    // Add a new empty clip
    this.clipItems.push({
      clipType: 'youtube',
      url: '',
      metadata: {}
    });
    
    // Re-render clips
    this.renderClipItems(container);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }
  
  /**
   * Save the playlist
   */
  savePlaylist() {
    const nameInput = document.getElementById('playlist-edit-name');
    if (!nameInput || !nameInput.value.trim()) {
      alert('Please enter a playlist name.');
      return;
    }
    
    // Filter out clips with empty URLs
    const validClips = this.clipItems.filter(clip => clip.url && clip.url.trim() !== '');
    
    if (validClips.length === 0) {
      alert('Please add at least one clip with a valid URL to the playlist.');
      return;
    }
    
    // Create or update playlist
    let playlist;
    
    if (this.playlist) {
      // Update existing playlist
      this.playlist.name = nameInput.value.trim();
      this.playlist.items = validClips;
      playlist = this.playlist;
    } else {
      // Create new playlist
      playlist = new Playlist(nameInput.value.trim());
      playlist.items = validClips;
    }
    
    // Close dialog first
    this.close();
    
    // Call onSave callback with the playlist
    if (this.onSave) {
      this.onSave(playlist);
    }
  }
  
  /**
   * Close the dialog
   */
  close() {
    if (this.dialogContainer) {
      // Force removal
      document.body.removeChild(this.dialogContainer);
      this.dialogContainer = null;
    }
  }
}

export default EditPlaylistDialog;

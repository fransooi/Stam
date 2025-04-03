// PlaylistEditorDialog.js - Dialog for editing playlists
import EditPlaylistDialog from './EditPlaylistDialog.js';

class PlaylistEditorDialog {
  constructor(playlists, onSave) {
    this.playlists = playlists;
    this.onSave = onSave;
    this.dialogContainer = null;
    this.selectedPlaylistId = null;
  }
  
  /**
   * Show the playlist editor dialog
   */
  show() {
    // Create dialog container
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.className = 'playlist-dialog';
    
    // Create dialog content
    const dialogContent = document.createElement('div');
    dialogContent.className = 'playlist-dialog-content';
    
    // Create dialog header
    const dialogHeader = document.createElement('div');
    dialogHeader.className = 'playlist-dialog-header';
    dialogHeader.textContent = 'Edit Playlists';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'playlist-dialog-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => this.close());
    
    dialogHeader.appendChild(closeButton);
    
    // Create playlist list container
    const playlistContainer = document.createElement('div');
    playlistContainer.className = 'playlist-list-container';
    
    // Create action buttons
    const actionContainer = document.createElement('div');
    actionContainer.className = 'playlist-action-buttons';
    
    const newButton = document.createElement('button');
    newButton.className = 'playlist-action-button';
    newButton.innerHTML = '<i class="fas fa-plus"></i>';
    newButton.title = 'New Playlist';
    newButton.addEventListener('click', () => this.createNewPlaylist());
    
    const editButton = document.createElement('button');
    editButton.className = 'playlist-action-button';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Edit Playlist';
    editButton.disabled = true;
    editButton.addEventListener('click', () => {
      if (this.selectedPlaylistId) {
        this.editPlaylist(this.selectedPlaylistId);
      }
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'playlist-action-button';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.title = 'Delete Playlist';
    deleteButton.disabled = true;
    deleteButton.addEventListener('click', () => {
      if (this.selectedPlaylistId) {
        this.deletePlaylist(this.selectedPlaylistId);
      }
    });
    
    actionContainer.appendChild(newButton);
    actionContainer.appendChild(editButton);
    actionContainer.appendChild(deleteButton);
    
    // Create playlist list
    const playlistList = document.createElement('div');
    playlistList.className = 'playlist-list';
    
    // Add playlists to the list
    if (this.playlists.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'playlist-empty-message';
      emptyMessage.textContent = 'No playlists available. Click the + button to create one.';
      playlistList.appendChild(emptyMessage);
    } else {
      this.playlists.forEach(playlist => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        playlistItem.dataset.id = playlist.id;
        
        const playlistName = document.createElement('div');
        playlistName.className = 'playlist-item-name';
        playlistName.textContent = playlist.name;
        
        const playlistInfo = document.createElement('div');
        playlistInfo.className = 'playlist-item-info';
        playlistInfo.textContent = `${playlist.items.length} clips`;
        
        playlistItem.appendChild(playlistName);
        playlistItem.appendChild(playlistInfo);
        
        // Add click event to select playlist
        playlistItem.addEventListener('click', () => {
          // Remove selected class from all items
          const selectedItems = playlistList.querySelectorAll('.playlist-item.selected');
          selectedItems.forEach(item => item.classList.remove('selected'));
          
          // Add selected class to clicked item
          playlistItem.classList.add('selected');
          
          // Update selected playlist ID
          this.selectedPlaylistId = playlist.id;
          
          // Enable edit and delete buttons
          editButton.disabled = false;
          deleteButton.disabled = false;
        });
        
        // Add double click event to edit playlist
        playlistItem.addEventListener('dblclick', () => {
          this.editPlaylist(playlist.id);
        });
        
        playlistList.appendChild(playlistItem);
      });
    }
    
    playlistContainer.appendChild(playlistList);
    playlistContainer.appendChild(actionContainer);
    
    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'playlist-dialog-buttons';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Close';
    cancelButton.addEventListener('click', () => this.close());
    
    buttonContainer.appendChild(cancelButton);
    
    // Assemble dialog
    dialogContent.appendChild(dialogHeader);
    dialogContent.appendChild(playlistContainer);
    dialogContent.appendChild(buttonContainer);
    this.dialogContainer.appendChild(dialogContent);
    
    // Add to document
    document.body.appendChild(this.dialogContainer);
    
    // Add click event to close when clicking outside
    this.dialogContainer.addEventListener('click', (e) => {
      if (e.target === this.dialogContainer) {
        this.close();
      }
    });
  }
  
  /**
   * Create a new playlist
   */
  createNewPlaylist() {
    const dialog = new EditPlaylistDialog(null, (newPlaylist) => {
      if (newPlaylist) {
        // Add the new playlist to the list
        this.playlists.push(newPlaylist);
        
        // Notify parent about the new playlist
        if (this.onSave) {
          this.onSave(this.playlists);
        }
        
        // Refresh the dialog
        this.close();
        this.show();
      }
    });
    
    dialog.show();
  }
  
  /**
   * Edit an existing playlist
   * @param {string} playlistId - ID of the playlist to edit
   */
  editPlaylist(playlistId) {
    const playlistIndex = this.playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) return;
    
    const playlist = this.playlists[playlistIndex];
    
    const dialog = new EditPlaylistDialog(playlist, (updatedPlaylist) => {
      if (updatedPlaylist) {
        // Update the playlist in the list
        this.playlists[playlistIndex] = updatedPlaylist;
        
        // Notify parent about the updated playlist
        if (this.onSave) {
          this.onSave(this.playlists);
        }
        
        // Refresh the dialog
        this.close();
        this.show();
      }
    });
    
    dialog.show();
  }
  
  /**
   * Delete a playlist
   * @param {string} playlistId - ID of the playlist to delete
   */
  deletePlaylist(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    // Create confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'playlist-confirm-dialog';
    
    const confirmContent = document.createElement('div');
    confirmContent.className = 'playlist-confirm-content';
    
    const confirmMessage = document.createElement('div');
    confirmMessage.className = 'playlist-confirm-message';
    confirmMessage.textContent = `Are you sure you want to delete "${playlist.name}"?`;
    
    const confirmButtons = document.createElement('div');
    confirmButtons.className = 'playlist-confirm-buttons';
    
    // Function to close the confirmation dialog
    const closeConfirmDialog = () => {
      document.body.removeChild(confirmDialog);
    };
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', closeConfirmDialog);
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.type = 'button';
    deleteButton.className = 'playlist-delete-button';
    deleteButton.addEventListener('click', () => {
      // Remove the playlist from the list
      const index = this.playlists.findIndex(p => p.id === playlistId);
      if (index !== -1) {
        this.playlists.splice(index, 1);
      }
      
      // Close the confirmation dialog first
      closeConfirmDialog();
      
      // Notify parent about the deleted playlist
      if (this.onSave) {
        this.onSave(this.playlists);
      }
      
      // Refresh the dialog
      this.close();
      this.show();
    });
    
    confirmButtons.appendChild(cancelButton);
    confirmButtons.appendChild(deleteButton);
    
    confirmContent.appendChild(confirmMessage);
    confirmContent.appendChild(confirmButtons);
    confirmDialog.appendChild(confirmContent);
    
    // Add to document
    document.body.appendChild(confirmDialog);
    
    // Add click event to close when clicking outside
    confirmDialog.addEventListener('click', (e) => {
      if (e.target === confirmDialog) {
        closeConfirmDialog();
      }
    });
  }
  
  /**
   * Hide the dialog
   */
  hide() {
    if (this.dialogContainer) {
      document.body.removeChild(this.dialogContainer);
      this.dialogContainer = null;
    }
  }
  
  /**
   * Close the dialog - alias for hide()
   */
  close() {
    this.hide();
  }
}

export default PlaylistEditorDialog;

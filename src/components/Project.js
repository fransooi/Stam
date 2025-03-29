/**
 * Project.js
 * 
 * This component manages application preferences and layout persistence.
 * It creates a dialog box for managing preferences and handles layout saving/loading.
 */

import BaseComponent, { MESSAGES } from '../utils/BaseComponent.js';
import { SOCKETMESSAGES } from './interface/sidewindows/SocketSideWindow.js';

export const PROJECTMESSAGES = {
  SHOW_PROJECTDIALOG: 'show-project-dialog',
  HIDE_PROJECTDIALOG: 'hide-project-dialog'
};

class Project extends BaseComponent {
  /**
   * Constructor
   * @param {string} parentId - ID of the parent component
   */
  constructor(parentId = null,containerId) {
    super('Project', parentId,containerId);      
    this.messageMap[PROJECTMESSAGES.SHOW_PROJECTDIALOG] = this.handleShowProjectDialog;
    this.messageMap[PROJECTMESSAGES.HIDE_PROJECTDIALOG] = this.handleHideProjectDialog;
    this.messageMap[SOCKETMESSAGES.CONNECTED] = this.handleConnected;
    this.messageMap[SOCKETMESSAGES.DISCONNECTED] = this.handleDisconnected;
  }

  async init(options = {}) {
    await super.init(options);
  }
  
  async destroy() {
    await super.destroy();
  }
  
  handleShowProjectDialog(data, senderId) {
    
  }

  handleHideProjectDialog(data, senderId) {
    
  }

  async handleConnected(data, senderId) {

    // If no project is loaded...
    if (!this.project)
    {
      if (this.projectName)
      {
        // Load the project
        this.root.fileSystem.loadProject({ name: this.projectName })
        .then((project) => {
          this.project = project;
          this.broadcast(PROJECTMESSAGES.SETPROJECT, project);
        });
      } else {
        // Create a new project
        this.root.fileSystem.newProject({name: 'New Project', mode: 'phaser' /*this.root.currentMode*/, template: 'default', overwrite: true})
        .then((project) => {
          this.project = project;
          this.broadcast(PROJECTMESSAGES.SETPROJECT, project);
        })
        .catch((error) => {
          console.error('Error creating new project:', error);
        });
      }
    }
    
  }

  async handleDisconnected(data, senderId) {
    
  }

  /////////////////////////////////////////////////////////////////////////
  // Dialog box
  /////////////////////////////////////////////////////////////////////////
  async render(containerId)
  {
    await super.render(containerId);

    // Create the dialog element
    this.element = document.createElement('div');
    this.element.id = 'project-dialog';
    this.element.className = 'project-dialog';
    this.element.style.display = 'none';
    this.element.style.position = 'fixed';
    this.element.style.top = '50%';
    this.element.style.left = '50%';
    this.element.style.transform = 'translate(-50%, -50%)';
    this.element.style.backgroundColor = '#2a2a2a';
    this.element.style.border = '1px solid #444';
    this.element.style.borderRadius = '4px';
    this.element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    this.element.style.padding = '20px';
    this.element.style.minWidth = '400px';
    this.element.style.zIndex = '1000';
    
    // Create dialog header
    const header = document.createElement('div');
    header.className = 'project-dialog-header';
    header.style.marginBottom = '20px';
    header.style.borderBottom = '1px solid #444';
    header.style.paddingBottom = '10px';
    
    const title = document.createElement('h2');
    title.textContent = 'Project';
    title.style.margin = '0';
    title.style.color = '#eee';
    title.style.fontSize = '18px';
    
    header.appendChild(title);
    this.element.appendChild(header);
    
    // Create dialog content area
    const content = document.createElement('div');
    content.className = 'project-dialog-content';
    content.style.marginBottom = '20px';
    
    const message = document.createElement('p');
    message.textContent = 'Project dialog box';
    message.style.color = '#ddd';
    
    content.appendChild(message);
    this.element.appendChild(content);
    
    // Create dialog footer with buttons
    const footer = document.createElement('div');
    footer.className = 'project-dialog-footer';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '10px';
    
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.padding = '8px 16px';
    okButton.style.backgroundColor = '#4a4a4a';
    okButton.style.color = '#fff';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '4px';
    okButton.style.cursor = 'pointer';
    okButton.onclick = () => this.handleOkClick();
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#3a3a3a';
    cancelButton.style.color = '#ddd';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.onclick = () => this.handleCancelClick();
    
    footer.appendChild(cancelButton);
    footer.appendChild(okButton);
    this.element.appendChild(footer);
    
    // Add the dialog to the document body
    document.body.appendChild(this.element);
  }

  /**
   * Handle OK button click
   */
  handleOkClick() {
    // Just hide the dialog without saving layout
    this.hide();
  }
  
  /**
   * Handle Cancel button click
   */
  handleCancelClick() {
    this.hide();
  }
  
  /**
   * Show the preferences dialog
   */
  show() {
    this.element.style.display = 'block';
  }
  
  /**
   * Hide the preferences dialog
   */
  hide() {
    this.element.style.display = 'none';
  }
  
  handleShowProjectDialog() {
    this.show();
    return true;
  }
  
  handleHideProjectDialog() {
    this.hide();
    return true;
  }  
}

export default Project;

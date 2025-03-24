// ProjectSideWindow.js - Project file tree side window implementation
import SideWindow from './SideWindow.js';
import { MESSAGES } from '../../../utils/BaseComponent.js';

class ProjectSideWindow extends SideWindow {
  constructor(parentId, containerId, initialHeight = 300) {
    super('Project', 'Project Files', parentId, containerId, initialHeight);
    this.projectTree = [];
    this.messageMap[MESSAGES.CONTENT_HEIGHT_CHANGED] = this.handleContentHeightChanged;
  }
  
  /**
   * Initialize the component
   * 
   * @param {Object} options - Optional configuration options
   */
  async init(options) {
    super.init(options);
  }
  
  /**
   * Destroy the component
   */
  async destroy() {
    this.parentContainer.removeChild(this.treeElement);
    this.treeElement = null;
    super.destroy();
  }

  /**
   * Override render to set up content and event listeners
   * @returns {HTMLElement} - The rendered window element
   */
  async render(containerId) {
    await super.render(containerId);
   
    // Create project tree container
    this.treeElement = document.createElement('div');
    this.treeElement.id = 'project-tree';
    this.treeElement.className = 'project-tree';  
    this.content.appendChild(this.treeElement);
  
    // Add some basic styling
    this.addStyles();
    
    // Populate with initial data
    this.populateProjectTree();
    
    return this.container;
  }
  
  /**
   * Handle content height changes
   * @param {number} height - New content height
   */
  handleContentHeightChanged(height) {
    if (this.projectTree) {
      this.projectTree.style.height = `${height}px`;
      this.projectTree.style.maxHeight = `${height}px`;
    }
  }
  
  /**
   * Add styles for the project tree
   */
  addStyles() {
    // Add styles if not already present
    if (!document.getElementById('project-side-window-styles')) {
      const style = document.createElement('style');
      style.id = 'project-side-window-styles';
      style.textContent = `
        .project-tree {
          overflow-y: auto;
          padding: 5px;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        
        .project-item {
          padding: 3px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .project-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .project-item-icon {
          margin-right: 5px;
          width: 16px;
          text-align: center;
        }
        
        .project-folder {
          font-weight: bold;
        }
        
        .project-folder-contents {
          padding-left: 20px;
        }
        
        .project-folder-collapsed .project-folder-contents {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Populate the project tree with data
   */
  populateProjectTree() {
    if (!this.treeElement) return;
    
    // Clear existing content
    this.treeElement.innerHTML = '';
    
    // Sample project structure - in a real app, this would come from the server
    if (this.projectTree.length === 0) {
      this.projectTree = [
        { name: 'src', type: 'folder', children: [
          { name: 'main.js', type: 'file' },
          { name: 'style.css', type: 'file' },
          { name: 'components', type: 'folder', children: [
            { name: 'Editor.js', type: 'file' },
            { name: 'MenuBar.js', type: 'file' },
            { name: 'StatusBar.js', type: 'file' },
            { name: 'IconBar.js', type: 'file' },
            { name: 'SideBar.js', type: 'file' }
          ]}
        ]},
        { name: 'index.html', type: 'file' },
        { name: 'package.json', type: 'file' }
      ];
    }
    
    // Render the project tree
    this.projectTree.forEach(item => {
      this.treeElement.appendChild(this.createProjectItem(item));
    });
  }
  
  /**
   * Create a project item element
   * @param {Object} item - The project item data
   * @returns {HTMLElement} - The created element
   */
  createProjectItem(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'project-item';
    
    const iconElement = document.createElement('span');
    iconElement.className = 'project-item-icon';
    
    const nameElement = document.createElement('span');
    nameElement.className = 'project-item-name';
    nameElement.textContent = item.name;
    
    if (item.type === 'folder') {
      itemElement.classList.add('project-folder');
      itemElement.classList.add('project-folder-collapsed');
      iconElement.textContent = '▶';
      
      // Create folder contents
      const contentsElement = document.createElement('div');
      contentsElement.className = 'project-folder-contents';
      
      // Add children
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          contentsElement.appendChild(this.createProjectItem(child));
        });
      }
      
      // Add click handler to toggle folder
      itemElement.addEventListener('click', (e) => {
        if (e.target === itemElement || e.target === iconElement || e.target === nameElement) {
          itemElement.classList.toggle('project-folder-collapsed');
          iconElement.textContent = itemElement.classList.contains('project-folder-collapsed') ? '▶' : '▼';
          e.stopPropagation();
        }
      });
      
      // Add elements to item
      itemElement.appendChild(iconElement);
      itemElement.appendChild(nameElement);
      itemElement.appendChild(contentsElement);
    } else {
      iconElement.textContent = '📄';
      
      // Add click handler for file
      itemElement.addEventListener('click', () => {
        this.sendMessage('PROJECT_FILE_SELECTED', { 
          fileName: item.name,
          filePath: this.getFilePath(item, itemElement)
        });
      });
      
      // Add elements to item
      itemElement.appendChild(iconElement);
      itemElement.appendChild(nameElement);
    }
    
    return itemElement;
  }
  
  /**
   * Update the project tree with new data
   * @param {Array} tree - The new project tree data
   */
  update(tree) {
    if (Array.isArray(tree)) {
      this.projectTree = tree;
      this.populateProjectTree();
    }
  }
}

export default ProjectSideWindow;

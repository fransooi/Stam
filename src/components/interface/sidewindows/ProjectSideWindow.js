// ProjectSideWindow.js - Project file tree side window implementation
import SideWindow from './SideWindow.js';

class ProjectSideWindow extends SideWindow {
  constructor(initialHeight = 300) {
    super('project', 'Project Files', initialHeight);
    this.projectTree = [];
  }
  
  /**
   * Override render to set up content and event listeners
   * @param {HTMLElement} parentContainer - The parent container
   * @returns {HTMLElement} - The rendered window element
   */
  render(parentContainer) {
    // Call parent render method
    const container = super.render(parentContainer);
    
    // Create the project UI
    this.createProjectUI();
    
    // Add event listener for content height changes
    this.content.addEventListener('contentHeightChanged', (event) => {
      this.handleContentHeightChanged(event.detail.height);
    });
    
    // Initial content height update
    this.updateContentHeight();
    
    return container;
  }
  
  /**
   * Handle content height changes
   * @param {number} height - New content height
   */
  handleContentHeightChanged(height) {
    // Update the project tree container height
    const treeElement = this.content.querySelector('#project-tree');
    if (treeElement) {
      treeElement.style.height = `${height}px`;
      treeElement.style.maxHeight = `${height}px`;
    }
  }
  
  /**
   * Create the project UI
   */
  createProjectUI() {
    // Clear existing content
    this.content.innerHTML = '';
    
    // Create project tree container
    const projectTree = document.createElement('div');
    projectTree.id = 'project-tree';
    projectTree.className = 'project-tree';
    
    this.content.appendChild(projectTree);
    
    // Add some basic styling
    this.addStyles();
    
    // Populate with initial data
    this.populateProjectTree();
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
    const treeElement = this.content.querySelector('#project-tree');
    if (!treeElement) return;
    
    // Clear existing content
    treeElement.innerHTML = '';
    
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
      treeElement.appendChild(this.createProjectItem(item));
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
   * Handle file click event
   * @param {Object} file - The file object that was clicked
   */
  handleFileClick(file) {
    console.log(`File clicked: ${file.name}`);
    // In the future, this would open the file in the editor
    
    // Dispatch a custom event that can be listened to by other components
    const event = new CustomEvent('fileSelected', {
      detail: { file }
    });
    document.dispatchEvent(event);
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

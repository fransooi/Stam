// ProjectSideWindow.js - Project file tree side window implementation
import SideWindow from './SideWindow.js';

class ProjectSideWindow extends SideWindow {
  constructor(initialHeight = 300) {
    super('project', 'Project Files', initialHeight);
    this.projectTree = [];
  }
  
  /**
   * Initialize the content of the project window
   */
  initContent() {
    // Create project tree container
    const projectTree = document.createElement('div');
    projectTree.id = 'project-tree';
    projectTree.className = 'project-tree';
    
    this.content.appendChild(projectTree);
    
    // Populate with initial data
    this.populateProjectTree();
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
    
    // Create the tree view
    const createTreeItem = (item, parent) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'tree-item';
      
      const itemContent = document.createElement('div');
      itemContent.className = 'tree-item-content';
      itemContent.textContent = item.name;
      
      if (item.type === 'folder') {
        itemContent.classList.add('folder');
        itemContent.addEventListener('click', () => {
          itemElement.classList.toggle('expanded');
        });
        
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children';
        
        if (item.children) {
          item.children.forEach(child => {
            createTreeItem(child, childrenContainer);
          });
        }
        
        itemElement.appendChild(itemContent);
        itemElement.appendChild(childrenContainer);
      } else {
        itemContent.classList.add('file');
        itemContent.addEventListener('click', () => {
          this.handleFileClick(item);
        });
        
        itemElement.appendChild(itemContent);
      }
      
      parent.appendChild(itemElement);
    };
    
    this.projectTree.forEach(item => {
      createTreeItem(item, treeElement);
    });
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

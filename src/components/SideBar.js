// SideBar.js - Component for the left sidebar with project and output windows

class SideBar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.projectTree = [];
    this.outputContent = '';
    this.isDragging = false;
    
    // Add event listeners for resize functionality
    this.setupGlobalEvents();
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create project section
    const projectSection = document.createElement('div');
    projectSection.className = 'info-section project-section';
    
    const projectHeader = document.createElement('div');
    projectHeader.className = 'section-header';
    projectHeader.textContent = 'Project Files';
    
    const projectTree = document.createElement('div');
    projectTree.id = 'project-tree';
    this.populateProjectTree(projectTree);
    
    projectSection.appendChild(projectHeader);
    projectSection.appendChild(projectTree);
    
    // Create resize separator
    const resizeSeparator = document.createElement('div');
    resizeSeparator.className = 'resize-separator';
    resizeSeparator.id = 'output-separator';
    
    // Create output section
    const outputSection = document.createElement('div');
    outputSection.className = 'info-section output-section';
    
    const outputHeader = document.createElement('div');
    outputHeader.className = 'section-header';
    outputHeader.textContent = 'Output';
    
    const outputWindow = document.createElement('div');
    outputWindow.id = 'output-window';
    outputWindow.innerHTML = this.outputContent;
    
    outputSection.appendChild(outputHeader);
    outputSection.appendChild(outputWindow);
    
    // Append all sections to the container
    this.container.appendChild(projectSection);
    this.container.appendChild(resizeSeparator);
    this.container.appendChild(outputSection);
    
    // Set up the resize functionality
    this.setupResizeSeparator(resizeSeparator, outputSection, projectSection);
  }
  
  setupGlobalEvents() {
    // Add global event listeners for mouse move and mouse up
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const outputSection = this.container.querySelector('.output-section');
    const projectSection = this.container.querySelector('.project-section');
    const separator = this.container.querySelector('.resize-separator');
    
    if (!outputSection || !projectSection || !separator) return;
    
    // Calculate the new height for the output section
    const deltaY = e.clientY - this.startY;
    const newOutputHeight = Math.max(80, Math.min(this.startHeight - deltaY, window.innerHeight * 0.6));
    
    // Update the heights
    outputSection.style.height = `${newOutputHeight}px`;
    
    // Ensure the project section takes the remaining space
    const infoAreaHeight = this.container.offsetHeight;
    const separatorHeight = separator.offsetHeight;
    
    projectSection.style.height = `${infoAreaHeight - newOutputHeight - separatorHeight}px`;
  }
  
  handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      const separator = this.container.querySelector('.resize-separator');
      if (separator) {
        separator.classList.remove('active');
      }
      document.body.style.userSelect = '';
    }
  }
  
  populateProjectTree(treeElement) {
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
            { name: 'SideBar.js', type: 'file' },
            { name: 'interface', type: 'folder', children: [
              { name: 'MenuBar.js', type: 'file' },
              { name: 'StatusBar.js', type: 'file' },
              { name: 'SideBar.js', type: 'file' }
            ]},
            { name: 'modern', type: 'folder', children: [
              { name: 'editor.js', type: 'file' },
              { name: 'icons.js', type: 'file' }
            ]},
            { name: 'stos', type: 'folder', children: [
              { name: 'editor.js', type: 'file' },
              { name: 'icons.js', type: 'file' }
            ]},
            { name: 'amos1_3', type: 'folder', children: [
              { name: 'editor.js', type: 'file' },
              { name: 'icons.js', type: 'file' }
            ]},
            { name: 'amosPro', type: 'folder', children: [
              { name: 'editor.js', type: 'file' },
              { name: 'icons.js', type: 'file' }
            ]},
            { name: 'c64', type: 'folder', children: [
              { name: 'editor.js', type: 'file' },
              { name: 'icons.js', type: 'file' }
            ]}
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
  
  handleFileClick(file) {
    console.log(`File clicked: ${file.name}`);
    // In the future, this would open the file in the editor
  }
  
  setupResizeSeparator(separator, outputSection, projectSection) {
    separator.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startY = e.clientY;
      this.startHeight = outputSection.offsetHeight;
      this.startProjectHeight = projectSection.offsetHeight;
      
      separator.classList.add('active');
      
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    });
  }
  
  appendToOutput(content) {
    this.outputContent += content;
    const outputWindow = document.getElementById('output-window');
    if (outputWindow) {
      outputWindow.innerHTML = this.outputContent;
      outputWindow.scrollTop = outputWindow.scrollHeight;
    }
  }
  
  clearOutput() {
    this.outputContent = '';
    const outputWindow = document.getElementById('output-window');
    if (outputWindow) {
      outputWindow.innerHTML = '';
    }
  }
  
  setProjectTree(tree) {
    this.projectTree = tree;
    const projectTree = document.getElementById('project-tree');
    if (projectTree) {
      projectTree.innerHTML = '';
      this.populateProjectTree(projectTree);
    }
  }
}

export default SideBar;

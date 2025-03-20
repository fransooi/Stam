// AMOS Pro Icon Bar component
import BaseComponent from '../../utils/BaseComponent.js';

class AMOSProIcons extends BaseComponent {
  constructor(parentId,containerId) {
    super('AMOSProIcons', parentId, containerId);
    this.buttonStates = {}; // Track button states (up/down)
    
    // Define original button widths (approximate pixel widths from original images)
    this.buttonWidths = {
      row1: [
        { x: 1, width: 64, height: 48 },   // button-1-1
        { x: 2, width: 320, height: 48 },  // button-2-1 (wider than others)
        { x: 3, width: 64, height: 48 },   // button-3-1
        { x: 4, width: 64, height: 48 },   // button-4-1
        { x: 5, width: 64, height: 48 },   // button-5-1
        { x: 6, width: 64, height: 48 },   // button-6-1
        { x: 7, width: 64, height: 48 },   // button-7-1
        { x: 8, width: 64, height: 48 },   // button-8-1
        { x: 9, width: 64, height: 48 },   // button-9-1 (now 9-1)
        { x: 10, width: 64, height: 48 },  // button-10-1 (now 10-1)
        { x: 11, width: 64, height: 48 },  // button-11-1 (now 11-1)
        { x: 12, width: 64, height: 48 },  // button-12-1 (now 12-1)
        { x: 13, width: 192, height: 48 }, // button-13-1 (now 13-1)
        { x: 14, width: 64, height: 48 },  // button-14-1
      ],
      row2: [
        { x: 1, width: 48, height: 32 },   // button-1-2
        { x: 2, width: 1136, height: 32 }, // button-2-2
        { x: 3, width: 48, height: 32 },   // button-3-2
        { x: 4, width: 48, height: 32 }    // button-4-2
      ]
    };
    
    // Calculate total width of all buttons in row 1
    this.totalRow1Width = this.buttonWidths.row1.reduce((sum, button) => sum + button.width, 0);
    // Calculate total width of all buttons in row 2
    this.totalRow2Width = this.buttonWidths.row2.reduce((sum, button) => sum + button.width, 0);
    
    // Initialize the icon bar
    this.render();
    
    // Create a ResizeObserver to monitor container size changes
    this.resizeObserver = new ResizeObserver(entries => {
      this.handleResize();
    });
    
    // Start observing the container
    this.resizeObserver.observe(this.container);
    
    // Initial resize to set correct dimensions
    this.handleResize();
  }
  
  render() {
    // Clear the container first to prevent duplicates
    this.container.innerHTML = '';
    
    // Create the main icon bar container
    this.iconBar = document.createElement('div');
    this.iconBar.className = 'amospro-icon-bar';
    this.container.appendChild(this.iconBar);
    
    // Create top row (row 1)
    const topRow = document.createElement('div');
    topRow.className = 'amospro-button-row';
    
    // Add buttons for top row (1-1 to 14-1)
    for (let i = 1; i <= 14; i++) { 
      this.addButton(i, 1, topRow);
    }
    
    this.iconBar.appendChild(topRow);
    
    // Create bottom row (row 2)
    const bottomRow = document.createElement('div');
    bottomRow.className = 'amospro-button-row';
    
    // Add buttons for bottom row (1-2 to 4-2)
    for (let i = 1; i <= 4; i++) {
      this.addButton(i, 2, bottomRow);
    }
    
    this.iconBar.appendChild(bottomRow);
  }
  
  handleResize() {
    // Get the container width
    const containerWidth = this.container.clientWidth;
    
    // Get all button rows
    const rows = document.querySelectorAll('.amospro-button-row');
    if (!rows || rows.length < 2) return;
    
    // Set fixed heights for rows
    const row1Height = 48;
    const row2Height = 32;
    
    // First, set all buttons to their original proportional sizes
    // but with fixed heights
    
    // Handle top row (row 1)
    const topRowButtons = Array.from(rows[0].querySelectorAll('.amospro-button'));
    
    // First, set all non-adaptive buttons to their fixed size
    let totalFixedWidth1 = 0;
    
    topRowButtons.forEach((button, index) => {
      const buttonNumber = index + 1;
      
      // Skip the adaptive button (button-2-1)
      if (buttonNumber === 2) return;
      
      // Set fixed width and height for this button
      const buttonInfo = this.buttonWidths.row1.find(b => b.x === buttonNumber);
      if (buttonInfo) {
        const width = buttonInfo.width;
        button.style.width = `${width}px`;
        button.style.height = `${row1Height}px`;
        totalFixedWidth1 += width;
      }
    });
    
    // Now handle the adaptive button (button-2-1)
    const adaptiveButton1 = topRowButtons[1]; // Index 1 is button-2-1
    if (adaptiveButton1) {
      // Calculate remaining width
      const remainingWidth = Math.max(containerWidth - totalFixedWidth1, 64);
      adaptiveButton1.style.width = `${remainingWidth}px`;
      adaptiveButton1.style.height = `${row1Height}px`;
    }
    
    // Handle bottom row (row 2)
    const bottomRowButtons = Array.from(rows[1].querySelectorAll('.amospro-button'));
    
    // First, set all non-adaptive buttons to their fixed size
    let totalFixedWidth2 = 0;
    
    bottomRowButtons.forEach((button, index) => {
      const buttonNumber = index + 1;
      
      // Skip the adaptive button (button-2-2)
      if (buttonNumber === 2) return;
      
      // Set fixed width and height for this button
      const buttonInfo = this.buttonWidths.row2.find(b => b.x === buttonNumber);
      if (buttonInfo) {
        const width = buttonInfo.width;
        button.style.width = `${width}px`;
        button.style.height = `${row2Height}px`;
        totalFixedWidth2 += width;
      }
    });
    
    // Now handle the adaptive button (button-2-2)
    const adaptiveButton2 = bottomRowButtons[1]; // Index 1 is button-2-2
    if (adaptiveButton2) {
      // Calculate remaining width
      const remainingWidth = Math.max(containerWidth - totalFixedWidth2, 64);
      adaptiveButton2.style.width = `${remainingWidth}px`;
      adaptiveButton2.style.height = `${row2Height}px`;
    }
    
    // If the total width is too large, scale everything down proportionally
    const totalWidth1 = totalFixedWidth1 + (adaptiveButton1 ? parseInt(adaptiveButton1.style.width) : 0);
    const totalWidth2 = totalFixedWidth2 + (adaptiveButton2 ? parseInt(adaptiveButton2.style.width) : 0);
    
    if (totalWidth1 > containerWidth || totalWidth2 > containerWidth) {
      const scaleFactor1 = containerWidth / totalWidth1;
      const scaleFactor2 = containerWidth / totalWidth2;
      
      // Scale top row
      topRowButtons.forEach(button => {
        const currentWidth = parseInt(button.style.width);
        button.style.width = `${currentWidth * scaleFactor1}px`;
      });
      
      // Scale bottom row
      bottomRowButtons.forEach(button => {
        const currentWidth = parseInt(button.style.width);
        button.style.width = `${currentWidth * scaleFactor2}px`;
      });
    }
    
    // Set rows to flex-start to ensure buttons are aligned to the left
    rows[0].style.justifyContent = 'flex-start';
    rows[1].style.justifyContent = 'flex-start';
  }

  handleFunctionKeyClick(key, action) {
    console.log(`AMOS Function Key clicked: ${key} - ${action}`);
  }
  
  addButton(x, y, container) {
    const buttonId = `button-${x}-${y}`;
    
    // Create button element
    const button = document.createElement('img');
    button.className = 'amospro-button';
    button.dataset.x = x;
    button.dataset.y = y;
    button.dataset.id = buttonId;
    
    // Set initial state to 'up'
    this.buttonStates[buttonId] = 'up';
    button.src = `/amosPro/${buttonId}-up.png`;
    
    // Add mousedown event to show button pressed
    button.addEventListener('mousedown', () => {
      button.src = `/amosPro/${buttonId}-down.png`;
      this.buttonStates[buttonId] = 'down';
      this.handleClick(buttonId)
    });
    
    // Add mouseup event to release button
    button.addEventListener('mouseup', () => {
      button.src = `/amosPro/${buttonId}-up.png`;
      this.buttonStates[buttonId] = 'up';
      
    });
    
    // Add mouseout event to reset button if mouse leaves while pressed
    button.addEventListener('mouseout', () => {
      if (this.buttonStates[buttonId] === 'down') {
        button.src = `/amosPro/${buttonId}-up.png`;
        this.buttonStates[buttonId] = 'up';
      }
    });

    button.addEventListener('click', () => this.handleFunctionKeyClick(buttonId, 'click'));
    
    // Add to container
    container.appendChild(button);
  }
}

export default AMOSProIcons;

// STOS Basic Icon Bar component - Inspired by the original STOS Basic from 1987

class STOSIcons {
  constructor(container, onActionCallback) {
    this.container = container;
    this.onActionCallback = onActionCallback;
    this.shiftPressed = false;
    
    // Define function keys for both states
    this.functionKeys = {
      normal: [
        { key: 'F1', action: 'Last Key' },
        { key: 'F2', action: 'List' },
        { key: 'F3', action: 'Listbank' },
        { key: 'F4', action: 'Load' },
        { key: 'F5', action: 'Save' },
        { key: 'F6', action: 'Run' },
        { key: 'F7', action: 'Dir' },
        { key: 'F8', action: 'Dir$=Dir$+"\\\"' },
        { key: 'F9', action: 'Previous' },
        { key: 'F10', action: 'Help' }
      ],
      shift: [
        { key: 'F10', action: 'Off' },
        { key: 'F11', action: 'Full' },
        { key: 'F12', action: 'Multi2' },
        { key: 'F13', action: 'Multi3' },
        { key: 'F14', action: 'Multi4' },
        { key: 'F15', action: 'Mode 0' },
        { key: 'F16', action: 'Mode 1' },
        { key: 'F17', action: 'Default' },
        { key: 'F18', action: 'Env' },
        { key: 'F19', action: 'Key List' }
      ]
    };
    
    // Add event listeners for shift key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  handleKeyDown(event) {
    if (event.key === 'Shift' && !this.shiftPressed) {
      this.shiftPressed = true;
      this.render();
    }
  }
  
  handleKeyUp(event) {
    if (event.key === 'Shift' && this.shiftPressed) {
      this.shiftPressed = false;
      this.render();
    }
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create main container for STOS function keys
    const stosIconsContainer = document.createElement('div');
    stosIconsContainer.className = 'stos-icons-container';
    
    // Create first row of function keys (F1-F5 or F10-F14)
    const firstRow = document.createElement('div');
    firstRow.className = 'stos-function-row';
    
    // Create second row of function keys (F6-F10 or F15-F19)
    const secondRow = document.createElement('div');
    secondRow.className = 'stos-function-row';
    
    // Get the current set of keys based on shift state
    const currentKeys = this.shiftPressed ? this.functionKeys.shift : this.functionKeys.normal;
    
    // Add first row (first 5 keys)
    for (let i = 0; i < 5; i++) {
      this.addFunctionKey(currentKeys[i].key, currentKeys[i].action, firstRow);
    }
    
    // Add second row (next 5 keys)
    for (let i = 5; i < 10; i++) {
      this.addFunctionKey(currentKeys[i].key, currentKeys[i].action, secondRow);
    }
    
    // Add rows to container
    stosIconsContainer.appendChild(firstRow);
    stosIconsContainer.appendChild(secondRow);
    
    // Add container to main container
    this.container.appendChild(stosIconsContainer);
  }
  
  addFunctionKey(key, action, parent) {
    const button = document.createElement('button');
    button.className = 'stos-function-key';
    button.dataset.key = key;
    button.dataset.action = action;
    
    // Create a single text element with the format "Fxx: action"
    const textContent = document.createElement('span');
    textContent.className = 'stos-key-text';
    textContent.textContent = `${key}: ${action}`;
    button.appendChild(textContent);
    
    // Add click event
    button.addEventListener('click', () => this.handleFunctionKeyClick(key, action));
    
    parent.appendChild(button);
  }
  
  handleFunctionKeyClick(key, action) {
    console.log(`STOS Function Key clicked: ${key} - ${action}`);
    
    // Handle specific function key actions based on the key
    switch (key) {
      case 'F1':
        this.handleLastKeyPressed();
        break;
      case 'F2':
        this.handleList();
        break;
      case 'F3':
        this.handleListbank();
        break;
      case 'F4':
        this.handleLoad();
        break;
      case 'F5':
        this.handleSave();
        break;
      case 'F6':
        this.handleRun();
        break;
      case 'F7':
        this.handleDir();
        break;
      case 'F8':
        this.handleDirAppend();
        break;
      case 'F9':
        this.handlePrevious();
        break;
      case 'F10':
        this.shiftPressed ? this.handleOff() : this.handleHelp();
        break;
      case 'F11':
        this.handleFull();
        break;
      case 'F12':
        this.handleMulti2();
        break;
      case 'F13':
        this.handleMulti3();
        break;
      case 'F14':
        this.handleMulti4();
        break;
      case 'F15':
        this.handleMode0();
        break;
      case 'F16':
        this.handleMode1();
        break;
      case 'F17':
        this.handleDefault();
        break;
      case 'F18':
        this.handleEnv();
        break;
      case 'F19':
        this.handleKeyList();
        break;
      default:
        console.log(`Action not implemented for key: ${key}`);
    }
    
    // Call the callback if provided
    if (this.onActionCallback) {
      this.onActionCallback(`${key}:${action}`);
    }
  }
  
  // Handler methods for each function key
  handleLastKeyPressed() {
    console.log('F1: Display last function key pressed');
  }
  
  handleList() {
    console.log('F2: List command');
  }
  
  handleListbank() {
    console.log('F3: Listbank command');
  }
  
  handleLoad() {
    console.log('F4: Load command');
  }
  
  handleSave() {
    console.log('F5: Save command');
  }
  
  handleRun() {
    console.log('F6: Run command');
  }
  
  handleDir() {
    console.log('F7: Dir command');
  }
  
  handleDirAppend() {
    console.log('F8: Dir$=Dir$+"\\" command');
  }
  
  handlePrevious() {
    console.log('F9: Previous command');
  }
  
  handleHelp() {
    console.log('F10: Help command');
  }
  
  handleOff() {
    console.log('F10 (Shift): Off command');
  }
  
  handleFull() {
    console.log('F11: Full command');
  }
  
  handleMulti2() {
    console.log('F12: Multi2 command');
  }
  
  handleMulti3() {
    console.log('F13: Multi3 command');
  }
  
  handleMulti4() {
    console.log('F14: Multi4 command');
  }
  
  handleMode0() {
    console.log('F15: Mode 0 command');
  }
  
  handleMode1() {
    console.log('F16: Mode 1 command');
  }
  
  handleDefault() {
    console.log('F17: Default command');
  }
  
  handleEnv() {
    console.log('F18: Env command');
  }
  
  handleKeyList() {
    console.log('F19: Key List command');
  }
}

export default STOSIcons;

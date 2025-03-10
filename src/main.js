import './style.css'
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

// Initialize the editor with default settings
let editorView = null;

// DOM Elements
const modeSelector = document.getElementById('mode-selector');
const editorArea = document.getElementById('editor-area');
const outputSeparator = document.getElementById('output-separator');
const outputSection = document.querySelector('.output-section');
const projectSection = document.querySelector('.project-section');

// Initialize the editor based on the selected mode
let currentEditor = null;

// Initialize the application
function initApp() {
  setupEventListeners();
  setupEditor('modern');
  populateProjectTree();
  setupResizeSeparator();
}

// Set up event listeners for UI elements
function setupEventListeners() {
  // Mode selector
  modeSelector.addEventListener('change', (e) => {
    setupEditor(e.target.value);
  });

  // Menu items
  const menuItems = document.querySelectorAll('#menu-bar > div > div');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const menuAction = e.target.textContent;
      handleMenuAction(menuAction);
    });
  });

  // Icon area buttons
  const buttons = document.querySelectorAll('#icon-area button');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      const action = e.target.textContent;
      handleIconAction(action);
    });
  });
}

// Set up the code editor based on the selected mode
function setupEditor(mode) {
  const iconArea = document.getElementById('icon-area');
  
  // Clear previous editor if exists
  if (editorView) {
    editorView.destroy();
    editorArea.innerHTML = '';
  }
  
  // Update UI based on mode
  updateUIForMode(mode, iconArea);
  
  // Create appropriate editor based on mode
  switch (mode) {
    case 'stos':
      createSTOSEditor(editorArea);
      break;
    case 'cb64':
      createCommodore64Emulator(editorArea);
      break;
    case 'modern':
    default:
      createModernEditor(editorArea);
      break;
  }
  
  // Update status line
  updateStatusLine(`Mode: ${mode}`);
}

// Create a modern code editor using CodeMirror
function createModernEditor(container) {
  const startState = EditorState.create({
    doc: '// Welcome to PCOS Modern Editor\n\nfunction helloWorld() {\n  console.log("Hello, world!");\n  return "Hello, world!";\n}\n\nhelloWorld();',
    extensions: [
      basicSetup,
      keymap.of(defaultKeymap),
      javascript(),
      oneDark,
      EditorView.lineWrapping,
      EditorState.allowMultipleSelections.of(true)
    ]
  });

  editorView = new EditorView({
    state: startState,
    parent: container
  });
}

// Create a STOS Basic themed editor
function createSTOSEditor(container) {
  // Create a styled container for STOS Basic
  container.innerHTML = `
    <div class="stos-editor">
      <div class="stos-header">STOS Basic Editor</div>
      <div id="stos-editor-container" class="stos-content"></div>
    </div>
  `;
  
  // Custom theme for STOS Basic
  const stosTheme = EditorView.theme({
    "&": {
      backgroundColor: "#0000AA",
      color: "#FFFFFF",
      fontFamily: "'Courier New', monospace",
      fontSize: "16px",
      height: "100%"
    },
    ".cm-content": {
      caretColor: "#FFFFFF"
    },
    ".cm-cursor": {
      borderLeftColor: "#FFFFFF",
      borderLeftWidth: "2px"
    },
    ".cm-line": {
      paddingLeft: "2em"
    },
    ".cm-gutters": {
      backgroundColor: "#0000AA",
      color: "#FFFF00",
      border: "none"
    },
    ".cm-gutter.cm-lineNumbers .cm-gutterElement": {
      paddingLeft: "8px",
      paddingRight: "8px"
    }
  });
  
  const startState = EditorState.create({
    doc: '10 REM STOS Basic Program\n20 PRINT "Hello from STOS Basic!"\n30 FOR I=1 TO 10\n40 PRINT "Loop: ";I\n50 NEXT I\n60 END',
    extensions: [
      basicSetup,
      keymap.of(defaultKeymap),
      EditorView.lineWrapping,
      stosTheme
    ]
  });

  editorView = new EditorView({
    state: startState,
    parent: document.getElementById('stos-editor-container')
  });
}

// Create a Commodore 64 emulator iframe
function createCommodore64Emulator(container) {
  // For now, we'll just create a placeholder
  // In a real implementation, this would embed a C64 emulator
  container.innerHTML = `
    <div class="c64-emulator">
      <div class="c64-header">Commodore 64 Emulator</div>
      <div class="c64-screen">
        <pre class="c64-content">
**** COMMODORE 64 BASIC V2 ****
64K RAM SYSTEM  38911 BASIC BYTES FREE

READY.
_
        </pre>
      </div>
    </div>
  `;
  
  // In a real implementation, we would initialize the emulator here
  // For example: initC64Emulator(container);
}

// Update UI elements based on the selected mode
function updateUIForMode(mode, iconArea) {
  // Clear existing buttons
  while (iconArea.firstChild) {
    iconArea.removeChild(iconArea.firstChild);
  }
  
  // Add mode-specific buttons
  switch (mode) {
    case 'stos':
      addButton(iconArea, 'Run', 'bg-blue-500');
      addButton(iconArea, 'Stop', 'bg-red-500');
      addButton(iconArea, 'Direct Mode', 'bg-purple-500');
      addButton(iconArea, 'Load', 'bg-green-500');
      addButton(iconArea, 'Save', 'bg-green-500');
      break;
    case 'cb64':
      addButton(iconArea, 'Start', 'bg-blue-500');
      addButton(iconArea, 'Reset', 'bg-yellow-500');
      addButton(iconArea, 'Load', 'bg-green-500');
      break;
    case 'modern':
    default:
      addButton(iconArea, 'Run', 'bg-blue-500');
      addButton(iconArea, 'Debug', 'bg-gray-500');
      addButton(iconArea, 'Stop', 'bg-gray-500');
      break;
  }
  
  // Add mode selector back
  const modeSelector = document.createElement('select');
  modeSelector.id = 'mode-selector';
  modeSelector.className = 'text-sm p-1 rounded border border-gray-300 ml-2';
  
  const modes = [
    { value: 'modern', text: 'Modern Mode' },
    { value: 'stos', text: 'STOS Basic' },
    { value: 'cb64', text: 'Commodore 64' }
  ];
  
  modes.forEach(modeOption => {
    const option = document.createElement('option');
    option.value = modeOption.value;
    option.textContent = modeOption.text;
    if (modeOption.value === mode) {
      option.selected = true;
    }
    modeSelector.appendChild(option);
  });
  
  modeSelector.addEventListener('change', (e) => {
    setupEditor(e.target.value);
  });
  
  iconArea.appendChild(modeSelector);
}

// Helper function to add a button to the icon area
function addButton(container, text, bgClass) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = `p-1 ${bgClass} text-white rounded hover:opacity-90 mr-2`;
  button.addEventListener('click', () => handleIconAction(text));
  container.appendChild(button);
}

// Handle menu actions
function handleMenuAction(action) {
  console.log(`Menu action: ${action}`);
  updateStatusLine(`Menu: ${action}`);
  
  // Implement menu actions here
  switch (action) {
    case 'File':
      // Show file menu
      break;
    case 'Edit':
      // Show edit menu
      break;
    // Add other menu handlers
  }
}

// Handle icon actions
function handleIconAction(action) {
  console.log(`Icon action: ${action}`);
  updateStatusLine(`Action: ${action}`);
  
  // Implement icon actions here
  switch (action) {
    case 'Run':
      runCode();
      break;
    case 'Debug':
      debugCode();
      break;
    case 'Stop':
      stopExecution();
      break;
    // Add other action handlers
  }
}

// Dummy functions for actions
function runCode() {
  const outputWindow = document.getElementById('output-window');
  outputWindow.innerHTML += '<div class="text-green-600">Running code...</div>';
}

function debugCode() {
  const outputWindow = document.getElementById('output-window');
  outputWindow.innerHTML += '<div class="text-blue-600">Debugging code...</div>';
}

function stopExecution() {
  const outputWindow = document.getElementById('output-window');
  outputWindow.innerHTML += '<div class="text-red-600">Execution stopped.</div>';
}

// Update the status line text
function updateStatusLine(text) {
  const statusLine = document.getElementById('status-line');
  if (statusLine) {
    statusLine.textContent = text;
  }
}

// Populate project tree with sample data
function populateProjectTree() {
  const projectTree = document.getElementById('project-tree');
  projectTree.innerHTML = `
    <div class="pl-2">
      <div class="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded">
        <span class="text-blue-600">📁</span>
        <span class="ml-1">src</span>
      </div>
      <div class="pl-4">
        <div class="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded">
          <span class="text-yellow-600">📄</span>
          <span class="ml-1">main.js</span>
        </div>
        <div class="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded">
          <span class="text-purple-600">📄</span>
          <span class="ml-1">style.css</span>
        </div>
      </div>
      <div class="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded">
        <span class="text-orange-600">📄</span>
        <span class="ml-1">index.html</span>
      </div>
    </div>
  `;
}

// Setup resize functionality for the output separator
function setupResizeSeparator() {
  let startY, startHeight, startProjectHeight;
  let isDragging = false;

  outputSeparator.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startHeight = outputSection.offsetHeight;
    startProjectHeight = projectSection.offsetHeight;
    
    outputSeparator.classList.add('active');
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    // Calculate the new height for the output section
    const deltaY = e.clientY - startY;
    const newOutputHeight = Math.max(80, Math.min(startHeight - deltaY, window.innerHeight * 0.6));
    
    // Update the heights
    outputSection.style.height = `${newOutputHeight}px`;
    
    // Ensure the project section takes the remaining space
    const infoAreaHeight = document.getElementById('info-area').offsetHeight;
    const headerHeight = outputSection.querySelector('.section-header').offsetHeight;
    const separatorHeight = outputSeparator.offsetHeight;
    
    projectSection.style.height = `${infoAreaHeight - newOutputHeight - separatorHeight}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      outputSeparator.classList.remove('active');
      document.body.style.userSelect = '';
    }
  });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

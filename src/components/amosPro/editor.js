// AMOS Pro Editor component
import { EditorView } from '@codemirror/view'

class AMOSProEditor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  // Prepare the container with AMOS Pro-specific styling
  prepareContainer() {
    // Create a styled container for AMOS Pro
    this.container.innerHTML = `
      <div class="amospro-editor">
        <div class="amospro-header">AMOS Professional Version 2.00</div>
        <div id="amospro-editor-container" class="amospro-content"></div>
      </div>
    `;
    
    // Add custom styles for AMOS Pro
    const style = document.createElement('style');
    style.textContent = `
      .amospro-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        border: 2px solid #00AAAA;
      }
      .amospro-header {
        background-color: #006666;
        color: #FFFF00;
        padding: 4px 8px;
        font-weight: bold;
        text-align: center;
      }
      .amospro-content {
        flex-grow: 1;
        overflow: auto;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Return the parent element for the editor
  getEditorParent() {
    return document.getElementById('amospro-editor-container');
  }
  
  // Provide configuration for the main Editor component
  getConfig() {
    // Custom theme for AMOS Pro based on the image
    const amosProTheme = EditorView.theme({
      "&": {
        backgroundColor: "#008080", // Teal background
        color: "#FFFFFF", // White text
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
        backgroundColor: "#006666", // Darker teal for gutters
        color: "#FFFF00", // Yellow line numbers
        border: "none"
      },
      ".cm-gutter.cm-lineNumbers .cm-gutterElement": {
        paddingLeft: "8px",
        paddingRight: "8px"
      },
      ".cm-keyword": {
        color: "#FFFF00" // Yellow for keywords
      },
      ".cm-string": {
        color: "#FFFFFF" // White for strings
      },
      ".cm-number": {
        color: "#FFFFFF" // White for numbers
      },
      ".cm-comment": {
        color: "#00FF00" // Green for comments
      }
    });
    
    return {
      extensions: [amosProTheme],
      initialDoc: '10 REM AMOS Professional Program\n20 PRINT "Hello from AMOS Pro!"\n30 FOR I=1 TO 10\n40 PRINT "Loop: ";I\n50 NEXT I\n60 END'
    };
  }
  
  // Store the editor view instance
  setEditorView(editorView) {
    this.editorView = editorView;
  }
  
  // Mode-specific operations
  runProgram() {
    console.log('Running AMOS Pro program');
    // Implement AMOS Pro-specific run logic here
    alert('AMOS Pro program execution started');
  }
  
  debugProgram() {
    console.log('Debugging AMOS Pro program');
    // Implement AMOS Pro-specific debug logic here
    alert('AMOS Pro program debugging started');
  }
  
  showHelp() {
    console.log('Showing AMOS Pro help');
    // Implement AMOS Pro-specific help logic here
    alert('AMOS Pro Help:\n\nBasic commands:\nPRINT - Output text\nFOR/NEXT - Loop\nIF/THEN - Conditional\nGOTO - Jump to line\nGOSUB/RETURN - Subroutine\n\nAMOS Pro Extensions:\nAMOSPRO_TURBO - Speed up execution\nAMOSPRO_REQUEST - System requests\nAMOSPRO_MUSIC - Enhanced music commands');
  }
}

export default AMOSProEditor;

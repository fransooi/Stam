// AMOS 1.3 Editor component
import { EditorView } from '@codemirror/view'

class AMOS13Editor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  // Prepare the container with AMOS 1.3-specific styling
  prepareContainer() {
    // Create a styled container for AMOS 1.3
    this.container.innerHTML = `
      <div class="amos-editor">
        <div class="amos-header">AMOS 1.3 Editor</div>
        <div id="amos-editor-container" class="amos-content"></div>
      </div>
    `;
  }
  
  // Return the parent element for the editor
  getEditorParent() {
    return document.getElementById('amos-editor-container');
  }
  
  // Provide configuration for the main Editor component
  getConfig() {
    // Custom theme for AMOS 1.3 based on the image
    const amosTheme = EditorView.theme({
      "&": {
        backgroundColor: "#00008B", // Dark blue background
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
        backgroundColor: "#000000", // Black gutters
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
      extensions: [amosTheme],
      initialDoc: '10 REM AMOS 1.3 Program\n20 PRINT "Hello from AMOS 1.3!"\n30 FOR I=1 TO 10\n40 PRINT "Loop: ";I\n50 NEXT I\n60 END'
    };
  }
  
  // Store the editor view instance
  setEditorView(editorView) {
    this.editorView = editorView;
  }
  
  // Mode-specific operations
  runProgram() {
    console.log('Running AMOS 1.3 program');
    // Implement AMOS-specific run logic here
    alert('AMOS 1.3 program execution started');
  }
  
  debugProgram() {
    console.log('Debugging AMOS 1.3 program');
    // Implement AMOS-specific debug logic here
    alert('AMOS 1.3 program debugging started');
  }
  
  showHelp() {
    console.log('Showing AMOS 1.3 help');
    // Implement AMOS-specific help logic here
    alert('AMOS 1.3 Help:\n\nBasic commands:\nPRINT - Output text\nFOR/NEXT - Loop\nIF/THEN - Conditional\nGOTO - Jump to line\nGOSUB/RETURN - Subroutine');
  }
}

export default AMOS13Editor;

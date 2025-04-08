// STOS Basic Editor component
import { EditorView } from '@codemirror/view'

class STOSEditor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  // Prepare the container with STOS-specific styling
  prepareContainer() {
    // Create a styled container for STOS Basic without the header
    this.container.innerHTML = `
      <div class="stos-editor">
        <div id="stos-editor-container" class="stos-content"></div>
      </div>
    `;
  }
  
  // Return the parent element for the editor
  getEditorParent() {
    return document.getElementById('stos-editor-container');
  }
  
  // Provide configuration for the main Editor component
  getConfig() {
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
    
    return {
      extensions: [stosTheme],
      initialDoc: '10 REM STOS Basic Program\n20 PRINT "Hello from STOS Basic!"\n30 FOR I=1 TO 10\n40 PRINT "Loop: ";I\n50 NEXT I\n60 END',
      multi: false
    };
  }
  
  // Store the editor view instance
  setEditorView(editorView) {
    this.editorView = editorView;
  }
  
  // Mode-specific operations
  runProgram() {
    console.log('Running STOS Basic program');
    // Implement STOS-specific run logic here
    alert('STOS Basic program execution started');
  }
  
  debugProgram() {
    console.log('Debugging STOS Basic program');
    // Implement STOS-specific debug logic here
    alert('STOS Basic program debugging started');
  }
  
  showHelp() {
    console.log('Showing STOS Basic help');
    // Implement STOS-specific help logic here
    alert('STOS Basic Help:\n\nBasic commands:\nPRINT - Output text\nFOR/NEXT - Loop\nIF/THEN - Conditional\nGOTO - Jump to line\nGOSUB/RETURN - Subroutine');
  }
}

export default STOSEditor;

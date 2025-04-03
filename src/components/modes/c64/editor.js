// Commodore 64 Editor component
import { EditorView } from '@codemirror/view';

class C64Editor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  // Prepare the container with C64-specific styling
  prepareContainer() {
    // Create a styled container for C64 editor
    this.container.innerHTML = `
      <div class="c64-editor">
        <div id="c64-editor-container" class="c64-content"></div>
      </div>
    `;
  }
  
  // Return the parent element for the editor
  getEditorParent() {
    return document.getElementById('c64-editor-container');
  }

  // Provide configuration for the main Editor component
  getConfig() {
    // Custom theme for C64 based on the Commodore 64 color palette
    const c64Theme = EditorView.theme({
      "&": {
        backgroundColor: "#4040e0", // C64 blue background
        color: "#a0a0ff", // Light blue text
        fontFamily: "'C64 Pro Mono', 'C64 Pro', 'Courier New', monospace",
        fontSize: "16px",
        height: "100%"
      },
      ".cm-content": {
        caretColor: "#a0a0ff" // Light blue cursor
      },
      ".cm-cursor": {
        borderLeftColor: "#a0a0ff",
        borderLeftWidth: "2px"
      },
      ".cm-line": {
        paddingLeft: "2em"
      },
      ".cm-gutters": {
        backgroundColor: "#2020a0", // Darker blue for gutters
        color: "#8080ff", // Medium blue line numbers
        border: "none"
      },
      ".cm-gutter.cm-lineNumbers .cm-gutterElement": {
        paddingLeft: "8px",
        paddingRight: "8px"
      },
      ".cm-keyword": {
        color: "#ffffff" // White for keywords
      },
      ".cm-string": {
        color: "#ffff80" // Light yellow for strings
      },
      ".cm-number": {
        color: "#80ff80" // Light green for numbers
      },
      ".cm-comment": {
        color: "#ff8080" // Light red for comments
      }
    });
    
    return {
      extensions: [c64Theme],
      initialDoc: '10 REM COMMODORE 64 BASIC V2\n20 PRINT "HELLO FROM C64 BASIC!"\n30 FOR I=1 TO 10\n40 PRINT "LOOP: ";I\n50 NEXT I\n60 END'
    };
  }
  
  // Store the editor view instance
  setEditorView(editorView) {
    this.editorView = editorView;
  }
  
  // Public methods that might be called from outside
  getContent() {
    if (this.editorView) {
      return this.editorView.state.doc.toString();
    }
    return '';
  }
  
  setContent(content) {
    if (this.editorView) {
      this.editorView.dispatch({
        changes: {
          from: 0,
          to: this.editorView.state.doc.length,
          insert: content
        }
      });
    }
  }
  
  // Methods that can be called from the icon bar
  runProgram() {
    console.log('C64: Running program');
  }
  
  stopProgram() {
    console.log('C64: Stopping program');
  }
  
  resetEmulator() {
    console.log('C64: Resetting emulator');
  }
  
  loadProgram(program) {
    console.log('C64: Loading program', program);
    this.setContent('10 REM LOADED PROGRAM\n20 PRINT "PROGRAM LOADED!"\n30 END');
  }
  
  saveProgram() {
    console.log('C64: Saving program');
  }
  
  // Additional methods to match the interface expected by the main Editor component
  debugProgram() {
    console.log('C64: Debug mode not supported');
    alert('Debug mode is not supported in the C64 emulator');
  }
  
  showHelp() {
    console.log('C64: Showing help');
    alert('C64 BASIC Help:\n\nBasic Commands:\nLOAD - Load a program\nSAVE - Save a program\nRUN - Run the program\nLIST - List the program\nNEW - Clear the program\n\nUse the icon bar for common operations.');
  }
  
  newFile() {
    console.log('C64: Creating new file');
    this.setContent('10 REM NEW C64 BASIC PROGRAM\n20 PRINT "HELLO WORLD!"\n30 END');
  }
  
  openFile() {
    console.log('C64: Opening file');
    // In a real implementation, this would open a file picker
    alert('Open file functionality not implemented for C64 mode');
  }
  
  saveFile() {
    console.log('C64: Saving file');
    this.saveProgram();
  }
}

export default C64Editor;

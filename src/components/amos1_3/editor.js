// AMOS 1.3 Editor component
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'

class AMOS13Editor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create a styled container for AMOS 1.3
    this.container.innerHTML = `
      <div class="amos-editor">
        <div class="amos-header">AMOS 1.3 Editor</div>
        <div id="amos-editor-container" class="amos-content"></div>
      </div>
    `;
    
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
    
    const startState = EditorState.create({
      doc: '10 REM AMOS 1.3 Program\n20 PRINT "Hello from AMOS 1.3!"\n30 FOR I=1 TO 10\n40 PRINT "Loop: ";I\n50 NEXT I\n60 END',
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        EditorView.lineWrapping,
        amosTheme
      ]
    });

    this.editorView = new EditorView({
      state: startState,
      parent: document.getElementById('amos-editor-container')
    });
  }
  
  getContent() {
    if (this.editorView) {
      return this.editorView.state.doc.toString();
    }
    return '';
  }
  
  setContent(content) {
    if (this.editorView) {
      const transaction = this.editorView.state.update({
        changes: {
          from: 0,
          to: this.editorView.state.doc.length,
          insert: content
        }
      });
      this.editorView.dispatch(transaction);
    }
  }
}

export default AMOS13Editor;

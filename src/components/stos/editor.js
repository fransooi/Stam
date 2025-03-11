// STOS Basic Editor component
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'

class STOSEditor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create a styled container for STOS Basic
    this.container.innerHTML = `
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

    this.editorView = new EditorView({
      state: startState,
      parent: document.getElementById('stos-editor-container')
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

export default STOSEditor;

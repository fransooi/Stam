// AMOS Pro Editor component
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'

class AMOSProEditor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create a styled container for AMOS Pro
    this.container.innerHTML = `
      <div class="amospro-editor">
        <div class="amospro-header">AMOS Professional Version 2.00</div>
        <div id="amospro-editor-container" class="amospro-content"></div>
      </div>
    `;
    
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
    
    const startState = EditorState.create({
      doc: '10 REM AMOS Professional Program\n20 PRINT "Hello from AMOS Pro!"\n30 FOR I=1 TO 10\n40 PRINT "Loop: ";I\n50 NEXT I\n60 END',
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        EditorView.lineWrapping,
        amosProTheme
      ]
    });

    this.editorView = new EditorView({
      state: startState,
      parent: document.getElementById('amospro-editor-container')
    });
    
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

export default AMOSProEditor;

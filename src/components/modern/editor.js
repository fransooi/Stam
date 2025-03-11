// Modern Editor component
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

class ModernEditor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';
    
    // Create a modern editor using CodeMirror
    const startState = EditorState.create({
      doc: '// Welcome to PCOS Editor\n\nfunction helloWorld() {\n  console.log("Hello, world!");\n  return "Hello, world!";\n}\n\nhelloWorld();',
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        javascript(),
        oneDark,
        EditorView.lineWrapping,
        EditorState.allowMultipleSelections.of(true)
      ]
    });
    
    this.editorView = new EditorView({
      state: startState,
      parent: this.container
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

export default ModernEditor;

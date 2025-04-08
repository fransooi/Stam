// JavaScript Editor component
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'

class JavaScriptEditor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  // Prepare the container with JavaScript-specific styling
  prepareContainer() {
    // Create a styled container for JavaScript without the header
    this.container.innerHTML = `
      <div class="javascript-editor">
        <div id="javascript-editor-container" class="javascript-content"></div>
      </div>
    `;
  }
  
  // Return the parent element for the editor
  getEditorParent() {
    return document.getElementById('javascript-editor-container');
  }
  
  // Provide configuration for the main Editor component
  getConfig() {
    return {
      extensions: [
        javascript(),
        oneDark,
        EditorState.allowMultipleSelections.of(true)
      ],
      initialDoc: '// Javascript Editor',
      multi: true
    };
  }
  
  // Store the editor view instance
  setEditorView(editorView) {
    this.editorView = editorView;
  }
  
  // Mode-specific operations
  runProgram() {
    console.log('Running JavaScript program');
  }
  
  debugProgram() {
    console.log('Debugging JavaScript program');
    alert('JavaScript debugging is not implemented yet. Use browser developer tools for debugging.');
  }
  
  newFile() {
    console.log('Creating new JavaScript file');
    return '// New JavaScript file\n\n// Write your code here\n';
  }
  
  shareCode() {
    console.log('Sharing JavaScript code');
    
    // Get the current code
    const code = this.editorView.state.doc.toString();
    
    // Create a shareable link (this is a placeholder - would need a real sharing service)
    const encodedCode = encodeURIComponent(code);
    alert(`Code sharing link (conceptual):\nhttps://stam.share/code?lang=js&code=${encodedCode.substring(0, 30)}...`);
  }
  
  showHelp() {
    console.log('Showing JavaScript help');
    alert('JavaScript Help:\n\nBasic syntax:\n- var, let, const: variable declarations\n- function: define functions\n- if/else: conditionals\n- for, while: loops\n- console.log(): output to console\n\nPress F12 to open browser developer tools for debugging.');
  }
}

export default JavaScriptEditor;

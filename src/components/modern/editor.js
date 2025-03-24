// Modern Editor component
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'

class ModernEditor {
  constructor(container) {
    this.container = container;
    this.editorView = null;
  }

  // Prepare the container with Modern-specific styling
  prepareContainer() {
    // Create a styled container for Modern without the header
    this.container.innerHTML = `
      <div class="modern-editor">
        <div id="modern-editor-container" class="modern-content"></div>
      </div>
    `;
  }
  
  // Return the parent element for the editor
  getEditorParent() {
    return document.getElementById('modern-editor-container');
  }
  
  // Provide configuration for the main Editor component
  getConfig() {
    return {
      extensions: [
        javascript(),
        oneDark,
        EditorState.allowMultipleSelections.of(true)
      ],
      initialDoc: '// Welcome to PCOS Editor\n\nfunction helloWorld() {\n  console.log("Hello, world!");\n  return "Hello, world!";\n}\n\nhelloWorld();'
    };
  }
  
  // Store the editor view instance
  setEditorView(editorView) {
    this.editorView = editorView;
  }
  
  // Mode-specific operations
  runProgram() {
    console.log('Running JavaScript program');
    
    try {
      // Get the current code
      const code = this.editorView.state.doc.toString();
      
      // Create a function from the code
      const runFunction = new Function(code);
      
      // Run the code and capture console output
      const originalConsoleLog = console.log;
      let output = [];
      
      console.log = function(...args) {
        output.push(args.join(' '));
        originalConsoleLog.apply(console, args);
      };
      
      // Execute the code
      const result = runFunction();
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      // Display the output
      let outputMessage = 'Program executed successfully.';
      if (output.length > 0) {
        outputMessage += '\n\nConsole output:\n' + output.join('\n');
      }
      if (result !== undefined) {
        outputMessage += '\n\nReturn value: ' + result;
      }
      
      alert(outputMessage);
    } catch (error) {
      alert(`Error executing JavaScript: ${error.message}`);
      console.error('Error executing JavaScript:', error);
    }
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
    alert(`Code sharing link (conceptual):\nhttps://pcos.share/code?lang=js&code=${encodedCode.substring(0, 30)}...`);
  }
  
  showHelp() {
    console.log('Showing JavaScript help');
    alert('JavaScript Help:\n\nBasic syntax:\n- var, let, const: variable declarations\n- function: define functions\n- if/else: conditionals\n- for, while: loops\n- console.log(): output to console\n\nPress F12 to open browser developer tools for debugging.');
  }
}

export default ModernEditor;

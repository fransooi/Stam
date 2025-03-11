// Commodore 64 Editor component with Vicii-ous emulator integration

class C64Editor {
  constructor(container) {
    this.container = container;
    this.iframe = null;
  }

  render() {
    try {
      // Clear the container
      this.container.innerHTML = '';
      
      console.log('Rendering C64 editor with Vicii-ous emulator');
      
      // Create a container for the C64 emulator
      const emulatorContainer = document.createElement('div');
      emulatorContainer.className = 'c64-emulator';
      
      // Create the iframe to load the Vicii-ous emulator
      this.iframe = document.createElement('iframe');
      this.iframe.className = 'c64-iframe';
      this.iframe.src = '/c64/viciious/index.html';
      this.iframe.setAttribute('frameborder', '0');
      this.iframe.setAttribute('allowfullscreen', 'true');
      this.iframe.setAttribute('allow', 'autoplay; fullscreen');
      
      // Add error handling for iframe loading
      this.iframe.onerror = (error) => {
        console.error('Error loading C64 emulator iframe:', error);
        this.container.innerHTML = `<div class="error-message">Failed to load C64 emulator: ${error.message || 'Unknown error'}</div>`;
      };
      
      // Add load event to confirm successful loading
      this.iframe.onload = () => {
        console.log('C64 emulator iframe loaded successfully');
      };
      
      // Add the iframe directly to the container
      emulatorContainer.appendChild(this.iframe);
      this.container.appendChild(emulatorContainer);
      
      // Add custom styles for C64 emulator iframe
      const style = document.createElement('style');
      style.textContent = `
        .c64-emulator {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background-color: #000000;
          overflow: hidden;
          border: none;
        }
        .c64-iframe {
          flex: 1;
          width: 100%;
          height: 100%;
          border: none;
          background-color: #000000;
          padding: 0;
          margin: 0;
        }
        .error-message {
          color: #FF0000;
          padding: 20px;
          font-weight: bold;
          background-color: #000000;
        }
      `;
      document.head.appendChild(style);
      
      // Set up communication with the iframe
      this.setupIframeMessaging();
      
      console.log('C64 editor rendered successfully');
    } catch (error) {
      console.error('Error rendering C64 editor:', error);
      this.container.innerHTML = `<div class="error-message">Failed to render C64 editor: ${error.message || 'Unknown error'}</div>`;
    }
  }
  
  setupIframeMessaging() {
    // Listen for messages from the iframe
    window.addEventListener('message', (event) => {
      // Make sure the message is from our iframe
      if (this.iframe && event.source === this.iframe.contentWindow) {
        console.log('Message from C64 emulator:', event.data);
        
        // Handle different message types
        if (event.data.type === 'c64_ready') {
          console.log('C64 emulator is ready');
        } else if (event.data.type === 'c64_error') {
          console.error('C64 emulator error:', event.data.error);
        }
      }
    });
  }
  
  // Method to send commands to the emulator
  sendCommand(command, params = {}) {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({
        type: 'c64_command',
        command: command,
        params: params
      }, '*');
    }
  }
  
  // Public methods that might be called from outside
  getContent() {
    // In a real implementation, this would get the content from the emulator
    // For now, return an empty string
    return '';
  }
  
  setContent(content) {
    // In a real implementation, this would set the content in the emulator
    // For now, do nothing
  }
  
  // Methods that can be called from the icon bar
  runProgram() {
    console.log('C64: Running program');
    this.sendCommand('run');
  }
  
  stopProgram() {
    console.log('C64: Stopping program');
    this.sendCommand('stop');
  }
  
  resetEmulator() {
    console.log('C64: Resetting emulator');
    this.sendCommand('reset');
  }
  
  loadProgram(program) {
    console.log('C64: Loading program', program);
    this.sendCommand('load', { program: program });
  }
  
  saveProgram() {
    console.log('C64: Saving program');
    this.sendCommand('save');
  }
}

export default C64Editor;

/**
 * SocketSideWindow.js
 * 
 * A SideWindow component for managing WebSocket connections.
 * Provides UI for connection status, authentication, and message display.
 */

import SideWindow from './SideWindow.js';
import WebSocketClient from '../../../utils/WebSocketClient.js';

class SocketSideWindow extends SideWindow {
  /**
   * Create a new SocketSideWindow
   * @param {number} initialHeight - Initial height of the window
   */
  constructor(parentId, containerId, initialHeight = 200) {
    super('Socket', 'Server', parentId, containerId, initialHeight);
    
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.userKey = '';
    this.messages = [];
    this.maxMessages = 50; // Maximum number of messages to display
    
    // Message counters
    this.messagesSent = 0;
    this.messagesReceived = 0;
    
    // UI elements
    this.statusElement = null;
    this.messageContainer = null;
    this.connectButton = null;
    this.disconnectButton = null;
    this.userKeyInput = null;
    
    // Indicator elements
    this.connectionIndicator = null;
    this.sendIndicator = null;
    this.receiveIndicator = null;
    
    // Indicator timers
    this.sendFlashTimer = null;
    this.receiveFlashTimer = null;
  }
  
  /**
   * Handle incoming messages
   * 
   * @param {string} messageType - Type of message received
   * @param {Object} messageData - Data associated with the message
   * @param {Object} sender - Component that sent the message
   * @returns {boolean} - True if the message was handled
   */
  handleMessage(messageType, messageData, sender) {
    console.log(`SocketSideWindow received message: ${messageType}`, messageData);
    // Handle socket-specific messages
    switch (messageType) {
      case 'SOCKET_CONNECT':
        return this.handleSocketConnectMessage(messageData);
        
      case 'SOCKET_DISCONNECT':
        return this.handleSocketDisconnectMessage(messageData);
        
      case 'SOCKET_SEND_MESSAGE':
        return this.handleSocketSendMessage(messageData);
        
      case 'SOCKET_SET_USER_KEY':
        return this.handleSocketSetUserKeyMessage(messageData);
    }
    
    return super.handleMessage(messageType, messageData, sender);
  }
  
  /**
   * Override render to set up content and event listeners
   * @returns {HTMLElement} - The rendered window element
   */
  render() {
    // Call parent render method
    const container = super.render();
    
    // Add indicator buttons to the title bar
    this.addIndicatorButtons();
    
    // Create the socket UI
    this.createSocketUI();
    
    // Add event listener for content height changes
    this.content.addEventListener('contentHeightChanged', (event) => {
      this.handleContentHeightChanged(event.detail.height);
    });
    
    // Initial content height update
    this.updateContentHeight();
    
    return container;
  }
  
  /**
   * Add indicator buttons to the title bar
   */
  addIndicatorButtons() {
    // Create container for indicators
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'socket-indicator-container';
    
    // Create connection indicator button
    this.connectionIndicator = document.createElement('span');
    this.connectionIndicator.className = 'socket-indicator connection-indicator disconnected';
    this.connectionIndicator.title = 'Connection Status: Disconnected';
    this.connectionIndicator.addEventListener('click', () => this.toggleConnection());
    
    // Create send indicator button
    this.sendIndicator = document.createElement('span');
    this.sendIndicator.className = 'socket-indicator send-indicator';
    this.sendIndicator.title = 'Send Indicator';
    
    // Create receive indicator button
    this.receiveIndicator = document.createElement('span');
    this.receiveIndicator.className = 'socket-indicator receive-indicator';
    this.receiveIndicator.title = 'Receive Indicator';
    
    // Add indicators to container
    indicatorContainer.appendChild(this.connectionIndicator);
    indicatorContainer.appendChild(this.sendIndicator);
    indicatorContainer.appendChild(this.receiveIndicator);
    
    // Add container to the title bar (using true to place it before all controls)
    this.addCustomTitleBarButton(indicatorContainer, true);
    
    // Add styles for indicators
    this.addIndicatorStyles();
  }
  
  /**
   * Add styles for the indicator buttons
   */
  addIndicatorStyles() {
    if (!document.getElementById('socket-indicator-styles')) {
      const style = document.createElement('style');
      style.id = 'socket-indicator-styles';
      style.textContent = `
        .socket-indicator-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        .socket-indicator {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin: 0 3px;
          cursor: pointer;
          border: 1px solid #666;
          position: relative;
          top: 0px;
        }
        
        .connection-indicator {
          background-color: #ff3333; /* Red for disconnected */
        }
        
        .connection-indicator.connecting {
          background-color: #ffaa33; /* Orange for connecting */
        }
        
        .connection-indicator.connected {
          background-color: #33cc33; /* Green for connected */
        }
        
        .send-indicator {
          background-color: #225522; /* Dark green when idle */
        }
        
        .send-indicator.active {
          background-color: #33ff33; /* Light green when sending */
        }
        
        .receive-indicator {
          background-color: #225522; /* Dark green when idle */
        }
        
        .receive-indicator.active {
          background-color: #33ff33; /* Light green when receiving */
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Toggle connection status
   */
  toggleConnection() {
    if (this.isConnected) {
      this.disconnect();
    } else {
      this.connect();
    }
  }
  
  /**
   * Handle content height changes
   * @param {number} height - New content height
   */
  handleContentHeightChanged(height) {
    // Update the message container height
    if (this.messageContainer) {
      // Calculate available height for messages (content height minus controls height)
      const controlsHeight = this.content.querySelector('.socket-controls')?.offsetHeight || 0;
      const statusHeight = this.statusElement?.offsetHeight || 0;
      const messageHeight = height - controlsHeight - statusHeight - 20; // 20px for padding/margins
      
      if (messageHeight > 0) {
        this.messageContainer.style.height = `${messageHeight}px`;
        this.messageContainer.style.maxHeight = `${messageHeight}px`;
      }
    }
  }
  
  /**
   * Create the socket UI
   */
  createSocketUI() {
    // Clear existing content
    this.content.innerHTML = '';
    
    // Create status element
    this.statusElement = document.createElement('div');
    this.statusElement.className = 'socket-status';
    this.updateStatusDisplay();
    
    // Create connection controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'socket-controls';
    
    // User key input
    const userKeyLabel = document.createElement('label');
    userKeyLabel.textContent = 'User Key:';
    userKeyLabel.htmlFor = 'socket-user-key';
    
    this.userKeyInput = document.createElement('input');
    this.userKeyInput.type = 'text';
    this.userKeyInput.id = 'socket-user-key';
    this.userKeyInput.value = this.userKey;
    this.userKeyInput.placeholder = 'Enter user key';
    
    // Connect button
    this.connectButton = document.createElement('button');
    this.connectButton.textContent = 'Connect';
    this.connectButton.addEventListener('click', () => this.connect());
    
    // Disconnect button
    this.disconnectButton = document.createElement('button');
    this.disconnectButton.textContent = 'Disconnect';
    this.disconnectButton.addEventListener('click', () => this.disconnect());
    this.disconnectButton.disabled = !this.isConnected;
    
    // Add elements to controls container
    controlsContainer.appendChild(userKeyLabel);
    controlsContainer.appendChild(this.userKeyInput);
    controlsContainer.appendChild(this.connectButton);
    controlsContainer.appendChild(this.disconnectButton);
    
    // Create message container
    this.messageContainer = document.createElement('div');
    this.messageContainer.className = 'socket-messages';
    
    // Create indicator elements
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'socket-indicators';
    
    // Add all elements to content
    this.content.appendChild(this.statusElement);
    this.content.appendChild(controlsContainer);
    this.content.appendChild(this.messageContainer);
    this.content.appendChild(indicatorContainer);
    
    // Add some basic styling
    this.addStyles();
    
    // Display existing messages
    this.displayMessages();
  }
  
  /**
   * Update the status display based on connection state
   */
  updateStatusDisplay() {
    if (!this.statusElement) return;
    
    if (this.isConnected) {
      this.statusElement.innerHTML = '<span class="status-connected">Connected</span>';
      this.statusElement.classList.add('connected');
      this.statusElement.classList.remove('disconnected');
      
      if (this.connectButton) this.connectButton.disabled = true;
      if (this.disconnectButton) this.disconnectButton.disabled = false;
    } else if (this.isConnecting) {
      this.statusElement.innerHTML = '<span class="status-connecting">Connecting...</span>';
      this.statusElement.classList.add('connecting');
      this.statusElement.classList.remove('connected', 'disconnected');
      
      if (this.connectButton) this.connectButton.disabled = true;
      if (this.disconnectButton) this.disconnectButton.disabled = true;
    } else {
      this.statusElement.innerHTML = '<span class="status-disconnected">Disconnected</span>';
      this.statusElement.classList.add('disconnected');
      this.statusElement.classList.remove('connected', 'connecting');
      
      if (this.connectButton) this.connectButton.disabled = false;
      if (this.disconnectButton) this.disconnectButton.disabled = true;
    }
  }
  
  /**
   * Add styles for the socket UI
   */
  addStyles() {
    // Add styles if not already present
    if (!document.getElementById('socket-side-window-styles')) {
      const style = document.createElement('style');
      style.id = 'socket-side-window-styles';
      style.textContent = `
        .socket-status {
          padding: 5px;
          margin-bottom: 5px;
          font-weight: bold;
          text-align: center;
        }
        .socket-status.connected {
          background-color: rgba(0, 128, 0, 0.2);
        }
        .socket-status.disconnected {
          background-color: rgba(255, 0, 0, 0.2);
        }
        .socket-status.connecting {
          background-color: rgba(255, 255, 0, 0.2);
        }
        .status-connected {
          color: green;
        }
        .status-disconnected {
          color: red;
        }
        .status-connecting {
          color: yellow;
        }
        .socket-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding: 5px;
          background-color: rgba(0, 0, 0, 0.1);
          margin-bottom: 5px;
        }
        .socket-controls input {
          flex: 1;
          min-width: 100px;
        }
        .socket-controls button {
          padding: 2px 8px;
        }
        .socket-messages {
          padding: 5px;
          overflow-y: auto;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .socket-message {
          margin-bottom: 5px;
          padding: 3px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .socket-message-time {
          font-size: 0.8em;
          color: #666;
        }
        .socket-message-direction {
          font-weight: bold;
          margin-right: 5px;
        }
        .socket-message-content {
          word-break: break-word;
        }
        .socket-message-sent .socket-message-direction {
          color: blue;
        }
        .socket-message-received .socket-message-direction {
          color: green;
        }
        .socket-connection-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: red;
          margin: 5px;
        }
        .socket-connection-indicator.connected {
          background-color: green;
        }
        .socket-connection-indicator.connecting {
          background-color: yellow;
        }
        .socket-send-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: gray;
          margin: 5px;
        }
        .socket-send-indicator.sending {
          background-color: blue;
        }
        .socket-receive-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: gray;
          margin: 5px;
        }
        .socket-receive-indicator.receiving {
          background-color: green;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Display all messages in the message container
   */
  displayMessages() {
    if (!this.messageContainer) return;
    
    // Clear existing messages
    this.messageContainer.innerHTML = '';
    
    // Add each message
    this.messages.forEach(message => {
      this.addMessageToDisplay(message);
    });
    
    // Scroll to bottom
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }
  
  /**
   * Add a message to the display
   * @param {Object} message - The message to add
   */
  addMessageToDisplay(message) {
    if (!this.messageContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `socket-message socket-message-${message.direction}`;
    
    const timeElement = document.createElement('div');
    timeElement.className = 'socket-message-time';
    timeElement.textContent = message.time;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'socket-message-content';
    
    const directionElement = document.createElement('span');
    directionElement.className = 'socket-message-direction';
    directionElement.textContent = message.direction === 'sent' ? '→' : '←';
    
    contentElement.appendChild(directionElement);
    contentElement.appendChild(document.createTextNode(message.content));
    
    messageElement.appendChild(timeElement);
    messageElement.appendChild(contentElement);
    
    this.messageContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect() {
    // Get user key from input
    this.userKey = this.userKeyInput.value.trim();
    
    // Create client if not exists
    if (!this.client) {
      this.client = new WebSocketClient();
      
      // Set up event handlers
      this.client.onOpen = () => this.handleConnectionOpen();
      this.client.onClose = () => this.handleConnectionClose();
      this.client.onMessage = (message) => this.handleServerMessage(message);
      this.client.onError = (error) => this.handleConnectionError(error);
    }
    
    // Connect
    this.client.connect(this.userKey);
    
    // Add connection message
    this.addMessage('sent', 'Connecting to server...');
    
    // Update connection indicator
    this.isConnecting = true;
    this.updateStatusDisplay();
    this.updateConnectionIndicator();
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.addMessage('sent', 'Disconnecting from server...');
    }
  }
  
  /**
   * Handle connection open event
   */
  handleConnectionOpen() {
    this.isConnected = true;
    this.isConnecting = false;
    // Reset message counters on new connection
    this.messagesSent = 0;
    this.messagesReceived = 0;
    this.updateStatusDisplay();
    this.updateConnectionIndicator();
    this.updateSendIndicatorTooltip();
    this.updateReceiveIndicatorTooltip();
    this.addMessage('received', 'Connected to server');
  }
  
  /**
   * Handle connection close event
   */
  handleConnectionClose() {
    this.isConnected = false;
    this.isConnecting = false;
    this.updateStatusDisplay();
    this.updateConnectionIndicator();
    this.addMessage('received', 'Disconnected from server');
  }
  
  /**
   * Handle connection error event
   * @param {Error} error - The error that occurred
   */
  handleConnectionError(error) {
    this.addMessage('received', `Error: ${error.message}`);
  }
  
  /**
   * Handle message from server
   * @param {Object} message - The message received
   */
  handleServerMessage(message) {
    // Increment received counter
    this.messagesReceived++;
    
    // Add message to display
    this.addMessage('received', JSON.stringify(message));
    
    // Update receive indicator
    this.updateReceiveIndicator();
    this.updateReceiveIndicatorTooltip();
  }
  
  /**
   * Add a message to the message list
   * @param {string} direction - Direction of the message ('sent' or 'received')
   * @param {string} content - Content of the message
   */
  addMessage(direction, content) {
    // Create message object
    const message = {
      direction,
      content,
      time: new Date().toLocaleTimeString()
    };
    
    // Add to messages array
    this.messages.push(message);
    
    // Limit number of messages
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
    
    // Add to display
    this.addMessageToDisplay(message);
  }
  
  /**
   * Handle SOCKET_CONNECT message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleSocketConnectMessage(messageData) {
    this.connect();
    return true;
  }
  
  /**
   * Handle SOCKET_DISCONNECT message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleSocketDisconnectMessage(messageData) {
    this.disconnect();
    return true;
  }
  
  /**
   * Handle SOCKET_SEND_MESSAGE message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleSocketSendMessage(messageData) {
    if (this.client && this.isConnected && messageData.message) {
      this.client.send(messageData.message);
      // Increment sent counter
      this.messagesSent++;
      this.addMessage('sent', messageData.message);
      
      // Update send indicator
      this.updateSendIndicator();
      this.updateSendIndicatorTooltip();
      return true;
    }
    return false;
  }
  
  /**
   * Handle SOCKET_SET_USER_KEY message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleSocketSetUserKeyMessage(messageData) {
    if (messageData.userKey) {
      this.userKey = messageData.userKey;
      if (this.userKeyInput) {
        this.userKeyInput.value = this.userKey;
      }
      return true;
    }
    return false;
  }
  
  /**
   * Update the connection indicator
   */
  updateConnectionIndicator() {
    if (!this.connectionIndicator) return;
    
    if (this.isConnected) {
      this.connectionIndicator.className = 'socket-indicator connection-indicator connected';
      this.connectionIndicator.title = 'Connection Status: Connected (Click to Disconnect)';
    } else if (this.isConnecting) {
      this.connectionIndicator.className = 'socket-indicator connection-indicator connecting';
      this.connectionIndicator.title = 'Connection Status: Connecting...';
    } else {
      this.connectionIndicator.className = 'socket-indicator connection-indicator disconnected';
      this.connectionIndicator.title = 'Connection Status: Disconnected (Click to Connect)';
    }
  }
  
  /**
   * Update the send indicator
   */
  updateSendIndicator() {
    if (!this.sendIndicator) return;
    
    // Add active class
    this.sendIndicator.classList.add('active');
    
    // Remove active class after a short delay
    clearTimeout(this.sendFlashTimer);
    this.sendFlashTimer = setTimeout(() => {
      this.sendIndicator.classList.remove('active');
    }, 300);
  }
  
  /**
   * Update the receive indicator
   */
  updateReceiveIndicator() {
    if (!this.receiveIndicator) return;
    
    // Add active class
    this.receiveIndicator.classList.add('active');
    
    // Remove active class after a short delay
    clearTimeout(this.receiveFlashTimer);
    this.receiveFlashTimer = setTimeout(() => {
      this.receiveIndicator.classList.remove('active');
    }, 300);
  }
  
  /**
   * Update the send indicator tooltip
   */
  updateSendIndicatorTooltip() {
    if (this.sendIndicator) {
      this.sendIndicator.title = `Send Indicator: ${this.messagesSent} message${this.messagesSent !== 1 ? 's' : ''} sent since connection`;
    }
  }
  
  /**
   * Update the receive indicator tooltip
   */
  updateReceiveIndicatorTooltip() {
    if (this.receiveIndicator) {
      this.receiveIndicator.title = `Receive Indicator: ${this.messagesReceived} message${this.messagesReceived !== 1 ? 's' : ''} received since connection`;
    }
  }
  
  /**
   * Override getLayoutInfo to include SocketSideWindow-specific information
   * @returns {Object} Layout information for this SocketSideWindow
   */
  getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = super.getLayoutInfo();
    
    // Add SocketSideWindow-specific information
    layoutInfo.userKey = this.userKey;
    layoutInfo.isConnected = this.isConnected;
    
    return layoutInfo;
  }
}

export default SocketSideWindow;

/**
 * SocketSideWindow.js
 * 
 * A SideWindow component for managing WebSocket connections.
 * Provides UI for connection status, authentication, and message display.
 */

import SideWindow from './SideWindow.js';
import WebSocketClient from '../../utils/WebSocketClient.js';
import { SERVERCOMMANDS } from '../../../../engine/servercommands.mjs';
import { MENUCOMMANDS } from '../MenuBar.js';

// Define message types for preference handling
export const SOCKETMESSAGES = {
  CONNECT: 'SOCKET_CONNECT',
  CONNECT_IF_CONNECTED: 'SOCKET_CONNECT_IF_CONNECTED',
  DISCONNECT: 'SOCKET_DISCONNECT',
  SEND_MESSAGE: 'SOCKET_SEND_MESSAGE',
  REQUEST_RESPONSE: 'SOCKET_REQUEST_RESPONSE',
  CONTENT_HEIGHT_CHANGED: 'CONTENT_HEIGHT_CHANGED',
  CONNECTED: 'SOCKET_CONNECTED',
  DISCONNECTED: 'SOCKET_DISCONNECTED',
  MESSAGE_RECEIVED: 'SOCKET_MESSAGE_RECEIVED',
  GET_CONNECTION_INFO: 'SOCKET_GET_CONNECTION_INFO',
  SHOW_CONNECTION_DIALOG: 'SOCKET_SHOW_CONNECTION_DIALOG',
  FROM_PROMPT: 'SOCKET_FROM_PROMPT'
};

class SocketSideWindow extends SideWindow {
  /**
   * Create a new SocketSideWindow
   * @param {number} initialHeight - Initial height of the window
   */
  constructor(parentId, containerId, initialHeight = 200) {
    super('Socket', 'Server', parentId, containerId, initialHeight);
    
    this.isConnected = false;
    this.isConnecting = false;
    this.wasConnected = false;
    this.userKey = '';
    this.userName = '';
    this.url = 'ws://localhost:1033';
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
    this.userNameInput = null;
    this.urlInput = null;
    
    // Indicator elements
    this.connectionIndicator = null;
    this.sendIndicator = null;
    this.receiveIndicator = null;
    
    // Indicator timers
    this.sendFlashTimer = null;
    this.receiveFlashTimer = null;

    // Message handlers
    this.messageMap[SOCKETMESSAGES.CONNECT] = this.handleConnect;
    this.messageMap[SOCKETMESSAGES.CONNECT_IF_CONNECTED] = this.handleConnectIfConnected;
    this.messageMap[SOCKETMESSAGES.DISCONNECT] = this.handleLogout;
    this.messageMap[SOCKETMESSAGES.SEND_MESSAGE] = this.handleSendMessage;
    this.messageMap[SOCKETMESSAGES.REQUEST_RESPONSE] = this.handleRequestResponse;
    this.messageMap[SOCKETMESSAGES.CONTENT_HEIGHT_CHANGED] = this.handleContentHeightChanged;    
    this.messageMap[SOCKETMESSAGES.GET_CONNECTION_INFO] = this.handleGetConnectionInfo;
    this.messageMap[MENUCOMMANDS.LOGIN] = this.handleLogin;
    this.messageMap[MENUCOMMANDS.LOGOUT] = this.handleLogout;

    // Create client if not exists
    this.client = new WebSocketClient({   
      root: this.root,
      onOpen: () => this.handleConnectionOpen(),
      onConnected: () => this.handleConnectionConnected(),
      onClose: () => this.handleConnectionClose(),
      onMessage: (message) => this.handleServerMessage(message),
      onError: (error) => this.handleConnectionError(error)
    });

    // Poke in root
    this.root.socket = this;
  }
  
  /**
   * Initialize the Socket side window
   * @param {Object} options - Optional configuration options
   * @returns {Promise<void>}
   */
  async init(options) {
    super.init(options);
  }
  
  /**
   * Destroy the Socket side window
   * @returns {Promise<void>}
   */
  async destroy() {
    super.destroy();
  }
  
  
  /**
   * Override render to set up content and event listeners
   * @returns {HTMLElement} - The rendered window element
   */
  async render(containerId) {
    await super.render(containerId);
    
    // Add indicator buttons to the title bar
    this.addIndicatorButtons();
    
    // Create the socket UI
    this.createSocketUI();
       
    return this.container;
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
  async handleContentHeightChanged(height, senderId) {
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
    
    // Set the content container to use flex layout
    this.content.className = 'socket-content';
    
    // Create status element with connection indicator
    const statusContainer = document.createElement('div');
    statusContainer.className = 'socket-status-container';
    
    this.statusElement = document.createElement('div');
    this.statusElement.className = 'socket-status';
    this.updateStatusDisplay();
    
    // Create connection indicator
    const connectionIndicator = document.createElement('div');
    connectionIndicator.className = 'socket-connection-indicator';
    if (this.isConnected) {
      connectionIndicator.classList.add('connected');
    } else if (this.isConnecting) {
      connectionIndicator.classList.add('connecting');
    }
    
    // Add tooltip to connection indicator
    connectionIndicator.title = this.isConnected ? 'Connected' : 'Disconnected';
    
    // Add elements to status container
    statusContainer.appendChild(connectionIndicator);
    statusContainer.appendChild(this.statusElement);
    
    // Create message container (console-like)
    this.messageContainer = document.createElement('div');
    this.messageContainer.className = 'socket-messages';
    
    // No longer need login/logout buttons as they're in the menu bar
    
    // Add all elements to content
    this.content.appendChild(statusContainer);
    this.content.appendChild(this.messageContainer);
    
    // Add some basic styling
    this.addStyles();
    
    // Display existing messages
    this.displayMessages();
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
        /* Main content container with flex layout */
        .socket-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden; /* Prevent double scrollbars */
        }
        
        /* Status container styles - fixed at top */
        .socket-status-container {
          display: flex;
          align-items: center;
          padding: 3px;
          background-color: #222;
          border-bottom: 1px solid #444;
          flex-shrink: 0; /* Prevent status from shrinking */
        }
        
        .socket-status {
          flex: 1;
          font-weight: bold;
          font-size: 0.85em;
          text-align: center;
          color: #ddd;
        }
        
        .socket-status.connected {
          color: #4CAF50;
        }
        
        .socket-status.disconnected {
          color: #F44336;
        }
        
        .socket-status.connecting {
          color: #FFC107;
        }
        
        /* Connection indicator */
        .socket-connection-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #F44336;
          margin: 0 5px;
        }
        
        .socket-connection-indicator.connected {
          background-color: #4CAF50;
        }
        
        .socket-connection-indicator.connecting {
          background-color: #FFC107;
        }
        
        /* Button row */
        .socket-button-row {
          display: flex;
          justify-content: flex-end;
          padding: 3px;
          background-color: #222;
          border-top: 1px solid #444;
          flex-shrink: 0; /* Prevent button row from shrinking */
        }
        
        .socket-button {
          padding: 2px 8px;
          margin-left: 5px;
          background-color: #333;
          color: #ddd;
          border: 1px solid #555;
          border-radius: 2px;
          font-size: 0.8em;
          cursor: pointer;
        }
        
        .socket-button:hover {
          background-color: #444;
        }
        
        .socket-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Console-like message display - scrollable area */
        .socket-messages {
          flex: 1;
          padding: 3px;
          overflow-y: auto; /* Only the message area scrolls */
          background-color: #000;
          color: #fff;
          font-family: monospace;
          font-size: 0.85em;
          line-height: 1.2;
        }
        
        .socket-message {
          margin-bottom: 1px;
          padding: 1px 2px;
          border-bottom: 1px solid #222;
        }
        
        .socket-message-time {
          font-size: 0.75em;
          color: #888;
          margin-right: 4px;
          display: inline-block;
        }
        
        .socket-message-content {
          word-break: break-word;
          display: inline;
        }
        
        .socket-message-content-container {
          display: block;
          padding-left: 2px;
        }
        
        .socket-message-line {
          word-break: break-word;
          white-space: pre-wrap;
        }
        
        .socket-message-continuation {
          padding-left: 15px;
          position: relative;
        }
        
        .socket-message-continuation:before {
          content: '│';
          position: absolute;
          left: 5px;
          color: #555;
        }
        
        .socket-message-direction {
          font-weight: bold;
          margin-right: 3px;
        }
        
        .socket-message-sent .socket-message-direction {
          color: #2196F3;
        }
        
        .socket-message-received .socket-message-direction {
          color: #4CAF50;
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
    
    // Check if the message contains line breaks
    const hasLineBreaks = message.content.includes('\n');
    
    // Create the message container
    const messageElement = document.createElement('div');
    messageElement.className = `socket-message socket-message-${message.direction}`;
    
    // Create timestamp element
    const timeElement = document.createElement('span');
    timeElement.className = 'socket-message-time';
    timeElement.textContent = message.time;
    
    // Create direction indicator
    const directionElement = document.createElement('span');
    directionElement.className = 'socket-message-direction';
    directionElement.textContent = message.direction === 'sent' ? '→' : '←';
    
    // Add timestamp and direction indicator
    messageElement.appendChild(timeElement);
    messageElement.appendChild(directionElement);
    
    if (hasLineBreaks) {
      // For multi-line messages, create a container for the content
      const contentContainer = document.createElement('div');
      contentContainer.className = 'socket-message-content-container';
      
      // Split the content by line breaks and add each line
      const lines = message.content.split('\n');
      
      lines.forEach((line, index) => {
        // Create a new line element
        const lineElement = document.createElement('div');
        lineElement.className = 'socket-message-line';
        
        // Add indentation for all lines except the first one
        if (index > 0) {
          lineElement.classList.add('socket-message-continuation');
        }
        
        lineElement.textContent = line;
        contentContainer.appendChild(lineElement);
      });
      
      messageElement.appendChild(contentContainer);
    } else {
      // For single-line messages, just add the text directly
      messageElement.appendChild(document.createTextNode(message.content));
    }
    
    this.messageContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }
  
  /**
   * Add a message to the message list
   * @param {string} direction - Direction of the message ('sent' or 'received')
   * @param {string} content - Content of the message
   */
  addMessage(direction, content) {

    if ( typeof content === 'undefined' )
      return;

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
  async getLayoutInfo() {
    // Get base layout information from parent class
    const layoutInfo = await super.getLayoutInfo();
    
    // Add SocketSideWindow-specific information
    layoutInfo.userKey = this.userKey;
    layoutInfo.userName = this.userName;
    layoutInfo.url = this.url;
    layoutInfo.isConnected = this.isConnected;
        
    return layoutInfo;
  }

  /**
   * Override applyLayout to include SocketSideWindow-specific information
   * @param {Object} layoutInfo - Layout information for this SocketSideWindow
   * @returns {Object} Layout information for this SocketSideWindow
   */
  async applyLayout(layoutInfo) {
    // Call parent class applyLayout
    await super.applyLayout(layoutInfo);
    
    // Add SocketSideWindow-specific information
    this.userKey = layoutInfo.userKey || '';
    this.userName = layoutInfo.userName || 'francois';
    this.url = layoutInfo.url || 'ws://localhost:1033';
    this.wasConnected = layoutInfo.isConnected || false;
    return layoutInfo;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(options) {
    if(options) {
      // Get values from options
      this.userKey = options.userKey || this.userKey;
      this.userName = options.userName || this.userName;
      this.url = options.url || this.url;
    }else{
      // Get values from input fields
      this.userKey = this.userKeyInput.value.trim();
      this.userName = this.userNameInput.value.trim();
      this.url = this.urlInput.value.trim();
    }

    // Disconnect if already connected
    if ( this.client.getState() === 'connected' ) {
      this.client.disconnect();
    }

    // Add connection message
    this.addMessage('sent', 'Connecting to server...');
    
    // Update connection indicator
    this.isConnecting = true;
    this.updateStatusDisplay();
    this.updateConnectionIndicator();

    this.client.connect({
      url: this.url,
      userName: this.userName,
      userKey: this.userKey
    }).then(() => {
      this.handleConnectionOpen();
    }).catch(error => {
      this.handleConnectionError(error);
    });
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if ( this.client.getState() === 'connected' ) {
      this.client.disconnect(false);
      this.addMessage('sent', 'Disconnecting from server...');
    }
  }

  
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // WebSocket Client Methods
  ///////////////////////////////////////////////////////////////////////////////////////////////
  
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

    // Send authentication message
    this.client.authenticate();
  }
  
  /**
   * Handle connection close event
   */
  handleConnectionClose() {
    this.isConnected = false;
    this.isConnecting = false;
    this.updateStatusDisplay();
    this.updateConnectionIndicator();
    this.updateSendIndicatorTooltip();
    this.updateReceiveIndicatorTooltip();
    this.addMessage('received', 'Disconnected from server');

    // Broadcast message
    this.broadcast(SOCKETMESSAGES.DISCONNECTED, {
      userName: this.userName,
      userKey: this.userKey
    });
  }
  
  /**
   * Handle connection error event
   * @param {Error} error - The error that occurred
   */
  handleConnectionError(error) {
    this.addMessage('received', `Error: ${error}`);
    this.updateStatusDisplay();
    this.updateConnectionIndicator();
    this.updateSendIndicatorTooltip();
    this.updateReceiveIndicatorTooltip();
  }
  
  /**
   * Handle message from server
   * @param {Object} message - The message received
   */
  handleServerMessage(message) {
    // Increment received counter
    this.messagesReceived++;
    
    // Update receive indicator
    this.updateReceiveIndicator();
    this.updateReceiveIndicatorTooltip();

    // Get message text
    var text = message.command;
    if (message.responseTo)
      text = message.responseTo;

    // Connected?
    if (message.responseTo === SERVERCOMMANDS.CONNECT) {
      if (!message.error) {
        this.addMessage('received', text);    
        text = '';
        this.broadcast(SOCKETMESSAGES.CONNECTED, message.parameters);
      }
      else{
        text = message.error;
      }
    }

    // Prompt?
    if (message.command === SERVERCOMMANDS.PROMPT) {
      if (!message.error) {
        text += '\n' + message.parameters.text;
        this.addMessage('received', text);    
        text = '';
        this.broadcast(SOCKETMESSAGES.FROM_PROMPT,message.parameters);
      }
      else{
        text = message.error;
      }
    }

    // Add any remaining text
    if (text) 
      this.addMessage('received', text);

    // Send message to root
    this.sendMessageToRoot(SOCKETMESSAGES.MESSAGE_RECEIVED,message);
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // STAM Message Handlers
  ///////////////////////////////////////////////////////////////////////////////////////////////
    
  /**
   * Handle SOCKET_CONNECT message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleConnect(data,sender) {
    this.connect(data);
    return true;
  }
  
  /**
   * Handle SOCKET_CONNECT_IF_CONNECTED message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleConnectIfConnected(data,sender) {
    if (this.wasConnected) {
      this.connect({
        userKey: this.userKey,
        userName: this.userName,
        url: this.url
      });
    } 
    return true;
  }
  
  /**
   * Handle MENUCOMMANDS.LOGOUT message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleLogout(data,sender) {
    this.disconnect();
    return true;
  }
  
  /**
   * Handle MENUCOMMANDS.LOGIN message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleLogin(data,sender) {
    this.showConnectionDialog();
    return true;
  }

  /**
   * Handle SOCKET_SEND_MESSAGE message
   * @param {Object} messageData - Message data
   * @returns {boolean} - True if handled
   */
  handleSendMessage(data,sender) {
    if (this.client && this.isConnected) {
      this.client.send(data.command,data.parameters);

      // Increment sent counter
      this.messagesSent++;
      this.addMessage('sent', data.command);
      
      // Update send indicator
      this.updateSendIndicator();
      this.updateSendIndicatorTooltip();
      return true;
    }
    return false;
  }

  handleRequestResponse(data,sender) {

    if (this.client && this.isConnected) {
      var self = this;

      // Increment sent counter
      this.messagesSent++;
      this.addMessage('sent', data.command);
      this.updateSendIndicator();
      this.updateSendIndicatorTooltip();

      return new Promise((resolve, reject) => {
        this.client.request(data.command,data.parameters)
        .then(data => {
          // Add response to display
          this.addMessage('received', data.responseTo);
        
          // Update receive indicator
          this.updateReceiveIndicator();
          this.updateReceiveIndicatorTooltip();

          // Send response back to sender
          resolve(data.parameters);
        })
        .catch(data => {
          // Add error to display
          this.addMessage('received', data.responseTo + '\n' + data.parameters.error);
          
          // Update receive indicator
          this.updateReceiveIndicator();
          this.updateReceiveIndicatorTooltip();

          // Send error back to sender
          reject(error);
        });
      });
    }
    return false;
  }
  handleGetConnectionInfo(data,sender) {
    return {
      userName: this.userName,
      userKey: this.userKey,
      url: this.url
    };
  }

  /**
   * Show a connection dialog to enter user credentials and server URL
   * @returns {Promise<boolean>} - Resolves to true if Connect was clicked, false if Cancel was clicked
   */
  showConnectionDialog() {
    return new Promise((resolve) => {
      // Remove any existing dialog first
      const existingDialog = document.getElementById('socket-connection-dialog');
      if (existingDialog) {
        document.body.removeChild(existingDialog);
      }
      
      // Create dialog container
      const dialogContainer = document.createElement('div');
      dialogContainer.id = 'socket-connection-dialog';
      dialogContainer.className = 'socket-dialog-container';
      dialogContainer.style.position = 'fixed';
      dialogContainer.style.top = '0';
      dialogContainer.style.left = '0';
      dialogContainer.style.width = '100%';
      dialogContainer.style.height = '100%';
      dialogContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      dialogContainer.style.display = 'flex';
      dialogContainer.style.justifyContent = 'center';
      dialogContainer.style.alignItems = 'center';
      dialogContainer.style.zIndex = '9999';
      
      // Create dialog
      const dialog = document.createElement('div');
      dialog.className = 'socket-dialog';
      dialog.style.backgroundColor = '#2d2d2d';
      dialog.style.color = '#e0e0e0';
      dialog.style.padding = '20px';
      dialog.style.borderRadius = '5px';
      dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      dialog.style.width = '400px';
      dialog.style.maxWidth = '90%';
      
      // Create dialog title
      const title = document.createElement('h2');
      title.textContent = 'Connection Settings';
      title.style.margin = '0 0 20px 0';
      title.style.fontSize = '18px';
      title.style.fontWeight = 'bold';
      title.style.borderBottom = '1px solid #555';
      title.style.paddingBottom = '10px';
      dialog.appendChild(title);
      
      // Create form
      const form = document.createElement('form');
      form.style.display = 'flex';
      form.style.flexDirection = 'column';
      form.style.gap = '15px';
      
      // Create username field
      const userNameGroup = document.createElement('div');
      userNameGroup.style.display = 'flex';
      userNameGroup.style.flexDirection = 'column';
      userNameGroup.style.gap = '5px';
      
      const userNameLabel = document.createElement('label');
      userNameLabel.textContent = 'Username:';
      userNameLabel.style.fontSize = '14px';
      userNameGroup.appendChild(userNameLabel);
      
      const userNameInput = document.createElement('input');
      userNameInput.type = 'text';
      userNameInput.value = this.userName;
      userNameInput.style.padding = '8px';
      userNameInput.style.backgroundColor = '#3d3d3d';
      userNameInput.style.color = '#e0e0e0';
      userNameInput.style.border = '1px solid #555';
      userNameInput.style.borderRadius = '3px';
      userNameInput.style.fontSize = '14px';
      userNameGroup.appendChild(userNameInput);
      
      form.appendChild(userNameGroup);
      
      // Create key field
      const userKeyGroup = document.createElement('div');
      userKeyGroup.style.display = 'flex';
      userKeyGroup.style.flexDirection = 'column';
      userKeyGroup.style.gap = '5px';
      
      const userKeyLabel = document.createElement('label');
      userKeyLabel.textContent = 'Key:';
      userKeyLabel.style.fontSize = '14px';
      userKeyGroup.appendChild(userKeyLabel);
      
      const userKeyInput = document.createElement('input');
      userKeyInput.type = 'password';
      userKeyInput.value = this.userKey;
      userKeyInput.style.padding = '8px';
      userKeyInput.style.backgroundColor = '#3d3d3d';
      userKeyInput.style.color = '#e0e0e0';
      userKeyInput.style.border = '1px solid #555';
      userKeyInput.style.borderRadius = '3px';
      userKeyInput.style.fontSize = '14px';
      userKeyGroup.appendChild(userKeyInput);
      
      form.appendChild(userKeyGroup);
      
      // Create URL field
      const urlGroup = document.createElement('div');
      urlGroup.style.display = 'flex';
      urlGroup.style.flexDirection = 'column';
      urlGroup.style.gap = '5px';
      
      const urlLabel = document.createElement('label');
      urlLabel.textContent = 'Server URL:';
      urlLabel.style.fontSize = '14px';
      urlGroup.appendChild(urlLabel);
      
      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.value = this.url;
      urlInput.style.padding = '8px';
      urlInput.style.backgroundColor = '#3d3d3d';
      urlInput.style.color = '#e0e0e0';
      urlInput.style.border = '1px solid #555';
      urlInput.style.borderRadius = '3px';
      urlInput.style.fontSize = '14px';
      urlGroup.appendChild(urlInput);
      
      form.appendChild(urlGroup);
      
      // Create buttons
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.justifyContent = 'flex-end';
      buttonGroup.style.gap = '10px';
      buttonGroup.style.marginTop = '10px';
      
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.textContent = 'Cancel';
      cancelButton.style.padding = '8px 15px';
      cancelButton.style.backgroundColor = '#555';
      cancelButton.style.color = '#e0e0e0';
      cancelButton.style.border = 'none';
      cancelButton.style.borderRadius = '3px';
      cancelButton.style.cursor = 'pointer';
      cancelButton.style.fontSize = '14px';
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(dialogContainer);
        resolve(false);
      });
      buttonGroup.appendChild(cancelButton);
      
      const connectButton = document.createElement('button');
      connectButton.type = 'button';
      connectButton.textContent = 'Connect';
      connectButton.style.padding = '8px 15px';
      connectButton.style.backgroundColor = '#4CAF50';
      connectButton.style.color = '#fff';
      connectButton.style.border = 'none';
      connectButton.style.borderRadius = '3px';
      connectButton.style.cursor = 'pointer';
      connectButton.style.fontSize = '14px';
      connectButton.addEventListener('click', () => {
        // Get values from input fields
        const userName = userNameInput.value.trim();
        const userKey = userKeyInput.value.trim();
        const url = urlInput.value.trim();
        
        // Connect to server
        this.connect({
          userName: userName,
          userKey: userKey,
          url: url
        });
        
        // Close dialog
        document.body.removeChild(dialogContainer);
        resolve(true);
      });
      buttonGroup.appendChild(connectButton);
      
      form.appendChild(buttonGroup);
      
      dialog.appendChild(form);
      dialogContainer.appendChild(dialog);
      
      // Add dialog to body
      document.body.appendChild(dialogContainer);
      
      // Focus on username input
      userNameInput.focus();
    });
  }
}

export default SocketSideWindow;

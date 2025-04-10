/**
 * WebSocketClient.js
 * 
 * A client-side WebSocket implementation for the STAM application.
 * Handles connection management, message sending/receiving, and authentication.
 */
import { SERVERCOMMANDS } from './../../../engine/servercommands.mjs';
import { SOCKETMESSAGES } from '../components/sidewindows/SocketSideWindow.js';

class WebSocketClient {
  /**
   * Create a new WebSocket client
   * @param {Object} options - Configuration options
   * @param {string} options.url - WebSocket server URL (default: 'ws://localhost:8080')
   * @param {Function} options.onOpen - Callback when connection opens
   * @param {Function} options.onMessage - Callback when message is received
   * @param {Function} options.onClose - Callback when connection closes
   * @param {Function} options.onError - Callback when error occurs
   */
  constructor(options = {}) {
    this.socket = null;
    this.isConnected = false;
    this.loggedIn = false;
    this.tryReconnect = true;
    this.userName = '';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.messageQueue = [];
    this.lastMessageId = 0;
    this.callbacks = new Map();
    this.callbackTimeout = options.callbackTimeout || 10000; // 10 seconds timeout for callbacks
    this.root = options.root || null;
    this.handle = '';
    
    // Callbacks
    this.onMessageCallback = options.onMessage || (() => {});
    this.onCloseCallback = options.onClose || (() => {});
    this.onErrorCallback = options.onError || (() => {});
    this.onConnectedCallback = options.onConnected || (() => {});
    
    // Bind methods
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
  }

  /**
   * Connect to the WebSocket server
   * @param {Object} options - Optional configuration options
   * @param {string} options.url - WebSocket server URL (default: 'ws://localhost:1033')
   * @param {string} options.userName - User name for authentication
   * @param {boolean} options.tryReconnect - Whether to try reconnecting on disconnect
   * @returns {Promise} - Resolves when connected, rejects on error or timeout
   */
  connect(options=null) {
    if ( options ){
      this.url = options.url || 'ws://localhost:1033';
      this.userName = options.userName || '';
      if ( typeof options.tryReconnect === 'boolean' ){
        this.tryReconnect = options.tryReconnect;
      }
    }
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }
      if (!this.userName) {
        reject('User name is required');
        return;
      }    
      try {
        this.socket = new WebSocket(this.url);
        
        // Set up connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.socket.close();
            reject('TIMEOUT');
          }
        }, 5000);
        
        // Connection opened
        this.socket.addEventListener('open', (event) => {
          clearTimeout(connectionTimeout);
          this.onOpen(event);
          resolve();
        });
        
        // Listen for messages
        this.socket.addEventListener('message', this.onMessage);
        
        // Connection closed
        this.socket.addEventListener('close', (event) => {
          clearTimeout(connectionTimeout);
          this.onClose(event);
          if (!this.isConnected) {
            reject(new Error('Connection closed'));
          }
        });
        
        // Connection error
        this.socket.addEventListener('error', (error) => {
          clearTimeout(connectionTimeout);
          this.onError(error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(tryReconnect = false) {
    this.tryReconnect = tryReconnect;
    if (this.socket) {
      this.socket.close();
    }
  }

  authenticate() {
    // Send authentication message
    this.send(SERVERCOMMANDS.CONNECT, {
      userName: this.userName,
      debug: this.root.debug
    });
  }
     
  /**
   * Handle WebSocket open event
   * @param {Event} event - WebSocket open event
   * @private
   */
  onOpen(event) {
    console.log('WebSocket connection established');
    this.isConnected = true;
    this.loggedIn = false;
    this.reconnectAttempts = 0;
    
    // Process any queued messages
    this.processQueue();    
  }
  
  /**
   * Handle WebSocket message event
   * @param {MessageEvent} event - WebSocket message event
   * @private
   */
  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      // Handle authentication response
      if (message.responseTo === SERVERCOMMANDS.CONNECT) {
        if (!message.error) {
          this.handle=message.parameters.handle;
          this.loggedIn = true;
        } else {
          this.disconnect(message.error);
        }
      } 
      
      // Handle response to a request
      if (message.callbackId && this.callbacks.has(message.callbackId)) {
        const { resolve, reject, timeout } = this.callbacks.get(message.callbackId);
        clearTimeout(timeout);
        this.callbacks.delete(message.callbackId);
        if (message.parameters.error) {
          reject(message);
        } else {
          resolve(message);
        }
        return;
      }
      // Call the user callback
      this.onMessageCallback(message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
  
  /**
   * Handle WebSocket close event
   * @param {CloseEvent} event - WebSocket close event
   * @private
   */
  onClose(event) {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.isConnected = false;
    this.socket = null;
    
    // Reject all pending requests
    this.callbacks.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject('Connection closed');
    });
    this.callbacks.clear();
    
    // Attempt to reconnect if not a clean close
    if (this.tryReconnect) {
      this.attemptReconnect();
    }
    
    // Call the user callback
    this.onCloseCallback(event);
  }
  
  /**
   * Handle WebSocket error event
   * @param {Event} error - WebSocket error event
   * @private
   */
  onError(error) {
    console.error('WebSocket error:', error);
    
    // Call the user callback
    this.onErrorCallback(error);
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   * @private
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
  
  /**
   * Send a message to the WebSocket server
   * @param {Object} message - Message to send
   * @returns {boolean} - True if sent or queued, false if failed
   */
  send(command,parameters) {
    const message = {
      id: this.root.utilities.getUniqueIdentifier( {}, 'message', 0, '', 3, 3 ),
      handle: this.handle,
      command: command,
      parameters: parameters
    };
    
    if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    } else {
      // Queue the message for later
      this.messageQueue.push(message);
      return true;
    }
  }
  
  /**
   * Send a request and wait for a response
   * @param {Object} message - Message to send
   * @returns {Promise} - Resolves with the response, rejects on error or timeout
   */
  requestResponse(command, parameters) {
    return new Promise((resolve, reject) => {
      const message = {
        id: this.root.utilities.getUniqueIdentifier( {}, 'message', 0, '', 3, 3 ),
        handle: this.handle,
        command: command,
        parameters: parameters
      };
        
      // Set up timeout for this request
      const timeout = setTimeout(() => {
        if (this.callbacks.has(message.id)) {
          this.callbacks.delete(message.id);
          reject(new Error('Request timeout'));
        }
      }, 1000*1000 /*this.callbackTimeout*/);
      
      // Store the promise callbacks
      this.callbacks.set(message.id, { resolve, reject, timeout });

      // Send the message
      if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify(message));
          return true;
        } catch (error) {
          console.error('Error sending message:', error);
          return false;
        }
      } else {
        // Queue the message for later
        this.messageQueue.push(message);
        return true;
      }
    });
  }
  
  /**
   * Process the message queue
   * @private
   */
  processQueue() {
    if (this.messageQueue.length > 0 && this.isConnected) {
      console.log(`Processing ${this.messageQueue.length} queued messages`);
      
      const queue = [...this.messageQueue];
      this.messageQueue = [];
      
      queue.forEach(message => {
        this.send(message);
      });
    }
  }  

  /**
   * Check if the client is connected
   * @returns {boolean} - True if connected, false otherwise
   */
  isConnected() {
    return this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get the connection state
   * @returns {string} - Connection state: 'connected', 'connecting', 'disconnected', or 'error'
   */
  getState() {
    if (!this.socket) {
      return 'disconnected';
    }
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return 'disconnected';
    }
  }
}

export default WebSocketClient;

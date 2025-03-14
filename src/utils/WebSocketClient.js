/**
 * WebSocketClient.js
 * 
 * A client-side WebSocket implementation for the PCOS application.
 * Handles connection management, message sending/receiving, and authentication.
 */

class WebSocketClient {
  /**
   * Create a new WebSocket client
   * @param {Object} options - Configuration options
   * @param {string} options.url - WebSocket server URL (default: 'ws://localhost:8080')
   * @param {string} options.userKey - User authentication key
   * @param {Function} options.onOpen - Callback when connection opens
   * @param {Function} options.onMessage - Callback when message is received
   * @param {Function} options.onClose - Callback when connection closes
   * @param {Function} options.onError - Callback when error occurs
   */
  constructor(options = {}) {
    this.url = options.url || 'ws://localhost:8080';
    this.userKey = options.userKey || '';
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.messageQueue = [];
    this.lastMessageId = 0;
    this.pendingRequests = new Map();
    this.requestTimeout = options.requestTimeout || 10000; // 10 seconds timeout for requests
    
    // Callbacks
    this.onOpenCallback = options.onOpen || (() => {});
    this.onMessageCallback = options.onMessage || (() => {});
    this.onCloseCallback = options.onClose || (() => {});
    this.onErrorCallback = options.onError || (() => {});
    
    // Bind methods
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
  }
  
  /**
   * Connect to the WebSocket server
   * @param {string} userKey - Optional user key to override the one provided in constructor
   * @returns {Promise} - Resolves when connected, rejects on error or timeout
   */
  connect(userKey = null) {
    if (userKey) {
      this.userKey = userKey;
    }
    
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }
      
      try {
        this.socket = new WebSocket(this.url);
        
        // Set up connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.socket.close();
            reject(new Error('Connection timeout'));
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
  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
  
  /**
   * Handle WebSocket open event
   * @param {Event} event - WebSocket open event
   * @private
   */
  onOpen(event) {
    console.log('WebSocket connection established');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Send authentication message
    this.send({
      type: 'auth',
      userKey: this.userKey
    });
    
    // Process any queued messages
    this.processQueue();
    
    // Call the user callback
    this.onOpenCallback(event);
  }
  
  /**
   * Handle WebSocket message event
   * @param {MessageEvent} event - WebSocket message event
   * @private
   */
  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      
      // Handle authentication response
      if (message.type === 'auth_response') {
        if (message.success) {
          console.log('Authentication successful');
        } else {
          console.error('Authentication failed:', message.error);
          this.disconnect();
        }
      }
      
      // Handle response to a request
      if (message.id && this.pendingRequests.has(message.id)) {
        const { resolve, reject, timeout } = this.pendingRequests.get(message.id);
        clearTimeout(timeout);
        this.pendingRequests.delete(message.id);
        
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message);
        }
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
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.pendingRequests.clear();
    
    // Attempt to reconnect if not a clean close
    if (event.code !== 1000 && event.code !== 1001) {
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
  send(message) {
    if (!message.id) {
      message.id = this.generateMessageId();
    }
    
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
  request(message) {
    return new Promise((resolve, reject) => {
      // Generate a unique ID for this request
      const id = this.generateMessageId();
      message.id = id;
      
      // Set up timeout for this request
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, this.requestTimeout);
      
      // Store the promise callbacks
      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      // Send the message
      if (!this.send(message)) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(new Error('Failed to send request'));
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
   * Generate a unique message ID
   * @returns {string} - Unique message ID
   * @private
   */
  generateMessageId() {
    this.lastMessageId++;
    return `msg_${Date.now()}_${this.lastMessageId}`;
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

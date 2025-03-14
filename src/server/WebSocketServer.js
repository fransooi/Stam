/**
 * WebSocketServer.js
 * 
 * A server-side WebSocket implementation for the PCOS application.
 * Handles client connections, authentication, and file system operations.
 * 
 * NOTE: This is a template file and not intended to be used directly in the PCOS project.
 * It should be integrated into your existing AWI WebSocket server architecture.
 */

const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');

class WebSocketServer {
  /**
   * Create a new WebSocket server
   * @param {Object} options - Configuration options
   * @param {number} options.port - Port to listen on (default: 8080)
   * @param {string} options.userKey - User authentication key (default: 'admin')
   * @param {string} options.projectsPath - Path to projects directory (default: './projects')
   */
  constructor(options = {}) {
    this.port = options.port || 8080;
    this.userKey = options.userKey || 'admin';
    this.projectsPath = options.projectsPath || './projects';
    this.server = null;
    this.clients = new Map(); // Map of client connections
    
    // Bind methods
    this.handleConnection = this.handleConnection.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }
  
  /**
   * Start the WebSocket server
   * @returns {Promise} - Resolves when server is started
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        // Create WebSocket server
        this.server = new WebSocket.Server({ port: this.port });
        
        // Set up event handlers
        this.server.on('connection', this.handleConnection);
        this.server.on('error', (error) => {
          console.error('Server error:', error);
          reject(error);
        });
        
        console.log(`WebSocket server started on port ${this.port}`);
        resolve();
      } catch (error) {
        console.error('Failed to start server:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Stop the WebSocket server
   */
  stop() {
    if (this.server) {
      // Close all client connections
      this.clients.forEach((client) => {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.close(1000, 'Server shutting down');
        }
      });
      
      // Close the server
      this.server.close();
      this.server = null;
      this.clients.clear();
      
      console.log('WebSocket server stopped');
    }
  }
  
  /**
   * Handle new WebSocket connection
   * @param {WebSocket} socket - WebSocket connection
   * @param {Object} request - HTTP request
   */
  handleConnection(socket, request) {
    const clientId = this.generateClientId();
    console.log(`Client connected: ${clientId}`);
    
    // Store client information
    this.clients.set(clientId, {
      socket,
      authenticated: false,
      lastActivity: Date.now()
    });
    
    // Set up event handlers for this connection
    socket.on('message', (data) => this.handleMessage(clientId, data));
    socket.on('close', (code, reason) => this.handleClose(clientId, code, reason));
    socket.on('error', (error) => this.handleError(clientId, error));
    
    // Set up authentication timeout
    setTimeout(() => {
      const client = this.clients.get(clientId);
      if (client && !client.authenticated) {
        console.log(`Client ${clientId} authentication timeout`);
        socket.close(4000, 'Authentication timeout');
      }
    }, 10000); // 10 seconds timeout for authentication
  }
  
  /**
   * Handle WebSocket message
   * @param {string} clientId - Client ID
   * @param {Buffer|ArrayBuffer|Buffer[]} data - Message data
   */
  async handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }
    
    // Update last activity timestamp
    client.lastActivity = Date.now();
    
    try {
      // Parse the message
      const message = JSON.parse(data.toString());
      console.log(`Received message from ${clientId}:`, message);
      
      // Handle authentication
      if (message.type === 'auth') {
        this.handleAuth(clientId, message);
        return;
      }
      
      // Check if client is authenticated
      if (!client.authenticated) {
        this.sendError(clientId, message.id, 'Not authenticated');
        return;
      }
      
      // Handle different message types
      switch (message.type) {
        case 'list_projects':
          await this.handleListProjects(clientId, message);
          break;
          
        case 'create_project':
          await this.handleCreateProject(clientId, message);
          break;
          
        case 'open_project':
          await this.handleOpenProject(clientId, message);
          break;
          
        case 'list_files':
          await this.handleListFiles(clientId, message);
          break;
          
        case 'read_file':
          await this.handleReadFile(clientId, message);
          break;
          
        case 'write_file':
          await this.handleWriteFile(clientId, message);
          break;
          
        case 'delete_file':
          await this.handleDeleteFile(clientId, message);
          break;
          
        case 'ping':
          this.handlePing(clientId, message);
          break;
          
        default:
          this.sendError(clientId, message.id, `Unknown message type: ${message.type}`);
          break;
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
      this.sendError(clientId, null, 'Invalid message format');
    }
  }
  
  /**
   * Handle WebSocket close event
   * @param {string} clientId - Client ID
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   */
  handleClose(clientId, code, reason) {
    console.log(`Client disconnected: ${clientId} (${code} ${reason})`);
    this.clients.delete(clientId);
  }
  
  /**
   * Handle WebSocket error event
   * @param {string} clientId - Client ID
   * @param {Error} error - Error object
   */
  handleError(clientId, error) {
    console.error(`Client error: ${clientId}`, error);
  }
  
  /**
   * Handle authentication message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  handleAuth(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }
    
    // Check user key
    if (message.userKey === this.userKey) {
      client.authenticated = true;
      console.log(`Client ${clientId} authenticated`);
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'auth_response',
        success: true
      });
    } else {
      console.log(`Client ${clientId} authentication failed`);
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'auth_response',
        success: false,
        error: 'Invalid user key'
      });
      
      // Close the connection after a short delay
      setTimeout(() => {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.close(4001, 'Authentication failed');
        }
      }, 1000);
    }
  }
  
  /**
   * Handle ping message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  handlePing(clientId, message) {
    this.sendToClient(clientId, {
      id: message.id,
      type: 'pong',
      timestamp: Date.now()
    });
  }
  
  /**
   * Handle list projects message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  async handleListProjects(clientId, message) {
    try {
      // Ensure projects directory exists
      await this.ensureDirectory(this.projectsPath);
      
      // Get list of directories in projects path
      const entries = await fs.readdir(this.projectsPath, { withFileTypes: true });
      const projects = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'list_projects_response',
        projects
      });
    } catch (error) {
      console.error('Error listing projects:', error);
      this.sendError(clientId, message.id, 'Failed to list projects');
    }
  }
  
  /**
   * Handle create project message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  async handleCreateProject(clientId, message) {
    try {
      if (!message.projectName) {
        this.sendError(clientId, message.id, 'Project name is required');
        return;
      }
      
      // Validate project name
      if (!/^[a-zA-Z0-9_-]+$/.test(message.projectName)) {
        this.sendError(clientId, message.id, 'Invalid project name (use only letters, numbers, underscores, and hyphens)');
        return;
      }
      
      // Create project directory
      const projectPath = path.join(this.projectsPath, message.projectName);
      
      // Check if project already exists
      try {
        const stat = await fs.stat(projectPath);
        if (stat.isDirectory()) {
          this.sendError(clientId, message.id, 'Project already exists');
          return;
        }
      } catch (error) {
        // Directory doesn't exist, which is what we want
      }
      
      // Create the project directory
      await this.ensureDirectory(projectPath);
      
      // Create initial project structure
      if (message.template) {
        // TODO: Implement project templates
      }
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'create_project_response',
        success: true,
        projectName: message.projectName
      });
    } catch (error) {
      console.error('Error creating project:', error);
      this.sendError(clientId, message.id, 'Failed to create project');
    }
  }
  
  /**
   * Handle open project message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  async handleOpenProject(clientId, message) {
    try {
      if (!message.projectName) {
        this.sendError(clientId, message.id, 'Project name is required');
        return;
      }
      
      // Get project path
      const projectPath = path.join(this.projectsPath, message.projectName);
      
      // Check if project exists
      try {
        const stat = await fs.stat(projectPath);
        if (!stat.isDirectory()) {
          this.sendError(clientId, message.id, 'Project is not a directory');
          return;
        }
      } catch (error) {
        this.sendError(clientId, message.id, 'Project does not exist');
        return;
      }
      
      // Update client with current project
      const client = this.clients.get(clientId);
      if (client) {
        client.currentProject = message.projectName;
      }
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'open_project_response',
        success: true,
        projectName: message.projectName
      });
    } catch (error) {
      console.error('Error opening project:', error);
      this.sendError(clientId, message.id, 'Failed to open project');
    }
  }
  
  /**
   * Handle list files message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  async handleListFiles(clientId, message) {
    try {
      const client = this.clients.get(clientId);
      if (!client || !client.currentProject) {
        this.sendError(clientId, message.id, 'No project is open');
        return;
      }
      
      const projectPath = path.join(this.projectsPath, client.currentProject);
      const directory = message.directory || '';
      
      // Normalize and validate the directory path
      const dirPath = path.normalize(path.join(projectPath, directory));
      
      // Ensure the path is within the project directory
      if (!dirPath.startsWith(projectPath)) {
        this.sendError(clientId, message.id, 'Invalid directory path');
        return;
      }
      
      // Get list of files and directories
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        path: path.join(directory, entry.name).replace(/\\/g, '/') // Normalize path separators
      }));
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'list_files_response',
        directory,
        files
      });
    } catch (error) {
      console.error('Error listing files:', error);
      this.sendError(clientId, message.id, 'Failed to list files');
    }
  }
  
  /**
   * Handle read file message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  async handleReadFile(clientId, message) {
    try {
      const client = this.clients.get(clientId);
      if (!client || !client.currentProject) {
        this.sendError(clientId, message.id, 'No project is open');
        return;
      }
      
      if (!message.filePath) {
        this.sendError(clientId, message.id, 'File path is required');
        return;
      }
      
      const projectPath = path.join(this.projectsPath, client.currentProject);
      
      // Normalize and validate the file path
      const filePath = path.normalize(path.join(projectPath, message.filePath));
      
      // Ensure the path is within the project directory
      if (!filePath.startsWith(projectPath)) {
        this.sendError(clientId, message.id, 'Invalid file path');
        return;
      }
      
      // Read the file
      const content = await fs.readFile(filePath, 'utf8');
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'read_file_response',
        filePath: message.filePath,
        content
      });
    } catch (error) {
      console.error('Error reading file:', error);
      this.sendError(clientId, message.id, 'Failed to read file');
    }
  }
  
  /**
   * Handle write file message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  async handleWriteFile(clientId, message) {
    try {
      const client = this.clients.get(clientId);
      if (!client || !client.currentProject) {
        this.sendError(clientId, message.id, 'No project is open');
        return;
      }
      
      if (!message.filePath) {
        this.sendError(clientId, message.id, 'File path is required');
        return;
      }
      
      if (message.content === undefined) {
        this.sendError(clientId, message.id, 'File content is required');
        return;
      }
      
      const projectPath = path.join(this.projectsPath, client.currentProject);
      
      // Normalize and validate the file path
      const filePath = path.normalize(path.join(projectPath, message.filePath));
      
      // Ensure the path is within the project directory
      if (!filePath.startsWith(projectPath)) {
        this.sendError(clientId, message.id, 'Invalid file path');
        return;
      }
      
      // Ensure the directory exists
      const fileDir = path.dirname(filePath);
      await this.ensureDirectory(fileDir);
      
      // Write the file
      await fs.writeFile(filePath, message.content, 'utf8');
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'write_file_response',
        filePath: message.filePath,
        success: true
      });
    } catch (error) {
      console.error('Error writing file:', error);
      this.sendError(clientId, message.id, 'Failed to write file');
    }
  }
  
  /**
   * Handle delete file message
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  async handleDeleteFile(clientId, message) {
    try {
      const client = this.clients.get(clientId);
      if (!client || !client.currentProject) {
        this.sendError(clientId, message.id, 'No project is open');
        return;
      }
      
      if (!message.filePath) {
        this.sendError(clientId, message.id, 'File path is required');
        return;
      }
      
      const projectPath = path.join(this.projectsPath, client.currentProject);
      
      // Normalize and validate the file path
      const filePath = path.normalize(path.join(projectPath, message.filePath));
      
      // Ensure the path is within the project directory
      if (!filePath.startsWith(projectPath)) {
        this.sendError(clientId, message.id, 'Invalid file path');
        return;
      }
      
      // Check if it's a file or directory
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        // Delete directory recursively
        await this.removeDirectory(filePath);
      } else {
        // Delete file
        await fs.unlink(filePath);
      }
      
      this.sendToClient(clientId, {
        id: message.id,
        type: 'delete_file_response',
        filePath: message.filePath,
        success: true
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      this.sendError(clientId, message.id, 'Failed to delete file');
    }
  }
  
  /**
   * Send a message to a client
   * @param {string} clientId - Client ID
   * @param {Object} message - Message to send
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      const messageStr = JSON.stringify(message);
      client.socket.send(messageStr);
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
    }
  }
  
  /**
   * Send an error message to a client
   * @param {string} clientId - Client ID
   * @param {string} requestId - Request ID
   * @param {string} errorMessage - Error message
   */
  sendError(clientId, requestId, errorMessage) {
    this.sendToClient(clientId, {
      id: requestId,
      type: 'error',
      error: errorMessage
    });
  }
  
  /**
   * Generate a unique client ID
   * @returns {string} - Unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Ensure a directory exists
   * @param {string} dirPath - Directory path
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
  
  /**
   * Remove a directory recursively
   * @param {string} dirPath - Directory path
   */
  async removeDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      // Process all entries in parallel
      await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await this.removeDirectory(fullPath);
        } else {
          await fs.unlink(fullPath);
        }
      }));
      
      // Remove the directory itself
      await fs.rmdir(dirPath);
    } catch (error) {
      console.error(`Error removing directory ${dirPath}:`, error);
      throw error;
    }
  }
}

module.exports = WebSocketServer;

// Example usage:
/*
const server = new WebSocketServer({
  port: 8080,
  userKey: 'your_secret_key',
  projectsPath: './projects'
});

server.start()
  .then(() => {
    console.log('Server started successfully');
  })
  .catch(error => {
    console.error('Failed to start server:', error);
  });

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.stop();
  process.exit(0);
});
*/

/**
 * FileSystem.js - Remote file system access
 * 
 * This class provides utility functions that can be used across the application.
 * It provides remote file system access through the socket connection to the server.  
 * Can be replaced by direct access to the file system if necessary.
 */

import { SERVERCOMMANDS } from '../../../engine/servercommands.mjs';
import { SOCKETMESSAGES } from '../components/sidewindows/SocketSideWindow.js';
import BaseComponent from './BaseComponent.js';

export default class FileSystem extends BaseComponent {
    constructor(parentId,containerId) {
      super('FileSystem',parentId,containerId);
      this.messageMap[SOCKETMESSAGES.CONNECTED] = this.handleConnected;
      this.messageMap[SOCKETMESSAGES.DISCONNECTED] = this.handleDisconnected;
      this.isConnected = false;
      // Poke all server commands as functions.
      var source = 'console.log(this);\n';
      for(var c in SERVERCOMMANDS)
      {
        this.messageMap[SERVERCOMMANDS[c]] = this.handleServerCommand;
        source = source + '\nthis["' + SERVERCOMMANDS[c] + '"] = function(parameters) {\n \
        return this.handleServerCommand("' + SERVERCOMMANDS[c] + '", parameters);\n \
        }.bind(this)\n';
      }
      eval(source);
    }
    async init(options = {}) {
      await super.init(options);
    }
    async destroy() {
      await super.destroy();
    }

    handleServerCommand(command, parameters) {
      if(this.isConnected)
        return this.sendRequestTo(this.root.socket.componentId,SOCKETMESSAGES.REQUEST_RESPONSE, { command: command, parameters: parameters });
      return new Promise((resolve, reject) => {
        reject('Not connected');
      });          
    }

    handleConnected() {
      this.isConnected = true;
    }

    handleDisconnected() {
      this.isConnected = false;
    }
    
    // Object not rendered
    //////////////////////////////////////////////////////////////////////////////
    async render(containerId)
    {
      return null;
    }
  }
/**
 * Utilities.js - Helper functions for PCOS application
 * 
 * This class provides utility functions that can be used across the application.
 * It is instantiated in PCOSApp and accessible through the component tree.
 */

export default class Utilities {
  constructor() {
    console.log('Utilities initialized');
  }

  /**
   * Deep copy an object recursively
   * 
   * @param {Object} source - The source object to copy
   * @returns {Object} - A new object with the same properties
   */
  copyObject(source) {
    // Handle null or undefined
    if (source === null || source === undefined) {
      return source;
    }

    // Handle primitive types (string, number, boolean)
    if (typeof source !== 'object') {
      return source;
    }

    // Handle Date objects
    if (source instanceof Date) {
      return new Date(source.getTime());
    }

    // Handle Array objects
    if (Array.isArray(source)) {
      return source.map(item => this.copyObject(item));
    }

    // Handle regular objects
    const copy = {};
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        copy[key] = this.copyObject(source[key]);
      }
    }
    
    return copy;
  }

  /**
   * Format a date to a string
   * 
   * @param {Date} date - The date to format
   * @param {string} format - The format to use (default: 'YYYY-MM-DD HH:mm:ss')
   * @returns {string} - The formatted date
   */
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) {
      return '';
    }

    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Generate a random ID
   * 
   * @param {number} length - The length of the ID (default: 8)
   * @returns {string} - A random ID
   */
  generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return id;
  }

  /**
   * Generate a unique identifier
   * 
   * @param {Object} toCheck - Object to check for existing IDs
   * @param {string} root - Root of the ID (default: '')
   * @param {number} count - Counter for the ID (default: 0)
   * @param {string} timeString - Time string format (default: '')
   * @param {number} nNumbers - Number of random numbers (default: 3)
   * @param {number} nLetters - Number of random letters (default: 3)
   * @returns {string} - A unique ID
   */
  getUniqueIdentifier( toCheck = {}, root = '', count = 0, timeString = '', nNumbers = 3, nLetters = 3 )
	{
		var id;
		do
		{
			id = root + ( root ? '_' : '' ) + count;
			if ( timeString )
			{
				var currentdate = new Date();
				var time = this.format( timeString,
				{
					day: currentdate.getDate(),
					month: currentdate.getMonth(),
					year:  currentdate.getFullYear(),
					hour:  currentdate.getHours(),
					minute:  currentdate.getMinutes(),
					second: currentdate.getSeconds(),
					milli: currentdate.getMilliseconds(),
				} );
				if ( time )
					id += '_' + time;
			}
			var numbers = '';
			for ( var n = 0; n < nNumbers; n++ )
				numbers += String.fromCharCode( 48 + Math.floor( Math.random() * 10 ) );
			id += '_' + numbers;
			var letters = '';
			for ( var n = 0; n < nLetters; n++ )
				letters += String.fromCharCode( 65 + Math.floor( Math.random() * 26 ) );
			id += letters;
		} while( toCheck[ id ] );
		return id;
	}

  /**
   * Debounce a function
   * 
   * @param {Function} func - The function to debounce
   * @param {number} wait - The debounce time in milliseconds
   * @returns {Function} - The debounced function
   */
  debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Check if an object is empty
   * 
   * @param {Object} obj - The object to check
   * @returns {boolean} - True if the object is empty
   */
  isEmptyObject(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  /**
     * Save data to localStorage
     * @param {string} name - Name of the data
     * @param {string} data - Data to save
     * @returns {Promise<boolean>} - Promise that resolves with success status
     */
  saveStorage(name, data) {     
    try {
        localStorage.setItem(name, data);
        return true;
      }
    catch(error) {
        console.error('Error saving :' + name, error);
        return false;
      };
  }

  /**
   * Load a saved layout
   */
  loadStorage(name) {
    try {
      const data = localStorage.getItem(name);
      if (!data) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sleep for a specified amount of time
   * 
   * @param {number} ms - The time to sleep in milliseconds
   * @returns {Promise<void>} - A promise that resolves after the specified time
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  } 
}

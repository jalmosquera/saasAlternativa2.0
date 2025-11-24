/**
 * WebSocket Service for real-time order notifications
 *
 * This service manages WebSocket connections to the backend for receiving
 * real-time order notifications. It handles authentication via JWT tokens,
 * automatic reconnection, and event broadcasting to subscribers.
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;
    this.token = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
    this.listeners = new Map(); // Event listeners
    this.connectionListeners = []; // Connection status listeners
    this.manualDisconnect = false;
    this.heartbeatInterval = null;
  }

  /**
   * Connect to the WebSocket server
   * @param {string} token - JWT access token for authentication
   */
  connect(token) {
    if (this.isConnected) {
      return;
    }

    if (!token) {
      console.error('Cannot connect to WebSocket: No token provided');
      return;
    }

    this.token = token;
    this.manualDisconnect = false;

    // Get WebSocket URL from environment or use default
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    this.url = `${wsBaseUrl}/ws/orders/?token=${token}`;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket connection opened
   */
  handleOpen() {
    console.log('[WebSocketService] WebSocket connection opened successfully');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyConnectionChange(true);

    // Start heartbeat to keep connection alive
    this.startHeartbeat();
  }

  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event - WebSocket message event
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('[WebSocketService] Received message:', message);

      // Handle connection confirmation
      if (message.type === 'connection_established') {
        console.log('[WebSocketService] Connection established for user:', message.username, 'role:', message.role);
        return;
      }

      // Handle pong response
      if (message.type === 'pong') {
        return;
      }

      // Notify all listeners for this message type
      const eventType = message.type || 'message';
      console.log('[WebSocketService] Event type:', eventType, 'Listeners count:', this.listeners.get(eventType)?.size || 0);
      if (this.listeners.has(eventType)) {
        this.listeners.get(eventType).forEach(callback => {
          try {
            console.log('[WebSocketService] Calling listener for event:', eventType);
            callback(message);
          } catch (error) {
            console.error('Error in WebSocket listener:', error);
          }
        });
      }

      // Also notify generic 'message' listeners
      if (eventType !== 'message' && this.listeners.has('message')) {
        this.listeners.get('message').forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in WebSocket message listener:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket errors
   * @param {Event} error - WebSocket error event
   */
  handleError(error) {
    console.error('WebSocket error:', error);
  }

  /**
   * Handle WebSocket connection closed
   * @param {CloseEvent} event - WebSocket close event
   */
  handleClose(event) {
    this.isConnected = false;
    this.stopHeartbeat();
    this.notifyConnectionChange(false);

    // Attempt to reconnect unless manually disconnected
    if (!this.manualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached');
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    setTimeout(() => {
      if (!this.manualDisconnect && !this.isConnected && this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    // Send ping every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          timestamp: new Date().toISOString()
        });
      }
    }, 30000);
  }

  /**
   * Stop heartbeat interval
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send a message through the WebSocket
   * @param {Object} message - Message to send
   */
  send(message) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    this.manualDisconnect = true;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.notifyConnectionChange(false);
  }

  /**
   * Add an event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} callback - Callback function to execute when event is received
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    console.log('[WebSocketService] Listener added for event:', eventType, 'Total listeners:', this.listeners.get(eventType).size);

    // Return unsubscribe function
    return () => {
      this.off(eventType, callback);
    };
  }

  /**
   * Remove an event listener
   * @param {string} eventType - Type of event
   * @param {Function} callback - Callback function to remove
   */
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
      if (this.listeners.get(eventType).size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Add a connection status listener
   * @param {Function} callback - Callback function (receives boolean isConnected)
   */
  onConnectionChange(callback) {
    this.connectionListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all connection status listeners
   * @param {boolean} isConnected - Current connection status
   */
  notifyConnectionChange(isConnected) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  /**
   * Check if WebSocket is currently connected
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Reset reconnection attempts counter
   */
  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}

// Create and export a singleton instance
const websocketService = new WebSocketService();

export default websocketService;

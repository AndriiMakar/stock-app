import { io, Socket } from 'socket.io-client';

// Define the server URL
const SERVER_URL = 'http://localhost:3001'; // Replace with your server's URL and port

// Initialize the Socket.IO client
const socket: Socket = io(SERVER_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5, // Number of reconnection attempts before giving up
  timeout: 5000, // Connection timeout in milliseconds
});

/**
 * Exports the Socket.IO client instance for use in other parts of the application
 */
export default socket;

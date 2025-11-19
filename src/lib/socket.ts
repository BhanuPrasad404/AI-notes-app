// lib/socket.ts - CREATE THIS FILE
import { io, Socket } from 'socket.io-client';
import { auth } from './auth';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = auth.getToken();
    if (!token) return;

    const isProduction = window.location.hostname !== 'localhost';
    const SOCKET_URL = isProduction
      ? 'https://ai-notes-backend-h185.onrender.com'
      : 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log(' Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error(' Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Helper method to check if connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(server: HTTPServer): SocketIOServer {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  ioInstance = new SocketIOServer(server, {
    cors: {
      origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join role room or site room
    socket.on('join_role', (role: string) => {
      socket.join(`role:${role}`);
      console.log(`[Socket.io] ${socket.id} joined role:${role}`);
    });

    socket.on('join_site', (siteKey: string) => {
      socket.join(`site:${siteKey}`);
      console.log(`[Socket.io] ${socket.id} joined site:${siteKey}`);
    });

    socket.on('join_driver', (driverKey: string) => {
      socket.join(`driver:${driverKey}`);
      console.log(`[Socket.io] ${socket.id} joined driver:${driverKey}`);
    });

    socket.on('join_supplier', (supplierKey: string) => {
      socket.join(`supplier:${supplierKey}`);
      console.log(`[Socket.io] ${socket.id} joined supplier:${supplierKey}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized!');
  }
  return ioInstance;
}

export function broadcastEvent(eventName: string, payload: any, rooms?: string[]): void {
  if (!ioInstance) return;

  if (rooms && rooms.length > 0) {
    let target = ioInstance.to(rooms[0]);
    for (let i = 1; i < rooms.length; i++) {
      target = target.to(rooms[i]);
    }
    target.emit(eventName, payload);
  } else {
    ioInstance.emit(eventName, payload);
  }
}


import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 A user connected:', socket.id);

    // Join order tracking room
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`👤 User joined order room: order_${orderId}`);
    });

    // Join driver room
    socket.on('join_driver', (driverId) => {
      socket.join(`driver_${driverId}`);
      console.log(`🚛 Driver joined room: driver_${driverId}`);
    });

    // Update driver location
    socket.on('update_location', (data) => {
      const { driverId, latitude, longitude } = data;
      // Broadcast to all users tracking orders assigned to this driver
      io.to(`driver_${driverId}`).emit('location_updated', { latitude, longitude });
      console.log(`📍 Driver ${driverId} location updated: ${latitude}, ${longitude}`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

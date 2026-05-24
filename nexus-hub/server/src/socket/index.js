const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: user ${userId}`);

    // Join user's private room
    socket.join(userId);

    // Client can subscribe to specific workflow events
    socket.on('workflow:subscribe', (workflowId) => {
      socket.join(`workflow:${workflowId}`);
    });

    socket.on('workflow:unsubscribe', (workflowId) => {
      socket.leave(`workflow:${workflowId}`);
    });

    // Ping/pong for connection health
    socket.on('ping', () => socket.emit('pong', { ts: Date.now() }));

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: user ${userId}`);
    });
  });
};

// server/collab-node/index.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3001;

let connectedClients = 0;

// Serve a test route
app.get('/', (req, res) => {
  res.send('Collaboration Node is running');
});

// WebSocket logic
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Client connected (${connectedClients} total)`);

  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`Client disconnected (${connectedClients} left)`);
  });

  // Simple echo test
  socket.on('message', (data) => {
    io.emit('message', data);
  });
});

// Monitoring endpoint
app.get('/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuLoad = os.loadavg()[0]; // 1-min avg
  res.json({
    clients: connectedClients,
    memoryMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
    cpuLoad,
    timestamp: new Date()
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Collaboration Node running on port ${PORT}`);
});

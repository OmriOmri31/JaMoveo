// server/index.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Allow requests from frontend
app.use(cors());
app.use(express.json());

// Initialize Socket.io on the server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // React frontend
        methods: ["GET", "POST"]
    }
});

// Test route (to check if Express is working)
app.get('/', (req, res) => {
    res.send('Hello from Express + Socket.io server!');
});

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

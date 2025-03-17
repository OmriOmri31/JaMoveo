// server/index.js

require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import User model

// Initialize Express and create HTTP server
const app = express();
const server = http.createServer(app);

// Allow requests from frontend
app.use(cors());
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // React frontend
        methods: ["GET", "POST"]
    }
});

// ------------------- MongoDB Connection ------------------- //
const MONGO_URI = process.env.MONGO_URI; // Read from .env file

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ------------------- Routes ------------------- //

// Test API route
app.get('/', (req, res) => {
    res.send('Hello from Express + Socket.io server!');
});

// Register Route (POST /register)
app.post('/register', async (req, res) => {
    try {
        const { nickname, password, instrument } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ nickname });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        const newUser = new User({ nickname, password: hashedPassword, instrument });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login Route (POST /login)
app.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body;

        // Find user by nickname
        const user = await User.findOne({ nickname });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, nickname: user.nickname },
            process.env.JWT_SECRET, // Secret key from .env
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// ------------------- Socket.io ------------------- //
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// ------------------- Start Server ------------------- //
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

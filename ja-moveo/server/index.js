require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import User model
const { getSongResults } = require("./utils/ResultsPage");
const { extractChords, extractLyrics } = require("./utils/ChordsExtraction");

// Initialize Express and create HTTP server
const app = express();
const server = http.createServer(app);

// Allow requests from frontend
app.use(cors());
app.use(express.json());

const Session = require('./models/Session');

// Endpoint to check if a session exists
app.get('/session/:code', async (req, res) => {
    try {
        const session = await Session.findOne({ code: req.params.code });
        if (session) res.json({ exists: true });
        else res.status(404).json({ message: "Session doesn't exist" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Endpoint for admin to create a session
app.post('/create-session', async (req, res) => {
    try {
        const code = Math.floor(10000 + Math.random() * 90000).toString(); // Generate 5-digit code
        const newSession = new Session({ code });
        await newSession.save();
        res.status(201).json({ code });
    } catch (error) {
        res.status(500).json({ message: "Error creating session", error });
    }
});

app.post('/extract', async (req, res) => {
    try {
        const { url, instrument } = req.body;
        const chordsText = await extractChords(url);
        // If the user is a Vocal, extract and return only the lyrics.
        if (instrument === "Vocals") {
            const lyricsText = await extractLyrics(chordsText);
            res.json({ chords: lyricsText });
        } else {
            res.json({ chords: chordsText });
        }
    } catch (error) {
        res.status(500).json({ message: "Error extracting chords", error });
    }
});

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.REACT_APP_SERVICE_ONE_URL, // React frontend
        methods: ["GET", "POST"]
    }
});

const lobbyUsers = {};
const adminForRoom = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinLobby', ({ room, user, isAdmin }) => {
        socket.join(room);
        if (!lobbyUsers[room]) lobbyUsers[room] = [];
        // Only add if not already present
        if (!lobbyUsers[room].find(u => u.id === socket.id)) {
            lobbyUsers[room].push({ id: socket.id, name: user });
        }
        // Record admin socket ID if this user is admin
        if (isAdmin) {
            adminForRoom[room] = socket.id;
        }
        io.in(room).emit('updateUsers', lobbyUsers[room]);
    });

    // When admin navigates to live, they can signal a redirection
    socket.on("redirectLive", ({ room, href }) => {
        socket.to(room).emit("redirectLive", { href });
    });

    socket.on('redirectMain', ({ room, code }) => {
        // Send the redirect instruction to all sockets in "Main/<code>" except the sender
        io.in(room).emit('redirectMain', { code });
    });


    // When admin explicitly closes the session
    socket.on('closeSession', async ({ room }) => {
        if (adminForRoom[room] === socket.id) {
            io.in(room).emit('sessionClosed');
            delete lobbyUsers[room];
            delete adminForRoom[room];
            // Extract session code from room (room format: "Main/<code>")
            const sessionCode = room.split("/")[1];
            try {
                await Session.deleteOne({ code: sessionCode });
                console.log(`Session ${sessionCode} deleted from DB.`);
            } catch (err) {
                console.error(`Failed to delete session ${sessionCode}`, err);
            }
        }
    });

    socket.on('disconnect', async () => {
        for (const room in lobbyUsers) {
            // If the disconnecting socket is the admin, close the session.
            if (adminForRoom[room] === socket.id) {
                io.in(room).emit('sessionClosed');
                delete lobbyUsers[room];
                delete adminForRoom[room];
                const sessionCode = room.split("/")[1];
                try {
                    await Session.deleteOne({ code: sessionCode });
                    console.log(`Session ${sessionCode} deleted from DB on admin disconnect.`);
                } catch (err) {
                    console.error(`Failed to delete session ${sessionCode} on admin disconnect`, err);
                }
            } else {
                // Otherwise, just remove the user from the room
                lobbyUsers[room] = lobbyUsers[room].filter(u => u.id !== socket.id);
                io.in(room).emit('updateUsers', lobbyUsers[room]);
            }
        }
        console.log('A user disconnected:', socket.id);
    });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI; // Read from .env file

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Test API route
app.get('/', (req, res) => {
    res.send('Hello from Express + Socket.io server!');
});

// Register Route (POST /register)
app.post('/register', async (req, res) => {
    try {
        const { nickname, password, instrument, isAdmin, image } = req.body;
        const existingUser = await User.findOne({ nickname });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        // 'image' can be either a built-in URL or a base64 encoded string
        const newUser = new User({ nickname, password: hashedPassword, instrument, isAdmin, image });
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
        const user = await User.findOne({ nickname });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign(
            { userId: user._id, nickname: user.nickname },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ message: 'Login successful', token, isAdmin: user.isAdmin, image: user.image, instrument: user.instrument });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post('/results', async (req, res) => {
    try {
        const { songName } = req.body;
        const results = await getSongResults(songName);
        res.json({ results });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results', error });
    }
});


//Starting server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

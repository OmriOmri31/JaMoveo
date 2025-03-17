// src/App.js
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import SignUp from './components/SignUp/SignUp';

function App() {
    useEffect(() => {
        // Connect to the Socket.io server
        const socket = io('http://localhost:3001');

        // Log when successfully connected
        socket.on('connect', () => {
            console.log('Connected to Socket.io server:', socket.id);
        });

        // Cleanup function to disconnect when component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="App">
            <h1>Welcome to the App</h1>
            <SignUp />
        </div>
    );
}

export default App;

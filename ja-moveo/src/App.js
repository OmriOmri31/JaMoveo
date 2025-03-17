// src/App.js
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import SignUp from './components/SignUp/SignUp';
import SignUpAdmin from './components/SignUp/SignUpAdmin';


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
        <Router>
            <Routes>
                <Route path="/" element={<SignUp/>}/>
                <Route path="/ImTheBoss" element={<SignUpAdmin/>}/>
            </Routes>
        </Router>

    );
}

export default App;

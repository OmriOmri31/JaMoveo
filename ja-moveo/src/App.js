// src/App.js
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import SignUp from './components/SignUp';
import SignUpAdmin from './components/SignUpAdmin';
import Welcome from "./components/Welcome";
import LogIn from "./components/LogIn";
import Home from "./components/Home";
import HomeAdmin from "./components/HomeAdmin";


function App() {
    useEffect(() => {
        // Connect to the Socket.io server
        const socket = io('http://localhost:3000');

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
                <Route path="/" element={<Welcome/>}/>
                <Route path="/SignUp" element={<SignUp/>}/>
                <Route path="/ImTheBoss" element={<SignUpAdmin/>}/>
                <Route path="/login" element={<LogIn/>}/>
                <Route path="/Home" element={<Home/>}/>
                <Route path="/HomeAdmin" element={<HomeAdmin />} />
            </Routes>
        </Router>

    );
}

export default App;

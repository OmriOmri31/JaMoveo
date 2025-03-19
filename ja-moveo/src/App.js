import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import SignUp from './components/SignUp';
import SignUpAdmin from './components/SignUpAdmin';
import Welcome from "./components/Welcome";
import LogIn from "./components/LogIn";
import Home from "./components/Home";
import HomeAdmin from "./components/HomeAdmin";
import Lobby from "./components/Lobby";
import TableScreen from "./components/TableScreen";
import LiveScreen from "./components/LiveScreen";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        const socket = io('http://localhost:3000');
        socket.on('connect', () => {
            console.log('Connected to Socket.io server:', socket.id);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <Router>
            <Header/>
            <Routes>
                <Route path="/" element={<Welcome/>}/>
                <Route path="/SignUp" element={<SignUp/>}/>
                <Route path="/ImTheBoss" element={<SignUpAdmin/>}/>
                <Route path="/login" element={<LogIn/>}/>
                <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/HomeAdmin" element={<PrivateRoute><HomeAdmin /></PrivateRoute>} />
                <Route path="/lobby/:code" element={<Lobby />} />
                <Route path="/table" element={<TableScreen />} />
                <Route path="/live" element={<LiveScreen />} />
            </Routes>
        </Router>
    );
}

export default App;

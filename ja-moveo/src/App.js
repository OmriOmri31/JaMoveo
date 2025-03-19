import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import socket from './socket';

import SignUp from './components/SignUp';
import SignUpAdmin from './components/SignUpAdmin';
import Welcome from "./components/Welcome";
import LogIn from "./components/LogIn";
import Home from "./components/Home";
import HomeAdmin from "./components/HomeAdmin";
import Main from "./components/Main";
import TableScreen from "./components/TableScreen";
import LiveScreen from "./components/LiveScreen";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";

// Global listener for socket events
function SocketListener() {
    const navigate = useNavigate();
    useEffect(() => {
        // Redirect non-admin users to LiveScreen when admin navigates there.
        socket.on("redirectLive", (data) => {
            const sessionCode = localStorage.getItem("sessionCode");
            if (sessionCode && data.href) {
                navigate(`/live/${sessionCode}`, { state: { href: data.href } });
            }
        });
        // Listen for session closure
        socket.on("sessionClosed", () => {
            if (localStorage.getItem("isAdmin") === "true") {
                navigate("/HomeAdmin");
            } else {
                navigate("/Home");
            }
        });
        return () => {
            socket.off("redirectLive");
            socket.off("sessionClosed");
        };
    }, [navigate]);
    return null;
}

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoggedIn(true);
        }
    }, []);

    return (
        <Router>
            <SocketListener />
            <Header/>
            <Routes>
                <Route path="/" element={<Welcome/>}/>
                <Route path="/SignUp" element={<SignUp/>}/>
                <Route path="/ImTheBoss" element={<SignUpAdmin/>}/>
                <Route path="/login" element={<LogIn/>}/>
                <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/HomeAdmin" element={<PrivateRoute><HomeAdmin /></PrivateRoute>} />
                <Route path="/main/:code" element={<Main />} />
                <Route path="/table" element={<TableScreen />} />
                <Route path="/live/:code" element={<LiveScreen />} />
            </Routes>
        </Router>
    );
}

export default App;

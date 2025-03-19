import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import socket from '../socket';

const LiveScreen = () => {
    const { code } = useParams();
    const location = useLocation();
    const { href } = location.state || { href: '' };
    const [chords, setChords] = useState('');
    const [error, setError] = useState(null);
    const [autoScroll, setAutoScroll] = useState(false);

    // Handle auto scrolling effect when enabled
    useEffect(() => {
        let scrollInterval;
        if (autoScroll) {
            scrollInterval = setInterval(() => {
                window.scrollBy(0, 1); // scroll down by 1px every 50ms
            }, 50);
        }
        return () => {
            if (scrollInterval) clearInterval(scrollInterval);
        };
    }, [autoScroll]);

    // Fetch chords and signal redirection for admin users
    useEffect(() => {
        const fetchChords = async () => {
            try {
                const response = await fetch('http://localhost:3001/extract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: href })
                });
                if (!response.ok) {
                    throw new Error('Extraction failed');
                }
                const data = await response.json();
                setChords(data.chords);
            } catch (err) {
                console.error(err);
                setError("Failed to extract chords");
            }
        };
        if (href) {
            fetchChords();
        }
        // If admin, immediately signal all users to redirect to the live view.
        if (localStorage.getItem("isAdmin") === "true" && href) {
            socket.emit("redirectLive", { room: `Main/${code}`, href });
        }
    }, [href, code]);

    const toggleAutoScroll = () => {
        setAutoScroll(prev => !prev);
    };

    const handleQuit = () => {
        socket.emit("closeSession", { room: `Main/${code}` });
    };

    return (
        <div style={{ margin: "20px", paddingBottom: "80px" }}>
            <h2>Live Chords</h2>
            {error ? <p>{error}</p> : <pre>{chords}</pre>}
            {/* Floating toggle button for auto scrolling */}
            <button
                onClick={toggleAutoScroll}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    zIndex: 1000
                }}
            >
                {autoScroll ? 'Stop Auto Scroll' : 'Start Auto Scroll'}
            </button>
            {/* Floating QUIT button for admin users */}
            {localStorage.getItem("isAdmin") === "true" && (
                <button
                    onClick={handleQuit}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        padding: '10px 20px',
                        zIndex: 1000
                    }}
                >
                    QUIT
                </button>
            )}
        </div>
    );
};

export default LiveScreen;

import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import socket from '../socket';

const LiveScreen = () => {
    const { code } = useParams();
    const location = useLocation();
    const { href } = location.state || { href: '' };
    const [chords, setChords] = useState('');
    const [error, setError] = useState(null);

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
        // If admin, immediately signal all users to redirect to live view.
        if (localStorage.getItem("isAdmin") === "true" && href) {
            socket.emit("redirectLive", { room: `Main/${code}`, href });
        }
    }, [href, code]);

    return (
        <div style={{ margin: "20px" }}>
            <h2>Live Chords</h2>
            {error ? <p>{error}</p> : <pre>{chords}</pre>}
        </div>
    );
};

export default LiveScreen;

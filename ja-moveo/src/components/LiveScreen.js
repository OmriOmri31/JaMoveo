import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import socket from "../socket";

const LiveScreen = () => {
    const { code } = useParams();
    const location = useLocation();
    const { href } = location.state || { href: "" };
    const [chords, setChords] = useState("");
    const [error, setError] = useState(null);
    const [autoScroll, setAutoScroll] = useState(false);

    // Auto-scroll effect when enabled
    useEffect(() => {
        let scrollInterval;
        if (autoScroll) {
            scrollInterval = setInterval(() => {
                window.scrollBy(0, 1);
            }, 50);
        }
        return () => {
            if (scrollInterval) clearInterval(scrollInterval);
        };
    }, [autoScroll]);

    // Fetch chords and signal live redirection if admin
    useEffect(() => {
        const fetchChords = async () => {
            try {
                const response = await fetch("http://localhost:3001/extract", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: href,
                        instrument: localStorage.getItem("instrument"),
                    }),
                });
                if (!response.ok) {
                    throw new Error("Extraction failed");
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
        // If admin, signal all users to redirect to live view
        if (localStorage.getItem("isAdmin") === "true" && href) {
            socket.emit("redirectLive", { room: `Main/${code}`, href });
        }
    }, [href, code]);

    const toggleAutoScroll = () => {
        setAutoScroll((prev) => !prev);
    };

    const handleQuit = () => {
        socket.emit("closeSession", { room: `Main/${code}` });
    };

    // Determine text alignment based on whether chords contain Hebrew characters
    const isHebrew = /[\u0590-\u05FF]/.test(chords);

    return (
        <div className="page-container live-container">
            <h2 className="page-title">Live Chords</h2>
            {error ? (
                <p className="error-text">{error}</p>
            ) : chords ? (
                <pre
                    className="chords-display"
                    style={{ textAlign: isHebrew ? "right" : "left" }}
                >
          {chords}
        </pre>
            ) : (
                // Show loader when waiting for chords
                <div className="loader-wrapper">
                    <div className="loader">
                        <div className="loader-square"></div>
                        <div className="loader-square"></div>
                        <div className="loader-square"></div>
                        <div className="loader-square"></div>
                        <div className="loader-square"></div>
                        <div className="loader-square"></div>
                        <div className="loader-square"></div>
                        <div className="loader-square"></div>
                    </div>
                </div>
            )}
            {chords && (
                <button
                    className="fixed-button auto-scroll-button"
                    onClick={toggleAutoScroll}
                >
                    {autoScroll ? "Stop Auto Scroll" : "Start Auto Scroll"}
                </button>
            )}
            {localStorage.getItem("isAdmin") === "true" && (
                <button className="fixed-button quit-button" onClick={handleQuit}>
                    QUIT
                </button>
            )}
        </div>
    );
};

export default LiveScreen;

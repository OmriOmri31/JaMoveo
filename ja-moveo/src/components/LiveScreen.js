import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

const LiveScreen = () => {
    const { code } = useParams();
    const location = useLocation();
    const { href } = location.state || { href: "" };
    const [chords, setChords] = useState("");
    const [error, setError] = useState(null);
    const [autoScroll, setAutoScroll] = useState(false);
    const navigate = useNavigate();

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

    // Quit the session: return everyone to Main
    const handleQuit = () => {
        socket.emit("redirectMain", { room: `Main/${code}`, code });
    };

    // Listen for server's "redirectMain" event
    useEffect(() => {
        socket.on("redirectMain", ({ code: mainCode }) => {
            navigate(`/main/${mainCode}`);
        });
        return () => {
            socket.off("redirectMain");
        };
    }, [navigate]);

    // Toggle auto-scroll
    const toggleAutoScroll = () => {
        setAutoScroll((prev) => !prev);
    };

    // Determine if text is Hebrew
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

            {/* Auto-Scroll Button (only when chords loaded) */}
            {chords && (
                <button
                    className="main__action scroll-button"
                    onClick={toggleAutoScroll}
                    style={{
                        position: "fixed",
                        top: "50%",
                        // Float on the right for English, on the left for Hebrew
                        [isHebrew ? "left" : "right"]: "20px",
                        transform: "translateY(-50%)",
                        opacity: 0.7,
                    }}
                >
          <span className="main__scroll-text">
            {autoScroll ? "Stop Scrolling" : "Auto Scroll"}
          </span>
                    <div className="main__scroll-box">↓</div>
                </button>
            )}

            {/* Quit Button for Admin */}
            {localStorage.getItem("isAdmin") === "true" && (
                <button
                    className="fixed-button quit-button"
                    onClick={handleQuit}
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        left: "20px",
                    }}
                >
                    QUIT
                </button>
            )}
        </div>
    );
};

export default LiveScreen;

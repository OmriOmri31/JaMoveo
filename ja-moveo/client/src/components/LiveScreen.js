import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
// Import your quotes array
import { quotes } from "./Quotes";

const LiveScreen = () => {
    const { code } = useParams();
    const location = useLocation();
    const { href } = location.state || { href: "" };
    const [chords, setChords] = useState("");
    const [error, setError] = useState(null);
    const [autoScroll, setAutoScroll] = useState(false);
    const navigate = useNavigate();

    // Random quote for loading
    const [randomQuote, setRandomQuote] = useState("");

    // Check if local user is Vocals
    const isVocals = localStorage.getItem("instrument") === "Vocals";

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

    // Immediately pick a random quote, then change it every 10s
    useEffect(() => {
        const initialIndex = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[initialIndex]);

        const intervalId = setInterval(() => {
            const newIndex = Math.floor(Math.random() * quotes.length);
            setRandomQuote(quotes[newIndex]);
        }, 10000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    // Listen for chords broadcast from admin
    useEffect(() => {
        socket.on("chordsData", ({ chords: c, lyrics: l }) => {
            setChords(isVocals ? l : c);
        });
        return () => {
            socket.off("chordsData");
        };
    }, [isVocals]);

    useEffect(() => {
        // Only admin calls /extract
        const fetchChords = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVICE_TWO_URL}/extract`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            url: href,
                            isAdmin: localStorage.getItem("isAdmin") === "true",
                        }),
                    }
                );
                if (!response.ok) {
                    throw new Error("Extraction failed");
                }
                const data = await response.json();
                // Admin sets own display
                setChords(isVocals ? data.lyrics : data.chords);
                // Then admin emits both
                socket.emit("chordsData", {
                    room: `Main/${code}`,
                    chords: data.chords,
                    lyrics: data.lyrics,
                });
            } catch (err) {
                console.error(err);
                setError("Failed to extract chords");
            }
        };

        if (href && localStorage.getItem("isAdmin") === "true") {
            fetchChords();
            socket.emit("redirectLive", { room: `Main/${code}`, href });
        }
    }, [href, code, isVocals]);

    const handleQuit = () => {
        socket.emit("redirectMain", { room: `Main/${code}`, code });
    };

    useEffect(() => {
        socket.on("redirectMain", ({ code: mainCode }) => {
            navigate(`/main/${mainCode}`);
        });
        return () => {
            socket.off("redirectMain");
        };
    }, [navigate]);

    const toggleAutoScroll = () => {
        setAutoScroll((prev) => !prev);
    };

    // If chords contain Hebrew, right-align them
    const isHebrew = /[\u0590-\u05FF]/.test(chords);

    return (
        <div className="page-container live-container">
            <h2 className="page-title">Live Chords</h2>

            {error ? (
                <p className="error-text">{error}</p>
            ) : chords ? (
                <>
                    <pre
                        className="chords-display"
                        style={{ textAlign: isHebrew ? "right" : "left" }}
                    >
                        {chords}
                    </pre>
                    <div
                        className={`love-heart ${autoScroll ? "checked" : ""}`}
                        onClick={toggleAutoScroll}
                        style={{
                            position: "fixed",
                            top: "50%",
                            [isHebrew ? "left" : "right"]: "200px",
                            transform:
                                "translateY(-50%) rotate(-45deg) translate(-50%, -38px) scale(5)",
                            zIndex: 999,
                            cursor: "pointer",
                        }}
                    >
                        <div className="bottom" />
                        <div className="round" />
                    </div>
                    <div
                        style={{
                            position: "fixed",
                            top: "calc(50% + 90px)",
                            [isHebrew ? "left" : "right"]: "150px",
                            transform: "translateY(-50%)",
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                            zIndex: 999,
                        }}
                    >
                        {autoScroll ? "Stop Scroll" : "Auto Scroll"}
                    </div>
                </>
            ) : (
                // Loader + quote while chords haven't loaded
                <div className="loader-wrapper" style={{ position: "relative" }}>
                    <div className="loader">
                        <div className="loader-square" />
                        <div className="loader-square" />
                        <div className="loader-square" />
                        <div className="loader-square" />
                        <div className="loader-square" />
                        <div className="loader-square" />
                        <div className="loader-square" />
                        <div className="loader-square" />
                    </div>
                    {/* Absolutely-positioned so it won't shift the loader */}
                    <p
                        className="random-quote"
                        style={{
                            position: "absolute",
                            bottom: "-2rem",
                            width: "100%",
                            textAlign: "center",
                            margin: 0,
                        }}
                    >
                        "{randomQuote}"
                    </p>
                </div>
            )}

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

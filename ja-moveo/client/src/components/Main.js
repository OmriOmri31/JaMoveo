import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import { quotes } from "./Quotes";

const Main = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [activeUsers, setActiveUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [randomQuote, setRandomQuote] = useState("");

    localStorage.setItem("sessionCode", code);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVICE_TWO_URL}/session/${code}`
                );
                if (!response.ok) {
                    if (localStorage.getItem("isAdmin") === "false") {
                        navigate("/Home");
                    } else {
                        navigate("/HomeAdmin");
                    }
                }
            } catch (error) {
                console.error(error);
                if (localStorage.getItem("isAdmin") === "false") {
                    navigate("/Home");
                } else {
                    navigate("/HomeAdmin");
                }
                alert("Server error");
                return;
            }
        };

        checkSession();

        socket.emit("joinLobby", {
            room: `Main/${code}`,
            user: localStorage.getItem("nickname"),
            isAdmin: localStorage.getItem("isAdmin") === "true",
        });

        socket.on("updateUsers", (users) => {
            setActiveUsers(users);
        });

        const initialIndex = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[initialIndex]);
        if (localStorage.getItem("isAdmin") === "true") {
            socket.emit("quoteUpdate", {
                room: `Main/${code}`,
                quote: quotes[initialIndex],
            });
        }

        const intervalId = setInterval(() => {
            const newIndex = Math.floor(Math.random() * quotes.length);
            setRandomQuote(quotes[newIndex]);
            if (localStorage.getItem("isAdmin") === "true") {
                socket.emit("quoteUpdate", {
                    room: `Main/${code}`,
                    quote: quotes[newIndex],
                });
            }
        }, 10000);

        return () => {
            clearInterval(intervalId);
            socket.off("updateUsers");
        };
    }, [code, navigate]);

    useEffect(() => {
        socket.on("quoteUpdate", ({ quote }) => {
            setRandomQuote(quote);
        });
        return () => {
            socket.off("quoteUpdate");
        };
    }, []);

    const handleCloseSession = () => {
        socket.emit("closeSession", { room: `Main/${code}` });
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const response = await fetch(
            `${process.env.REACT_APP_SERVICE_TWO_URL}/results`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ songName: query }),
            }
        );
        const data = await response.json();
        setLoading(false);
        navigate("/table", { state: { results: data.results } });
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Main Page {code}</h2>
            <h3 className="section-title">Active Users:</h3>
            <ul className="active-users-list">
                {activeUsers.map((user) => (
                    <li key={user.id} className="active-user-item">
                        {user.name}
                    </li>
                ))}
            </ul>

            {localStorage.getItem("isAdmin") === "true" ? (
                <div className="admin-section">
                    <h3 className="section-title">Search any song...</h3>
                    {loading ? (
                        <div className="loader-wrapper">
                            <h3 className="section-title">
                                Searching for your song's chords...
                            </h3>
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
                            <p className="random-quote" style={{ visibility: loading ? "visible" : "hidden", marginTop: "1rem" }}>
                                "{randomQuote}"
                            </p>
                        </div>
                    ) : (
                        <form className="page-form" onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Enter song title"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                required
                            />
                            <button type="submit" className="primary-button">
                                Search
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="user-section">
                    <h3 className="section-title">
                        Waiting for your boss to pick a song for jamming
                    </h3>
                    <div className="loader-wrapper">
                        <div className="loader">
                            <div className="loader-square"></div>
                            <div className="loader-square"></div>
                            <div className="loader-square"></div>
                            <div className="loader-square"></div>
                            <div className="loader-square"></div>
                            <div className="loader-square"></div>
                            <div className="loader-square"></div>
                        </div>
                        <p className="random-quote" style={{ marginTop: "1rem" }}>
                            "{randomQuote}"
                        </p>
                    </div>
                </div>
            )}

            {localStorage.getItem("isAdmin") === "true" && (
                <button
                    onClick={handleCloseSession}
                    className="primary-button close-session-button"
                >
                    Close Session
                </button>
            )}
        </div>
    );
};

export default Main;

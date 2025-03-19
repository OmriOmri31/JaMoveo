import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

const Main = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [activeUsers, setActiveUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false); // NEW: Loading state

    // Save session code for use in other pages
    localStorage.setItem("sessionCode", code);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(`http://localhost:3001/session/${code}`);
                if (!response.ok) {
                    navigate("/Home");
                    alert("Session doesn't exist");
                    return;
                }
            } catch (error) {
                console.error(error);
                navigate("/Home");
                alert("Server error");
                return;
            }
        };

        checkSession();

        // Join the session room; pass isAdmin flag from localStorage
        socket.emit("joinLobby", {
            room: `Main/${code}`,
            user: localStorage.getItem("nickname"),
            isAdmin: localStorage.getItem("isAdmin") === "true",
        });

        socket.on("updateUsers", (users) => {
            setActiveUsers(users);
        });

        // Do not disconnect on unmount so the admin remains in the room
        return () => {
            socket.off("updateUsers");
        };
    }, [code, navigate]);

    // Handler for admin to close the session
    const handleCloseSession = () => {
        socket.emit("closeSession", { room: `Main/${code}` });
    };

    // Handler for song search submission
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loader while waiting for results
        const response = await fetch("http://localhost:3001/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ songName: query }),
        });
        const data = await response.json();
        setLoading(false); // Hide loader
        // Navigate to TableScreen with the search results
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
                            // Show loader for admin when waiting for search results
                        <div className="loader-wrapper">
                            <h3 className="section-title">Searching for your song's chords...</h3>
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
                    <br />
                    <button onClick={handleCloseSession} className="primary-button">
                        Close Session
                    </button>
                </div>
            ) : (
                <div className="user-section">
                    <h3 className="section-title">
                        Waiting for your boss to pick a song to jam
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
                            <div className="loader-square"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

const Main = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [activeUsers, setActiveUsers] = useState([]);
    const [query, setQuery] = useState("");

    // Save the session code so other pages can use it
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
        socket.emit("joinLobby", { room: `Main/${code}`, user: localStorage.getItem('nickname'), isAdmin: localStorage.getItem("isAdmin") === "true" });

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

    return (
        <div style={{ margin: "20px" }}>
            <h2>Main Page {code}</h2>
            <h3>Active Users:</h3>
            <ul>
                {activeUsers.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
            {localStorage.getItem("isAdmin") === "true" && (
                <div>
                    <h3>Search any song...</h3>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const response = await fetch("http://localhost:3001/results", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ songName: query }),
                            });
                            const data = await response.json();
                            // Navigate to TableScreen with the search results.
                            navigate('/table', { state: { results: data.results } });
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Enter song title"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit">Search</button>
                    </form>
                    <br />
                    <button onClick={handleCloseSession}>Close Session</button>
                </div>
            )}

            {localStorage.getItem("isAdmin") === "false" && (
                <div>
                    <h3>Waiting for next song...</h3>
                </div>
            )}
        </div>
    );
};

export default Main;

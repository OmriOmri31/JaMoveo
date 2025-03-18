
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";


const Lobby = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [activeUsers, setActiveUsers] = useState([]);
    const [query, setQuery] = useState(""); // state for search query

    useEffect(() => {
        // Check if the session exists on the server
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

        // Connect to the Socket.io server and join the lobby
        const socket = io("http://localhost:3001");
        socket.emit("joinLobby", { room: `lobby/${code}`, user: localStorage.getItem('nickname') });

        // Listen for updates on active users in the lobby
        socket.on("updateUsers", (users) => {
            setActiveUsers(users);
        });

        // Cleanup socket connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, [code, navigate]);


    return (
        <div style={{ margin: "20px" }}>
            <h2>Lobby {code}</h2>
            <h3>Active Users:</h3>
            <ul>
                {activeUsers.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
            {/* If user is admin, show search field */}
            {localStorage.getItem("isAdmin") === "true" && (
                <div>
                    <h3>Search any song...</h3>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const response = await fetch("http://localhost:3001/results", {
                                method: "POST",
                                headers: {"Content-Type": "application/json"},
                                body: JSON.stringify({songName: query}),
                            });
                            const data = await response.json();
                            console.log(data.results);
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
                </div>
            )}
        </div>
    );
};

export default Lobby;

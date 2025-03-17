// src/components/Lobby.js
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Lobby = () => {
    const { code } = useParams(); // Get session code from URL
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(`http://localhost:3001/session/${code}`);
                if (!response.ok) {
                    alert("Session doesn't exist");
                    navigate("/"); // Redirect back to Home
                }
            } catch (error) {
                console.error(error);
                alert("Server error");
                navigate("/");
            }
        };

        checkSession();
    }, [code, navigate]);

    return (
        <div style={{ margin: "20px" }}>
            <h2>Lobby {code}</h2>
            {/* Lobby content goes here */}
        </div>
    );
};

export default Lobby;

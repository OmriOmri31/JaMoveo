// src/components/Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    // On form submit, navigate to the corresponding lobby route
    const handleSubmit = (e) => {
        e.preventDefault();
        if (code.trim()) {
            navigate(`/lobby/${code}`);
        } else {
            alert("Please enter a valid session code");
        }
    };

    return (
        <div style={{ margin: "20px" }}>
            <h2>Enter Session Code</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter session code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                <button type="submit">Join Lobby</button>
            </form>
        </div>
    );
};

export default Home;

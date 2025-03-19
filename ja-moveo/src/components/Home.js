// src/components/Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code.trim()) {
            navigate(`/main/${code}`);
        } else {
            alert("Please enter a valid session code");
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Enter Session Code</h2>
            <form className="page-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter session code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                <button type="submit">Join Everyone</button>
            </form>
        </div>
    );
};

export default Home;

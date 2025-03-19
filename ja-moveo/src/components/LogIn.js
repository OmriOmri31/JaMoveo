// src/components/LogIn.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:3001/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("nickname", nickname);
            localStorage.setItem("image", data.image);
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("instrument", data.instrument);
            localStorage.setItem("isAdmin", data.isAdmin.toString());
            data.isAdmin ? navigate("/HomeAdmin") : navigate("/Home");
        } else {
            alert("Try Again!");
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Log In</h2>
            <form className="page-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default LogIn;

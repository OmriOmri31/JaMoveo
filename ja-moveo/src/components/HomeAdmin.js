// src/components/HomeAdmin.js
import React from "react";
import { useNavigate } from "react-router-dom";

const HomeAdmin = () => {
    const navigate = useNavigate();

    const createJamSession = async () => {
        try {
            const res = await fetch("http://localhost:3001/create-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (res.ok) {
                navigate(`/main/${data.code}`);
            } else {
                alert("Failed to create session");
            }
        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Admin Dashboard</h2>
            <button onClick={createJamSession}>Create a Jam Session</button>
        </div>
    );
};

export default HomeAdmin;

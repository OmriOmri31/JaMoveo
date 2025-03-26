// src/components/Welcome.js
import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
    const navigate = useNavigate();
    useEffect(() => {
        // If logged in, redirect accordingly
        if (localStorage.getItem("loggedIn") === "true") {
            if (localStorage.getItem("isAdmin") === "true") {
                navigate("/HomeAdmin");
            } else {
                navigate("/Home");
            }
        }
    },)

    return (
        <div className="welcome-container">
            <h1 className="welcome-title">Welcome to JaMoveo!</h1>
            <div className="welcome-buttons">
                <h5 className="welcome-subtitle">First time here?</h5>
                <button className="primary-button" onClick={() => navigate("/SignUp")}>
                    Sign Up
                </button>
                <h5 className="welcome-subtitle">Professional jammer?</h5>
                <button className="primary-button" onClick={() => navigate("/LogIn")}>
                    Log In
                </button>
            </div>
        </div>
    );
};

export default Welcome;

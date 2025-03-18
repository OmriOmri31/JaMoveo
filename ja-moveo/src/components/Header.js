// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const nickname = localStorage.getItem("nickname");
    const image = localStorage.getItem("image");
    //const instrument = localStorage.getItem("instrument")

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                background: "#eee",
            }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                {image && (
                    <img
                        src={image}
                        alt="User"
                        style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            marginRight: "10px",
                        }}
                    />
                )}
                <h3>{nickname ? `Welcome, ${nickname}` : "Welcome"}</h3>
            </div>
            <button onClick={handleLogout}>Logout</button>
        </header>
    );
};

export default Header;

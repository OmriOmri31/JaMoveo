import React from "react";

const Header = () => {
    // Retrieve stored values from localStorage
    const nickname = localStorage.getItem('nickname');
    const image = localStorage.getItem('image');

    return (
        <header style={{ display: "flex", alignItems: "center", padding: "10px", background: "#eee" }}>
            {image && (
                <img src={image} alt="User" style={{ width: "50px", height: "50px", borderRadius: "50%", marginRight: "10px" }} />
            )}
            <h3>{nickname ? `Welcome, ${nickname}` : "Welcome"}</h3>
        </header>
    );
};

export default Header;

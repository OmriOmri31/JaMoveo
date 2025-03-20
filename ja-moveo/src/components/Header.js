import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const nickname = localStorage.getItem("nickname");
    const image = localStorage.getItem("image");
    const instrument = localStorage.getItem("instrument");
    const loggedIn = localStorage.getItem("loggedIn");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };
    if (loggedIn === "true") {
        return (
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 20px",
                    backgroundColor: "#F9F9F9", // Secondary palette background
                    borderBottom: "2px solid #983732" // Accent with primary brand color
                }}
            >
                <div style={{display: "flex", alignItems: "center"}}>
                    {image && (
                        <img
                            src={image}
                            alt="User"
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                marginRight: "10px",
                                objectFit: "cover"
                            }}
                        />
                    )}
                    <h3
                        style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            color: "#181818",
                            margin: 0,
                            fontSize: "1.2rem"
                        }}
                    >
                        {`${nickname}, ${instrument} player`}
                    </h3>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: "#983732",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "8px 16px",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        borderRadius: "0"
                    }}
                >
                    Logout
                </button>
            </header>
        );
    }
}

export default Header;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeAdmin = () => {
    const navigate = useNavigate();

    // When clicked, call the server to create a session and then navigate to that lobby.
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
        <div style={{ margin: "20px" }}>
            <button onClick={createJamSession}>Create a jam session</button>
        </div>
    );
};
export default HomeAdmin;

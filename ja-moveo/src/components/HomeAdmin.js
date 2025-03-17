import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeAdmin = () => {
    const navigate = useNavigate();

    const handleCreateJamSession = () => {
        // Generate a random 5-digit code
        const code = Math.floor(10000 + Math.random() * 90000);
        // Redirect to the lobby URL with the generated code
        navigate(`/lobby_${code}`);
    };

    return (
        <div style={{ margin: '20px' }}>
            <button onClick={handleCreateJamSession}>
                Create a jam session
            </button>
        </div>
    );
};

export default HomeAdmin;

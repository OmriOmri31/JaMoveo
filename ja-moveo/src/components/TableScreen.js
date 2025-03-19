import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../socket';

const TableScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results } = location.state || { results: [] };
    const sessionCode = localStorage.getItem("sessionCode");

    useEffect(() => {
        if(sessionCode){
            // Rejoin the room if necessary when on TableScreen
            socket.emit("joinLobby", { room: `Main/${sessionCode}`, user: localStorage.getItem('nickname') });
        }
    }, [sessionCode]);

    const handleRowClick = (href) => {
        navigate(`/live/${sessionCode}`, { state: { href } });
    };

    return (
        <div style={{ margin: "20px" }}>
            <h2>Song Results</h2>
            {results.length === 0 ? (
                <div>
                    <p>No results found</p>
                    <button onClick={() => navigate(`/main/${sessionCode}`)}>Search another song</button>
                </div>
            ) : (
                <table border="1" cellPadding="10">
                    <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Song</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((item, index) => (
                        <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(item.href)}>
                            <td>{item.artist}</td>
                            <td>{item.songName}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TableScreen;

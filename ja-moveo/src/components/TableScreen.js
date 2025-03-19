// src/components/TableScreen.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";

const TableScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results } = location.state || { results: [] };
    const sessionCode = localStorage.getItem("sessionCode");

    useEffect(() => {
        if (sessionCode) {
            // Rejoin the lobby if necessary
            socket.emit("joinLobby", {
                room: `Main/${sessionCode}`,
                user: localStorage.getItem("nickname"),
            });
        }
    }, [sessionCode]);

    const handleRowClick = (href) => {
        navigate(`/live/${sessionCode}`, { state: { href } });
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Song Results</h2>
            {results.length === 0 ? (
                <div className="no-results">
                    <p className="no-results-text">No results found</p>
                    <button
                        className="primary-button"
                        onClick={() => navigate(`/main/${sessionCode}`)}
                    >
                        Search another song
                    </button>
                </div>
            ) : (
                <table className="results-table">
                    <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Song</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((item, index) => (
                        <tr
                            key={index}
                            className="table-row"
                            onClick={() => handleRowClick(item.href)}
                        >
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

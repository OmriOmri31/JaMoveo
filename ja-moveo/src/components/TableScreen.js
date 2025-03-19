import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TableScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results } = location.state || { results: [] };

    const handleRowClick = (href) => {
        navigate('/live', { state: { href } });
    };

    return (
        <div style={{ margin: "20px" }}>
            <h2>Song Results</h2>
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
        </div>
    );
};

export default TableScreen;

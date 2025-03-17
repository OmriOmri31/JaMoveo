import React, { useState } from "react";

const SignUpAdmin = () => {
    // State variables
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [selectedBuiltInImage, setSelectedBuiltInImage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [instrument, setInstrument] = useState('');
    const [isAdmin, setIsAdmin] = useState(true);

    // Built-in images array
    const builtInImages = [
        '/assets/Bunny.webp',
        '/assets/Cat.webp',
        '/assets/Fox.webp',
        '/assets/Panda.webp',
        '/assets/Hamster.webp'
    ];

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh
        await handleRegister(); // Call register function
    };

    // Send form data to backend
    const handleRegister = async () => {
        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nickname,
                    password,
                    instrument
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful!');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error');
        }
    };

    // Handle image selection
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedImage(e.target.files[0]);
            setSelectedBuiltInImage('');
        }
    };

    // Handle built-in image selection
    const handleBuiltInImageSelect = (img) => {
        setSelectedBuiltInImage(img);
        setUploadedImage(null);
    };

    return (
        <div style={{ margin: '20px' }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                {/* Button to go to Admin Signup */}
                <button type="button" onClick={() => window.location.href = "/"}>
                    Sign Up as a Simple User
                </button>
                {/* Nickname Input Field */}
                <div>
                    <label>
                        Nickname:
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Enter your nickname"
                            required
                        />
                    </label>
                </div>
                {/* Password Input Field */}
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </label>
                </div>
                <br/>
                {/* Image Selection Section */}
                <div>
                    <label>Choose an Image:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {builtInImages.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => handleBuiltInImageSelect(img)}
                                style={{
                                    border: selectedBuiltInImage === img ? '2px solid blue' : '1px solid gray',
                                    padding: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                <img src={img} alt={`Built-in ${index + 1}`} style={{ width: '100px', height: '100px' }} />
                            </div>
                        ))}
                    </div>
                    {/* Option to upload an image */}
                    <div>
                        <label>
                            Or Upload an Image:
                            <input type="file" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>
                <br/>
                {/* Instrument Dropdown */}
                <div>
                    <label>
                        Instrument:
                        <select value={instrument} onChange={(e) => setInstrument(e.target.value)} required>
                            <option value="">Select your instrument</option>
                            <option value="Guitar">Guitar</option>
                            <option value="Drums">Drums</option>
                            <option value="Saxophone">Saxophone</option>
                            <option value="Piano">Piano</option>
                            <option value="Vocals">Vocals</option>
                        </select>
                    </label>
                </div>
                <br/>
                {/* Submit button */}
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUpAdmin;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SignUpAdmin = () => {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [selectedBuiltInImage, setSelectedBuiltInImage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [instrument, setInstrument] = useState('');
    // Here isAdmin is preset to true for admins
    const [isAdmin] = useState(true);
    const navigate = useNavigate();

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
        e.preventDefault();
        if (password.length < 6){
            alert(`The password must be at least 6 characters long`)
        }
        else{
            await handleRegister();
        }
    };

    // Send form data to backend and auto log in on success
    const handleRegister = async () => {
        try {
            console.log(`${process.env.REACT_APP_SERVICE_TWO_URL}/register`);
            const response = await fetch(`${process.env.REACT_APP_SERVICE_TWO_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname,
                    password,
                    instrument,
                    isAdmin,
                    image: uploadedImage ? uploadedImage : selectedBuiltInImage
                })
            });

            const data = await response.json();
            if (response.ok) {
                // Automatically log in after successful registration
                const loginResponse = await fetch(`${process.env.REACT_APP_SERVICE_TWO_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nickname, password }),
                });
                const loginData = await loginResponse.json();
                if (loginResponse.ok) {
                    localStorage.setItem('token', loginData.token);
                    localStorage.setItem('nickname', nickname);
                    localStorage.setItem('image', loginData.image);
                    localStorage.setItem("loggedIn", "true");
                    localStorage.setItem('instrument', loginData.instrument);
                    localStorage.setItem('isAdmin', loginData.isAdmin.toString());
                    alert('Registration successful!');
                    navigate("/HomeAdmin");
                } else {
                    alert("Registration succeeded, but login failed. Please try logging in.");
                }
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error');
        }
    };

    // Handle image selection: convert file to base64 string
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
                setSelectedBuiltInImage('');
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle built-in image selection
    const handleBuiltInImageSelect = (img) => {
        setSelectedBuiltInImage(img);
        setUploadedImage(null);
    };

    return (
        <div className="sign-up-container">
            <button
                className="primary-button absolute top-4 left-4 flex items-center gap-2"
                onClick={() => navigate("/")}
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>

            <h2 className="sign-up-title">Sign Up</h2>
            <form className="sign-up-form" onSubmit={handleSubmit}>
                <button type="button" onClick={() => navigate("/SignUp")}>
                    Sign Up as a Simple User
                </button>

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

                {/* Image Selection Section */}
                <div className="image-selection">
                    <label>Choose an Image:</label>
                    <div className="built-in-image-grid">
                        {builtInImages.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => handleBuiltInImageSelect(img)}
                                className={`built-in-image-box ${selectedBuiltInImage === img ? 'selected' : ''}`}
                            >
                                <img src={img} alt={`Built-in ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    {/* Upload container to display user-uploaded image preview */}
                    <div className="upload-container">
                        <label>
                            Or Upload an Image:
                            <input type="file" accept="image/*" onChange={handleImageUpload} />
                        </label>
                        {uploadedImage && (
                            <img src={uploadedImage} alt="Uploaded" />
                        )}
                    </div>
                </div>

                <label>
                    Instrument:
                    <select
                        value={instrument}
                        onChange={(e) => setInstrument(e.target.value)}
                        required
                    >
                        <option value="">Select your instrument</option>
                        <option value="Guitar">Guitar</option>
                        <option value="Bass">Bass</option>
                        <option value="Drums">Drums</option>
                        <option value="Saxophone">Saxophone</option>
                        <option value="Piano">Keyboard</option>
                        <option value="Vocals">Vocals</option>
                    </select>
                </label>

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUpAdmin;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {ArrowLeft} from "lucide-react";

const SignUp = () => {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [selectedBuiltInImage, setSelectedBuiltInImage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null); // Will hold base64 string if uploaded
    const [instrument, setInstrument] = useState('');
    const [isAdmin] = useState(false);
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

    // Send registration data to backend and auto log in on success
    const handleRegister = async () => {
        try {

            const registerResponse = await fetch(`${process.env.REACT_APP_SERVICE_TWO_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname,
                    password,
                    instrument,
                    isAdmin,
                    // Send the uploaded image as a base64 string if available, else send the built-in image URL.
                    image: uploadedImage ? uploadedImage : selectedBuiltInImage
                })
            });

            const registerData = await registerResponse.json();
            if (registerResponse.ok) {
                // Automatically log in after successful registration
                const loginResponse = await fetch(`${process.env.REACT_APP_SERVICE_TWO_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nickname, password }),
                });
                const loginData = await loginResponse.json();
                if (loginResponse.ok) {
                    // Set localStorage items
                    localStorage.setItem('token', loginData.token);
                    localStorage.setItem('nickname', nickname);
                    localStorage.setItem('image', loginData.image);
                    localStorage.setItem("loggedIn", "true");
                    localStorage.setItem('instrument', loginData.instrument);
                    localStorage.setItem('isAdmin', loginData.isAdmin.toString());
                    alert('Registration successful!');
                    // Navigate based on user role
                    if (loginData.isAdmin) {
                        navigate("/HomeAdmin");
                    } else {
                        navigate("/Home");
                    }
                } else {
                    alert("Registration succeeded, but login failed. Please try logging in.");
                }
            } else {
                alert(registerData.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error');
        }
    };

    // Handle image selection: convert the file to a base64 string
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
            <h2 className="sign-up-title">Sign Up</h2>
            <form className="sign-up-form" onSubmit={handleSubmit}>
                {/* Button to go to Admin Signup */}
                <button type="button" onClick={() => window.location.href = "/ImTheBoss"}>
                    Sign Up as Admin
                </button>

                {/* Nickname Input Field */}
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

                {/* Password Input Field */}
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
                                <img src={img} alt={`Built-in ${index + 1}`}/>
                            </div>
                        ))}
                    </div>

                    {/* Upload container to display user-uploaded image preview */}
                    <div className="upload-container">
                        <label>
                            Or Upload an Image:
                            <input type="file" accept="image/*" onChange={handleImageUpload}/>
                        </label>
                        {uploadedImage && (
                            <img src={uploadedImage} alt="Uploaded"/>
                        )}
                    </div>
                </div>

                {/* Instrument Dropdown */}
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
                        <option value="Keyboard">Keyboard</option>
                        <option value="Vocals">Vocals</option>
                    </select>
                </label>

                {/* Submit button */}
                <button type="submit">Sign Up</button>
            </form>
            <button
                className="primary-button mt-6 flex items-center gap-2"
                onClick={() => navigate("/")}
            >
                <ArrowLeft className="w-5 h-5"/>
                Back
            </button>
        </div>
    );
};

export default SignUp;

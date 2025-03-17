import React, {useState} from "react";

const SignUp = () => {
    //Nickname
    const [nickname, setNickname] = useState('');

    //Array of builtIn images
    const builtInImages = [
        '/assets/Bunny.webp',
        '/assets/Cat.webp',
        '/assets/Fox.webp',
        '/assets/Panda.webp',
        '/assets/Hamster.webp'
    ];

    //Selected image
    const [selectedBuiltInImage, setSelectedBuiltInImage] = useState('');

    //Uploaded Image
    const [uploadedImage, setUploadedImage] = useState(null);

    // State for the instrument selection from the dropdown
    const [instrument, setInstrument] = useState('');

    // Handle form submission by preventing the default action (page reload)
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from refreshing
        console.log({
            nickname,
            selectedBuiltInImage,
            uploadedImage,
            instrument
        });
    };

    // Handle image file upload. When a file is selected, update state and clear any built-in selection.
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedImage(e.target.files[0]);
            setSelectedBuiltInImage('');
        }
    };

    // When a built-in image is selected, store it and clear any uploaded file.
    const handleBuiltInImageSelect = (img) => {
        setSelectedBuiltInImage(img);
        setUploadedImage(null);
    };

return (
    <div style={{ margin: '20px' }}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
            {/* Nickname Input Field */}
            <div>
                <label>
                    Nickname:
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                    />
                </label>
            </div>
            <br />
            {/* Image Selection Section */}
            <div>
                <label>Choose an Image:</label>
                {/* Display the built-in images as selectable options */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {builtInImages.map((img, index) => (
                        <div
                            key={index}
                            onClick={() => handleBuiltInImageSelect(img)}
                            // Highlight the selected image with a blue border
                            style={{
                                border: selectedBuiltInImage === img ? '2px solid blue' : '1px solid gray',
                                padding: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            <img src={img} alt={`Built in ${index + 1}`} style={{ width: '100px', height: '100px' }} />
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
            <br />
            {/* Instrument Dropdown */}
            <div>
                <label>
                    Instrument:
                    <select value={instrument} onChange={(e) => setInstrument(e.target.value)}>
                        <option value="">Select your instrument</option>
                        <option value="Guitar">Guitar</option>
                        <option value="Drums">Drums</option>
                        <option value="Saxophone">Saxophone</option>
                        <option value="Piano">Piano</option>
                        <option value="Vocals">Vocals</option>
                    </select>
                </label>
            </div>
            <br />
            {/* Submit button: clicking it will trigger handleSubmit */}
            <button type="submit">Sign Up</button>
        </form>
    </div>
);
};

// Export the component so it can be imported in other parts of your application
export default SignUp;
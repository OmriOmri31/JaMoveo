//import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';


const Welcome = () => {
    const navigate = useNavigate();
    if ( localStorage.getItem("loggedIn") === "true"){
        if ( localStorage.getItem("isAdmin") === "true"){
            navigate("/HomeAdmin");
        }
        else
            navigate("/Home");
    }

    return (
        <div style={{margin: '20px'}}>
            <h1>Welcome to JaMoveo!</h1>

            {/* Button to go to Signup */}
            <h5>First time here?</h5>
            <button type="button" onClick={() => window.location.href = "/SignUp"}>
                Sign Up
            </button>
            <h5>Professional jammer?</h5>
            <button type="button" onClick={() => window.location.href = "/LogIn"}>
                Log In
            </button>

            <br/>
        </div>
    );
};

export default Welcome;

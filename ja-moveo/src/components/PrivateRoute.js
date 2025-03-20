import React from 'react';
import { Navigate } from 'react-router-dom';
// PrivateRoute checks for a token in localStorage and conditionally renders children or redirects to "/login"
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

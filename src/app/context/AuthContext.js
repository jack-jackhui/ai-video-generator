"use client";
import React, { createContext, useContext, useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { authApi, fetchCSRFToken } from "../api/AuthApi";
const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    const verifyAuthentication = async () => {
        try {
            // Retrieve the token from session storage
            const jwtToken = sessionStorage.getItem('jwtToken');

            // Verify the token by sending it to the backend
            const response = await authApi.post('/api/dj-rest-auth/token/verify/', {
                token: jwtToken
            });

            // Check if the token is still valid
            if (response.status === 200) {
                setIsAuthenticated(true);
            } else {
                throw new Error("Token verification failed");
            }
        } catch (error) {
            if (error.response && [401, 403].includes(error.response.status)) {
                setIsAuthenticated(false);
                sessionStorage.removeItem('jwtToken'); // Clear token if it's invalid
                console.error('Token is invalid:', error);
            } else {
                console.error('Error verifying token:', error);
            }
        }
    };

    useEffect(() => {
        // Check for JWT token in session storage on initial load
        const jwtToken = sessionStorage.getItem('jwtToken');
        //console.log(jwtToken);
        if (jwtToken) {
            authApi.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
            verifyAuthentication();
        }
    }, []);


    const loginUser = async (token) => {
        sessionStorage.setItem('jwtToken', token);
        //console.log(token);
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        verifyAuthentication();
    };

    const logoutUser = async () => {
        try {
            await authApi.post('/api/dj-rest-auth/logout/');
            sessionStorage.removeItem('jwtToken');
            setIsAuthenticated(false);
            //await fetchCSRFToken();
            router.push('/'); // Redirect to home page
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loginUser, logoutUser, showLoginModal, setShowLoginModal }}>
            {children}
        </AuthContext.Provider>
    );
};

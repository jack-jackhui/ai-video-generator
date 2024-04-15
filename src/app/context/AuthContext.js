"use client";
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    //console.log('AuthProvider rendering', { isAuthenticated, showLoginModal });

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, showLoginModal, setShowLoginModal }}>
            {children}
        </AuthContext.Provider>
    );
};

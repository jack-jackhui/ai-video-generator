"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, fetchCSRFToken } from "../api/AuthApi";
import { tokenStorage } from '../../lib/auth/tokenStorage';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Configurable post-login redirect path
const POST_LOGIN_REDIRECT = process.env.NEXT_PUBLIC_POST_LOGIN_REDIRECT || '/videoGen';

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    const verifyAuthentication = async () => {
        const token = tokenStorage.get();
        if (!token) {
            setIsAuthenticated(false);
            return;
        }
        try {
            authApi.defaults.headers.common['Authorization'] = `Token ${token}`;
            const response = await authApi.get('/api/dj-rest-auth/user/');
            setIsAuthenticated(response.status === 200);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        // Initialize CSRF token
        fetchCSRFToken().catch(() => {
            // CSRF fetch failed - non-critical, will retry on next request
        });
        // Check authentication status when component mounts
        verifyAuthentication();
    }, []);

    const loginUser = async (params) => {
        // If called with a token (Google/social login)
        if (params.key) {
            tokenStorage.set(params.key);
            authApi.defaults.headers.common['Authorization'] = `Token ${params.key}`;
            setIsAuthenticated(true);
            toast.success("Login successful");
            router.push(POST_LOGIN_REDIRECT);
            return;
        }
        // Classic login
        try {
            const response = await authApi.post('/api/dj-rest-auth/login/', {
                username: params.email,
                password: params.password,
            });
            if (response.status === 200) {
                const { key } = response.data;
                tokenStorage.set(key);
                authApi.defaults.headers.common['Authorization'] = `Token ${key}`;
                setIsAuthenticated(true);
                toast.success("Login successful");
                router.push(POST_LOGIN_REDIRECT);
            } else {
                throw new Error("Login failed with status: " + response.status);
            }
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
            setIsAuthenticated(false);
            throw error;
        }
    };

    const logoutUser = async () => {
        try {
            await fetchCSRFToken();
            await authApi.post('/api/dj-rest-auth/logout/');
            tokenStorage.remove();
            authApi.defaults.headers.common['Authorization'] = null;
            setIsAuthenticated(false);
            toast.success("Logout successful!");
            router.push('/');
        } catch (error) {
            // Still clear local state even if server logout fails
            tokenStorage.remove();
            authApi.defaults.headers.common['Authorization'] = null;
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            setIsAuthenticated, 
            loginUser, 
            logoutUser, 
            showLoginModal, 
            setShowLoginModal, 
            verifyAuthentication 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

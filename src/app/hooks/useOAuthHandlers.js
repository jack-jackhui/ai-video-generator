"use client";
import { useEffect, useCallback } from 'react';
import { authApi } from '../api/AuthApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { logger } from '../../lib/logger';

export function useOAuthHandlers({ setShowLoginModal }) {
    const { loginUser } = useAuth();

    // Initialize Google Sign-In script
    useEffect(() => {
        const googleScript = document.createElement('script');
        googleScript.src = 'https://accounts.google.com/gsi/client';
        googleScript.onload = () => {
            window.googleLoaded = true;
        };
        document.body.appendChild(googleScript);

        return () => {
            if (document.body.contains(googleScript)) {
                document.body.removeChild(googleScript);
            }
        };
    }, []);

    const handleCredentialResponse = useCallback(async (response) => {
        if (response.access_token) {
            try {
                const backendResponse = await authApi.post('/api/dj-rest-auth/google/', {
                    access_token: response.access_token
                });
                const { key } = backendResponse.data;
                await loginUser({ key });
                setShowLoginModal(false);
                window.dispatchEvent(new Event('login'));
            } catch (error) {
                logger.error('Authentication error:', error);
                toast.error('Login failed');
            }
        }
    }, [loginUser, setShowLoginModal]);

    const initGoogleSignIn = useCallback(() => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: "email profile",
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL,
            callback: handleCredentialResponse,
        });
        client.requestAccessToken();
    }, [handleCredentialResponse]);

    const handleGoogleLoginClick = useCallback(() => {
        if (window.googleLoaded) {
            initGoogleSignIn();
        } else {
            logger.error("Google Identity Services script not loaded yet.");
        }
    }, [initGoogleSignIn]);

    const handleGitHubCallback = useCallback(async (code) => {
        try {
            if (code) {
                const backendResponse = await authApi.post('/api/dj-rest-auth/github/', { code });
                const { key } = backendResponse.data;
                await loginUser({ key });
                setShowLoginModal(false);
                window.dispatchEvent(new Event('login'));
                toast.success('GitHub login successful!');
                localStorage.removeItem('github_auth_code');
            } else {
                toast.error('No authorization code received');
            }
        } catch (error) {
            logger.error('GitHub authentication error:', error);
            toast.error('GitHub login failed');
        }
    }, [loginUser, setShowLoginModal]);

    const handleGitHubLogin = useCallback(() => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URL;
        const scope = 'user:email';

        logger.debug('GitHub OAuth config:', { clientId: clientId?.substring(0, 10) + '...', redirectUri });

        if (!clientId) {
            toast.error('GitHub OAuth not configured');
            return;
        }

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${Date.now()}`;
        const popup = window.open(authUrl, 'github-login', 'width=500,height=600,scrollbars=yes,resizable=yes');

        const handleMessage = (event) => {
            if (event.origin !== window.location.origin && event.origin !== 'http://localhost:3000') {
                return;
            }

            if (event.data && event.data.type === 'GITHUB_AUTH_SUCCESS') {
                const { code } = event.data;
                handleGitHubCallback(code);
                if (popup && !popup.closed) popup.close();
                window.removeEventListener('message', handleMessage);
            } else if (event.data && event.data.type === 'GITHUB_AUTH_ERROR') {
                toast.error('GitHub login failed');
                if (popup && !popup.closed) popup.close();
                window.removeEventListener('message', handleMessage);
            }
        };

        window.addEventListener('message', handleMessage);

        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', handleMessage);
            }
        }, 1000);
    }, [handleGitHubCallback]);

    const handleMicrosoftLogin = useCallback(async () => {
        const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
        if (!clientId) {
            toast.error('Microsoft OAuth not configured');
            return;
        }

        try {
            if (!window.msalInstance) {
                const { PublicClientApplication } = await import('@azure/msal-browser');
                const msalConfig = {
                    auth: {
                        clientId: clientId,
                        authority: 'https://login.microsoftonline.com/common',
                        redirectUri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URL || window.location.origin
                    }
                };
                window.msalInstance = new PublicClientApplication(msalConfig);
                await window.msalInstance.initialize();
            }

            const loginRequest = {
                scopes: ['openid', 'profile', 'email', 'User.Read'],
                prompt: 'select_account'
            };

            const response = await window.msalInstance.loginPopup(loginRequest);
            if (response.accessToken) {
                const backendResponse = await authApi.post('/api/dj-rest-auth/microsoft/', {
                    access_token: response.accessToken
                });
                const { key } = backendResponse.data;
                await loginUser({ key });
                setShowLoginModal(false);
                window.dispatchEvent(new Event('login'));
            }
        } catch (error) {
            logger.error('Microsoft authentication error:', error);
            toast.error('Microsoft login failed');
        }
    }, [loginUser, setShowLoginModal]);

    const appleLogin = useCallback(() => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Coming Soon!</p>
                            <p className="mt-1 text-sm text-gray-500">Apple ID login is coming.</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        ));
    }, []);

    return {
        handleGoogleLoginClick,
        handleGitHubLogin,
        handleMicrosoftLogin,
        appleLogin
    };
}

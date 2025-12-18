// components/AuthModal.js
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/AuthApi';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox,
    Input,
    Link,
    Divider
} from '@nextui-org/react';
import { MailIcon } from './MailIcon.jsx';
import { LockIcon } from './LockIcon.jsx';
import { GoogleLogo } from './Google_logo';
import { AppleLogo } from './Apple_logo';
import { GitHubLogo } from './GitHubLogo';
import { MicrosoftLogo } from './MicrosoftLogo';
import toast from 'react-hot-toast';

export default function AuthModal() {
    const { showLoginModal, setShowLoginModal, loginUser } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        password1: '',
        password2: '',
        nonFieldErrors: '',
    });

    const backdrop = "blur";

    useEffect(() => {
        if (registrationSuccess) {
            const timer = setTimeout(() => {
                setShowResendButton(true);
            }, 30000);
            return () => clearTimeout(timer);
        }
    }, [registrationSuccess]);

    const handleAppleLogin = async () => {
        try {
            if (!window.AppleID) {
                toast.error('Apple Sign-In not loaded yet. Please try again.');
                return;
            }
            
            const response = await window.AppleID.auth.signIn();
            const { authorization } = response;
            
            const backendResponse = await authApi.post('/api/dj-rest-auth/apple/', {
                authorization_code: authorization.code,
                id_token: authorization.id_token
            });
            
            const { key } = backendResponse.data;
            await loginUser({ key });
            setShowLoginModal(false);
            window.dispatchEvent(new Event('login'));
        } catch (error) {
            console.error('Apple authentication error:', error);
            toast.error('Apple login failed');
        }
    };

    const handleGitHubLogin = () => {
        console.log('GitHub login button clicked');
        
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URL;
        const scope = 'user:email';
        
        console.log('GitHub config:', { clientId, redirectUri });
        
        if (!clientId) {
            toast.error('GitHub OAuth not configured');
            return;
        }
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${Date.now()}`;
        console.log('Opening popup with URL:', authUrl);
        
        // Open popup window for OAuth
        const popup = window.open(authUrl, 'github-login', 'width=500,height=600,scrollbars=yes,resizable=yes');
        console.log('Popup opened:', popup);
        
        // Listen for messages from popup window
        const handleMessage = (event) => {
            console.log('Message received from origin:', event.origin);
            console.log('Current window origin:', window.location.origin);
            console.log('Message data:', event.data);
            
            // More permissive origin check for debugging
            if (event.origin !== window.location.origin && event.origin !== 'http://localhost:3000') {
                console.log('Origin mismatch, ignoring message');
                return;
            }
            
            console.log('Received message from popup:', event.data);
            
            if (event.data && event.data.type === 'GITHUB_AUTH_SUCCESS') {
                const { code } = event.data;
                console.log('GitHub auth code received:', code);
                handleGitHubCallback(code);
                // Close popup after successful authentication
                if (popup && !popup.closed) {
                    popup.close();
                }
                window.removeEventListener('message', handleMessage);
            } else if (event.data && event.data.type === 'GITHUB_AUTH_ERROR') {
                console.log('GitHub auth error:', event.data.error);
                toast.error('GitHub login failed');
                if (popup && !popup.closed) {
                    popup.close();
                }
                window.removeEventListener('message', handleMessage);
            }
        };
        
        console.log('Adding message event listener');
        window.addEventListener('message', handleMessage);
        
        // Fallback: check if popup closed manually
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                console.log('Popup closed, removing message listener');
                window.removeEventListener('message', handleMessage);
            }
        }, 1000);
    };

    const handleGitHubCallback = async (authCode) => {
        try {
            console.log('Processing GitHub callback with code:', authCode);
            
            if (authCode) {
                const backendResponse = await authApi.post('/api/dj-rest-auth/github/', {
                    code: authCode
                });
                
                console.log('Backend response:', backendResponse.data);
                
                const { key } = backendResponse.data;
                await loginUser({ key });
                setShowLoginModal(false);
                window.dispatchEvent(new Event('login'));
                toast.success('GitHub login successful!');
            }
        } catch (error) {
            console.error('GitHub authentication error:', error);
            toast.error('GitHub login failed');
        }
    };

    // handleMicrosoftCallback removed - now using MSAL popup flow

    const handleMicrosoftLogin = async () => {
        const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
        
        if (!clientId) {
            toast.error('Microsoft OAuth not configured');
            return;
        }

        try {
            // Initialize MSAL instance if not already done
            if (!window.msalInstance) {
                const { PublicClientApplication } = await import('@azure/msal-browser');
                
                const msalConfig = {
                    auth: {
                        clientId: clientId,
                        authority: 'https://login.microsoftonline.com/common'
                        // No redirectUri needed for popup flow
                    },
                    cache: {
                        cacheLocation: 'sessionStorage',
                        storeAuthStateInCookie: false
                    }
                };
                
                window.msalInstance = new PublicClientApplication(msalConfig);
                await window.msalInstance.initialize();
            }

            // Request configuration
            const loginRequest = {
                scopes: ['openid', 'profile', 'email', 'User.Read'],
                prompt: 'select_account'
            };

            // Perform popup login
            const response = await window.msalInstance.loginPopup(loginRequest);
            
            if (response.idToken) {
                // Send ID token to backend (same as Google flow)
                const backendResponse = await authApi.post('/api/dj-rest-auth/microsoft/', {
                    access_token: response.idToken
                });
                
                const { key } = backendResponse.data;
                await loginUser({ key });
                setShowLoginModal(false);
                window.dispatchEvent(new Event('login'));
            }
        } catch (error) {
            console.error('Microsoft authentication error:', error);
            toast.error('Microsoft login failed');
        }
    };

    const initGoogleSignIn = () => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: "email profile",
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL,
            callback: handleCredentialResponse,
        });
        client.requestAccessToken();
    };

    useEffect(() => {
        // Load Google Sign-In SDK
        const googleScript = document.createElement('script');
        googleScript.src = 'https://accounts.google.com/gsi/client';
        googleScript.onload = () => {
            window.googleLoaded = true;
        };
        document.body.appendChild(googleScript);

        // Load Apple Sign-In SDK
        const appleScript = document.createElement('script');
        appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        appleScript.onload = () => {
            if (process.env.NEXT_PUBLIC_APPLE_CLIENT_ID) {
                window.AppleID.auth.init({
                    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
                    scope: 'email name',
                    redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URL,
                    usePopup: true
                });
            }
        };
        document.body.appendChild(appleScript);

        // Microsoft OAuth uses server-side flow, no client library needed

        return () => {
            // Cleanup scripts on unmount
            [googleScript, appleScript].forEach(script => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            });
        };
    }, []);

    const handleCredentialResponse = async (response) => {
        if (response.access_token) {
            try {
                const backendResponse = await authApi.post('/api/dj-rest-auth/google/', { access_token: response.access_token });
                const { key } = backendResponse.data;
                await loginUser({ key });
                setShowLoginModal(false);
                window.dispatchEvent(new Event('login'));
            } catch (error) {
                console.error('Authentication error:', error);
                toast.error('Login failed');
            }
        }
    };

    const toggleForms = () => {
        setIsSignUp(!isSignUp);
        setRegistrationSuccess(false);
        setShowResendButton(false);
        setFormData({ email: '', password: '' });
        setFormErrors({
            email: '',
            password: '',
            password1: '',
            password2: '',
            nonFieldErrors: '',
        });
        setRegisteredEmail('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        setFormErrors({
            email: '',
            password: '',
            password1: '',
            password2: '',
            nonFieldErrors: '',
        });

        if (isSignUp) {
            try {
                const response = await authApi.post('/api/dj-rest-auth/registration/', {
                    username: formData.email,
                    email: formData.email,
                    password1: formData.password,
                    password2: formData.password,
                });
                if ([200, 201, 204].includes(response.status)) {
                    toast.success("Registration successful! Please check your email to verify your account.");
                    setRegisteredEmail(formData.email);
                    setFormData({ email: '', password: '' });
                    setRegistrationSuccess(true);
                    setShowResendButton(false);
                }
            } catch (error) {
                if (error.response) {
                    const errorData = error.response.data;
                    let errors = {
                        email: '',
                        username: '',
                        password: '',
                        password1: '',
                        password2: '',
                        nonFieldErrors: '',
                    };
                    if (errorData.non_field_errors) {
                        errors.nonFieldErrors = errorData.non_field_errors.join(' ');
                    }
                    for (const [key, value] of Object.entries(errorData)) {
                        if (errors.hasOwnProperty(key)) {
                            errors[key] = Array.isArray(value) ? value.join(' ') : value;
                        }
                    }
                    setFormErrors(errors);
                    toast.error("Please correct the errors and try again.");
                } else {
                    toast.error("Network error or no response from the server.");
                }
            } finally {
                setIsLoading(false);
            }
            return;
        }

        try {
            await loginUser({ email: formData.email, password: formData.password });
            setShowLoginModal(false);
            window.dispatchEvent(new Event('login'));
        } catch (error) {
            // loginUser already handles error/toast
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerificationEmail = async () => {
        try {
            const response = await authApi.post('/api/dj-rest-auth/registration/resend-email/', { email: registeredEmail });
            if (response.status === 200) {
                toast.success('Verification email resent. Please check your inbox.');
            }
        } catch (error) {
            toast.error('Failed to resend verification email.');
        }
    };

    const handleGoogleLoginClick = () => {
        if (window.googleLoaded) {
            initGoogleSignIn();
        } else {
            console.error("Google Identity Services script not loaded yet.");
        }
    };

    const handlePasswordReset = async () => {
        if (!formData.email) {
            toast.error('Please enter your email address.');
            return;
        }

        try {
            await authApi.post('/api/dj-rest-auth/password/reset/', {
                email: formData.email
            });
            toast('If an account with that email exists, a password reset email has been sent.', {
                icon: '👏',
            });
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error('Failed to send password reset email.');
        }
    };

    const handleClose = () => {
        setShowLoginModal(false);
        setIsSignUp(false);
        setRegistrationSuccess(false);
        setShowResendButton(false);
        setFormData({ email: '', password: '' });
        setFormErrors({
            email: '',
            password: '',
            password1: '',
            password2: '',
            nonFieldErrors: '',
        });
        setRegisteredEmail('');
    };

    return (
        <Modal
            backdrop={backdrop}
            isOpen={showLoginModal}
            onClose={handleClose}
            placement="top-center"
            motionProps={{
                variants: {
                    enter: {
                        y: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut",
                        },
                    },
                    exit: {
                        y: -20,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn",
                        },
                    },
                }
            }}
        >
            <ModalContent as="form" onSubmit={handleSubmit}>
                <ModalHeader className="flex flex-col gap-1 items-center">
                    <h3 className="text-lg font-bold">{isSignUp ? "Create a new account" : "Log in"}</h3>
                </ModalHeader>
                <Divider/>
                <ModalBody>
                    {!registrationSuccess ? (
                        <div className="flex flex-col gap-4">
                            <Button
                                startContent={<GoogleLogo />}
                                color="secondary"
                                auto
                                onPress={handleGoogleLoginClick}
                            >
                                Continue with Google
                            </Button>
                            <Button
                                startContent={<AppleLogo />}
                                auto
                                onPress={handleAppleLogin}
                                color="warning"
                                className="text-white"
                            >
                                Continue with Apple
                            </Button>
                            <Button
                                startContent={<GitHubLogo />}
                                color="default"
                                auto
                                onPress={handleGitHubLogin}
                                className="bg-gray-900 text-white hover:bg-gray-800"
                            >
                                Continue with GitHub
                            </Button>
                            <Button
                                startContent={<MicrosoftLogo />}
                                color="primary"
                                auto
                                onPress={handleMicrosoftLogin}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Continue with Microsoft
                            </Button>

                            <Input
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                autoFocus
                                endContent={
                                    <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                }
                                label="Email"
                                placeholder="Enter your email"
                                variant="bordered"
                                error={!!formErrors.email || !!formErrors.username}
                            />
                            {formErrors.username && <p className="text-red-500">{formErrors.username}</p>}
                            {formErrors.email && <p className="text-red-500">{formErrors.email}</p>}
                            <Input
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                endContent={
                                    <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                }
                                label="Password"
                                placeholder="Enter your password"
                                type="password"
                                variant="bordered"
                            />
                            {formErrors.password && <p className="text-red-500">{formErrors.password}</p>}
                            {formErrors.password1 && <p className="text-red-500">{formErrors.password1}</p>}
                            {formErrors.password2 && <p className="text-red-500">{formErrors.password2}</p>}

                            {isSignUp ? (
                                <Checkbox defaultSelected size="sm">
                                    I agree to the{' '}
                                    <Link href="#" size="sm">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="#" size="sm">
                                        Privacy Policy
                                    </Link>
                                </Checkbox>
                            ) : (
                                <div className="flex py-2 px-1 justify-between">
                                    <Checkbox size="sm">Remember me</Checkbox>
                                    <Link color="primary" href="#" size="sm" onClick={handlePasswordReset}>
                                        Forgot password?
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <p>Registration successful! Please check your email to verify your account.</p>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {!registrationSuccess ? (
                        <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
                            <Button
                                isLoading={isLoading}
                                color="primary"
                                type="submit"
                                className="w-full capitalize mb-3 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                                spinner={
                                    <svg
                                        className="animate-spin h-5 w-5 text-current"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                }
                            >
                                {isSignUp ? 'Sign up' : 'Sign in'}
                            </Button>
                            {formErrors.nonFieldErrors && (
                                <p className="text-red-500">{formErrors.nonFieldErrors}</p>
                            )}

                            <p>
                                {isSignUp ? (
                                    <>
                                        Already a member?{' '}
                                        <Link color="primary" onPress={toggleForms} style={{ cursor: 'pointer' }}>
                                            Log in here!
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        Not a member?{' '}
                                        <Link color="primary" onPress={toggleForms} style={{ cursor: 'pointer' }}>
                                            Sign up now!
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
                            {showResendButton ? (
                                <Button
                                    color="success"
                                    flat
                                    auto
                                    onPress={resendVerificationEmail}
                                    className="mt-4"
                                >
                                    Resend Verification Email
                                </Button>
                            ) : (
                                <p>
                                    If you haven&apos;t received the email, please wait a moment or check your spam
                                    folder.
                                </p>
                            )}
                        </div>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
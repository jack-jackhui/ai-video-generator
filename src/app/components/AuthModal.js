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

    const appleLogin = () => toast.custom((t) => (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <AppleLogo />
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            Coming Soon!
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Apple ID login is coming.
                        </p>
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
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
            window.googleLoaded = true;
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
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
            await loginUser({ username: formData.email, password: formData.password });
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
                                onPress={appleLogin}
                                color="warning"
                                className="text-white"
                            >
                                Continue with Apple
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
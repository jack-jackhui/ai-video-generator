// components/Navbar.js
"use client";
import React from "react";
import { authApi } from '../api/AuthApi';
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import {
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Checkbox,
    Input,
    Link, Image, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu
} from "@nextui-org/react";
import { MailIcon } from './MailIcon.jsx';
import { LockIcon } from './LockIcon.jsx';
import { GoogleLogo } from "./Google_logo";
import { AppleLogo } from "./Apple_logo";
import { GitHubLogo } from './GitHubLogo';
import { MicrosoftLogo } from './MicrosoftLogo';
import NextLink from 'next/link';
import { ChevronDown, Lock, Activity, Flash, Server, TagUser, Scale } from "./Icons.jsx";
import toast, { Toaster } from 'react-hot-toast';
import { tokenStorage } from '../../lib/auth/tokenStorage';
import { logger } from '../../lib/logger';

export default function Navbar() {
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL;
    const mynotebooklmUrl = process.env.NEXT_PUBLIC_MYNOTEBOOKLM_URL;
    
    const { isAuthenticated, loginUser, logoutUser, showLoginModal, setShowLoginModal, verifyAuthentication } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [loginMessage, setLoginMessage] = useState('');
    const backdrop = "blur";

    const [isSignUp, setIsSignUp] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

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
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <AppleLogo />
                    </div>
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

    const handleMicrosoftLogin = async () => {
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
    };

    const handleGitHubLogin = () => {
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
    };

    const handleGitHubCallback = async (code) => {
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

    const handleCredentialResponse = async (response) => {
        if (response.access_token) {
            try {
                const backendResponse = await authApi.post('/api/dj-rest-auth/google/', { access_token: response.access_token });
                const { key } = backendResponse.data;
                await loginUser({ key });
                setLoginMessage('Login successful');
                setShowLoginModal(false);
                window.dispatchEvent(new Event('login'));
            } catch (error) {
                logger.error('Authentication error:', error);
                setLoginMessage('Login failed');
            }
        }
    };

    const handleLoginLogout = async () => {
        if (isAuthenticated) {
            logoutUser();
            setIsLoading(false);
            setFormData({ email: '', password: '' });
        } else {
            setShowLoginModal(true);
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

    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        password1: '',
        password2: '',
        nonFieldErrors: '',
    });

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
                    setLoginMessage('Registration successful! Please check your email to verify your account.');
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
                        if (Object.prototype.hasOwnProperty.call(errors, key)) {
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
            setLoginMessage('Login successful');
            window.dispatchEvent(new Event('login'));
        } catch (error) {
            // loginUser handles error toast
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
            logger.error("Google Identity Services script not loaded yet.");
        }
    };

    const handlePasswordReset = async () => {
        if (!formData.email) {
            toast.error('Please enter your email address.');
            return;
        }
        try {
            await authApi.post('/api/dj-rest-auth/password/reset/', { email: formData.email });
            toast('If an account with that email exists, a password reset email has been sent.', { icon: '👏' });
        } catch (error) {
            logger.error('Password reset error:', error);
            toast.error('Failed to send password reset email.');
        }
    };

    const icons = {
        chevron: <ChevronDown fill="currentColor" size={16} />,
        scale: <Scale className="text-warning" fill="currentColor" size={30} />,
        lock: <Lock className="text-success" fill="currentColor" size={30} />,
        activity: <Activity className="text-secondary" fill="currentColor" size={30} />,
        flash: <Flash className="text-primary" fill="currentColor" size={30} />,
        server: <Server className="text-success" fill="currentColor" size={30} />,
        user: <TagUser className="text-danger" fill="currentColor" size={30} />,
    };

    return (
        <nav className="bg-transparent">
            <div className="container mx-auto flex justify-between items-center px-4">
                <NextLink href="/" className="relative overflow-hidden h-15 flex items-center mr-4">
                    <Image src="/images/ai_video_logo_2.png" alt="Logo"
                        className="w-20 h-15"
                        style={{
                            position: 'relative',
                            top: '50%',
                            transform: 'translateY(-1%)',
                        }}
                    />
                </NextLink>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        )}
                    </svg>
                </button>
                
                {/* Desktop Menu */}
                <div className="hidden flex-grow md:flex items-center justify-start space-x-4">
                    <NextLink href="/">Home</NextLink>
                    <NextLink href="/dashboard">Dashboard</NextLink>
                    <NextLink href="/videoGen">AI Video Generator</NextLink>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className="text-md p-0 bg-transparent data-[hover=true]:bg-transparent"
                                endContent={icons.chevron}
                                radius="sm"
                                variant="light"
                            >
                                AI Image Generation
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="FaceSwap features" className="w-[340px]" itemClasses={{ base: "gap-1" }}>
                            <DropdownItem key="AiImageGen" startContent={icons.flash} href="/imageGen">
                                AI Image Generation / Editing
                            </DropdownItem>
                            <DropdownItem key="VideoFaceSwap" startContent={icons.user} href="/faceSwap">
                                Video Face Swap
                            </DropdownItem>
                            <DropdownItem key="PhotoFaceSwap" startContent={icons.activity} href="/photoFaceSwap">
                                Photo Face Swap
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    {isAuthenticated ? (
                        <NextLink href={`${chatbotUrl}/?token=${tokenStorage.get()}`} className="cursor-pointer">
                            AI Slide Deck Generator
                        </NextLink>
                    ) : (
                        <a onClick={handleLoginLogout} className="cursor-pointer">AI Slide Deck Generator</a>
                    )}

                    {isAuthenticated ? (
                        <NextLink href={`${mynotebooklmUrl}/?token=${tokenStorage.get()}`} className="cursor-pointer">
                            MyNoteBookLM
                        </NextLink>
                    ) : (
                        <a onClick={handleLoginLogout} className="cursor-pointer">MyNoteBookLM</a>
                    )}
                </div>
                
                <div className="hidden flex-grow md:flex items-center justify-end">
                    {isAuthenticated ? (
                        <Button color="warning" variant="ghost" onPress={handleLoginLogout}>Logout</Button>
                    ) : (
                        <Button color="warning" variant="ghost" onPress={handleLoginLogout}>Login</Button>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className={`${mobileMenuOpen ? "fixed inset-0" : "hidden"} bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center space-y-4 md:hidden`}>
                    <NextLink href="/" className="text-xl">Home</NextLink>
                    <NextLink href="/dashboard" className="text-xl">Dashboard</NextLink>
                    <NextLink href="/videoGen" className="text-xl">AI Video Generator</NextLink>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button disableRipple className="text-lg p-0 bg-transparent" endContent={icons.chevron} radius="sm" variant="light">
                                AI Image Generation
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="FaceSwap features" className="w-[340px]" itemClasses={{ base: "gap-1" }}>
                            <DropdownItem key="AIImageGeneration" startContent={icons.user} href="/imageGen">
                                AI Image Generation
                            </DropdownItem>
                            <DropdownItem key="VideoFaceSwap" startContent={icons.user} href="/faceSwap">
                                Video Face Swap
                            </DropdownItem>
                            <DropdownItem key="PhotoFaceSwap" startContent={icons.activity} href="/photoFaceSwap">
                                Photo Face Swap
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    {isAuthenticated ? (
                        <NextLink href={`${chatbotUrl}/?token=${tokenStorage.get()}`} className="cursor-pointer text-xl">
                            AI Slide Deck Generator
                        </NextLink>
                    ) : (
                        <a onClick={handleLoginLogout} className="cursor-pointer text-xl">AI Slide Deck Generator</a>
                    )}

                    {isAuthenticated ? (
                        <NextLink href={`${mynotebooklmUrl}/?token=${tokenStorage.get()}`} className="cursor-pointer text-xl">
                            MyNoteBookLM
                        </NextLink>
                    ) : (
                        <a onClick={handleLoginLogout} className="cursor-pointer text-xl">MyNoteBookLM</a>
                    )}

                    <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Modal Popup */}
            <Modal
                backdrop={backdrop}
                isOpen={showLoginModal}
                onOpenChange={onOpenChange}
                onClose={() => {
                    setShowLoginModal(false);
                    setIsSignUp(false);
                    setRegistrationSuccess(false);
                    setShowResendButton(false);
                    setFormData({ email: '', password: '' });
                    setFormErrors({ email: '', password: '', password1: '', password2: '', nonFieldErrors: '' });
                    setRegisteredEmail('');
                }}
                placement="top-center"
                motionProps={{
                    variants: {
                        enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
                        exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
                    }
                }}
            >
                <ModalContent as="form" onSubmit={handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 items-center">
                        <h3 className="text-lg font-bold">{isSignUp ? "Create a new account" : "Log in"}</h3>
                    </ModalHeader>
                    <Divider />
                    <ModalBody>
                        {!registrationSuccess ? (
                            <div className="flex flex-col gap-4">
                                <Button startContent={<GoogleLogo />} color="secondary" auto onPress={handleGoogleLoginClick}>
                                    Continue with Google
                                </Button>
                                <Button startContent={<AppleLogo />} auto onPress={appleLogin} color="warning" className="text-white">
                                    Continue with Apple
                                </Button>
                                <Button startContent={<GitHubLogo />} color="default" auto onPress={handleGitHubLogin} className="bg-orange-500 text-white hover:bg-orange-600 border border-orange-400">
                                    Continue with GitHub
                                </Button>
                                <Button startContent={<MicrosoftLogo />} color="primary" auto onPress={handleMicrosoftLogin} className="bg-blue-600 text-white hover:bg-blue-700">
                                    Continue with Microsoft
                                </Button>

                                <Input
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    autoFocus
                                    endContent={<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                                    label="Email"
                                    placeholder="Enter your email"
                                    variant="bordered"
                                    isInvalid={!!formErrors.email || !!formErrors.username}
                                />
                                {formErrors.username && <p className="text-red-500">{formErrors.username}</p>}
                                {formErrors.email && <p className="text-red-500">{formErrors.email}</p>}
                                <Input
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    endContent={<LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
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
                                        I agree to the <Link href="#" size="sm">Terms of Service</Link> and <Link href="#" size="sm">Privacy Policy</Link>
                                    </Checkbox>
                                ) : (
                                    <div className="flex py-2 px-1 justify-between">
                                        <Checkbox size="sm">Remember me</Checkbox>
                                        <Link color="primary" href="#" size="sm" onClick={handlePasswordReset}>Forgot password?</Link>
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
                                        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                                        </svg>
                                    }
                                >
                                    {isSignUp ? 'Sign up' : 'Sign in'}
                                </Button>
                                {loginMessage && <p>{loginMessage}</p>}
                                {formErrors.nonFieldErrors && <p className="text-red-500">{formErrors.nonFieldErrors}</p>}
                                <p>
                                    {isSignUp ? (
                                        <>Already a member? <Link color="primary" onPress={toggleForms} style={{ cursor: 'pointer' }}>Log in here!</Link></>
                                    ) : (
                                        <>Not a member? <Link color="primary" onPress={toggleForms} style={{ cursor: 'pointer' }}>Sign up now!</Link></>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
                                {showResendButton ? (
                                    <Button color="success" flat auto onPress={resendVerificationEmail} className="mt-4">
                                        Resend Verification Email
                                    </Button>
                                ) : (
                                    <p>If you haven&apos;t received the email, please wait a moment or check your spam folder.</p>
                                )}
                            </div>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Toaster />
        </nav>
    );
}

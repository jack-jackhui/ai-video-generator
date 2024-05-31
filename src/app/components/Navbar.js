// components/Navbar.js
"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import {useState, useEffect, useRef} from "react";
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
import {MailIcon} from './MailIcon.jsx';
import {LockIcon} from './LockIcon.jsx';
import {GoogleLogo} from "./Google_logo";
import {AppleLogo} from "./Apple_logo";
//import useGoogleApi from '../hook/useGoogleApi';
//import useGoogleIdentityServices from "../hook/useGoogleIdentityServices";
import NextLink from 'next/link';
import {ChevronDown, Lock, Activity, Flash, Server, TagUser, Scale} from "./Icons.jsx";
import toast, { Toaster } from 'react-hot-toast';
export default function Navbar() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    //console.log(backendUrl);
    //useGoogleIdentityServices()
    //useGoogleApi();
    const { isAuthenticated, setIsAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');
    //const signInDivRef = useRef(null);
    //const [backdrop, setBackdrop] = React.useState('opaque')

    const backdrop = "blur";

    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

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
    ))
    // Function to initialize Google SignIn
    const initGoogleSignIn = () => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: "email profile",
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL, // Update this
            callback: handleCredentialResponse,
        });

        // Request the authorization code
        client.requestAccessToken();
    };

    useEffect(() => {
        // Ensure the Google Identity Services script is loaded
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
            window.googleLoaded = true;
        };
        document.body.appendChild(script);

        // Clean up
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCredentialResponse = async (response) => {
        if (response.access_token) {
            //console.log(response.access_token);
            //return

            try {
                const backendResponse = await fetch(`${backendUrl}/api/dj-rest-auth/google/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: response.access_token }),
                });

                if (!backendResponse.ok) {
                    throw new Error('Failed to authenticate with the backend');
                }

                const data = await backendResponse.json();
                localStorage.setItem('authToken', data.token); // Store the token or sessionToken as per your backend response
                //console.log(setIsAuthenticated);
                setIsAuthenticated(true);
                //setShowLoginModal(true);
                //setIsLoggedIn(true);
                setLoginMessage('Login successful');
                setShowLoginModal(false);
                toast.success("Login successful");
                router.push('/videoGen');
                //onOpenChange(false);
                window.dispatchEvent(new Event('login'));

            } catch (error) {
                console.error('Authentication error:', error);
                setLoginMessage('Login failed');
            }
        }
    };

    // Check for authentication token on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            //console.log(setIsAuthenticated);
            setIsAuthenticated(true);
            //setIsLoggedIn(true); // Set logged in if token exists
        }
    }, []);

    const handleLoginLogout = async () => {
        if (isAuthenticated) {
            await handleLogout();
        } else {
            setShowLoginModal(true);
        }
    };
// Function to handle user logout
    const handleLogout = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/dj-rest-auth/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            localStorage.removeItem('authToken'); // Remove the stored token
            //console.log(setIsAuthenticated);
            setIsAuthenticated(false);
            //setIsLoggedIn(false);
            setLoginMessage('Logged out successfully.');
            toast.success('Logged out successfully!')
            router.push('/'); // Redirect to home page
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out!');
            //alert('Failed to log out.');
        }
    };


    const toggleForms = () => setIsSignUp(!isSignUp);

    // Add a state to hold the error messages
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        password1: '',
        password2: '',
        nonFieldErrors: '', // For general errors not tied to a specific field
    });
    const handleSubmit = async () => {
        let endpoint, body;

        // Reset form errors state on each submission attempt
        setFormErrors({
            email: '',
            password: '',
            password1: '',
            password2: '',
            nonFieldErrors: '',
        });

        if (isSignUp) {
            // If signing up, include both password1 and password2 fields
            endpoint = `${backendUrl}/api/dj-rest-auth/registration/`;
            body = JSON.stringify({
                username: formData.email, // Optionally use email as username or generate a unique username
                email: formData.email,
                password1: formData.password,
                password2: formData.password, // Assuming you have a state to capture password confirmation
            });
        } else {
            // If logging in, include the username field with the email as its value
            endpoint = `${backendUrl}/api/dj-rest-auth/login/`;
            body = JSON.stringify({
                username: formData.email, // Send email as username for login
                password: formData.password,
            });
        }
        //console.log("==============", body);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errors = { email: '', password: '', password1: '', password2: '', nonFieldErrors: '' };

                // Handle non-field errors
                if (errorData.non_field_errors) {
                    errors.nonFieldErrors = errorData.non_field_errors.join(' '); // Assuming it's an array
                }

                // Handle field-specific errors if errorData is not an array
                if (!Array.isArray(errorData)) {
                    Object.keys(errorData).forEach(key => {
                        // Join error messages if they're in an array
                        errors[key] = Array.isArray(errorData[key]) ? errorData[key].join(' ') : errorData[key];
                    });
                }

                setFormErrors(errors);
                //console.log("___", formErrors); // Update the state with the errors
                return; // Stop execution
            }

            const data = await response.json();
            //console.log(data); // Handle success. Maybe set authentication tokens, redirect, etc.

            localStorage.setItem('authToken', data.access); // Store the token or sessionToken as per your backend response
            //console.log(setIsAuthenticated);
            setIsAuthenticated(true);
            //setIsLoggedIn(true);
            setLoginMessage('Successful');
            toast.success("Login successful");
            window.dispatchEvent(new Event('login'));
            setShowLoginModal(false);
            onOpenChange(false); // Close modal on success
            //router.push('/videoGen');
        } catch (error) {
            console.error('Error:', error);
            setFormErrors({ nonFieldErrors: 'An error occurred. Please try again.' });
        }
    };

    const handleGoogleLoginClick = () => {
        if (window.googleLoaded) {
            initGoogleSignIn();
        } else {
            console.error("Google Identity Services script not loaded yet.");
        }
    };

    // Function to trigger password reset
    const handlePasswordReset = async () => {
        if (!formData.email) {
            toast.error('Please enter your email address.')
            //alert('Please enter your email address.');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/dj-rest-auth/password/reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            if (!response.ok) {
                throw new Error('Failed to send password reset email');
            }

            const data = await response.json();
            toast('If an account with that email exists, \na password reset email has been sent.', {
                icon: '👏',
            });
            //alert('If an account with that email exists, a password reset email has been sent.');
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error('Failed to send password reset email.')
            //alert('Failed to send password reset email.');
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
                               position: 'relative', // Allows you to fine-tune the position
                               top: '50%',          // Centers the logo vertically
                               transform: 'translateY(-1%)', // Ensures the centering is accurate
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
                    <NextLink href="/" >Home</NextLink>
                    <NextLink href="/dashboard" >Dashboard</NextLink>
                    <NextLink href="/videoGen" >AI Video Generator</NextLink>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className="text-md p-0 bg-transparent data-[hover=true]:bg-transparent"
                                endContent={icons.chevron}
                                radius="sm"
                                variant="light"
                            >
                                AI FaceSwap
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="FaceSwap features"
                            className="w-[340px]"
                            itemClasses={{
                                base: "gap-4",
                            }}
                        >
                            <DropdownItem
                                key="VideoFaceSwap"
                                description="AI Video Face Swap"
                                startContent={icons.user}
                            >
                                <NextLink href="/faceSwap">
                                Video Face Swap
                                </NextLink>
                            </DropdownItem>
                            <DropdownItem
                                key="PhotoFaceSwap"
                                description="AI Photo Face Swap."
                                startContent={icons.activity}
                            >
                                <NextLink href="/photoFaceSwap">
                                Photo Face Swap
                                </NextLink>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <a href="#" >For Developers (API)</a>
                    <a href="#" >Tools</a>
                </div>
                <div className="hidden flex-grow md:flex items-center justify-end">
                    {isAuthenticated ? (
                        <Button color="warning" variant="ghost" onPress={handleLogout} >
                            Logout
                        </Button>
                    ) : (
                        <Button color="warning" variant="ghost" onPress={handleLoginLogout}>
                            Login
                        </Button>
                    )}
                </div>
                {/* Mobile Menu */}
                <div className={`${mobileMenuOpen ? 'fixed inset-0' : 'hidden'} bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center space-y-4 md:hidden`}>
                    <NextLink href="/" className="text-xl">Home</NextLink>
                    <NextLink href="/dashboard" className="text-xl">Dashboard</NextLink>
                    <NextLink href="/videoGen" className="text-xl">AI Video Generator</NextLink>
                    <NextLink href="/faceSwap" className="text-xl">AI FaceSwap</NextLink>
                    <NextLink href="/photoFaceSwap" className="text-xl">AI Photo FaceSwap</NextLink>
                    <a href="#" className="text-xl">For Developers (API)</a>
                    <a href="#" className="text-xl">Tools</a>
                    {isAuthenticated ? (
                        <Button onPress={handleLogout} color="warning" variant="ghost">
                            Logout
                        </Button>
                    ) : (
                        <Button onPress={handleLoginLogout} color="warning" variant="ghost">
                            Login
                        </Button>
                    )}
                    <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Modal Popup*/}
                <Modal
                    backdrop={backdrop}
                    isOpen={showLoginModal}
                    onOpenChange={onOpenChange}
                    onClose={() => {
                        setShowLoginModal(false);
                        //onOpenChange(false);
                        setIsSignUp(false);
                    }}
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
                    <ModalContent>
                        <ModalHeader className="flex flex-col gap-1 items-center">
                            <h3 className="text-lg font-bold">{isSignUp ? "Create a new account" : "Log in"}</h3>
                        </ModalHeader>
                        <Divider/>
                        <ModalBody>

                            <div className="flex flex-col gap-4">
                                {/* Social Media Login Buttons */}
                                <Button startContent={<GoogleLogo/>}
                                        color="secondary"
                                        auto
                                        onPress={handleGoogleLoginClick}
                                >
                                    Continue with Google
                                </Button>
                                <Button
                                    startContent={<AppleLogo/>}
                                    auto
                                    onPress={appleLogin}
                                    color="warning"
                                    className="text-white"
                                >
                                    Continue with Apple
                                </Button>
                                {/* Email Password Input */}

                                <Input
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    autoFocus
                                    endContent={
                                        <MailIcon
                                            className="text-2xl text-default-400 pointer-events-none flex-shrink-0"/>
                                    }
                                    label="Email"
                                    placeholder="Enter your email"
                                    variant="bordered"
                                />
                                {formErrors.username && <p className="text-red-500">{formErrors.username}</p>}
                                <Input
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    endContent={<LockIcon
                                        className="text-2xl text-default-400 pointer-events-none flex-shrink-0"/>}
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
                                            I agree to the <Link href="#" size="sm">Terms of Service</Link> and{" "}
                                            <Link href="#" size="sm">Privacy Policy</Link>
                                        </Checkbox>
                                    )
                                    :
                                    (
                                        <div className="flex py-2 px-1 justify-between">
                                            <Checkbox size="sm">
                                                Remember me
                                            </Checkbox>
                                            <Link color="primary" href="#" size="sm" onClick={handlePasswordReset}>
                                                Forgot password?
                                            </Link>
                                        </div>
                                    )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <div style={{width: '100%', textAlign: 'center', padding: '20px'}}>
                                <Button color="primary" onPress={handleSubmit}
                                        className="w-full capitalize mb-3 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg">
                                    {isSignUp ? "Sign up" : "Sign in"}
                                </Button>
                                {loginMessage && <p>{loginMessage}</p>}
                                {formErrors.nonFieldErrors && <p className="text-red-500">{formErrors.nonFieldErrors}</p>}
                                <p>
                                    {isSignUp ? (
                                        <>
                                            Already a member?{' '}
                                            <Link color="primary" onPress={toggleForms} style={{cursor: 'pointer'}}>
                                                Log in here!
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            Not a member?{' '}
                                            <Link color="primary" onPress={toggleForms} style={{cursor: 'pointer'}}>
                                                Sign up now!
                                            </Link>
                                        </>
                                    )}
                                </p>
                            </div>
                        </ModalFooter>

                    </ModalContent>
                </Modal>

                <Toaster />

        </nav>
    );
};


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
    Link
} from "@nextui-org/react";
import {MailIcon} from './MailIcon.jsx';
import {LockIcon} from './LockIcon.jsx';
import {GoogleLogo} from "./Google_logo";
import {AppleLogo} from "./Apple_logo";
//import useGoogleApi from '../hook/useGoogleApi';
//import useGoogleIdentityServices from "../hook/useGoogleIdentityServices";
import NextLink from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
export default function Navbar() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    //console.log(backendUrl);
    //useGoogleIdentityServices()
    //useGoogleApi();
    const { isAuthenticated, setIsAuthenticated, showLoginModal, setShowLoginModal } = useAuth();
    const router = useRouter();

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

    {/* Deprecated
        const initGoogleSignIn = () => {
            const client = window.google.accounts.oauth2.initCodeClient({
                client_id: "1093324646306-ls0epdq7o8nfvhgq4dj3d0i1a3m59ncc.apps.googleusercontent.com",
                scope: "email profile",
                ux_mode: "popup",
                redirect_uri: "https://developers.google.com/oauthplayground", // Update this
                callback: handleCredentialResponse,
            });

            // Request the authorization code
            client.requestCode();
        };
    */}

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
                setShowLoginModal(true);
                //setIsLoggedIn(true);
                setLoginMessage('Login successful');
                toast.success("Login successful");
                onOpenChange(false);
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

    {/* Old code for Google login - Deprecated
    const handleGoogleLogin = async () => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();
        try {
            const GoogleUser = await GoogleAuth.signIn();

            // Get the ID token to send to your backend
            const id_token = GoogleUser.getAuthResponse().id_token;

            // Send the ID token to your backend via HTTPS
            // Adjust this to your backend's endpoint
            fetch('http://127.0.0.1:9090/api/google/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: id_token }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    localStorage.setItem('authToken', data.token); // Store the token
                    setIsLoggedIn(true); // Update login status
                    onOpenChange(false); // Close modal on success
                    setLoginMessage('Login successful'); // Provide feedback
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setLoginMessage('Login failed'); // Provide feedback
                });
        } catch (error) {
            console.error('Login failed:', error);
            setLoginMessage('Login failed'); // Provide feedback
            if (error.error === 'popup_closed_by_user') {
                setLoginMessage('The user closed the Google sign-in popup.'); // Specific feedback
            }
        }
    };
    */}

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

            localStorage.setItem('authToken', data.token); // Store the token or sessionToken as per your backend response
            //console.log(setIsAuthenticated);
            setIsAuthenticated(true);
            //setIsLoggedIn(true);
            setLoginMessage('Successful');
            window.dispatchEvent(new Event('login'));
            setShowLoginModal(false);
            onOpenChange(false); // Close modal on success
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


    return (
        <nav className="py-4 bg-transparent">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex-grow">
                    <NextLink href="/" className="mx-2 hover:text-gray-300 text-2xl font-bold mr-4">
                    V
                    </NextLink>
                    <NextLink href="/dashboard" className="mx-2 hover:text-gray-300">
                        Dashboard
                    </NextLink>
                    <NextLink href="/videoGen" className="mx-2 hover:text-gray-300">
                            AI Video Generator
                    </NextLink>
                    <a href="#" className="mx-2 hover:text-gray-300">For Developers (API)</a>
                    <a href="#" className="mx-2 hover:text-gray-300">Tools</a>
                </div>
                <div>
                    {isAuthenticated ? (
                        <>
                            Logged in {/* Replace UserIcon with your user icon component */}
                            <Button
                                variant="flat"
                                color="warning"
                                onPress={handleLogout}
                                className="capitalize"
                            >
                                Logout
                            </Button>
                        </>

                    ) : (
                        // Display login/sign-up button if not logged in
                    <Button
                        variant="flat"
                        color="warning"
                        onPress={() => setShowLoginModal(true)}
                        className="capitalize"
                    >
                        Log in
                    </Button>
                        )}
                </div>

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
                                    onPress={() => alert("Log in with Apple")}
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

            </div>
        </nav>
    );
};


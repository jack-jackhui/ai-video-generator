"use client";
import React, { useState, useEffect } from 'react';
import {
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Link
} from "@nextui-org/react";
import { authApi } from '../../api/AuthApi';
import toast from 'react-hot-toast';
import { SocialLoginButtons } from './SocialLoginButtons';
import { LoginForm } from './LoginForm';
import { useOAuthHandlers } from '../../hooks/useOAuthHandlers';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../../lib/logger';

export function AuthModal({ isOpen, onClose }) {
    const { loginUser, setShowLoginModal } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        password1: '',
        password2: '',
        username: '',
        nonFieldErrors: '',
    });

    const {
        handleGoogleLoginClick,
        handleGitHubLogin,
        handleMicrosoftLogin,
        appleLogin
    } = useOAuthHandlers({ setShowLoginModal });

    useEffect(() => {
        if (registrationSuccess) {
            const timer = setTimeout(() => {
                setShowResendButton(true);
            }, 30000);
            return () => clearTimeout(timer);
        }
    }, [registrationSuccess]);

    const resetForm = () => {
        setIsSignUp(false);
        setRegistrationSuccess(false);
        setShowResendButton(false);
        setFormData({ email: '', password: '' });
        setFormErrors({
            email: '',
            password: '',
            password1: '',
            password2: '',
            username: '',
            nonFieldErrors: '',
        });
        setRegisteredEmail('');
        setLoginMessage('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
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
            username: '',
            nonFieldErrors: '',
        });
        setRegisteredEmail('');
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

    const resendVerificationEmail = async () => {
        try {
            const response = await authApi.post('/api/dj-rest-auth/registration/resend-email/', {
                email: registeredEmail
            });
            if (response.status === 200) {
                toast.success('Verification email resent. Please check your inbox.');
            }
        } catch (error) {
            toast.error('Failed to resend verification email.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        setFormErrors({
            email: '',
            password: '',
            password1: '',
            password2: '',
            username: '',
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

    return (
        <Modal
            backdrop="blur"
            isOpen={isOpen}
            onClose={handleClose}
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
                    <h3 className="text-lg font-bold">
                        {isSignUp ? "Create a new account" : "Log in"}
                    </h3>
                </ModalHeader>
                <Divider />
                <ModalBody>
                    {!registrationSuccess ? (
                        <>
                            <SocialLoginButtons
                                onGoogleClick={handleGoogleLoginClick}
                                onAppleClick={appleLogin}
                                onGitHubClick={handleGitHubLogin}
                                onMicrosoftClick={handleMicrosoftLogin}
                            />
                            <LoginForm
                                formData={formData}
                                setFormData={setFormData}
                                formErrors={formErrors}
                                isSignUp={isSignUp}
                                onPasswordReset={handlePasswordReset}
                            />
                        </>
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
    );
}

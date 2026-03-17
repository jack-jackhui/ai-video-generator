// components/Navbar.js
"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import {
    Button,
    Image,
    DropdownItem,
    DropdownTrigger,
    Dropdown,
    DropdownMenu
} from "@nextui-org/react";
import NextLink from 'next/link';
import { ChevronDown, Activity, Flash, TagUser } from "./Icons.jsx";
import { Toaster } from 'react-hot-toast';
import { tokenStorage } from '../../lib/auth/tokenStorage';
import { AuthModal } from './auth/AuthModal';

export default function Navbar() {
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL;
    const mynotebooklmUrl = process.env.NEXT_PUBLIC_MYNOTEBOOKLM_URL;

    const { isAuthenticated, logoutUser, showLoginModal, setShowLoginModal } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLoginLogout = async () => {
        if (isAuthenticated) {
            logoutUser();
        } else {
            setShowLoginModal(true);
        }
    };

    const icons = {
        chevron: <ChevronDown fill="currentColor" size={16} />,
        activity: <Activity className="text-secondary" fill="currentColor" size={30} />,
        flash: <Flash className="text-primary" fill="currentColor" size={30} />,
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
                        <DropdownMenu 
                            aria-label="FaceSwap features" 
                            className="w-[340px]" 
                            itemClasses={{ base: "gap-1" }}
                            onAction={(key) => {
                                if (key === "AiImageGen") router.push("/imageGen");
                                if (key === "VideoFaceSwap") router.push("/faceSwap");
                                if (key === "PhotoFaceSwap") router.push("/photoFaceSwap");
                            }}
                        >
                            <DropdownItem key="AiImageGen" startContent={icons.flash}>
                                AI Image Generation / Editing
                            </DropdownItem>
                            <DropdownItem key="VideoFaceSwap" startContent={icons.user}>
                                Video Face Swap
                            </DropdownItem>
                            <DropdownItem key="PhotoFaceSwap" startContent={icons.activity}>
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
                        <DropdownMenu 
                            aria-label="FaceSwap features" 
                            className="w-[340px]" 
                            itemClasses={{ base: "gap-1" }}
                            onAction={(key) => {
                                setMobileMenuOpen(false);
                                if (key === "AIImageGeneration") router.push("/imageGen");
                                if (key === "VideoFaceSwap") router.push("/faceSwap");
                                if (key === "PhotoFaceSwap") router.push("/photoFaceSwap");
                            }}
                        >
                            <DropdownItem key="AIImageGeneration" startContent={icons.user}>
                                AI Image Generation
                            </DropdownItem>
                            <DropdownItem key="VideoFaceSwap" startContent={icons.user}>
                                Video Face Swap
                            </DropdownItem>
                            <DropdownItem key="PhotoFaceSwap" startContent={icons.activity}>
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

            <AuthModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />

            <Toaster />
        </nav>
    );
}

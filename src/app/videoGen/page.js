// videoGen/page.js
"use client";
import React, { useEffect, useState} from 'react';
//import { useRouter } from 'next/navigation';
import VideoGenerator from '../components/VideoGen'; // Adjust the path as necessary
import Footer from '../components/Footer';
import Navbar from "../components/Navbar";
//import Layout from "../layout"
export default function VideoGenPage() {
    //const router = useRouter();
    //const [isAuthenticated, setIsAuthenticated] = useState(false);
    //const [showLoginModal, setShowLoginModal] = useState(false);

    {/* Checked user login - disabled for now
        useEffect(() => {
            // Check if the authToken exists in local storage
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                // If no authToken, redirect to login page or show a login prompt
                router.push('/'); // Adjust the path to your login page
            } else {
                setIsAuthenticated(true);
            }
        }, [router]);

        if (!isAuthenticated) {
            // Optionally, render a loading spinner or a message indicating the authentication status
            return <div>Checking authentication...</div>;
        }
    */}


    return (
        <>
            <Navbar />
            <VideoGenerator />
            <Footer />

        </>

    );
}

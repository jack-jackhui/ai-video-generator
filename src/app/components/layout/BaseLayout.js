import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

/**
 * Shared base layout component
 * Provides consistent page structure across all routes
 */
const BaseLayout = ({ children, className = '' }) => {
    return (
        <div className={`min-h-screen flex flex-col bg-gradient-to-br from-black via-slate-800 to-purple-950 ${className}`}>
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default BaseLayout;

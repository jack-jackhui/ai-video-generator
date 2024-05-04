import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FaceSwapLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-slate-800 to-purple-950">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default FaceSwapLayout;

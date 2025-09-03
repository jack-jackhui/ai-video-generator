import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ImageGenLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-slate-800 to-purple-950">
            <Navbar />
            <main className="flex-grow m-0 p-0">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default ImageGenLayout;

// app/page.js
import * as React from "react";
import {NextUIProvider} from "../lib/NextUi";
//import {AuthProvider} from "./context/AuthContext";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';

export default function Page() {
    return (
        <NextUIProvider>
        <div className="min-h-screen bg-gradient-to-br from-black via-slate-800 to-purple-950" >
            <Navbar />
            <Hero />
            < Footer />
            {/* Include additional sections here */}
        </div>
        </NextUIProvider>
    );
}

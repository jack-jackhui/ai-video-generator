// app/page.js
//"use client";
import * as React from "react";
//import {useEffect} from "react";
import {NextUIProvider} from "../lib/NextUi";
//import {AuthProvider} from "./context/AuthContext";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
//import { initializeAuth } from './api/AuthApi'
export default function Page() {
    /*
    useEffect(() => {
        initializeAuth();
    }, []);

     */

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

// app/providers.jsx
'use client';

import { NextUIProvider } from "../lib/NextUi";
import { useRouter } from 'next/navigation';
import {AuthProvider} from "./context/AuthContext";
export function Providers({ children }) {
    const router = useRouter();

    return (
        <AuthProvider>
        <NextUIProvider navigate={router.push}>
            {children}
        </NextUIProvider>
        </ AuthProvider>
    );
}


import { Inter } from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";
const inter = Inter({ subsets: ["latin"] });
import { Suspense } from 'react';
//import { Metadata } from 'next';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};
export const metadata = {
  title: "AI Video Generator",
  description: "Generated Videos Using AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark text-foreground bg-background">
      <body className={inter.className}>
          <Providers>
              <Suspense>
              {children}
              </Suspense>
          </Providers>
      </body>
    </html>
  );
}

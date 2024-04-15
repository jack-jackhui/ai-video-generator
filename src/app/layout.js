import { Inter } from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Video Generator",
  description: "Generated Videos Using AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark text-foreground bg-background">
      <body className={inter.className}>
          <Providers>
              {children}
          </Providers>
      </body>
    </html>
  );
}

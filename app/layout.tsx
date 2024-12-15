import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import "./navbar.css"; // Import the new CSS file for the navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeChess Web",
  description: "A website uses LiChess API to play chess on your board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item">
              <Link href="/">Home</Link>
            </li>
            <li className="navbar-item">
              <Link href="/profile">Profile</Link>
            </li>
          </ul>
        </nav>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

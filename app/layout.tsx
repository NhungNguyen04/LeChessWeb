import type { Metadata } from "next";
import { Geist, Azeret_Mono as Geist_Mono } from 'next/font/google';
import "./globals.css";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import "./navbar.css";

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
          <div className="navbar-container">
            <Link href="/" className="navbar-logo">
              LeChess Web
            </Link>
            <ul className="navbar-list">
              <li className="navbar-item">
                <Link href="/">Home</Link>
              </li>
              <li className="navbar-item">
                <Link href="/profile">Profile</Link>
              </li>
            </ul>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
        <ToastContainer className="toast-container" />
      </body>
    </html>
  );
}


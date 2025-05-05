import React from 'react';
import '../src/styles/globals.css';
import Image from 'next/image';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>VibeWell - Beauty & Wellness Booking</title>
        <meta name="description" content="Book beauty and wellness services, try on virtual makeup, and join wellness events" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#384F41" />
        <link rel="icon" href="/images/favicon.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card py-4">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="font-bold text-xl text-primary-600">VibeWell</div>
            <nav className="hidden md:flex space-x-4">
              <a href="/" className="px-3 py-2 text-foreground hover:text-primary-600">Home</a>
              <a href="/spa/services" className="px-3 py-2 text-foreground hover:text-primary-600">Services</a>
              <a href="/spa/bookings" className="px-3 py-2 text-foreground hover:text-primary-600">Bookings</a>
              <a href="/spa/signup" className="px-3 py-2 text-foreground hover:text-primary-600">Sign Up</a>
            </nav>
            <div className="md:hidden">
              <button className="p-2 text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-card border-t border-border mt-12 py-6">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">© {new Date().getFullYear()} VibeWell. All rights reserved.</p>
            <div className="flex justify-center mt-4 space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </footer>
      </body>
    </html>

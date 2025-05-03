'use client';

import '../../src/styles/globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function SpaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top header with logo */}
      <header className="bg-primary-800 py-4 px-4">
        <div className="app-container flex justify-center items-center">
          <Image 
            src="/images/logo.svg" 
            alt="VibeWell"
            width={180}
            height={40}
            priority
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-6">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="bg-card border-t border-border px-4 py-3 sticky bottom-0 shadow-md">
        <div className="app-container flex justify-between items-center">
          <NavButton 
            icon="🏠" 
            label="Home" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')}
            href="/spa"
          />
          <NavButton 
            icon="📅" 
            label="Bookings" 
            active={activeTab === 'bookings'} 
            onClick={() => setActiveTab('bookings')}
            href="/spa/bookings"
            notifications={2}
          />
          <NavButton 
            icon="🔍" 
            label="Explore" 
            active={activeTab === 'explore'} 
            onClick={() => setActiveTab('explore')}
            href="/spa/services"
          />
          <NavButton 
            icon="💬" 
            label="Social" 
            active={activeTab === 'social'} 
            onClick={() => setActiveTab('social')}
            href="/spa/social"
            notifications={3}
          />
          <NavButton 
            icon="👤" 
            label="Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            href="/spa/profile"
          />
        </div>
      </nav>
    </div>
  );
}

type NavButtonProps = {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  href: string;
  notifications?: number;
};

function NavButton({ icon, label, active, onClick, href, notifications }: NavButtonProps) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors ${
        active ? 'text-primary-600' : 'text-muted-foreground'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {notifications && notifications > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {notifications > 9 ? '9+' : notifications}
        </span>
      )}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
} 
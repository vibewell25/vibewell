import React from 'react';
import Link from 'next/link';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link href="/">Home</Link> | 
      <Link href="/bookings"> Bookings</Link> | 
      <Link href="/services"> Services</Link> | 
      <Link href="/profile"> Profile</Link>
    </nav>
    <main style={{ padding: '1rem' }}>
      {children}
    </main>
    <footer style={{ padding: '1rem', borderTop: '1px solid #ccc', textAlign: 'center' }}>
      © {new Date().getFullYear()} VibeWell - All rights reserved
    </footer>
  </div>
export default Layout;

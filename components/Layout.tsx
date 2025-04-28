import React from 'react';
import Link from 'next/link';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link href="/"><a>Home</a></Link> | 
      <Link href="/services"><a>Services</a></Link> | 
      <Link href="/bookings"><a>Bookings</a></Link> | 
      <Link href="/payments"><a>Payments</a></Link> | 
      <Link href="/calendar"><a>Calendar</a></Link> | 
      <Link href="/security"><a>Security</a></Link> | 
      <Link href="/loyalty"><a>Loyalty</a></Link> | 
      <Link href="/referrals"><a>Referrals</a></Link> | 
      <Link href="/notifications"><a>Notifications</a></Link> | 
      <Link href="/social"><a>Social</a></Link> | 
      <Link href="/staff"><a>Staff</a></Link> | 
      <Link href="/staff-schedules"><a>Schedules</a></Link> | 
      <Link href="/training-modules"><a>Training</a></Link> | 
      <Link href="/training-progress"><a>Progress</a></Link> | 
      <Link href="/benefit-claims"><a>Benefits</a></Link> | 
      <Link href="/payroll-records"><a>Payroll</a></Link> | 
      <Link href="/attendance"><a>Attendance</a></Link> | 
      <Link href="/promotion-codes"><a>Promos</a></Link> | <Link href="/calendar-settings"><a>Calendar Settings</a></Link>
    </nav>
    <main style={{ padding: '1rem' }}>{children}</main>
  </div>
);

export default Layout;

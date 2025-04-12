'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { MobileLayout } from '@/components/layout/MobileLayout';

export default function MobilePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the device is mobile
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      // Redirect to desktop version if not a mobile device
      router.push('/');
    }
  }, [router]);

  return (
    <MobileLayout hideNavigation>
      <div className="flex flex-col min-h-screen">
        <div className="relative h-[65vh]">
          <div className="absolute inset-0">
            <Image
              src="https://placehold.co/500x800?text=Beauty+Model"
              alt="Beauty and wellness"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60"></div>
          </div>
          
          <div className="absolute top-16 left-0 right-0 p-6 z-10">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">Beauty<br />and wellness<br />services</h1>
              <p className="text-2xl font-medium mt-2">on demand</p>
            </div>
          </div>
        </div>

        <div className="bg-white flex-1 px-6 py-10 -mt-10 rounded-t-3xl flex flex-col space-y-4 z-10">
          <Button 
            className="h-14 rounded-full font-medium bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600"
            asChild
          >
            <Link href="/login">Sign Up</Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-14 rounded-full font-medium border-2"
            asChild
          >
            <Link href="/login">Log in</Link>
          </Button>

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-medium">Experience our mobile UI</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/select-role">Select Role</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/mobile-dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/bookings/search">Services</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/bookings/details">Booking</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile/mobile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
} 
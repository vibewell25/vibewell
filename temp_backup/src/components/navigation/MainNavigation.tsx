import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full border-b bg-background z-50 py-2">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">VibeWell</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/services" className="text-sm font-medium">
              Services
            </Link>
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium">
              Contact
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="h-8 rounded-md px-3 text-xs bg-primary text-primary-foreground shadow hover:bg-primary/90">Book Now</button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="h-9 w-9 rounded-md inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <div className="px-7">
                <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                  <span className="font-bold text-xl">VibeWell</span>
                </Link>
              </div>
              <div className="flex flex-col space-y-3 mt-8 px-7">
                <Link href="/services" className="text-md font-medium" onClick={() => setIsOpen(false)}>
                  Services
                </Link>
                <Link href="/about" className="text-md font-medium" onClick={() => setIsOpen(false)}>
                  About
                </Link>
                <Link href="/contact" className="text-md font-medium" onClick={() => setIsOpen(false)}>
                  Contact
                </Link>
                <div className="pt-4">
                  <button 
                    className="w-full bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>

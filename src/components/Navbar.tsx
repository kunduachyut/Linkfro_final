"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent background scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <a 
          href="/" 
          className="flex items-center space-x-2"
          aria-label="Pulse Robot"
        >
          <img 
            src="/logo.svg" 
            alt="Pulse Robot Logo" 
            className="h-10 sm:h-12 border-0" 
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a 
            href="/" 
            className="nav-link"
          >
            Home
          </a>
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <SignedOut>
            {/* Only render Clerk modal buttons after mount and when not signed-in to avoid Clerk runtime errors */}
            {mounted && !isSignedIn && (
              <>
                <SignInButton>
                  <button className="button-secondary text-xs sm:text-sm font-medium h-6 sm:h-8 px-3 sm:px-4 flex items-center justify-center">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="button-primary text-xs sm:text-sm font-medium h-6 sm:h-8 px-3 sm:px-4 flex items-center justify-center">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName || user.username || 'User'}
                </span>
              )}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: {
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '2px solid #f97316',
                    }
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>

        {/* Mobile menu button - increased touch target */}
        <button 
          className="md:hidden text-gray-700 p-3 focus:outline-none" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div className={cn(
        "fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <nav className="flex flex-col space-y-8 items-center mt-8">
          <a 
            href="/" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Home
          </a>
          <a 
            href="/about" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            About
          </a>
          <a 
            href="/contact" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Contact
          </a>
          
          {/* Mobile Auth Buttons */}
          <div className="flex flex-col items-center gap-4 mt-4 w-full">
            <SignedOut>
              {mounted && !isSignedIn && (
                <>
                  <SignInButton>
                    <button className="button-secondary text-base font-medium h-10 px-6 w-full flex items-center justify-center">
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="button-primary text-base font-medium h-10 px-6 w-full flex items-center justify-center">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              )}
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2">
                {user && (
                  <span className="text-base font-medium text-gray-700">
                    {user.firstName || user.username || 'User'}
                  </span>
                )}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '2px solid #f97316',
                      }
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
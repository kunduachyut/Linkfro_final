"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Search, User, ArrowRight } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import AuthModal from "./AuthModal";

const NewNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isSignedIn } = useUser();
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

  const handleRequestAccess = () => {
    if (isSignedIn) {
      // User is logged in, open the AuthModal for request access
      setIsAuthModalOpen(true);
    }
    // If user is not logged in, the SignInButton will handle the click
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-md" 
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between px-4">
        <a 
          href="/" 
          className="flex items-center space-x-2"
          aria-label="Linkfro"
        >
          <img 
            src="/linkfro_logo_transparent.png" 
            alt="Linkfro Logo" 
            className="h-14 w-auto"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#why-choose" className="nav-link">Why Linkfro</a>
          <a href="#special-offers" className="nav-link">Offers</a>
          <a href="#marketplace" className="nav-link">Marketplace</a>
          <a href="#packages" className="nav-link">Packages</a>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            {mounted && !isSignedIn && (
              <>
                <SignInButton>
                  <button className="text-gray-700 hover:text-pulse-500 font-medium">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button 
                    onClick={handleRequestAccess}
                    className="flex items-center justify-center group"
                    style={{
                      backgroundColor: '#FE5C02',
                      borderRadius: '1440px',
                      boxSizing: 'border-box',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '14px',
                      lineHeight: '20px',
                      padding: '8px 16px',
                      border: '1px solid white',
                    }}
                  >
                    Request Access
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </SignUpButton>
              </>
            )}
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRequestAccess}
                className="flex items-center justify-center group"
                style={{
                  backgroundColor: '#FE5C02',
                  borderRadius: '1440px',
                  boxSizing: 'border-box',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '20px',
                  padding: '8px 16px',
                  border: '1px solid white',
                }}
              >
                Request Access
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: {
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid #f97316',
                    }
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-700 p-2 focus:outline-none" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <nav className="flex flex-col space-y-6 items-center mt-8">
          <a 
            href="#why-choose" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Why Linkfro
          </a>
          <a 
            href="#special-offers" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Offers
          </a>
          <a 
            href="#marketplace" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Marketplace
          </a>
          <a 
            href="#packages" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Packages
          </a>
          
          {/* Mobile Auth Buttons */}
          <div className="flex flex-col items-center gap-4 mt-8 w-full">
            <SignedOut>
              {mounted && !isSignedIn && (
                <>
                  <SignInButton>
                    <button className="text-gray-700 hover:text-pulse-500 font-medium w-full py-3 text-center">
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button 
                      onClick={handleRequestAccess}
                      className="flex items-center justify-center group w-full"
                      style={{
                        backgroundColor: '#FE5C02',
                        borderRadius: '1440px',
                        boxSizing: 'border-box',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '14px',
                        lineHeight: '20px',
                        padding: '12px 24px',
                        border: '1px solid white',
                      }}
                    >
                      Request Access
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </SignUpButton>
                </>
              )}
            </SignedOut>
            <SignedIn>
              <div className="flex flex-col items-center gap-4 w-full">
                <button 
                  onClick={handleRequestAccess}
                  className="flex items-center justify-center group w-full"
                  style={{
                    backgroundColor: '#FE5C02',
                    borderRadius: '1440px',
                    boxSizing: 'border-box',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: '20px',
                    padding: '12px 24px',
                    border: '1px solid white',
                  }}
                >
                  Request Access
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <div className="flex items-center gap-3">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: {
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '2px solid #f97316',
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </SignedIn>
          </div>
        </nav>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};

export default NewNavbar;
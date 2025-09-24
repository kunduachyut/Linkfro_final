"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const [allowed, setAllowed] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function checkRole() {
      try {
        const res = await fetch('/api/admin-roles/current');
        if (!mounted) return;
        if (!res.ok) {
          setAllowed(false);
          return;
        }
        const j = await res.json();
        const isAllowed = !!(j?.isSuper) || (j?.role === 'websites') || (j?.role === 'requests');
        setAllowed(Boolean(isAllowed));
      } catch (e) {
        setAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    if (isSignedIn) checkRole();
    else setChecking(false);

    return () => { mounted = false; };
  }, [isSignedIn]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent background scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
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
          href="#" 
          className="flex items-center space-x-2"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="Pulse Robot"
        >
          <img 
            src="/logo.svg" 
            alt="Pulse Robot Logo" 
            className="h-10 sm:h-12" 
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-8">
            <a 
              href="#" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
            >
              Home
            </a>
            <a href="#features" className="nav-link">About</a>
            <a href="#details" className="nav-link">Contact</a>
          </div>

          {/* If the floating panel wouldn't appear, show auth controls in the navbar */}
          {!checking && (!isSignedIn || !allowed) && (
            <div className="flex items-center space-x-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-full font-medium text-xs sm:text-sm lg:text-base h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-5 cursor-pointer transition-colors bg-transparent border border-gray-200 text-gray-700 hover:bg-gray-100" onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--accent-hover)'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full font-medium text-xs sm:text-sm lg:text-base h-8 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-5 cursor-pointer transition-colors" style={{backgroundColor: 'var(--accent-primary)', color: 'white'}} onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--accent-hover)'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--accent-primary)'}>
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden sm:inline">{user?.fullName || user?.primaryEmailAddress?.emailAddress || ''}</span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: {
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: '2px solid var(--accent-primary)',
                        }
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          )}
        </nav>

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
            href="#" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Home
          </a>
          <a 
            href="#features" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            About
          </a>
          <a 
            href="#details" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
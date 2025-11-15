'use client';
import React, { useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { 
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import AuthModal from "@/components/AuthModal";

export function HeaderWithAuth() {
  const [open, setOpen] = useState(false);
  const scrolled = useScroll(10);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    {
      label: 'Why Linkfro',
      href: '#why-choose',
    },
    {
      label: 'Offers',
      href: '#special-offers',
    },
    {
      label: 'Marketplace',
      href: '#marketplace',
    },
    {
      label: 'Packages',
      href: '#packages',
    },
  ];

  const handleRequestAccess = () => {
    if (isSignedIn) {
      // User is logged in, open the AuthModal for request access
      setIsAuthModalOpen(true);
    }
    // If user is not logged in, the SignInButton will handle the click
  };

  useEffect(() => {
    if (open) {
      // Disable scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scroll
      document.body.style.overflow = '';
    }

    // Cleanup when component unmounts (important for Next.js)
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 mx-auto w-full border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
          {
            'bg-white/90 supports-[backdrop-filter]:bg-white/50 border-border backdrop-blur-lg shadow-md':
              scrolled && !open,
            'bg-white/90': open,
          },
        )}
      >
        <nav
          className={cn(
            'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
            {
              'md:px-2': scrolled,
            },
          )}
        >
          <a 
            href="/" 
            className="flex items-center space-x-2"
            aria-label="Linkfro"
          >
            <img 
              src="/linkfro_logo_transparent.png" 
              alt="Linkfro Logo" 
              className="h-10 w-auto"
            />
          </a>
          
          <div className="hidden items-center gap-2 md:flex">
            {links.map((link, i) => (
              <a key={i} className={buttonVariants({ variant: 'ghost' })} href={link.href}>
                {link.label}
              </a>
            ))}
            
            {/* Auth Buttons for Desktop */}
            <SignedOut>
              {mounted && (
                <>
                  <SignInButton>
                    <button className="text-gray-700 hover:text-pulse-500 font-medium">
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button 
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
          
          <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </nav>

        <div
          className={cn(
            'bg-white/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
            open ? 'block' : 'hidden',
          )}
        >
          <div
            data-slot={open ? 'open' : 'closed'}
            className={cn(
              'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
              'flex h-full w-full flex-col justify-between gap-y-2 p-4',
            )}
          >
            <div className="grid gap-y-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  className={buttonVariants({
                    variant: 'ghost',
                    className: 'justify-start',
                  })}
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
            
            {/* Auth Buttons for Mobile */}
            <div className="flex flex-col gap-2">
              <SignedOut>
                {mounted && (
                  <>
                    <SignInButton>
                      <button className="text-gray-700 hover:text-pulse-500 font-medium w-full py-3 text-center">
                        Login
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button 
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
                    onClick={() => {
                      handleRequestAccess();
                      setOpen(false);
                    }}
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
          </div>
        </div>
      </header>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
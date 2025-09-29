"use client";

import React, { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function Header() {
  const { user, isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 shadow w-full" style={{backgroundColor: 'var(--base-primary)', borderBottom: '1px solid var(--base-tertiary)'}}>
      {/* Nav */}
      <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        <a className="text-lg sm:text-xl font-bold" href="/" style={{color: 'var(--secondary-primary)'}}>
          Name
        </a>
        <a href="/dashboard/consumer" className="text-sm sm:text-base hidden sm:block transition-colors" style={{color: 'var(--secondary-lighter)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--accent-primary)'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--secondary-lighter)'}>
          Advertiser
        </a>
        <a href="/dashboard/publisher" className="text-sm sm:text-base hidden sm:block transition-colors" style={{color: 'var(--secondary-lighter)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--accent-primary)'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--secondary-lighter)'}>
          Publisher
        </a>
        <a href="/dashboard/superadmin" className="text-sm sm:text-base hidden sm:block transition-colors" style={{color: 'var(--secondary-lighter)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--accent-primary)'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--secondary-lighter)'}>
          Super Admin
        </a>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        <SignedOut>
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
              <span className="text-sm font-medium" style={{color: 'var(--secondary-lighter)'}}>
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
    </header>
  );
}
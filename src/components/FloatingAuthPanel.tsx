"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useUser, SignInButton, SignUpButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const FloatingAuthPanel = () => {
  const { isSignedIn, user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [allowed, setAllowed] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [isSuperRole, setIsSuperRole] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        // j: { role: 'websites'|'requests'|null, isSuper: boolean }
        const isAllowed = !!(j?.isSuper) || (j?.role === 'websites') || (j?.role === 'requests');
        setAllowed(Boolean(isAllowed));
        setAdminRole(typeof j?.role === 'string' ? j.role : null);
        setIsSuperRole(Boolean(j?.isSuper));
      } catch (e) {
        setAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    // Only check if the user is signed in. If not, skip and hide.
    if (isSignedIn) checkRole();
    else setChecking(false);

    return () => {
      mounted = false;
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isSignedIn]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    // Clear any existing close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    // Open the panel
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout to close the panel after a short delay
    // This prevents flickering when moving between the open button and the panel
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const navigateToRole = (role: string) => {
    switch (role) {
      case 'consumer':
        router.push('/dashboard/consumer?via=panel');
        break;
      case 'publisher':
        router.push('/dashboard/publisher?via=panel');
        break;
      case 'superadmin':
        router.push('/dashboard/superadmin?via=panel');
        break;
      default:
        router.push('/');
    }
  };

  if (!isOpen) {
    // If we're still checking permissions, don't render anything yet.
    if (checking) return null;
    // Don't show the panel to users who are not signed in or not allowed.
    if (!isSignedIn || !allowed) return null;

    if (typeof document === 'undefined') return null;

    return createPortal(
      <button
        ref={openButtonRef}
        onMouseEnter={handleMouseEnter}
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[9999] text-gray-700 p-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 hover:text-gray-800"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        }}
        aria-label="Open auth panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>,
      document.body
    );
  }

  // If still checking permissions, render nothing to avoid flicker.
  if (checking) return null;
  // Only allow signed-in users with the appropriate admin roles to see this panel.
  if (!isSignedIn || !allowed) return null;

  // Helper boolean: when true show all options
  const isSuper = isSuperRole || adminRole === 'super';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={panelRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed top-4 right-4 z-[9999] p-6 w-80 rounded-2xl border shadow-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Development Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-white/10 transition-colors"
          aria-label="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">User Roles</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="bg-white/20 hover:bg-white/30 text-gray-800 text-sm py-2 px-3 rounded-full border border-white/30 shadow-sm backdrop-blur-sm"
              onClick={() => router.push('/')}
            >
              Home
            </Button>

            {(isSuper || adminRole === 'publisher') && (
              <Button
                className="bg-white/20 hover:bg-white/30 text-gray-800 text-sm py-2 px-3 rounded-full border border-white/30 shadow-sm backdrop-blur-sm"
                onClick={() => navigateToRole('publisher')}
              >
                Publisher
              </Button>
            )}

            {(isSuper || adminRole === 'requests') && (
              <Button
                className="bg-white/20 hover:bg-white/30 text-gray-800 text-sm py-2 px-3 rounded-full border border-white/30 shadow-sm backdrop-blur-sm"
                onClick={() => router.push('/dashboard/Content_Manager')}
              >
                Content Manager
              </Button>
            )}

            {isSuper && (
              <Button
                className="bg-white/20 hover:bg-white/30 text-gray-800 text-sm py-2 px-3 rounded-full border border-white/30 shadow-sm backdrop-blur-sm"
                onClick={() => navigateToRole('superadmin')}
              >
                Super Admin
              </Button>
            )}

            {(isSuper || adminRole === 'websites') && (
              <Button
                className="bg-white/20 hover:bg-white/30 text-gray-800 text-sm py-2 px-3 rounded-full border border-white/30 shadow-sm backdrop-blur-sm"
                onClick={() => router.push('/dashboard/Website_analyst')}
              >
                Website Analyst
              </Button>
            )}

            {(isSuper || adminRole === 'consumer') && (
              <Button
                className="bg-white/20 hover:bg-white/30 text-gray-800 text-sm py-2 px-3 rounded-full border border-white/30 shadow-sm backdrop-blur-sm"
                onClick={() => navigateToRole('consumer')}
              >
                Consumer
              </Button>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Authentication</h4>
          {isSignedIn ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Signed in as:</p>
              <p className="text-sm font-medium text-gray-800">{user?.emailAddresses[0]?.emailAddress || user?.fullName || "User"}</p>
              <SignOutButton>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          ) : (
            mounted && (
              <div className="flex space-x-2">
                <SignInButton mode="modal">
                  <Button className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="flex-1 bg-white/20 border border-white/30 text-gray-800 hover:bg-white/30 py-2 px-4 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FloatingAuthPanel;
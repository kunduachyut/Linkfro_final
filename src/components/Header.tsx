"use client";

import React, { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  SignOutButton,
} from "@clerk/nextjs";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";
import { Search, Bell, Settings, HelpCircle, LogOut, Download } from "lucide-react";

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

      {/* Global Utility Elements with Tooltips */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Bar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative hidden sm:block">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search websites, orders, or invoices quickly</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Bell Icon (Notifications) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View your latest Linkfro updates and alerts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
            {/* Help / Support Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Need assistance? Contact Linkfro Support</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Export Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                    <Download className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download your purchase or analytics data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Settings Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                    onClick={() => window.location.href = "/dashboard/consumer?tab=settings"}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage account preferences and security</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* User Avatar / Name */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    {user && (
                      <span className="text-sm font-medium hidden md:inline" style={{color: 'var(--secondary-lighter)'}}>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>View or edit your advertiser profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Logout Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SignOutButton>
                    <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </SignOutButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign out of your Linkfro account</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
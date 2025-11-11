"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
// Removed Clerk imports since we don't need them

type NavItem = {
  label: string;
  href?: string;
  isExternal?: boolean;
  children?: NavItem[];
};

const navigationData: NavItem[] = [
  {
    label: "Marketplace",
    href: "#marketplace",
  },
  {
    label: "For Publishers",
    href: "#publishers",
  },
  {
    label: "Resources",
    children: [
      { label: "Documentation", href: "#docs" },
      { label: "Blog", href: "#blog" },
      { label: "Support", href: "#support" },
    ],
  },
  {
    label: "Community",
    children: [
      { label: "Forum", href: "#forum" },
      { label: "Discord", href: "#discord" },
      { label: "Events", href: "#events" },
    ],
  },
  { label: "Pricing", href: "#pricing" },
];

const LinkFroLogo = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-[87px] h-6 text-white", className)}
    width="87"
    height="24"
    viewBox="0 0 87 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text x="0" y="18" fontFamily="Arial" fontSize="18" fill="currentColor">LinkFro</text>
  </svg>
);

const AnnouncementBar = () => (
  <div className="relative overflow-hidden border-b border-white/15 backdrop-blur-[50px] bg-gradient-to-r from-[#FF6B35]/20 via-[#5E4EE4]/20 to-transparent">
    <div className="max-w-section-default mx-auto w-full px-6 py-3">
      <div className="flex items-center justify-center gap-4">
        <p className="font-display text-sm md:text-md lg:text-lg text-white text-center">
          Launch your website marketplace with LinkFro today!
        </p>
        <a
          href="#get-started"
          className="flex-shrink-0 text-small-button-text font-body tracking-[.3px] px-6 min-h-8 inline-flex items-center justify-center rounded-lg bg-accent-violet hover:bg-accent-violet-light text-white transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  </div>
);

const NavLink = ({ item, isMobile }: { item: NavItem; isMobile?: boolean }) => {
  const Component = item.href && !item.isExternal ? Link : 'a';
  return (
    <Component
      href={item.href || '#'}
      {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={
        isMobile
          ? "block w-full px-4 py-3 text-lg text-text-primary hover:bg-white/5 rounded-md"
          : "block rounded-lg bg-transparent px-4 py-2 text-white transition-colors duration-300 hover:bg-white/[.15] relative z-10 text-sm xl:text-md"
      }
    >
      {item.label}
    </Component>
  );
};

export default function HeaderNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  // Removed Clerk user hook since we don't need it

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setHeaderVisible(false);
        } else {
          setHeaderVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', controlHeader);
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
  }, [isMobileMenuOpen]);
  
  // Removed Clerk loading check since we don't need it
  
  return (
    <header className={cn(
      "fixed top-0 z-[1000] w-full transition-transform duration-300",
      headerVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="p-1">
        <div className="rounded-lg border border-[rgba(193,193,193,0.15)] bg-[rgba(0,0,0,0.92)] backdrop-blur-[30px]">
          <div className="flex min-h-[68px] items-center justify-between px-3 lg:px-3">
            <Link href="/" className="lg:hidden" aria-label="LinkFro Home">
              <LinkFroLogo />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Global">
              <Link href="/" className="mx-4" aria-label="LinkFro Home">
                <LinkFroLogo />
              </Link>
              <ul className="flex items-center">
                {navigationData.map((item) => (
                  <li key={item.label} className="group relative">
                    <LinkOrButton item={item} />
                    {item.children && (
                      <ul className="submenu absolute top-full z-0 hidden group-hover:flex min-w-40 flex-col gap-y-1 rounded-lg border border-[rgba(193,193,193,0.15)] bg-[rgba(0,0,0,0.92)] p-1 shadow-[0_15px_14px_0px_rgba(0,0,0,0.4)]">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <NavLink item={child} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              {/* Simplified auth buttons for clean frontend */}
              <a href="#publish" className="hidden whitespace-nowrap px-5 py-3 text-sm leading-[130%] tracking-[.3px] text-text-secondary sm:block xl:text-md hover:text-white transition-colors">
                Publish
              </a>
              <a href="#get-started" className="text-small-button-text xl:text-sm font-body tracking-[.3px] ml-1 px-[14px] min-h-[39px] inline-flex items-center justify-center rounded-lg text-white bg-gradient-to-r from-cta-primary-start to-cta-primary-end hover:brightness-110 transition-all">
                Get Started
              </a>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 lg:hidden text-text-secondary hover:text-white"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 top-0 z-50 h-screen w-screen bg-background-base lg:hidden">
              <div className="flex justify-between items-center p-3 border-b border-border">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <LinkFroLogo />
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X size={28} className="text-text-secondary"/>
                </button>
              </div>
              <div className="p-5 overflow-y-auto h-[calc(100vh-69px)]">
                <ul className="flex flex-col gap-y-2">
                  {navigationData.map((item) => (
                    <li key={item.label}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === item.label ? null : item.label)}
                            className="flex justify-between items-center w-full px-4 py-3 text-lg text-left text-text-primary hover:bg-white/5 rounded-md"
                          >
                            {item.label}
                            <ChevronDown size={20} className={cn("transition-transform", mobileSubmenuOpen === item.label && "rotate-180")} />
                          </button>
                          {mobileSubmenuOpen === item.label && (
                            <ul className="pl-6 pt-2 flex flex-col gap-y-1">
                              {item.children.map(child => (
                                <li key={child.label} onClick={() => setIsMobileMenuOpen(false)}>
                                  <NavLink item={child} isMobile />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <div onClick={() => setIsMobileMenuOpen(false)}>
                          <NavLink item={item} isMobile />
                        </div>
                      )}
                    </li>
                  ))}
                  <li className="pt-4 border-t border-border">
                    {/* Simplified auth buttons for clean frontend */}
                    <a href="#get-started" className="block w-full px-4 py-3 text-lg text-text-primary hover:bg-white/5 rounded-md text-left">
                      Get Started
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#publish" 
                      className="block w-full px-4 py-3 text-lg text-text-primary hover:bg-white/5 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Publish
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <AnnouncementBar />
    </header>
  );
}

const LinkOrButton = ({ item }: { item: NavItem }) => {
  const commonClasses = "relative z-10 flex min-h-[68px] items-center gap-x-1 whitespace-nowrap px-2 xl:px-4 py-3 text-sm xl:text-md leading-[130%] tracking-[.3px] text-text-secondary hover:text-white transition-colors";
  
  if (item.href) {
    const Component = item.isExternal ? 'a' : Link;
    return (
      <Component
        href={item.href}
        {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={commonClasses}
      >
        {item.label}
        {item.children && <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />}
      </Component>
    );
  }

  return (
    <button className={commonClasses}>
      {item.label}
      {item.children && <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />}
    </button>
  );
};
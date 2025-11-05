"use client";

import React, { useState, useEffect } from "react";
import { motion, Transition } from "framer-motion";
import { 
  Globe, 
  ShoppingBag, 
  FileText, 
  Upload, 
  AlertTriangle, 
  Users, 
  Shield,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Pin,
  Home
} from "lucide-react";
import Link from 'next/link';
import { useUser } from '@clerk/clerk-react';

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const textVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: { duration: 0.2 },
      x: { duration: 0.2 }
    }
  },
  closed: {
    opacity: 0,
    x: -10,
    transition: {
      opacity: { duration: 0.2 },
      x: { duration: 0.2 }
    }
  }
};

const transitionProps: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

type Tab =
  | "websites"
  | "userContent"
  | "purchases"
  | "contentRequests"
  | "priceConflicts"
  | "userRequests"
  | "roles";

interface SuperAdminSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  // new prop: list of tabs the current user is allowed to see
  allowedTabs: Tab[];
  // new prop: flags indicating whether a tab has new items since last view
  newItems?: Record<Tab, boolean>;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function SuperAdminSidebar({
  activeTab,
  setActiveTab,
  allowedTabs,
  newItems: propNewItems,
  onCollapseChange
}: SuperAdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const { user, isLoaded } = useUser();
   
  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);
  
  const togglePin = () => {
    setIsPinned(!isPinned);
    // If we're pinning, make sure the sidebar is open
    if (!isPinned) {
      setIsCollapsed(false);
    }
  };

  const newItems = propNewItems || {
    websites: false,
    userContent: false,
    purchases: false,
    contentRequests: false,
    priceConflicts: false,
    userRequests: false,
    roles: false,
  };

  const show = (tab: Tab) => allowedTabs.includes(tab);

  const navItems = [
    {
      id: "websites" as Tab,
      label: "Websites",
      icon: Globe,
      onClick: () => setActiveTab("websites"),
      show: show("websites"),
      hasNew: newItems.websites,
    },
    {
      id: "purchases" as Tab,
      label: "Purchases",
      icon: ShoppingBag,
      onClick: () => setActiveTab("purchases"),
      show: show("purchases"),
      hasNew: newItems.purchases,
    },
    {
      id: "contentRequests" as Tab,
      label: "Content Requests",
      icon: FileText,
      onClick: () => setActiveTab("contentRequests"),
      show: show("contentRequests"),
      hasNew: newItems.contentRequests,
    },
    {
      id: "userContent" as Tab,
      label: "User Uploads",
      icon: Upload,
      onClick: () => setActiveTab("userContent"),
      show: show("userContent"),
      hasNew: newItems.userContent,
    },
    {
      id: "priceConflicts" as Tab,
      label: "Price Conflicts",
      icon: AlertTriangle,
      onClick: () => setActiveTab("priceConflicts"),
      show: show("priceConflicts"),
      hasNew: newItems.priceConflicts,
    },
    {
      id: "userRequests" as Tab,
      label: "User Requests",
      icon: Users,
      onClick: () => setActiveTab("userRequests"),
      show: show("userRequests"),
      hasNew: newItems.userRequests,
    },
    {
      id: "roles" as Tab,
      label: "Roles",
      icon: Shield,
      onClick: () => setActiveTab("roles"),
      show: show("roles"),
      hasNew: newItems.roles,
    },
  ].filter(item => item.show);

  return (
    <motion.div
      className="sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-gray-200"
      initial={isCollapsed && !isPinned ? "closed" : "open"}
      animate={isCollapsed && !isPinned ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => !isPinned && setIsCollapsed(false)}
      onMouseLeave={() => !isPinned && setIsCollapsed(true)}
    >
      <div className="relative z-40 flex text-gray-700 h-full shrink-0 flex-col bg-white transition-all">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[54px]">
          <motion.div
            initial={isCollapsed && !isPinned ? "closed" : "open"}
            animate={isCollapsed && !isPinned ? "closed" : "open"}
            variants={textVariants}
          >
            <p className="text-sm font-bold text-blue-600">
              Content Manager Dashboard
            </p>
          </motion.div>
          {/* Removed the toggle button at the top */}
        </div>

        <div className="flex h-full flex-col">
          <div className="flex grow flex-col gap-4 p-2">
            <div className="flex w-full flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center rounded-lg px-2 py-1.5 transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <motion.div
                      className="ml-2 flex items-center gap-2 overflow-hidden"
                      initial={isCollapsed && !isPinned ? "closed" : "open"}
                      animate={isCollapsed && !isPinned ? "closed" : "open"}
                      variants={textVariants}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                      {item.hasNew && (
                        <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500"></span>
                      )}
                    </motion.div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={togglePin}
                className="w-full flex items-center rounded-lg px-2 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Pin className={`w-4 h-4 flex-shrink-0 ${isPinned ? "text-blue-600" : ""}`} />
                <motion.div
                  className="ml-2 overflow-hidden"
                  initial={isCollapsed && !isPinned ? "closed" : "open"}
                  animate={isCollapsed && !isPinned ? "closed" : "open"}
                  variants={textVariants}
                >
                  <span className="text-sm font-medium whitespace-nowrap">
                    {isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
                  </span>
                </motion.div>
              </button>
              
              <button
                onClick={() => {
                  // Handle logout
                  window.location.href = "/logout";
                }}
                className="w-full flex items-center rounded-lg px-2 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <motion.div
                  className="ml-2 overflow-hidden"
                  initial={isCollapsed && !isPinned ? "closed" : "open"}
                  animate={isCollapsed && !isPinned ? "closed" : "open"}
                  variants={textVariants}
                >
                  <span className="text-sm font-medium whitespace-nowrap">Logout</span>
                </motion.div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Profile section at the bottom */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center">
            <Link href="/dashboard/profile" className="w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {isLoaded && user?.imageUrl ? (
                    <img src={user.imageUrl} alt={user.fullName ?? 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{isLoaded ? (user?.fullName ?? 'Profile') : 'Profile'}</p>
                  <p className="text-xs text-gray-500">View profile</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Toggle button at the bottom of the sidebar */}
        <button
          className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors z-50"
          onClick={() => {
            if (isPinned) {
              // If pinned, unpin and collapse
              setIsPinned(false);
              setIsCollapsed(true);
            } else {
              // Toggle collapse state
              setIsCollapsed(!isCollapsed);
            }
          }}
        >
          {isCollapsed && !isPinned ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
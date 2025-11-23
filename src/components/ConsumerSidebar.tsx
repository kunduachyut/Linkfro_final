"use client";

import React, { useState, useEffect } from "react";
import { motion, Transition } from "framer-motion";
import { 
  Store, 
  ShoppingBag, 
  Clock, 
  Megaphone, 
  Edit, 
  BarChart, 
  ShoppingCart, 
  User,
  Home,
  ChevronLeft,
  ChevronRight,
  Pin,
  LogOut
} from "lucide-react";
import { useCart } from "../app/context/CartContext";
import Link from 'next/link';
import { useUser } from '@clerk/clerk-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface ConsumerSidebarProps {
  activeTab: "marketplace" | "purchases" | "pendingPayments" | "adRequests" | "contentRequests" | "analytics";
  setActiveTab: (tab: "marketplace" | "purchases" | "pendingPayments" | "adRequests" | "contentRequests" | "analytics") => void;
  stats: {
    total: number;
    purchases: number;
    pendingPayments: number;
    adRequests: number;
    contentRequests: number;
  };
  onCollapseChange?: (collapsed: boolean) => void;
}

export function ConsumerSidebar({ 
  activeTab, 
  setActiveTab,
  stats,
  onCollapseChange
}: ConsumerSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const { itemCount } = useCart();
  const { user, isLoaded } = useUser();
  
  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed && !isPinned);
    }
  }, [isCollapsed, isPinned, onCollapseChange]);
  
  const togglePin = () => {
    setIsPinned(!isPinned);
    // If we're pinning, make sure the sidebar is open
    if (!isPinned) {
      setIsCollapsed(false);
    }
  };
  
  const navItems = [
    {
      id: "marketplace",
      label: "Marketplace",
      icon: Store,
      onClick: () => setActiveTab("marketplace"),
      badge: stats.total > 0 ? stats.total : undefined,
    },
    {
      id: "purchases",
      label: "My Purchases",
      icon: ShoppingBag,
      onClick: () => setActiveTab("purchases"),
      badge: stats.purchases > 0 ? stats.purchases : undefined,
    },
    {
      id: "pendingPayments",
      label: "Pending Payments",
      icon: Clock,
      onClick: () => setActiveTab("pendingPayments"),
      badge: stats.pendingPayments > 0 ? stats.pendingPayments : undefined,
    },
    {
      id: "adRequests",
      label: "Ad Requests",
      icon: Megaphone,
      onClick: () => setActiveTab("adRequests"),
    },
    {
      id: "contentRequests",
      label: "Content Requests",
      icon: Edit,
      onClick: () => setActiveTab("contentRequests"),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart,
      onClick: () => setActiveTab("analytics"),
    },
  ];

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
              Advertiser
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
                  <TooltipProvider key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
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
                            {item.badge && (
                              <span className="ml-auto flex h-5 items-center justify-center rounded-full bg-green-500 px-2 text-xs font-medium text-white">
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-200">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => window.location.href = "/cart"}
                      className="w-full flex items-center rounded-lg px-2 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                      <motion.div
                        className="ml-2 flex items-center gap-2 overflow-hidden"
                        initial={isCollapsed && !isPinned ? "closed" : "open"}
                        animate={isCollapsed && !isPinned ? "closed" : "open"}
                        variants={textVariants}
                      >
                        <span className="text-sm font-medium whitespace-nowrap">View Cart</span>
                        {itemCount > 0 && (
                          <span className="ml-auto flex h-5 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                            {itemCount}
                          </span>
                        )}
                      </motion.div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>View your shopping cart with selected websites</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={togglePin}
                      className="w-full flex items-center rounded-lg px-2 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors mt-1"
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
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{isPinned ? "Unpin sidebar to auto-collapse" : "Pin sidebar to keep it open"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => window.location.href = "/"}
                      className="w-full flex items-center rounded-lg px-2 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors mt-1"
                    >
                      <Home className="w-4 h-4 flex-shrink-0" />
                      <motion.div
                        className="ml-2 overflow-hidden"
                        initial={isCollapsed && !isPinned ? "closed" : "open"}
                        animate={isCollapsed && !isPinned ? "closed" : "open"}
                        variants={textVariants}
                      >
                        <span className="text-sm font-medium whitespace-nowrap">Home</span>
                      </motion.div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Return to the Linkfro homepage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {/* Profile section at the bottom */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center">
                  {/* Profile link with avatar and name */}
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

                      <motion.div 
                        className="ml-2 overflow-hidden"
                        initial={isCollapsed && !isPinned ? "closed" : "open"}
                        animate={isCollapsed && !isPinned ? "closed" : "open"}
                        variants={textVariants}
                      >
                        {/* Name and view link text */}
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {isLoaded ? (user?.fullName ?? 'Profile') : 'Profile'}
                        </p>
                        <p className="text-xs text-gray-500">View profile</p>
                      </motion.div>
                    </div>
                  </Link>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>View or edit your advertiser profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}

export default ConsumerSidebar;
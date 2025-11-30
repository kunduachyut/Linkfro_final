"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
const ChatWindow = dynamic(() => import('./ChatWindow'), { ssr: false });
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

export default function PurchasesSection({
  purchases,
  loading,
  error,
  refreshPurchases,
  messages,
  setMessages
}: {
  purchases: any[];
  loading: boolean;
  error: string;
  refreshPurchases: () => void;
  messages: { [key: string]: string };
  setMessages: (updater: (prev: { [key: string]: string }) => { [key: string]: string }) => void;
}) {
  // Helper functions need to be defined before they're used
  const getWebsiteId = (purchase: any): string => {
    if (typeof purchase.websiteId === "string") {
      return purchase.websiteId;
    }
    if (purchase.websiteId?._id) {
      return purchase.websiteId._id;
    }
    return purchase.websiteId || "";
  };

  const getWebsiteTitle = (purchase: any): string => {
    if (purchase.websiteTitle) {
      return purchase.websiteTitle;
    }
    if (typeof purchase.websiteId === "object" && purchase.websiteId?.title) {
      return purchase.websiteId.title;
    }
    return "Unknown Website";
  };

  const getWebsiteUrl = (purchase: any): string => {
    if (purchase.websiteUrl) {
      return purchase.websiteUrl;
    }
    if (typeof purchase.websiteId === "object" && purchase.websiteId?.url) {
      return purchase.websiteId.url;
    }
    return ""; // Changed from "#" to ""
  };

  const getAmountCents = (purchase: any): number => {
    if (typeof purchase.amountCents === "number" && !isNaN(purchase.amountCents)) {
      return purchase.amountCents;
    }
    if (typeof purchase.totalCents === "number" && !isNaN(purchase.totalCents)) {
      return purchase.totalCents;
    }
    if (typeof purchase.priceCents === "number" && !isNaN(purchase.priceCents)) {
      return purchase.priceCents;
    }
    return 0;
  };

  const [contentUploads, setContentUploads] = useState<Record<string, any[]>>({});
  const [loadingUploads, setLoadingUploads] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // State for website details functionality
  const [websiteDetails, setWebsiteDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [activeDetailsItem, setActiveDetailsItem] = useState<string | null>(null);
  // Tooltip position (viewport coordinates) for the details popup so we can render it in a portal
  const [tooltipRect, setTooltipRect] = useState<{ left: number; top: number } | null>(null);

  // Chat state (consumer side)
  const { user } = useUser();
  const currentUserId = (user && (user.id || (user?.id as string))) || '';
  const currentUserRole = (user && (user.publicMetadata?.role as string)) ? (user.publicMetadata.role as 'consumer' | 'superadmin') : 'consumer';
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Filter purchases based on search and filters
  const filteredPurchases = purchases.filter(purchase => {
    // Search filter
    const matchesSearch = !searchQuery ||
      getWebsiteTitle(purchase).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getWebsiteUrl(purchase).toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;

    // Content type filter
    const matchesContentType = contentTypeFilter === "all" ||
      (contentTypeFilter === "request" && purchase.contentType === "request") ||
      (contentTypeFilter === "content" && purchase.contentType !== "request");

    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const purchaseDate = new Date(purchase.createdAt);
      if (startDate && purchaseDate < new Date(startDate)) {
        matchesDateRange = false;
      }
      if (endDate && purchaseDate > new Date(endDate)) {
        matchesDateRange = false;
      }
    }

    return matchesSearch && matchesStatus && matchesContentType && matchesDateRange;
  });

  // Fetch content uploads for each purchase and refresh periodically
  useEffect(() => {
    if (!purchases || purchases.length === 0) return;

    let isSubscribed = true; // For cleanup
    let intervalId: NodeJS.Timeout;

    const fetchContentUploads = async () => {
      if (!isSubscribed) return;

      // Create a temporary map to collect all fetch results
      const newUploads: Record<string, any[]> = {};
      const loadingStates: Record<string, boolean> = {};

      // First update all loading states at once
      const purchaseMap: Record<string, string> = {};
      purchases.forEach(purchase => {
        const purchaseId = purchase._id;
        const websiteId = typeof purchase.websiteId === "string" ? purchase.websiteId : purchase.websiteId?._id;
        if (websiteId && purchaseId) {
          purchaseMap[purchaseId] = websiteId;
          loadingStates[purchaseId] = true;
        }
      });

      if (Object.keys(loadingStates).length > 0) {
        setLoadingUploads(loadingStates);
      }

      // Fetch all content in parallel
      try {
        const fetchPromises = Object.keys(purchaseMap).map(async (purchaseId) => {
          if (!isSubscribed) return;

          try {
            const res = await fetch(`/api/my-content?purchaseId=${purchaseId}`);
            if (res.ok && isSubscribed) {
              const data = await res.json();
              newUploads[purchaseId] = data.items || [];
            }
          } catch (err) {
            console.error(`Failed to fetch content for purchase ${purchaseId}:`, err);
          }
        });

        await Promise.all(fetchPromises);

        // Only update state if component is still mounted
        if (isSubscribed) {
          setContentUploads(newUploads);
          setLoadingUploads({});
        }
      } catch (err) {
        console.error("Failed to fetch content uploads:", err);
        if (isSubscribed) {
          setLoadingUploads({});
        }
      }
    };

    // Initial fetch
    fetchContentUploads();

    // Set up periodic refresh every 30 seconds
    intervalId = setInterval(() => {
      refreshPurchases();
      fetchContentUploads();
    }, 30000);

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [purchases, refreshPurchases]); // Remove getWebsiteId from dependencies

  // Function to fetch website details
  const fetchWebsiteDetails = async (websiteId: string) => {
    // If we already have the details or are loading them, don't fetch again
    if (websiteDetails[websiteId] || loadingDetails[websiteId]) {
      return;
    }

    // Set loading state
    setLoadingDetails(prev => ({ ...prev, [websiteId]: true }));

    try {
      const res = await fetch(`/api/websites/${websiteId}`);

      if (res.ok) {
        const data = await res.json();
        setWebsiteDetails(prev => ({ ...prev, [websiteId]: data }));
      } else if (res.status === 401) {
        // Handle authentication error
        console.log("Authentication required to fetch website details");
      } else {
        console.error("Failed to fetch website details:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch website details:", error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [websiteId]: false }));
    }
  };

  const updateMessage = (purchaseId: string, message: string) => {
    setMessages(prev => ({ ...prev, [purchaseId]: message }));
  };

  const handleChatClick = (purchaseId: string) => {
    if (activeChatId === purchaseId) {
      setIsChatMinimized(!isChatMinimized);
    } else {
      setActiveChatId(purchaseId);
      setIsChatMinimized(false);
    }
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
    setIsChatMinimized(false);
  };

  const requestAd = async (websiteId: string, purchaseId: string) => {
    const message = messages[purchaseId] || "";

    if (!message.trim()) {
      alert("Write a short message for the publisher.");
      return;
    }

    try {
      const res = await fetch("/api/ad-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId, message, purchaseId }),
      });

      if (res.ok) {
        alert("Ad request sent!");
        setMessages(prev => ({ ...prev, [purchaseId]: "" }));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send ad request");
      }
    } catch (err) {
      console.error("Failed to send ad request:", err);
      alert("Failed to send ad request. Please try again.");
    }
  };

  // Function to handle content type click and show details
  const handleContentTypeClick = async (purchase: any) => {
    setModalLoading(true);
    setIsModalOpen(true);

    // For content requests, we would need to fetch the request details
    // For uploaded content, we already have the uploads data
    setSelectedContent({
      purchase,
      uploads: contentUploads[purchase._id] || []
    });

    setModalLoading(false);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setContentTypeFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div>
      {/* Table Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPurchases}
            className="px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors flex items-center gap-2"
            title="Click to refresh purchases and check for new updates"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <span className="text-sm font-medium text-gray-500">{filteredPurchases.length} of {purchases.length} purchases</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
              className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1 ${(statusFilter !== "all" || contentTypeFilter !== "all" || startDate || endDate)
              ? "bg-green-50 border-green-300 text-green-700"
              : ""
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="ongoing">Ongoing</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Content Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Types</option>
                <option value="request">Content Request</option>
                <option value="content">My Content</option>
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading purchases...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Purchases</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshPurchases}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredPurchases.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchases Found</h3>
              <p className="text-gray-600 mb-4">
                {purchases.length === 0
                  ? "You haven't made any purchases yet."
                  : "No purchases match your search criteria. Try adjusting your filters."}
              </p>
              {purchases.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Table Header - Updated to 19 columns to accommodate Details column */}
              <TooltipProvider>
                <div className="grid grid-cols-22 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4 flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">WEBSITE NAME</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Website domain you purchased link placement on</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">DETAILS</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View website details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">CONTENT TYPE</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Shows if you used your own article or requested content creation</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">PURCHASE DATE</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Date when this order was created</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">AMOUNT</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total price paid or due for this order</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">STATUS</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current stage of your order — pending, ongoing, payment pending, or approved</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">DOC URL</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View documentation or content for your order</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">LIVE URL</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open the live link where your content is published</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">Action</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Visit the website</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">Chat</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chat with Admin</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="col-span-1"></div>
                </div>
              </TooltipProvider>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredPurchases.map((purchase, index) => {
                  const websiteTitle = getWebsiteTitle(purchase);
                  const websiteUrl = getWebsiteUrl(purchase);
                  const amountCents = getAmountCents(purchase);
                  const websiteId = getWebsiteId(purchase);
                  const uploads = contentUploads[purchase._id] || [];
                  const isLoadingUploads = loadingUploads[purchase._id] || false;

                  return (
                    <div key={purchase._id || index} className="grid grid-cols-22 gap-4 px-6 py-4 hover:bg-gray-50 items-center">
                      {/* Website Info */}
                      <div className="col-span-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                            {websiteTitle.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{websiteTitle}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]" title={websiteUrl}>
                              {websiteUrl.length > 40 ? `${websiteUrl.substring(0, 40)}...` : websiteUrl}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details Column with Eye Icon */}
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="relative">
                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                            onMouseEnter={async (e) => {
                              // Fetch details on hover if not already loaded
                              if (websiteId && !websiteDetails[websiteId] && !loadingDetails[websiteId]) {
                                await fetchWebsiteDetails(websiteId);
                              }
                              // Capture the button position so the tooltip can render in a portal
                              try {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setTooltipRect({ left: rect.left + rect.width / 2, top: rect.bottom });
                              } catch (err) {
                                setTooltipRect(null);
                              }
                              // Set this item as the active details item
                              setActiveDetailsItem(purchase._id);
                            }}
                            onMouseLeave={() => {
                              // Clear the active details item and tooltip position when mouse leaves
                              setActiveDetailsItem(null);
                              setTooltipRect(null);
                            }}
                          >
                            {loadingDetails[websiteId] ? (
                              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>

                          {/* Floating tooltip with website details rendered into a portal so it isn't clipped */}
                          {activeDetailsItem === purchase._id && tooltipRect && typeof document !== 'undefined' && createPortal(
                            <div
                              style={{
                                position: 'fixed',
                                left: tooltipRect.left,
                                top: tooltipRect.top + 8,
                                transform: 'translateX(-50%)',
                                zIndex: 99999,
                                width: 256
                              }}
                              className="rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">{websiteDetails[websiteId]?.title || 'Loading...'}</h3>
                                </div>

                                {loadingDetails[websiteId] ? (
                                  <div className="flex justify-center items-center h-16">
                                    <div className="text-gray-500 text-sm">Loading details...</div>
                                  </div>
                                ) : websiteDetails[websiteId] ? (
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Price:</span>
                                      <span className="font-medium">${(websiteDetails[websiteId].priceCents / 100).toFixed(2)}</span>
                                    </div>
                                    {websiteDetails[websiteId].DA !== undefined && websiteDetails[websiteId].DA !== null && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">DA:</span>
                                        <span className="font-medium">{websiteDetails[websiteId].DA}</span>
                                      </div>
                                    )}
                                    {websiteDetails[websiteId].DR !== undefined && websiteDetails[websiteId].DR !== null && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">DR:</span>
                                        <span className="font-medium">{websiteDetails[websiteId].DR}</span>
                                      </div>
                                    )}
                                    {websiteDetails[websiteId].OrganicTraffic !== undefined && websiteDetails[websiteId].OrganicTraffic !== null && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Traffic:</span>
                                        <span className="font-medium">{websiteDetails[websiteId].OrganicTraffic}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-center py-2 text-sm">
                                    Failed to load details
                                  </div>
                                )}
                              </div>
                            </div>,
                            document.body
                          )}
                        </div>
                      </div>

                      {/* Content Type - Updated to show "My Content" with blue color */}
                      <div className="col-span-3 flex justify-center">
                        <button
                          onClick={() => handleContentTypeClick(purchase)}
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${purchase.contentType === 'request'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            } transition-colors cursor-pointer`}
                        >
                          {purchase.contentType === 'request' ? 'Content Request' : 'My Content'}
                        </button>
                      </div>

                      {/* Purchase Date */}
                      <div className="col-span-3 flex justify-center">
                        <div className="text-sm text-gray-900">
                          {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="col-span-1 flex justify-center">
                        <div className="text-sm font-medium text-gray-900">${(amountCents / 100).toFixed(2)}</div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${purchase.status === 'paid' || purchase.status === 'completed' || purchase.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'pending' || purchase.status === 'ongoing'
                            ? (purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800')
                            : purchase.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {purchase.status || 'Unknown'}
                        </span>
                      </div>

                      {/* Doc URL column - show button if provided, otherwise show disabled state */}
                      <div className="col-span-2 flex justify-center">
                        {purchase.docLink ? (
                          <button
                            onClick={() => window.open(purchase.docLink, '_blank')}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors text-sm flex items-center gap-2"
                            title={purchase.docLink}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Doc
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-md cursor-not-allowed text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Live URL column - show button if provided, otherwise show disabled state */}
                      <div className="col-span-2 flex justify-center">
                        {purchase.liveLink ? (
                          <button
                            onClick={() => window.open(purchase.liveLink, '_blank')}
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-sm flex items-center gap-2"
                            title={purchase.liveLink}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Live
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-md cursor-not-allowed text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex space-x-2">
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="Visit Website"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>

                          {/* Ad Request Button */}
                          {(purchase.status === 'paid' || purchase.status === 'completed') && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Message for publisher"
                                value={messages[purchase._id] || ""}
                                onChange={(e) => updateMessage(purchase._id, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-32"
                              />
                              <button
                                onClick={() => requestAd(websiteId, purchase._id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Request Ad Placement"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {/* Chat Button - always available */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleChatClick(purchase._id)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Chat"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </button>
                          </div>
                          {/* Payment link input - visible only when purchase is ongoing */}

                        </div>
                      </div>

                      {/* More Options */}
                      <div className="col-span-1 flex justify-end">
                        <button className="text-gray-400 hover:text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Details Modal */}
      {/* Chat Window */}
      {activeChatId && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWindow
            purchaseId={activeChatId}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onClose={handleCloseChat}
            isMinimized={isChatMinimized}
          />
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Content Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              </div>
            ) : selectedContent ? (
              <div className="overflow-y-auto max-h-[75vh]">
                <div className="p-6">
                  {selectedContent.purchase.contentType === 'request' ? (
                    // Content Request Details
                    <div>
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Content Request</h4>
                        <p className="text-gray-600">
                          You requested custom content for this purchase. The publisher will create content based on your requirements.
                        </p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 mb-6">
                        <h5 className="font-medium text-gray-900 mb-2">Website Information</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Website Name</p>
                            <p className="text-gray-900">{getWebsiteTitle(selectedContent.purchase)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Purchase Date</p>
                            <p className="text-gray-900">
                              {selectedContent.purchase.createdAt ? new Date(selectedContent.purchase.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Next Steps</h5>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                          <li>The publisher will create content based on your website's needs</li>
                          <li>You'll receive a notification when the content is ready</li>
                          <li>You can request revisions if needed</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    // Uploaded Content Details
                    <div>
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-900 mb-2">My Content 1</h4>
                        <p className="text-gray-600">
                          You uploaded content for this purchase. Here are the details of your uploads.
                        </p>
                      </div>

                      {selectedContent.uploads.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Uploaded Yet</h3>
                          <p className="text-gray-600 mb-4">
                            You haven't uploaded any content for this purchase yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedContent.uploads.map((upload: any, index: number) => (
                            <div key={upload._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-medium text-gray-900">Upload #{index + 1}</h5>
                                  <p className="text-sm text-gray-500">
                                    Uploaded on {upload.createdAt ? new Date(upload.createdAt).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                {upload.pdf && (
                                  <a
                                    href={`/api/admin/pdf/${upload._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View PDF
                                  </a>
                                )}
                              </div>

                              <div className="mb-3">
                                <p className="text-sm text-gray-500 mb-1">Requirements</p>
                                <p className="text-gray-900">{upload.requirements || 'No requirements specified'}</p>
                              </div>

                              {upload.pdf && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={upload.pdf.filename}>
                                        {upload.pdf.filename}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {upload.pdf.size ? `${(upload.pdf.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
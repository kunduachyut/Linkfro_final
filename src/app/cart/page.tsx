// app/cart/page.tsx (updated)
"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

export default function CartPage() {
  const { cart, removeFromCart: originalRemoveFromCart, clearCart: originalClearCart, totalCents } = useCart();
  
  // Wrap removeFromCart to also clear selected option
  const removeFromCart = (itemId: string) => {
    // Clear the selected option for this item
    setSelectedOptions(prev => {
      const newOptions = {...prev};
      delete newOptions[itemId];
      return newOptions;
    });
    // Call the original removeFromCart function
    originalRemoveFromCart(itemId);
  };
  
  // Wrap clearCart to also clear all selected options
  const clearCart = () => {
    // Clear all selected options
    setSelectedOptions({});
    // Call the original clearCart function
    originalClearCart();
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const { userId, isSignedIn } = useAuth();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTopic, setRequestTopic] = useState("");
  const [wordCount, setWordCount] = useState(500);
  const [uploading, setUploading] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadsByWebsite, setUploadsByWebsite] = useState<Record<string, number>>({});
  const [modalKey, setModalKey] = useState(0); // Add key to force re-render
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}); // Track which option is selected for each item
  const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Temporary upload confirmation popup
  const [showTempUploadPopup, setShowTempUploadPopup] = useState(false);
  const [tempUploadPopupMessage, setTempUploadPopupMessage] = useState("");
  const [websiteDetails, setWebsiteDetails] = useState<Record<string, any>>({}); // Store detailed website info
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({}); // Track loading state for each website
  const [activeDetailsItem, setActiveDetailsItem] = useState<string | null>(null); // Track which item's details are being shown

  // State to track uploads per cart item (not per website)
  const [uploadsByCartItem, setUploadsByCartItem] = useState<Record<string, any[]>>({});

  // State to track temporary uploads per cart item (not saved to database yet)
  const [tempUploadsByCartItem, setTempUploadsByCartItem] = useState<Record<string, any[]>>({});

  // State to track file data per cart item
  const [fileDataByCartItem, setFileDataByCartItem] = useState<Record<string, {file: File, requirements: string}[]>>({});

  // Create ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for the content request form
  const [contentRequestData, setContentRequestData] = useState({
    titleSuggestion: '',
    keywords: '',
    anchorText: '',
    targetAudience: '',
    wordCount: '',
    category: '',
    referenceLink: '',
    landingPageUrl: '',
    briefNote: ''
  });

  // Truncate helper for display (used to limit title length in cart)
  const truncate = (s: string | undefined | null, n = 20) => {
    if (!s) return '';
    const str = String(s);
    return str.length > n ? str.slice(0, n) + '…' : str;
  };

  useEffect(() => {
    if (!isSignedIn) { 
      setUploadsByWebsite({}); 
      return; 
    }
    
    // Calculate content counts based on temporary uploads
    // This creates a map of websiteId to count of temporary uploads
    const map: Record<string, number> = {};
    
    // Iterate through all temporary uploads and count them by websiteId
    Object.entries(tempUploadsByCartItem).forEach(([websiteId, uploads]) => {
      map[websiteId] = uploads.length;
    });
    
    setUploadsByWebsite(map);
  }, [isSignedIn, tempUploadsByCartItem]);

  // Reset file input when modal opens/closes
  useEffect(() => {
    if (showContentModal) {
      // Reset file input when modal opens
      setTimeout(() => {
        resetFileInput();
      }, 50);
    } else {
      // Reset file input when modal closes
      resetFileInput();
    }
  }, [showContentModal]);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      setShowErrorMessage(true);
      setErrorMessage("Please sign in to proceed with checkout");
      return;
    }

    // Check if all items have a content selection
    const unselectedItems = cart.filter(item => !selectedOptions[item._id]);
    if (unselectedItems.length > 0) {
      setShowErrorMessage(true);
      setErrorMessage("Please select 'My Content' or 'Request' for all items in your cart before proceeding to checkout.");
      return;
    }

    // Show confirmation popup instead of proceeding directly
    setShowCheckoutConfirmation(true);
  };

  const confirmCheckout = async () => {
    // Close confirmation popup
    setShowCheckoutConfirmation(false);
    
    setIsProcessing(true);
    try {
      // First, create the purchases to get purchase IDs
      const purchaseRes = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: cart.map(item => ({
            websiteId: item._id,
            title: item.title,
            priceCents: item.priceCents
          })),
          contentSelections: selectedOptions // Include the content selections
        }),
      });

      if (!purchaseRes.ok) throw new Error(`HTTP error! status: ${purchaseRes.status}`);

      const purchaseData = await purchaseRes.json();
      const purchases = purchaseData.purchases || [];
      
      // Create a map of websiteId to purchaseId
      const purchaseIdMap: Record<string, string> = {};
      purchases.forEach((purchase: any) => {
        purchaseIdMap[purchase.websiteId] = purchase.id;
      });

      // Save temporary uploads to database for each cart item that has uploads
      const uploadPromises = Object.entries(fileDataByCartItem).map(async ([websiteId, files]) => {
        // Get the purchase ID for this website
        const purchaseId = purchaseIdMap[websiteId];
        
        // Process each file for this cart item
        return Promise.all(files.map(async (fileData) => {
          const { file, requirements } = fileData;
          const fd = new FormData();
          fd.append("pdfFile", file);
          fd.append("requirements", requirements);
          fd.append("websiteId", websiteId);
          if (purchaseId) {
            fd.append("purchaseId", purchaseId); // Associate with purchase ID
          }
          
          const res = await fetch("/api/my-content", { method: "POST", body: fd });
          if (!res.ok) {
            let msg = `HTTP ${res.status}`;
            try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
            throw new Error(msg);
          }
          return res.json();
        }));
      });
      
      // Wait for all uploads to be processed
      await Promise.all(uploadPromises);

      // Clear cart and reset all states for fresh experience
      clearCart();
      
      // Clear cached upload data
      setUploadsByWebsite({});
      setMyUploads([]);
      // Clear cart item uploads
      setUploadsByCartItem({});
      setTempUploadsByCartItem({});
      setFileDataByCartItem({});
      
      // Reset modal states
      setShowContentModal(false);
      setShowRequestModal(false);
      setShowConfirmModal(false);
      
      // Reset form data
      setContentRequestData({
        titleSuggestion: '',
        keywords: '',
        anchorText: '',
        targetAudience: '',
        wordCount: '',
        category: '',
        referenceLink: '',
        landingPageUrl: '',
        briefNote: ''
      });
      
      // Reset file input
      resetFileInput();
      
      // Show success popup
      setShowSuccessMessage(true);
      
    } catch (err) {
      console.error("Failed to complete purchase:", err);
      setShowErrorMessage(true);
      setErrorMessage("Failed to complete purchase. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openContentModal = (item: any) => {
    setSelectedItem(item);
    setShowContentModal(true);
    // Set this item's selected option to 'content'
    setSelectedOptions(prev => ({
      ...prev,
      [item._id]: 'content'
    }));
    // Reset file input for fresh start - use setTimeout to ensure modal is rendered
    setTimeout(() => {
      resetFileInput();
    }, 100);
    // Use temporary uploads for this specific cart item, or start with empty array
    setMyUploads(tempUploadsByCartItem[item._id] || []);
  };

  const openRequestModal = (item: any) => {
    setSelectedItem(item);
    setShowRequestModal(true);
    // Set this item's selected option to 'request'
    setSelectedOptions(prev => ({
      ...prev,
      [item._id]: 'request'
    }));
    // Reset form data when opening modal
    setContentRequestData({
      titleSuggestion: '',
      keywords: '',
      anchorText: '',
      targetAudience: '',
      wordCount: '',
      category: '',
      referenceLink: '',
      landingPageUrl: '',
      briefNote: ''
    });
  };

  const handleContentRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContentRequestData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleContentRequest = async () => {
    // Validate required fields
    if (!contentRequestData.keywords.trim()) {
      alert("Please provide keywords");
      return;
    }
    if (!contentRequestData.anchorText.trim()) {
      alert("Please provide anchor text");
      return;
    }
    if (!contentRequestData.targetAudience) {
      alert("Please select target audience");
      return;
    }
    if (!contentRequestData.wordCount) {
      alert("Please select word count");
      return;
    }
    if (!contentRequestData.category) {
      alert("Please select category");
      return;
    }
    if (!contentRequestData.landingPageUrl.trim()) {
      alert("Please provide landing page URL");
      return;
    }

    try {
      // Send content request to the server
      const res = await fetch("/api/content-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteId: selectedItem._id,
          websiteTitle: selectedItem.title,
          topic: contentRequestData.keywords, // Using keywords as topic
          wordCount: parseInt(contentRequestData.wordCount),
          contentRequest: contentRequestData // Include the full request data
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      alert("Content request submitted successfully!");
      setShowRequestModal(false);
      
    } catch (err: any) {
      console.error("Failed to submit content request:", err);
      alert(`Failed to submit content request: ${err.message || "Please try again."}`);
    }
  };

  const fetchWebsiteDetails = async (websiteId: string) => {
    console.log('Fetching website details for ID:', websiteId);
    
    // If we already have the details or are loading them, don't fetch again
    if (websiteDetails[websiteId] || loadingDetails[websiteId]) {
      console.log('Already have details or loading for:', websiteId);
      return;
    }

    // Set loading state
    setLoadingDetails(prev => ({ ...prev, [websiteId]: true }));
    console.log('Set loading state for:', websiteId);

    try {
      const res = await fetch(`/api/websites/${websiteId}`);
      console.log('API response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Received website data:', data);
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
      console.log('Cleared loading state for:', websiteId);
    }
  };

  const resetFileInput = () => {
    // Reset file state
    setPdfFile(null);
    setRequirements("");
    
    // Reset file input using ref - with additional safety checks
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      // Force a re-render by triggering a change event
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Also try to reset any other file inputs that might exist
    const allFileInputs = document.querySelectorAll('input[type="file"]');
    allFileInputs.forEach((input: any) => {
      if (input.accept === "application/pdf") {
        input.value = "";
      }
    });
  };

  const handleClearCart = () => {
    // Ask for confirmation before clearing
    if (!confirm("Are you sure you want to clear your cart? This action cannot be undone.")) {
      return;
    }
    
    // Clear cart
    clearCart();
    
    // Clear cached upload data
    setUploadsByWebsite({});
    setMyUploads([]);
    // Clear cart item uploads
    setUploadsByCartItem({});
    setTempUploadsByCartItem({});
    setFileDataByCartItem({});
    
    // Reset modal states
    setShowContentModal(false);
    setShowRequestModal(false);
    setShowConfirmModal(false);
    
    // Reset form data
    setContentRequestData({
      titleSuggestion: '',
      keywords: '',
      anchorText: '',
      targetAudience: '',
      wordCount: '',
      category: '',
      referenceLink: '',
      landingPageUrl: '',
      briefNote: ''
    });
    
    // Reset file input
    resetFileInput();
    
    alert("Cart cleared successfully!");
  };

  const getCountryFlag = (countryName: string | undefined): string => {
    if (!countryName) return '🌐';
    
    const countryFlags: Record<string, string> = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'Russia': '🇷🇺',
      'Other': '🌐'
    };
    
    return countryFlags[countryName] || '🌐';
  };

  // Add a useEffect to debug the state changes
  useEffect(() => {
    console.log('Website details updated:', websiteDetails);
  }, [websiteDetails]);

  useEffect(() => {
    console.log('Loading details updated:', loadingDetails);
  }, [loadingDetails]);

  // Handle escape key to close details modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeDetailsItem) {
        setActiveDetailsItem(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeDetailsItem]);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6" style={{backgroundColor: 'var(--base-primary)'}}>
        <div className="rounded-lg shadow-sm p-8 text-center" style={{backgroundColor: 'var(--base-primary)', border: '1px solid var(--base-tertiary)'}}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'var(--base-secondary)'}}>
            <svg
              className="w-8 h-8"
              style={{color: 'var(--secondary-lighter)'}}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{color: 'var(--secondary-primary)'}}>Your cart is empty</h3>
          <p className="mb-6" style={{color: 'var(--secondary-lighter)'}}>Add some websites to your cart to get started.</p>
          <Link
            href="/dashboard/consumer"
            className="px-4 py-2 rounded-md transition-colors font-medium text-sm"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--accent-primary)'}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" style={{backgroundColor: 'var(--base-primary)'}}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{color: 'var(--secondary-primary)'}}>Shopping Cart</h1>
        <Link
          href="/dashboard/consumer"
          className="flex items-center transition-colors"
          style={{color: 'var(--accent-primary)'}}
          onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--accent-hover)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--accent-primary)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      <div className="rounded-lg shadow-sm overflow-hidden" style={{backgroundColor: 'var(--base-primary)', border: '1px solid var(--base-tertiary)'}}>
        <div className="p-6" style={{borderBottom: '1px solid var(--base-tertiary)'}}>
          <div className="grid grid-cols-12 gap-4 font-semibold uppercase tracking-wider text-xs pb-4" style={{color: 'var(--secondary-lighter)'}}>
            <div className="col-span-3 flex items-center">Product</div>
            <div className="col-span-2 flex items-center justify-center">Price</div>
            <div className="col-span-2 flex items-center justify-center">Content Status</div>
            <div className="col-span-1 flex items-center justify-center">Details</div>
            <div className="col-span-4 flex items-center justify-end">Actions</div>
          </div>

          {cart.map((item, idx) => (
            <div key={item._id ?? idx} className="grid grid-cols-12 gap-4 py-4 border-b hover:bg-gray-50 items-center">
              <div className="col-span-3 flex items-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {item.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div
                      className="text-sm font-medium text-gray-900 max-w-[20ch] truncate overflow-hidden whitespace-nowrap"
                      title={item.title}
                    >
                      {truncate(String(item.title), 20)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-sm font-medium text-gray-900">${(item.priceCents / 100).toFixed(2)}</div>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                {selectedOptions[item._id] === 'content' && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-blue-600 font-medium">My Content</span>
                    <div className="flex gap-1 mt-1">
                      <button 
                        onClick={() => openContentModal(item)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors flex items-center justify-center"
                        title="View uploaded documents"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {/* Show count based on temporary uploads for this specific cart item */}
                        {tempUploadsByCartItem[item._id] && tempUploadsByCartItem[item._id].length > 0 && (
                          <span className="ml-1 text-xs font-medium">
                            {tempUploadsByCartItem[item._id].length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOptions(prev => {
                            const newOptions = {...prev};
                            delete newOptions[item._id];
                            return newOptions;
                          });
                          // Also clear temporary uploads for this item
                          setTempUploadsByCartItem(prev => {
                            const newUploads = {...prev};
                            delete newUploads[item._id];
                            return newUploads;
                          });
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Clear selection"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {selectedOptions[item._id] === 'request' && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-green-600 font-medium">Request</span>
                    <div className="flex gap-1 mt-1">
                      <button 
                        onClick={() => openRequestModal(item)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors flex items-center justify-center"
                        title="View request details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOptions(prev => {
                            const newOptions = {...prev};
                            delete newOptions[item._id];
                            return newOptions;
                          });
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Clear selection"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {!selectedOptions[item._id] && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 font-medium">Not Selected</span>
                  </div>
                )}
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <div className="relative">
                  <button 
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                    onMouseEnter={async () => {
                      console.log('Hovered over details icon for website:', item._id);
                      // Fetch details on hover if not already loaded
                      if (!websiteDetails[item._id] && !loadingDetails[item._id]) {
                        // Define fetchWebsiteDetails inline to avoid scoping issues
                        const fetchDetails = async (websiteId: string) => {
                          console.log('Fetching website details for ID:', websiteId);
                          
                          // If we already have the details or are loading them, don't fetch again
                          if (websiteDetails[websiteId] || loadingDetails[websiteId]) {
                            console.log('Already have details or loading for:', websiteId);
                            return;
                          }

                          // Set loading state
                          setLoadingDetails(prev => ({ ...prev, [websiteId]: true }));
                          console.log('Set loading state for:', websiteId);

                          try {
                            const res = await fetch(`/api/websites/${websiteId}`);
                            console.log('API response status:', res.status);
                            
                            if (res.ok) {
                              const data = await res.json();
                              console.log('Received website data:', data);
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
                            console.log('Cleared loading state for:', websiteId);
                          }
                        };
                        
                        await fetchDetails(item._id);
                      }
                      // Set this item as the active details item
                      setActiveDetailsItem(item._id);
                    }}
                    onMouseLeave={() => {
                      // Clear the active details item when mouse leaves
                      setActiveDetailsItem(null);
                    }}
                  >
                    {loadingDetails[item._id] ? (
                      <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Floating tooltip with website details */}
                  {activeDetailsItem === item._id && (
                    <div className="absolute z-50 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 left-1/2 transform -translate-x-1/2">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{websiteDetails[item._id]?.title || 'Loading...'}</h3>
                        </div>
                        
                        {loadingDetails[item._id] ? (
                          <div className="flex justify-center items-center h-16">
                            <div className="text-gray-500 text-sm">Loading details...</div>
                          </div>
                        ) : websiteDetails[item._id] ? (
                          <div className="space-y-2">
                            {/* <div className="flex justify-between text-xs">
                              <span className="text-gray-600">URL:</span>
                              <span className="font-medium text-blue-600 truncate max-w-[120px]" title={websiteDetails[item._id].url}>
                                {websiteDetails[item._id].url}
                              </span>
                            </div> */}
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium">${(websiteDetails[item._id].priceCents / 100).toFixed(2)}</span>
                            </div>
                            {websiteDetails[item._id].DA !== undefined && websiteDetails[item._id].DA !== null && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">DA:</span>
                                <span className="font-medium">{websiteDetails[item._id].DA}</span>
                              </div>
                            )}
                            {websiteDetails[item._id].DR !== undefined && websiteDetails[item._id].DR !== null && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">DR:</span>
                                <span className="font-medium">{websiteDetails[item._id].DR}</span>
                              </div>
                            )}
                            {websiteDetails[item._id].OrganicTraffic !== undefined && websiteDetails[item._id].OrganicTraffic !== null && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Traffic:</span>
                                <span className="font-medium">{websiteDetails[item._id].OrganicTraffic}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-2 text-sm">
                            Failed to load details
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-4 flex items-center justify-end gap-1">
                <button
                  onClick={() => openContentModal(item)}
                  disabled={selectedOptions[item._id] === 'request'}
                  className={`px-2 py-0.5 text-white rounded text-xs transition-colors font-medium ${
                    selectedOptions[item._id] === 'request' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : selectedOptions[item._id] === 'content'
                      ? 'bg-blue-800 hover:bg-blue-900'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {selectedOptions[item._id] === 'content' ? '✓ My Content' : 'My Content'}
                </button>
                <button
                  onClick={() => openRequestModal(item)}
                  disabled={selectedOptions[item._id] === 'content'}
                  className={`px-2 py-0.5 text-white rounded text-xs transition-colors font-medium ${
                    selectedOptions[item._id] === 'content' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : selectedOptions[item._id] === 'request'
                      ? 'bg-green-800 hover:bg-green-900'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {selectedOptions[item._id] === 'request' ? '✓ Request' : 'Request'}
                </button>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-200">
          <button
            onClick={() => {
              handleClearCart();
              // Clear all selected options
              setSelectedOptions({});
            }}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 flex items-center hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Cart
          </button>

          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 mb-3">
              Total: ${(totalCents / 100).toFixed(2)}
            </div>
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !isSignedIn}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </button>
            {!isSignedIn && (
              <p className="text-sm text-red-600 mt-2">Please sign in to checkout</p>
            )}
          </div>
        </div>
      </div>

      {/* My Content Modal */}
      {showContentModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Content for {selectedItem.title}</h3>
                             <button
                 onClick={() => {
                   setShowContentModal(false);
                   resetFileInput();
                   // Keep the selected option when user closes modal
                   // Only reset if user explicitly removes the selection
                 }}
                 className="text-gray-500 hover:text-gray-700"
               >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Upload form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!isSignedIn) { alert("Please sign in first"); return; }
                if (!pdfFile) { alert("Please select a PDF file"); return; }
                if (!requirements.trim()) { alert("Enter requirements"); return; }
                setShowConfirmModal(true);
              }}
              className="space-y-4 mb-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Your Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {!pdfFile ? (
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">Drag and drop your Files here, or</p>
                      <div className="mt-2">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Browse Files
                          <input
                            key={`file-input-${selectedItem?._id}-${modalKey}`}
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf, .doc, .docx, .xls, .xlsx, .txt"
                            onChange={(e) => {
                              const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                              if (f && f.size > 10 * 1024 * 1024) { alert("File must be <= 10MB"); e.currentTarget.value = ""; setPdfFile(null); return; }
                              if (f && f.type !== "application/pdf") { alert("Only PDF files are allowed"); e.currentTarget.value = ""; setPdfFile(null); return; }
                              setPdfFile(f);
                            }}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">PDF files only, up to 10MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                          <p className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Enter your requirements"
                  className="w-full p-2 border rounded-md h-28"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                                 <button
                   type="button"
                   onClick={() => {
                     setShowContentModal(false);
                     resetFileInput();
                     // Keep the selected option when user closes modal
                     // Only reset if user explicitly removes the selection
                   }}
                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                 >
                   Close
                 </button>
                <button
                  type="submit"
                  disabled={!pdfFile || !requirements.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </form>

            {/* List of previous uploads */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium mb-4 text-lg text-gray-800">Your Uploaded Documents</h4>
              {myUploads.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-600">No documents uploaded yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {myUploads.map((u, i) => (
                    <li key={i} className="border border-gray-200 rounded-md p-4 flex justify-between items-center text-sm hover:bg-blue-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 truncate max-w-xs">{u.pdf?.filename ?? "PDF Document"}</div>
                          <div className="text-gray-600 mt-1">{u.requirements?.slice(0, 80)}{u.requirements && u.requirements.length > 80 ? "…" : ""}</div>
                        </div>
                      </div>
                      <div className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{u.pdf?.size ? `${Math.round(u.pdf.size / 1024)} KB` : ""}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Content Modal - Updated with the form from screenshot */}
      {showRequestModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Request Content for {selectedItem.title}</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  // Keep the selected option when user closes modal
                  // Only reset if user explicitly removes the selection
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <h4 className="font-bold text-lg mb-2">Language*</h4>
              <div className="mb-2">
                <h5 className="font-semibold">English</h5>
                <p className="text-sm text-gray-600">Note: The publisher only accepts content in English</p>
              </div>
            </div>

            <form className="space-y-6">
              {/* Title Suggestion & Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title Suggestion
                  </label>
                  <input
                    type="text"
                    name="titleSuggestion"
                    value={contentRequestData.titleSuggestion}
                    onChange={handleContentRequestChange}
                    placeholder="Suggest Title"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 required">
                    Keywords*
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={contentRequestData.keywords}
                    onChange={handleContentRequestChange}
                    placeholder="Provide Keywords; Separated by comma"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              {/* Anchor Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 required">
                  Anchor Text*
                  </label>
                <input
                  type="text"
                  name="anchorText"
                  value={contentRequestData.anchorText}
                  onChange={handleContentRequestChange}
                  placeholder="Enter Anchor text"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 required">
                  Target Audience is from (Country)*
                </label>
                <select
                  name="targetAudience"
                  value={contentRequestData.targetAudience}
                  onChange={handleContentRequestChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Target Audience</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="in">India</option>
                  <option value="de">Germany</option>
                  <option value="fr">France</option>
                  <option value="jp">Japan</option>
                  <option value="br">Brazil</option>
                </select>
              </div>

              <hr className="my-4" />

              {/* Word Count & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 required">
                    Word Count*
                  </label>
                  <select
                    name="wordCount"
                    value={contentRequestData.wordCount}
                    onChange={handleContentRequestChange}
                    className="w-full p-2 border rounded-md"
                    required
                >
                  <option value="">Select Word Count</option>
                  <option value="500">500 words</option>
                  <option value="1000">1000 words</option>
                  <option value="1500">1500 words</option>
                  <option value="2000">2000 words</option>
                  <option value="2500">2500+ words</option>
                </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 required">
                    Category*
                  </label>
                  <select
                    name="category"
                    value={contentRequestData.category}
                    onChange={handleContentRequestChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="technology">Technology</option>
                    <option value="health">Health & Wellness</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="travel">Travel</option>
                    <option value="food">Food & Cooking</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              {/* Reference Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Link
                </label>
                <input
                  type="url"
                  name="referenceLink"
                  value={contentRequestData.referenceLink}
                  onChange={handleContentRequestChange}
                  placeholder="eg. https://example.com"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Landing Page URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 required">
                  Landing Page URL*
                </label>
                <input
                  type="url"
                  name="landingPageUrl"
                  value={contentRequestData.landingPageUrl}
                  onChange={handleContentRequestChange}
                  placeholder="Enter Landing Page URL"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              {/* Brief Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brief Note
                </label>
                <textarea
                  name="briefNote"
                  value={contentRequestData.briefNote}
                  onChange={handleContentRequestChange}
                  placeholder="Brief Note: Any additional notes required can be specified here in detail."
                  className="w-full p-2 border rounded-md h-24"
                  rows={4}
                />
              </div>
            </form>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  // Keep the selected option when user closes modal
                  // Only reset if user explicitly removes the selection
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleContentRequest}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Confirm Upload</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-3">Please confirm your upload details:</p>
              <div className="space-y-2 text-sm">
                <div><strong>Website:</strong> {selectedItem.title}</div>
                <div><strong>File:</strong> {pdfFile?.name}</div>
                <div><strong>Size:</strong> {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : ""}</div>
                <div><strong>Requirements:</strong> {requirements}</div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setUploading(true);
                    setShowConfirmModal(false);
                    
                    // Store uploads temporarily per cart item instead of saving to database immediately
                    const newUpload = {
                      requirements,
                      createdAt: new Date(),
                      pdf: {
                        filename: pdfFile?.name,
                        size: pdfFile?.size,
                      },
                      tempId: Date.now() // Temporary ID for frontend tracking
                    };

                    setTempUploadsByCartItem(prev => ({
                      ...prev,
                      [selectedItem._id]: [...(prev[selectedItem._id] || []), newUpload]
                    }));
                    // Store file data for later upload with purchase ID
                    setFileDataByCartItem(prev => ({
                      ...prev,
                      [selectedItem._id]: [...(prev[selectedItem._id] || []), { file: pdfFile, requirements }]
                    }));
                    // Update the shared myUploads state to show current temporary uploads
                    setMyUploads(prev => [...prev, newUpload]);
                    
                    // The useEffect will now automatically update uploadsByWebsite based on tempUploadsByCartItem
                     setRequirements("");
                     setPdfFile(null);
                     if (fileInputRef.current) {
                       fileInputRef.current.value = "";
                     }
                     // Show in-app popup instead of native alert
                     setTempUploadPopupMessage("File added temporarily. It will be uploaded when you proceed to checkout.");
                     setShowTempUploadPopup(true);
                     // Auto-close after 3 seconds
                     setTimeout(() => setShowTempUploadPopup(false), 3000);
                  } catch (err: any) {
                    alert(`Upload failed: ${err?.message ?? "Unknown error"}`);
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Popup */}
      {showCheckoutConfirmation && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Checkout</h3>
              <button
                onClick={() => setShowCheckoutConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Are you sure you want to proceed with the checkout?</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCheckoutConfirmation(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-600">Success!</h3>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Purchase request sent! The administrator will review your order.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temp Upload Confirmation Popup */}
      {showTempUploadPopup && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Success</h3>
              <button
                onClick={() => setShowTempUploadPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">{tempUploadPopupMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTempUploadPopup(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Popup */}
      {showErrorMessage && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Error</h3>
              <button
                onClick={() => setShowErrorMessage(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">{errorMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorMessage(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
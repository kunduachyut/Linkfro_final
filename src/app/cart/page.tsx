// app/cart/page.tsx (updated)
"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { 
  Trash2, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Upload, 
  Info,
  ShoppingCart as ShoppingCartIcon
} from "lucide-react";

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
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-100">
            <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any websites to your cart yet. Start browsing our marketplace to find great opportunities!
          </p>
          <Link
            href="/dashboard/consumer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">Review and manage your selected websites</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/consumer"
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Content</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {cart.map((item, idx) => (
                <div key={item._id ?? idx} className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50">
                  {/* Product Info */}
                  <div className="col-span-5 flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4">
                      {item.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900" title={item.title}>
                        {truncate(String(item.title), 25)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {selectedOptions[item._id] ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedOptions[item._id] === 'content' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {selectedOptions[item._id] === 'content' ? 'My Content' : 'Request Content'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="font-medium text-gray-900">${(item.priceCents / 100).toFixed(2)}</div>
                  </div>

                  {/* Content Selection */}
                  <div className="col-span-2 flex items-center justify-center">
                    {selectedOptions[item._id] === 'content' && (
                      <div className="flex items-center">
                        <button 
                          onClick={() => openContentModal(item)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="View uploaded documents"
                        >
                          <FileText className="h-5 w-5" />
                          {tempUploadsByCartItem[item._id] && tempUploadsByCartItem[item._id].length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {tempUploadsByCartItem[item._id].length}
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                    {selectedOptions[item._id] === 'request' && (
                      <div className="flex items-center">
                        <button 
                          onClick={() => openRequestModal(item)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                          title="View request details"
                        >
                          <Info className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {!selectedOptions[item._id] && (
                      <div className="text-gray-400">-</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openContentModal(item)}
                      disabled={selectedOptions[item._id] === 'request'}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                        selectedOptions[item._id] === 'request' 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : selectedOptions[item._id] === 'content'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      My Content
                    </button>
                    <button
                      onClick={() => openRequestModal(item)}
                      disabled={selectedOptions[item._id] === 'content'}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                        selectedOptions[item._id] === 'content' 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : selectedOptions[item._id] === 'request'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Request
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">${(totalCents / 100).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium text-gray-900">$0.00</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">${(totalCents / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing || !isSignedIn}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            {!isSignedIn && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    Please sign in to complete your purchase
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleClearCart}
              className="w-full mt-3 px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
            >
              Clear Cart
            </button>
          </div>

          {/* Help Card */}
          <div className="bg-blue-50 rounded-xl p-5 mt-6">
            <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-4">
              Have questions about your purchase or content requirements?
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium text-sm"
            >
              Contact Support
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* My Content Modal */}
      {showContentModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Upload Content for {selectedItem.title}</h3>
              <button
                onClick={() => {
                  setShowContentModal(false);
                  resetFileInput();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Upload Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-900">Upload Guidelines</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Please upload your content as a PDF document. Include any specific requirements or instructions for the publisher in the requirements field.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!isSignedIn) { alert("Please sign in first"); return; }
                  if (!pdfFile) { alert("Please select a PDF file"); return; }
                  if (!requirements.trim()) { alert("Enter requirements"); return; }
                  setShowConfirmModal(true);
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Your Document</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    {!pdfFile ? (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Drag and drop your files here, or</p>
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
                        <p className="mt-2 text-xs text-gray-500">PDF files only, up to 10MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <FileText className="h-5 w-5" />
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
                          <X className="h-5 w-5" />
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
                    placeholder="Enter your requirements or special instructions for the publisher"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  />
                </div>
              </form>

              {/* Previous Uploads */}
              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-4">Your Uploaded Documents</h4>
                {myUploads.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-600">No documents uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-1">Upload your first document using the form above</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {myUploads.map((u, i) => (
                      <li key={i} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.pdf?.filename ?? "PDF Document"}</div>
                            <div className="text-sm text-gray-600 mt-1 max-w-md">
                              {u.requirements?.slice(0, 100)}{u.requirements && u.requirements.length > 100 ? "…" : ""}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Uploaded {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {u.pdf?.size ? `${Math.round(u.pdf.size / 1024)} KB` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowContentModal(false);
                  resetFileInput();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (!isSignedIn) { alert("Please sign in first"); return; }
                  if (!pdfFile) { alert("Please select a PDF file"); return; }
                  if (!requirements.trim()) { alert("Enter requirements"); return; }
                  setShowConfirmModal(true);
                }}
                disabled={!pdfFile || !requirements.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Content Modal - Updated with the form from screenshot */}
      {showRequestModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Request Content for {selectedItem.title}</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleContentRequest}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Confirm Upload</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">Please confirm your upload details:</p>
                <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Website:</span>
                    <span className="font-medium">{selectedItem.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">File:</span>
                    <span className="font-medium">{pdfFile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium">{pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : ""}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-500 text-xs mb-1">Requirements:</p>
                  <p className="text-sm bg-gray-50 rounded-lg p-3">{requirements}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Confirm Upload"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Popup */}
      {showCheckoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Confirm Checkout</h3>
              <button
                onClick={() => setShowCheckoutConfirmation(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-12 w-12 text-blue-500 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Ready to checkout?</h4>
                  <p className="text-gray-600">You're about to purchase {cart.length} item{cart.length !== 1 ? 's' : ''} for a total of ${(totalCents / 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCheckoutConfirmation(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-green-600">Success!</h3>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Order Confirmed!</h4>
                  <p className="text-gray-600">Your purchase request has been submitted successfully. Our team will review your order shortly.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Temp Upload Confirmation Popup */}
      {showTempUploadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Success</h3>
              <button
                onClick={() => setShowTempUploadPopup(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Document Added</h4>
                  <p className="text-gray-600">{tempUploadPopupMessage}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTempUploadPopup(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Popup */}
      {showErrorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-red-600">Error</h3>
              <button
                onClick={() => setShowErrorMessage(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500 mr-3" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Something went wrong</h4>
                  <p className="text-gray-600">{errorMessage}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorMessage(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
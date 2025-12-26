"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

export default function CartPage() {
  const { cart, removeFromCart: originalRemoveFromCart, clearCart: originalClearCart, totalCents } = useCart();

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
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [linkInput, setLinkInput] = useState<string>('');
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [showClearCartSuccess, setShowClearCartSuccess] = useState(false);
  const [uploadsByWebsite, setUploadsByWebsite] = useState<Record<string, number>>({});
  const [modalKey, setModalKey] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTempUploadPopup, setShowTempUploadPopup] = useState(false);
  const [tempUploadPopupMessage, setTempUploadPopupMessage] = useState("");
  const [websiteDetails, setWebsiteDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [activeDetailsItem, setActiveDetailsItem] = useState<string | null>(null);
  const [uploadsByCartItem, setUploadsByCartItem] = useState<Record<string, any[]>>({});
  const [tempUploadsByCartItem, setTempUploadsByCartItem] = useState<Record<string, any[]>>({});
  const [fileDataByCartItem, setFileDataByCartItem] = useState<Record<string, ({ file?: File; link?: string; requirements?: string; linkDetails?: { anchorText?: string; targetUrl?: string; blogUrl?: string; paragraph?: string } })[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Link Details modal state
  const [showLinkDetailsModal, setShowLinkDetailsModal] = useState(false);
  const [linkDetailsItem, setLinkDetailsItem] = useState<any>(null);
  const [linkDetailsData, setLinkDetailsData] = useState({ anchorText: '', targetUrl: '', blogUrl: '', paragraph: '' });
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
  const [activeUploadsItem, setActiveUploadsItem] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUpload, setPreviewUpload] = useState<any>(null);

  const truncate = (s: string | undefined | null, n = 20) => {
    if (!s) return '';
    const str = String(s);
    return str.length > n ? str.slice(0, n) + '…' : str;
  };

  const removeFromCart = (itemId: string) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[itemId];
      return newOptions;
    });
    originalRemoveFromCart(itemId);
  };

  const clearCart = () => {
    setSelectedOptions({});
    originalClearCart();
  };

  useEffect(() => {
    if (!isSignedIn) {
      setUploadsByWebsite({});
      return;
    }
    const map: Record<string, number> = {};
    Object.entries(tempUploadsByCartItem).forEach(([websiteId, uploads]) => {
      map[websiteId] = uploads.length;
    });
    setUploadsByWebsite(map);
  }, [isSignedIn, tempUploadsByCartItem]);
  
  const handleCheckout = async () => {
    if (!isSignedIn) {
      setShowErrorMessage(true);
      setErrorMessage("Please sign in to proceed with checkout");
      return;
    }
    const unselectedItems = cart.filter(item => !selectedOptions[item._id]);
    if (unselectedItems.length > 0) {
      setShowErrorMessage(true);
      setErrorMessage("Please select 'My Content' or 'Request' for all items in your cart before proceeding to checkout.");
      return;
    }
    setShowCheckoutConfirmation(true);
  };

  const confirmCheckout = async () => {
    setShowCheckoutConfirmation(false);
    setIsProcessing(true);
    try {
      const purchaseRes = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(item => ({
            websiteId: item._id,
            title: item.title,
            priceCents: item.priceCents
          })),
          contentSelections: selectedOptions
        }),
      });

      if (!purchaseRes.ok) throw new Error(`HTTP error! status: ${purchaseRes.status}`);

      const purchaseData = await purchaseRes.json();
      const purchases = purchaseData.purchases || [];
      const purchaseIdMap: Record<string, string> = {};
      purchases.forEach((purchase: any) => {
        purchaseIdMap[purchase.websiteId] = purchase.id;
      });

      const uploadPromises = Object.entries(fileDataByCartItem).map(async ([websiteId, files]) => {
        const purchaseId = purchaseIdMap[websiteId];
        return Promise.all(files.map(async (fileData) => {
          const { file, link, requirements } = fileData as { file?: File, link?: string, requirements: string };
          const linkDetails = (fileData as any).linkDetails;
          if (file) {
            const fd = new FormData();
            fd.append("pdfFile", file);
            fd.append("requirements", requirements);
            fd.append("websiteId", websiteId);
            if (purchaseId) {
              fd.append("purchaseId", purchaseId);
            }
            const res = await fetch("/api/my-content", { method: "POST", body: fd });
            if (!res.ok) {
              let msg = `HTTP ${res.status}`;
              try { const j = await res.json(); if (j?.error) msg = j.error; } catch { }
              throw new Error(msg);
            }
            return res.json();
          } else if (link) {
            // Save the link directly to the purchase's docLink field
            if (!purchaseId) {
              // if purchaseId missing, fall back to my-content/link endpoint
              const payload = { link, requirements, websiteId, purchaseId };
              const res = await fetch("/api/my-content/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
              if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try { const j = await res.json(); if (j?.error) msg = j.error; } catch { }
                throw new Error(msg);
              }
              return res.json();
            }

            const res = await fetch(`/api/purchases/${purchaseId}/doc-link`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docLink: link }) });
            if (!res.ok) {
              let msg = `HTTP ${res.status}`;
              try { const j = await res.json(); if (j?.error) msg = j.error; } catch { }
              throw new Error(msg);
            }
            return res.json();
          } else if (linkDetails) {
            // Save link details to purchase (or to temp my-content if purchaseId missing)
            if (!purchaseId) {
              const payload = { linkDetails, websiteId, purchaseId };
              const res = await fetch("/api/my-content/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
              if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try { const j = await res.json(); if (j?.error) msg = j.error; } catch { }
                throw new Error(msg);
              }
              return res.json();
            }

            const res = await fetch(`/api/purchases/${purchaseId}/link-details`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkDetails }) });
            if (!res.ok) {
              let msg = `HTTP ${res.status}`;
              try { const j = await res.json(); if (j?.error) msg = j.error; } catch { }
              throw new Error(msg);
            }
            return res.json();
          } else {
            return Promise.resolve(null);
          }
        }));
      });

      await Promise.all(uploadPromises);
      clearCart();
      setUploadsByWebsite({});
      setMyUploads([]);
      setUploadsByCartItem({});
      setTempUploadsByCartItem({});
      setFileDataByCartItem({});
      setShowContentModal(false);
      setShowRequestModal(false);
      setShowConfirmModal(false);
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
      resetFileInput();
      setShowSuccessMessage(true);

    } catch (err: any) {
      console.error("Failed to complete purchase:", err);
      setShowErrorMessage(true);
      const msg = (err && err.message) ? err.message : "Failed to complete purchase. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const openContentModal = (item: any) => {
    setSelectedItem(item);
    setShowContentModal(true);
    setUploadMode('file');
    setLinkInput('');
    setSelectedOptions(prev => ({
      ...prev,
      [item._id]: 'content'
    }));
    setTimeout(() => {
      resetFileInput();
    }, 100);
    setMyUploads(tempUploadsByCartItem[item._id] || []);
  };

  const openRequestModal = (item: any) => {
    setSelectedItem(item);
    setShowRequestModal(true);
    setSelectedOptions(prev => ({
      ...prev,
      [item._id]: 'request'
    }));
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
    if (!contentRequestData.keywords.trim()) { alert("Please provide keywords"); return; }
    if (!contentRequestData.anchorText.trim()) { alert("Please provide anchor text"); return; }
    if (!contentRequestData.targetAudience) { alert("Please select target audience"); return; }
    if (!contentRequestData.wordCount) { alert("Please select word count"); return; }
    if (!contentRequestData.category) { alert("Please select category"); return; }
    if (!contentRequestData.landingPageUrl.trim()) { alert("Please provide landing page URL"); return; }

    try {
      const res = await fetch("/api/content-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteId: selectedItem._id,
          websiteTitle: selectedItem.title,
          topic: contentRequestData.keywords,
          wordCount: parseInt(contentRequestData.wordCount),
          contentRequest: contentRequestData
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
    if (websiteDetails[websiteId] || loadingDetails[websiteId]) return;
    setLoadingDetails(prev => ({ ...prev, [websiteId]: true }));
    try {
      const res = await fetch(`/api/websites/${websiteId}`);
      if (res.ok) {
        const data = await res.json();
        setWebsiteDetails(prev => ({ ...prev, [websiteId]: data }));
      }
    } catch (error) {
      console.error("Failed to fetch website details:", error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [websiteId]: false }));
    }
  };

  const resetFileInput = () => {
    setPdfFile(null);
    setRequirements("");
    setLinkInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const allFileInputs = document.querySelectorAll('input[type="file"]');
    allFileInputs.forEach((input: any) => {
      if (input.accept === "application/pdf") {
        input.value = "";
      }
    });
  };

  const handleClearCart = () => {
    // Removed the native confirm dialog
    // if (!confirm("Are you sure you want to clear your cart? This action cannot be undone.")) return;
    // Instead, we'll show the custom confirmation modal
    setShowClearCartModal(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setUploadsByWebsite({});
    setMyUploads([]);
    setUploadsByCartItem({});
    setTempUploadsByCartItem({});
    setFileDataByCartItem({});
    setShowContentModal(false);
    setShowRequestModal(false);
    setShowConfirmModal(false);
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
    resetFileInput();
    // Removed the alert and using a toast notification instead
    // alert("Cart cleared successfully!");
    setShowClearCartSuccess(true);
    setTimeout(() => setShowClearCartSuccess(false), 3000);
  };

  const formatTraffic = (traffic: number | string | undefined): string => {
    if (traffic === undefined || traffic === null) return 'N/A';
    const num = typeof traffic === 'string' ? parseInt(traffic) : traffic;
    if (isNaN(num)) return 'N/A';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getCountryFlag = (countryName: string | undefined): string => {
    if (!countryName) return '🌐';
    const countryFlags: Record<string, string> = {
      'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦', 'Australia': '🇦🇺',
      'Germany': '🇩🇪', 'France': '🇫🇷', 'India': '🇮🇳', 'Brazil': '🇧🇷',
      'Japan': '🇯🇵', 'China': '🇨🇳', 'Russia': '🇷🇺', 'Other': '🌐'
    };
    return countryFlags[countryName] || '🌐';
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDetailsItem(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleRemoveUpload = (upload: any) => {
    const idToRemove = upload.tempId;

    setMyUploads((prev: any[]) => prev.filter((u: any) => u.tempId !== idToRemove));

    setTempUploadsByCartItem((prev: Record<string, any[]>) => {
      const next: Record<string, any[]> = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = next[key].filter((u) => u.tempId !== idToRemove);
        if (next[key].length === 0) delete next[key];
      });
      return next;
    });

    setFileDataByCartItem((prev: Record<string, any[]>) => {
      const next: Record<string, any[]> = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = next[key].filter((item) => {
          if (!item) return false;
          // match by link
          if (upload.link && item.link && item.link === upload.link) return false;
          // match by pdf filename/size
          if (upload.pdf && item.file && upload.pdf.filename && item.file.name && upload.pdf.size && item.file.size && upload.pdf.filename === item.file.name && upload.pdf.size === item.file.size) return false;
          // match by linkDetails
          if (upload.linkDetails && item.linkDetails && JSON.stringify(upload.linkDetails) === JSON.stringify(item.linkDetails)) return false;
          return true;
        });
        if (next[key].length === 0) delete next[key];
      });
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 tracking-tight">Shopping Cart</h1>
            <p className="text-gray-600 mt-1 text-lg font-medium">
              {cart.length === 0 ? 'Your cart is empty' : `You have ${cart.length} item${cart.length === 1 ? '' : 's'} in your cart`}
            </p>
          </div>
          <Link
            href="/dashboard/consumer"
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-blue-100 rounded-2xl shadow-inner">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-blue-500 shadow-lg animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-blue-700">Your cart is empty</h3>
            <p className="mb-8 text-lg max-w-md mx-auto text-gray-700">
              Looks like you haven't added any websites yet. Explore our marketplace to find the perfect publishers for your content.
            </p>
            <Link
              href="/dashboard/consumer"
              className="px-8 py-3 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-xl font-semibold text-base flex items-center bg-blue-600 text-white shadow-lg hover:bg-blue-700"
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Websites
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {cart.map((item, idx) => (
                  <div key={item._id ?? idx} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg relative group">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md bg-blue-500 text-white">
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate" title={item.title}>
                              {truncate(String(item.title), 25)}
                            </h3>
                            <div className="relative inline-block">
                              <button
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                onMouseEnter={() => {
                                  if (!websiteDetails[item._id] && !loadingDetails[item._id]) {
                                    fetchWebsiteDetails(item._id);
                                  }
                                  setActiveDetailsItem(item._id);
                                }}
                                onMouseLeave={() => setActiveDetailsItem(null)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              {activeDetailsItem === item._id && (
                                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 p-4 text-sm border border-gray-200">
                                  <div className="font-semibold mb-2 text-gray-900">{websiteDetails[item._id]?.title || 'Loading...'}</div>
                                  {loadingDetails[item._id] ? (
                                    <div className="text-gray-500 text-xs">Loading details...</div>
                                  ) : websiteDetails[item._id] ? (
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">DA:</span>
                                        <span className="font-medium">{websiteDetails[item._id].DA}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">DR:</span>
                                        <span className="font-medium">{websiteDetails[item._id].DR}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Traffic:</span>
                                        <span className="font-medium">{formatTraffic(websiteDetails[item._id].OrganicTraffic)}</span>
                                      </div>
                                    </div>
                                  ) : null}
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            ${(item.priceCents / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex bg-blue-50 rounded-lg p-1 border border-gray-200 shadow-sm">
                            <button
                              onClick={() => {
                                if (selectedOptions[item._id] === 'link') {
                                  setSelectedOptions(prev => {
                                    const newOptions = { ...prev };
                                    delete newOptions[item._id];
                                    return newOptions;
                                  });
                                } else {
                                  setLinkDetailsData({ anchorText: '', targetUrl: '', blogUrl: '', paragraph: '' });
                                  setLinkDetailsItem(item);
                                  setShowLinkDetailsModal(true);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedOptions[item._id] === 'link'
                                ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                                : 'text-gray-600 hover:text-blue-700 hover:bg-blue-100'
                                }`}
                            >
                              Link insertion
                              {tempUploadsByCartItem[item._id]?.length > 0 && (
                                <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                  {tempUploadsByCartItem[item._id].length}
                                </span>
                              )}
                            </button>
                            {tempUploadsByCartItem[item._id]?.length > 0 && (
                              <button
                                onClick={() => setActiveUploadsItem(item._id)}
                                className="ml-2 px-2 py-1 text-xs bg-white-100 rounded-md hover:bg-green-200 transition-colors text-black border border-black"
                                aria-label="View uploads for this item"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (selectedOptions[item._id] === 'content') {
                                  setSelectedOptions(prev => {
                                    const newOptions = { ...prev };
                                    delete newOptions[item._id];
                                    return newOptions;
                                  });
                                } else {
                                  openContentModal(item);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedOptions[item._id] === 'content'
                                ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                                : 'text-gray-600 hover:text-blue-700 hover:bg-blue-100'
                                }`}
                            >
                             Upload my Content
                              {tempUploadsByCartItem[item._id]?.length > 0 && (
                                <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                  {tempUploadsByCartItem[item._id].length}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (selectedOptions[item._id] === 'request') {
                                  setSelectedOptions(prev => {
                                    const newOptions = { ...prev };
                                    delete newOptions[item._id];
                                    return newOptions;
                                  });
                                } else {
                                  openRequestModal(item);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedOptions[item._id] === 'request'
                                ? 'bg-white text-green-600 shadow-sm border border-green-200'
                                : 'text-gray-600 hover:text-green-700 hover:bg-green-100'
                                }`}
                            >
                              <span>Request for content</span>
                              <br />
                              <span className="text-[9px]">[$3 per 100 SEO optimised words]</span>
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-500 hover:text-red-500 text-xs font-medium flex items-center transition-colors group/remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover/remove:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 sticky top-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold mb-6 text-blue-700">Order Summary</h2>
                <div className="space-y-4 mb-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Subtotal ({cart.length} items)</span>
                    <span className="font-medium text-gray-900">${(totalCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${(totalCents / 100).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !isSignedIn}
                  className="w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>

                {!isSignedIn && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start border border-red-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Please sign in to complete your purchase.
                  </div>
                )}

                <button
                  onClick={handleClearCart}
                  className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center font-medium hover:bg-red-50 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showContentModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xl">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">Content for {selectedItem.title}</h3>
              <button
                onClick={() => {
                  setShowContentModal(false);
                  resetFileInput();
                }}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!isSignedIn) { alert("Please sign in first"); return; }
                if (uploadMode === 'file') {
                  if (!pdfFile) { alert("Please select a PDF file"); return; }
                } else {
                  if (!linkInput.trim()) { alert("Please provide a link"); return; }
                  try { new URL(linkInput); } catch { alert("Please provide a valid URL"); return; }
                }
                setShowConfirmModal(true);
              }}
              className="space-y-4 mb-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Your Document*</label>
                  <div className="flex items-center gap-2">
                    <label className={`inline-flex items-center cursor-pointer text-sm ${uploadMode === 'file' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      <input type="radio" name={`uploadMode-${selectedItem?._id}`} value="file" checked={uploadMode === 'file'} onChange={() => { setUploadMode('file'); setLinkInput(''); }} className="sr-only" />
                      <span className="px-2 py-1 rounded-md">Upload File</span>
                    </label>
                    <label className={`inline-flex items-center cursor-pointer text-sm ${uploadMode === 'link' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      <input type="radio" name={`uploadMode-${selectedItem?._id}`} value="link" checked={uploadMode === 'link'} onChange={() => {
                          setUploadMode('link');
                          setPdfFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                          setTimeout(() => {
                            const el = document.getElementById(`link-input-${selectedItem?._id}-${modalKey}`) as HTMLInputElement | null;
                            if (el) el.focus();
                          }, 50);
                        }} className="sr-only" />
                      <span className="px-2 py-1 rounded-md">Add Link</span>
                    </label>
                  </div>
                </div>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-all">
                  {uploadMode === 'file' ? (
                    (!pdfFile ? (
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">Drag and drop your Files here, or</p>
                        <div className="mt-2 flex items-center gap-2 justify-center">
                          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
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

                          <button
                            type="button"
                            onClick={() => {
                              setUploadMode('link');
                              setPdfFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                              setTimeout(() => {
                                const el = document.getElementById(`link-input-${selectedItem?._id}-${modalKey}`) as HTMLInputElement | null;
                                if (el) el.focus();
                              }, 50);
                            }}
                            className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                          >
                            Add Link
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">PDF files only, up to 10MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
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
                    ))
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">Provide a URL to your document</p>
                        <div className="mt-2">
                        <input
                          id={`link-input-${selectedItem?._id}-${modalKey}`}
                          type="url"
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          placeholder="https://example.com/your-file.pdf"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Ensure the link is public and points directly to a file or hosted PDF.</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Enter your requirements (optional)"
                  className="w-full p-2 border border-gray-300 rounded-md h-28 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContentModal(false);
                    resetFileInput();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-md hover:from-gray-400 hover:to-gray-500 font-medium transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={(uploadMode === 'file' && !pdfFile) || (uploadMode === 'link' && !linkInput.trim())}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Upload
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium mb-4 text-lg text-blue-700">Your Uploaded Documents</h4>
              {myUploads.length === 0 ? (
                <div className="bg-blue-50 p-4 rounded-md text-center border border-gray-200">
                  <p className="text-sm text-gray-600">No documents uploaded yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {myUploads.map((u, i) => (
                    <li key={i} className="border border-gray-200 rounded-md p-4 flex justify-between items-center text-sm hover:bg-blue-50 transition-all">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 truncate max-w-xs">
                            {u.linkDetails ? `${u.linkDetails.anchorText} (Link details)` : (u.pdf?.filename ?? u.link ?? "Document")}
                          </div>
                          <div className="text-gray-600 mt-1">
                            {u.linkDetails ? (
                              <div className="space-y-1 text-sm">
                                <div className="truncate">Target: <a href={u.linkDetails.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{u.linkDetails.targetUrl}</a></div>
                                {u.linkDetails.blogUrl && <div className="truncate">Blog: <a href={u.linkDetails.blogUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{u.linkDetails.blogUrl}</a></div>}
                                {u.linkDetails.paragraph && <div className="mt-1 text-xs text-gray-600">{u.linkDetails.paragraph.slice(0, 100)}{u.linkDetails.paragraph.length > 100 ? "…" : ""}</div>}
                              </div>
                            ) : (
                              <>{u.requirements?.slice(0, 80)}{u.requirements && u.requirements.length > 80 ? "…" : ""}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {u.link ? (
                          <a href={u.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Visit</a>
                        ) : (
                          <div className="text-gray-600 bg-blue-100 px-3 py-1 rounded-full font-medium">{u.pdf?.size ? `${Math.round(u.pdf.size / 1024)} KB` : ""}</div>
                        )}
                        <button
                          onClick={() => handleRemoveUpload(u)}
                          aria-label="Remove uploaded document"
                          className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Details Modal */}
      {showLinkDetailsModal && linkDetailsItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xl p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">Link Details for {linkDetailsItem.title}</h3>
              <button
                onClick={() => { setShowLinkDetailsModal(false); setLinkDetailsItem(null); }}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anchor Text*</label>
                <input type="text" value={linkDetailsData.anchorText} onChange={(e) => setLinkDetailsData(prev => ({ ...prev, anchorText: e.target.value }))} className="w-full p-2 border rounded-md text-black" placeholder="e.g., Click here" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL*</label>
                <input type="url" value={linkDetailsData.targetUrl} onChange={(e) => setLinkDetailsData(prev => ({ ...prev, targetUrl: e.target.value }))} className="w-full p-2 border rounded-md text-black" placeholder="https://example.com/target" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog URL</label>
                <input type="url" value={linkDetailsData.blogUrl} onChange={(e) => setLinkDetailsData(prev => ({ ...prev, blogUrl: e.target.value }))} className="w-full p-2 border rounded-md text-black" placeholder="https://blog.example.com/post" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph (Optional)</label>
                <textarea value={linkDetailsData.paragraph} onChange={(e) => setLinkDetailsData(prev => ({ ...prev, paragraph: e.target.value }))} className="w-full p-2 border rounded-md text-black" rows={4} placeholder="Optional paragraph about the link" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowLinkDetailsModal(false); setLinkDetailsItem(null); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">Cancel</button>
              <button
                onClick={() => {
                  if (!linkDetailsData.anchorText.trim() || !linkDetailsData.targetUrl.trim()) { alert('Please provide Anchor Text and Target URL'); return; }
                  const id = linkDetailsItem._id ?? linkDetailsItem.id;
                  const newUpload: any = {
                    createdAt: new Date(),
                    linkDetails: { ...linkDetailsData },
                    tempId: Date.now()
                  };
                  setTempUploadsByCartItem(prev => ({ ...prev, [id]: [...(prev[id] || []), newUpload] }));
                  setFileDataByCartItem(prev => ({ ...prev, [id]: [...(prev[id] || []), { linkDetails: { ...linkDetailsData } } as any] }));
                  setMyUploads(prev => [...prev, newUpload]);
                  setSelectedOptions(prev => ({ ...prev, [id]: 'link' }));
                  setShowLinkDetailsModal(false);
                  setLinkDetailsItem(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Save Link Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-item Uploads Modal (opened from cart item) */}
      {activeUploadsItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xl p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[80vh] overflow-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">Uploads for selected website</h3>
              <button onClick={() => setActiveUploadsItem(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {(tempUploadsByCartItem[activeUploadsItem] || []).length === 0 ? (
                <div className="text-sm text-gray-600">No uploads for this item.</div>
              ) : (
                <ul className="space-y-2">
                  {(tempUploadsByCartItem[activeUploadsItem] || []).map((u: any, idx: number) => (
                    <li key={u.tempId ?? idx} className="border border-gray-200 rounded-md p-3 flex justify-between items-start">
                      <div className="text-sm">
                        <div className="font-medium">{u.linkDetails ? `${u.linkDetails.anchorText} (Link details)` : (u.pdf?.filename ?? u.link ?? 'Document')}</div>
                        <div className="text-gray-600 text-xs">
                          {u.linkDetails ? (
                            <div className="space-y-1">
                              <div className="truncate">Target: <a href={u.linkDetails.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{u.linkDetails.targetUrl}</a></div>
                              {u.linkDetails.blogUrl && <div className="truncate">Blog: <a href={u.linkDetails.blogUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{u.linkDetails.blogUrl}</a></div>}
                            </div>
                          ) : (
                            (u.requirements ?? 'No requirements')
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setPreviewUpload(u); setShowPreviewModal(true); }}
                          className="px-2 py-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => { handleRemoveUpload(u); }}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setActiveUploadsItem(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewUpload && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xl p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">Preview Uploaded Document</h3>
              <button onClick={() => { setShowPreviewModal(false); setPreviewUpload(null); }} className="text-gray-500 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-800">
              <div><strong>Title:</strong> {previewUpload.pdf?.filename ?? previewUpload.link ?? 'Document'}</div>
              {previewUpload.pdf?.size && <div><strong>Size:</strong> {Math.round(previewUpload.pdf.size / 1024)} KB</div>}
              <div><strong>Requirements:</strong> {previewUpload.requirements ?? 'None'}</div>
              {previewUpload.createdAt && <div><strong>Created:</strong> {new Date(previewUpload.createdAt).toLocaleString()}</div>}
              {previewUpload.link && (
                <div>
                  <a href={previewUpload.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open Link</a>
                </div>
              )}
              {previewUpload.linkDetails && (
                <div className="mt-2 border-t pt-2 space-y-1 text-sm text-gray-800">
                  <div><strong>Anchor Text:</strong> {previewUpload.linkDetails.anchorText}</div>
                  <div><strong>Target URL:</strong> <a href={previewUpload.linkDetails.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{previewUpload.linkDetails.targetUrl}</a></div>
                  {previewUpload.linkDetails.blogUrl && <div><strong>Blog URL:</strong> <a href={previewUpload.linkDetails.blogUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{previewUpload.linkDetails.blogUrl}</a></div>}
                  {previewUpload.linkDetails.paragraph && <div><strong>Paragraph:</strong><div className="mt-1 text-sm text-gray-700">{previewUpload.linkDetails.paragraph}</div></div>}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowPreviewModal(false); setPreviewUpload(null); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">Close</button>
              <button
                onClick={() => {
                  handleRemoveUpload(previewUpload);
                  setShowPreviewModal(false);
                  setPreviewUpload(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">Request Content for {selectedItem.title}</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                }}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
              <h4 className="font-bold text-lg mb-2 text-blue-700">Language*</h4>
              <div className="mb-2">
                <h5 className="font-semibold text-gray-800">English</h5>
                <p className="text-sm text-gray-600">Note: The publisher only accepts content in English</p>
              </div>
            </div>

            <form className="space-y-6">
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 required">
                  Target Audience is from (Country)*
                </label>
                <select
                  name="targetAudience"
                  value={contentRequestData.targetAudience}
                  onChange={handleContentRequestChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 required">
                    Word Count*
                  </label>
                  <select
                    name="wordCount"
                    value={contentRequestData.wordCount}
                    onChange={handleContentRequestChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brief Note
                </label>
                <textarea
                  name="briefNote"
                  value={contentRequestData.briefNote}
                  onChange={handleContentRequestChange}
                  placeholder="Brief Note: Any additional notes required can be specified here in detail."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24"
                  rows={4}
                />
              </div>
            </form>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleContentRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">Confirm Upload</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
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
                <div><strong>{uploadMode === 'file' ? 'File' : 'Link'}:</strong> {uploadMode === 'file' ? pdfFile?.name : linkInput}</div>
                {uploadMode === 'file' && <div><strong>Size:</strong> {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : ""}</div>}
                <div><strong>Requirements:</strong> {requirements}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setUploading(true);
                    setShowConfirmModal(false);

                    const newUpload: any = uploadMode === 'file' ? {
                      requirements,
                      createdAt: new Date(),
                      pdf: {
                        filename: pdfFile?.name,
                        size: pdfFile?.size,
                      },
                      tempId: Date.now()
                    } : {
                      requirements,
                      createdAt: new Date(),
                      link: linkInput,
                      tempId: Date.now(),
                      filename: linkInput
                    };

                    setTempUploadsByCartItem(prev => ({
                      ...prev,
                      [selectedItem._id]: [...(prev[selectedItem._id] || []), newUpload]
                    }));
                    setFileDataByCartItem(prev => ({
                      ...prev,
                      [selectedItem._id]: [...(prev[selectedItem._id] || []), (uploadMode === 'file' ? { file: pdfFile, requirements } : { link: linkInput, requirements })]
                    }));
                    setMyUploads(prev => [...prev, newUpload]);

                    setRequirements("");
                    setPdfFile(null);
                    setLinkInput('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                    setTempUploadPopupMessage(uploadMode === 'file' ? "File added temporarily. It will be uploaded when you proceed to checkout." : "Link added temporarily. It will be submitted when you proceed to checkout.");
                    setShowTempUploadPopup(true);
                    setTimeout(() => setShowTempUploadPopup(false), 3000);
                  } catch (err: any) {
                    alert(`Upload failed: ${err?.message ?? "Unknown error"}`);
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckoutConfirmation && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-md border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-700">Confirm Checkout</h3>
              <button
                onClick={() => setShowCheckoutConfirmation(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
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
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-md border border-green-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-600">Success!</h3>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showTempUploadPopup && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-md border border-blue-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-600">Success</h3>
              <button
                onClick={() => setShowTempUploadPopup(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorMessage && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-md border border-red-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Error</h3>
              <button
                onClick={() => setShowErrorMessage(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
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
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearCartModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Clear Cart</h3>
              <button
                onClick={() => setShowClearCartModal(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Are you sure you want to clear your cart? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearCartModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClearCartModal(false);
                  confirmClearCart();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Success Toast */}
      {showClearCartSuccess && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md border border-green-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-600">Success</h3>
              <button
                onClick={() => setShowClearCartSuccess(false)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-600">All items have been successfully removed from your cart</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowClearCartSuccess(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-md hover:shadow-lg transition-all"
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
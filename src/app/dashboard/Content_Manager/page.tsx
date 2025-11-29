// src/app/superadmin/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from '@clerk/clerk-react';
import ContentManagerSidePanel from "@/components/ContentManagerSidePanel";
import SuperAdminWebsitesSection from "@/components/SuperAdminWebsitesSection";
import ContentManagherPurchasesSection from "@/components/ContentManagherPurchasesSection";
import ContentMangerUserContentSection from "@/components/ContentMangerUserContentSection";
import SuperAdminContentRequestsSection from "@/components/SuperAdminContentRequestsSection";
import SuperAdminPriceConflictsSection from "@/components/SuperAdminPriceConflictsSection";
import SuperAdminUserRequestsSection from "@/components/SuperAdminUserRequestsSection";
import SuperAdminRolesSection from "@/components/SuperAdminRolesSection";

// add Tab type to align with sidebar
type Tab =
  | "websites"
  | "userContent"
  | "purchases"
  | "contentRequests"
  | "priceConflicts"
  | "userRequests"
  | "roles";

// Type definitions
type Website = {
  id: string;
  ownerId: string;
  userId?: string;
  title: string;
  url: string;
  description: string;
  priceCents?: number;
  price?: number;
  status: "pending" | "approved" | "rejected" | "priceConflict";
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: string | string[];
  image?: string;
  views?: number;
  clicks?: number;
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: string;
  conflictsWith?: string;
  conflictGroup?: string;
  isOriginal?: boolean;
  primaryCountry?: string; // Add primaryCountry field
};

type PurchaseRequest = {
  id: string;
  websiteId: string;
  websiteTitle: string;
  priceCents: number;
  totalCents: number;
  customerId: string;
  customerEmail: string;
  status: "pending" | "ongoing" | "pendingPayment" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  contentType?: "content" | "request" | null;
};

type ContentRequest = {
  _id: string;
  websiteId: string;
  websiteTitle?: string;
  topic: string;
  wordCount?: number;
  customerId: string;
  customerEmail?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  contentRequest?: any;
};

type UserContent = {
  _id: string;
  userId: string;
  userEmail?: string;
  websiteId?: string;
  websiteTitle?: string;
  requirements: string;
  pdf?: {
    filename: string;
    size: number;
  };
  createdAt: string;
};

type PriceConflict = {
  groupId: string;
  websites: Website[];
  url: string;
  originalPrice?: number;
  newPrice?: number;
};

type UserAccessRequest = {
  _id: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  traffic: string;
  numberOfWebsites: string;
  message?: string;
  role?: "advertiser" | "publisher"; // added to match request-access schema
  status: "pending" | "approved" | "rejected" | "paused"; // Add "paused" status
  createdAt: string;
  updatedAt?: string;
};

type FilterType = "all" | "pending" | "approved" | "rejected" | "paused";

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("websites");

  // Add state for sidebar collapse status
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  // Clerk user for current user id
  const { user } = useUser();
  
  const [currentUserRole, setCurrentUserRole] = useState<"websites" | "requests" | null>(null);
  const [isSuper, setIsSuper] = useState(false);
  // For Content Manager page we only show Purchases and User Uploads
  const [allowedTabs, setAllowedTabs] = useState<Tab[]>(["purchases","userContent"]);

  // Track last-seen counts per tab to detect new items since last view.
  const LS_KEY = 'adminLastSeenCounts_v1';
  const initialCounts = (): Record<Tab, number> => ({
    websites: 0,
    userContent: 0,
    purchases: 0,
    contentRequests: 0,
    priceConflicts: 0,
    userRequests: 0,
    roles: 0,
  });

  const [lastSeenCounts, setLastSeenCounts] = useState<Record<Tab, number>>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
      return raw ? JSON.parse(raw) : initialCounts();
    } catch (e) {
      return initialCounts();
    }
  });

  // New-item flags derived from comparing current counts vs lastSeenCounts
  const [newItems, setNewItems] = useState<Record<Tab, boolean>>({
    websites: false,
    userContent: false,
    purchases: false,
    contentRequests: false,
    priceConflicts: false,
    userRequests: false,
    roles: false,
  });

  // helper to persist lastSeenCounts
  const persistLastSeen = (counts: Record<Tab, number>) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(counts));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // fetch current role for logged-in user
    async function loadRole() {
      try {
        const res = await fetch("/api/admin-roles/current");
        const json = await res.json();
        // { role: 'websites' | 'requests' | null, isSuper: boolean }
            // record role flags but keep Content Manager focused tabs visible
            setCurrentUserRole(json.role ?? null);
            setIsSuper(Boolean(json.isSuper));
            // Content Manager should only expose Purchases and User Uploads
            setAllowedTabs(["purchases","userContent"]);
            setActiveTab((prev) => (["purchases","userContent"].includes(prev) ? prev : "purchases"));
      } catch (err) {
        console.error("Failed to load admin role", err);
        // fallback: super admin view
        setAllowedTabs(["websites","userContent","purchases","contentRequests","priceConflicts","userRequests","roles"]);
      }
    }
    loadRole();
  }, []);

  // expose a function to refresh current role and allowed tabs (used when roles change)
  async function refreshCurrentRole() {
    try {
      const res = await fetch("/api/admin-roles/current");
      const json = await res.json();
  // update role flags but keep Content Manager focused tabs visible
  setCurrentUserRole(json.role ?? null);
  setIsSuper(Boolean(json.isSuper));
  setAllowedTabs(["purchases","userContent"]);
  setActiveTab((prev) => (["purchases","userContent"].includes(prev) ? prev : "purchases"));
    } catch (err) {
      console.error("Failed to refresh admin role", err);
    }
  }

  

  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [isAllWebsitesSelected, setIsAllWebsitesSelected] = useState(false);
  const [isAllPurchasesSelected, setIsAllPurchasesSelected] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [userContent, setUserContent] = useState<UserContent[]>([]);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [purchaseFilter, setPurchaseFilter] = useState<FilterType>("pending");
  const [loading, setLoading] = useState({
    websites: true,
    purchases: true
  });
  const [contentLoading, setContentLoading] = useState(true);
  const [userContentLoading, setUserContentLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [purchaseStats, setPurchaseStats] = useState({
    pending: 0,
    ongoing: 0,
    pendingPayment: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [priceConflicts, setPriceConflicts] = useState<PriceConflict[]>([]);
  const [priceConflictsLoading, setPriceConflictsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRequest | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentDetails, setContentDetails] = useState<any>(null);
  const [contentDetailsLoading, setContentDetailsLoading] = useState(false);
  const [userRequests, setUserRequests] = useState<UserAccessRequest[]>([]);
  const [userRequestsLoading, setUserRequestsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isAllRequestsSelected, setIsAllRequestsSelected] = useState(false);
  const [userRequestFilter, setUserRequestFilter] = useState<FilterType>("pending");
  
  // Add state for purchase confirmation modal
  const [showPurchaseConfirmationModal, setShowPurchaseConfirmationModal] = useState(false);
  // After
const [confirmationAction, setConfirmationAction] = useState<{ 
  purchaseId: string | null; 
  status: "approved" | "rejected" | "ongoing" | "pendingPayment" | null 
}>({ purchaseId: null, status: null });
  // Add state for success messages
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  // store messages/payment links keyed by purchase or custom key
  const [messages, setMessages] = useState<Record<string, string>>({});

  // When user opens a tab (activeTab), clear its new-item badge and persist the current count as last seen
  useEffect(() => {
    try {
      const counts = { ...lastSeenCounts };
      // compute current counts snapshot
      counts.websites = websites.length || 0;
      counts.priceConflicts = priceConflicts.length || 0;
      counts.purchases = purchaseRequests.length || 0;
      counts.userContent = userContent.length || 0;
      counts.contentRequests = requests.length || 0;
      counts.userRequests = userRequests.length || 0;
      // roles count intentionally left as 0 (could be from admin roles list)

      // if the active tab had new items, clear the badge and persist the updated count
      if (newItems[activeTab]) {
        setNewItems(prev => ({ ...prev, [activeTab]: false }));
        const updated = { ...counts };
        setLastSeenCounts(updated);
        persistLastSeen(updated);
      }
    } catch (e) {
      // ignore
    }
  }, [activeTab, websites, priceConflicts, purchaseRequests, userContent, requests, userRequests]);

  useEffect(() => {
    refresh();
  }, [filter]);

  useEffect(() => {
    refreshPurchaseRequests();
  }, [purchaseFilter]);

  useEffect(() => {
    fetchContentRequests();
    fetchUserContent();
    fetchPriceConflicts();
  }, []);

  useEffect(() => {
    fetchUserRequests();
  }, [userRequestFilter]);

  const toggleSelectAllRequests = () => {
    if (isAllRequestsSelected) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(userRequests.filter(r => r.status === "pending").map(request => request._id));
    }
    setIsAllRequestsSelected(!isAllRequestsSelected);
  };

  const toggleRequestSelection = (id: string) => {
    const currentSelected = selectedRequests || [];
    if (currentSelected.includes(id)) {
      setSelectedRequests(currentSelected.filter(requestId => requestId !== id));
    } else {
      setSelectedRequests([...currentSelected, id]);
    }
  };

  const updateRequestStatus = async (requestId: string, status: "approved" | "rejected" | "paused") => {
    try {
      const res = await fetch("/api/request-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status }),
      });

      if (res.ok) {
        fetchUserRequests();
        alert(`User request ${status} successfully`);
      } else {
        const err = await res.json();
        console.error("Failed to update request status:", err);
        alert("Failed to update request status: " + JSON.stringify(err));
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Network error. Please try again.");
    }
  };

  // Add delete request function
  const deleteRequest = async (requestId: string) => {
    try {
      if (!confirm("Are you sure you want to delete this user request? This action cannot be undone.")) {
        return;
      }

      const res = await fetch("/api/request-access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId }),
      });

      if (res.ok) {
        fetchUserRequests();
        alert("User request deleted successfully");
      } else {
        const err = await res.json();
        console.error("Failed to delete request:", err);
        alert("Failed to delete request: " + JSON.stringify(err));
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Network error. Please try again.");
    }
  };

  const approveSelectedRequests = async () => {
    const currentSelected = selectedRequests || [];
    if (currentSelected.length === 0) return;

    try {
      if (!confirm(`Are you sure you want to approve ${currentSelected.length} user request(s)?`)) {
        return;
      }

      for (const requestId of currentSelected) {
        await updateRequestStatus(requestId, "approved");
      }

      setSelectedRequests([]);
      setIsAllRequestsSelected(false);
    } catch (error) {
      console.error("Failed to approve requests in bulk:", error);
      alert("Failed to approve some requests. Please try again.");
    }
  };

  const toggleSelectAllWebsites = () => {
    if (isAllWebsitesSelected) {
      setSelectedWebsites([]);
    } else {
      setSelectedWebsites((websites || []).filter(w => w.status === "pending").map(website => website.id));
    }
    setIsAllWebsitesSelected(!isAllWebsitesSelected);
  };

  const toggleSelectAllPurchases = () => {
    if (isAllPurchasesSelected) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(
        (purchaseRequests || [])
          .filter(p => p.status === "pending")
          .map(purchase => purchase.id)
      );
    }
    setIsAllPurchasesSelected(!isAllPurchasesSelected);
  };

  const toggleWebsiteSelection = (id: string) => {
    const currentSelected = selectedWebsites || [];
    if (currentSelected.includes(id)) {
      setSelectedWebsites(currentSelected.filter(websiteId => websiteId !== id));
    } else {
      setSelectedWebsites([...currentSelected, id]);
    }
  };

  const togglePurchaseSelection = (id: string) => {
    const currentSelected = selectedPurchases || [];
    if (currentSelected.includes(id)) {
      setSelectedPurchases(currentSelected.filter(purchaseId => purchaseId !== id));
    } else {
      setSelectedPurchases([...currentSelected, id]);
    }
  };

  const approveSelectedWebsites = async () => {
    const currentSelected = selectedWebsites || [];
    if (currentSelected.length === 0) return;

    try {
      if (!confirm(`Are you sure you want to approve ${currentSelected.length} website(s)?`)) {
        return;
      }

      for (const websiteId of currentSelected) {
        await updateWebsiteStatus(websiteId, "approved");
      }

      setSelectedWebsites([]);
      setIsAllWebsitesSelected(false);

    } catch (error) {
      console.error("Failed to approve websites in bulk:", error);
      alert("Failed to approve some websites. Please try again.");
    }
  };

  const approveSelectedPurchases = async () => {
    const currentSelected = selectedPurchases || [];
    if (currentSelected.length === 0) return;

    try {
      if (!confirm(`Are you sure you want to approve ${currentSelected.length} purchase request(s)?`)) {
        return;
      }

      for (const purchaseId of currentSelected) {
        await updatePurchaseStatus(purchaseId, "approved");
      }

      setSelectedPurchases([]);
      setIsAllPurchasesSelected(false);

    } catch (error) {
      console.error("Failed to approve purchase requests in bulk:", error);
      alert("Failed to approve some purchase requests. Please try again.");
    }
  };

  // Add the confirmation function for individual purchase status updates
  const confirmPurchaseStatusUpdate = async () => {
    if (!confirmationAction.purchaseId || !confirmationAction.status) return;

    try {
      await updatePurchaseStatus(confirmationAction.purchaseId, confirmationAction.status);
      // Close the modal and reset the action
      setShowPurchaseConfirmationModal(false);
      setConfirmationAction({ purchaseId: null, status: null });
      
      // Show success message
      setSuccessMessage(`Purchase request ${confirmationAction.status} successfully`);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to update purchase status:", error);
      alert("Failed to update purchase status. Please try again.");
    }
  };

  function refresh() {
    setLoading(prev => ({ ...prev, websites: true }));
  // Send role param according to the current user's privileges. If super, request superadmin view; if websites role, request websites view
  const roleParam = isSuper ? 'superadmin' : (currentUserRole === 'websites' ? 'websites' : undefined);
  const roleQuery = roleParam ? `&role=${encodeURIComponent(roleParam)}` : '';
  fetch(`/api/websites?status=${filter}${roleQuery}`)
      .then(r => r.json())
      .then(data => {
        const websitesData = data.websites || data || [];
        setWebsites(Array.isArray(websitesData) ? websitesData : []);
        calculateStats(Array.isArray(websitesData) ? websitesData : []);

        // update new-items detection for websites
        try {
          const currentCount = Array.isArray(websitesData) ? websitesData.length : 0;
          const prev = lastSeenCounts.websites || 0;
          if (currentCount > prev) {
            setNewItems(prevState => ({ ...prevState, websites: true }));
          }
        } catch (e) { /* ignore */ }

        // Reset selection when filter changes
        if (filter !== "pending") {
          setSelectedWebsites([]);
          setIsAllWebsitesSelected(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch websites:", err);
        setWebsites([]);
        calculateStats([]);
        alert("Failed to load websites");
      })
      .finally(() => setLoading(prev => ({ ...prev, websites: false })));
  }

  function refreshPurchaseRequests() {
    setLoading(prev => ({ ...prev, purchases: true }));
    fetch("/api/purchases?role=superadmin")
      .then(r => r.json())
      .then(data => {
        const purchaseData = Array.isArray(data) ? data : [];
        setPurchaseRequests(purchaseData);
        calculatePurchaseStats(purchaseData);

        // Reset selection when filter changes
        if (purchaseFilter !== "pending") {
          setSelectedPurchases([]);
          setIsAllPurchasesSelected(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch purchase requests:", err);
        setPurchaseRequests([]);
        calculatePurchaseStats([]);
        alert("Failed to load purchase requests");
      })
      .finally(() => setLoading(prev => ({ ...prev, purchases: false })));
  }

  async function fetchUserRequests() {
    setUserRequestsLoading(true);
    try {
      const res = await fetch("/api/request-access");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserRequests(data);
      } else {
        setUserRequests([]);
      }
    } catch (err) {
      console.error("Error fetching user requests:", err);
      setUserRequests([]);
    } finally {
      setUserRequestsLoading(false);
    }
  }

  async function fetchContentRequests() {
    setContentLoading(true);
    try {
      const res = await fetch("/api/content-requests");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setRequests(data.items);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching content requests:", err);
      setRequests([]);
    } finally {
      setContentLoading(false);
    }
  }

  async function fetchUserContent() {
    setUserContentLoading(true);
    try {
      const res = await fetch("/api/admin/user-content");
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        setUserContent(data.items);
      } else {
        setUserContent([]);
      }
    } catch (err) {
      console.error("Error fetching user content:", err);
      setUserContent([]);
    } finally {
      setUserContentLoading(false);
    }
  }

  async function fetchPriceConflicts() {
    setPriceConflictsLoading(true);
    try {
      const response = await fetch('/api/price-conflicts');
      if (response.ok) {
        const data = await response.json();
        setPriceConflicts(data.conflicts || []);
        // update new-items detection for priceConflicts
        try {
          const count = (data.conflicts || []).length || 0;
          const prev = lastSeenCounts.priceConflicts || 0;
          if (count > prev) {
            setNewItems(prevState => ({ ...prevState, priceConflicts: true }));
          }
        } catch (e) { /* ignore */ }
      } else if (response.status === 403) {
        // Unauthorized - no need to spam the console in dev overlay, just show empty list
        console.warn('Not authorized to fetch price conflicts (403)');
        setPriceConflicts([]);
      } else {
        // Non-OK response: warn with status for debugging
        console.warn('Failed to fetch price conflicts', response.status, response.statusText);
        setPriceConflicts([]);
      }
    } catch (error) {
      // Unexpected network or parsing error - log for debugging but don't throw
      console.error('Error fetching price conflicts:', error);
      setPriceConflicts([]);
    } finally {
      setPriceConflictsLoading(false);
    }
  }

  async function resolvePriceConflict(conflictGroup: string, selectedWebsiteId: string, reason?: string) {
    try {
      const response = await fetch('/api/price-conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conflictGroup,
          selectedWebsiteId,
          reason: reason || 'Price conflict resolved by admin'
        })
      });

      if (response.ok) {
        alert('Price conflict resolved successfully!');
        fetchPriceConflicts(); // Refresh the list
        refresh(); // Also refresh the main website list
      } else {
        const error = await response.json();
        alert('Failed to resolve conflict: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error resolving price conflict:', error);
      alert('Network error. Please try again.');
    }
  }

  async function fetchContentDetails(purchase: PurchaseRequest) {
    setContentDetailsLoading(true);
    setSelectedPurchase(purchase);
    setShowContentModal(true);

    try {
      if (purchase.contentType === 'content') {
        // Fetch uploaded content for this specific purchase using purchaseId
        const response = await fetch(`/api/my-content?purchaseId=${purchase.id}`);
        if (response.ok) {
          const data = await response.json();
          setContentDetails({
            type: 'content',
            items: data.items || [],
            count: data.items?.length || 0
          });
        } else {
          setContentDetails({ type: 'content', items: [], count: 0, error: 'Failed to fetch content' });
        }
      } else if (purchase.contentType === 'request') {
        // Fetch content requests for this website and customer
        const response = await fetch(`/api/content-requests?websiteId=${purchase.websiteId}&customerId=${purchase.customerId}`);
        if (response.ok) {
          const data = await response.json();
          setContentDetails({
            type: 'request',
            items: data.items || [],
            count: data.items?.length || 0
          });
        } else {
          setContentDetails({ type: 'request', items: [], count: 0, error: 'Failed to fetch requests' });
        }
      }
    } catch (error) {
      console.error('Error fetching content details:', error);
      setContentDetails({
        type: purchase.contentType,
        items: [],
        count: 0,
        error: 'Network error occurred'
      });
    } finally {
      setContentDetailsLoading(false);
    }
  }

  function calculateStats(websites: Website[]) {
    const validWebsites = websites || [];
    const stats = {
      pending: validWebsites.filter(w => w.status === "pending").length,
      approved: validWebsites.filter(w => w.status === "approved").length,
      rejected: validWebsites.filter(w => w.status === "rejected").length,
      total: validWebsites.length
    };
    setStats(stats);
  }

  function calculatePurchaseStats(requests: PurchaseRequest[]) {
    const validRequests = requests || [];
    const stats = {
  pending: requests.filter(r => r.status === "pending").length,
  ongoing: requests.filter(r => r.status === "ongoing").length,
  pendingPayment: requests.filter(r => r.status === "pendingPayment").length,
  approved: requests.filter(r => r.status === "approved").length,
  rejected: requests.filter(r => r.status === "rejected").length,
  total: requests.length,
};
setPurchaseStats(stats);
  }

  async function updateWebsiteStatus(id: string, status: "approved" | "rejected", reason?: string, extraPriceCents?: number) {
    const body: any = {
      action: status === "approved" ? "approve" : "reject",
      ...(reason && { reason })
    };
    if (typeof extraPriceCents === 'number' && !Number.isNaN(extraPriceCents)) body.extraPriceCents = extraPriceCents;

    const res = await fetch(`/api/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      refresh();
      setShowRejectModal(false);
      setRejectionReason("");
      
      // Show success message when website is approved
      if (status === "approved") {
        setSuccessMessage("Website approved successfully");
        setShowSuccessMessage(true);
        
        // Hide success message after 1 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage("");
        }, 1000);
      }
    } else {
      const err = await res.json();
      console.error("Failed to update status:", err);
      alert("Failed to update status: " + JSON.stringify(err));
    }
  }

  async function updatePurchaseStatus(
    purchaseId: string,
    status: "approved" | "rejected" | "ongoing" | "pendingPayment"
  ) {
    const res = await fetch("/api/purchases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purchaseId,
        status
      }),
    });

    if (res.ok) {
      refreshPurchaseRequests();
    } else {
      const err = await res.json();
      console.error("Failed to update purchase status:", err);
      alert("Failed to update purchase status: " + JSON.stringify(err));
    }
  }

  function openRejectModal(website: Website) {
    setSelectedWebsite(website);
    setRejectionReason(website.rejectionReason || "");
    setShowRejectModal(true);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB");
  }

  function formatCurrency(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  const filteredPurchaseRequests = (purchaseRequests || []).filter(request => {
    if (purchaseFilter === "all") return true;
    return request.status === purchaseFilter;
  });

  const filteredUserRequests = userRequests.filter((req) => {
    if (userRequestFilter === "all") return true;
    // When filtering by "approved", exclude "paused" users
    if (userRequestFilter === "approved") {
      return req.status === "approved";
    }
    // When filtering by "paused", only show paused users
    if (userRequestFilter === "paused") {
      return req.status === "paused";
    }
    return req.status === userRequestFilter;
  });

  if (loading.websites && loading.purchases && contentLoading) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: 'var(--base-primary)' }}>
        <div className="w-64" style={{ backgroundColor: 'var(--base-primary)' }}></div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto" style={{ borderColor: 'var(--base-tertiary)', borderTopColor: 'var(--accent-primary)' }}></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 animate-spin mx-auto" style={{ borderColor: 'var(--base-tertiary)', borderTopColor: 'var(--accent-hover)', animationDelay: '0.1s', animationDuration: '1.2s' }}></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--secondary-primary)' }}>Loading Dashboard</h3>
              <p className="text-sm" style={{ color: 'var(--secondary-lighter)' }}>Fetching admin data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden" style={{ backgroundColor: 'var(--base-primary)' }}>
      <ContentManagerSidePanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        allowedTabs={allowedTabs} // <-- ensure allowedTabs is passed to match Sidebar props
        newItems={newItems}
        onCollapseChange={setIsSidebarCollapsed} // Add this prop
      />

      <main 
        className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto overflow-x-hidden min-w-0 max-w-none w-full transition-all duration-200"
        style={{ 
          marginLeft: isSidebarCollapsed ? '3.05rem' : '15rem',
          transition: 'margin-left 0.2s ease-out'
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8 w-full">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold" style={{ color: 'var(--secondary-primary)' }}>
              {activeTab === "websites" && "Website Moderation"}
              {activeTab === "purchases" && "Purchase Requests"}
              {activeTab === "contentRequests" && "Content Requests"}
              {activeTab === "userContent" && "User Uploads"}
              {activeTab === "priceConflicts" && "Price Conflicts"}
              {activeTab === "userRequests" && "User Access Requests"}
              {activeTab === "roles" && "User Roles Management"} {/* <-- added */}
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg" style={{ color: 'var(--secondary-lighter)' }}>
              {activeTab === "priceConflicts"
                ? "Resolve conflicts when multiple users submit the same URL with different prices"
                : "Manage websites, purchases, and content requests"}
            </p>
          </div>
          <button
            onClick={activeTab === "websites" ? refresh : activeTab === "purchases" ? refreshPurchaseRequests : activeTab === "priceConflicts" ? fetchPriceConflicts : activeTab === "userRequests" ? fetchUserRequests : fetchContentRequests}
            className="flex items-center px-3 sm:px-4 lg:px-5 py-2.5 rounded-lg shadow-sm transition duration-200 text-sm sm:text-base whitespace-nowrap"
            style={{
              backgroundColor: 'var(--base-primary)',
              color: 'var(--secondary-primary)',
              border: '1px solid var(--base-tertiary)'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--base-secondary)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--base-primary)'}
          >
            <span className="material-symbols-outlined mr-2 text-lg sm:text-xl">refresh</span>
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>

        {/* Success Message Toast */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {allowedTabs.includes("priceConflicts") && activeTab === "priceConflicts" && (
          <SuperAdminPriceConflictsSection
            priceConflicts={priceConflicts}
            priceConflictsLoading={priceConflictsLoading}
            resolvePriceConflict={resolvePriceConflict}
            formatDate={formatDate}
          />
        )}

        {allowedTabs.includes("userContent") && activeTab === "userContent" && (
          <ContentMangerUserContentSection
            userContent={userContent}
            userContentLoading={userContentLoading}
            formatDate={formatDate}
          />
        )}

        {allowedTabs.includes("contentRequests") && activeTab === "contentRequests" && (
          <SuperAdminContentRequestsSection
            requests={requests}
            contentLoading={contentLoading}
            formatDate={formatDate}
          />
        )}

        {allowedTabs.includes("purchases") && activeTab === "purchases" && (
          <ContentManagherPurchasesSection
            purchaseRequests={purchaseRequests}                 
            filteredPurchaseRequests={filteredPurchaseRequests} 
            purchaseFilter={purchaseFilter as any}
            setPurchaseFilter={setPurchaseFilter as any}
            purchaseStats={purchaseStats}
            selectedPurchases={selectedPurchases}
            isAllPurchasesSelected={isAllPurchasesSelected}
            toggleSelectAllPurchases={toggleSelectAllPurchases}
            togglePurchaseSelection={togglePurchaseSelection}
            approveSelectedPurchases={approveSelectedPurchases}
            updatePurchaseStatus={updatePurchaseStatus}
            fetchContentDetails={fetchContentDetails}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            // Add new props for confirmation modal
            showConfirmationModal={showPurchaseConfirmationModal}
            setShowConfirmationModal={setShowPurchaseConfirmationModal}
            confirmationAction={confirmationAction}
            setConfirmationAction={setConfirmationAction}
            confirmPurchaseStatusUpdate={confirmPurchaseStatusUpdate}
            messages={messages}
            setMessages={(updater:any) => setMessages(updater)}
            currentUserId={user?.id || ''}
            userRole={'superadmin'}
          />
        )}

        {allowedTabs.includes("websites") && activeTab === "websites" && (
          <SuperAdminWebsitesSection
            websites={websites}
            loading={loading}
            filter={filter as any}
            setFilter={setFilter as any}
            stats={stats}
            selectedWebsites={selectedWebsites}
            isAllWebsitesSelected={isAllWebsitesSelected}
            toggleSelectAllWebsites={toggleSelectAllWebsites}
            toggleWebsiteSelection={toggleWebsiteSelection}
            approveSelectedWebsites={approveSelectedWebsites}
            updateWebsiteStatus={updateWebsiteStatus}
            openRejectModal={openRejectModal}
            refresh={refresh}
          />
        )}

        {allowedTabs.includes("userRequests") && activeTab === "userRequests" && (
          <SuperAdminUserRequestsSection
            userRequests={filteredUserRequests}
            userRequestsLoading={userRequestsLoading}
            selectedRequests={selectedRequests}
            isAllRequestsSelected={isAllRequestsSelected}
            userRequestFilter={userRequestFilter}
            setUserRequestFilter={setUserRequestFilter}
            toggleSelectAllRequests={toggleSelectAllRequests}
            toggleRequestSelection={toggleRequestSelection}
            approveSelectedRequests={approveSelectedRequests}
            updateRequestStatus={updateRequestStatus}
            formatDate={formatDate}
            deleteRequest={deleteRequest} // Add delete function
          />
        )}

        {allowedTabs.includes("roles") && activeTab === "roles" && (
          <SuperAdminRolesSection onRolesChange={refreshCurrentRole} />
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedWebsite && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(13, 17, 23, 0.3)" }}>
            <div className="bg-white p-4 lg:p-5 rounded-xl w-full max-w-sm lg:max-w-md shadow-lg border border-gray-200">
              <h3 className="text-base lg:text-lg font-semibold mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Reject Website
              </h3>
              <p className="text-gray-600 text-xs lg:text-sm mb-3">
                Please provide a reason for rejecting &quot;{(selectedWebsite?.title || 'this website')}&quot;:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border rounded-lg h-20 lg:h-24 resize-none text-xs lg:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs lg:text-sm hover:bg-gray-300 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateWebsiteStatus(selectedWebsite?.id || '', "rejected", rejectionReason)}
                  className="px-3 py-2 bg-red-500 text-white rounded text-xs lg:text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto"
                  disabled={!rejectionReason.trim()}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Details Modal */}
        {showContentModal && selectedPurchase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-3">
                  {selectedPurchase.contentType === 'content' ? (
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-800">
                      {selectedPurchase.contentType === 'content' ? 'User Uploaded Content' : 'Content Requests'}
                    </div>
                    <div className="text-sm text-gray-500 font-normal">for {selectedPurchase.websiteTitle}</div>
                  </div>
                </h3>
                <button
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedPurchase(null);
                    setContentDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Purchase Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Purchase Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* <div>
                    <span className="font-medium text-gray-600">Customer lll:</span>
                    <div className="text-gray-800">{selectedPurchase.customerEmail}</div>
                  </div> */}
                  <div>
                    <span className="font-medium text-gray-600">Purchase Date:</span>
                    <div className="text-gray-800">{formatDate(selectedPurchase.createdAt)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Amount:</span>
                    <div className="text-gray-800 font-bold">{formatCurrency(selectedPurchase.totalCents)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedPurchase.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedPurchase.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedPurchase.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              {contentDetailsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-500 mx-auto"></div>
                    <p className="text-blue-600 font-medium">Loading content details...</p>
                  </div>
                </div>
              ) : contentDetails?.error ? (
                <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Content</h3>
                  <p className="text-red-600">{contentDetails.error}</p>
                </div>
              ) : contentDetails?.items?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Content Found</h3>
                  <p className="text-gray-500">
                    {selectedPurchase.contentType === 'content'
                      ? 'No files have been uploaded for this purchase yet.'
                      : 'No content requests have been submitted for this purchase yet.'}
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    {selectedPurchase.contentType === 'content' ? 'Uploaded Files' : 'Content Requests'}
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {contentDetails?.count || 0} item{(contentDetails?.count || 0) !== 1 ? 's' : ''}
                    </span>
                  </h4>

                  {selectedPurchase.contentType === 'content' ? (
                    // Display uploaded content
                    <div className="space-y-4">
                      {contentDetails?.items?.map((item: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.pdf?.filename || 'PDF Document'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Size: {item.pdf?.size ? `${(item.pdf.size / 1024).toFixed(1)} KB` : 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Requirements:</span>
                                  <div className="mt-1 text-gray-700">{item.requirements || 'No requirements specified'}</div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Uploaded: {new Date(item.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <a
                              href={`/api/admin/pdf/${item._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 hover:border-blue-400 transition-colors text-sm font-medium"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Display content requests
                    <div className="space-y-4">
                      {contentDetails?.items?.map((item: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    Content Request #{index + 1}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    Topic: {item.topic || 'No topic specified'}
                                  </div>
                                  {item.wordCount && (
                                    <div className="text-sm text-gray-500">
                                      Word Count: {item.wordCount} words
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-2">
                                    Requested: {new Date(item.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status?.toUpperCase() || 'PENDING'}
                              </span>
                            </div>

                            {/* Show detailed content request information if available */}
                            {item.contentRequest && (
                              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                <h5 className="text-sm font-medium text-gray-800 mb-2">Request Details</h5>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  {item.contentRequest.keywords && (
                                    <div>
                                      <span className="font-medium text-gray-600">Keywords:</span>
                                      <div className="text-gray-700">{item.contentRequest.keywords}</div>
                                    </div>
                                  )}
                                  {item.contentRequest.anchorText && (
                                    <div>
                                      <span className="font-medium text-gray-600">Anchor Text:</span>
                                      <div className="text-gray-700">{item.contentRequest.anchorText}</div>
                                    </div>
                                  )}
                                  {item.contentRequest.targetAudience && (
                                    <div>
                                      <span className="font-medium text-gray-600">Target Audience:</span>
                                      <div className="text-gray-700">{item.contentRequest.targetAudience}</div>
                                    </div>
                                  )}
                                  {item.contentRequest.category && (
                                    <div>
                                      <span className="font-medium text-gray-600">Category:</span>
                                      <div className="text-gray-700">{item.contentRequest.category}</div>
                                    </div>
                                  )}
                                  {item.contentRequest.landingPageUrl && (
                                    <div className="col-span-2">
                                      <span className="font-medium text-gray-600">Landing Page:</span>
                                      <div className="text-gray-700 break-all">{item.contentRequest.landingPageUrl}</div>
                                    </div>
                                  )}
                                  {item.contentRequest.briefNote && (
                                    <div className="col-span-2">
                                      <span className="font-medium text-gray-600">Brief Note:</span>
                                      <div className="text-gray-700">{item.contentRequest.briefNote}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedPurchase(null);
                    setContentDetails(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
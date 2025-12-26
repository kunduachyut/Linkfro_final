"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import MarketplaceSection from "@/components/MarketplaceSection";
import PurchasesSection from "@/components/PurchasesSection";
import AdRequestsSection from "@/components/AdRequestsSection";
import ContentRequestsSection from "@/components/ContentRequestsSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import PendingPaymentsSection from "@/components/PendingPaymentsSection";
import ConsumerSidebar from "@/components/ConsumerSidebar";



type Website = {
  _id?: string;
  id?: string;
  title: string;
  url: string;
  description: string;
  priceCents: number;
  status: "pending" | "approved" | "rejected";
  available: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  clicks?: number;
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: string;
  category?: string | string[];
  primaryCountry?: string;
};

type Purchase = {
  _id: string;
  websiteId: Website | string;
  amountCents: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type TabType = "marketplace" | "purchases" | "pendingPayments" | "adRequests" | "contentRequests" | "analytics";

export default function ConsumerDashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Purchase[]>([]); // New state
  const [adRequests, setAdRequests] = useState<any[]>([]);
  const [contentRequests, setContentRequests] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState({ 
    websites: true, 
    purchases: true, 
    pendingPayments: true, // New loading state
    adRequests: true, 
    contentRequests: true 
  });
  const [error, setError] = useState({ 
    websites: "", 
    purchases: "", 
    pendingPayments: "", // New error state
    adRequests: "", 
    contentRequests: "" 
  });
  const [activeTab, setActiveTab] = useState<TabType>("marketplace");
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    purchases: 0,
    pendingPayments: 0, // New stat
    adRequests: 0,
    contentRequests: 0
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const { addToCart, itemCount } = useCart();

  useEffect(() => {
    // Check URL parameters for initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['marketplace', 'purchases', 'pendingPayments', 'adRequests', 'contentRequests', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
    
    refreshWebsites();
    refreshPurchases();
    refreshPendingPayments(); // New function call
    fetchAdRequests();
    fetchContentRequests();
  }, []);
  
  // Reset selected items when tab changes
  useEffect(() => {
    setSelectedItems({});
    setSelectAll(false);
  }, [activeTab]);

  // Handle tab switching event
  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      const tab = event.detail as TabType;
      setActiveTab(tab);
    };

    window.addEventListener('switchTab', handleTabSwitch as EventListener);
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch as EventListener);
    };
  }, []);

  // Calculate stats whenever data changes
  useEffect(() => {
    // prefer server-provided pendingPayments count, fallback to counting purchases
    const pendingCount =
      Array.isArray(pendingPayments) && pendingPayments.length > 0
        ? pendingPayments.length
        : purchases.filter((p) => p?.status === "pendingPayment").length;

    setStats({
      total: websites.length,
      purchases: purchases.length,
      pendingPayments: pendingCount, // New stat
      adRequests: adRequests.length,
      contentRequests: contentRequests.length
    });
  }, [websites, purchases, pendingPayments, adRequests, contentRequests]);

  async function refreshWebsites() {
    setLoading((prev) => ({ ...prev, websites: true }));
    setError((prev) => ({ ...prev, websites: "" }));

    try {
  // Request no limit (all websites) by using limit=0
  const res = await fetch("/api/websites?limit=0");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const rawWebsites = Array.isArray(data) ? data : data.websites || [];
      const websitesData: Website[] = rawWebsites.map((w: any) => ({
        ...w,
        _id: w._id ?? w.id,
        id: w.id ?? w._id,
        priceCents: typeof w.priceCents === 'number' && !Number.isNaN(w.priceCents)
          ? w.priceCents
          : typeof w.price === 'number' && !Number.isNaN(w.price)
            ? Math.round(w.price * 100)
            : 0,
        available: w.available !== undefined ? w.available : true,
        category: w.category || [],
        primaryCountry: w.primaryCountry || "",
        createdAt: w.createdAt || new Date().toISOString(),
        updatedAt: w.updatedAt || new Date().toISOString(),
      }));
      const approvedWebsites = websitesData.filter(
        (w: Website) => w.status === "approved" && w.available !== false
      );

      setWebsites(approvedWebsites);
    } catch (err) {
      console.error("Failed to fetch websites:", err);
      setError((prev) => ({
        ...prev,
        websites: err instanceof Error ? err.message : "Failed to load websites"
      }));
    } finally {
      setLoading((prev) => ({ ...prev, websites: false }));
    }
  }

  async function refreshPurchases() {
    setLoading((prev) => ({ ...prev, purchases: true }));
    setError((prev) => ({ ...prev, purchases: "" }));

    try {
      const res = await fetch("/api/purchases");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const purchasesData = Array.isArray(data) ? data : data.purchases || [];
      setPurchases(purchasesData);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
      setError((prev) => ({
        ...prev,
        purchases: err instanceof Error ? err.message : "Failed to load purchases"
      }));
    } finally {
      setLoading((prev) => ({ ...prev, purchases: false }));
    }
  }

  // New function to fetch pending payments
  async function refreshPendingPayments() {
    setLoading((prev) => ({ ...prev, pendingPayments: true }));
    setError((prev) => ({ ...prev, pendingPayments: "" }));

    try {
      // use camelCase "pendingPayment" to match backend status value
      const res = await fetch("/api/purchases?status=pendingPayment");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const pendingPaymentsData = Array.isArray(data) ? data : data.purchases || [];
      setPendingPayments(pendingPaymentsData);
    } catch (err) {
      console.error("Failed to fetch pending payments:", err);
      setError((prev) => ({
        ...prev,
        pendingPayments: err instanceof Error ? err.message : "Failed to load pending payments"
      }));
    } finally {
      setLoading((prev) => ({ ...prev, pendingPayments: false }));
    }
  }

  async function fetchAdRequests() {
    setLoading((prev) => ({ ...prev, adRequests: true }));
    setError((prev) => ({ ...prev, adRequests: "" }));

    try {
      const res = await fetch("/api/ad-requests");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setAdRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch ad requests:", err);
      setError((prev) => ({
        ...prev,
        adRequests: err instanceof Error ? err.message : "Failed to load ad requests"
      }));
    } finally {
      setLoading((prev) => ({ ...prev, adRequests: false }));
    }
  }

  async function fetchContentRequests() {
    setLoading((prev) => ({ ...prev, contentRequests: true }));
    setError((prev) => ({ ...prev, contentRequests: "" }));

    try {
      const res = await fetch("/api/content-requests");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setContentRequests(data.items || []);
    } catch (err) {
      console.error("Failed to fetch content requests:", err);
      setError((prev) => ({
        ...prev,
        contentRequests: err instanceof Error ? err.message : "Failed to load content requests"
      }));
    } finally {
      setLoading((prev) => ({ ...prev, contentRequests: false }));
    }
  }

  async function buy(websiteId: string) {
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      refreshPurchases();
      refreshPendingPayments(); // Also refresh pending payments
    } catch (err) {
      console.error("Failed to purchase:", err);
      alert("Failed to complete purchase. Please try again.");
    }
  }

  const paidSiteIds = new Set(
    purchases
      .filter((p) => p.status === "paid" || p.status === "completed")
      .map((p) => {
        if (typeof p.websiteId === "string") {
          return p.websiteId;
        }
        if (p.websiteId?._id) {
          return p.websiteId._id;
        }
        return p.websiteId || "";
      })
  );

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden bg-blue-50">
      <ConsumerSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onCollapseChange={setSidebarCollapsed}
      />
      
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto overflow-x-hidden min-w-0 max-w-none w-full transition-all duration-300 ${sidebarCollapsed ? 'ml-12' : 'ml-52'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8 w-full">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 font-display">
              {activeTab === "marketplace" && "Link Asset Marketplace"}
              {activeTab === "purchases" && "My Purchases"}
              {activeTab === "pendingPayments" && "Pending Payments"}
              {activeTab === "adRequests" && "Ad Requests"}
              {activeTab === "contentRequests" && "Content Requests"}
              {activeTab === "analytics" && "Analytics Dashboard"}
            </h1>
            <p className="mt-2 text-base lg:text-lg text-blue-500 font-body">
              {activeTab === "marketplace" && "Explore & Purchase Premium Resources"}
              {activeTab === "purchases" && "Manage your purchased websites"}
              {activeTab === "pendingPayments" && "Complete payment for your pending purchases"}
              {activeTab === "adRequests" && "Track and manage ad placements"}
              {activeTab === "contentRequests" && "Request content for your websites"}
              {activeTab === "analytics" && "Monitor your advertising performance"}
            </p>
          </div>
          <button 
            onClick={activeTab === "marketplace" ? refreshWebsites : 
                     activeTab === "purchases" ? refreshPurchases : 
                     activeTab === "pendingPayments" ? refreshPendingPayments :
                     activeTab === "adRequests" ? fetchAdRequests : 
                     fetchContentRequests}
            className="flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md font-body"
            style={{
              backgroundColor: '#f8fafc',
              color: '#1e40af',
              border: '1px solid #cbd5e1'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#e2e8f0';
              (e.target as HTMLElement).style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#f8fafc';
              (e.target as HTMLElement).style.borderColor = '#cbd5e1';
            }}
          >
            <span className="material-symbols-outlined mr-1 text-base"></span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Marketplace Section */}
        {activeTab === "marketplace" && (
          <MarketplaceSection 
            websites={websites}
            loading={loading.websites}
            error={error.websites}
            refreshWebsites={refreshWebsites}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            selectAll={selectAll}
            setSelectAll={setSelectAll}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            paidSiteIds={paidSiteIds as Set<string>}
          />
        )}

        {/* Purchases Section */}
        {activeTab === "purchases" && (
          <PurchasesSection
            purchases={purchases}
            loading={loading.purchases}
            error={error.purchases}
            refreshPurchases={refreshPurchases}
            messages={messages}
            setMessages={setMessages}
          />
        )}

        {/* Pending Payments Section */}
        {activeTab === "pendingPayments" && (
          <PendingPaymentsSection
            pendingPayments={pendingPayments}
            loading={loading.pendingPayments}
            error={error.pendingPayments}
            refreshPendingPayments={refreshPendingPayments}
          />
        )}

        {/* Analytics Section */}
        {activeTab === "analytics" && (
          <AnalyticsSection
            stats={stats}
            websites={websites}
          />
        )}

        {/* Ad Requests Section */}
        {activeTab === "adRequests" && (
          <AdRequestsSection
            adRequests={adRequests}
            loading={loading.adRequests}
            error={error.adRequests}
            fetchAdRequests={fetchAdRequests}
          />
        )}

        {/* Content Requests Section */}
        {activeTab === "contentRequests" && (
          <ContentRequestsSection
            contentRequests={contentRequests}
            loading={loading.contentRequests}
            error={error.contentRequests}
            fetchContentRequests={fetchContentRequests}
          />
        )}
      </main>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import MarketplaceSection from "@/components/MarketplaceSection";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Purchase = {
  _id: string;
  websiteId: any;
  amountCents: number;
  totalCents?: number;
  priceCents?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

interface PendingPaymentsSectionProps {
  pendingPayments: Purchase[];
  loading: boolean;
  error: string;
  refreshPendingPayments: () => void;
  messages?: Record<string, string>; // optional map of purchaseId -> payment link
}

const getCountryFlagEmoji = (countryName?: string) => {
  if (!countryName) return "🌐";
  const map: Record<string, string> = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    "Canada": "🇨🇦",
    "Australia": "🇦🇺",
    "India": "🇮🇳",
    "Brazil": "🇧🇷",
    "Germany": "🇩🇪",
    "France": "🇫🇷",
    "Japan": "🇯🇵",
    "China": "🇨🇳",
    "Other": "🌐",
  };
  if (map[countryName]) return map[countryName];
  return "🌐";
};

export default function PendingPaymentsSection({
  pendingPayments,
  loading,
  error,
  refreshPendingPayments,
  messages,
}: PendingPaymentsSectionProps) {
  // keep a map of website details for purchases whose websiteId is a string
  const [websiteDetails, setWebsiteDetails] = useState<Record<string, any>>({});
  const [loadingWebsites, setLoadingWebsites] = useState<Record<string, boolean>>({});
  const [showMarketplace, setShowMarketplace] = useState(false);
  // Track payment links fetched from database
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({});
  const [loadingPaymentLinks, setLoadingPaymentLinks] = useState<Record<string, boolean>>({});

  // Filter to only include purchases with status "pendingPayment"
  const filtered = (pendingPayments || []).filter((p) => p?.status === "pendingPayment");

  useEffect(() => {
    // find website ids we need to fetch (when websiteId is a string)
    const idsToFetch = Array.from(
      new Set(
        filtered
          .map((p) => (typeof p.websiteId === "string" ? p.websiteId : null))
          .filter(Boolean) as string[]
      )
    ).filter((id) => !websiteDetails[id] && !loadingWebsites[id]);

    if (idsToFetch.length === 0) return;

    idsToFetch.forEach(async (id) => {
      try {
        setLoadingWebsites((s) => ({ ...s, [id]: true }));
        // adjust endpoint if your API path differs
        const res = await fetch(`/api/websites/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch website ${id}`);
        const json = await res.json();
        // the API may return { website } or website directly
        const site = json.website ?? json;
        setWebsiteDetails((s) => ({ ...s, [id]: site }));
      } catch (err) {
        console.error("Failed to load website details for", id, err);
        setWebsiteDetails((s) => ({ ...s, [id]: null }));
      } finally {
        setLoadingWebsites((s) => ({ ...s, [id]: false }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // Fetch payment links from database for pending payments
  useEffect(() => {
    const purchaseIdsToFetch = filtered
      .map((p) => p._id)
      .filter((id) => !paymentLinks[id] && !loadingPaymentLinks[id]);

    if (purchaseIdsToFetch.length === 0) return;

    purchaseIdsToFetch.forEach(async (purchaseId) => {
      try {
        setLoadingPaymentLinks((s) => ({ ...s, [purchaseId]: true }));
        const res = await fetch(`/api/purchases/${purchaseId}`);
        if (res.ok) {
          const json = await res.json();
          const link = json.paymentLink || null;
          if (link) {
            setPaymentLinks((s) => ({ ...s, [purchaseId]: link }));
          }
        }
      } catch (err) {
        console.error("Failed to load payment link for", purchaseId, err);
      } finally {
        setLoadingPaymentLinks((s) => ({ ...s, [purchaseId]: false }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleString() : "N/A");

  const completePayment = async (purchaseId: string) => {
    try {
      // First try to fetch any persisted paymentLink for this purchase from server
      let paymentLink: string | null = null;
      try {
        const getRes = await fetch(`/api/purchases/${purchaseId}`);
        if (getRes.ok) {
          const json = await getRes.json();
          paymentLink = json.paymentLink || null;
        }
      } catch (err) {
        // ignore fetch error and fall back to any in-memory messages
      }

      // fallback to in-memory messages map if server didn't have link
      if (!paymentLink && messages) paymentLink = messages[`paymentLink:${purchaseId}`] || messages[purchaseId] || null;

      // If a payment link is provided, open it in a new tab for the admin to complete the payment flow
      if (paymentLink) {
        try {
          window.open(paymentLink, "_blank");
        } catch (err) {
          console.warn("Could not open payment link in new tab:", err);
        }
      }

      const res = await fetch(`/api/purchases/${purchaseId}/complete-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentLink }),
      });
      if (!res.ok) throw new Error("Failed to complete payment");
      refreshPendingPayments();
      alert("Payment completed successfully!");
    } catch (err) {
      console.error("Failed to complete payment:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--accent-primary)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button onClick={refreshPendingPayments} className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="material-symbols-outlined text-6xl mb-4" style={{ color: "var(--secondary-lighter)" }}>
          pending_actions
        </div>
        <h3 className="text-xl font-medium mb-2" style={{ color: "var(--secondary-primary)" }}>
          No pending payments
        </h3>
        <p style={{ color: "var(--secondary-lighter)" }}>You don't have any purchases waiting for payment.</p>
        <button
          onClick={() => {
            // Use the existing tab switching mechanism
            const event = new CustomEvent('switchTab', { detail: 'marketplace' });
            window.dispatchEvent(event);
            
            // Also update the URL to reflect the marketplace tab
            const url = new URL(window.location.href);
            url.searchParams.set('tab', 'marketplace');
            window.history.pushState({}, '', url);
          }}
          className="inline-block mt-4 px-6 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: "var(--accent-primary)" }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "var(--accent-hover)")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "var(--accent-primary)")}
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm font-body" style={{ color: "var(--secondary-lighter)" }}>
          You have {filtered.length} pending payment{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Pending Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Table Header */}
            <div className="bg-blue-50 border-b border-blue-100 grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider items-center font-body">
              <div className="col-span-5 flex items-center gap-1">
                <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                  Website
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Website domain for which payment is pending</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="col-span-2 flex justify-center items-center gap-1">
                <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                  Category
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Content category of the website</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="col-span-1 flex justify-center items-center gap-1">
                <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                  Amount
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Total price for this purchase</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="col-span-1 flex justify-center items-center gap-1">
                <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                  Country
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Primary country of the website's audience</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="col-span-2 flex justify-center items-center gap-1">
                <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                  Created
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Date when the purchase was created</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="col-span-1 flex justify-center items-center gap-1">
                <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                  Actions
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Complete or cancel the pending payment</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filtered.map((purchase) => {
                const websiteRaw = purchase.websiteId;
                const website =
                  typeof websiteRaw === "string" ? websiteDetails[websiteRaw] : websiteRaw;
                const loadingSite = typeof websiteRaw === "string" ? loadingWebsites[websiteRaw] : false;

                const title =
                  website && typeof website === "object"
                    ? website.title || website.name || website.url || "Website Purchase"
                    : typeof websiteRaw === "string"
                    ? loadingSite
                      ? "Loading..."
                      : "Website (details unavailable)"
                    : "Website Purchase";

                const url = website && typeof website === "object" ? website.url : undefined;
                const category =
                  website && typeof website === "object"
                    ? Array.isArray(website.category)
                      ? website.category[0]
                      : website.category
                    : undefined;
                const primaryCountry = website && typeof website === "object" ? website.primaryCountry : undefined;

                const priceCents =
                  typeof purchase.amountCents === "number"
                    ? purchase.amountCents
                    : typeof purchase.totalCents === "number"
                    ? purchase.totalCents
                    : typeof website?.priceCents === "number"
                    ? website.priceCents
                    : 0;

                return (
                  <div
                    key={purchase._id}
                    className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    {/* Website Info */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs font-body">
                            {title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-gray-900 truncate font-body" title={title}>
                            {title}
                          </div>
                          <div className="text-xs text-gray-500 truncate font-body" title={url}>
                            {url}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 flex justify-center">
                      <div className="text-sm text-gray-900 font-body">
                        {category || "N/A"}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-1 flex justify-center">
                      <div className="font-bold text-green-600 font-body">
                        <span className="text-sm font-body">$</span>
                        <span className="text-base font-body">{(priceCents / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="col-span-1 flex justify-center">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-body">{getCountryFlagEmoji(primaryCountry)}</span>
                        <span className="text-sm text-gray-900 truncate font-body">{primaryCountry || "Global"}</span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2 flex justify-center">
                      <div className="text-sm text-gray-900 font-body">
                        {formatDate(purchase.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-center space-x-2">
                      {/* View Payment Slip Button - check both database and messages prop */}
                      {(paymentLinks[purchase._id] || (messages && messages[`paymentLink:${purchase._id}`])) && (
                        <button
                          onClick={() => {
                            const paymentLink = paymentLinks[purchase._id] || (messages && messages[`paymentLink:${purchase._id}`]);
                            if (paymentLink) {
                              try {
                                window.open(paymentLink, "_blank");
                              } catch (err) {
                                console.warn("Could not open payment slip:", err);
                                alert("Could not open payment slip. Please try again.");
                              }
                            }
                          }}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50 transition-colors"
                          title="View the payment slip/invoice"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}

                      {/* Complete Payment Button */}
                      <button
                        onClick={() => completePayment(purchase._id)}
                        className="p-1.5 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50 transition-colors"
                        title="Mark this payment as completed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
      {showMarketplace && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowMarketplace(false)} />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Marketplace</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMarketplace(false)}
                  className="px-3 py-1 rounded text-sm border"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Close the modal and switch to the marketplace tab
                    setShowMarketplace(false);
                    
                    // Use the existing tab switching mechanism
                    const event = new CustomEvent('switchTab', { detail: 'marketplace' });
                    window.dispatchEvent(event);
                    
                    // Also update the URL to reflect the marketplace tab
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'marketplace');
                    window.history.pushState({}, '', url);
                  }}
                  className="px-3 py-1 rounded text-sm border bg-blue-500 text-white border-blue-500"
                >
                  Browse Full Marketplace
                </button>
              </div>
            </div>
            <div className="w-full h-[80vh]">
              <iframe src="/MarketplaceSection" title="Marketplace" className="w-full h-full border-0" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
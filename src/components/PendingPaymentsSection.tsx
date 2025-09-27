import React, { useEffect, useState } from "react";
import MarketplaceSection from "@/components/MarketplaceSection";

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

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleDateString() : "N/A");

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
      alert("Failed to complete payment. Please try again.");
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
        <p className="text-sm" style={{ color: "var(--secondary-lighter)" }}>
          You have {filtered.length} pending payment{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4">
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
              className="p-4 rounded-lg border transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ backgroundColor: "var(--base-secondary)", borderColor: "var(--base-tertiary)" }}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {title.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg truncate" style={{ color: "var(--secondary-primary)" }}>
                      {title}
                    </h3>
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline truncate" title={url}>
                        Visit
                      </a>
                    )}
                  </div>

                  {category && <div className="text-xs text-gray-500 mt-1">Category: {category}</div>}

                  <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{getCountryFlagEmoji(primaryCountry)}</span>
                      <span className="truncate">{primaryCountry || "Global"}</span>
                    </div>
                    {purchase.createdAt && <div className="text-xs text-gray-400">Created: {formatDate(purchase.createdAt)}</div>}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-3 mt-3 sm:mt-0">
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">{formatCurrency(priceCents)}</div>
                  <div className="text-xs text-gray-500">
                    Status: <span className="font-semibold">{purchase.status}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => completePayment(purchase._id)}
                    className="px-4 py-2 rounded-lg text-white transition-colors text-sm font-medium"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "var(--accent-hover)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "var(--accent-primary)")}
                  >
                    Complete Payment
                  </button>

                  <button
                    onClick={() => {
                      if (!confirm("Cancel this pending payment?")) return;
                    }}
                    className="px-4 py-2 rounded-lg border transition-colors text-sm font-medium"
                    style={{ borderColor: "var(--base-tertiary)", color: "var(--secondary-primary)" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "var(--base-tertiary)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "transparent")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
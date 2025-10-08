"use client";

import React, { useState, useEffect } from "react";

// Import Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Country flag mapping function
const getCountryFlagEmoji = (countryName: string): string => {
  // This is a simplified mapping. In a real application, you might want to use a more comprehensive library
  const flagMap: Record<string, string> = {
    'Afghanistan': '🇦🇫',
    'Albania': '🇦🇱',
    'Algeria': '🇩🇿',
    'Andorra': '🇦🇩',
    'Angola': '🇦🇴',
    'Antigua and Barbuda': '🇦🇬',
    'Argentina': '🇦🇷',
    'Armenia': '🇦🇲',
    'Australia': '🇦🇺',
    'Austria': '🇦🇹',
    'Azerbaijan': '🇦🇿',
    'Bahamas': '🇧🇸',
    'Bahrain': '🇧🇭',
    'Bangladesh': '🇧🇩',
    'Barbados': '🇧🇧',
    'Belarus': '🇧🇾',
    'Belgium': '🇧🇪',
    'Belize': '🇧🇿',
    'Benin': '🇧🇯',
    'Bhutan': '🇧🇹',
    'Bolivia': '🇧🇴',
    'Bosnia and Herzegovina': '🇧🇦',
    'Botswana': '🇧🇼',
    'Brazil': '🇧🇷',
    'Brunei': '🇧🇳',
    'Bulgaria': '🇧🇬',
    'Burkina Faso': '🇧🇫',
    'Burundi': '🇧🇮',
    'Cabo Verde': '🇨🇻',
    'Cambodia': '🇰🇭',
    'Cameroon': '🇨🇲',
    'Canada': '🇨🇦',
    'Central African Republic': '🇨🇫',
    'Chad': '🇹🇩',
    'Chile': '🇨🇱',
    'China': '🇨🇳',
    'Colombia': '🇨🇴',
    'Comoros': '🇰🇲',
    'Congo (Congo-Brazzaville)': '🇨🇬',
    'Costa Rica': '🇨🇷',
    'Croatia': '🇭🇷',
    'Cuba': '🇨🇺',
    'Cyprus': '🇨🇾',
    'Czechia (Czech Republic)': '🇨🇿',
    'Democratic Republic of the Congo': '🇨🇩',
    'Denmark': '🇩🇰',
    'Djibouti': '🇩🇯',
    'Dominica': '🇩🇲',
    'Dominican Republic': '🇩🇴',
    'Ecuador': '🇪🇨',
    'Egypt': '🇪🇬',
    'El Salvador': '🇸🇻',
    'Equatorial Guinea': '🇬🇶',
    'Eritrea': '🇪🇷',
    'Estonia': '🇪🇪',
    'Eswatini (fmr. "Swaziland")': '🇸🇿',
    'Ethiopia': '🇪🇹',
    'Fiji': '🇫🇯',
    'Finland': '🇫🇮',
    'France': '🇫🇷',
    'Gabon': '🇬🇦',
    'Gambia': '🇬🇲',
    'Georgia': '🇬🇪',
    'Germany': '🇩🇪',
    'Ghana': '🇬🇭',
    'Greece': '🇬🇷',
    'Grenada': '🇬🇩',
    'Guatemala': '🇬🇹',
    'Guinea': '🇬🇳',
    'Guinea-Bissau': '🇬🇼',
    'Guyana': '🇬🇾',
    'Haiti': '🇭🇹',
    'Holy See': '🇻🇦',
    'Honduras': '🇭🇳',
    'Hungary': '🇭🇺',
    'Iceland': '🇮🇸',
    'India': '🇮🇳',
    'Indonesia': '🇮🇩',
    'Iran': '🇮🇷',
    'Iraq': '🇮🇶',
    'Ireland': '🇮🇪',
    'Israel': '🇮🇱',
    'Italy': '🇮🇹',
    'Jamaica': '🇯🇲',
    'Japan': '🇯🇵',
    'Jordan': '🇯🇴',
    'Kazakhstan': '🇰🇿',
    'Kenya': '🇰🇪',
    'Kiribati': '🇰🇮',
    'Kuwait': '🇰🇼',
    'Kyrgyzstan': '🇰🇬',
    'Laos': '🇱🇦',
    'Latvia': '🇱🇻',
    'Lebanon': '🇱🇧',
    'Lesotho': '🇱🇸',
    'Liberia': '🇱🇷',
    'Libya': '🇱🇾',
    'Liechtenstein': '🇱🇮',
    'Lithuania': '🇱🇹',
    'Luxembourg': '🇱🇺',
    'Madagascar': '🇲🇬',
    'Malawi': '🇲🇼',
    'Malaysia': '🇲🇾',
    'Maldives': '🇲🇻',
    'Mali': '🇲🇱',
    'Malta': '🇲🇹',
    'Marshall Islands': '🇲🇭',
    'Mauritania': '🇲🇷',
    'Mauritius': '🇲🇺',
    'Mexico': '🇲🇽',
    'Micronesia': '🇫🇲',
    'Moldova': '🇲🇩',
    'Monaco': '🇲🇨',
    'Mongolia': '🇲🇳',
    'Montenegro': '🇲🇪',
    'Morocco': '🇲🇦',
    'Mozambique': '🇲🇿',
    'Myanmar (formerly Burma)': '🇲🇲',
    'Namibia': '🇳🇦',
    'Nauru': '🇳🇷',
    'Nepal': '🇳🇵',
    'Netherlands': '🇳🇱',
    'New Zealand': '🇳🇿',
    'Nicaragua': '🇳🇮',
    'Niger': '🇳🇪',
    'Nigeria': '🇳🇬',
    'North Korea': '🇰🇵',
    'North Macedonia': '🇲🇰',
    'Norway': '🇳🇴',
    'Oman': '🇴🇲',
    'Pakistan': '🇵🇰',
    'Palau': '🇵🇼',
    'Palestine State': '🇵🇸',
    'Panama': '🇵🇦',
    'Papua New Guinea': '🇵🇬',
    'Paraguay': '🇵🇾',
    'Peru': '🇵🇪',
    'Philippines': '🇵🇭',
    'Poland': '🇵🇱',
    'Portugal': '🇵🇹',
    'Qatar': '🇶🇦',
    'Romania': '🇷🇴',
    'Russia': '🇷🇺',
    'Rwanda': '🇷🇼',
    'Saint Kitts and Nevis': '🇰🇳',
    'Saint Lucia': '🇱🇨',
    'Saint Vincent and the Grenadines': '🇻🇨',
    'Samoa': '🇼🇸',
    'San Marino': '🇸🇲',
    'Sao Tome and Principe': '🇸🇹',
    'Saudi Arabia': '🇸🇦',
    'Senegal': '🇸🇳',
    'Serbia': '🇷🇸',
    'Seychelles': '🇸🇨',
    'Sierra Leone': '🇸🇱',
    'Singapore': '🇸🇬',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'Solomon Islands': '🇸🇧',
    'Somalia': '🇸🇴',
    'South Africa': '🇿🇦',
    'South Korea': '🇰🇷',
    'South Sudan': '🇸🇸',
    'Spain': '🇪🇸',
    'Sri Lanka': '🇱🇰',
    'Sudan': '🇸🇩',
    'Suriname': '🇸🇷',
    'Sweden': '🇸🇪',
    'Switzerland': '🇨🇭',
    'Syria': '🇸🇾',
    'Tajikistan': '🇹🇯',
    'Tanzania': '🇹🇿',
    'Thailand': '🇹🇭',
    'Timor-Leste': '🇹🇱',
    'Togo': '🇹🇬',
    'Tonga': '🇹🇴',
    'Trinidad and Tobago': '🇹🇹',
    'Tunisia': '🇹🇳',
    'Turkey': '🇹🇷',
    'Turkmenistan': '🇹🇲',
    'Tuvalu': '🇹🇻',
    'Uganda': '🇺🇬',
    'Ukraine': '🇺🇦',
    'United Arab Emirates': '🇦🇪',
    'United Kingdom': '🇬🇧',
    'United States of America': '🇺🇸',
    'Uruguay': '🇺🇾',
    'Uzbekistan': '🇺🇿',
    'Vanuatu': '🇻🇺',
    'Venezuela': '🇻🇪',
    'Vietnam': '🇻🇳',
    'Yemen': '🇾🇪',
    'Zambia': '🇿🇲',
    'Zimbabwe': '🇿🇼'
  };

  // Try to find an exact match first
  if (flagMap[countryName]) {
    return flagMap[countryName];
  }

  // Try to find a partial match (for cases where the name might be slightly different)
  const lowerCountryName = countryName.toLowerCase();
  for (const [key, flag] of Object.entries(flagMap)) {
    if (key.toLowerCase().includes(lowerCountryName) || lowerCountryName.includes(key.toLowerCase())) {
      return flag;
    }
  }

  // Return default globe emoji if no match found
  return '🌐';
};

// Type definitions
type Website = {
  id: string;
  ownerId: string;
  userId?: string;
  userEmail?: string;
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
  category?: string | string[]; // Updated to accept both string and array
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
  // New fields
  trafficValue?: number;
  locationTraffic?: number;
  greyNicheAccepted?: boolean;
  specialNotes?: string;
  primaryCountry?: string;
  primeTrafficCountries?: string[]; // Add prime traffic countries field
};

type FilterType = "all" | "pending" | "approved" | "rejected";

type SuperAdminWebsitesSectionProps = {
  websites: Website[];
  loading: {
    websites: boolean;
    purchases: boolean;
  };
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  selectedWebsites: string[];
  isAllWebsitesSelected: boolean;
  toggleSelectAllWebsites: () => void;
  toggleWebsiteSelection: (id: string) => void;
  approveSelectedWebsites: () => void;
  updateWebsiteStatus: (id: string, status: "approved" | "rejected", reason?: string, extraPriceCents?: number) => void;
  openRejectModal: (website: Website) => void;
  refresh: () => void;
};

const SuperAdminWebsitesSection: React.FC<SuperAdminWebsitesSectionProps> = ({
  websites,
  loading,
  filter,
  setFilter,
  stats,
  selectedWebsites,
  isAllWebsitesSelected,
  toggleSelectAllWebsites,
  toggleWebsiteSelection,
  approveSelectedWebsites,
  updateWebsiteStatus,
  openRejectModal,
  refresh
}) => {
  const [extraPrices, setExtraPrices] = useState<Record<string, string>>({});
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  // State for country flags
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});
  const [loadingFlags, setLoadingFlags] = useState(false);
  const [failedFlags, setFailedFlags] = useState<Record<string, boolean>>({});
  // State to hold website pending approve-confirmation when no extra price was entered
  const [confirmApproveWebsite, setConfirmApproveWebsite] = useState<{ id: string; title?: string } | null>(null);

  // Load country flags from REST Countries API
  useEffect(() => {
    const loadCountryFlags = async () => {
      // Only load if we have websites with primeTrafficCountries
      const hasCountries = websites.some(w => w.primeTrafficCountries && w.primeTrafficCountries.length > 0);
      if (!hasCountries || Object.keys(countryFlags).length > 0) return;

      setLoadingFlags(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await response.json();
        const flags: Record<string, string> = {};
        data.forEach((country: any) => {
          if (country.name?.common && (country.flags?.svg || country.flags?.png)) {
            flags[country.name.common] = country.flags.svg || country.flags.png;
          }
        });
        setCountryFlags(flags);
      } catch (error) {
        console.error('Error loading country flags:', error);
      } finally {
        setLoadingFlags(false);
      }
    };

    loadCountryFlags();
  }, [websites]);

  // Function to handle email copy with notification
  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      // Reset the notification after 2 seconds
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy email: ', err);
    }
  };

  // Get status badge component
  const getStatusBadge = (status: Website["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "priceConflict":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Conflict
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative overflow-hidden">
      <div className="relative z-10">
        {/* Confirm approve modal (shown when admin attempts to approve without extra price) */}
        {confirmApproveWebsite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Confirm Approval</h3>
              <p className="text-sm text-gray-600 mb-4">
                You didn't add any extra price. Are you sure you want to approve "{confirmApproveWebsite.title || 'this website'}" without adding an extra price?
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmApproveWebsite(null)} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Call approve with undefined extra price
                    updateWebsiteStatus(confirmApproveWebsite.id, "approved");
                    setConfirmApproveWebsite(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Website Moderation</h2>
          <button
            onClick={refresh}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-amber-100 p-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-amber-800">Pending</h3>
                <p className="text-xl font-bold text-amber-900">
                  {filter === 'pending' ? (websites || []).length : stats.pending}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-800">Approved</h3>
                <p className="text-xl font-bold text-green-900">
                  {filter === 'approved' ? (websites || []).length : stats.approved}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-red-100 p-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-800">Rejected</h3>
                <p className="text-xl font-bold text-red-900">
                  {filter === 'rejected' ? (websites || []).length : stats.rejected}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-800">Total</h3>
                <p className="text-xl font-bold text-blue-900">
                  {filter === 'all' ? (websites || []).length : stats.total}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{(websites || []).length} websites found</span>
          </div>
          <div className="flex items-center gap-3">
            {filter === "pending" && (websites || []).length > 0 && (selectedWebsites || []).length > 0 && (
              <button
                onClick={approveSelectedWebsites}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Selected ({(selectedWebsites || []).length})
              </button>
            )}
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Websites</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading.websites ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 text-sm">Loading websites...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {(websites || []).length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Websites Found</h3>
                <p className="text-gray-600">No websites found with status: {filter}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {filter === "pending" && (
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <input 
                            type="checkbox" 
                            checked={isAllWebsitesSelected}
                            onChange={toggleSelectAllWebsites}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                        </th>
                      )}
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Website
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SEO Metrics
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Traffic
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Countries
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(websites || []).map((website, idx) => {
                      return (
                        <tr key={website.id || idx} className="hover:bg-gray-50">
                          {filter === "pending" && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                checked={(selectedWebsites || []).includes(website.id)}
                                onChange={() => toggleWebsiteSelection(website.id)}
                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                              />
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {website.title || 'Untitled'}
                                  {website.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="ml-2 cursor-help">
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              className="h-4 w-4 text-gray-400 hover:text-gray-600" 
                                              fill="none" 
                                              viewBox="0 0 24 24" 
                                              stroke="currentColor"
                                            >
                                              <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                              />
                                            </svg>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <p>{website.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {website.url && (
                                    <a 
                                      href={website.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-500 hover:text-blue-700"
                                      title="Visit website"
                                    >
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-4 w-4" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                        />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                                <div className="flex items-center mt-1 space-x-1">
                                  {website.category && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-help">
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              className="h-3 w-3 mr-1" 
                                              fill="none" 
                                              viewBox="0 0 24 24" 
                                              stroke="currentColor"
                                            >
                                              <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
                                              />
                                            </svg>
                                            Category
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{Array.isArray(website.category) ? website.category.join(', ') : website.category}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {website.greyNicheAccepted && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-3 w-3 mr-1" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M5 13l4 4L19 7" 
                                        />
                                      </svg>
                                      Grey Niche
                                    </span>
                                  )}
                                  {website.specialNotes && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 cursor-help">
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              className="h-3 w-3 mr-1" 
                                              fill="none" 
                                              viewBox="0 0 24 24" 
                                              stroke="currentColor"
                                            >
                                              <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                                              />
                                            </svg>
                                            Notes
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <p>{website.specialNotes}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getStatusBadge(website.status)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {website.priceCents ? `$${(website.priceCents / 100).toFixed(2)}` : 
                               website.price ? `$${website.price.toFixed(2)}` : '$0.00'}
                            </div>
                            {(() => {
                              const orig = (website as any).originalPriceCents;
                              const adminExtra = (website as any).adminExtraPriceCents;
                              if (typeof adminExtra === 'number' && adminExtra !== 0) {
                                return (
                                  <div className="text-xs text-indigo-600">
                                    +${(adminExtra / 100).toFixed(2)} extra
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                DA: {website.DA || 0}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                DR: {website.DR || 0}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                PA: {website.PA || 0}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Spam: {website.Spam || 0}
                              </span>
                              {website.RD && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  RD: {website.RD}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {website.OrganicTraffic?.toLocaleString() || 0} visits
                            </div>
                            <div className="text-xs text-gray-500">
                              Traffic Value: ${website.trafficValue || 0}
                            </div>
                            {website.locationTraffic !== undefined && (
                              <div className="text-xs text-gray-500">
                                Primary Location Traffic: {website.locationTraffic}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {website.primeTrafficCountries && website.primeTrafficCountries.length > 0 ? (
                              <div className="flex items-center">
                                <div className="flex -space-x-2">
                                  {website.primeTrafficCountries.slice(0, 3).map((country, index) => {
                                    const flagUrl = countryFlags[country];
                                    const hasFailed = failedFlags[country];
                                    
                                    return (
                                      <div key={index} className="relative">
                                        {flagUrl && !hasFailed ? (
                                          <img 
                                            src={flagUrl} 
                                            alt={country} 
                                            className="w-6 h-4 rounded-sm object-cover border border-white"
                                            onError={() => {
                                              setFailedFlags(prev => ({ ...prev, [country]: true }));
                                            }}
                                          />
                                        ) : (
                                          <div className="w-6 h-4 rounded-sm bg-gray-100 flex items-center justify-center text-xs border border-white">
                                            <span className="text-xs">{getCountryFlagEmoji(country)}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {website.primeTrafficCountries.length > 3 && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    +{website.primeTrafficCountries.length - 3} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col gap-2">
                              {/* Extra Price Input for Pending Websites */}
                              {(website.status || 'pending') === 'pending' && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={extraPrices[website.id] || ''}
                                    onChange={(e) => setExtraPrices((prev) => ({ ...prev, [website.id]: e.target.value }))}
                                    placeholder="Extra $"
                                    className="w-24 text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    title="Optional extra price to add when approving (USD)"
                                  />
                                  <span className="text-xs text-gray-500">USD</span>
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2">
                                {(website.status || 'pending') === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        const raw = extraPrices[website.id] || '';
                                        const parsed = parseFloat(raw);
                                        const extraCents = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined;
                                        // If admin didn't add an extra price (or it's zero/invalid) ask for confirmation
                                        if (!extraCents) {
                                          setConfirmApproveWebsite({ id: website.id, title: website.title });
                                        } else {
                                          updateWebsiteStatus(website.id, "approved", undefined, extraCents);
                                        }
                                      }}
                                      className="text-green-600 hover:text-green-900"
                                      title="Approve website"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(website)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Reject website"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                                {(website.status || 'pending') === 'approved' && (
                                  <button
                                    onClick={() => openRejectModal(website)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Reject website"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                {(website.status || 'pending') === 'rejected' && (
                                  <button
                                    onClick={() => updateWebsiteStatus(website.id, "approved")}
                                    className="text-green-600 hover:text-green-900"
                                    title="Approve website"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SuperAdminWebsitesSection;
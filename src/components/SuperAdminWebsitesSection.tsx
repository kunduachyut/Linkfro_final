"use client";

import React, { useState, useEffect } from "react";

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

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-violet-600/5"></div>
      <div className="relative z-10">
        {/* Confirm approve modal (shown when admin attempts to approve without extra price) */}
        {confirmApproveWebsite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Confirm Approve</h3>
              <p className="text-sm text-gray-700 mb-4">You didn't add any extra price. Are you sure you want to approve "{confirmApproveWebsite.title || 'this website'}" without adding an extra price?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmApproveWebsite(null)} className="px-3 py-1 bg-gray-100 rounded">Cancel</button>
                <button
                  onClick={() => {
                    // Call approve with undefined extra price
                    updateWebsiteStatus(confirmApproveWebsite.id, "approved");
                    setConfirmApproveWebsite(null);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-gray-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
            Website Moderation
          </span>
        </h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-amber-500 p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-amber-800">Pending</h3>
                <p className="text-2xl font-bold text-amber-900">
                  {filter === 'pending' ? (websites || []).length : stats.pending}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-500 p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-800">Approved</h3>
                <p className="text-2xl font-bold text-green-900">
                  {filter === 'approved' ? (websites || []).length : stats.approved}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-red-500 p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-800">Rejected</h3>
                <p className="text-2xl font-bold text-red-900">
                  {filter === 'rejected' ? (websites || []).length : stats.rejected}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-500 p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-800">Total</h3>
                <p className="text-2xl font-bold text-blue-900">
                  {filter === 'all' ? (websites || []).length : stats.total}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-500">{(websites || []).length} websites found</span>
          </div>
          <div className="flex items-center gap-3">
            {filter === "pending" && (websites || []).length > 0 && (selectedWebsites || []).length > 0 && (
              <button
                onClick={approveSelectedWebsites}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm flex items-center shadow-sm"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Selected ({(selectedWebsites || []).length})
              </button>
            )}
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {(websites || []).length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Websites Found</h3>
                <p className="text-gray-600">No websites found with status: {filter}</p>
              </div>
            ) : (
              <div>
                {/* Table Header */}
                <div className="grid grid-cols-16 gap-0.5 px-1 py-1.5 bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="col-span-1 flex justify-center items-center">
                    {filter === "pending" && (
                      <input 
                        type="checkbox" 
                        checked={isAllWebsitesSelected}
                        onChange={toggleSelectAllWebsites}
                        className="h-3.5 w-3.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center truncate text-sm">Website</div>
                  <div className="col-span-1 flex justify-center text-sm">Price</div>
                  <div className="col-span-1 flex justify-center text-sm">Publisher Price</div>
                  <div className="col-span-1 flex justify-center text-sm">Extra Price</div>
                  <div className="col-span-1 flex justify-center text-xs">DA</div>
                  <div className="col-span-1 flex justify-center text-xs">DR</div>
                  <div className="col-span-1 flex justify-center text-xs">PA</div>
                  <div className="col-span-1 flex justify-center text-xs">Traffic</div>
                  <div className="col-span-1 flex justify-center text-xs">Spam</div>
                  <div className="col-span-1 flex justify-center text-xs">Value</div>
                  <div className="col-span-1 flex justify-center text-xs">Location</div>
                  <div className="col-span-1 flex justify-center text-xs">Niche</div>
                  <div className="col-span-1 flex justify-center text-sm">Countries</div>
                  <div className="col-span-1 flex justify-center text-sm">Details</div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {(websites || []).map((website, idx) => {
                    return (
                      <div key={website.id || idx} className="grid grid-cols-16 gap-0.5 px-1 py-1.5 hover:bg-gray-50 transition-colors items-center">
                        {/* Checkbox */}
                        <div className="col-span-1 flex justify-center">
                          {(website.status || 'pending') === 'pending' && (
                            <input 
                              type="checkbox" 
                              checked={(selectedWebsites || []).includes(website.id)}
                              onChange={() => toggleWebsiteSelection(website.id)}
                              className="h-3.5 w-3.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                            />
                          )}
                        </div>
                        
                        {/* Website Info */}
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <div className="text-gray-900 truncate max-w-[120px] text-base">{website.title || 'Untitled'}</div>
                            {/* Description Icon */}
                            {website.description && (
                              <div className="relative group ml-1">
                                <div className="text-gray-400 hover:text-gray-600 cursor-help">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 max-w-xs shadow-lg">
                                  <div className="max-h-20 overflow-y-auto">
                                    {website.description}
                                  </div>
                                </div>
                              </div>
                            )}
                            {website.url && (
                              <a
                                href={website.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-gray-500 hover:text-indigo-600"
                                title="Visit website"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                            {/* Category Icon next to website name */}
                            {website.category && (
                              <div className="ml-1 relative group">
                                <div 
                                  className="text-gray-500 hover:text-indigo-600 cursor-pointer"
                                  title={Array.isArray(website.category) ? website.category.join(', ') : website.category || ''}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            {/* Status Indicator Icons */}
                            <div className="ml-1 flex space-x-1">
                              {website.status === 'pending' && (
                                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold" title="Pending">
                                  P
                                </div>
                              )}
                              {website.status === 'approved' && (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold" title="Approved">
                                  A
                                </div>
                              )}
                              {website.status === 'rejected' && (
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold" title="Rejected">
                                  R
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Status and Action buttons */}
                          <div className="mt-1.5 flex items-center">
                            <div className="ml-2 flex space-x-1">
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
                                    className="flex items-center justify-center px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-xs hover:bg-green-200 transition-colors font-medium shadow-sm"
                                    title="Approve website"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                  </button>
                                  <div className="ml-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={extraPrices[website.id] || ''}
                                      onChange={(e) => setExtraPrices((prev) => ({ ...prev, [website.id]: e.target.value }))}
                                      placeholder="Extra $"
                                      className="w-20 text-xs px-2 py-1 border rounded"
                                      title="Optional extra price to add when approving (USD)"
                                    />
                                  </div>
                                  <button
                                    onClick={() => openRejectModal(website)}
                                    className="flex items-center justify-center px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs hover:bg-red-200 transition-colors font-medium shadow-sm"
                                    title="Reject website"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                  </button>
                                </>
                              )}
                              {(website.status || 'pending') === 'approved' && (
                                <button
                                  onClick={() => openRejectModal(website)}
                                  className="flex items-center justify-center px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs hover:bg-red-200 transition-colors font-medium shadow-sm"
                                  title="Reject website"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reject
                                </button>
                              )}
                              {(website.status || 'pending') === 'rejected' && (
                                <button
                                  onClick={() => updateWebsiteStatus(website.id, "approved")}
                                  className="flex items-center justify-center px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-xs hover:bg-green-200 transition-colors font-medium shadow-sm"
                                  title="Approve website"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="col-span-1 flex justify-center">
                          <div className="font-semibold text-green-700 text-base">
                            {website.priceCents ? `$${(website.priceCents / 100).toFixed(2)}` : 
                             website.price ? `$${website.price.toFixed(2)}` : '$0.00'}
                          </div>
                        </div>

                        {/* Publisher Price (originalPriceCents or derived) */}
                        <div className="col-span-1 flex justify-center">
                          <div className="text-sm font-semibold text-gray-800">
                            {(() => {
                              const orig = (website as any).originalPriceCents;
                              const adminExtra = (website as any).adminExtraPriceCents;
                              if (typeof orig === 'number') return `$${(orig / 100).toFixed(2)}`;
                              if (typeof website.priceCents === 'number' && typeof adminExtra === 'number') {
                                const derived = website.priceCents - adminExtra;
                                return `$${(derived / 100).toFixed(2)}`;
                              }
                              if (website.price) return `$${website.price.toFixed(2)}`;
                              return '$0.00';
                            })()}
                          </div>
                        </div>

                        {/* Extra Price (adminExtraPriceCents or derived) */}
                        <div className="col-span-1 flex justify-center">
                          <div className="text-sm font-semibold text-indigo-700">
                            {(() => {
                              const adminExtra = (website as any).adminExtraPriceCents;
                              const orig = (website as any).originalPriceCents;
                              if (typeof adminExtra === 'number' && adminExtra !== 0) return `$${(adminExtra / 100).toFixed(2)}`;
                              if (typeof website.priceCents === 'number' && typeof orig === 'number') {
                                const derived = website.priceCents - orig;
                                if (derived && derived !== 0) return `$${(derived / 100).toFixed(2)}`;
                              }
                              return '-';
                            })()}
                          </div>
                        </div>
                        
                        {/* DA */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-blue-100 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-blue-800">{website.DA || 0}</div>
                          </div>
                        </div>
                        
                        {/* DR */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-green-100 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-green-800">{website.DR || 0}</div>
                          </div>
                        </div>
                        
                        {/* PA */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-purple-100 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-purple-800">{website.PA || 0}</div>
                          </div>
                        </div>
                        
                        {/* Organic Traffic */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-orange-100 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-orange-800">{website.OrganicTraffic || 0}</div>
                          </div>
                        </div>
                        
                        {/* Spam */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-red-100 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-red-800">{website.Spam || 0}</div>
                          </div>
                        </div>
                        
                        {/* Traffic Value */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-teal-100 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-teal-800">{website.trafficValue || 0}</div>
                          </div>
                        </div>
                        
                        {/* Location Traffic */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-cyan-100 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-cyan-800">{website.locationTraffic || 0}</div>
                          </div>
                        </div>
                        
                        {/* Grey Niche */}
                        <div className="col-span-1 flex justify-center">
                          <div className="bg-gray-200 rounded px-1 py-0.5 text-center min-w-[28px]">
                            <div className="text-xs font-semibold text-gray-800">{website.greyNicheAccepted ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                        
                        {/* Prime Traffic Countries */}
                        <div className="col-span-1 flex justify-center">
                          <div className="flex items-center">
                            {website.primeTrafficCountries && website.primeTrafficCountries.length > 0 ? (
                              <div className="flex items-center space-x-1">
                                {/* First country flag */}
                                {(() => {
                                  const firstCountry = website.primeTrafficCountries[0];
                                  const flagUrl = countryFlags[firstCountry];
                                  const hasFailed = failedFlags[firstCountry];
                                  
                                  return (
                                    <div className="relative group">
                                      {flagUrl && !hasFailed ? (
                                        <img 
                                          src={flagUrl} 
                                          alt={firstCountry} 
                                          className="w-6 h-4 rounded-sm object-cover cursor-help shadow-sm"
                                          onError={() => {
                                            setFailedFlags(prev => ({ ...prev, [firstCountry]: true }));
                                          }}
                                        />
                                      ) : (
                                        <div className="w-6 h-4 rounded-sm bg-gray-100 flex items-center justify-center text-xs cursor-help overflow-hidden shadow-sm">
                                          <span className="text-xs">{getCountryFlagEmoji(firstCountry)}</span>
                                        </div>
                                      )}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg">
                                        {firstCountry}
                                      </div>
                                    </div>
                                  );
                                })()}
                                
                                {/* Additional countries count */}
                                {website.primeTrafficCountries.length > 1 && (
                                  <div className="relative group">
                                    <div className="w-6 h-4 rounded-sm bg-gray-200 flex items-center justify-center text-xs cursor-help shadow-sm">
                                      +{website.primeTrafficCountries.length - 1}
                                    </div>
                                    {/* Tooltip showing all countries on hover */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg">
                                      {website.primeTrafficCountries.slice(1).join(', ')}
                                    </div>
                                    
                                    {/* Expanded view of all flags on hover */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:flex flex-wrap gap-1 bg-white p-2 rounded-md shadow-lg border border-gray-200 z-10 w-36">
                                      {website.primeTrafficCountries.slice(1).map((country, index) => {
                                        const flagUrl = countryFlags[country];
                                        const hasFailed = failedFlags[country];
                                        
                                        return (
                                          <div key={index} className="relative">
                                            {flagUrl && !hasFailed ? (
                                              <img 
                                                src={flagUrl} 
                                                alt={country} 
                                                className="w-6 h-4 rounded-sm object-cover shadow-sm"
                                              />
                                            ) : (
                                              <div className="w-6 h-4 rounded-sm bg-gray-100 flex items-center justify-center text-xs overflow-hidden shadow-sm">
                                                <span className="text-xs">{getCountryFlagEmoji(country)}</span>
                                              </div>
                                            )}
                                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                                              {country}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Notes & Owner */}
                        <div className="col-span-1 flex justify-center">
                          <div className="flex items-center space-x-2">
                            {/* Special Notes */}
                            <div className="flex items-center">
                              {website.specialNotes ? (
                                <div className="relative group">
                                  <div 
                                    className="text-gray-500 hover:text-indigo-600 cursor-pointer"
                                    title={website.specialNotes || ''}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">-</span>
                              )}
                            </div>
                            
                            {/* Owner */}
                            <div className="flex items-center">
                              {website.userEmail || website.ownerId ? (
                                <div className="relative">
                                  <button
                                    onClick={() => handleCopyEmail(website.userEmail || website.ownerId || '')}
                                    className="text-gray-500 hover:text-indigo-600 focus:outline-none"
                                    title={`Copy email: ${website.userEmail || website.ownerId || 'N/A'}`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                  {copiedEmail === (website.userEmail || website.ownerId || '') && (
                                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                                      Email copied!
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SuperAdminWebsitesSection;
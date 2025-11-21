import { useState } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { MinimalToggle } from "./ui/toggle";
import useCountries from "../hooks/useCountries";
import { CATEGORIES } from "../lib/categories";

// Add the getCountryFlagEmoji function directly since we can't import it properly
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
    'United States': '🇺🇸',
    'Uruguay': '🇺🇾',
    'Uzbekistan': '🇺🇿',
    'Vanuatu': '🇻🇺',
    'Venezuela': '🇻🇪',
    'Vietnam': '🇻🇳',
    'Yemen': '🇾🇪',
    'Zambia': '🇿🇲',
    'Zimbabwe': '🇿🇼'
  };

  return flagMap[countryName] || '🌐';
};

type Website = {
  _id: string;
  title: string;
  url: string;
  description: string;
  priceCents: number;
  // If a publisher has proposed an updated price (pending approval)
  publisherUpdatedPriceCents?: number | null;
  // The previous publisher-visible price (optional)
  publisherPreviousPriceCents?: number | null;
  status: "pending" | "approved" | "rejected";
  available: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  views?: number;
  clicks?: number;
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: string;
  category?: string;
  tags?: string;
  primaryCountry?: string;
  trafficValue?: number;
  locationTraffic?: number;
  greyNicheAccepted?: boolean;
  specialNotes?: string;
  primeTrafficCountries?: string[]; // Add this missing property
};

export default function PublisherWebsitesSection({ 
  mySites,
  refresh,
  statusFilter,
  setStatusFilter,
  editWebsite,
  removeSite,
  deleteLoading,
  getStatusBadge,
  formatPrice
}: {
  mySites: Website[];
  refresh: () => void;
  statusFilter: "all" | "pending" | "approved" | "rejected";
  setStatusFilter: (filter: "all" | "pending" | "approved" | "rejected") => void;
  editWebsite: (website: Website) => void;
  removeSite: (id: string) => void;
  deleteLoading: string | null;
  getStatusBadge: (status: string, rejectionReason?: string) => React.ReactElement;
  formatPrice: (cents?: number) => string;
}) {
  // Function to toggle website availability
  const toggleAvailability = async (websiteId: string, currentAvailability: boolean) => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          available: !currentAvailability
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      // Refresh the websites list
      refresh();
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  // State for search and additional filters
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minDA, setMinDA] = useState<string>("");
  const [maxDA, setMaxDA] = useState<string>("");
  // Additional filters to match MarketplaceSection
  const [minDR, setMinDR] = useState<string>("");
  const [maxDR, setMaxDR] = useState<string>("");
  const [minOrganicTraffic, setMinOrganicTraffic] = useState<string>("");
  const [maxOrganicTraffic, setMaxOrganicTraffic] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [minTrafficValue, setMinTrafficValue] = useState<string>("");
  const [maxTrafficValue, setMaxTrafficValue] = useState<string>("");
  const [greyNicheFilter, setGreyNicheFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [hoveredWebsite, setHoveredWebsite] = useState<string | null>(null);

  // Get unique categories from websites
  const uniqueCategories = Array.from(
    new Set(mySites.flatMap(site => 
      site.category ? (Array.isArray(site.category) ? site.category : [site.category]) : []
    ))
  ).filter(Boolean) as string[];

  // Use canonical category list from shared CATEGORIES so filters show all options
  const allCategories = CATEGORIES.map(c => String(c.name)).filter(Boolean) as string[];

  // Use countries hook (cached) — Marketplace uses this to populate country lists
  const { countries: allCountries, loading: loadingCountries } = useCountries();

  // Unique primary countries from publisher sites (fallback list)
  const uniqueCountries = Array.from(
    new Set(mySites.map(w => w.primaryCountry).filter(Boolean))
  ).filter(Boolean) as string[];

  // Country options: if a category is selected, derive countries from DB for websites in that category
  const countryOptions = (() => {
    if (countryFilter && countryFilter !== '') {
      // if user already selected a country, keep it as the only option
      return [countryFilter];
    }
    if (categoryFilter && categoryFilter !== 'all') {
      const set = new Set<string>();
      const selectedParts = String(categoryFilter).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const matchesCategory = (websiteCategories: any[]) => {
        const wc = websiteCategories.map((c: any) => String(c).trim().toLowerCase());
        return wc.some(wcItem => selectedParts.some(sp => wcItem === sp || wcItem.includes(sp) || sp.includes(wcItem)));
      };

      mySites.forEach(w => {
        const websiteCategories = Array.isArray(w.category) ? w.category : w.category ? [w.category] : [];
        if (!matchesCategory(websiteCategories)) return;

        if (w.primaryCountry) set.add(String(w.primaryCountry));

        const rawPrimes: any = (w as any).primeTrafficCountries;
        if (Array.isArray(rawPrimes)) rawPrimes.forEach((c: string) => c && set.add(String(c)));
        else if (typeof rawPrimes === 'string' && rawPrimes.trim() !== '') rawPrimes.split(',').map((s: string) => s.trim()).filter(Boolean).forEach((c: string) => set.add(String(c)));
      });

      return Array.from(set).filter(Boolean) as string[];
    }

    return uniqueCountries;
  })();

  // Helper to compute the publisher-visible price:
  // Prefer explicit originalPriceCents when set. If missing but adminExtraPriceCents exists,
  // derive original price as priceCents - adminExtraPriceCents. Fallback to priceCents.
  const computePublisherVisiblePrice = (s: any) => {
    // If publisher has proposed an updated price, show it (pending)
    if (s && typeof s.publisherUpdatedPriceCents === 'number' && s.publisherUpdatedPriceCents != null) return s.publisherUpdatedPriceCents;
    if (s && typeof s.originalPriceCents === 'number' && s.originalPriceCents != null) return s.originalPriceCents;
    const extra = (s && typeof s.adminExtraPriceCents === 'number') ? s.adminExtraPriceCents : 0;
    if (extra > 0 && s && typeof s.priceCents === 'number') {
      const derived = s.priceCents - extra;
      return derived >= 0 ? derived : s.priceCents;
    }
    return s && typeof s.priceCents === 'number' ? s.priceCents : 0;
  };

  // Prepare website object for the edit form: ensure the form shows the publisher-original price
  const prepareWebsiteForForm = (site: any) => {
    if (!site) return site;
    // Prefer explicit originalPriceCents when available, otherwise derive via computePublisherVisiblePrice
    const visibleCents = (typeof site.originalPriceCents === 'number' && site.originalPriceCents != null)
      ? site.originalPriceCents
      : computePublisherVisiblePrice(site);

    return {
      ...site,
      // set form fields to show only the publisher-visible/original price
      priceCents: visibleCents,
      price: visibleCents / 100,
      originalPriceCents: visibleCents,
      // When opening the edit form for the publisher, clear any admin-applied extra
      // so the publisher only sees their own listed price. Admin can re-apply extras later.
      adminExtraPriceCents: 0,
    };
  };

  // Apply all filters
  const filteredSites = mySites.filter(site => {
    // Status filter (existing)
    if (statusFilter !== "all" && site.status !== statusFilter) return false;
    
    // Search filter - now works from 1st character
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        site.title.toLowerCase().includes(query) ||
        site.url.toLowerCase().includes(query) ||
        site.description.toLowerCase().includes(query) ||
        (site.category && (Array.isArray(site.category) 
          ? site.category.some(cat => cat.toLowerCase().includes(query))
          : site.category.toLowerCase().includes(query)));
      if (!matchesSearch) return false;
    }
    
    // Availability filter
    if (availabilityFilter !== "all") {
      const isAvailable = site.available ?? true;
      if (availabilityFilter === "available" && !isAvailable) return false;
      if (availabilityFilter === "unavailable" && isAvailable) return false;
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      const siteCategories = site.category 
        ? (Array.isArray(site.category) ? site.category : [site.category]) 
        : [];
      if (!siteCategories.includes(categoryFilter)) return false;
    }
    
    // Price filters - use the publisher-visible price so publisher sees their listed price
    const priceToUse = computePublisherVisiblePrice(site as any);
    if (minPrice && priceToUse < parseFloat(minPrice) * 100) return false;
    if (maxPrice && priceToUse > parseFloat(maxPrice) * 100) return false;

    // DA filters
    if (minDA && (site.DA ?? 0) < parseInt(minDA)) return false;
    if (maxDA && (site.DA ?? 0) > parseInt(maxDA)) return false;

    // DR filters
    if (minDR && (site.DR ?? 0) < parseInt(minDR)) return false;
    if (maxDR && (site.DR ?? 0) > parseInt(maxDR)) return false;

    // Organic traffic filters
    if (minOrganicTraffic && (site.OrganicTraffic ?? 0) < parseInt(minOrganicTraffic)) return false;
    if (maxOrganicTraffic && (site.OrganicTraffic ?? 0) > parseInt(maxOrganicTraffic)) return false;

    // Traffic value filters
    if (minTrafficValue && (site.trafficValue ?? 0) < parseInt(minTrafficValue)) return false;
    if (maxTrafficValue && (site.trafficValue ?? 0) > parseInt(maxTrafficValue)) return false;

    // Country filter: match against primeTrafficCountries (DB field) or primaryCountry
    if (countryFilter) {
      const selected = countryFilter.toLowerCase();
      // Normalize primeTrafficCountries into array
      let primes: string[] = [];
      const rawPrimes: any = (site as any).primeTrafficCountries;
      if (Array.isArray(rawPrimes)) primes = rawPrimes as string[];
      else if (typeof rawPrimes === 'string' && rawPrimes.trim() !== '') primes = rawPrimes.split(',').map((s: string) => s.trim()).filter(Boolean);

      // Also include primaryCountry for matching
      if (site.primaryCountry) primes.push(String(site.primaryCountry));

      if (primes.length === 0) return false;

      const matched = primes.some(pc => {
        const p = (pc || '').toLowerCase();
        return p.includes(selected) || selected.includes(p);
      });

      if (!matched) return false;
    }

    // Grey niche filter
    if (greyNicheFilter !== '') {
      const filterValue = greyNicheFilter === 'true';
      if (site.greyNicheAccepted !== filterValue) return false;
    }
    
    // Date filters
    if (startDate || endDate) {
      // Get the date to compare (prefer createdAt, fallback to approvedAt)
      const siteDate = site.createdAt ? new Date(site.createdAt) : 
                      site.approvedAt ? new Date(site.approvedAt) : null;
      
      if (siteDate) {
        // Set time to start of day for startDate
        if (startDate && siteDate < new Date(new Date(startDate).setHours(0, 0, 0, 0))) {
          return false;
        }
        
        // Set time to end of day for endDate
        if (endDate && siteDate > new Date(new Date(endDate).setHours(23, 59, 59, 999))) {
          return false;
        }
      } else if (startDate || endDate) {
        // If we have date filters but no site date, exclude this site
        return false;
      }
    }
    
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setAvailabilityFilter("all");
    setCategoryFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setMinDA("");
    setMaxDA("");
    setMinDR("");
    setMaxDR("");
    setMinOrganicTraffic("");
    setMaxOrganicTraffic("");
    setCountryFilter("");
    setMinTrafficValue("");
    setMaxTrafficValue("");
    setGreyNicheFilter("");
    setStartDate("");
    setEndDate("");
  };

  const openWebsiteModal = (website: Website) => {
    setSelectedWebsite(website);
  };

  const closeWebsiteModal = () => {
    setSelectedWebsite(null);
  };

  const getStatusBadgeNew = (status: Website["status"], rejectionReason?: string) => {
    switch (status) {
      case "approved":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm font-medium">Approved</span>
          </div>
        );
      case "pending":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-yellow-400 text-sm font-medium">Pending</span>
          </div>
        );
      case "rejected":
        return (
          <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-400 mr-1" />
            <span className="text-red-400 text-sm font-medium">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="px-3 py-1.5 rounded-lg bg-gray-500/10 border border-gray-500/30 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">Unknown</span>
          </div>
        );
    }
  };

  const formatPriceNew = (cents?: number) => {
    if (cents === undefined) return "$0.00";
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      {/* Search and Filter Controls */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">My Websites</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-sm font-medium text-gray-700">{mySites.length} websites</span>
              {filteredSites.length !== mySites.length && (
                <span className="text-sm text-gray-500 ml-2">({filteredSites.length} filtered)</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search websites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-base">search</span>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors relative"
              title="Filters"
            >
              <span className="material-symbols-outlined">filter_list</span>
              {/* Filter indicator dot */}
              {(availabilityFilter !== "all" || categoryFilter !== "all" || minPrice || maxPrice || minDA || maxDA || startDate || endDate || minDR || maxDR || minOrganicTraffic || maxOrganicTraffic || countryFilter || minTrafficValue || maxTrafficValue || greyNicheFilter) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}
              className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-medium text-gray-900">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as "all" | "available" | "unavailable")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range ($)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* DA Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DA Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minDA}
                    onChange={(e) => setMinDA(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxDA}
                    onChange={(e) => setMaxDA(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {/* DR Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DR Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minDR}
                    onChange={(e) => setMinDR(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxDR}
                    onChange={(e) => setMaxDR(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Organic Traffic Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organic Traffic</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minOrganicTraffic}
                    onChange={(e) => setMinOrganicTraffic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxOrganicTraffic}
                    onChange={(e) => setMaxOrganicTraffic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Traffic Value Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Value</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minTrafficValue}
                    onChange={(e) => setMinTrafficValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxTrafficValue}
                    onChange={(e) => setMaxTrafficValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Countries</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Grey Niche Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grey Niche</label>
                <select
                  value={greyNicheFilter}
                  onChange={(e) => setGreyNicheFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t">
        <div className="grid grid-cols-11 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1">No.</div>
          <div className="col-span-4">Website</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">Created</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Available</div>
          <div className="col-span-1">Actions</div>
        </div>
        <div className="divide-y">
          {filteredSites.map((website, index) => (
            <motion.div
              key={website._id}
              className="grid grid-cols-11 gap-4 p-4 items-center hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => openWebsiteModal(website)}
              onHoverStart={() => setHoveredWebsite(website._id)}
              onHoverEnd={() => setHoveredWebsite(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="col-span-1">
                <span className="font-mono">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="col-span-4">
                <div className="font-medium">{website.title}</div>
                <div className="text-sm text-muted-foreground truncate">
                  <a 
                    href={website.title.startsWith('http') ? website.title : `http://${website.title}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Site
                  </a>
                </div>
              </div>
              <div className="col-span-1 font-medium">
                {formatPriceNew(computePublisherVisiblePrice(website))}
              </div>
              <div className="col-span-1 text-sm text-muted-foreground">
                {website.createdAt ? formatDate(website.createdAt) : 'Unknown'}
              </div>
              <div className="col-span-1">
                {getStatusBadgeNew(website.status, website.rejectionReason)}
              </div>
              <div className="col-span-2 flex items-center justify-center">
                {/* Show availability toggle only for approved websites */}
                {website.status === "approved" ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <MinimalToggle
                      checked={website.available}
                      onChange={(e) => {
                        toggleAvailability(website._id, website.available);
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    N/A
                  </div>
                )}
              </div>
              <div className="col-span-1 flex justify-end">
                {hoveredWebsite === website._id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editWebsite(prepareWebsiteForForm(website));
                      }}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      aria-label="Edit website"
                    >
                      <Edit className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSite(website._id);
                      }}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      aria-label="Delete website"
                      disabled={deleteLoading === website._id}
                    >
                      {deleteLoading === website._id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 text-foreground" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openWebsiteModal(website);
                    }}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="View details"
                  >
                    <Eye className="w-4 h-4 text-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredSites.length === 0 && (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-blue-600 text-3xl">web</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Websites Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {mySites.length === 0 
              ? "You haven't added any websites yet. Get started by adding your first website!" 
              : "No websites match your current filters. Try adjusting your search or filters."}
          </p>
          {mySites.length === 0 && (
            <button
              onClick={() => {
                const event = new CustomEvent('switchTab', { detail: 'add-website' });
                window.dispatchEvent(event);
              }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Website
            </button>
          )}
        </div>
      )}

      {/* Website Detail Modal */}
      <AnimatePresence>
        {selectedWebsite && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedWebsite.title}</h2>
                    <p className="text-muted-foreground">Website Details</p>
                  </div>
                  <button
                    onClick={closeWebsiteModal}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Website Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Order accepted e-mail</p>
                        <p className="font-mono text-blue-600 hover:underline cursor-pointer" onClick={() => window.open(selectedWebsite.url, '_blank')}>
                          {selectedWebsite.url}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p>{selectedWebsite.description || "No description provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">{formatPriceNew(computePublisherVisiblePrice(selectedWebsite))}</p>
                      </div>
                      {selectedWebsite.primeTrafficCountries && selectedWebsite.primeTrafficCountries.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Prime Traffic Countries</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedWebsite.primeTrafficCountries.map((country: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-muted rounded-full text-sm flex items-center gap-1">
                                <span>{getCountryFlagEmoji(country)}</span>
                                <span>{country}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Status & Dates</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="mt-1">
                          {getStatusBadgeNew(selectedWebsite.status, selectedWebsite.rejectionReason)}
                        </div>
                        {selectedWebsite.rejectionReason && (
                          <p className="text-sm text-red-500 mt-1">Reason: {selectedWebsite.rejectionReason}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p>{formatDate(selectedWebsite.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p>{formatDate(selectedWebsite.updatedAt)}</p>
                      </div>
                      {selectedWebsite.approvedAt && (
                        <div>
                          <p className="text-sm text-muted-foreground">Approved</p>
                          <p>{formatDate(selectedWebsite.approvedAt)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Availability</p>
                        {selectedWebsite.status === "approved" ? (
                          <div className="flex items-center gap-2">
                            {/* Prevent click event from bubbling up to parent */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <MinimalToggle
                                checked={selectedWebsite.available}
                                onChange={(e) => {
                                  toggleAvailability(selectedWebsite._id, selectedWebsite.available);
                                }}
                              />
                            </div>
                            <span>{selectedWebsite.available ? "Available" : "Not Available"}</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            Only available for approved websites
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-4">SEO Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Domain Authority</p>
                        <p className="text-lg font-bold">{selectedWebsite.DA || "N/A"}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Page Authority</p>
                        <p className="text-lg font-bold">{selectedWebsite.PA || "N/A"}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Organic Traffic</p>
                        <p className="text-lg font-bold">{selectedWebsite.OrganicTraffic || "N/A"}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Spam Score</p>
                        <p className="text-lg font-bold">{selectedWebsite.Spam || "N/A"}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Domain Rating</p>
                        <p className="text-lg font-bold">{selectedWebsite.DR || "N/A"}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Referring Domains</p>
                        <p className="text-lg font-bold">{selectedWebsite.RD || "N/A"}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Traffic Value</p>
                        <p className="text-lg font-bold">{selectedWebsite.trafficValue || "N/A"}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Location Traffic</p>
                        <p className="text-lg font-bold">{selectedWebsite.locationTraffic || "N/A"}</p>
                      </div>
                    </div>
                    {(selectedWebsite.greyNicheAccepted !== undefined || selectedWebsite.specialNotes) && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Additional Information</h4>
                        {selectedWebsite.greyNicheAccepted !== undefined && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Grey Niche Accepted: </span>
                            <span className={selectedWebsite.greyNicheAccepted ? "text-green-600" : "text-red-600"}>
                              {selectedWebsite.greyNicheAccepted ? "Yes" : "No"}
                            </span>
                          </p>
                        )}
                        {selectedWebsite.specialNotes && (
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">Special Notes: </span>
                            <span>{selectedWebsite.specialNotes}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2 flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={closeWebsiteModal}
                      className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Guard against missing selection and ensure we pass a prepared website
                        if (!selectedWebsite) {
                          console.warn('Edit clicked but no website selected');
                          return;
                        }
                        try {
                          editWebsite(prepareWebsiteForForm(selectedWebsite));
                        } catch (err) {
                          console.error('Failed to open edit for website', err);
                          return;
                        }
                        closeWebsiteModal();
                      }}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { useCart } from "../app/context/CartContext";
import useCountries from "../hooks/useCountries";
import { CATEGORIES } from "../lib/categories";

// Country flag mapping function
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

// Function to get flag emoji for any country name
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
  primeTrafficCountries?: string[];
  trafficValue?: number;
  locationTraffic?: number;
  greyNicheAccepted?: boolean;
  specialNotes?: string;
};

// Define column configuration
interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  span: number;
}

export default function MarketplaceSection({ 
  websites, 
  loading, 
  error, 
  refreshWebsites,
  selectedItems,
  setSelectedItems,
  selectAll,
  setSelectAll,
  searchQuery,
  setSearchQuery,
  paidSiteIds
}: {
  websites: Website[];
  loading: boolean;
  error: string;
  refreshWebsites: () => void;
  selectedItems: Record<string, boolean>;
  setSelectedItems: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  selectAll: boolean;
  setSelectAll: (selectAll: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  paidSiteIds: Set<string>;
}) {
  const { addToCart } = useCart();
  // Use the central countries hook (same as PublisherAddWebsiteSection)
  const { countries: allCountries, loading: loadingCountries } = useCountries();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minDA: '',
    maxDA: '',
    minDR: '',
    maxDR: '',
    minOrganicTraffic: '',
    maxOrganicTraffic: '',
    category: '',
    country: '',
    minTrafficValue: '',
    maxTrafficValue: '',
    greyNicheAccepted: '',
  });

  // Wishlist state with server-side persistence
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // State for country flags
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});
  const [loadingFlags, setLoadingFlags] = useState(false);
  const [failedFlags, setFailedFlags] = useState<Record<string, boolean>>({});

  // State for highlighting multiple rows
  const [highlightedRows, setHighlightedRows] = useState<Record<string, boolean>>({});

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

  // Load wishlist from server
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setWishlistLoading(true);
        const response = await fetch('/api/wishlist');
        if (response.ok) {
          const data = await response.json();
          // Convert array of IDs to object for easy lookup
          const wishlistObj: Record<string, boolean> = {};
          data.websiteIds.forEach((id: string) => {
            wishlistObj[id] = true;
          });
          setWishlist(wishlistObj);
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
        // Fallback to localStorage if server fails
        if (typeof window !== 'undefined') {
          const savedWishlist = localStorage.getItem('marketplaceWishlist');
          if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
          }
        }
      } finally {
        setWishlistLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // Update wishlist on server
  const updateWishlist = async (websiteId: string, action: 'add' | 'remove') => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteId, action }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state with server response
        const wishlistObj: Record<string, boolean> = {};
        data.websiteIds.forEach((id: string) => {
          wishlistObj[id] = true;
        });
        setWishlist(wishlistObj);
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      // Fallback to localStorage if server fails
      setWishlist(prev => {
        const newWishlist = { ...prev };
        if (action === 'add') {
          newWishlist[websiteId] = true;
        } else {
          delete newWishlist[websiteId];
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('marketplaceWishlist', JSON.stringify(newWishlist));
        }
        return newWishlist;
      });
    }
  };

  // State for highlighting
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);

  // Column visibility state
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'checkbox', label: 'Checkbox', visible: true, span: 1 },
    { id: 'domain', label: 'Domain Name', visible: true, span: 3 },
    { id: 'category', label: 'Category', visible: true, span: 2 },
    { id: 'price', label: 'Price', visible: true, span: 1 },
    { id: 'da', label: 'DA', visible: true, span: 1 },
    { id: 'spam', label: 'Spam', visible: true, span: 1 },
    { id: 'dr', label: 'DR', visible: true, span: 1 },
    { id: 'traffic', label: 'Traffic', visible: true, span: 1 },
    { id: 'trafficValue', label: 'Traffic Value', visible: true, span: 1 },
    { id: 'locationTraffic', label: 'Location Traffic', visible: true, span: 1 },
    { id: 'primeTrafficCountries', label: 'Prime Traffic Countries', visible: true, span: 2 },
    { id: 'rd', label: 'RD', visible: true, span: 1 },
    { id: 'greyNiche', label: 'Grey Niche', visible: true, span: 1 },
    { id: 'specialNotes', label: 'Special Notes', visible: true, span: 1 },
    { id: 'actions', label: 'Actions', visible: true, span: 1 },
  ]);

  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  // Reset all columns to visible
  const resetColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: true })));
  };

  // Use full categories list from shared CATEGORIES (show all categories in filters)
  const allCategories = CATEGORIES.map(c => String(c.name)).filter(Boolean) as string[];

  const uniqueCountries = Array.from(
    new Set(websites.map(w => w.primaryCountry).filter(Boolean))
  ).filter(Boolean) as string[];

  // Country options: if a category is selected, derive countries from DB for websites in that category
  const countryOptions = (() => {
    if (filters.category) {
      const set = new Set<string>();
      // build normalized selected parts from the canonical category label (split on comma)
      const selectedParts = String(filters.category).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const matchesCategory = (websiteCategories: any[]) => {
        const wc = websiteCategories.map((c: any) => String(c).trim().toLowerCase());
        return wc.some(wcItem => selectedParts.some(sp => wcItem === sp || wcItem.includes(sp) || sp.includes(wcItem)));
      };

      websites.forEach(w => {
        const websiteCategories = Array.isArray(w.category) ? w.category : w.category ? [w.category] : [];
        if (!matchesCategory(websiteCategories)) return;

        // primaryCountry
        if (w.primaryCountry) set.add(String(w.primaryCountry));

        // primeTrafficCountries (array or CSV string)
        const rawPrimes: any = (w as any).primeTrafficCountries;
        if (Array.isArray(rawPrimes)) {
          rawPrimes.forEach((c: string) => c && set.add(String(c)));
        } else if (typeof rawPrimes === 'string' && rawPrimes.trim() !== '') {
          rawPrimes.split(',').map((s: string) => s.trim()).filter(Boolean).forEach((c: string) => set.add(String(c)));
        }
      });
      return Array.from(set).filter(Boolean) as string[];
    }

    // default: use uniqueCountries derived from primaryCountry
    return uniqueCountries;
  })();

  // Apply filters to websites
  const filteredWebsites = websites.filter(w => {
    // Wishlist filter
    if (showWishlistOnly && !wishlist[w._id || w.id || `${w.title}-${w.url}`]) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           w.url.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Price filters
    if (filters.minPrice && w.priceCents < parseFloat(filters.minPrice) * 100) return false;
    if (filters.maxPrice && w.priceCents > parseFloat(filters.maxPrice) * 100) return false;

    // DA filters
    if (filters.minDA && (w.DA || 0) < parseInt(filters.minDA)) return false;
    if (filters.maxDA && (w.DA || 0) > parseInt(filters.maxDA)) return false;


    // DR filters
    if (filters.minDR && (w.DR || 0) < parseInt(filters.minDR)) return false;
    if (filters.maxDR && (w.DR || 0) > parseInt(filters.maxDR)) return false;

    // Organic Traffic filters
    if (filters.minOrganicTraffic && (w.OrganicTraffic || 0) < parseInt(filters.minOrganicTraffic)) return false;
    if (filters.maxOrganicTraffic && (w.OrganicTraffic || 0) > parseInt(filters.maxOrganicTraffic)) return false;

    // Traffic Value filters
    if (filters.minTrafficValue && (w.trafficValue || 0) < parseInt(filters.minTrafficValue)) return false;
    if (filters.maxTrafficValue && (w.trafficValue || 0) > parseInt(filters.maxTrafficValue)) return false;

    // Category filter
    if (filters.category) {
      const selectedParts = String(filters.category).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const websiteCategories = Array.isArray(w.category) ? w.category : w.category ? [w.category] : [];
      const wc = websiteCategories.map((c: any) => String(c).trim().toLowerCase());
      const matchedCat = wc.some((wcItem: string) => selectedParts.some(sp => wcItem === sp || wcItem.includes(sp) || sp.includes(wcItem)));
      if (!matchedCat) return false;
    }

    // Country filter: match against primeTrafficCountries (DB field)
    // Accepts arrays or comma-separated strings. Uses case-insensitive
    // partial matching so 'United States' matches 'United States of America'.
    if (filters.country) {
      const selected = filters.country.toLowerCase();

      // Normalize primeTrafficCountries into an array of strings
      let primes: string[] = [];
      const rawPrimes: any = (w as any).primeTrafficCountries;
      if (Array.isArray(rawPrimes)) {
        primes = rawPrimes as string[];
      } else if (typeof rawPrimes === 'string' && rawPrimes.trim() !== '') {
        // split on commas and trim
        primes = rawPrimes.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      if (primes.length === 0) return false;

      const matched = primes.some(pc => {
        const p = (pc || '').toLowerCase();
        return p.includes(selected) || selected.includes(p);
      });

      if (!matched) return false;
    }

    // Grey Niche filter
    if (filters.greyNicheAccepted !== '') {
      const filterValue = filters.greyNicheAccepted === 'true';
      if (w.greyNicheAccepted !== filterValue) return false;
    }

    return true;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minDA: '',
      maxDA: '',
      minDR: '',
      maxDR: '',
      minOrganicTraffic: '',
      maxOrganicTraffic: '',
      category: '',
      country: '',
      minTrafficValue: '',
      maxTrafficValue: '',
      greyNicheAccepted: '',
    });
  };

  // Calculate total span for grid based on visible columns
  const totalSpan = columns.filter(col => col.visible).reduce((sum, col) => sum + col.span, 0);

  return (
    <div>
      {/* Table Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={refreshWebsites}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-500">
            {showWishlistOnly ? `${filteredWebsites.length} wishlist items` : `${filteredWebsites.length} websites available`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Wishlist Toggle Button */}
          <button
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            disabled={wishlistLoading}
            className={`p-2 rounded-md ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''} ${showWishlistOnly ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            title={showWishlistOnly ? "Show all websites" : "Show wishlist only"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={showWishlistOnly ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4 4 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {/* Add Selected to Cart Button */}
          <button
            onClick={() => {
              const selectedCount = Object.values(selectedItems).filter(Boolean).length;
              if (selectedCount === 0) {
                return;
              }
              
              // Add selected websites to cart
              websites.forEach(w => {
                const id = w._id || w.id || `${w.title}-${w.url}`;
                if (selectedItems[id]) {
                  addToCart({
                    _id: id,
                    title: w.title,
                    priceCents: w.priceCents,
                  });
                }
              });
              
              // Reset selection
              setSelectedItems(prev => ({}));
              setSelectAll(false);
            }}
            disabled={Object.values(selectedItems).filter(Boolean).length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0H15" />
            </svg>
            Add Selected to Cart
          </button>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
              className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Column Visibility Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Show Columns"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6v12" />
              </svg>
            </button>
            
            {showColumnDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Show Columns
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {columns.map((column) => (
                    <label key={column.id} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => toggleColumnVisibility(column.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3 rounded-sm"
                      />
                      <span className="truncate">{column.label}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={resetColumns}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 font-medium"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {/* Filter indicator dot */}
            {(filters.minPrice || filters.maxPrice || filters.minDA || filters.maxDA || 
              filters.minDR || filters.maxDR || filters.minOrganicTraffic || filters.maxOrganicTraffic || 
              filters.category || filters.country || filters.minTrafficValue || filters.maxTrafficValue ||
              filters.greyNicheAccepted) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
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
                  name="minDA"
                  placeholder="Min"
                  value={filters.minDA}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="maxDA"
                  placeholder="Max"
                  value={filters.maxDA}
                  onChange={handleFilterChange}
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
                  name="minDR"
                  placeholder="Min"
                  value={filters.minDR}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="maxDR"
                  placeholder="Max"
                  value={filters.maxDR}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Organic Traffic Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organic Traffic Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minOrganicTraffic"
                  placeholder="Min"
                  value={filters.minOrganicTraffic}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="maxOrganicTraffic"
                  placeholder="Max"
                  value={filters.maxOrganicTraffic}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Traffic Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Value Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minTrafficValue"
                  placeholder="Min"
                  value={filters.minTrafficValue}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  name="maxTrafficValue"
                  placeholder="Max"
                  value={filters.maxTrafficValue}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {/* If a category is selected we show countries derived from DB (countryOptions), otherwise show the full countries list */}
                {filters.category ? (
                  countryOptions.map((country: string) => (
                    <option key={country} value={country}>{country}</option>
                  ))
                ) : (
                  (!loadingCountries ? allCountries : []).map((country: any) => (
                    <option key={country.name} value={country.name}>{country.name}</option>
                  ))
                )}
              </select>
            </div>
            
            {/* Grey Niche Accepted */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grey Niche</label>
              <select
                name="greyNicheAccepted"
                value={filters.greyNicheAccepted}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="true">Accepted</option>
                <option value="false">Not Accepted</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Loading marketplace...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Marketplace</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshWebsites}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredWebsites.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Websites Found</h3>
              <p className="text-gray-600">
                {websites.length > 0 
                  ? "Try adjusting your filters to see more results" 
                  : "Check back later for new digital assets"}
              </p>
              {websites.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div 
                className={`grid gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider`}
                style={{ gridTemplateColumns: `repeat(${columns.filter(col => col.visible).reduce((sum, col) => sum + col.span, 0)}, minmax(0, 1fr))` }}
              >
                {columns.filter(col => col.visible).map((col, index) => {
                  const columnComponents: Record<string, React.ReactNode> = {
                    'checkbox': (
                      <div key={col.id} className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectAll}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectAll(isChecked);
                            const newSelectedItems: Record<string, boolean> = {};
                            websites.forEach(w => {
                              const id = w._id || w.id || `${w.title}-${w.url}`;
                              newSelectedItems[id] = isChecked;
                            });
                            setSelectedItems(prev => newSelectedItems);
                            
                            // Also highlight/unhighlight all rows when select all is clicked
                            const newHighlightedRows: Record<string, boolean> = {};
                            if (isChecked) {
                              websites.forEach(w => {
                                const id = w._id || w.id || `${w.title}-${w.url}`;
                                newHighlightedRows[id] = true;
                              });
                            }
                            setHighlightedRows(newHighlightedRows);
                          }}
                          className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                    ),
                    'domain': (
                      <div key={col.id} style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Domain Name</div>
                      </div>
                    ),
                    'category': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Category</div>
                      </div>
                    ),
                    'price': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Price</div>
                      </div>
                    ),
                    'da': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">DA</div>
                      </div>
                    ),
                    'spam': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Spam</div>
                      </div>
                    ),
                    'dr': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">DR</div>
                      </div>
                    ),
                    'traffic': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Traffic</div>
                      </div>
                    ),
                    'trafficValue': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Traffic Value</div>
                      </div>
                    ),
                    'locationTraffic': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Location Traffic</div>
                      </div>
                    ),
                    'primeTrafficCountries': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        Prime Traffic Countries
                      </div>
                    ),
                    'rd': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">RD</div>
                      </div>
                    ),
                    'greyNiche': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Grey Niche</div>
                      </div>
                    ),
                    'specialNotes': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Special Notes</div>
                      </div>
                    ),
                    'actions': (
                      <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                        <div className="text-sm font-medium text-gray-900">Actions</div>
                      </div>
                    )
                  };
                  
                  return columnComponents[col.id] || null;
                })}
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredWebsites.map((w) => {
                  const stableId = w._id || w.id || `${w.title}-${w.url}`;
                  const isPurchased = paidSiteIds.has(stableId);
                  const isHighlighted = highlightedRows[stableId] || false;
                  const isInWishlist = wishlist[stableId] || false;
                  
                  return (
                    <div 
                      key={stableId} 
                      className={`grid gap-4 px-6 py-4 hover:bg-gray-50 items-center transition-all duration-200 ease-in-out rounded-lg ${isHighlighted ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}
                      style={{ gridTemplateColumns: `repeat(${columns.filter(col => col.visible).reduce((sum, col) => sum + col.span, 0)}, minmax(0, 1fr))` }}
                      onClick={() => {
                        setHighlightedRows(prev => ({
                          ...prev,
                          [stableId]: !prev[stableId]
                        }));
                      }}
                    >
                      {columns.filter(col => col.visible).map((col, index) => {
                        const columnComponents: Record<string, React.ReactNode> = {
                          'checkbox': (
                            <div key={col.id} className="flex justify-center">
                              <input 
                                type="checkbox" 
                                checked={selectedItems[stableId] || false}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setSelectedItems((prev) => ({
                                    ...prev,
                                    [stableId]: isChecked
                                  }));
                                  setSelectAll(Object.keys(selectedItems).length === websites.length - 1 && isChecked);
                                  // Highlight row when selected
                                  setHighlightedRows(prev => ({
                                    ...prev,
                                    [stableId]: isChecked
                                  }));
                                }}
                                className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                              />
                            </div>
                          ),
                          'domain': (
                            <div key={col.id} style={{ gridColumn: `span ${col.span}` }}>
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-7 w-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                  {w.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4 flex items-center">
                                  <div className="text-sm font-medium text-gray-900">{w.title}</div>
                                  {/* Description Icon */}
                                  {w.description && (
                                    <div className="relative group ml-2">
                                      <div className="text-gray-400 hover:text-gray-600 cursor-help">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 max-w-xs">
                                        <div className="max-h-20 overflow-y-auto">
                                          {w.description}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {/* Wishlist Heart Icon */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newWishlistState = !isInWishlist;
                                      setWishlist(prev => ({
                                        ...prev,
                                        [stableId]: newWishlistState
                                      }));
                                      // Update server
                                      updateWishlist(stableId, newWishlistState ? 'add' : 'remove');
                                    }}
                                    className={`ml-2 ${isInWishlist ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                                    title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                                    disabled={wishlistLoading}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4 4 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ),
                          'category': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              {w.category ? (
                                <div className="relative group">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold cursor-help">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-4-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </div>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                    {Array.isArray(w.category) ? w.category.join(', ') : w.category}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-gray-400">-</span>
                              )}
                            </div>
                          ),
                          'price': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-green-600">${(w.priceCents / 100).toFixed(2)}</div>
                            </div>
                          ),
                          'da': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-gray-900">{w.DA || 0}</div>
                            </div>
                          ),
                          'spam': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-gray-900">{w.Spam || 0}</div>
                            </div>
                          ),
                          'dr': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-gray-900">{w.DR || 0}</div>
                            </div>
                          ),
                          'traffic': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-gray-900">{w.OrganicTraffic || 0}</div>
                            </div>
                          ),
                          'trafficValue': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-gray-900">$ {w.trafficValue || 0}</div>
                            </div>
                          ),
                          'locationTraffic': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-gray-900">{w.locationTraffic || 0}</div>
                            </div>
                          ),
                          'primeTrafficCountries': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              {w.primeTrafficCountries && w.primeTrafficCountries.length > 0 ? (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {w.primeTrafficCountries.slice(0, 3).map((country, index) => {
                                    const flagUrl = countryFlags[country];
                                    const hasFailed = failedFlags[country];
                                    
                                    return (
                                      <div key={index} className="relative group">
                                        {flagUrl && !hasFailed ? (
                                          <img 
                                            src={flagUrl} 
                                            alt={country} 
                                            className="w-6 h-4 rounded-sm object-cover cursor-help"
                                            onError={() => {
                                              // Mark this country's flag as failed
                                              setFailedFlags(prev => ({ ...prev, [country]: true }));
                                            }}
                                          />
                                        ) : (
                                          <div className="w-6 h-4 rounded-sm bg-gray-100 flex items-center justify-center text-xs cursor-help overflow-hidden">
                                            <span className="text-xs">{getCountryFlagEmoji(country)}</span>
                                          </div>
                                        )}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                          {country}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {w.primeTrafficCountries.length > 3 && (
                                    <div className="relative group">
                                      <div className="w-6 h-4 rounded-sm bg-gray-200 flex items-center justify-center text-xs cursor-help">
                                        +{w.primeTrafficCountries.length - 3}
                                      </div>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                        {w.primeTrafficCountries.slice(3).join(', ')}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-gray-400">-</span>
                              )}
                            </div>
                          ),
                          'rd': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              {w.RD != null && w.RD !== '' ? (
                                <div className="text-sm font-medium text-gray-900">{String(w.RD)}</div>
                              ) : (
                                <span className="text-sm font-medium text-gray-400">-</span>
                              )}
                            </div>
                          ),
                          'greyNiche': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="text-sm font-medium text-gray-900">
                                {w.greyNicheAccepted ? 'Yes' : 'No'}
                              </div>
                            </div>
                          ),
                          'specialNotes': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              {/* Do not show special notes to consumers if grey niche is not accepted */}
                              {w.greyNicheAccepted ? (
                                w.specialNotes ? (
                                  <div className="relative group">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-bold cursor-help">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 max-w-xs">
                                      <div className="max-h-20 overflow-y-auto">
                                        {w.specialNotes}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm font-medium text-gray-400">-</span>
                                )
                              ) : (
                                <span className="text-sm font-medium text-gray-400">-</span>
                              )}
                            </div>
                          ),
                          'actions': (
                            <div key={col.id} className="flex items-center justify-center" style={{ gridColumn: `span ${col.span}` }}>
                              <div className="flex space-x-2">
                                {isPurchased ? (
                                  <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                                    Purchased
                                  </div>
                                ) : !w.available ? (
                                  <div className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded font-medium">
                                    Unavailable
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row click from triggering
                                      addToCart({
                                        _id: stableId,
                                        title: w.title,
                                        priceCents: typeof w.priceCents === 'number' ? w.priceCents : Math.round((w.priceCents || 0) * 100),
                                      });
                                      // Highlight row when "Buy Now" is clicked
                                      setHighlightedRows(prev => ({
                                        ...prev,
                                        [stableId]: true
                                      }));
                                    }}
                                    className="px-2 py-1 bg-blue-400 text-white text-[0.65rem] rounded hover:bg-blue-700 font-medium transition-colors"
                                    title="Add to Cart"
                                  >
                                    Buy Now
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        };
                        
                        return columnComponents[col.id] || null;
                      })}
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{websites.length}</span> of{" "}
                      <span className="font-medium">{websites.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        aria-current="page"
                        className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l7.293-3.293a1 1 0 011.414-1.414l-4-4a1 1 0 010-1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
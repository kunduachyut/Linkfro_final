import { useState, useEffect, useRef, useMemo } from "react";
import { useCart } from "../app/context/CartContext";
import useCountries from "../hooks/useCountries";
import { CATEGORIES } from "../lib/categories";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

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

// Truncate helper for display
const truncate = (s: string, n = 15) => {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
};

// Extract hostname/domain from a string value. Removes protocol, www. and path/query/hash.
const extractHostname = (input?: string): string => {
  if (!input) return '';
  const s = String(input).trim();
  // Quick fallback removal
  try {
    // If it looks like a URL, let URL parse it
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s) || s.includes('/')) {
      // ensure it has a protocol for URL constructor
      const url = s.startsWith('//') ? 'https:' + s : (s.match(/^\w+:\/\//) ? s : 'https://' + s);
      const u = new URL(url);
      let host = u.hostname || '';
      if (host.startsWith('www.')) host = host.slice(4);
      return host;
    }

    // If no slashes, treat as a plain host and strip www.
    let host = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    host = host.split('/')[0].split('?')[0].split('#')[0];
    return host;
  } catch (err) {
    // Last resort: regex strip
    return s.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].split('#')[0];
  }
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
  const { toast } = useToast();
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

  // Create ref for filter panel
  const filterPanelRef = useRef<HTMLDivElement>(null);
  
  // Create ref for column dropdown
  const columnDropdownRef = useRef<HTMLDivElement>(null);
  const groupByRef = useRef<HTMLDivElement>(null);

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

  // Column visibility state
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'category', label: 'Category', visible: true },
    { id: 'traffic', label: 'Traffic', visible: true },
    { id: 'authority', label: 'DR | DA | RD', visible: true },
    { id: 'pa', label: 'PA', visible: true },
    { id: 'spam', label: 'Spam Score', visible: true },
    { id: 'locationTraffic', label: 'Loc. Traffic', visible: true },
    { id: 'primeCountries', label: 'Prime Countries', visible: true },
    { id: 'greyNiche', label: 'Grey Niche', visible: true },
    { id: 'notes', label: 'Notes', visible: true },
    { id: 'language', label: 'Language', visible: true },
  ]);

  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showGroupByDropdown, setShowGroupByDropdown] = useState(false);
  const [groupBy, setGroupBy] = useState<'mostRecent' | 'oldest' | 'priceLowHigh' | 'priceHighLow'>('mostRecent');
  const groupByLabels: Record<string, string> = {
    mostRecent: 'Most recent',
    oldest: 'Oldest',
    priceLowHigh: 'Price: low → high',
    priceHighLow: 'Price: high → low',
  };

  // Add useEffect to handle outside clicks for filter panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showFilters && filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // Add useEffect to handle outside clicks for column dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showColumnDropdown && columnDropdownRef.current && !columnDropdownRef.current.contains(event.target as Node)) {
        setShowColumnDropdown(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnDropdown]);

  // Add useEffect to handle outside clicks for Group By dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showGroupByDropdown && groupByRef.current && !groupByRef.current.contains(event.target as Node)) {
        setShowGroupByDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGroupByDropdown]);

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

    // Search filter - only show names that start with the search query
    if (searchQuery) {
      const matchesSearch = w.title.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        w.url.toLowerCase().startsWith(searchQuery.toLowerCase());
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

    // Country filter
    if (filters.country) {
      const selected = filters.country.toLowerCase();
      let primes: string[] = [];
      const rawPrimes: any = (w as any).primeTrafficCountries;
      if (Array.isArray(rawPrimes)) {
        primes = rawPrimes as string[];
      } else if (typeof rawPrimes === 'string' && rawPrimes.trim() !== '') {
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

  const sortedWebsites = useMemo(() => {
    const list = [...filteredWebsites];
    switch (groupBy) {
      case 'mostRecent':
        return list.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da; // newest first
        });
      case 'oldest':
        return list.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return da - db; // oldest first
        });
      case 'priceLowHigh':
        return list.sort((a, b) => {
          const pa = typeof a.priceCents === 'number' ? a.priceCents : Math.round((a.priceCents || 0) * 100);
          const pb = typeof b.priceCents === 'number' ? b.priceCents : Math.round((b.priceCents || 0) * 100);
          return pa - pb;
        });
      case 'priceHighLow':
        return list.sort((a, b) => {
          const pa = typeof a.priceCents === 'number' ? a.priceCents : Math.round((a.priceCents || 0) * 100);
          const pb = typeof b.priceCents === 'number' ? b.priceCents : Math.round((b.priceCents || 0) * 100);
          return pb - pa;
        });
      default:
        return list;
    }
  }, [filteredWebsites, groupBy]);

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
    setSearchQuery('');
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Calculate time ago for "Added to System"
  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) return `${diffDays}d ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ${diffDays % 30}d`;
      return `${Math.floor(diffDays / 365)}y ${Math.floor((diffDays % 365) / 30)}m`;
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="bg-gray-300 p-4 rounded-lg">
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://example.com/"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 text-sm font-medium">
              Search
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Clear Search
            </button>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`p-2 rounded-md border ${showWishlistOnly ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
              title={showWishlistOnly ? "Show All" : "Show Wishlist Only"}
            >
              <svg className={`h-5 w-5 ${showWishlistOnly ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Display Column
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Column Dropdown */}
              {showColumnDropdown && (
                <div ref={columnDropdownRef} className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Choose Column
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
                </div>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md border ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
              title="Toggle Filters"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            {/* Group By button */}
            <div className="relative">
              <button
                onClick={() => setShowGroupByDropdown(!showGroupByDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                title="Group By"
              >
                Group By: {groupByLabels[groupBy]}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown for group by options */}
              {showGroupByDropdown && (
                <div ref={groupByRef} className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort By</div>
                  <div className="max-h-60 overflow-y-auto">
                    <label className={`flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer ${groupBy === 'mostRecent' ? 'bg-blue-50' : ''}`}>
                      <input type="radio" checked={groupBy === 'mostRecent'} onChange={() => { setGroupBy('mostRecent'); setShowGroupByDropdown(false); }} className="h-4 w-4 text-blue-600 mr-3" />
                      Most recent
                    </label>
                    <label className={`flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer ${groupBy === 'oldest' ? 'bg-blue-50' : ''}`}>
                      <input type="radio" checked={groupBy === 'oldest'} onChange={() => { setGroupBy('oldest'); setShowGroupByDropdown(false); }} className="h-4 w-4 text-blue-600 mr-3" />
                      Oldest
                    </label>
                    <label className={`flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer ${groupBy === 'priceLowHigh' ? 'bg-blue-50' : ''}`}>
                      <input type="radio" checked={groupBy === 'priceLowHigh'} onChange={() => { setGroupBy('priceLowHigh'); setShowGroupByDropdown(false); }} className="h-4 w-4 text-blue-600 mr-3" />
                      Price: low to high
                    </label>
                    <label className={`flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer ${groupBy === 'priceHighLow' ? 'bg-blue-50' : ''}`}>
                      <input type="radio" checked={groupBy === 'priceHighLow'} onChange={() => { setGroupBy('priceHighLow'); setShowGroupByDropdown(false); }} className="h-4 w-4 text-blue-600 mr-3" />
                      Price: high to low
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div ref={filterPanelRef} className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* DA Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">DA Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minDA"
                  placeholder="Min"
                  value={filters.minDA}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  name="maxDA"
                  placeholder="Max"
                  value={filters.maxDA}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* DR Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">DR Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minDR"
                  placeholder="Min"
                  value={filters.minDR}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  name="maxDR"
                  placeholder="Max"
                  value={filters.maxDR}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Grey Niche */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Grey Niche</label>
              <select
                name="greyNicheAccepted"
                value={filters.greyNicheAccepted}
                onChange={handleFilterChange}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Top */}
      <div className="flex justify-end mb-2">
        <div className="flex items-center gap-2">
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-2 py-1 border border-blue-500 text-blue-600 rounded bg-blue-50 text-sm font-medium">1</span>
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <select className="ml-2 border border-gray-300 rounded text-sm p-1">
            <option>20 / page</option>
            <option>50 / page</option>
            <option>100 / page</option>
          </select>
        </div>
      </div>

      {/* Main Table/List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Table Header */}
            <div className="bg-blue-50 border-b border-blue-100 grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider items-center font-body">
              <div className="col-span-2 flex items-center gap-1">
                <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                  Price
                  <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Final price including publisher rate and platform fee.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                Website
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs font-normal normal-case">Website domain available for link placement.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {columns.find(c => c.id === 'category')?.visible && (
                <div className="col-span-1 flex justify-center items-center gap-1">
                  Category
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs font-normal normal-case">Primary niche or content topic of the site.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {columns.find(c => c.id === 'traffic')?.visible && (
                <div className="col-span-1 flex items-center justify-center gap-1">
                  <div className="flex items-center cursor-pointer hover:text-blue-600 font-body">
                    Traffic
                    <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs text-xs font-normal normal-case space-y-1">
                          <p><strong>Traffic:</strong> Estimated organic and direct monthly visits.</p>
                          <p><strong>Traffic Value:</strong> Approximate SEO traffic value in USD.</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {columns.find(c => c.id === 'authority')?.visible && (
                <div className="col-span-1 flex justify-center items-center gap-1">
                  DR | DA | RD
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs text-xs font-normal normal-case space-y-1">
                          <p><strong>DR (Domain Rating):</strong> Ahrefs metric (1–100) showing backlink quality.</p>
                          <p><strong>DA (Domain Authority):</strong> Moz metric (1–100) showing SEO strength.</p>
                          <p><strong>RD (Referring Domains):</strong> Number of unique websites linking to this domain.</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {/* Group remaining stats into remaining columns */}
              <div className="col-span-5 grid grid-cols-4 gap-0 text-center">
                {columns.find(c => c.id === 'pa')?.visible && <div className="text-xs">PA</div>}
                {columns.find(c => c.id === 'spam')?.visible && (
                  <div className="flex justify-center items-center gap-1">
                    Spam
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs font-normal normal-case">Moz metric estimating likelihood of spammy links. Lower = safer.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {columns.find(c => c.id === 'locationTraffic')?.visible && <div>Loc. Traffic</div>}
                {columns.find(c => c.id === 'primeCountries')?.visible && (
                  <div className="flex justify-center items-center gap-1">
                    <span className="text-xs">Prime</span>
                    <span className="text-xs">Countries</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs font-normal normal-case">Country contributing most website visits.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {columns.find(c => c.id === 'greyNiche')?.visible && (
                  <div className="flex justify-center items-center gap-1">
                    <span className="text-xs">Grey</span>
                    <span className="text-xs">Niche</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs font-normal normal-case">This site allows limited or sensitive content (e.g., gambling, CBD, adult).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {columns.find(c => c.id === 'notes')?.visible && (
                  <div className="flex justify-center items-center gap-1">
                    Notes
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <svg className="h-3 w-3 text-gray-400 hover:text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs font-normal normal-case">Publisher’s remarks or placement conditions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {columns.find(c => c.id === 'language')?.visible && <div>Language</div>}
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : sortedWebsites.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No websites found matching your criteria.</div>
              ) : (
                sortedWebsites.map((w) => {
                  const stableId = w._id || w.id || `${w.title}-${w.url}`;
                  const isPurchased = paidSiteIds.has(stableId);
                  const isInWishlist = wishlist[stableId] || false;
                  const isSelected = selectedItems[stableId] || false;

                  return (
                    <div
                      key={stableId}
                      className={`grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      {/* Price Column */}
                      <div className="col-span-2 flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show confirmation toast
                            toast({
                              title: "Added to Cart",
                              description: `${w.title} has been added to your cart.`,
                            });
                            addToCart({
                              _id: stableId,
                              title: w.title,
                              priceCents: typeof w.priceCents === 'number' ? w.priceCents : Math.round((w.priceCents || 0) * 100),
                            });
                          }}
                          disabled={isPurchased || !w.available}
                          className={`px-4 py-1.5 rounded text-white text-sm font-medium shadow-sm ${isPurchased ? 'bg-green-500 cursor-default' :
                            !w.available ? 'bg-gray-400 cursor-not-allowed' :
                              'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isPurchased ? 'Owned' : 'Buy'}
                        </button>
                        <div className="flex flex-col">
                          <span className="font-bold text-green-600">
                            <span className="text-sm">$</span>
                            <span className="text-lg">{(w.priceCents / 100).toFixed(2)}</span>
                            <span className="text-xs ml-1 text-gray-900">USD</span>
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newWishlistState = !isInWishlist;
                                setWishlist(prev => ({ ...prev, [stableId]: newWishlistState }));
                                updateWishlist(stableId, newWishlistState ? 'add' : 'remove');
                              }}
                              className={`${isInWishlist ? 'text-orange-500' : 'text-gray-300 hover:text-orange-400'}`}
                            >
                              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </button>
                            <svg className="h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Website Column */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="p-2 bg-gray-100 rounded-lg cursor-pointer">
                                  <span className="text-xl">{getCountryFlag(w.primaryCountry)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="p-0 border-0 shadow-none bg-transparent">
                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden w-80">
                                  <div className="p-2 bg-gray-100 border-b border-gray-200">
                                    <p className="text-xs font-medium truncate">{w.url}</p>
                                  </div>
                                  <div className="h-48 overflow-hidden">
                                    <iframe 
                                      src={w.url} 
                                      className="w-full h-full"
                                      title={`Preview of ${w.url}`}
                                      sandbox="allow-same-origin allow-scripts"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="p-2 bg-gray-50 text-xs text-gray-500">
                                    Website Preview
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="overflow-hidden">
                            <div className="font-bold text-gray-900 truncate" title={w.title || w.url}>
                              {extractHostname(w.url)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="flex items-center gap-1 text-blue-600 cursor-help hover:text-blue-800 transition-colors">
                                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Description
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-xs">{w.description || "No description available."}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category Column */}
                      {columns.find(c => c.id === 'category')?.visible && (
                        <div className="col-span-1 flex justify-center">
                          {w.category && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full cursor-pointer">
                                    {Array.isArray(w.category) ? w.category[0] : w.category}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {Array.isArray(w.category) 
                                      ? w.category.join(', ') 
                                      : w.category}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      )}

                      {/* Traffic Column */}
                      {columns.find(c => c.id === 'traffic')?.visible && (
                        <div className="col-span-1">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="px-1.5 py-0.5 flex items-center justify-center bg-orange-100 text-orange-600 rounded text-[10px] font-bold cursor-help">Traffic</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Organic Traffic</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="font-medium text-gray-700 flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-3 h-3 mr-1 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-6 h-6" />
                                      <span className="text-xs text-gray-700">DR, RD, Organic Traffic & Traffic Value from Ahrefs</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {w.OrganicTraffic ? w.OrganicTraffic.toLocaleString() : '0'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="px-1.5 py-0.5 flex items-center justify-center bg-blue-100 text-blue-600 rounded text-[10px] font-bold cursor-help">TV</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Traffic Value</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="font-medium text-gray-700 flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-3 h-3 mr-1 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-6 h-6" />
                                      <span className="text-xs text-gray-700">DR, RD, Organic Traffic & Traffic Value from Ahrefs</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {w.trafficValue ? `$${w.trafficValue.toLocaleString()}` : '$0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Authority Column */}
                      {columns.find(c => c.id === 'authority')?.visible && (
                        <div className="col-span-1">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-500 flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-3 h-3 mr-1 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-6 h-6" />
                                      <span className="text-xs text-gray-700">DR, RD, Organic Traffic & Traffic Value from Ahrefs</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span className="font-bold">DR</span>
                              </span>
                              <span className="bg-blue-600 text-white px-1.5 rounded text-[10px] font-bold">{w.DR || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-500 flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img src="/idlAwxs03C.jpeg" alt="MOZ" className="w-3 h-3 mr-1 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                      <img src="/idlAwxs03C.jpeg" alt="MOZ" className="w-6 h-6" />
                                      <span className="text-xs text-gray-700">DA, PA & Spam Score From MOZ</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span className="font-bold">DA</span>
                              </span>
                              <span className="bg-blue-400 text-white px-1.5 rounded text-[10px] font-bold">{w.DA || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-500 flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-3 h-3 mr-1 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                      <img src="/a-blue-WCCZIE43.jpeg" alt="Ahrefs" className="w-6 h-6" />
                                      <span className="text-xs text-gray-700">DR, RD, Organic Traffic & Traffic Value from Ahrefs</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span className="font-bold">RD</span>
                              </span>
                              <span className="bg-purple-500 text-white px-1.5 rounded text-[10px] font-bold">{w.RD || '-'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stats Columns (Grid) */}
                      <div className="col-span-5 grid grid-cols-4 gap-2 text-center items-center">
                        {columns.find(c => c.id === 'pa')?.visible && (
                          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/idlAwxs03C.jpeg" alt="MOZ" className="w-3 h-3 mr-1 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                  <img src="/idlAwxs03C.jpeg" alt="MOZ" className="w-6 h-6" />
                                  <span className="text-xs text-gray-700">DA, PA & Spam Score From MOZ</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="font-bold">PA</span> <span className="font-bold">{w.PA || 0}</span>
                          </div>
                        )}
                        {columns.find(c => c.id === 'spam')?.visible && (
                          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src="/idlAwxs03C.jpeg" alt="MOZ" className="w-3 h-3 mr-1 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                  <img src="/idlAwxs03C.jpeg" alt="MOZ" className="w-6 h-6" />
                                  <span className="text-xs text-gray-700">DA, PA & Spam Score From MOZ</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {w.Spam || 0}%
                          </div>
                        )}
                        {columns.find(c => c.id === 'locationTraffic')?.visible && (
                          <div className="text-xs text-gray-600">
                            {w.locationTraffic ? w.locationTraffic.toLocaleString() : '-'}
                          </div>
                        )}
                        {columns.find(c => c.id === 'primeCountries')?.visible && (
                          <div className="text-xs text-gray-600 flex flex-col items-center justify-center gap-1">
                            {w.primeTrafficCountries && w.primeTrafficCountries.length > 0 ? (
                              <>
                                {w.primeTrafficCountries.slice(0, 2).map((c, i) => (
                                  <div key={i} className="flex items-center gap-1" title={c}>
                                    <span>{getCountryFlag(c)}</span>
                                    <span className="truncate max-w-[80px]">{truncate(c, 12)}</span>
                                  </div>
                                ))}
                                {w.primeTrafficCountries.length > 2 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-[10px] text-gray-400 cursor-help">+{w.primeTrafficCountries.length - 2}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">
                                          {w.primeTrafficCountries.slice(2).join(', ')}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        )}
                        {columns.find(c => c.id === 'greyNiche')?.visible && (
                          <div className="text-xs text-gray-600">
                            {w.greyNicheAccepted ? (
                              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </div>
                        )}
                        {columns.find(c => c.id === 'notes')?.visible && (
                          <div className="text-xs text-gray-600 flex justify-center">
                            {w.specialNotes ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-xs">{w.specialNotes}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </div>
                        )}
                        {columns.find(c => c.id === 'language')?.visible && (
                          <div className="text-xs text-gray-600">
                            English
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Bottom */}
      <div className="flex justify-end mt-4">
        <div className="flex items-center gap-2">
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-2 py-1 border border-blue-500 text-blue-600 rounded bg-blue-50 text-sm font-medium">1</span>
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <select className="ml-2 border border-gray-300 rounded text-sm p-1">
            <option>20 / page</option>
            <option>50 / page</option>
            <option>100 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}

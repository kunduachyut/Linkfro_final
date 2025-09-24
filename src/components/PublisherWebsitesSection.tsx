import { useState } from "react";
import React from "react";

type Website = {
  _id: string;
  title: string;
  url: string;
  description: string;
  priceCents: number;
  status: "pending" | "approved" | "rejected";
  available: boolean; // Add available field
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string; // Add approvedAt field
  views?: number;
  clicks?: number;
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: string;
  category?: string; // Updated to accept both string and array
  tags?: string;
  primaryCountry?: string; // Add primaryCountry field
  // New fields
  trafficValue?: number;
  locationTraffic?: number;
  greyNicheAccepted?: boolean;
  specialNotes?: string;
};

// Add a new prop for updating website availability
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
  removeSite: (id: string) => void; // This will now trigger the popup
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from websites
  const uniqueCategories = Array.from(
    new Set(mySites.flatMap(site => 
      site.category ? (Array.isArray(site.category) ? site.category : [site.category]) : []
    ))
  ).filter(Boolean) as string[];

  // Helper to compute the publisher-visible price:
  // Prefer explicit originalPriceCents when set. If missing but adminExtraPriceCents exists,
  // derive original price as priceCents - adminExtraPriceCents. Fallback to priceCents.
  const computePublisherVisiblePrice = (s: any) => {
    if (s && typeof s.originalPriceCents === 'number' && s.originalPriceCents != null) return s.originalPriceCents;
    const extra = (s && typeof s.adminExtraPriceCents === 'number') ? s.adminExtraPriceCents : 0;
    if (extra > 0 && s && typeof s.priceCents === 'number') {
      const derived = s.priceCents - extra;
      return derived >= 0 ? derived : s.priceCents;
    }
    return s && typeof s.priceCents === 'number' ? s.priceCents : 0;
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
    setStartDate("");
    setEndDate("");
  };

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
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
              {(availabilityFilter !== "all" || categoryFilter !== "all" || minPrice || maxPrice || minDA || maxDA || startDate || endDate) && (
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
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
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
                  {uniqueCategories.map((category) => (
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

      {filteredSites.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredSites.map((site) => (
            <div
              key={site._id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all bg-white flex flex-col"
            >
              <div className="flex-grow">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{site.title}</h3>
                  <div className="flex-shrink-0">
                    {getStatusBadge(site.status, site.rejectionReason)}
                  </div>
                </div>
                
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm inline-block mb-3 line-clamp-1"
                >
                  {site.url}
                </a>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{site.description}</p>
                
                {/* Display categories */}
                {site.category && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(site.category) ? site.category : site.category.split(',')).map((cat, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">
                          {cat.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* SEO Metrics */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SEO Metrics</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {site.DA !== undefined && site.DA !== null && (
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-blue-600 font-medium">DA</p>
                        <p className="text-sm font-bold text-blue-800">{site.DA}</p>
                      </div>
                    )}
                    {site.DR !== undefined && site.DR !== null && (
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-600 font-medium">DR</p>
                        <p className="text-sm font-bold text-green-800">{site.DR}</p>
                      </div>
                    )}
                    {site.PA !== undefined && site.PA !== null && (
                      <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-purple-600 font-medium">PA</p>
                        <p className="text-sm font-bold text-purple-800">{site.PA}</p>
                      </div>
                    )}
                    {site.Spam !== undefined && site.Spam !== null && (
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-red-600 font-medium">Spam</p>
                        <p className="text-sm font-bold text-red-800">{site.Spam}</p>
                      </div>
                    )}
                    {site.OrganicTraffic !== undefined && site.OrganicTraffic !== null && (
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-orange-600 font-medium">Traffic</p>
                        <p className="text-sm font-bold text-orange-800">{site.OrganicTraffic?.toLocaleString()}</p>
                      </div>
                    )}
                    {site.RD && (
                      <div className="bg-indigo-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-indigo-600 font-medium">RD</p>
                       
                         <p className="text-sm font-bold text-orange-800">{site.RD}</p>
                      </div>
                    )}
                    {site.trafficValue !== undefined && site.trafficValue !== null && (
                      <div className="bg-teal-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-teal-600 font-medium">Traffic Value</p>
                        <p className="text-sm font-bold text-teal-800">{site.trafficValue?.toLocaleString()}</p>
                      </div>
                    )}
                    {site.locationTraffic !== undefined && site.locationTraffic !== null && (
                      <div className="bg-cyan-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-cyan-600 font-medium">Location Traffic</p>
                        <p className="text-sm font-bold text-cyan-800">{site.locationTraffic?.toLocaleString()}</p>
                      </div>
                    )}
                    {site.greyNicheAccepted !== undefined && site.greyNicheAccepted !== null && (
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 font-medium">Grey Niche</p>
                        <p className="text-sm font-bold text-gray-800">
                          {site.greyNicheAccepted ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Country */}
                {site.primaryCountry && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Primary Traffic Country</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-gray-100 px-2.5 py-1 rounded-full">
                        {site.primaryCountry}
                      </span>
                    </div>
                  </div>
                )}

                {/* Special Notes */}
                {site.specialNotes && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Notes</h4>
                    <div className="text-sm bg-gray-100 p-2 rounded">
                      {site.specialNotes}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Added: {site.createdAt ? 
                      new Date(site.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 
                      (site.approvedAt ? 
                        new Date(site.approvedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 
                        'Not approved yet')
                    }
                  </div>
                  <div className="text-green-600 font-bold text-lg">
                    {formatPrice(computePublisherVisiblePrice(site as any))}
                  </div>
                </div>
              </div>

              {/* Container for Availability Toggle and Edit/Delete Buttons */}
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
                {/* Availability Toggle - Moved to bottom left */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${site.available ? 'text-green-600' : 'text-red-600'}`}>
                    {site.available ? 'Available' : 'Not Available'}
                  </span>
                  <button
                    onClick={() => toggleAvailability(site._id, site.available)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      site.available ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        site.available ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Edit and Delete Buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => editWebsite(site)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (!site._id) {
                        // We'll handle this error in the removeSite function now
                        removeSite('');
                        return;
                      }
                      const siteId = String(site._id);
                      if (siteId && siteId !== 'undefined') {
                        removeSite(siteId);
                      } else {
                        // We'll handle this error in the removeSite function now
                        removeSite('');
                      }
                    }}
                    disabled={deleteLoading === site._id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    {deleteLoading === site._id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">delete</span>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
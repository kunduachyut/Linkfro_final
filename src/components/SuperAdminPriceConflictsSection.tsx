"use client";

import React, { useState } from "react";

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

type PriceConflict = {
  groupId: string;
  websites: Website[];
  url: string;
  originalPrice?: number;
  newPrice?: number;
};

type SuperAdminPriceConflictsSectionProps = {
  priceConflicts: PriceConflict[];
  priceConflictsLoading: boolean;
  resolvePriceConflict: (conflictGroup: string, selectedWebsiteId: string, reason?: string, extraPriceCents?: number) => void;
  formatDate: (dateString?: string) => string;
};

const SuperAdminPriceConflictsSection: React.FC<SuperAdminPriceConflictsSectionProps> = ({
  priceConflicts,
  priceConflictsLoading,
  resolvePriceConflict,
  formatDate
}) => {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<{[key: string]: string}>({});
  const [resolutionReason, setResolutionReason] = useState<{[key: string]: string}>({});
  const [extraPrices, setExtraPrices] = useState<{[key: string]: string}>({});

  const handleSelectWebsite = (groupId: string, websiteId: string) => {
    setSelectedWebsiteId(prev => ({
      ...prev,
      [groupId]: websiteId
    }));
  };

  const handleReasonChange = (groupId: string, reason: string) => {
    setResolutionReason(prev => ({
      ...prev,
      [groupId]: reason
    }));
  };

  const handleExtraPriceChange = (groupId: string, value: string) => {
    setExtraPrices(prev => ({
      ...prev,
      [groupId]: value
    }));
  };

  const handleResolveConflict = (conflict: PriceConflict) => {
    const selectedId = selectedWebsiteId[conflict.groupId];
    const reason = resolutionReason[conflict.groupId];
    const extraPrice = extraPrices[conflict.groupId];
    
    if (!selectedId) {
      alert("Please select a website to resolve this conflict");
      return;
    }

    let extraPriceCents: number | undefined = undefined;
    if (extraPrice && extraPrice.trim() !== '') {
      const parsed = Number(parseFloat(extraPrice) * 100);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        extraPriceCents = Math.round(parsed);
      }
    }

    // Pass extra price cents if provided (optional fourth parameter)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore allow passing extra param if parent supports it
    resolvePriceConflict(conflict.groupId, selectedId, reason, extraPriceCents);
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 via-red-600/5 to-rose-600/5"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-gray-800 via-orange-800 to-red-800 bg-clip-text text-transparent">
            Price Conflicts
          </span>
        </h2>
        
        {priceConflictsLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-600 text-sm">Loading price conflicts...</p>
            </div>
          </div>
        ) : (priceConflicts || []).length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Price Conflicts Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">There are currently no price conflicts to resolve. Conflicts will appear here when multiple users submit the same URL with different prices.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(priceConflicts || []).map((conflict) => (
              <div key={conflict.groupId} className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Conflict Group: {conflict.groupId.substring(0, 8)}...
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        URL: <span className="font-mono text-orange-600">{conflict.url}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {conflict.websites.length} websites
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Conflicting Websites
                    </h4>
                    
                    <div className="space-y-3">
                      {conflict.websites.map((website) => (
                        <div 
                          key={website.id} 
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedWebsiteId[conflict.groupId] === website.id
                              ? 'border-orange-300 bg-orange-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectWebsite(conflict.groupId, website.id)}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name={`conflict-${conflict.groupId}`}
                              checked={selectedWebsiteId[conflict.groupId] === website.id}
                              onChange={() => handleSelectWebsite(conflict.groupId, website.id)}
                              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <h5 className="font-medium text-gray-800">{website.title || 'Untitled'}</h5>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Owner: {website.ownerId || 'Unknown'}
                                  </p>
                                </div>
                                <div className="flex flex-col sm:items-end">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {website.priceCents ? `$${(website.priceCents / 100).toFixed(2)}` : 
                                     website.price ? `$${website.price.toFixed(2)}` : '$0.00'}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    Submitted: {formatDate(website.createdAt)}
                                  </span>
                                </div>
                              </div>
                              
                              {website.isOriginal && (
                                <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Original Submission
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-5 border-t border-gray-200/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Resolution
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`reason-${conflict.groupId}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for resolution (optional)
                        </label>
                        <textarea
                          id={`reason-${conflict.groupId}`}
                          value={resolutionReason[conflict.groupId] || ''}
                          onChange={(e) => handleReasonChange(conflict.groupId, e.target.value)}
                          placeholder="Enter reason for selecting this website..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label htmlFor={`extraPrice-${conflict.groupId}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Extra price to add (optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">$</span>
                          <input
                            id={`extraPrice-${conflict.groupId}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={extraPrices[conflict.groupId] || ''}
                            onChange={(e) => handleExtraPriceChange(conflict.groupId, e.target.value)}
                            placeholder="0.00"
                            className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-sm text-gray-600">
                          {selectedWebsiteId[conflict.groupId] 
                            ? `Selected: ${(conflict.websites.find(w => w.id === selectedWebsiteId[conflict.groupId])?.title || 'Unknown website')}`
                            : 'Please select a website to resolve this conflict'}
                        </p>
                        <button
                          onClick={() => handleResolveConflict(conflict)}
                          disabled={!selectedWebsiteId[conflict.groupId]}
                          className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${
                            selectedWebsiteId[conflict.groupId]
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Resolve Conflict
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SuperAdminPriceConflictsSection;
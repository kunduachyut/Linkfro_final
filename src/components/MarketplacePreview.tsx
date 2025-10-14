"use client";

import React, { useState } from "react";
import { Search, Filter, Brain, Zap } from "lucide-react";

const MarketplacePreview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  const featuredNiches = ["Tech", "iGaming", "SaaS", "eCommerce"];
  const sampleDomains = [
    { name: "techinsider.com", da: 92, dr: 88, price: "$199" },
    { name: "gaminghub.net", da: 90, dr: 91, price: "$249" },
    { name: "saasreview.org", da: 94, dr: 89, price: "$299" },
    { name: "ecommercepro.io", da: 91, dr: 93, price: "$279" }
  ];
  
  const filters = [
    { id: "niche", label: "Niche" },
    { id: "da", label: "DA/DR" },
    { id: "geo", label: "GEO" },
    { id: "price", label: "Pricing" }
  ];
  
  const toggleFilter = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter(id => id !== filterId));
    } else {
      setSelectedFilters([...selectedFilters, filterId]);
    }
  };

  return (
    <section className="py-16 bg-white" id="marketplace">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Marketplace Preview</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive Search & Filter
          </p>
        </div>
        
        {/* Search and filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search domains... (e.g. tech, saas, gaming)"
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pulse-500 text-white px-6 py-2 rounded-full hover:bg-pulse-600 transition-colors">
              Search
            </button>
          </div>
          
          {/* Auto-suggest */}
          {searchQuery && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6 p-4">
              <div className="text-sm text-gray-600 mb-2">Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                <button className="bg-pulse-100 text-pulse-700 px-3 py-1 rounded-full text-sm hover:bg-pulse-200">
                  Tech blogs DA70+
                </button>
                <button className="bg-pulse-100 text-pulse-700 px-3 py-1 rounded-full text-sm hover:bg-pulse-200">
                  SaaS
                </button>
                <button className="bg-pulse-100 text-pulse-700 px-3 py-1 rounded-full text-sm hover:bg-pulse-200">
                  AI sites
                </button>
              </div>
            </div>
          )}
          
          {/* Filters as tags/chips */}
          <div className="flex flex-wrap gap-3 mb-8">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                  selectedFilters.includes(filter.id)
                    ? "bg-pulse-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filter.label}
              </button>
            ))}
          </div>
          
          {/* Featured niches */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Featured Niches Today</h3>
            <div className="flex flex-wrap gap-3">
              {featuredNiches.map((niche) => (
                <span
                  key={niche}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {niche}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Domain preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sampleDomains.map((domain, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{domain.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                      DA: {domain.da}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      DR: {domain.dr}
                    </span>
                  </div>
                </div>
                <span className="text-pulse-600 font-bold">{domain.price}</span>
              </div>
              
              {/* Blurred URL preview */}
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">Example URL:</div>
                <div className="flex items-center">
                  <div className="bg-gray-300 rounded w-4 h-4 mr-2"></div>
                  <div className="text-sm bg-gray-300 text-transparent rounded">
                    example.com/article/about-{domain.name.split('.')[0]}-industry
                  </div>
                </div>
              </div>
              
              <button className="w-full text-center text-pulse-600 font-medium text-sm hover:text-pulse-700">
                View Details
              </button>
            </div>
          ))}
        </div>
        
        {/* AI Badge */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full flex items-center animate-pulse-slow">
            <Brain className="w-5 h-5 mr-2" />
            <span>Linkfro AI Suggested Domains</span>
            <Zap className="w-4 h-4 ml-2" />
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <button className="bg-pulse-500 hover:bg-pulse-600 text-white font-medium py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
            Browse Full Marketplace
          </button>
          
          {/* Floating CTA */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto">
            <p className="text-blue-800">
              Didn't find your domain?{" "}
              <button className="font-bold text-blue-600 hover:underline">
                Request it → We'll secure it for you.
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;
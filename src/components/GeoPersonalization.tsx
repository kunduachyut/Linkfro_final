"use client";

import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";

const GeoPersonalization = () => {
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate geolocation detection
    // In a real app, you would use a geolocation service or IP detection
    const detectLocation = () => {
      // This is a simplified example - in reality you would use a service like MaxMind or ipapi
      const locations = ["US", "UK", "EU", "India"];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setUserLocation(randomLocation);
      setIsVisible(true);
      
      // Hide after 10 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    };
    
    // Only show if not already shown
    if (!localStorage.getItem('geoPersonalizationShown')) {
      detectLocation();
      localStorage.setItem('geoPersonalizationShown', 'true');
    }
  }, []);

  if (!isVisible || !userLocation) return null;

  const locationData: Record<string, { domains: number; niches: string[] }> = {
    "US": { domains: 50, niches: ["Tech", "Finance", "Health"] },
    "UK": { domains: 45, niches: ["E-commerce", "Travel", "Food"] },
    "EU": { domains: 60, niches: ["Green Energy", "Automotive", "Fashion"] },
    "India": { domains: 40, niches: ["Education", "IT Services", "Ayurveda"] }
  };

  const data = locationData[userLocation] || locationData["US"];

  return (
    <div className="fixed bottom-24 left-6 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs border-l-4 border-pulse-500">
        <div className="flex items-start mb-2">
          <Globe className="w-5 h-5 text-pulse-500 mr-2 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-800">🔥 Hot in {userLocation}!</h4>
            <p className="text-sm text-gray-600">
              {data.domains} {userLocation} domains trending this week
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {data.niches.map((niche, index) => (
            <span 
              key={index} 
              className="bg-pulse-100 text-pulse-700 text-xs px-2 py-1 rounded"
            >
              {niche}
            </span>
          ))}
        </div>
        <button className="text-pulse-600 text-sm font-medium mt-2 hover:underline">
          View Trending Domains →
        </button>
      </div>
    </div>
  );
};

export default GeoPersonalization;
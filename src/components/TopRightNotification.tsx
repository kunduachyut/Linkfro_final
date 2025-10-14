"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const TopRightNotification = () => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const activities = [
    { user: "Anirban", location: "kolkata", action: "purchased 5 links" },
    { user: "Srabonti", location: "kolkata", action: "bought Starter Pack" },
    { user: "Mehul", location: "mumbai", action: "secured 10 domains" },
    { user: "Diya", location: "delhi", action: "claimed special offer" },
    { user: "David", location: "Toronto", action: "joined as publisher" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
      setIsVisible(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 text-sm">Live Activity</h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <div className="text-sm text-gray-700">
            <span className="text-pulse-600 font-medium">
              {activities[currentActivity].user} from {activities[currentActivity].location}{" "}
            </span>
            just {activities[currentActivity].action}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRightNotification;
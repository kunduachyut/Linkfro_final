"use client";

import React, { useState, useEffect } from "react";

const LiveActivityTicker = () => {
  const [currentActivity, setCurrentActivity] = useState(0);

  const activities = [
    { user: "John", location: "London", action: "purchased 5 links" },
    { user: "Sarah", location: "New York", action: "bought Starter Pack" },
    { user: "Michael", location: "Berlin", action: "secured 10 domains" },
    { user: "Emma", location: "Sydney", action: "claimed special offer" },
    { user: "David", location: "Toronto", action: "joined as publisher" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-pulse-50 border-t border-pulse-100 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
          <div className="text-sm text-gray-700">
            <span className="font-medium">Live:</span>{" "}
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

export default LiveActivityTicker;
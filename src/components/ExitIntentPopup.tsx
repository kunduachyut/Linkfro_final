"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Show popup when mouse leaves the viewport at the top
      if (e.clientY <= 0 && !localStorage.getItem('exitIntentShown')) {
        setIsVisible(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Only show popup after 3 seconds on page
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log("Email submitted:", email);
    setIsVisible(false);
    // Show thank you message or redirect
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pulse-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎁</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Wait! Don't Leave Empty-Handed</h3>
          <p className="text-gray-600">
            Grab our free list of 10 DA90+ domains before you go!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pulse-500 hover:bg-pulse-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Get My Free List
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar, MessageCircle } from "lucide-react";

const FinalCTA = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset timer when it reaches zero
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden" id="final-cta">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pulse-900/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Rank with the World's Biggest Link Asset Server?
          </h2>
          
          {/* Countdown popup */}
          <div className="bg-red-600 rounded-lg p-4 mb-8 inline-flex items-center">
            <span className="font-bold mr-2">⏰ Limited Time Offer:</span>
            <span>
              5 DA90+ Links for $299 → Ends in 
              <span className="font-bold ml-2">
                {timeLeft.hours.toString().padStart(2, '0')}:
                {timeLeft.minutes.toString().padStart(2, '0')}:
                {timeLeft.seconds.toString().padStart(2, '0')}
              </span>
            </span>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button className="bg-pulse-500 hover:bg-pulse-600 text-white font-bold py-4 px-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105">
              <Search className="w-5 h-5 mr-2" />
              Browse Marketplace
            </button>
            
            <button className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105">
              <Calendar className="w-5 h-5 mr-2" />
              Book a Call
            </button>
            
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105">
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat on WhatsApp
            </button>
          </div>
          
          {/* Micro-guarantee */}
          <div className="bg-gray-800 rounded-full py-2 px-6 inline-flex items-center mb-6">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>100% live link guarantee or your money back</span>
          </div>
          
          {/* Social proof badges */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-500 mr-2"></div>
              <span>Trusted by 500+ SEO agencies</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-500 mr-2"></div>
              <span>99.8% uptime guarantee</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-500 mr-2"></div>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
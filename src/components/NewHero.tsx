"use client";

import React, { useState, useEffect } from "react";
import { Calendar, MessageCircle, Zap } from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";

const NewHero = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
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
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <BackgroundPaths>
      <>
        {/* Top countdown bar */}
        <div className="relative bg-[#FFDB45] py-2 px-4 text-center text-sm font-medium flex items-center justify-center rounded-b-lg">
          <Zap className="w-4 h-4 mr-2" />
          <span>⚡ Special Offer: 5 DA90+ Links for $299 → Ends in </span>
          <span className="font-bold ml-2">
            {timeLeft.hours.toString().padStart(2, '0')}:
            {timeLeft.minutes.toString().padStart(2, '0')}:
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
        </div>
        
        <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
          
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Instantly Published, Permanent <span className="text-pulse-400">DoFollow Links</span> from the Biggest Link Asset Server in the World.
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Trusted by SaaS, Tech, iGaming, and eCommerce brands — DA/DR 90+ domains, trending niches, and the best pricing guaranteed.
            </p>
            
            {/* Dynamic Features */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 mb-10 border border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 text-pulse-400 mr-2" />
                  <span className="font-medium">Today's Special Offer Ends in:</span>
                  <span className="ml-2 font-bold text-pulse-400">
                    {timeLeft.hours.toString().padStart(2, '0')}:
                    {timeLeft.minutes.toString().padStart(2, '0')}:
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button className="bg-pulse-500 hover:bg-pulse-600 text-white font-medium py-3 px-6 rounded-full flex items-center transition-all duration-300 transform hover:scale-105">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a Call
                  </button>
                  
                  <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-full flex items-center transition-all duration-300 transform hover:scale-105">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp Chat
                  </button>
                </div>
              </div>
            </div>
            
            {/* Micro-copy */}
            <p className="text-blue-200 text-sm mb-8">
              No credit card needed. Free preview of domains.
            </p>
          </div>
        </div>
        
        {/* Floating WhatsApp button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </>
    </BackgroundPaths>
  );
};

export default NewHero;
"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

const SpecialOffers = () => {
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: "5 Trending Links Today",
      price: "$299",
      originalPrice: "$399",
      timeLeft: { hours: 12, minutes: 0, seconds: 0 },
      buyers: 12,
      packsLeft: 7
    },
    {
      id: 2,
      title: "10 Authority Links",
      price: "$549",
      originalPrice: "$699",
      timeLeft: { hours: 24, minutes: 0, seconds: 0 },
      buyers: 8,
      packsLeft: 5
    },
    {
      id: 3,
      title: "Custom Agency Pack",
      price: "Book a Call to Unlock Pricing",
      originalPrice: "",
      timeLeft: { hours: 48, minutes: 0, seconds: 0 },
      buyers: 3,
      packsLeft: 3
    }
  ]);

  // Timer effect for each offer
  useEffect(() => {
    const timer = setInterval(() => {
      setOffers(prevOffers => 
        prevOffers.map(offer => {
          const { hours, minutes, seconds } = offer.timeLeft;
          
          if (seconds > 0) {
            return {
              ...offer,
              timeLeft: { ...offer.timeLeft, seconds: seconds - 1 }
            };
          } else if (minutes > 0) {
            return {
              ...offer,
              timeLeft: { ...offer.timeLeft, minutes: minutes - 1, seconds: 59 }
            };
          } else if (hours > 0) {
            return {
              ...offer,
              timeLeft: { ...offer.timeLeft, hours: hours - 1, minutes: 59, seconds: 59 }
            };
          } else {
            // Reset timer when it reaches zero
            return {
              ...offer,
              timeLeft: { hours: 24, minutes: 0, seconds: 0 }
            };
          }
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-pulse-50 to-pulse-100" id="special-offers">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Special Offers</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            With Timer Always Running
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-2xl overflow-hidden shadow-elegant border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{offer.title}</h3>
                  {offer.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">{offer.originalPrice}</span>
                  )}
                </div>
                
                <div className="text-3xl font-bold text-pulse-600 mb-4">{offer.price}</div>
                
                {/* Circular timer */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-pulse-500" 
                    style={{
                      clipPath: `inset(0 0 ${100 - (offer.timeLeft.minutes / 60) * 100}% 0)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">
                      {offer.timeLeft.hours.toString().padStart(2, '0')}:
                      {offer.timeLeft.minutes.toString().padStart(2, '0')}:
                      {offer.timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-500">left</span>
                  </div>
                </div>
                
                {/* Dynamic urgency */}
                <div className="text-center text-sm text-gray-600 mb-6">
                  <span className="font-medium text-pulse-600">{offer.buyers} buyers</span> grabbed this offer today
                </div>
                
                <button className="w-full bg-pulse-500 hover:bg-pulse-600 text-white font-medium py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-[1.02]">
                  {offer.id === 3 ? "Book a Call to Unlock Pricing" : "Claim My Links Now"}
                </button>
                
                {/* Scarcity microcopy */}
                <div className="text-center mt-4 text-sm text-gray-500">
                  Only <span className="font-bold text-pulse-600">{offer.packsLeft} packs</span> left at this price
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
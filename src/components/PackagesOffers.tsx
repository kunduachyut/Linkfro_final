"use client";

import React from "react";

const PackagesOffers = () => {
  const packages = [
    {
      title: "Starter Pack",
      description: "Perfect for testing the waters",
      links: "5 links",
      price: "$299",
      originalPrice: "$399",
      features: [
        "DA/DR 80+ domains",
        "Instant publishing",
        "DoFollow links",
        "Email support"
      ]
    },
    {
      title: "Growth Pack",
      description: "For serious link builders",
      links: "10 links",
      price: "$549",
      originalPrice: "$699",
      features: [
        "DA/DR 90+ domains",
        "Instant publishing",
        "DoFollow links",
        "Priority support",
        "Geo-targeted options"
      ],
      popular: true
    },
    {
      title: "Agency Pack",
      description: "For high-volume campaigns",
      links: "Custom volume",
      price: "Custom pricing",
      originalPrice: "",
      features: [
        "DA/DR 90+ domains",
        "Instant publishing",
        "DoFollow links",
        "24/7 dedicated support",
        "Geo-targeted options",
        "Custom domain requests",
        "Volume discounts"
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-pulse-50 to-orange-50" id="packages">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Packages & Offers</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bulk Deals for Every Need
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl overflow-hidden shadow-elegant border ${
                pkg.popular 
                  ? "border-pulse-500 ring-2 ring-pulse-200 transform md:-translate-y-2" 
                  : "border-gray-100"
              }`}
            >
              {pkg.popular && (
                <div className="bg-pulse-500 text-white text-center py-2 font-bold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{pkg.title}</h3>
                <p className="text-gray-600 mb-6">{pkg.description}</p>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold text-pulse-600 mb-1">{pkg.price}</div>
                  {pkg.originalPrice && (
                    <div className="text-gray-500 line-through">{pkg.originalPrice}</div>
                  )}
                  <div className="text-lg font-semibold mt-2">{pkg.links}</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full font-medium py-3 px-4 rounded-full transition-all duration-300 ${
                    pkg.popular
                      ? "bg-pulse-600 hover:bg-pulse-700 text-white transform hover:scale-[1.02]"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  {pkg.title === "Agency Pack" ? "Get a Custom Quote" : "Get Started"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesOffers;
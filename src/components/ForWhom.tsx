"use client";

import React from "react";
import { Rocket, Gamepad2, ShoppingCart, Building } from "lucide-react";

const ForWhom = () => {
  const industries = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "SaaS",
      description: "Tech citations & niche blogs",
      testimonial: "Linkfro helped us secure placements on 50+ tech blogs, boosting our domain authority by 30% in 3 months.",
      author: "Sarah, CTO at SaaSFlow"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "iGaming",
      description: "Casino + betting placements",
      testimonial: "We've built a network of 200+ gaming sites with Linkfro, driving consistent traffic to our platform.",
      author: "Mike, Marketing Director at BetMaster"
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "eCommerce",
      description: "Geo-maintained domains for conversions",
      testimonial: "Their geo-targeted domains increased our conversion rate by 22% in key European markets.",
      author: "Emma, E-commerce Manager at ShopGlobal"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Enterprise SEO Agencies",
      description: "Volume link-buying with proofed assets",
      testimonial: "Linkfro's verified publisher network saves us 20+ hours per week on quality checks.",
      author: "David, SEO Director at GrowthAgency"
    }
  ];

  return (
    <section className="py-16 bg-white" id="for-whom">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Agencies & Brands Who Want:</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {industries.map((industry, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-elegant border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-pulse-100 text-pulse-600 flex items-center justify-center mb-6">
                {industry.icon}
              </div>
              
              <h3 className="text-2xl font-bold mb-2 flex items-center">
                {industry.title}
              </h3>
              
              <p className="text-gray-600 mb-6">{industry.description}</p>
              
              {/* Testimonial snippet */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 italic mb-2">"{industry.testimonial}"</p>
                <p className="text-xs text-gray-500">— {industry.author}</p>
              </div>
              
              <button className="w-full bg-pulse-500 hover:bg-pulse-600 text-white font-medium py-2 px-4 rounded-full transition-all duration-300">
                See {industry.title} Domains →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWhom;
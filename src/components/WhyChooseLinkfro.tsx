"use client";

import React from "react";
import { 
  Zap, 
  Link, 
  Globe, 
  Brain, 
  MapPin, 
  Building, 
  Shield, 
  Clock, 
  Trophy, 
  DollarSign, 
  Rocket, 
  Headphones 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Publishing",
    description: "Live within hours, not weeks",
    tooltip: "Get your links published quickly, often within hours of approval"
  },
  {
    icon: <Link className="w-6 h-6" />,
    title: "Permanent DoFollow Links",
    description: "No sponsored mark",
    tooltip: "All our links are true DoFollow links with no sponsored attributes"
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Reputable & Trending Domains",
    description: "Across niches",
    tooltip: "Access to high-authority domains across various trending niches"
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Domain Discovery",
    description: "AEO + LLM-driven selection",
    tooltip: "Our AI uses advanced language models to find the best domains for your niche"
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Geo-Maintained Domains",
    description: "For targeted local SEO",
    tooltip: "Domains tailored for US, UK, EU, and India markets"
  },
  {
    icon: <Building className="w-6 h-6" />,
    title: "Citation Building at Scale",
    description: "High authority profiles",
    tooltip: "Build citations across high-authority business directories"
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "DA 90+ & DR 90+ Domains",
    description: "Always Available",
    tooltip: "Consistent access to domains with Domain Authority and Domain Rating of 90+"
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: "24/7 Access & Support",
    description: "Round-the-clock assistance",
    tooltip: "Our support team is available 24/7 to assist you"
  }
];

const WhyChooseLinkfro = () => {
  return (
    <section className="py-16 bg-gray-50" id="why-choose">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Linkfro</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Highlight Your Edge
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white rounded-xl p-6 shadow-elegant hover:shadow-elegant-hover transition-all duration-300 border border-gray-100 hover:border-pulse-200 group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-pulse-100 text-pulse-600 flex items-center justify-center mb-4 group-hover:bg-pulse-500 group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        
        {/* Micro-trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <Clock className="w-5 h-5 text-pulse-500 mr-2" />
            <span className="text-sm font-medium">24/7 Support</span>
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <Brain className="w-5 h-5 text-pulse-500 mr-2" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <Shield className="w-5 h-5 text-pulse-500 mr-2" />
            <span className="text-sm font-medium">Verified Publishers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseLinkfro;
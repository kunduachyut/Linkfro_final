"use client";

import React from "react";
import { Star, TrendingUp } from "lucide-react";

const SocialProof = () => {
  const testimonials = [
    {
      quote: "Linkfro helped us scale to 200+ backlinks in 6 months. The quality of domains is unmatched.",
      author: "Alex Johnson",
      role: "SEO Director, TechGrowth Inc.",
      rating: 5
    },
    {
      quote: "We've increased our organic traffic by 150% using Linkfro's DA90+ domains. Worth every penny.",
      author: "Maria Garcia",
      role: "Marketing Head, EcomGlobal",
      rating: 5
    },
    {
      quote: "As an agency, Linkfro saves us 30+ hours weekly on domain research and publisher negotiations.",
      author: "David Chen",
      role: "Founder, LinkBuilders Pro",
      rating: 5
    }
  ];

  const logos = [
    { name: "Company A" },
    { name: "Company B" },
    { name: "Company C" },
    { name: "Company D" },
    { name: "Company E" },
    { name: "Company F" }
  ];

  return (
    <section className="py-16 bg-white" id="social-proof">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Social Proof & Case Studies</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trusted by Industry Leaders
          </p>
        </div>
        
        {/* Client logos carousel */}
        <div className="mb-16">
          <div className="bg-gray-100 rounded-2xl p-8">
            <div className="flex flex-wrap justify-center items-center gap-12">
              {logos.map((logo, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Testimonial slider */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Case study CTA */}
        <div className="text-center bg-gradient-to-r from-pulse-500 to-orange-500 rounded-2xl p-8 text-white mb-16">
          <h3 className="text-2xl font-bold mb-4">See Real Results</h3>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            See how we helped an iGaming brand scale to 200+ backlinks in 6 months.
          </p>
          <button className="bg-white text-pulse-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-all duration-300">
            View Full Case Study
          </button>
        </div>
        
        {/* Before-after graph */}
        <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Traffic Growth Curve</h3>
          <div className="h-64 flex items-end justify-between px-4">
            {/* Simplified bar chart representation */}
            {[40, 60, 80, 120, 160, 200, 240].map((height, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-gradient-to-t from-pulse-500 to-pulse-300 rounded-t mb-2"
                  style={{ height: `${height}px` }}
                ></div>
                <span className="text-xs text-gray-500">Month {index + 1}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <span>Before Linkfro</span>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-pulse-500 mr-1" />
              <span className="font-bold text-pulse-600">350% Growth</span>
            </div>
            <span>After Linkfro</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
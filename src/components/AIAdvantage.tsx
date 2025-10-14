"use client";

import React from "react";
import { Brain, Zap, Search, Trophy, BarChart3, GitBranch } from "lucide-react";

const AIAdvantage = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50" id="ai-advantage">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">AI & AEO Advantage</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            How Linkfro AI Works
          </p>
        </div>
        
        {/* Infographic/Flowchart */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="relative">
            {/* Connecting lines */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-pulse-200 transform -translate-y-1/2 z-0 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  icon: <Search className="w-8 h-8" />,
                  title: "Scans + ranks domains",
                  description: "With LLMs (ChatGPT, Gemini, Perplexity-powered insights)",
                  step: "01"
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: "Finds trending domains",
                  description: "Reputable domains in real-time",
                  step: "02"
                },
                {
                  icon: <GitBranch className="w-8 h-8" />,
                  title: "Matches to niche",
                  description: "Plus authority metrics",
                  step: "03"
                },
                {
                  icon: <Trophy className="w-8 h-8" />,
                  title: "Suggests Preferred List",
                  description: "AEO-Optimized Placements",
                  step: "04"
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-elegant border border-gray-100 text-center relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-pulse-500 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-pulse-100 text-pulse-600 flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Smart vs Traditional comparison */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-elegant border border-gray-100 overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 border-r border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-center text-pulse-600">Smart Link Building</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <span>AI-powered domain discovery</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <span>Real-time domain ranking</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <span>Automated niche matching</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <span>Continuous optimization</span>
                </li>
              </ul>
            </div>
            
            <div className="p-8 bg-gray-50">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-500">Traditional Link Building</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✗
                  </div>
                  <span>Manual domain research</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✗
                  </div>
                  <span>Outdated domain lists</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✗
                  </div>
                  <span>Generic placements</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    ✗
                  </div>
                  <span>Static approach</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* AI Logos and CTA */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <span className="ml-3 font-medium">ChatGPT</span>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <span className="ml-3 font-medium">Gemini</span>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <span className="ml-3 font-medium">Perplexity</span>
            </div>
          </div>
          
          <button className="bg-pulse-500 hover:bg-pulse-600 text-white font-medium py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
            See how Linkfro AI picks your perfect domains
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIAdvantage;
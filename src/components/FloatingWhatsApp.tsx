"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  useEffect(() => {
    // Simulate agent typing effect
    const typingInterval = setInterval(() => {
      setIsAgentTyping(true);
      setTimeout(() => {
        setIsAgentTyping(false);
      }, 3000);
    }, 10000);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <>
      {/* Floating WhatsApp button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
          onClick={() => window.open('https://wa.me/1234567890', '_blank')}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Live chat widget with agent typing effect */}
      <div className="fixed bottom-24 right-6 z-50">
        {isAgentTyping && (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs mr-2">
                A
              </div>
              <span className="font-medium text-gray-800">Agent</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingWhatsApp;
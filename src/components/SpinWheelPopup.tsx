"use client";

import React, { useState, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";

const SpinWheelPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const prizes = [
    { id: 1, name: "15% Off", color: "bg-red-500" },
    { id: 2, name: "10% Off", color: "bg-blue-500" },
    { id: 3, name: "5% Off", color: "bg-green-500" },
    { id: 4, name: "Free Domain", color: "bg-yellow-500" },
    { id: 5, name: "7% Off", color: "bg-purple-500" },
    { id: 6, name: "Try Again", color: "bg-gray-500" }
  ];

  useEffect(() => {
    // Show popup after 10 seconds on page
    const timer = setTimeout(() => {
      if (!localStorage.getItem('spinWheelShown')) {
        setIsVisible(true);
        localStorage.setItem('spinWheelShown', 'true');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    
    // Generate random result
    const randomPrize = Math.floor(Math.random() * prizes.length);
    setResult(randomPrize);
    
    // Calculate rotation (5 full rotations + offset to prize)
    const newRotation = 5 * 360 + (360 / prizes.length) * randomPrize;
    setRotation(newRotation);
    
    // Show result after animation
    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
    }, 3000);
  };

  const handleClose = () => {
    setIsVisible(false);
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
          <h3 className="text-2xl font-bold mb-2">Spin to Win!</h3>
          <p className="text-gray-600">
            Win 5-15% off today's package
          </p>
        </div>
        
        {/* Wheel */}
        <div className="relative mx-auto w-64 h-64 mb-8">
          <div 
            className="relative w-full h-full rounded-full border-4 border-gray-200 overflow-hidden transition-transform duration-3000 ease-out"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transitionTimingFunction: isSpinning ? 'cubic-bezier(0.2, 0.8, 0.3, 1)' : 'ease-out'
            }}
          >
            {prizes.map((prize, index) => {
              const angle = (360 / prizes.length) * index;
              return (
                <div 
                  key={prize.id}
                  className={`absolute top-0 left-0 w-full h-full ${prize.color}`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((angle + 360/prizes.length - 90) * Math.PI/180)}% ${50 + 50 * Math.sin((angle + 360/prizes.length - 90) * Math.PI/180)}%, ${50 + 50 * Math.cos((angle - 90) * Math.PI/180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI/180)}%)`
                  }}
                >
                  <div 
                    className="absolute top-1/2 left-3/4 transform -translate-y-1/2 -translate-x-1/2 text-white text-xs font-bold rotate-90"
                    style={{ transformOrigin: 'center' }}
                  >
                    {prize.name}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Wheel center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 z-10 flex items-center justify-center">
            <RotateCcw className="w-8 h-8 text-gray-500" />
          </div>
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-b-full z-20"></div>
        </div>
        
        {/* Spin button or result */}
        {!showResult ? (
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
              isSpinning 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-pulse-500 hover:bg-pulse-600 text-white"
            }`}
          >
            {isSpinning ? "Spinning..." : "SPIN WHEEL"}
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-pulse-100 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-lg mb-2">Congratulations!</h4>
              <p className="text-pulse-600 font-bold text-xl">
                You won {prizes[result!].name}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-pulse-500 hover:bg-pulse-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Claim Your Reward
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheelPopup;
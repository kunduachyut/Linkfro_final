"use client";

import React, { useState } from "react";
import { X, User, Building } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"advertiser" | "publisher" | null>(null);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(true); // Default to showing user type selection

  if (!isOpen) return null;

  const handleUserTypeSelect = (type: "advertiser" | "publisher") => {
    setUserType(type);
    setShowUserTypeSelection(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(isLogin ? "Login" : "Sign Up", { email, password, userType });
    // Close modal after submission
    onClose();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUserType(null);
    setShowUserTypeSelection(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // User type selection screen
  if (showUserTypeSelection) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div 
          className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.18)"
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                What brings you to Linkfro?
              </h2>
              <p className="text-white/70">
                Select the profile that best matches your needs
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleUserTypeSelect("advertiser")}
                className="w-full flex items-center p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 mr-4">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Advertiser</h3>
                  <p className="text-white/70 text-sm">Promote your products and services</p>
                </div>
              </button>

              <button
                onClick={() => handleUserTypeSelect("publisher")}
                className="w-full flex items-center p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mr-4">
                  <Building className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Publisher</h3>
                  <p className="text-white/70 text-sm">Monetize your content and audience</p>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.18)"
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-white/70">
              {isLogin ? "Sign in to your account" : "Sign up to get started"}
            </p>
          </div>

          {/* User type indicator */}
          {userType && (
            <div className="mb-4 flex items-center justify-between bg-white/10 rounded-lg p-3">
              <div className="flex items-center">
                {userType === "advertiser" ? (
                  <User className="w-5 h-5 text-orange-500 mr-2" />
                ) : (
                  <Building className="w-5 h-5 text-blue-500 mr-2" />
                )}
                <span className="text-white capitalize">{userType} Profile</span>
              </div>
              <button
                onClick={() => setShowUserTypeSelection(true)}
                className="text-xs text-white/70 hover:text-white"
              >
                Change
              </button>
            </div>
          )}

          {/* Toggle between Login and Sign Up */}
          <div className="flex mb-6 bg-white/10 rounded-full p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                isLogin 
                  ? "bg-white text-orange-500 shadow" 
                  : "text-white/70 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                !isLogin 
                  ? "bg-white text-orange-500 shadow" 
                  : "text-white/70 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            {!isLogin && (
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-white/70 hover:text-white text-sm">
              {isLogin ? "Forgot password?" : "Already have an account? Sign in"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
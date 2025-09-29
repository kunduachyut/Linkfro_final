"use client";

import React, { useState, useEffect } from "react";
import { X, User, Building } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"advertiser" | "publisher" | null>(null);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [traffic, setTraffic] = useState("");
  const [numberOfWebsites, setNumberOfWebsites] = useState("");
  const [message, setMessage] = useState("");
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(true); // Default to showing user type selection
  const { isSignedIn, user } = useUser();

  // UI state hooks must be declared unconditionally (before any early returns)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // If user is already signed in, pre-fill their email and skip to user type selection
    if (isSignedIn && user) {
      setEmail(user.emailAddresses[0]?.emailAddress || "");
      setFullName(user.fullName || "");
      // For signed-in users requesting access, we want to show the signup form directly
      setIsLogin(false);
      setShowUserTypeSelection(true);
    }
  }, [isSignedIn, user]);

  if (!isOpen) return null;

  const handleUserTypeSelect = (type: "advertiser" | "publisher") => {
    setUserType(type);
    setShowUserTypeSelection(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!userType) {
        alert("Please select Advertiser or Publisher");
        return;
      }

      if (isLogin) {
        // Login flow: call check-user to validate credentials and approval
        const res = await fetch("/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, role: userType }),
        });

        // The server may return a 200 with approved:false for pending accounts,
        // or a non-OK status for errors. Parse the JSON in both cases.
        const data = await res.json().catch(() => ({}));

        // Special-case role mismatch (403) so we can show a clear popup message
        if (res.status === 403) {
          // Server already sends a helpful message; fallback to a user-friendly one
          setError(data.error || "You are not registered for this role.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          // Non-OK responses should be displayed as errors
          throw new Error(data.error || "Login failed");
        }

        // Handle approved:false (pending) even if res.ok === true
        if (data.approved === false) {
          setError("Your account is pending approval. Please wait for an admin to approve your account.");
        } else {
          const role = data.user?.role || data.role;
          if (role === "publisher") {
            window.location.href = "/dashboard/publisher";
          } else if (role === "advertiser") {
            window.location.href = "/dashboard/consumer";
          } else {
            window.location.href = "/dashboard";
          }
        }

        return;
      }

      // Sign up / Request Access flow
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError("Email, password, and confirm password are required.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const payload: any = {
        email: email.trim(),
        role: userType,
        fullName: fullName.trim(),
        phone: phone.trim(),
        country: country.trim(),
        traffic: traffic.trim() || "unknown",
        numberOfWebsites: numberOfWebsites.trim() || "0",
        message: message.trim(),
      };

      if (password) payload.password = password;
      if (confirmPassword) payload.confirmPassword = confirmPassword;

      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Request failed");
      }

      setSubmitted(true);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUserType(null);
    setShowUserTypeSelection(true);
    setPhone("");
    setCountry("");
    setTraffic("");
    setNumberOfWebsites("");
    setMessage("");
    setFullName("");
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

          {/* Error alert (dismissible) */}
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-400 bg-red-600/10 flex items-start justify-between">
              <div className="mr-4 text-sm text-red-100">{error}</div>
              <button
                onClick={() => setError("")}
                className="text-red-100/80 hover:text-red-100 text-xs px-2 py-1 rounded"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}

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

          {/* Toggle between Login and Sign Up - always visible */}
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
            {/* Email field - always visible and editable (prefilled when signed-in) */}
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

            {/* Full name (show for signup/request) */}
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            )}

            {/* Company and Website fields removed per request */}
            
            {/* Password and confirmation fields - only for signup or non-signed-in users */}
            {!isLogin && (
              <>
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
                
                <div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Traffic (e.g. 10k/mo)"
                    value={traffic}
                    onChange={(e) => setTraffic(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="number"
                    min={0}
                    placeholder="Number of websites"
                    value={numberOfWebsites}
                    onChange={(e) => setNumberOfWebsites(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Message (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                  />
                </div>
              </>
            )}
            
            {/* Password field for login */}
            {isLogin && (
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
            )}
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              {isSignedIn ? "Submit Request" : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Footer links - only show for non-signed-in users */}
          {!isSignedIn && (
            <div className="mt-6 text-center">
              <a href="#" className="text-white/70 hover:text-white text-sm">
                {isLogin ? "Forgot password?" : "Already have an account? Sign in"}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
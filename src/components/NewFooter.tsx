"use client";

import React from "react";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  Lock,
  Award
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "About", href: "#" },
    { name: "Marketplace", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Blog", href: "#" }
  ];

  const contactInfo = [
    { icon: <Mail className="w-5 h-5" />, text: "support@linkfro.com" },
    { icon: <Phone className="w-5 h-5" />, text: "+1 (555) 123-4567" },
    { icon: <MapPin className="w-5 h-5" />, text: "San Francisco, CA" }
  ];

  const trustBadges = [
    { icon: <Shield className="w-6 h-6" />, text: "SSL Secure" },
    { icon: <Lock className="w-6 h-6" />, text: "Verified Publishers" },
    { icon: <Award className="w-6 h-6" />, text: "Industry Award Winner" }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Linkfro</h3>
            <p className="text-gray-400 mb-6">
              The world's biggest link asset server, connecting advertisers with high-quality publishers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="text-pulse-500 mr-3 mt-1">
                    {item.icon}
                  </div>
                  <span className="text-gray-400">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Trust Badges */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Why Trust Linkfro</h4>
            <div className="space-y-4">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center">
                  <div className="text-pulse-500 mr-3">
                    {badge.icon}
                  </div>
                  <span className="text-gray-400">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2025 Linkfro. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
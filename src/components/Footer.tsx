import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-[#EEEEEE] pt-12 pb-8">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--secondary-primary)' }}>Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Marketplace</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Packages & Offers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Book a Call</a></li>
            </ul>
          </div>

          {/* Column 2 - Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--secondary-primary)' }}>Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Partners / Affiliates</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--secondary-primary)' }}>Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Case Studies</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">FAQs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">SEO Tools</a></li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--secondary-primary)' }}>Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#f97316] transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-[#EEEEEE]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                Copyright © 2025 Linkfro | Powered by Search4Online
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Social Icons */}
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] hover:bg-[#f97316] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] hover:bg-[#f97316] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l11.733 16h4.267l-11.733-16z"></path>
                    <path d="M4 20l11.733-16h4.267l-11.733 16z"></path>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] hover:bg-[#f97316] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] hover:bg-[#f97316] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                    <path d="m10 15 5-3-5-3z"></path>
                  </svg>
                </a>
              </div>
              
              {/* Badge Row */}
              <div className="flex gap-3 pl-3 border-l border-[#EEEEEE]">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Verified Publishers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
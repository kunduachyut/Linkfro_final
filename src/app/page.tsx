"use client";

import React, { useEffect } from "react";
import NewNavbar from "@/components/NewNavbar";
import NewHero from "@/components/NewHero";
import WhyChooseLinkfro from "@/components/WhyChooseLinkfro";
import SpecialOffers from "@/components/SpecialOffers";
import MarketplacePreview from "@/components/MarketplacePreview";
import AIAdvantage from "@/components/AIAdvantage";
import ForWhom from "@/components/ForWhom";
import PackagesOffers from "@/components/PackagesOffers";
import SocialProof from "@/components/SocialProof";
import FinalCTA from "@/components/FinalCTA";
import NewFooter from "@/components/NewFooter";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SpinWheelPopup from "@/components/SpinWheelPopup";
import GeoPersonalization from "@/components/GeoPersonalization";
import TopRightNotification from "@/components/TopRightNotification";

export default function Home() {
  // Initialize intersection observer to detect when elements enter viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    // This helps ensure smooth scrolling for the anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        // Increased offset to account for mobile nav
        const offset = window.innerWidth < 768 ? 100 : 80;
        
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return (
    <div className="min-h-screen">
      <NewNavbar />
      <main className="space-y-0 pt-16">
        <NewHero />
        <WhyChooseLinkfro />
        <SpecialOffers />
        <MarketplacePreview />
        <AIAdvantage />
        <ForWhom />
        <PackagesOffers />
        <SocialProof />
        <FinalCTA />
      </main>
      <NewFooter />
      <FloatingWhatsApp />
      <ExitIntentPopup />
      <SpinWheelPopup />
      <GeoPersonalization />
      <TopRightNotification />
    </div>
  );
}
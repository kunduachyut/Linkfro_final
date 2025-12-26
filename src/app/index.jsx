"use client";

import React, { useState } from "react";
import NewNavbar from '@/components/NewNavbar';
import HeroSection from '@/components/sections/hero-section';
import TrustLogos from '@/components/sections/trust-logos';
import SocialProofStats from '@/components/sections/social-proof-stats';
import IntegrationsShowcase from '@/components/sections/integrations-showcase';
import MarketplaceFeatures from '@/components/sections/ai-features';
import CodeUiFlexibility from '@/components/sections/code-ui-flexibility';
import RunTweakRepeat from '@/components/sections/run-tweak-repeat';
import CaseStudies from '@/components/sections/case-studies';
import MarketplacePlatform from '@/components/sections/enterprise-features';
import EmbedAutomation from '@/components/sections/embed-automation';
import TestimonialsCarousel from '@/components/sections/testimonials-carousel';
import Footer from '@/components/sections/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-base">
      <NewNavbar />
      
      <main className="w-full">
        <HeroSection />
        
        <div className="w-full px-8 md:px-12 lg:px-14 xl:px-[100px] pt-4">
          <div className="mx-auto w-full max-w-section-default">
            <TrustLogos />
            <SocialProofStats />
          </div>
        </div>

        <IntegrationsShowcase />
        
        <MarketplaceFeatures />
        
        <CodeUiFlexibility />
        
        <RunTweakRepeat />
        
        <div className="w-full px-8 md:px-12 lg:px-14 xl:px-[100px] pb-16 sm:pb-28 lg:pb-[95px]">
          <div className="mx-auto w-full max-w-section-default">
            <CaseStudies />
          </div>
        </div>
        
        <div className="w-full px-8 md:px-12 lg:px-14 xl:px-[100px] pb-16 sm:pb-28 lg:pb-[95px]">
          <div className="mx-auto w-full max-w-section-default">
            <MarketplacePlatform />
          </div>
        </div>
        
        <EmbedAutomation />
        
        <TestimonialsCarousel />
      </main>

      <Footer />
    
    </div>
  );
}

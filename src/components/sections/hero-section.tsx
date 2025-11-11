"use client";

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const tabsData = [
  {
    team: "Publishers",
    action: "can",
    description: "⚡ List websites for sale",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/Home_ITO_Ps_5a5aac3fda-2.webp"
  },
  {
    team: "Consumers",
    action: "can",
    description: "⚡ Buy website placements",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/Home_ITO_Ps_5a5aac3fda-2.webp"
  },
  {
    team: "Admins",
    action: "can",
    description: "⚡ Manage marketplace approvals",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/Home_ITO_Ps_5a5aac3fda-2.webp"
  },
  {
    team: "You can",
    action: "",
    description: "▶️ Watch this video to see how it works",
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/Home_ITO_Ps_5a5aac3fda-2.webp"
  }
];

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <section className="w-full pt-[140px]">
        <div className="max-w-section-wide mx-auto w-full">
          <div className="relative w-full overflow-hidden bg-black pt-20 md:pt-24 lg:min-h-[510px] lg:px-8 lg:pt-28 rounded-lg">
            <div className="absolute bottom-0 right-0 top-0 left-0 z-[60] w-full flex-col items-end justify-center overflow-hidden xl:flex xl:gap-y-[50px] xl:pt-8">
              <Image
                width={1720}
                height={652}
                alt="Hero image"
                className="pointer-events-none absolute left-[46%] top-0 z-10 h-full w-auto max-w-none -translate-x-1/2 transform opacity-80 md:left-[59%] md:opacity-100 lg:left-[60%] xl:left-[59.65%] object-cover"
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/hero-bg-1.webp" />

              <video
                autoPlay
                muted
                loop
                playsInline
                className="pointer-events-none absolute left-1/2 top-0 z-[1] aspect-[3.46/1] h-full max-w-none -translate-x-1/2 transform opacity-60 mix-blend-hard-light md:left-[60.35%] md:top-[-7%] md:h-[112%] md:opacity-90 lg:left-[60.85%] xl:left-[60.25%] object-cover">

                <source src="https://n8n.io/videos/home-intro.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="relative z-[150] flex h-full flex-row items-center xl:w-[65%] pb-20 md:pb-24 lg:pb-28">
              <div className="m-auto flex flex-1 flex-col gap-y-6 px-8 text-center md:m-0 md:max-w-full md:px-12 md:text-left lg:px-14 xl:gap-y-3 xl:pl-[100px]">
                <h1 className="font-display text-headline-xs font-medium text-text-primary sm:text-headline-intro m-auto flex flex-col items-center md:mx-0 md:items-start">
                  The Ultimate Website Marketplace{' '}
                  <span className="text-headline-xs sm:text-headline-intro text-accent-orange">
                    for Publishers & Advertisers
                  </span>
                </h1>
                <p className="font-body text-md leading-[1.62em] text-text-secondary md:max-w-[430px] lg:max-w-[500px] xl:mb-3">
                  Connect website publishers with advertisers looking for premium placements. List your sites, discover opportunities, and manage transactions seamlessly in one platform.
                </p>
                <div className="flex flex-col gap-y-4 sm:mx-auto sm:flex-row sm:gap-x-4 md:mx-0 xl:mt-0.5">
                  {/* Updated buttons for clean frontend */}
                  <a href="#marketplace" className="relative flex items-center justify-center rounded-lg px-6 font-normal whitespace-nowrap min-h-[39px] text-small-button-text font-body text-white bg-gradient-to-r from-cta-primary-start to-cta-primary-end hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_0_var(--color-glow-effect)]">
                    List Your Website
                  </a>
                  <a href="#marketplace" className="relative flex items-center justify-center rounded-lg px-6 font-normal whitespace-nowrap min-h-[39px] text-small-button-text font-body text-white border border-cta-secondary-border bg-transparent hover:bg-white/10 transition-colors duration-300">
                    Browse Marketplace
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full relative px-8 md:px-12 lg:px-14 xl:px-[100px] mt-8">
        <div className="max-w-section-default mx-auto !w-full !h-full">
          <div className="rounded-2xl border-[10px] border-white/20 bg-surface-dark/80 backdrop-blur-xl overflow-hidden animate-glow-pulse shadow-[0_8px_32px_0_rgba(107,92,231,0.2)]">
            <div className="flex flex-row w-full gap-3 p-3">
              {tabsData.map((tab, index) =>
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "py-3 px-4 text-left transition-all duration-300 flex-1 rounded-xl backdrop-blur-md",
                  activeTab === index ?
                  "bg-accent-violet/80 shadow-lg shadow-accent-violet/30" :
                  "bg-white/5 text-text-secondary hover:bg-white/15 border border-white/10"
                )}>

                  <div className="w-full">
                    <span className={cn("text-sm md:text-md", activeTab === index ? 'text-white' : 'text-text-secondary')}>
                      <p>
                          <strong className={cn("font-medium", activeTab === index ? 'text-white' : 'text-text-primary')}>{tab.team}</strong> {tab.action}
                      </p>
                    </span>
                    <p className="text-xs md:text-caption-large-regular mt-0.5 tracking-[0.02em]">
                      {tab.description}
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="pb-2 px-3">
              <Image
                src={tabsData[activeTab].imageSrc}
                alt="A visual representation of the workflow"
                width={1120}
                height={635}
                className="w-full h-auto rounded-lg" />

            </div>
          </div>
        </div>
      </section>
    </>);
};

export default HeroSection;
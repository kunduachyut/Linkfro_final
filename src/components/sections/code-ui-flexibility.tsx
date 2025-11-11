import React from 'react';
import Image from 'next/image';
import { Code } from 'lucide-react';

const features = [
  {
    main: 'List websites easily',
    secondary: ' with our intuitive dashboard',
  },
  {
    main: 'Browse thousands of sites',
    secondary: ' with advanced filtering options',
  },
  {
    main: 'Manage campaigns',
    secondary: ' with real-time analytics',
  },
  {
    main: 'Secure transactions',
    secondary: ' with escrow protection',
  },
];

const imageUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/code-6.webp";

const CodeUiFlexibility = () => {
  return (
    <section className="bg-background-base py-16 sm:py-24">
      <div className="container max-w-[1312px] mx-auto">
        <div 
          className="rounded-3xl bg-gradient-to-b from-[#F9F9F7] to-[#E9F0E7] p-8 md:p-16 lg:p-24 text-[#0E0918]"
        >
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-8">
            
            {/* Left Column: Text Content */}
            <div 
              className="flex flex-col rounded-3xl p-8"
              style={{
                boxShadow: '0 0 100px rgba(107, 92, 231, 0.4), 0 0 150px rgba(255, 107, 53, 0.3), 0 0 200px rgba(107, 92, 231, 0.2)'
              }}
            >
              <h2 className="font-display text-4xl/[1.2] font-medium text-[#0E0918] md:text-5xl/[1.2]">
                Simple interface, powerful features
              </h2>
              <p className="text-md mt-6 max-w-md text-[#5C5866]" style={{ lineHeight: '1.62em' }}>
                LinkFro combines an intuitive user interface with powerful marketplace features to help you buy and sell website placements effortlessly.
              </p>
              
              <div className="mt-12 space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Code className="mt-1 h-6 w-6 flex-shrink-0 text-[#3B364A]" strokeWidth="1.5" />
                    <p className="text-lg text-[#0E0918]">
                      <span className="font-medium">{feature.main}</span>
                      <span className="font-normal text-[#5C5866]">{feature.secondary}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="mt-8 lg:mt-0">
              <Image
                src={imageUrl}
                alt="Marketplace dashboard showing website listings and analytics"
                width={600}
                height={509}
                className="h-auto w-full rounded-xl shadow-2xl"
              />
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeUiFlexibility;
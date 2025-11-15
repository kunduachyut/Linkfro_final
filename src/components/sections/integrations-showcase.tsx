'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const integrations = [
  { name: 'Stripe', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/66f6a68fbe0cbedc9ca2ddb3_mailchimp_svg_574c2a4641-15.svg' },
  { name: 'Google Analytics', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/66f4d7cdeb6560b7c1ec0fc4_airtable_svg_3260e9a572-19.svg' },
  { name: 'WordPress', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/66f57a056b782256dbbb14c0_Group_f538a48daf-4.png' },
  { name: 'Shopify', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/66f57a05be2624ab9ba447bb_my_Sql_svg_d9740ad4f9-2.png' },
  { name: 'Facebook Ads', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/66e3d729fbb7d09521916b34_microsoft_Outlook_svg_baf-30.svg' },
  { name: 'Google Ads', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/66e3d729b8346ed0eceba7d8_microsoft_Excel_svg_dc455-35.svg' },
  { name: 'Mailchimp', src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/66e3d729d7214df077bd1a8e_lm_Chat_Aws_Bedrock_svg_1-33.svg' },
];

const displayedIntegrations = [
  ...integrations,
  ...integrations,
  ...integrations,
  ...integrations,
];

export default function IntegrationsShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden pt-[95px] md:pt-[110px]">
      <div className="relative mx-auto w-full max-w-[1440px] px-8 md:px-12 lg:px-14 xl:px-[100px]">
        <div className="relative rounded-3xl p-8 md:p-12 lg:p-16">
          {/* Glow effect behind content */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] rounded-full -z-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(107, 92, 231, 0.5) 0%, rgba(255, 107, 53, 0.35) 30%, rgba(107, 92, 231, 0.2) 50%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
          
          <h2 className={`font-geomanist-book mx-auto flex max-w-[700px] flex-col items-center text-center font-medium text-headline-xs text-text-primary md:text-[36px] lg:max-w-[850px] lg:leading-[1.3] transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Connect your websites with popular
            <span className="text-accent-orange md:text-[36px]">
              marketing & analytics tools
            </span>
          </h2>

          <div className="mt-10 md:mt-12">
            <div className="relative grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] items-center gap-3 md:gap-4">
              {displayedIntegrations.map((integration, index) => (
                <a
                  key={index}
                  href="/integrations/"
                  className={`relative flex aspect-square items-center justify-center rounded-lg border border-white/5 bg-[rgba(255,255,255,0.82)] p-2 transition-all duration-500 hover:scale-110 lg:rounded-[12px] lg:p-3 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 30}ms` : '0ms'
                  }}
                >
                  <Image
                    src={integration.src}
                    alt={integration.name}
                    width={40}
                    height={40}
                    className="h-auto max-h-[40px] w-auto max-w-[40px] object-contain"
                  />
                </a>
              ))}
            </div>
          </div>

          <div className={`mt-8 flex justify-center md:mt-10 lg:mt-[50px] transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <a
              href="/integrations/"
              className="font-geomanist-book flex min-h-[39px] items-center justify-center whitespace-nowrap rounded-lg border border-white/20 bg-transparent px-6 text-center font-normal text-caption-large-regular text-white transition-colors hover:bg-white/10"
            >
              <span className="w-full">Browse all integrations</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
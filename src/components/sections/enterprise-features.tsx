import Image from 'next/image';

const LightningBoltIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M7.34861 0.655899C7.63297 0.125902 8.36703 0.125902 8.65139 0.655899L10.3547 3.81182C10.518 4.11059 10.8879 4.218 11.1643 4.02028L14.2886 1.8499C14.7734 1.50654 15.4201 1.94279 15.311 2.51901L14.5029 6.8202C14.4374 7.15939 14.6738 7.46914 15.011 7.494L15.4389 7.52185C16.0336 7.56708 16.143 8.31835 15.6121 8.65133L12.5052 10.8354C12.2238 11.0363 12.1158 11.4116 12.2741 11.7118L13.9174 14.7645C14.1923 15.2755 13.5042 15.823 12.9809 15.5342L10.024 13.9198C9.74313 13.766 9.40003 13.8863 9.25547 14.1729L8.68112 15.3533C8.39704 15.9387 7.60296 15.9387 7.31888 15.3533L6.74453 14.1729C6.59997 13.8863 6.25687 13.766 5.976 13.9198L3.01908 15.5342C2.49583 15.823 1.80774 15.2755 2.08264 14.7645L3.72591 11.7118C3.88416 11.4116 3.77617 11.0363 3.49481 10.8354L0.387867 8.65133C-0.143003 8.31835 -0.0336109 7.56708 0.561111 7.52185L0.988959 7.494C1.32624 7.46914 1.56262 7.15939 1.49712 6.8202L0.689008 2.51901C0.579927 1.94279 1.22661 1.50654 1.71136 1.8499L4.83569 4.02028C5.11215 4.218 5.48201 4.11059 5.64531 3.81182L7.34861 0.655899Z"
      fill="currentColor"
    />
  </svg>
);

const features = [
  {
    title: 'Publisher Tools',
    description: 'Advanced analytics, SEO tools, monetization options, and performance tracking for website owners.',
  },
  {
    title: 'Advertiser Platform',
    description: 'Campaign management, audience targeting, performance metrics, and ROI tracking for advertisers.',
  },
  {
    title: 'Marketplace Management',
    description: 'Approval workflows, quality control, category management, and dispute resolution.',
  },
];

const certificationBadges = [
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/SOC_2_badge_150px_1c485c7e5c-10.png',
    alt: 'Trusted Platform',
  },
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/gdpr_d6b92d85f1-41.svg',
    alt: 'GDPR Compliant',
  },
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/legal_security_6524969a52-42.svg',
    alt: 'Secure Transactions',
  },
];

const MarketplaceFeatures = () => {
    return (
        <section className="relative overflow-hidden pt-20 lg:pt-32">
            <div className="absolute top-[-10%] right-[-45%] -z-10 h-auto w-full min-w-[800px] brightness-[.84] saturate-[.27]">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/server-9.png"
                  alt=""
                  width={1680}
                  height={916}
                  className="h-auto w-full"
                  aria-hidden="true"
                />
            </div>
            <div className="mx-auto w-full max-w-[1440px]">
                <div className="relative z-[1] w-full px-8 md:px-12 lg:pl-14 lg:pr-10 xl:pl-[100px]">
                    <div className="grid lg:grid-cols-2 lg:gap-x-12">
                        <div className="flex flex-col">
                            <div className="inline-flex items-center justify-start self-start rounded-full border border-border-subtle bg-white/10 px-3 py-1 text-sm font-light leading-5 text-text-secondary">
                                <LightningBoltIcon className="mr-2 h-4 w-4" />
                                Marketplace Platform
                            </div>
                            <h2 className="mt-6 text-3xl font-medium text-white md:text-[42px] md:leading-[1.3]">
                                Everything you need to buy and sell website placements
                            </h2>
                            <p className="text-md mt-6 text-text-secondary">
                                Connect website publishers with advertisers looking for premium placements. Our platform provides all the tools needed for successful transactions and long-term partnerships.
                            </p>
                            <div className="mt-8 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-3">
                                {features.map((feature) => (
                                    <div key={feature.title}>
                                        <h3 className="font-bold text-white">{feature.title}</h3>
                                        <p className="mt-2 text-sm leading-[1.5] tracking-[0.02em] text-text-secondary">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 flex flex-wrap items-center gap-10 md:mt-16 lg:mt-auto lg:pt-8">
                                {certificationBadges.map((badge) => (
                                    <Image
                                        key={badge.alt}
                                        src={badge.src}
                                        alt={badge.alt}
                                        width={50}
                                        height={50}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 lg:mt-0">
                            <div className="w-full">
                                <div className="relative rounded-lg border border-border-deep bg-card/80 px-6 pb-6 pt-5 backdrop-blur-sm">
                                    <p className="text-md text-white">
                                        "LinkFro has transformed how we monetize our content sites. We've earned 3x more revenue since joining the platform."
                                    </p>
                                    <div className="mt-6 flex flex-row items-center gap-4">
                                        <Image
                                            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/Martino_Bonfiglioni_9a3bf848b3-7.jpeg"
                                            alt="Sarah Johnson"
                                            width={56}
                                            height={56}
                                            className="h-14 w-14 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">Sarah Johnson</span>
                                            <span className="text-caption-large-regular -mt-1 text-text-secondary">Content Publisher</span>
                                        </div>
                                    </div>
                                    <a href="/testimonials" className="group mt-4 inline-flex items-center text-accent-purple hover:text-white">
                                        Read more success stories
                                        <span className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1"> →</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MarketplaceFeatures;
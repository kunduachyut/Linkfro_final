import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// The original SVG asset for the logo was not provided in the section-specific assets.
// As per instructions to not write custom SVG, using a styled text placeholder.
const LinkFroLogo = () => (
  <Link href="/" className="w-[87px] block">
    <span className="font-display font-medium text-white text-[28px]">LinkFro</span>
  </Link>
);

const footerColumns = [
  {
    title: 'Marketplace',
    links: [
      { text: 'Browse Websites', href: '/dashboard/consumer' },
      { text: 'List Your Site', href: '/dashboard/publisher' },
      { text: 'Pricing', href: '/pricing' },
      { text: 'Success Stories', href: '/testimonials' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { text: 'Documentation', href: '/docs' },
      { text: 'Blog', href: '/blog' },
      { text: 'Guides', href: '/guides' },
      { text: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'About Us', href: '/about' },
      { text: 'Careers', href: '/careers' },
      { text: 'Contact', href: '/contact' },
      { text: 'Press', href: '/press' },
      { text: 'Legal', href: '/legal' },
    ],
  },
  {
    title: 'For Publishers',
    links: [
      { text: 'Publisher Dashboard', href: '/dashboard/publisher' },
      { text: 'Monetization Guide', href: '/publishers/guide' },
      { text: 'Best Practices', href: '/publishers/best-practices' },
      { text: 'Publisher Terms', href: '/publishers/terms' },
    ],
  },
  {
    title: 'For Advertisers',
    links: [
      { text: 'Advertiser Dashboard', href: '/dashboard/consumer' },
      { text: 'Campaign Guide', href: '/advertisers/guide' },
      { text: 'Targeting Options', href: '/advertisers/targeting' },
      { text: 'Advertiser Terms', href: '/advertisers/terms' },
    ],
  },
];

const socialLinks = [
  { name: 'Twitter/X', href: 'https://twitter.com/linkfro', iconUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/twitter_x_62a44e965e-44.svg' },
  { name: 'GitHub', href: 'https://github.com/linkfro', iconUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/github_e1f217d7a3_b9a271324f-45.svg' },
  { name: 'Discord', href: 'https://discord.gg/linkfro', iconUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/discord_253947c90b_191e8f60fa-46.svg' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/linkfro/', iconUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/linkedin_d710e84d63_6ed0dc28aa-47.svg' },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UCf1n2o_sV22_2Wbl6c_Qh-g', iconUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/youtube_de4bdef50a_4b3a8b8aac-48.svg' },
];

const legalLinks = [
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Cookie Policy', href: '/cookies' },
  { name: 'Report a vulnerability', href: '/report-vulnerability' },
];

export default function Footer() {
  return (
    <footer className="relative bg-background-base font-body">
      <div 
        className="absolute inset-0 z-0 h-full w-full bg-cover" 
        style={{ backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/stars-footer-43.svg')" }}
      ></div>
      <div className="relative z-10 mx-auto w-full px-8 pb-14 pt-16 md:px-12 md:pb-11 md:pt-[70px] lg:px-14 lg:pb-16 lg:pt-[72px] xl:px-[100px] xl:pb-[70px] xl:pt-[82px]">
        <div className="w-full">
          <div className="flex flex-col flex-wrap justify-between gap-y-12 lg:flex-row">
            <div className="max-w-[195px]">
              <LinkFroLogo />
              <p className="mt-5 text-md text-text-secondary">The Ultimate Website Marketplace</p>
              <div className="mt-6 flex flex-row gap-6 md:mt-4 lg:mt-5">
                {socialLinks.map(social => (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="transition-opacity duration-300 hover:opacity-80">
                    <span className="sr-only">{social.name}</span>
                    <Image src={social.iconUrl} alt={`${social.name} logo`} width={24} height={24} />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex grow flex-wrap justify-between gap-x-6 gap-y-12 sm:justify-start sm:gap-x-12 md:gap-x-16 lg:justify-end lg:gap-x-12 xl:gap-x-16">
              {footerColumns.map(column => (
                <div key={column.title}>
                  <h4 className="mb-4 font-display text-[15px] font-medium text-text-primary md:mb-3">
                    {column.title}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {column.links.map(link => (
                      <li key={link.text}>
                        <Link href={link.href} className="text-caption-large-regular text-text-secondary hover:text-text-primary">
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 border-t border-border-deep pt-8 sm:mt-16 sm:pt-9 md:mt-[71px]">
            <div className="flex flex-col-reverse justify-between gap-y-8 text-caption-large-regular sm:flex-row">
              <p className="text-caption-large-regular text-text-secondary">
                © 2025 LinkFro &nbsp; | &nbsp; All rights reserved.
              </p>
              <p className="flex flex-row flex-wrap gap-3 text-text-secondary">
                {legalLinks.map((link, index) => (
                  <React.Fragment key={link.name}>
                    <Link href={link.href} className="hover:text-text-primary">
                      {link.name}
                    </Link>
                    {index < legalLinks.length - 1 && <span className="opacity-60">|</span>}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
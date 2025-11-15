"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

const MarketplaceFeatures = () => {
  const [mousePosition1, setMousePosition1] = useState({ x: 0, y: 0 });
  const [mousePosition2, setMousePosition2] = useState({ x: 0, y: 0 });
  const [mousePosition3, setMousePosition3] = useState({ x: 0, y: 0 });
  const [isHovering1, setIsHovering1] = useState(false);
  const [isHovering2, setIsHovering2] = useState(false);
  const [isHovering3, setIsHovering3] = useState(false);

  const handleMouseMove1 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition1({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove2 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition2({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove3 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition3({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="bg-background-base pt-24 pb-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-geomanist text-[32px] font-medium leading-tight text-text-primary sm:text-4xl">
            The ultimate{" "}
            <span className="bg-gradient-to-r from-cta-primary-start to-cta-primary-end bg-clip-text text-transparent">
              website marketplace platform
            </span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Card 1: List and Discover */}
          <div 
            className="relative overflow-hidden rounded-lg border border-white/10 bg-background-secondary p-8 lg:p-12"
            onMouseMove={handleMouseMove1}
            onMouseEnter={() => setIsHovering1(true)}
            onMouseLeave={() => setIsHovering1(false)}
          >
            {isHovering1 && (
              <div
                className="pointer-events-none absolute z-0 transition-opacity duration-300"
                style={{
                  left: mousePosition1.x,
                  top: mousePosition1.y,
                  width: '700px',
                  height: '700px',
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, rgba(255, 107, 53, 0.25) 0%, transparent 70%)`,
                  opacity: 1,
                  filter: 'blur(40px)',
                }}
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-glow-effect),transparent_50%)] opacity-50"></div>
            <div className="relative z-10 flex h-full flex-col">
              <h3 className="text-[32px] font-medium leading-tight text-white">
                List and discover websites
              </h3>
              <p className="mt-4 text-md text-text-secondary">
                Publishers can easily list their websites with detailed analytics. Advertisers can browse and filter through thousands of quality sites.
              </p>
              <Link href="/dashboard/publisher" className="mt-6 inline-flex items-center gap-2 font-medium text-accent-violet transition-colors hover:text-white">
                Start Publishing <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex-grow"></div>
              <div className="relative mt-8 h-48 w-full">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/teams_of_agent_e1f7b47c2f-3.png"
                  alt="Website listing interface"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="right bottom"
                  className="opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Smart Matching */}
          <div 
            className="relative overflow-hidden rounded-lg border border-white/10 bg-background-secondary p-8 lg:p-12"
            onMouseMove={handleMouseMove2}
            onMouseEnter={() => setIsHovering2(true)}
            onMouseLeave={() => setIsHovering2(false)}
          >
            {isHovering2 && (
              <div
                className="pointer-events-none absolute z-0 transition-opacity duration-300"
                style={{
                  left: mousePosition2.x,
                  top: mousePosition2.y,
                  width: '700px',
                  height: '700px',
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, rgba(255, 107, 53, 0.25) 0%, transparent 70%)`,
                  opacity: 1,
                  filter: 'blur(40px)',
                }}
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-glow-effect),transparent_50%)] opacity-30"></div>
            <div className="relative z-10">
              <h3 className="text-[32px] font-medium leading-tight text-white">Smart matching algorithm</h3>
              <p className="mt-2 text-md text-text-secondary">
                Our AI-powered system matches advertisers with the most relevant websites based on audience, niche, and performance metrics.
              </p>
            </div>
            <div className="relative z-10 mt-6 flex flex-col items-start gap-3">
              <p className="w-fit max-w-[85%] rounded-lg bg-white/5 p-3 text-sm text-text-secondary">
                Looking for tech blogs with 10K+ monthly visitors
              </p>
              <p className="w-fit max-w-[85%] rounded-lg bg-white/10 p-3 text-sm text-text-primary">
                Found 24 matching websites in your niche
              </p>
              <p className="w-fit max-w-[85%] rounded-lg bg-white/10 p-3 text-sm text-text-primary">
                Average CTR: 2.5% | Avg. Page Views: 3.2
              </p>
              <p className="mt-1 w-full rounded-lg border border-white/10 bg-transparent p-3 text-sm text-text-tertiary">
                View recommendations...
              </p>
            </div>
          </div>

          {/* Card 3: Secure Transactions */}
          <div 
            className="relative overflow-hidden rounded-lg border border-white/10 bg-background-secondary p-8 lg:col-span-2"
            onMouseMove={handleMouseMove3}
            onMouseEnter={() => setIsHovering3(true)}
            onMouseLeave={() => setIsHovering3(false)}
          >
            {isHovering3 && (
              <div
                className="pointer-events-none absolute z-0 transition-opacity duration-300"
                style={{
                  left: mousePosition3.x,
                  top: mousePosition3.y,
                  width: '800px',
                  height: '800px',
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, rgba(255, 107, 53, 0.25) 0%, transparent 70%)`,
                  opacity: 1,
                  filter: 'blur(40px)',
                }}
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-glow-effect),transparent_70%)] opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
              <div className="flex-1">
                <div className="inline-block rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Secure & Trusted
                </div>
                <h3 className="mt-4 text-[32px] font-medium leading-tight text-white">
                  Secure transactions with escrow protection
                </h3>
                <p className="mt-2 text-md text-text-secondary">
                  All transactions are protected with our secure escrow system until campaign goals are met.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2 text-md text-text-secondary">
                    <Check className="h-5 w-5 text-success-green" />
                    <span>Stripe-powered payment processing</span>
                  </li>
                  <li className="flex items-center gap-2 text-md text-text-secondary">
                    <Check className="h-5 w-5 text-success-green" />
                    <span>Escrow protection for all transactions</span>
                  </li>
                  <li className="flex items-center gap-2 text-md text-text-secondary">
                    <Check className="h-5 w-5 text-success-green" />
                    <span>Performance-based payout system</span>
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0 lg:w-[450px]">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/self_host_66e57951a8-5.png"
                  alt="Secure transaction interface"
                  width={450}
                  height={253}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceFeatures;
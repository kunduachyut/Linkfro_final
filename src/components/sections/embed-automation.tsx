'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';

const EmbedAutomation = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative overflow-hidden bg-background-base pt-20 pb-20 lg:pt-32 lg:pb-24"
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle closest-corner at 50% 38%, #0d0a19 32%, #0a0a11 81%)'
        }}
      >
        <Image 
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/embed-automation-11.webp"
          alt=""
          width={1471}
          height={520}
          className="pointer-events-none absolute top-0 left-1/2 w-full max-w-[1471px] -translate-x-1/2 select-none opacity-70 mix-blend-color-dodge"
        />
      </div>

      {/* Cursor glow effect */}
      <div
        className="pointer-events-none absolute rounded-full transition-opacity duration-300"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          width: '700px',
          height: '700px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(107, 92, 231, 0.7) 0%, rgba(255, 107, 53, 0.45) 35%, rgba(157, 139, 255, 0.3) 50%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: isHovering ? 1 : 0,
          zIndex: 5,
        }}
      />

      <div className="container relative z-10 mx-auto flex flex-col items-center gap-6 text-center">
        <a href="/dashboard/publisher" className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white transition-colors hover:bg-white/20">
          ⚡ List Your Sites
        </a>
        <h2 className="text-[42px] font-semibold leading-[1.3] text-white">
          Monetize your websites today
        </h2>
        <p className="text-md max-w-[530px] text-text-secondary">
          Join thousands of publishers earning revenue from their websites. List your sites in minutes and start receiving offers from advertisers.
        </p>
        <a href="/dashboard/publisher" className="mt-2 inline-flex min-h-[39px] items-center justify-center rounded-lg bg-accent-violet px-6 text-base font-normal text-white transition-colors duration-300 hover:bg-accent-violet-light">
          List Your First Website
        </a>
      </div>
    </section>
  );
};

export default EmbedAutomation;
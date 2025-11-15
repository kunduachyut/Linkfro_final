"use client";

import Image from "next/image";
import { useState } from "react";

const testimonials = [
  {
    name: "Alex Johnson",
    handle: "@alexj",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/avatar_igordisco_9243b86232_cd9a5c94ce-8.jpg",
    quote:
      "LinkFro has completely transformed how I monetize my websites. I was able to list 5 sites in minutes and started getting offers the same day!",
  },
  {
    name: "Sarah Williams",
    handle: "@sarahw",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/neutral_avatar_purple_fee36bffe3-9.png",
    quote:
      "As an advertiser, finding quality website placements was always a challenge. LinkFro's marketplace made it incredibly easy to discover and purchase placements.",
  },
  {
    name: "Michael Chen",
    handle: "@michaelc",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/avatar_anderoav_589989fc39_ceb1c71a0c-10.jpg",
    quote:
      "The approval process is straightforward and fair. My websites were approved quickly, and the platform handles all the transaction complexity.",
  },
  {
    name: "Emma Rodriguez",
    handle: "@emmar",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/avatar_maxim_poulsen_48f450887b_852d0439bc-11.jpeg",
    quote:
      "I've tried other website marketplaces, but LinkFro's combination of ease of use, fair pricing, and excellent support makes it the clear winner.",
  },
  {
    name: "David Kim",
    handle: "@davidk",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/Felix_Leber_f7a5b3c776_130aeca79d-12.jpeg",
    quote:
      "The dashboard gives me complete visibility into my listings, purchases, and earnings. It's exactly what I needed to manage my website portfolio.",
  },
  {
    name: "Jennifer Lee",
    handle: "@jenniferl",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/avatar_Ironben_0a4b3e7d12_e35805265c-13.jpg",
    quote:
      "As a small publisher, I was worried about getting fair treatment. LinkFro's transparent process and competitive fees have been a game-changer.",
  },
  {
    name: "Robert Taylor",
    handle: "@robertt",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/Francois_lassl_d5cfb504c7_710c87121d-14.jpeg",
    quote:
      "The ad request system makes it easy to communicate with potential advertisers. I've closed more deals in the last month than I did in the previous year.",
  },
  {
    name: "Lisa Anderson",
    handle: "@lisaa",
    avatar:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/neutral_avatar_purple_fee36bffe3-9.png",
    quote:
      "LinkFro's payment system is secure and reliable. I've never had any issues with payouts, and the Stripe integration makes everything seamless.",
  },
];

const TestimonialCard = ({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="group relative mx-3 w-80 flex-shrink-0 rounded-lg border border-border-subtle bg-background-secondary/80 p-8 flex flex-col h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && (
        <span
          className="pointer-events-none absolute z-[1] h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
            background: "radial-gradient(circle, rgba(255, 107, 53, 0.45) 0%, rgba(255, 107, 53, 0.25) 30%, transparent 70%)",
            filter: "blur(35px)",
          }}
        ></span>
      )}
      <p className="relative z-[2] font-body text-[15px] leading-[1.62] text-white flex-grow">
        {testimonial.quote}
      </p>
      <div className="relative z-[2] mt-6 flex items-center gap-4">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="font-display text-base font-medium text-white">
            {testimonial.name}
          </p>
          <p className="font-body text-sm text-text-tertiary">
            {testimonial.handle}
          </p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsCarousel = () => {
  const extendedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="relative w-full overflow-hidden bg-[radial-gradient(136.19%_100%_at_50%_0%,#171638_0%,#0A0A11_100%)]">
      <div className="absolute bottom-[-15%] right-[-10%] z-0 aspect-square w-[500px] rounded-full bg-gradient-to-r from-accent-purple to-accent-orange/30 opacity-30 blur-[150px] lg:bottom-[-50%] lg:w-[1000px]"></div>
      <div className="absolute left-[-15%] top-[-10%] z-0 aspect-square w-[600px] rounded-full bg-gradient-to-r from-accent-violet to-accent-orange/30 opacity-20 blur-[150px] lg:w-[1200px]"></div>

      <div className="relative z-10 mx-auto flex max-w-[630px] flex-col items-center px-8 pt-[90px] pb-10 text-center lg:pt-[85px]">
        <h2 className="font-display text-[42px] font-semibold leading-[1.3] text-white">
          Success stories from our community
        </h2>
        <p className="mt-6 font-body text-md text-text-secondary">
          Hear from publishers and advertisers who found success on LinkFro.
          <br />
          Ready to join them?{" "}
          <a
            href="/signup"
            className="text-accent-purple transition-colors hover:text-white"
          >
            Sign up today
          </a>
          , and start your journey.
        </p>
        <a
          href="/dashboard/publisher"
          className="mt-8 inline-block min-h-[52px] rounded-lg bg-gradient-to-r from-cta-primary-start to-cta-primary-end px-10 py-4 text-base font-normal text-white transition-all hover:brightness-110"
        >
          List Your First Website
        </a>
      </div>

      <div
        className="relative z-10 w-full overflow-hidden pb-[90px]"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex w-max animate-[scroll_80s_linear_infinite] hover:[animation-play-state:paused]">
          {extendedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
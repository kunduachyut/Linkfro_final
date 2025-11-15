"use client";

import Image from "next/image";
import { Zap } from "lucide-react";
import { useState } from "react";

const CaseStudies = () => {
  const [mousePosition1, setMousePosition1] = useState({ x: 0, y: 0 });
  const [mousePosition2, setMousePosition2] = useState({ x: 0, y: 0 });
  const [isHovering1, setIsHovering1] = useState(false);
  const [isHovering2, setIsHovering2] = useState(false);

  const handleMouseMove1 = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition1({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove2 = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition2({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="relative overflow-hidden bg-background-base pt-24 lg:pt-32">
      <div
        className="absolute inset-0 z-0 h-full w-full opacity-50"
        style={{
          backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/stars-bg-39.svg')",
        }}
      ></div>
      <div className="container relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-x-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-light text-white">
            <svg
              className="h-4 w-4"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.2857 1.14282L3.42857 8.00002H8L5.71428 14.8571L12.5714 8.00002H8L10.2857 1.14282Z"
                stroke="#9D8BFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span>See The Results</span>
          </div>
          <h2 className="font-display mx-auto mt-4 max-w-lg text-[36px] font-medium text-text-primary lg:text-[42px]">
            Success Stories
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            <a
              href="#"
              className="group relative flex min-h-[500px] flex-col overflow-hidden rounded-lg p-6 text-left lg:p-8"
              onMouseMove={handleMouseMove1}
              onMouseEnter={() => setIsHovering1(true)}
              onMouseLeave={() => setIsHovering1(false)}
            >
              <span className="absolute inset-0 z-[1] bg-transparent transition-colors duration-200 group-hover:bg-[#16161F]"></span>
              <span className="pointer-events-none absolute inset-0 z-[2] rounded-lg border border-white/15 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
              {isHovering1 && (
                <span
                  className="pointer-events-none absolute z-[3] h-[800px] w-[800px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    left: mousePosition1.x - 400,
                    top: mousePosition1.y - 400,
                    background: "radial-gradient(circle, rgba(255, 107, 53, 0.5) 0%, rgba(255, 107, 53, 0.3) 30%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                ></span>
              )}
              <span
                className="pointer-events-none absolute inset-0 z-0 rounded-lg border"
                style={{
                  background:
                    "radial-gradient(119.82% 119.82% at 100% 0%, rgba(121, 76, 255, 0.2) 0%, rgba(121, 76, 255, 0) 50.08%), radial-gradient(60.18% 60.18% at 0% 100%, rgb(21, 20, 51) 0%, rgb(25, 20, 46) 100%)",
                  border: "1px solid transparent",
                  borderImage:
                    "radial-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)) 1 / 1 / 0 stretch",
                }}
              ></span>
              <div className="relative z-10 flex h-full grow flex-col">
                <div>
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/cs_delivery_hero_745bb7ac83-40.svg"
                    alt="Tech Blog Network logo"
                    className="max-h-[30px]"
                  />
                </div>
                <p className="font-display mt-6 font-medium text-white text-[24px] leading-tight md:text-[23px] md:leading-[31px] lg:mt-8">
                  How Tech Blog Network earned{" "}
                  <strong className="font-medium">$25,000 per month</strong>{" "}
                  from website placements
                </p>
                <div className="my-6 w-full border-b border-white/15"></div>
                <p className="font-body text-md text-text-secondary">
                  "LinkFro helped us monetize our network of 15 tech blogs. We went from zero advertising revenue to $25K monthly income in just 3 months."
                </p>
                <div className="mt-auto flex items-center gap-x-4 pt-6">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/E02996_YDSAK_U4_TEE_6_AAW_8f94f206d022_512_9956afe-5.jpeg"
                    alt="Sarah Johnson"
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <span className="block font-medium text-white">
                      Sarah Johnson
                    </span>
                    <span className="block text-sm text-text-secondary">
                      Publisher Network Director
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex">
                  <div className="inline-flex min-h-[39px] cursor-pointer items-center justify-center rounded-lg bg-accent-violet px-6 text-sm font-normal text-white">
                    Read Success Story
                  </div>
                </div>
              </div>
            </a>
            <a
              href="#"
              className="group relative flex min-h-[500px] flex-col overflow-hidden rounded-lg p-6 text-left lg:p-8"
              onMouseMove={handleMouseMove2}
              onMouseEnter={() => setIsHovering2(true)}
              onMouseLeave={() => setIsHovering2(false)}
            >
              <span className="absolute inset-0 z-[1] bg-transparent transition-colors duration-200 group-hover:bg-[#16161F]"></span>
              <span className="pointer-events-none absolute inset-0 z-[2] rounded-lg border border-white/15 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
              {isHovering2 && (
                <span
                  className="pointer-events-none absolute z-[3] h-[800px] w-[800px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    left: mousePosition2.x - 400,
                    top: mousePosition2.y - 400,
                    background: "radial-gradient(circle, rgba(255, 107, 53, 0.5) 0%, rgba(255, 107, 53, 0.3) 30%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                ></span>
              )}
              <span
                className="pointer-events-none absolute inset-0 z-0 rounded-lg border"
                style={{
                  background:
                    "radial-gradient(119.82% 119.82% at 100% 0%, rgba(121, 76, 255, 0.2) 0%, rgba(121, 76, 255, 0) 50.08%), radial-gradient(60.18% 60.18% at 0% 100%, rgb(21, 20, 51) 0%, rgb(25, 20, 46) 100%)",
                  border: "1px solid transparent",
                  borderImage:
                    "radial-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)) 1 / 1 / 0 stretch",
                }}
              ></span>
              <div className="relative z-10 flex h-full grow flex-col">
                <div>
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/the_stepstone_group_6dccc5eb32-8.webp"
                    alt="Growth Marketing Co logo"
                    width={150}
                    height={30}
                    className="h-auto max-h-[30px] w-auto"
                  />
                </div>
                <p className="font-display mt-6 font-medium text-white text-[24px] leading-tight md:text-[23px] md:leading-[31px] lg:mt-8">
                  How Growth Marketing Co found{" "}
                  <strong className="font-medium">
                    perfect website placements
                  </strong>{" "}
                  in their niche
                </p>
                <div className="my-6 w-full border-b border-white/15"></div>
                <p className="font-body text-md text-text-secondary">
                  "We struggled to find quality websites in the fitness niche for our supplement brand. LinkFro's smart matching saved us 20 hours of research per week."
                </p>
                <div className="mt-auto flex items-center gap-x-4 pt-6">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/icons/Luka_Pilic_Stepstone_443e0351bf_4dbe30dafe-6.jpeg"
                    alt="Michael Torres"
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <span className="block font-medium text-white">
                      Michael Torres
                    </span>
                    <span className="block text-sm text-text-secondary">
                      Marketing Director
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex">
                  <div className="inline-flex min-h-[39px] cursor-pointer items-center justify-center rounded-lg bg-accent-violet px-6 text-sm font-normal text-white">
                    Read Success Story
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
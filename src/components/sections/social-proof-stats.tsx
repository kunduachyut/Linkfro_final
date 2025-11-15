"use client";

import Image from "next/image";
import { Globe, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

const statsData = [
  {
    icon: <Globe className="h-6 w-6 shrink-0 text-white" aria-hidden="true" />,
    boldText: "10,000+ websites.",
    text: "Listed and available for advertising placements.",
  },
  {
    icon: (
      <Image
        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/social_proof_2_14745833f3-14.svg"
        alt="Review score icon"
        width={24}
        height={24}
        className="shrink-0"
      />
    ),
    boldText: "4.8/5 publisher satisfaction.",
    text: "Based on our latest customer satisfaction survey.",
  },
  {
    icon: <Users className="h-6 w-6 shrink-0 text-white" aria-hidden="true" />,
    boldText: "50,000+ active users.",
    text: "Publishers and advertisers growing our community.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 shrink-0 text-white" aria-hidden="true" />,
    boldText: "$2M+ in transactions.",
    text: "Processed through our platform this year.",
  },
];

const StatCard = ({ stat }: { stat: typeof statsData[0] }) => {
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
      className="group relative flex flex-col items-center justify-center gap-x-4 rounded-lg border border-border bg-card p-4 text-center md:flex-row md:items-start md:p-6 md:text-left overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && (
        <span
          className="pointer-events-none absolute z-[1] h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            left: mousePosition.x - 250,
            top: mousePosition.y - 250,
            background: "radial-gradient(circle, rgba(255, 107, 53, 0.4) 0%, rgba(255, 107, 53, 0.2) 30%, transparent 70%)",
            filter: "blur(30px)",
          }}
        ></span>
      )}
      <div className="relative z-[2]">{stat.icon}</div>
      <p className="relative z-[2] mt-4 text-sm font-normal leading-6 tracking-wide text-muted-foreground md:mt-0">
        <strong className="font-medium text-foreground">{stat.boldText} </strong>
        {stat.text}
      </p>
    </div>
  );
};

const SocialProofStats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:pt-14 lg:mt-6 lg:gap-6 lg:pt-0">
      {statsData.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
};

export default SocialProofStats;
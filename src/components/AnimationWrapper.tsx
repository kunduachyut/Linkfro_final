"use client";

import React, { useEffect, useRef } from "react";

interface AnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
  animationClass?: string;
  delay?: number;
}

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  className = "",
  animationClass = "animate-fade-in",
  delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const timer = setTimeout(() => {
        ref.current?.classList.add(animationClass);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animationClass, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default AnimationWrapper;
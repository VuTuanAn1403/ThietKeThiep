'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

export interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function AuroraBackground({
  children,
  className = '',
  ...props
}: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '100px' });
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && !shouldReduceMotion && isInView;

  const decorationBlobs = (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Blob 1: Aurora Violet to Pink */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] lg:w-[680px] lg:h-[680px] rounded-full bg-gradient-to-br from-aurora-violet to-aurora-pink opacity-25 blur-[100px] will-change-transform"
        initial={false}
        animate={
          shouldAnimate
            ? {
                x: [0, 80, -60, 40, 0],
                y: [0, -60, 40, -30, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2: Aurora Cyan to Indigo */}
      <motion.div
        className="absolute top-[20%] -right-[10%] w-[300px] h-[300px] sm:w-[480px] sm:h-[480px] lg:w-[620px] lg:h-[620px] rounded-full bg-gradient-to-bl from-aurora-cyan to-aurora-indigo opacity-20 blur-[100px] will-change-transform"
        initial={false}
        animate={
          shouldAnimate
            ? {
                x: [0, -70, 50, -30, 0],
                y: [0, 50, -50, 60, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 3: Aurora Pink to Indigo */}
      <motion.div
        className="absolute -bottom-[15%] left-[25%] w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] lg:w-[560px] lg:h-[560px] rounded-full bg-gradient-to-tr from-aurora-pink to-aurora-indigo opacity-20 blur-[100px] will-change-transform"
        initial={false}
        animate={
          shouldAnimate
            ? {
                x: [0, 50, -40, 30, 0],
                y: [0, -40, 60, -20, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );

  // If children are provided, wrap them and position above blobs
  if (children) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        {...props}
      >
        {decorationBlobs}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    );
  }

  // Standalone background decoration layer
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      {...props}
    >
      {decorationBlobs}
    </div>
  );
}

export default AuroraBackground;

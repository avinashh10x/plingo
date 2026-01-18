"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface InteractiveAiProps {
  /** Custom size class for the logo container (e.g., "h-[40vh]", "w-80", "h-64 w-64") */
  size?: string;
  /** Whether to show the section wrapper with padding (default true for standalone, false when embedded) */
  standalone?: boolean;
}

export default function InteractiveAi({
  size = "h-64 w-64 md:h-80 md:w-80",
  standalone = true,
}: InteractiveAiProps) {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  // Smooth animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    const dx = targetRef.current.x - currentRef.current.x;
    const dy = targetRef.current.y - currentRef.current.y;

    // Fast lerp factor for responsive feel
    const lerp = 0.3;

    // Only update if there's meaningful movement
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      currentRef.current.x += dx * lerp;
      currentRef.current.y += dy * lerp;
      setEyePosition({ x: currentRef.current.x, y: currentRef.current.y });
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Calculate distance and clamp
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxMove = 12;
      const scale = distance > 0 ? Math.min(1, maxMove / distance) : 0;

      // Update target (the animation loop will smoothly interpolate)
      targetRef.current = {
        x: deltaX * scale * 0.8,
        y: deltaY * scale * 0.8,
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  const content = (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
    >
      {/* SVG Container with Eyes - uses custom size prop */}
      <div className={`relative ${size}`}>
        {/* Plingo Mascot SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="540 230 200 200"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="ia-linear-gradient"
              x1="-1.2"
              y1="665.1"
              x2="-.2"
              y2="665.1"
              gradientTransform="translate(-69488.2 92126.3) rotate(-142.7) scale(173.7)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#000" />
              <stop offset="0" stopColor="#000406" />
              <stop offset=".2" stopColor="#000f18" />
              <stop offset=".3" stopColor="#002237" />
              <stop offset=".4" stopColor="#003c61" />
              <stop offset=".6" stopColor="#005e96" />
              <stop offset=".6" stopColor="#00629c" />
              <stop offset=".7" stopColor="#1f77ab" />
              <stop offset="1" stopColor="#90c3e4" />
            </linearGradient>
            <linearGradient
              id="ia-linear-gradient1"
              x1="1.2"
              y1="642.1"
              x2="2.2"
              y2="642.1"
              gradientTransform="translate(68036.2 -88549.1) rotate(37.3) scale(173.7)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" />
              <stop offset=".2" stopColor="#fff" />
              <stop offset="1" stopColor="#90c3e4" />
            </linearGradient>
            <linearGradient
              id="ia-linear-gradient2"
              x1="-9.2"
              y1="663.4"
              x2="-8.2"
              y2="663.4"
              gradientTransform="translate(-646.1 98731.9) rotate(-180) scale(148.3)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#4aa3d8" />
              <stop offset="1" stopColor="#387ca5" />
            </linearGradient>
          </defs>
          <g id="Layer_5">
            <path
              fill="url(#ia-linear-gradient)"
              d="M588.9,252.2h100.8c12.7,0,23,10.3,23,23v100.9c0,12.7-10.3,23-23,23h-100.8c-12.7,0-23-10.3-23-23v-100.9c0-12.7,10.3-23,23-23Z"
            />
          </g>
          <g id="Layer_4">
            <path
              fill="#4aa3d8"
              d="M588.9,252.2v1h100.8c6.1,0,11.6,2.5,15.6,6.5,4,4,6.5,9.5,6.5,15.6v100.9c0,6.1-2.5,11.6-6.5,15.6-4,4-9.5,6.5-15.6,6.5h-100.8c-6.1,0-11.6-2.5-15.6-6.5-4-4-6.5-9.5-6.5-15.6v-100.9c0-6.1,2.5-11.6,6.5-15.6,4-4,9.5-6.5,15.6-6.5v-1.9c-13.2,0-24,10.7-24,24v100.9c0,13.3,10.7,24,24,24h100.8c13.2,0,24-10.7,24-24v-100.9c0-13.3-10.7-24-24-24h-100.8v1Z"
            />
          </g>
          <g id="Layer_3">
            <path
              fill="url(#ia-linear-gradient1)"
              d="M701.2,406.8h-100.8c-12.7,0-23-10.3-23-23v-100.9c0-12.7,10.3-23,23-23h100.8c12.7,0,23,10.3,23,23v100.9c0,12.7-10.3,23-23,23Z"
            />
          </g>
          <g id="Layer_2">
            <path
              fill="url(#ia-linear-gradient2)"
              d="M701.2,406.8v-.7h-100.8c-6.2,0-11.8-2.5-15.8-6.6-4-4.1-6.5-9.6-6.5-15.8v-100.9c0-6.2,2.5-11.8,6.5-15.8,4-4,9.6-6.6,15.8-6.6h100.8c6.2,0,11.8,2.5,15.8,6.6,4,4.1,6.5,9.6,6.5,15.8v100.9c0,6.2-2.5,11.8-6.5,15.8-4,4-9.6,6.6-15.8,6.6v1.3c13.1,0,23.7-10.6,23.7-23.7v-100.9c0-13.1-10.6-23.7-23.7-23.7h-100.8c-13.1,0-23.7,10.6-23.7,23.7v100.9c0,13.1,10.6,23.7,23.7,23.7h100.8v-.7Z"
            />
          </g>

          {/* Left Eye - No CSS transitions for instant response */}
          <rect
            x={612 + eyePosition.x}
            y={295 + eyePosition.y}
            width="12"
            height="30"
            rx="6"
            ry="6"
            fill="#1a1a1a"
          />

          {/* Right Eye - No CSS transitions for instant response */}
          <rect
            x={670 + eyePosition.x}
            y={295 + eyePosition.y}
            width="12"
            height="30"
            rx="6"
            ry="6"
            fill="#1a1a1a"
          />
        </svg>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
      </div>
    </div>
  );

  // If standalone, wrap in section with padding; otherwise return just the content
  if (standalone) {
    return (
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">{content}</div>
      </section>
    );
  }

  return content;
}

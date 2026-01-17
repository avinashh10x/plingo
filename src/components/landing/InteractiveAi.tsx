"use client";

import React, { useState, useEffect, useRef } from "react";

export default function InteractiveAi() {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate angle and distance from center to cursor
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), 15); // Max 15px movement

      // Calculate eye position
      const eyeX = Math.cos(angle) * distance;
      const eyeY = Math.sin(angle) * distance;

      setEyePosition({ x: eyeX, y: eyeY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligent content generation that follows your every move
          </p>
        </div>

        {/* Interactive Mascot */}
        <div
          ref={containerRef}
          className="relative flex items-center justify-center"
        >
          {/* SVG Container with Eyes */}
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Plingo Mascot SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1292.9 653.6"
              className="w-full h-full"
            >
              <defs>
                <linearGradient
                  id="linear-gradient"
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
                  id="linear-gradient1"
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
                  id="linear-gradient2"
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
                  fill="url(#linear-gradient)"
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
                  fill="url(#linear-gradient1)"
                  d="M701.2,406.8h-100.8c-12.7,0-23-10.3-23-23v-100.9c0-12.7,10.3-23,23-23h100.8c12.7,0,23,10.3,23,23v100.9c0,12.7-10.3,23-23,23Z"
                />
              </g>
              <g id="Layer_2">
                <path
                  fill="url(#linear-gradient2)"
                  d="M701.2,406.8v-.7h-100.8c-6.2,0-11.8-2.5-15.8-6.6-4-4.1-6.5-9.6-6.5-15.8v-100.9c0-6.2,2.5-11.8,6.5-15.8,4-4,9.6-6.6,15.8-6.6h100.8c6.2,0,11.8,2.5,15.8,6.6,4,4.1,6.5,9.6,6.5,15.8v100.9c0,6.2-2.5,11.8-6.5,15.8-4,4-9.6,6.6-15.8,6.6v1.3c13.1,0,23.7-10.6,23.7-23.7v-100.9c0-13.1-10.6-23.7-23.7-23.7h-100.8c-13.1,0-23.7,10.6-23.7,23.7v100.9c0,13.1,10.6,23.7,23.7,23.7h100.8v-.7Z"
                />
              </g>

              {/* Left Eye */}
              <g className="transition-transform duration-100 ease-out">
                {/* Eye White */}
                <ellipse
                  cx="620"
                  cy="310"
                  rx="20"
                  ry="25"
                  fill="white"
                  opacity="0.95"
                />
                {/* Pupil */}
                <circle
                  cx={620 + eyePosition.x}
                  cy={310 + eyePosition.y}
                  r="8"
                  fill="#1a1a1a"
                />
                {/* Highlight */}
                <circle
                  cx={622 + eyePosition.x}
                  cy={308 + eyePosition.y}
                  r="3"
                  fill="white"
                  opacity="0.8"
                />
              </g>

              {/* Right Eye */}
              <g className="transition-transform duration-100 ease-out">
                {/* Eye White */}
                <ellipse
                  cx="670"
                  cy="310"
                  rx="20"
                  ry="25"
                  fill="white"
                  opacity="0.95"
                />
                {/* Pupil */}
                <circle
                  cx={670 + eyePosition.x}
                  cy={310 + eyePosition.y}
                  r="8"
                  fill="#1a1a1a"
                />
                {/* Highlight */}
                <circle
                  cx={672 + eyePosition.x}
                  cy={308 + eyePosition.y}
                  r="3"
                  fill="white"
                  opacity="0.8"
                />
              </g>
            </svg>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
          </div>
        </div>

        {/* Feature Cards Below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <h3 className="font-semibold mb-2">Smart Detection</h3>
            <p className="text-sm text-muted-foreground">
              Watches your every move to provide contextual assistance
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <h3 className="font-semibold mb-2">Adaptive Learning</h3>
            <p className="text-sm text-muted-foreground">
              Learns from your behavior to improve suggestions
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <h3 className="font-semibold mb-2">Real-time Response</h3>
            <p className="text-sm text-muted-foreground">
              Instant reactions to your interactions and inputs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

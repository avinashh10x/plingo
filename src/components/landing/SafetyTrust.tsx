"use client";
import { Lock, Shield, Eye, Check } from "lucide-react";
import { useEffect, useRef } from "react";

const TRUST_ITEMS = [
  { label: "OAuth-based security", icon: Lock },
  { label: "No password storage", icon: Check },
  { label: "No auto-posting", icon: Shield },
  { label: "No data reselling", icon: Shield },
  { label: "Full user control", icon: Eye },
  { label: "Industry-standard encryption", icon: Lock },
];

export const SafetyTrust = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const directionRef = useRef(1); // 1 = left, -1 = right
  const lastScrollY = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get half width for seamless loop
    const halfWidth = container.scrollWidth / 2;

    // Handle scroll direction
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (delta > 0) {
        directionRef.current = 1; // Scrolling down → go left
      } else if (delta < 0) {
        directionRef.current = -1; // Scrolling up → go right
      }

      lastScrollY.current = currentScrollY;
    };

    // Animation loop
    const animate = () => {
      // Move based on direction (speed: ~0.5px per frame)
      positionRef.current += directionRef.current * 0.5;

      // Loop seamlessly
      if (positionRef.current >= halfWidth) {
        positionRef.current = 0;
      } else if (positionRef.current <= 0) {
        positionRef.current = halfWidth;
      }

      // Apply transform
      container.style.transform = `translateX(-${positionRef.current}px)`;

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="border-y border-border/40 bg-muted/20 px-6 py-8 md:my-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative w-full overflow-hidden">
          {/* Marquee container */}
          <div ref={containerRef} className="flex will-change-transform">
            {/* First set */}
            <div className="flex shrink-0 gap-8 px-4">
              {TRUST_ITEMS.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap text-foreground/50 hover:text-foreground transition-colors duration-300">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex shrink-0 gap-8 px-4">
              {TRUST_ITEMS.map(({ label, icon: Icon }) => (
                <div
                  key={`${label}-dup`}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

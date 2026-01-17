"use client";

import { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTitle } from "@/components/ui/section-title";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Is this allowed by X / LinkedIn?",
    a: "Yes. We use the official API for all platforms. Your account is safe and we strictly follow their terms of service.",
  },
  {
    q: "Will my account get banned?",
    a: "No. Since we use official APIs and do not support spammy behavior (like auto-DMing or aggressive follow/unfollow), your account is safe.",
  },
  {
    q: "Can I disconnect anytime?",
    a: "Absolutely. You can revoke access from your dashboard or from the social media platform settings at any time.",
  },
  {
    q: "Is AI optional?",
    a: "Yes! You can write 100% of your posts manually. The AI is there only when you need inspiration or help rephrasing.",
  },
  {
    q: "What happens if a post fails?",
    a: "You will be notified immediately, and the post will move to a 'Failed' state so you can retry or edit it.",
  },
];

// Easy size control - change these values to adjust mascot size
// Using viewport height for responsive sizing
const MASCOT_SIZE = {
  width: "auto", // Auto width to maintain aspect ratio
  height: "50vh", // 50% of viewport height - change this value to adjust size
};

export const FAQ = () => {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth eye tracking with RAF for 60fps performance
  useEffect(() => {
    let isAnimating = false;

    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      setEyePosition((prev) => {
        const dx = targetRef.current.x - prev.x;
        const dy = targetRef.current.y - prev.y;
        // Smooth interpolation (lerp) - 0.15 gives nice smooth feel
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          isAnimating = false;
          return targetRef.current;
        }
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      if (isAnimating) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const resetToCenter = () => {
      targetRef.current = { x: 0, y: 0 };
      startAnimation();
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      // Return to center after 1.5s of no mouse movement
      idleTimerRef.current = setTimeout(resetToCenter, 1500);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      // Reset idle timer on mouse move
      resetIdleTimer();

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Calculate direction and clamp movement to max 10px (keeps eyes in face)
      const maxMove = 10;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const scale =
        distance > 0 ? Math.min(maxMove / distance, maxMove / 100) : 0;

      targetRef.current = {
        x: deltaX * scale,
        y: deltaY * scale,
      };

      startAnimation();
    };

    // Reset eyes to center when scrolling
    const handleScroll = () => {
      resetToCenter();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  // Click handler for blink animation
  useEffect(() => {
    const handleClick = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <section className="py-20 px-6 border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <SectionTitle
          badge="FAQ"
          badgeIcon={<HelpCircle className="w-4 h-4 text-primary" />}
          title="Got Questions?"
          highlightedText="We've Got Answers"
          description="Everything you need to know about Plingo"
        />

        {/* Content Grid */}
        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Mascot */}
          <div className="flex items-center justify-center lg:justify-start flex-col">
            <p className="text-sm text-muted-foreground tracking-wide select-none">
              Hmm… got some questions?
            </p>

            <div
              ref={containerRef}
              className="relative aspect-square"
              style={{
                width: MASCOT_SIZE.width,
                height: MASCOT_SIZE.height,
              }}
            >
              {/* Box SVG */}
              <div className="absolute inset-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="540 230 200 200"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient
                      id="faq-linear-gradient"
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
                      id="faq-linear-gradient1"
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
                      id="faq-linear-gradient2"
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
                      fill="url(#faq-linear-gradient)"
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
                      fill="url(#faq-linear-gradient1)"
                      d="M701.2,406.8h-100.8c-12.7,0-23-10.3-23-23v-100.9c0-12.7,10.3-23,23-23h100.8c12.7,0,23,10.3,23,23v100.9c0,12.7-10.3,23-23,23Z"
                    />
                  </g>
                  <g id="Layer_2">
                    <path
                      fill="url(#faq-linear-gradient2)"
                      d="M701.2,406.8v-.7h-100.8c-6.2,0-11.8-2.5-15.8-6.6-4-4.1-6.5-9.6-6.5-15.8v-100.9c0-6.2,2.5-11.8,6.5-15.8,4-4,9.6-6.6,15.8-6.6h100.8c6.2,0,11.8,2.5,15.8,6.6,4,4.1,6.5,9.6,6.5,15.8v100.9c0,6.2-2.5,11.8-6.5,15.8-4,4-9.6,6.6-15.8,6.6v1.3c13.1,0,23.7-10.6,23.7-23.7v-100.9c0-13.1-10.6-23.7-23.7-23.7h-100.8c-13.1,0-23.7,10.6-23.7,23.7v100.9c0,13.1,10.6,23.7,23.7,23.7h100.8v-.7Z"
                    />
                  </g>
                </svg>
              </div>

              {/* Eyes Layer - Positioned on top */}
              <div className="absolute inset-0 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="540 230 200 200"
                  className="w-full h-full"
                >
                  {/* Left Eye */}
                  <rect
                    x={612 + eyePosition.x}
                    y={isBlinking ? 308 : 295 + eyePosition.y}
                    width="12"
                    height={isBlinking ? 3 : 30}
                    rx="6"
                    ry="6"
                    fill="#1a1a1a"
                  />

                  {/* Right Eye */}
                  <rect
                    x={670 + eyePosition.x}
                    y={isBlinking ? 308 : 295 + eyePosition.y}
                    width="12"
                    height={isBlinking ? 3 : 30}
                    rx="6"
                    ry="6"
                    fill="#1a1a1a"
                  />
                </svg>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
            </div>
          </div>

          {/* Right: FAQ Accordion */}
          <div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-6 bg-card hover:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Still have questions? */}
            <div className="mt-8 p-6 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Still have questions?
              </p>
              <a
                href="mailto:support@plingo.app"
                className="text-sm font-medium text-primary hover:underline"
              >
                Contact our support team →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

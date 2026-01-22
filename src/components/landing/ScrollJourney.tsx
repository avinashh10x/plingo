"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Instagram,
  Sparkles,
  Wallet,
  Calendar,
  LayoutDashboard,
  CheckCircle2,
  Zap,
  TrendingUp,
  Waypoints,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionTitle } from "../ui/section-title";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

type Step = {
  id: number;
  badge: string;
  title: string;
  description: string;
  visual: "platforms" | "ai" | "credits" | "calendar" | "dashboard";
  highlights?: string[];
};

const steps: Step[] = [
  {
    id: 1,
    badge: "Integration",
    title: "Unified Platform Connectivity",
    description:
      "Seamlessly integrate all your social media accounts into a single, centralized workspace. Enterprise-grade OAuth authentication ensures secure connections.",
    visual: "platforms",
    highlights: [
      "Multi-platform support",
      "Secure authentication",
      "Real-time sync",
    ],
  },
  {
    id: 2,
    badge: "AI-Powered",
    title: "Intelligent Content Generation",
    description:
      "Leverage advanced AI to create compelling, on-brand content at scale. Generate individual posts or schedule bulk campaigns with intelligent automation.",
    visual: "ai",
    highlights: ["Bulk scheduling", "Brand consistency", "Smart suggestions"],
  },
  {
    id: 3,
    badge: "Usage Management",
    title: "Transparent Credit System",
    description:
      "Track resource consumption with real-time credit monitoring. Platform-specific pricing ensures predictable costs and optimal budget allocation.",
    visual: "credits",
    highlights: ["Real-time tracking", "Usage analytics", "Flexible plans"],
  },
  {
    id: 4,
    badge: "Planning",
    title: "Strategic Content Calendar",
    description:
      "Visualize your entire content pipeline with an intuitive calendar interface. Manage drafts, schedule posts, and maintain a comprehensive content library.",
    visual: "calendar",
    highlights: ["Visual planning", "Draft management", "Content library"],
  },
  {
    id: 5,
    badge: "Control Center",
    title: "Centralized Command Dashboard",
    description:
      "Monitor all platform activities from a unified control panel. Manage notifications, configure settings, and oversee your entire social media operation.",
    visual: "dashboard",
    highlights: ["Unified control", "Analytics hub", "Team management"],
  },
];

function VisualBox({ type }: { type: Step["visual"] }) {
  switch (type) {
    case "platforms":
      return (
        <div className="flex gap-4 border rounded-lg overflow-hidden">
          <img
            src="./journey/j1.webp"
            alt="Unified Platform Connectivity Dashboard"
            loading="lazy"
            className="w-full h-full object-cover rounded-lg scale-105 hover:scale-100 transition-all duration-500 ease-out"
          />
        </div>
      );

    case "ai":
      return (
        <div className="flex gap-4 border rounded-lg overflow-hidden">
          <img
            src="./journey/j2.webp"
            alt="AI Content Generation Interface"
            loading="lazy"
            className="w-full h-full object-cover rounded-lg scale-105 hover:scale-100 transition-all duration-500 ease-out"
          />
        </div>
      );

    case "credits":
      return (
        <div className="flex gap-4 border rounded-lg overflow-hidden">
          <img
            src="./journey/j3.webp"
            alt="Credit Usage Tracking System"
            loading="lazy"
            className="w-full h-full object-cover rounded-lg scale-105 hover:scale-100 transition-all duration-500 ease-out"
          />
        </div>
      );

    case "calendar":
      return (
        <div className="flex gap-4 border rounded-lg overflow-hidden">
          <img
            src="./journey/j4b.avif"
            alt="Content Calendar View"
            loading="lazy"
            className="w-full h-full object-cover rounded-lg scale-105 hover:scale-100 transition-all duration-500 ease-out"
          />
        </div>
      );

    case "dashboard":
      return (
        <div className="flex gap-4 border rounded-lg overflow-hidden">
          <img
            src="./journey/j5.webp"
            alt="Centralized Command Dashboard"
            loading="lazy"
            className="w-full h-full object-cover rounded-lg scale-105 hover:scale-100 transition-all duration-500 ease-out"
          />
        </div>
      );
  }
}

export default function JourneySection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const firstStepRef = useRef<HTMLDivElement>(null);
  const lastStepRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!lineRef.current || !firstStepRef.current || !lastStepRef.current)
      return;

    // Create the scroll-triggered animations
    const ctx = gsap.context(() => {
      // Animate the progress line
      gsap.fromTo(
        lineRef.current,
        {
          scaleY: 0,
          transformOrigin: "top center",
        },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: firstStepRef.current,
            endTrigger: lastStepRef.current,
            start: "center center",
            end: "center center",
            scrub: 1,
          },
        },
      );

      // Animate each circle when the line reaches it
      circleRefs.current.forEach((circle, index) => {
        if (!circle) return;

        const numberSpan = circle.querySelector("span");
        if (!numberSpan) return;

        // Get computed color values from CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue("--primary").trim();
        const mutedForegroundColor = computedStyle
          .getPropertyValue("--muted-foreground")
          .trim();
        const mutedColor = computedStyle.getPropertyValue("--muted").trim();
        const backgroundColor = computedStyle
          .getPropertyValue("--background")
          .trim();

        // Convert HSL values to proper color strings
        const primaryHSL = `hsl(${primaryColor})`;
        const mutedForegroundHSL = `hsl(${mutedForegroundColor})`;
        const mutedHSL = `hsl(${mutedColor})`;
        const backgroundHSL = `hsl(${backgroundColor})`;

        // Animate the circle container (border, background, elevation, shadow)
        gsap.fromTo(
          circle,
          {
            borderColor: mutedForegroundHSL,
            backgroundColor: mutedHSL,
            borderWidth: "2px",
            opacity: 1,
            y: 0,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          },
          {
            borderColor: primaryHSL,
            backgroundColor: backgroundHSL,
            borderWidth: "3px",
            opacity: 1,
            y: -8,
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)",
            ease: "none",
            scrollTrigger: {
              trigger: circle,
              start: "bottom center",
              end: "center center",
              scrub: 0.5,
              toggleActions: "play none none reverse",
            },
          },
        );

        // Animate the number text color
        gsap.fromTo(
          numberSpan,
          {
            color: mutedForegroundHSL,
            opacity: 1,
          },
          {
            color: primaryHSL,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: circle,
              start: "bottom center",
              end: "center center",
              scrub: 0.5,
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-24 px-6">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center !mb-10">
        <SectionTitle
          badgeIcon={<Waypoints className="w-4 h-4 text-primary" />}
          badge="Platform Workflow"
          highlightedText="Five Steps"
          title="Start Scheduling in"
          description="A streamlined workflow designed for modern teams. Get up and running in minutes, scale effortlessly as you grow."
        />
      </div>

      {/* Journey Steps */}
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-[25vh] relative">
        {/* Animated Progress Line - Hidden on mobile */}
        <div
          ref={lineRef}
          className="hidden md:block h-[340vh] w-0.5 bg-gradient-to-b from-primary via-primary to-primary/50 absolute top-[7%] left-1/2 -translate-x-1/2"
        />
        {steps.map((step, index) => {
          const isEven = index % 2 === 1;
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              ref={isFirst ? firstStepRef : isLast ? lastStepRef : null}
              className="grid grid-cols-1 md:grid-cols-[1fr_100px_1fr] gap-8 md:gap-0 items-center min-h-[60vh]"
            >
              {/* Content Side */}
              <div
                className={`${isEven ? "md:order-3" : "md:order-1"} ${
                  isEven ? "md:pl-8" : "md:pr-8"
                }`}
              >
                <div className="max-w-full md:max-w-md space-y-5">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {step.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                    {step.description}
                  </p>

                  {/* Highlights */}
                  {/* {step.highlights && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {step.highlights.map((highlight, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-foreground">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}  */}
                </div>
              </div>

              {/* Center Timeline - Hidden on mobile */}
              <div className="hidden md:flex order-2 flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Step Number Circle */}
                  <div
                    ref={(el) => (circleRefs.current[index] = el)}
                    className="relative w-12 h-12 rounded-full border-2 border-muted-foreground/30 bg-background flex items-center justify-center font-bold text-lg transition-all duration-300"
                  >
                    <span className="relative text-muted-foreground">
                      {step.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Side */}
              <motion.div
                initial={{ opacity: 0.2, x: isEven ? -90 : 90 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ amount: 0.2, once: true }}
                className={`${
                  isEven
                    ? "md:order-1 md:flex md:justify-start"
                    : "md:order-3 md:flex md:justify-end"
                }`}
              >
                <div className="w-full max-w-full md:max-w-md h-56 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <VisualBox type={step.visual} />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

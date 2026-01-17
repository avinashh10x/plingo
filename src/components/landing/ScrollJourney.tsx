"use client";

import React, { useEffect, useRef } from "react";
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
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
        <div className="flex gap-4">
          {[
            { Icon: Twitter, color: "from-blue-500 to-blue-600" },
            { Icon: Linkedin, color: "from-blue-600 to-blue-700" },
            { Icon: Instagram, color: "from-pink-500 to-purple-600" },
          ].map(({ Icon, color }, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200`}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
          ))}
        </div>
      );

    case "ai":
      return (
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Engine Active
            </span>
          </div>
        </div>
      );

    case "credits":
      return (
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-lg opacity-30" />
            <Wallet className="w-10 h-10 mx-auto text-emerald-500 relative" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              250
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Available Credits
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-emerald-500">
            <TrendingUp className="w-3 h-3" />
            <span>Active Plan</span>
          </div>
        </div>
      );

    case "calendar":
      return (
        <div className="space-y-3">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto" />
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded ${
                  [2, 5, 9, 14, 18].includes(i)
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
                    : "bg-muted/50"
                }`}
              />
            ))}
          </div>
        </div>
      );

    case "dashboard":
      return (
        <div className="space-y-3 w-full px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-indigo-500" />
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-2.5 bg-gradient-to-r from-muted to-muted/50 rounded-full w-full" />
            <div className="h-2.5 bg-gradient-to-r from-muted to-muted/50 rounded-full w-4/5" />
            <div className="h-2.5 bg-gradient-to-r from-muted to-muted/50 rounded-full w-3/5" />
          </div>
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
        }
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
          }
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
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-24 px-6">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-32">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 ">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Platform Workflow
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          From Setup to Success in{" "}
          <span className="text-foreground bg-clip-text ">Five Steps</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A streamlined workflow designed for modern teams. Get up and running
          in minutes, scale effortlessly as you grow.
        </p>
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
              className="grid grid-cols-1 md:grid-cols-[1fr_100px_1fr] gap-8 md:gap-0 items-center min-h-[40vh] md:min-h-[60vh]"
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
                    className="relative w-12 h-12 rounded-full border-2 border-muted-foreground/30 bg-muted/50 flex items-center justify-center font-bold text-lg transition-all duration-300"
                  >
                    <span className="relative text-muted-foreground">
                      {step.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Side */}
              <div
                className={`${
                  isEven
                    ? "md:order-1 md:flex md:justify-start"
                    : "md:order-3 md:flex md:justify-end"
                }`}
              >
                <div className="w-full max-w-full md:max-w-md h-56 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <VisualBox type={step.visual} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import Title from "../shared/title";
import {
  PenTool,
  Calendar,
  BarChart3,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { SectionTitle } from "../ui/section-title";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] },
  },
};

const steps = [
  {
    icon: PenTool,
    title: "Create Content",
    description:
      "Generate high-quality posts using AI. Write once and adapt seamlessly across platforms.",
    features: ["AI-assisted writing", "Cross-platform formatting"],
  },
  {
    icon: Calendar,
    title: "Schedule & Automate",
    description:
      "Plan and schedule content in advance. Automate publishing with full control.",
    features: ["Bulk scheduling", "Multi-account support"],
  },
  {
    icon: BarChart3,
    title: "Manage & Organize",
    description:
      "Centralize drafts, scheduled posts, and published content in one place.",
    features: ["Calendar overview", "Content library"],
  },
];

function How1() {
  return (
    <section id="how-it-works" className="w-full z-20 py-20 px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-24">
        <SectionTitle
          badgeIcon={<PenTool className="w-4 h-4 text-primary" />}
          badge="How it works"
          highlightedText="workflow easier"
          title="Makes Your "
          description="From content creation to performance tracking, we've streamlined every step of your social media management."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={index}
                variants={cardVariant}
                className="group relative"
              >
                <div className="h-full group rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center justify-between">
                    {/* Icon */}
                    <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-background/50">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Step index (subtle, not decorative) */}
                    <div className="mb-6 text-6xl font-extrabold text-muted-foreground/10 tracking-widest uppercase group-hover:text-primary transition-all duration-300">
                      {index + 1}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold tracking-tight mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default How1;

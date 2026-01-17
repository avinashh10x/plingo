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
      "Use AI to generate engaging posts in seconds. Write once, adapt for all platforms automatically.",
    features: [
      { icon: Sparkles, text: "AI-powered writing" },
      { icon: Zap, text: "Multi-platform formatting" },
    ],
    gradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500",
  },
  {
    icon: Calendar,
    title: "Schedule & Automate",
    description:
      "Plan your content calendar weeks ahead. Set it and forget it with smart scheduling across all platforms.",
    features: [
      { icon: Clock, text: "Bulk scheduling" },
      { icon: Users, text: "Multi-account support" },
    ],
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500",
  },
  {
    icon: BarChart3,
    title: "Manage & Organize",
    description:
      "Keep all your content in one place. View your calendar, manage drafts, and access your content library anytime.",
    features: [
      { icon: Calendar, text: "Calendar view" },
      { icon: BarChart3, text: "Content library" },
    ],
    gradient: "from-green-500/20 to-emerald-500/20",
    iconBg: "bg-green-500",
  },
];

function How1() {
  return (
    <section className="w-full py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Title
          preTitle="How it works"
          title="How our platform makes your workflow easier"
          subTitle="From content creation to performance tracking, we've streamlined every step of your social media management."
          className="text-center mb-16"
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
                {/* Card */}
                <div
                  className={`relative h-full p-8 rounded-2xl border border-border/50 bg-gradient-to-br ${step.gradient} backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-xl hover:shadow-${step.iconBg}/10`}
                >
                  {/* Step Number */}
                  <div className="absolute top-4 right-4 text-5xl font-bold text-muted-foreground/10">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-full ${step.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3">
                    {step.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                            <FeatureIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="text-muted-foreground">
                            {feature.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Decorative gradient orb */}
                  <div
                    className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${step.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Ready to streamline your social media workflow?
          </p>
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity">
            Get Started Free
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default How1;

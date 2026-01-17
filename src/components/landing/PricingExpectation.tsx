"use client";
import { Check, Gift, ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const list = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};
const listItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const features = [
  {
    title: "AI Content Generation",
    desc: "Create posts with AI assistance",
  },
  {
    title: "Multi-Platform Scheduling",
    desc: "Twitter, LinkedIn, Instagram & more",
  },
  {
    title: "Unlimited Drafts",
    desc: "Save and organize your content",
  },
  {
    title: "Calendar View",
    desc: "Plan your content strategy",
  },
  {
    title: "Analytics Dashboard",
    desc: "Track your performance",
  },
  {
    title: "Email Support",
    desc: "Get help when you need it",
  },
];

export const PricingExpectation = () => {
  return (
    <section className="py-20 px-6 my-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <SectionTitle
          badge="Pricing"
          badgeIcon={<Gift className="w-4 h-4 text-primary" />}
          title="Start Free,"
          highlightedText="Scale Anytime"
          description="Get 100 free credits every month. No credit card required to start."
        />

        {/* Pricing Content */}
        <div className="mt-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Header */}
            <div className="p-8 md:p-10 border-b border-border bg-muted/20 rounded-t-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold mb-3">
                    FREE FOREVER
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">100</span>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-medium">credits / </div>
                      <div className="text-sm text-muted-foreground">
                        per month
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically renews every month • No expiration
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link to="/dashboard">
                    <button className="group w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Features */}
            {/* Features */}
            <div className="p-8 md:p-10 bg-muted/20">
              <h3 className="font-semibold mb-5 text-lg">What's included:</h3>

              <motion.div
                variants={list}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-4 "
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    variants={listItem}
                    className="flex gap-3"
                  >
                    <div className="mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm">{feature.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {feature.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="px-8 md:px-10 py-4 bg-muted/30 border-t border-border rounded-b-lg">
              <p className="text-sm text-muted-foreground text-center">
                Need more?{" "}
                <span className="text-foreground font-medium">
                  Custom plans coming soon
                </span>{" "}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

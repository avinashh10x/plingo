"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";
import { GeneratedPost } from "@/components/ai/chat/types";
import { GeneratedPostCard } from "@/components/ai/chat/GeneratedPostCard";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/section-title";
import { HelpCircle } from "lucide-react";
import InteractiveAi from "./InteractiveAi";
import { AnimatePresence } from "framer-motion";

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

export const FAQ = () => {
  return (
    <section className="py-12 md:py-20 px-6 border-t border-border/40 overflow-hidden">
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
        <div className="mt-10 md:mt-16 grid lg:grid-cols-2 gap-8 md:gap-12 items-center ">
          {/* Left: Interactive Mascot - Hidden on mobile for better UX */}
          <div className="hidden md:flex items-center justify-center lg:justify-start flex-col relative border bg-[url('./journey/bg.png')] bg-cover bg-center h-full rounded-xl">
            <p className="text-lg text-muted-foreground tracking-wide  font-sentient select-none absolute top-[20%]">
              Hmm… got some questions?
            </p>
            {/* Use InteractiveAi component which has animated background */}
            <AnimatePresence mode="wait">
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-8"
              >
                <div className="p-3 rounded-xl absolute w-[100%] top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* <Sparkles className="h-6 w-6 text-primary" /> */}
                  <InteractiveAi size="h-[20vh] w-[20vh]" standalone={false} />
                </div>
              </motion.div>
            </AnimatePresence>
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
                href="mailto:thissideavinash@gmail.com"
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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section className="py-24 px-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Common Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

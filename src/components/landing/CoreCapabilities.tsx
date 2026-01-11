import { motion } from "framer-motion";
import { Share2, Bot, CalendarDays, ShieldCheck, Gauge } from "lucide-react";

const capabilities = [
  {
    icon: Share2,
    text: "One-click cross-platform posting",
  },
  {
    icon: Bot,
    text: "AI post generation (not just scheduling)",
  },
  {
    icon: CalendarDays,
    text: "Unified content calendar",
  },
  {
    icon: ShieldCheck,
    text: "Account-level safety controls",
  },
  {
    icon: Gauge,
    text: "Usage limits that scale with you",
  },
];

export const CoreCapabilities = () => {
  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-16">
          Why creators choose Plingo
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((cap, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-4 p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center shadow-lg">
                <cap.icon className="w-8 h-8 text-foreground" />
              </div>
              <p className="font-medium text-lg">{cap.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

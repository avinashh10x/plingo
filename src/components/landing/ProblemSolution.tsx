import { motion } from "framer-motion";
import { XCircle, CheckCircle } from "lucide-react";

export const ProblemSolution = () => {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Problem Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-destructive/80">
              The Reality (Pain)
            </h3>
            <ul className="space-y-4">
              {[
                "Writing takes too much time",
                "Every platform format is different",
                "Scheduling is fragmented",
                "Consistency breaks easily",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-muted-foreground/80"
                >
                  <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-card border border-border shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <h3 className="text-2xl font-bold text-primary mb-8 relative z-10">
              The Plingo Way
            </h3>
            <ul className="space-y-6 relative z-10">
              {[
                "One click, publish to all platforms",
                "AI helps you write faster",
                "One calendar, full control",
                "No tool switching required",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

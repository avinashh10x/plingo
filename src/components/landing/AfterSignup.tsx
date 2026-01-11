import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Connect accounts",
    desc: "Link your X, LinkedIn, or Threads accounts securely.",
  },
  {
    num: "02",
    title: "Create content",
    desc: "Write your post manually or let AI draft it for you.",
  },
  {
    num: "03",
    title: "Schedule or Post",
    desc: "Publish instantly or pick the perfect time later.",
  },
  {
    num: "04",
    title: "Track Growth",
    desc: "See everything from one unified calendar.",
  },
];

export const AfterSignup = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What happens after you sign up?
          </h2>
          <p className="text-muted-foreground">
            Get started in less than 2 minutes.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-6 p-6 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors border border-transparent hover:border-border/50"
            >
              <span className="text-4xl font-bold text-muted-foreground/20">
                {step.num}
              </span>
              <div>
                <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

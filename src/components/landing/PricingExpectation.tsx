import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const PricingExpectation = () => {
  return (
    <section className="py-24 px-6 bg-muted/10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          Simple, transparent pricing
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg">Free plan available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg">Upgrade as you grow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg">No credit card required</span>
          </div>
        </div>

        <p className="text-muted-foreground">
          Start for free. We only make money when you get value.
        </p>
      </div>
    </section>
  );
};

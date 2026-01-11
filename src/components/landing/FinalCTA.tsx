import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const FinalCTA = () => {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Start scheduling smarter
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Free to start • Cancel anytime
          </p>

          <Link to="/dashboard">
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto gap-3 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

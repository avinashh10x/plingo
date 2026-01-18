import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "../ui/section-title";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden h-screen flex flex-col items-center justify-end">
      <div className="h-full w-full absolute top-0 left-0">
        {/* vertical bars */}
        <div className="z-1 flex items-center justify-between gap-10 absolute h-full w-full bg-background top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* bars */}
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[15%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[20%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[20%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[15%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-foreground/10 border border-foreground/20" />

          {/* fade */}
          <div className=" absolute w-[40%] top-0 left-0 h-full bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className=" absolute w-[40%] top-0 right-0 h-full bg-gradient-to-l from-background via-background/80 to-transparent" />
        </div>
        {/* curve */}
        <div className="z-5 aspect-square w-[95%] border-[2px] border-white [box-shadow:0px_0px_70px_5px_hsl(var(--primary)),inset_0px_2px_70px_20px_hsl(var(--primary))]  absolute translate-y-1/2 translate-x-1/2 rounded-full lg:-top-[35vw] md:-top-[30vw] top-[20vw]  right-1/2 bg-background " />

        {/* fading the curve */}
        <div className="z-11 w-full h-[90%] bg-gradient-to-t from-background via-background/80 to-transparent absolute bottom-0 left-0" />
        <div className="z-12 w-full h-[80%] bg-gradient-to-t from-background via-background/80 to-transparent absolute bottom-0 left-0" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10 max-sm:mb-[15vh] max-xs:mb-[10vh] mb-[8vw]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div>
            <div
              className={
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 center"
              }
            >
              <span className="text-xs font-medium text-primary">
                Introducing · Plingo AI 2.0
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 px-6">
              Smarter Content Scheduling <br />
              <span className="text-primary">Powered by AI</span>
            </h1>

            <p className="text-sm text-muted-foreground/50 max-w-2xl mx-auto md:hidden px-6">
              From ideas to published posts — Plingo helps you plan, write, and
              schedule content faster, without the noise.
            </p>
            <p className="text-sm text-muted-foreground/50 max-w-2xl mx-auto max-md:hidden px-6">
              From ideas to published posts — Plingo helps you plan, write, and
              schedule content faster, without the noise.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 ">
            {/* Primary CTA */}
            <Link to="/dashboard" className="w-full md:w-auto">
              <motion.div
                className="w-full md:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-base font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                >
                  Get Started
                </Button>
              </motion.div>
            </Link>

            {/* Secondary CTA */}
            <a href="#how-it-works" className="w-full md:w-auto">
              <motion.div
                className="w-full md:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto rounded-full px-8 h-12 text-base border-primary/30 text-foreground hover:bg-primary/10 backdrop-blur-sm"
                >
                  {/* <Sparkles className="h-4 w-4 mr-2" /> */}
                  How it Works
                </Button>
              </motion.div>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

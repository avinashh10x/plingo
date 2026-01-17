import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden h-screen flex flex-col items-center justify-end">
      <div className="h-full w-full absolute top-0 left-0">
        {/* vertical bars */}
        <div className="z-1 flex items-center justify-between gap-10 absolute h-full w-full bg-background top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* bars */}
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-primary/10 border border-foreground/20" />
          <div className="w-[10%] h-full bg-foreground/10 border border-foreground/20" />

          {/* fade */}
          <div className=" absolute w-[40%] top-0 left-0 h-full bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className=" absolute w-[40%] top-0 right-0 h-full bg-gradient-to-l from-background via-background/80 to-transparent" />
        </div>
        {/* curve */}
        <div className="z-2 aspect-square w-[90%] border-[2px] border-white [box-shadow:0px_0px_20px_5px_hsl(var(--primary)),inset_0px_2px_40px_20px_hsl(var(--primary))]  absolute translate-y-1/2 translate-x-1/2 rounded-full -top-[5%] md:-top-[20%] lg:-top-[65%] right-1/2 bg-background" />

        {/* fading the curve */}
        <div className="z-11 w-full h-[90%] bg-gradient-to-t from-background via-background/80 to-transparent absolute bottom-0 left-0" />
        <div className="z-12 w-full h-[80%] bg-gradient-to-t from-background via-background/80 to-transparent absolute bottom-0 left-0" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
            {/* <Sparkles className="h-3.5 w-3.5 fill-primary/20" /> */}
            <span>Introducing · Plingo AI 2.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Build Smarter Content
            <br />
            Schedules With AI
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            An AI-powered scheduler that helps you <br />
            plan, write, and publish content faster without clutter.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-base font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
                >
                  Get Started
                </Button>
              </motion.div>
            </Link>

            <Link to="/demo">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 text-base border-primary/30 text-foreground hover:bg-primary/10 hover:text-foreground backdrop-blur-sm"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Watch Demo
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

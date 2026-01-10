import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import {
  AnimatedTwitterIcon,
  AnimatedLinkedInIcon,
  AnimatedInstagramIcon,
} from "@/components/ui/animated-icon";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { Hero } from "@/components/layout/Hero";

const Index = () => {
  const { toggleTheme } = useAppStore();

  // Force dark mode on mount for landing page aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
    // Optional: revert on unmount if needed, but user wants default dark
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Plan and schedule your posts up to a month in advance with our intuitive calendar.",
    },
    {
      icon: Zap,
      title: "Multi-Platform",
      description:
        "Connect Twitter, LinkedIn, and more. Publish everywhere from one dashboard.",
    },
    {
      icon: Sparkles,
      title: "AI Assistant",
      description:
        "Generate engaging content ideas with our built-in AI writing assistant.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description:
        "Track performance and optimize your content strategy with insights.",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      <LandingHeader />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Dashboard Preview */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />
              <div className="p-2 bg-muted border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground">
                  plingo.app/dashboard
                </div>
              </div>
              <div className="h-[400px] bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Calendar className="h-20 w-20 text-primary/30 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-muted-foreground">
                    VS Code-inspired Dashboard
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything you need to manage social media
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A powerful toolkit designed for creators, marketers, and teams.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <feature.icon className="h-6 w-6" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Ready to level up your social game?
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                Join thousands of creators using Plingo to grow their audience.
              </p>
              <Link to="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="gap-2 text-lg px-10 py-6">
                    Start Scheduling Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                P
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              © 2024 Plingo. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

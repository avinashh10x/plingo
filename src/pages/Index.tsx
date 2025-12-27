import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  BarChart3,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import {
  AnimatedTwitterIcon,
  AnimatedLinkedInIcon,
  AnimatedInstagramIcon,
} from "@/components/ui/animated-icon";
import { iconVariants } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { theme, toggleTheme } = useAppStore();
  const { profile, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  <img src="/logo2.png" alt="Plingo Logo" />
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">Plingo</span>
            </motion.div>
          </a>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div whileHover="hover" whileTap="tap" initial="initial">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8"
              >
                <motion.div
                  variants={iconVariants}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </motion.div>
              </Button>
            </motion.div>

            {isAuthenticated && profile ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground hidden sm:inline">
                  Hey, <span className="font-semibold uppercase">{profile.name ?? profile.email}</span>
                </span>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {/* <Sparkles className="h-4 w-4" /> */}
              Now with AI-powered content suggestions
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Schedule Smarter,
              <br />
              <span className="text-primary">Grow Faster</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The all-in-one social media scheduling platform. Plan, create, and
              publish your content with a powerful VS Code-inspired interface.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Open Dashboard
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>

            {/* Platform Icons */}
            <div className="flex items-center justify-center gap-6">
              <span className="text-sm text-muted-foreground">Supports:</span>
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-twitter/10 flex items-center justify-center text-twitter"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AnimatedTwitterIcon className="h-6 w-6" />
                </motion.div>
                <motion.div
                  className="w-12 h-12 rounded-xl bg-linkedin/10 flex items-center justify-center text-linkedin"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AnimatedLinkedInIcon className="h-6 w-6" />
                </motion.div>
                <motion.div
                  className="w-12 h-12 rounded-xl bg-instagram/10 flex items-center justify-center text-instagram"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AnimatedInstagramIcon className="h-6 w-6" />
                </motion.div>
                <span className="text-sm text-muted-foreground ml-2">
                  & more coming
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
                plingo.byavi.in/dashboard
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

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                <img src="/logo2.png" alt="Plingo Logo" />
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

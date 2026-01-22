import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Zap,
  Heart,
  Code,
  Globe,
  TrendingUp,
  Shield,
  Clock,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";

const values = [
  {
    icon: Zap,
    title: "Speed & Efficiency",
    description:
      "We believe your time is valuable. Our platform automates the tedious parts of social media management.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your content and data are yours. We use enterprise-grade encryption and never share your information.",
  },
  {
    icon: Heart,
    title: "User-Centric Design",
    description:
      "Every feature is built with real user feedback. We prioritize simplicity without sacrificing power.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description:
      "Great tools shouldn't be expensive. We offer transparent pricing that grows with your needs.",
  },
];

const stats = [
  { value: "10K+", label: "Posts Scheduled" },
  { value: "500+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About Us</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Building the Future of{" "}
              <span className="text-primary">Social Media Management</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Plingo is an AI-powered platform that helps creators, marketers,
              and businesses streamline their social media workflow. We combine
              intelligent automation with intuitive design to save you time and
              amplify your reach.
            </p>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-border/50">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariant}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Our Mission
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                Empowering Creators, One Post at a Time
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We started Plingo because we experienced the same frustration
                  you do — juggling multiple platforms, manually scheduling
                  posts, and losing countless hours to repetitive tasks.
                </p>
                <p>
                  Our mission is simple: give creators and businesses the tools
                  to focus on what matters — creating great content — while we
                  handle the rest. With AI-powered automation, intelligent
                  scheduling, and seamless integrations, we're building the most
                  efficient social media command center.
                </p>
                <p>
                  Whether you're a solo creator or managing a team, Plingo
                  adapts to your workflow, not the other way around.
                </p>
              </div>

              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Visual Element */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Innovation</div>
                      <div className="text-sm text-muted-foreground">
                        AI-powered automation
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Efficiency</div>
                      <div className="text-sm text-muted-foreground">
                        Save hours every week
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Growth</div>
                      <div className="text-sm text-muted-foreground">
                        Scale your presence
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-3xl rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            badgeIcon={<Heart className="w-4 h-4 text-primary" />}
            badge="Our Values"
            highlightedText="principles"
            title="The "
            description="We're guided by a core set of beliefs that shape everything we build and every decision we make."
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariant}
                  className="group"
                >
                  <div className="h-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-background/50 group-hover:border-primary/30 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <h3 className="text-xl font-semibold mb-3">
                      {value.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Ready to Transform Your
                <br />
                <span className="text-primary">Social Media Workflow?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of creators and businesses using Plingo to save
                time and grow their online presence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>

              <Link to="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 border-primary/30 hover:bg-primary/10"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

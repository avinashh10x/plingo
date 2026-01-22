import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
  Hammer,
  Coffee,
  Bug,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { Footer } from "@/components/landing/Footer";

const values = [
  {
    icon: Zap,
    title: "Built for Speed",
    description:
      "Because who has time to post manually? AI writes it, bulk scheduling handles it. Your job? Just hit approve and go back to building cool stuff.",
  },
  {
    icon: Shield,
    title: "Your Data = Your Business",
    description:
      "We're not selling your stuff to advertisers. Your posts, your platforms, your privacy. That's it.",
  },
  {
    icon: Heart,
    title: "Made by a Solo Dev",
    description:
      "Not a corporate team trying to squeeze every penny. Just a dev who got tired of juggling 5 social media tabs and built a fix.",
  },
  {
    icon: Globe,
    title: "No BS Pricing",
    description:
      "Free to start. No hidden fees. Pay when you need more. Simple as that. (We're still figuring out the perfect model, tbh)",
  },
];

const stats = [
  { icon: Hammer, label: "Still Building", subtext: "(and breaking things)" },
  { icon: Coffee, label: "Coffee Consumed", subtext: "(lost count tbh)" },
  { icon: Bug, label: "Bugs Fixed", subtext: "(you'll find more)" },
  { icon: User, label: "Solo Mission", subtext: "(for now!)" },
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
      <LandingHeader />
      <Helmet>
        <title>About Us - Plingo | AI-Powered Social Media Management</title>
        <meta
          name="description"
          content="Learn about Plingo's mission to empower creators and businesses with intelligent social media automation. Discover our values and commitment to privacy-first design."
        />
        <meta
          name="keywords"
          content="about plingo, social media management, company values, mission, AI automation, creator tools"
        />
        <link rel="canonical" href="https://plingo.byavi.in/about" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="About Plingo - Building the Future of Social Media Management"
        />
        <meta
          property="og:description"
          content="Empowering creators with AI-powered social media automation. Learn about our mission and values."
        />
        <meta property="og:url" content="https://plingo.byavi.in/about" />
        <meta
          property="og:image"
          content="https://plingo.byavi.in/og-image.png"
        />

        {/* Twitter */}
        <meta
          name="twitter:title"
          content="About Plingo - Building the Future of Social Media Management"
        />
        <meta
          name="twitter:description"
          content="Empowering creators with AI-powered social media automation."
        />
        <meta
          name="twitter:image"
          content="https://plingo.byavi.in/og-image.png"
        />
      </Helmet>
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
              <span className="text-sm font-medium text-primary">
                The Real Talk™
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Social Media Shouldn't Be <br />
              <span className="text-primary">Your Full-Time Job</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Look, you're here to build products, create content, or run your
              business — not spend 3 hours a day scheduling tweets. That's why
              Plingo exists. AI writes it, bulk scheduling posts it, you focus
              on what actually matters.
            </p>

            <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto">
              Built by a solo dev who was tired of context-switching between 5
              tabs just to post the same thing on Twitter and LinkedIn. If
              you've ever groaned at "schedule your content consistently," this
              is for you.
            </p>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>
      {/* Stats Section - Fun & Honest */}
      <section className="py-12 px-6 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center mb-8">
          <h3 className="text-xl md:text-2xl font-semibold mb-2">
            The "We're Just Getting Started" Stats
          </h3>
          <p className="text-sm text-muted-foreground">
            (aka we're collecting data while you read this)
          </p>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariant}
                className="text-center flex flex-col items-center"
              >
                <div className="mb-4 p-4 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.subtext}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>{" "}
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
                  Why This Exists
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                You've Got Better Things to Do
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Here's the thing: I built Plingo because I was spending more
                  time <strong>scheduling tweets</strong> than actually writing
                  code. Sound familiar?
                </p>
                <p>
                  You're launching a product, writing content, or growing your
                  brand. The last thing you need is another tab open, manually
                  copy-pasting between Twitter and LinkedIn, setting reminders,
                  and losing your flow state every 2 hours.
                </p>
                <p className="font-medium text-foreground">
                  So here's the deal: Plingo handles the boring stuff.
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>
                      <strong>AI writes it</strong> — Generate posts in seconds,
                      not hours
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>
                      <strong>Bulk scheduling</strong> — Queue a week's worth of
                      content in 10 minutes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>
                      <strong>Multi-platform</strong> — One post, multiple
                      platforms. Done.
                    </span>
                  </li>
                </ul>
              </div>

              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="rounded-full mt-6 px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  Try It (It's Free)
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
                      <div className="font-semibold">Ship Faster</div>
                      <div className="text-sm text-muted-foreground">
                        Less time on social = more time building
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Save Hours Weekly</div>
                      <div className="text-sm text-muted-foreground">
                        Seriously, track it. You'll be shocked.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Stay Consistent</div>
                      <div className="text-sm text-muted-foreground">
                        Algorithms love consistency. You love not thinking about
                        it.
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
            badge="Core Values"
            highlightedText="we actually believe"
            title="The stuff "
            description="No corporate buzzwords. Just real talk about how we're building this thing."
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
                Ready to Get Your Time Back?
                <br />
                <span className="text-primary">Let's Do This</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Free to start. No credit card. No setup wizard that takes 20
                minutes. Just sign in and start scheduling. Seriously, that's
                it.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all"
                >
                  Start Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>

              <Link to="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground/70">
              P.S. — If you find bugs (you will), just tweet at{" "}
              <a
                href="https://twitter.com/avinash10x"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                avinash
              </a>
              . I promise I'll fix them... eventually!!!
            </p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

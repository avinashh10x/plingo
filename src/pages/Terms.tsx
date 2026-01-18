import { LandingHeader } from "@/components/layout/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Section {
  id: string;
  title: string;
  content: ReactNode;
}

const sections: Section[] = [
  {
    id: "welcome",
    title: "Welcome to Plingo",
    content: (
      <>
        <p>
          Plingo is a side project and platform designed to help creators stay
          active and consistent on social media. These Terms of Service
          ("Terms") govern your use of the Plingo platform.
        </p>
        <p>
          By using Plingo, you agree to these Terms. If you don't agree, please
          don't use the platform.
        </p>
      </>
    ),
  },
  {
    id: "what-plingo-is",
    title: "What Plingo Is",
    content: (
      <>
        <p>
          Plingo is a content scheduling and management tool that helps you:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Plan and schedule posts across multiple social platforms</li>
          <li>Generate content ideas with AI assistance</li>
          <li>Organize your content in drafts and libraries</li>
          <li>Stay consistent with your posting schedule</li>
        </ul>
        <p className="mt-4">
          Plingo is an independent side project, not a company. It's built and
          maintained by an individual developer.
        </p>
      </>
    ),
  },
  {
    id: "account-terms",
    title: "Account Terms",
    content: (
      <>
        <p>To use Plingo, you need to create an account. By doing so:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You must provide accurate information</li>
          <li>You must be at least 18 years old</li>
          <li>You are responsible for keeping your account secure</li>
          <li>You are responsible for all activity under your account</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: (
      <>
        <p>When using Plingo, you agree NOT to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Post illegal, harmful, or abusive content</li>
          <li>Spam or abuse the scheduling features</li>
          <li>Attempt to access other users' accounts or data</li>
          <li>Use the platform to harass or harm others</li>
          <li>Reverse engineer or attempt to exploit the platform</li>
          <li>Violate the terms of connected social platforms</li>
        </ul>
        <p className="mt-4">
          Violation of these rules may result in account suspension or
          termination.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your Content",
    content: (
      <>
        <p>
          <strong>You own your content.</strong> Anything you create, write, or
          schedule through Plingo remains yours.
        </p>
        <p>
          By using Plingo, you grant us a limited license to store and process
          your content solely to provide the service (e.g., scheduling posts,
          saving drafts). We do not claim ownership of your content.
        </p>
        <p className="mt-4">
          You are responsible for ensuring your content doesn't violate any laws
          or third-party rights.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payments & Credits",
    content: (
      <>
        <p>
          Plingo uses a credit-based system for certain features. Credits may be
          purchased or earned through the platform.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Credits are non-refundable once used</li>
          <li>Unused credits may expire as stated in the platform</li>
          <li>Prices are subject to change with notice</li>
        </ul>
        <p className="mt-4">
          As this is a side project, refund requests are handled on a
          case-by-case basis. Contact us if you have concerns.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <>
        <p>Plingo is provided "as is" without warranties. As a side project:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>We cannot guarantee 100% uptime</li>
          <li>Features may change or be discontinued</li>
          <li>Social platform integrations depend on third-party APIs</li>
          <li>
            We're not responsible if a scheduled post fails due to API changes
          </li>
        </ul>
        <p className="mt-4">
          We do our best to keep things running smoothly, but please understand
          the limitations of a solo-developed project.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <>
        <p>
          You can delete your account at any time. Upon deletion, your data will
          be removed from our systems.
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these Terms or abuse the platform.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to Terms",
    content: (
      <>
        <p>
          We may update these Terms from time to time. Significant changes will
          be communicated via email or in-app notification.
        </p>
        <p>
          Continued use of Plingo after changes means you accept the updated
          Terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <>
        <p>Have questions about these Terms? Reach out:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            Email:{" "}
            <a
              href="mailto:thissideavinash@gmail.com"
              className="text-primary hover:underline"
            >
              thissideavinash@gmail.com
            </a>
          </li>
          <li>
            Twitter:{" "}
            <a
              href="https://twitter.com/avinash10x"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @avinash10x
            </a>
          </li>
        </ul>
      </>
    ),
  },
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      },
    );

    sections.forEach(({ id }) => {
      const element = sectionRefs.current[id];
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <LandingHeader />

      <div className="">
        <motion.div
          className="pt-32 pb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-muted-foreground">Last Updated: January 2026</p>
        </motion.div>

        <main className="max-w-7xl mx-auto pb-24 px-6">
          <div className="flex gap-12">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <nav className="sticky top-32 space-y-1">
                {sections.map(({ id, title }, index) => (
                  <motion.button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      activeSection === id
                        ? "text-white bg-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {title}
                  </motion.button>
                ))}
              </nav>
            </aside>

            <div className="flex-1 space-y-16">
              {sections.map(({ id, title, content }) => (
                <motion.section
                  key={id}
                  id={id}
                  ref={(el) => (sectionRefs.current[id] = el)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-foreground">
                    {title}
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    {content}
                  </div>
                </motion.section>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;

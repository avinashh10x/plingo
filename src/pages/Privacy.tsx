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
    id: "introduction",
    title: "Introduction",
    content: (
      <>
        <p>
          Welcome to Plingo. We respect your privacy and are committed to
          protecting your personal data. This privacy policy will inform you
          about how we look after your personal data when you visit our website
          and use our services.
        </p>
        <p>
          By using Plingo, you agree to the collection and use of information
          in accordance with this policy. We will not use or share your
          information with anyone except as described in this Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data We Collect",
    content: (
      <>
        <p>
          We collect information that you provide directly to us, such as when
          you create an account, connect social media platforms, or contact us
          for support. This includes:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Account information (name, email address, password)</li>
          <li>Social media account access tokens</li>
          <li>Content you create and schedule through our platform</li>
          <li>Usage data and analytics</li>
          <li>Communication preferences</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Data",
    content: (
      <>
        <p>
          We use your data to provide, maintain, and improve our services,
          including scheduling and publishing content to your connected social
          media accounts. Specifically, we use your information to:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Provide and maintain our service</li>
          <li>Notify you about changes to our service</li>
          <li>Allow you to participate in interactive features</li>
          <li>Provide customer support</li>
          <li>Gather analysis to improve our service</li>
          <li>Monitor the usage of our service</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized processing or
          accidental loss. Your data is encrypted both in transit and at rest.
        </p>
        <p>
          We regularly review our security practices and update them as
          necessary to maintain the safety of your information. However, no
          method of transmission over the Internet is 100% secure, and we cannot
          guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: (
      <>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Access your personal data</li>
          <li>Correct inaccurate personal data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to processing of your personal data</li>
          <li>Request transfer of your personal data</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <>
        <p>
          If you have any questions about this Privacy Policy, please contact
          us:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>By email: support@plingo.com</li>
          <li>By visiting the contact page on our website</li>
        </ul>
      </>
    ),
  },
];

const Privacy = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
      }
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
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-muted-foreground">Last Updated: January 2026</p>
        </motion.div>

        <main className="max-w-7xl mx-auto pb-24">
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
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${activeSection === id
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

export default Privacy;

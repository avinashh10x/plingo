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
          Welcome to Plingo — a side project and platform designed to help
          creators stay active and consistent on social media platforms. We
          respect your privacy and are committed to being transparent about how
          we handle your data.
        </p>
        <p>
          By using Plingo, you agree to the collection and use of information as
          described in this policy. We do not sell your data or share it with
          third parties for marketing purposes.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data We Collect",
    content: (
      <>
        <p>We collect the following information when you use Plingo:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong>Account information:</strong> Your name and email address
            (via OAuth login through providers like Google)
          </li>
          <li>
            <strong>Social media tokens:</strong> OAuth access tokens to connect
            your Twitter, LinkedIn, and other accounts — we never store your
            passwords
          </li>
          <li>
            <strong>Content you create:</strong> Posts, drafts, and scheduled
            content you write within Plingo
          </li>
          <li>
            <strong>Usage data:</strong> Basic analytics like feature usage to
            improve the platform
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Data",
    content: (
      <>
        <p>We use your data solely to provide and improve Plingo's services:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>To schedule and publish posts to your connected accounts</li>
          <li>To save your drafts and content library</li>
          <li>To provide AI-powered content suggestions</li>
          <li>To send you important updates about the service</li>
          <li>To improve platform performance and fix bugs</li>
        </ul>
        <p className="mt-4">
          <strong>We do NOT:</strong> Sell your data, auto-post without your
          consent, or share your information with advertisers.
        </p>
      </>
    ),
  },
  {
    id: "data-storage",
    title: "Data Storage & Security",
    content: (
      <>
        <p>
          Your data is stored securely using industry-standard encryption. We
          use secure database hosting and authentication, which provides
          enterprise-grade security.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>All data is Encrypted in transit (HTTPS)</li>
          <li>OAuth tokens are stored securely and never exposed</li>
          <li>We use Hashing to protect your data</li>
          <li>Regular security reviews are conducted</li>
        </ul>
      </>
    ),
  },
  // {
  //   id: "third-party",
  //   title: "Third-Party Services",
  //   content: (
  //     <>
  //       <p>Plingo integrates with the following services:</p>
  //       <ul className="list-disc list-inside space-y-2 ml-4">
  //         <li>
  //           <strong>Supabase:</strong> Database and authentication
  //         </li>
  //         <li>
  //           <strong>Twitter/X API:</strong> To post and manage tweets
  //         </li>
  //         <li>
  //           <strong>LinkedIn API:</strong> To post to your LinkedIn profile
  //         </li>
  //         <li>
  //           <strong>OpenAI/Gemini:</strong> For AI content generation features
  //         </li>
  //       </ul>
  //       <p className="mt-4">
  //         Each service has its own privacy policy. We only share the minimum
  //         data required for each integration to function.
  //       </p>
  //     </>
  //   ),
  // },
  {
    id: "your-rights",
    title: "Your Rights",
    content: (
      <>
        <p>You have full control over your data:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Access and export your data at any time</li>
          <li>Delete your account and all associated data</li>
          <li>Disconnect social media accounts whenever you want</li>
          <li>Opt out of non-essential communications</li>
        </ul>
        <p className="mt-4">
          To exercise any of these rights, contact us using the information
          below.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <>
        <p>
          If you have any questions about this Privacy Policy or how we handle
          your data, please reach out:
        </p>
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
            Privacy <span className="text-primary">Policy</span>
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

export default Privacy;

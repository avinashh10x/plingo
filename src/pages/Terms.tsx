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
          This Plingo Services Agreement ("Agreement") is a legal agreement
          between Plingo Inc. ("Plingo", "we", or "us") and you or the entity
          you represent ("you", "your", or "user") who registers on the Plingo
          platform to utilize our hiring services, assessment services, and
          other business solutions.
        </p>
        <p>
          Access or use of any Services is contingent upon your acceptance and
          adherence to all stipulated terms and conditions in this Agreement. By
          accessing or using the Services, you agree to be bound by these Terms.
        </p>
      </>
    ),
  },
  {
    id: "account-terms",
    title: "Account Terms",
    content: (
      <>
        <p>
          In order to access and make use of the Services, you must complete the
          registration process for a Plingo account ("Account"). Successful
          completion of your Account registration necessitates the provision of
          your full legal name, a valid email address, and any other information
          marked as mandatory.
        </p>
        <p>You must be:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            At least 18 years of age or meet the age of majority in your
            jurisdiction
          </li>
          <li>Able to form a legally binding contract</li>
          <li>Not barred from receiving services under applicable law</li>
        </ul>
        <p>
          You acknowledge that the email address you provide upon Account
          creation, or any subsequent updates, will serve as the primary mode of
          communication between you and Plingo.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            Reproduce, duplicate, copy, sell, resell, or exploit any part of the
            Service without express written permission
          </li>
          <li>
            Access the Services without explicit written permission from Plingo
            for the purpose of building a competitive product
          </li>
          <li>
            Use the Services to store or transmit infringing, libelous, or
            otherwise unlawful or tortious material
          </li>
          <li>
            Use the Services to store or transmit material in violation of
            third-party privacy rights
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the
            Services
          </li>
          <li>
            Attempt to gain unauthorized access to the Services or related
            systems or networks
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <>
        <p>
          The Service and all materials therein or transferred thereby,
          including, without limitation, software, images, text, graphics,
          illustrations, logos, patents, trademarks, service marks, copyrights,
          photographs, audio, videos, and music, and all Intellectual Property
          Rights related thereto, are the exclusive property of Plingo.
        </p>
        <p>
          You retain ownership of any content you create, schedule, or publish
          through our platform. By using our Services, you grant Plingo a
          limited license to use, store, and process your content solely for the
          purpose of providing the Services to you.
        </p>
      </>
    ),
  },
  {
    id: "payment-terms",
    title: "Payment Terms",
    content: (
      <>
        <p>
          If you select a paid plan, you agree to pay Plingo the applicable fees
          for the selected plan. Payment obligations are non-cancelable and fees
          paid are non-refundable, except as expressly set forth herein.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Fees are billed in advance on a monthly or annual basis</li>
          <li>All fees are exclusive of applicable taxes</li>
          <li>
            You authorize us to charge your payment method on file for any
            unpaid fees
          </li>
          <li>
            Failure to pay may result in suspension or termination of your
            account
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <>
        <p>
          You may terminate your account at any time by contacting customer
          support or through your account settings. Upon termination, your right
          to use the Services will immediately cease.
        </p>
        <p>
          We may terminate or suspend your account immediately, without prior
          notice or liability, for any reason, including without limitation if
          you breach these Terms. Upon termination, your right to use the
          Service will immediately cease.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <>
        <p>
          THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
          WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
          LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          Plingo does not warrant that the Services will be uninterrupted,
          timely, secure, or error-free. Plingo does not warrant that the
          results obtained from use of the Services will be accurate or
          reliable.
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
          If you have any questions about these Terms of Service, please contact
          us:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>By email: legal@plingo.com</li>
          <li>By visiting the contact page on our website</li>
        </ul>
      </>
    ),
  },
];

const Terms = () => {
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
            Terms of <span className="text-primary">Service</span>
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

export default Terms;

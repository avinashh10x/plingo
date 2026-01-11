import { LandingHeader } from "@/components/layout/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { useEffect } from "react";

const Privacy = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <LandingHeader />
      <main className="max-w-4xl mx-auto py-24 px-6 prose prose-invert">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4">Last Updated: January 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p>
            Welcome to Plingo. We respect your privacy and are committed to
            protecting your personal data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when
            you create an account, connect social media platforms, or contact us
            for support.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
          <p>
            We use your data to provide, maintain, and improve our services,
            including scheduling and publishing content to your connected social
            media accounts.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized processing or
            accidental loss.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at support@plingo.com.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

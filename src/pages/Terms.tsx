import { LandingHeader } from "@/components/layout/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <LandingHeader />
      <main className="max-w-4xl mx-auto py-24 px-6 prose prose-invert">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-4">Last Updated: January 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Plingo, you agree to be bound by these Terms
            of Service and all applicable laws and regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily use Plingo for personal or
            commercial social media management purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
          <p>
            The materials on Plingo are provided on an 'as is' basis. Plingo
            makes no warranties, expressed or implied.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
          <p>
            In no event shall Plingo be liable for any damages arising out of
            the use or inability to use the services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in
            accordance with the laws of the jurisdiction in which Plingo
            operates.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

import { useEffect } from "react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { Hero } from "@/components/layout/Hero";
import { WhoThisIsFor } from "@/components/landing/WhoThisIsFor";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { AfterSignup } from "@/components/landing/AfterSignup";
import { CoreCapabilities } from "@/components/landing/CoreCapabilities";
import { SafetyTrust } from "@/components/landing/SafetyTrust";
import { PricingExpectation } from "@/components/landing/PricingExpectation";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  // Force dark mode on mount for landing page aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      <LandingHeader />

      {/* Main Content */}
      <main>
        <Hero />
        <WhoThisIsFor />
        <ProblemSolution />
        <AfterSignup />
        <CoreCapabilities />
        <SafetyTrust />
        <PricingExpectation />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

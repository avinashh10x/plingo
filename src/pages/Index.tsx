import { Helmet } from "react-helmet-async";
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
import How1 from "@/components/landing/How1";
import ScrollJourney from "@/components/landing/ScrollJourney";
import InteractiveAi from "@/components/landing/InteractiveAi";

const SITE_URL = "https://plingo.byavi.in";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Plingo",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    description:
      "AI-powered social media scheduling and content management tool for creators",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Avinash",
      url: "https://twitter.com/avinash10x",
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Plingo - AI-Powered Social Media Scheduling for Creators</title>
        <meta
          name="description"
          content="Schedule and manage your social media content with AI assistance. Plan posts, generate ideas, and stay consistent across Twitter, LinkedIn, and more."
        />
        <meta
          name="keywords"
          content="social media scheduler, content scheduling, AI content, Twitter scheduler, LinkedIn scheduler, content management"
        />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta
          property="og:title"
          content="Plingo - AI-Powered Social Media Scheduling"
        />
        <meta
          property="og:description"
          content="Schedule and manage your social media content with AI assistance. Stay consistent across all platforms."
        />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:site_name" content="Plingo" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta
          name="twitter:title"
          content="Plingo - AI-Powered Social Media Scheduling"
        />
        <meta
          name="twitter:description"
          content="Schedule and manage your social media content with AI assistance. Stay consistent across all platforms."
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:creator" content="@avinash10x" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <LandingHeader />

      {/* Main Content */}
      <main className="md:space-y-20 space-y-2 ">
        <Hero />
        <How1 />
        <ScrollJourney />
        {/* <WhoThisIsFor />  */}
        {/* <InteractiveAi/> */}
        {/* <ProblemSolution /> */}
        {/* <AfterSignup /> */}
        {/* <CoreCapabilities /> */}
        <SafetyTrust />
        <PricingExpectation />
        <FAQ />
        {/* <FinalCTA /> */}
      </main>

      <Footer />
    </div>
  );
};

export default Index;

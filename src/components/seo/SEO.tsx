import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonicalUrl?: string;
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: "Plingo - AI-Powered Social Media Scheduling",
  description:
    "Schedule and manage your social media posts across Twitter, LinkedIn, and more. AI-powered content generation, bulk scheduling, and analytics.",
  keywords:
    "social media scheduler, twitter scheduler, linkedin scheduler, content calendar, social media management, AI content generation, bulk scheduling",
  ogImage: "https://plingo.byavi.in/og-image.png",
  canonicalUrl: "https://plingo.byavi.in",
};

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalUrl,
  noindex = false,
}: SEOProps) {
  const seoTitle = title || DEFAULT_SEO.title;
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = keywords || DEFAULT_SEO.keywords;
  const seoOgImage = ogImage || DEFAULT_SEO.ogImage;
  const seoCanonicalUrl = canonicalUrl || DEFAULT_SEO.canonicalUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={seoCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={seoCanonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seoCanonicalUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoOgImage} />
    </Helmet>
  );
}

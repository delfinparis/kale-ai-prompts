import type { Metadata } from "next";
import Script from "next/script";
import { inter } from "./fonts";
import "./globals.css";

const GTM_ID = "GTM-P6MPH7";

const SITE_URL = "https://tapthis.co";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#org`,
      name: "Copy That.",
      legalName: "DJP3 Consulting Inc.",
      url: SITE_URL,
      logo: `${SITE_URL}/api/og`,
      sameAs: ["https://joinkale.com"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#site`,
      url: SITE_URL,
      name: "Copy That.",
      description:
        "570 copy-paste AI prompts for real estate agents. Drop into ChatGPT, Claude, or Gemini for listings, emails, follow-ups, cold outreach, and scripts.",
      publisher: { "@id": `${SITE_URL}#org` },
      inLanguage: "en-US",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}#app`,
      name: "Copy That.",
      alternateName: "Copy That. AI Cheat Sheet",
      url: SITE_URL,
      description:
        "A library of 570 ready-to-use AI prompts built for real estate agents. Customize the brackets, copy, and paste into ChatGPT, Claude, or Gemini.",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Real Estate AI Tools",
      operatingSystem: "Any (web)",
      browserRequirements: "Requires JavaScript. Works in any modern browser.",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      audience: {
        "@type": "Audience",
        audienceType: "Real estate agents",
      },
      featureList: [
        "Listing descriptions that do not sound like a robot wrote them",
        "Cold outreach texts and emails for dead leads",
        "Post-showing follow-up emails",
        "Objection-handling roleplays for listing appointments",
        "Social media captions tailored to your market",
        "CRM triage prompts to find overlooked opportunities",
        "Prompt stacks that chain multiple prompts into workflows",
      ],
      creator: { "@id": `${SITE_URL}#org` },
      publisher: { "@id": `${SITE_URL}#org` },
    },
  ],
};

export const metadata: Metadata = {
  title: "Copy That. | 570 AI Prompts for Real Estate Agents",
  description:
    "570 copy-paste AI prompts for real estate agents. Drop into ChatGPT, Claude, or Gemini for listings, emails, follow-ups, cold outreach, and scripts.",
  metadataBase: new URL("https://tapthis.co"),
  keywords: [
    "AI prompts for real estate agents",
    "real estate AI prompts",
    "ChatGPT prompts for realtors",
    "Claude prompts for real estate",
    "Gemini prompts for realtors",
    "real estate listing description generator",
    "cold outreach for realtors",
    "real estate email templates",
    "real estate follow-up scripts",
    "AI cheat sheet real estate",
    "realtor AI tools",
  ],
  openGraph: {
    title: "Copy That. | The AI Cheat Sheet for Real Estate Agents",
    description:
      "570 copy-paste AI prompts for real estate agents. Drop into ChatGPT, Claude, or Gemini for listings, emails, follow-ups, cold outreach, and scripts.",
    url: "https://tapthis.co",
    siteName: "Copy That.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Copy That. 570 copy-paste AI prompts for real estate agents.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Copy That. | 570 AI Prompts for Real Estate Agents",
    description:
      "570 copy-paste AI prompts for real estate agents. For ChatGPT, Claude, and Gemini.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body className={inter.className}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}

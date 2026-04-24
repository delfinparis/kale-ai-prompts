import type { Metadata } from "next";
import Script from "next/script";
import { inter } from "./fonts";
import "./globals.css";

const GTM_ID = "GTM-P6MPH7";

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

import type { Metadata } from "next";
import Script from "next/script";
import { inter } from "./fonts";
import "./globals.css";

const GTM_ID = "GTM-P6MPH7";

export const metadata: Metadata = {
  title: "Copy That. — 570 AI Prompts for Real Estate Agents",
  description:
    "Copy. Paste. Close more deals. 570 ready-to-go ChatGPT, Claude, and Gemini prompts built for real estate agents. Listings, follow-ups, lead gen, scripts, coaching roleplays. Used by 2,000+ agents.",
  metadataBase: new URL("https://tapthis.co"),
  keywords: [
    "AI prompts for realtors",
    "real estate AI prompts",
    "ChatGPT prompts real estate",
    "AI for real estate agents",
    "real estate scripts",
    "realtor AI tools",
    "listing description generator",
    "real estate email templates",
  ],
  openGraph: {
    title: "Copy That. — The AI Cheat Sheet for Real Estate Agents",
    description:
      "Copy. Paste. Close more deals. 570 ready-to-go AI prompts for emails, listings, follow-ups, and scripts. Built by agents for agents.",
    url: "https://tapthis.co",
    siteName: "Copy That.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Copy That. — 570 copy-paste AI prompts for real estate agents",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Copy That. — 570 AI Prompts for Real Estate Agents",
    description:
      "Copy. Paste. Close more deals. 570 ready-to-go AI prompts for working real estate agents.",
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

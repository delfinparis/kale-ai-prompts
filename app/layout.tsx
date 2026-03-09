import type { Metadata } from "next";
import Script from "next/script";
import { inter } from "./fonts";
import "./globals.css";

const GTM_ID = "GTM-P6MPH7";

export const metadata: Metadata = {
  title: "AI Prompt Vault for Realtors - Copy-Paste AI Scripts",
  description:
    "570 copy-paste-ready AI prompts built for working real estate agents. Follow-up emails, listing descriptions, social posts, roleplay coaching and more.",
  metadataBase: new URL("https://tapthis.co"),
  openGraph: {
    title: "AI Prompt Vault for Realtors",
    description:
      "570 copy-paste prompts that write your emails, listings, follow-ups, and scripts — so you don't have to.",
    url: "https://tapthis.co",
    siteName: "AI Prompt Vault",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "AI Prompt Vault — 570 AI prompts for real estate agents",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Vault for Realtors",
    description:
      "570 copy-paste prompts that write your emails, listings, follow-ups, and scripts.",
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
